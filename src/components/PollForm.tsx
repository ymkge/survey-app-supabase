"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

interface Option {
  id: number;
  text: string;
}

const PollForm = () => {
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState<Option[]>([{ id: 1, text: '' }, { id: 2, text: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleOptionChange = (id: number, value: string) => {
    setOptions(options.map(option => option.id === id ? { ...option, text: value } : option));
  };

  const addOption = () => {
    const newId = options.length > 0 ? Math.max(...options.map(o => o.id)) + 1 : 1;
    setOptions([...options, { id: newId, text: '' }]);
  };

  const removeOption = (id: number) => {
    setOptions(options.filter(option => option.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const validOptions = options.filter(option => option.text.trim() !== '');
    if (!title.trim() || validOptions.length < 2) {
      setError('アンケートのタイトルと2つ以上の選択肢を入力してください。');
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('ログインしてください。');
      setLoading(false);
      return;
    }

    try {
      const { data: poll, error: pollError } = await supabase
        .from('polls')
        .insert({ title, user_id: user.id })
        .select()
        .single();

      if (pollError || !poll) {
        throw new Error(pollError?.message || 'アンケートの作成に失敗しました。');
      }

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

      router.push(`/poll/${poll.id}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('不明なエラーが発生しました。');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>新しいアンケートを作成</CardTitle>
          <CardDescription>質問と選択肢を入力して、新しいアンケートを作成します。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>エラー</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">アンケートの質問</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 次の旅行はどこに行きたい？"
              required
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label>選択肢</Label>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>選択肢の内容</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {options.map((option, index) => (
                      <motion.tr
                        key={option.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-muted/50"
                      >
                        <TableCell>
                          <Input
                            type="text"
                            value={option.text}
                            onChange={(e) => handleOptionChange(option.id, e.target.value)}
                            placeholder={`選択肢 ${index + 1}`}
                            required
                            className="border-none focus-visible:ring-0"
                          />
                        </TableCell>
                        <TableCell>
                          {options.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeOption(option.id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
            <Button type="button" variant="outline" onClick={addOption} className="w-full mt-2">
              <PlusCircle className="mr-2 h-4 w-4" />
              選択肢を追加
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                作成中...
              </>
            ) : (
              'アンケートを作成'
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default PollForm;
