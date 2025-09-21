"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface Poll {
  id: string;
  title: string;
  created_at: string;
  vote_count: number; // 投票数
}

const PollList = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchPolls = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('polls')
      .select(`
          id,
          title,
          created_at,
          votes(id)
        `)
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const formattedPolls: Poll[] = data.map((poll: { id: string; title: string; created_at: string; votes: { id: string }[] }) => ({
      id: poll.id,
      title: poll.title,
      created_at: new Date(poll.created_at).toLocaleDateString(),
      vote_count: poll.votes.length,
    }));
    setPolls(formattedPolls);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  if (loading) {
    return <div className="text-center text-gray-600 dark:text-gray-400">読み込み中...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 dark:text-red-400">エラー: {error}</div>;
  }

  if (polls.length === 0) {
    return <div className="text-center text-gray-600 dark:text-gray-400">まだアンケートがありません。</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {polls.map((poll) => (
        <Link key={poll.id} href={`/poll/${poll.id}`}>
          <Card className="hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer">
            <CardHeader>
              <CardTitle>{poll.title}</CardTitle>
              <CardDescription>作成日: {poll.created_at}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">投票数: {poll.vote_count}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default PollList;
