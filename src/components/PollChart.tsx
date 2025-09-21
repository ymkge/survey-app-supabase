"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { createClient } from '@/lib/supabase/client';

interface ChartData {
  name: string;
  votes: number;
}

interface PollChartProps {
  pollId: string;
}

const PollChart: React.FC<PollChartProps> = ({ pollId }) => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchPollResults = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('options')
      .select(`
        id,
        text,
        votes(id)
      `)
      .eq('poll_id', pollId);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const results: ChartData[] = data.map((option: { id: string; text: string; votes: { id: string }[] }) => ({
      name: option.text,
      votes: option.votes.length,
    }));
    setChartData(results);
    setLoading(false);
  }, [pollId, supabase]);

  useEffect(() => {
    fetchPollResults();

    // リアルタイム購読
    const channel = supabase
      .channel(`poll_votes:${pollId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes', filter: `poll_id=eq.${pollId}` },
        (payload) => {
          console.log('Change received!', payload);
          fetchPollResults(); // 変更があったら結果を再取得
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pollId, supabase, fetchPollResults]);

  if (loading) {
    return <div className="text-center text-gray-600 dark:text-gray-400">結果を読み込み中...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 dark:text-red-400">エラー: {error}</div>;
  }

  if (chartData.length === 0) {
    return <div className="text-center text-gray-600 dark:text-gray-400">まだ投票がありません。</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
        <XAxis dataKey="name" className="text-sm text-gray-700 dark:text-gray-300" />
        <YAxis allowDecimals={false} className="text-sm text-gray-700 dark:text-gray-300" />
        <Tooltip
          contentStyle={{ backgroundColor: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '8px' }}
          labelStyle={{ color: '#333' }}
          itemStyle={{ color: '#333' }}
        />
        <Bar dataKey="votes" fill="#8884d8" animationEasing="ease-out" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PollChart;
