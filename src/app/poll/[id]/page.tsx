import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PollChart from "@/components/PollChart";
import { Button } from "@/components/ui/button";

export default async function PollDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createClient();
  const { id: pollId } = params;

  // アンケート情報を取得
  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .select("id, title, user_id")
    .eq("id", pollId)
    .single();

  if (pollError || !poll) {
    notFound();
  }

  // 選択肢を取得
  const { data: options, error: optionsError } = await supabase
    .from("options")
    .select("id, text")
    .eq("poll_id", pollId);

  if (optionsError || !options) {
    notFound();
  }

  // ユーザーの投票状況を確認
  const { data: { user } } = await supabase.auth.getUser();

  let hasVoted = false;
  if (user) {
    const { data: vote, error: voteError } = await supabase
      .from("votes")
      .select("id")
      .eq("poll_id", pollId)
      .eq("user_id", user.id)
      .single();
    if (vote && !voteError) {
      hasVoted = true;
    }
  }

  const handleVote = async (optionId: string) => {
    "use server";
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // ログインしていない場合はリダイレクト
      return redirect("/");
    }

    const { error } = await supabase.from("votes").insert({
      poll_id: pollId,
      option_id: optionId,
      user_id: user.id,
    });

    if (error) {
      console.error("投票エラー:", error);
      // エラーハンドリング
    } else {
      // 投票成功
      // ページをリフレッシュして投票済み状態を反映
      // router.refresh() はクライアントコンポーネントでしか使えないため、ここではリダイレクトなどで対応
      redirect(`/poll/${pollId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
        {poll.title}
      </h1>

      {hasVoted ? (
        <div className="w-full max-w-2xl">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">
            投票結果
          </h2>
          <PollChart pollId={pollId} />
          <div className="mt-8 text-center">
            <Link href="/dashboard">
              <Button>アンケート一覧へ戻る</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">
            投票してください
          </h2>
          {options.map((option) => (
            <form key={option.id} action={handleVote.bind(null, option.id)}>
              <Button type="submit" className="w-full h-16 text-lg rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                {option.text}
              </Button>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}
