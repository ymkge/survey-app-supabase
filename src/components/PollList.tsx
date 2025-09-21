"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Calendar, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

interface Poll {
  id: string;
  title: string;
  created_at: string;
  vote_count: number;
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
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>エラーが発生しました</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (polls.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-12">
        <BarChart className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">まだアンケートがありません</h3>
        <p className="mt-1 text-sm text-gray-500">新しいアンケートを作成して、投票を始めましょう。</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {polls.map((poll) => (
        <Link key={poll.id} href={`/poll/${poll.id}`} className="group">
          <Card className="transition-all duration-200 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1">
            <CardHeader>
              <CardTitle className="tracking-tight">{poll.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-center text-sm text-muted-foreground">
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                <span>{poll.vote_count} 票</span>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                <span>{poll.created_at}</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default PollList;
