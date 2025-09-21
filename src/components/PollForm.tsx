"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Option {
  id: number;
  text: string;
}

const PollForm = () => {
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState<Option[]>([{ id: 1, text: '' }, { id: 2, text: '' }]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleOptionChange = (id: number, value: string) => {
    setOptions(options.map(option => option.id === id ? { ...option, text: value } : option));
  };

  const addOption = () => {
    setOptions([...options, { id: options.length + 1, text: '' }]);
  };

  const removeOption = (id: number) => {
    setOptions(options.filter(option => option.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const validOptions = options.filter(option => option.text.trim() !== '');
    if (!title.trim() || validOptions.length < 2) {
      setMessage('アンケートのタイトルと2つ以上の選択肢を入力してください。');
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage('ログインしてください。');
      setLoading(false);
      return;
    }

    try {
      // polls テーブルに挿入
      const { data: poll, error: pollError } = await supabase
        .from('polls')
        .insert({ title, user_id: user.id })
        .select()
        .single();

      if (pollError || !poll) {
        throw new Error(pollError?.message || 'アンケートの作成に失敗しました。');
      }

      // options テーブルに挿入
      const optionsToInsert = validOptions.map(option => ({
        poll_id: poll.id,
        text: option.text,
      }));
      const { error: optionsError } = await supabase
        .from('options')
        .insert(optionsToInsert);

      if (optionsError) {
        throw new Error(optionsError.message || '選択肢の作成に失敗しました。');
      }

      setMessage('アンケートが正常に作成されました！');
      router.push(`/poll/${poll.id}`); // 作成したアンケートの詳細ページへリダイレクト
    } catch (error: unknown) { // 型を unknown に変更
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage('不明なエラーが発生しました。');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">新しいアンケートを作成</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {message && <p className="text-sm text-red-500 dark:text-red-400">{message}</p>}
          <div>
            <Label htmlFor="title">アンケートの質問</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: どちらの製品が好きですか？"
              required
            />
          </div>

          <div className="space-y-4">
            <Label>選択肢</Label>
            {options.map((option, index) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Input
                  type="text"
                  value={option.text}
                  onChange={(e) => handleOptionChange(option.id, e.target.value)}
                  placeholder={`選択肢 ${index + 1}`}
                  required
                />
                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeOption(option.id)}
                  >
                    削除
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addOption} className="w-full">
              選択肢を追加
            </Button>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '作成中...' : 'アンケートを作成'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PollForm;