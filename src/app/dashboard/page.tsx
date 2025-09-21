import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import PollList from "@/components/PollList"; // 後で実装

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/");
  }

  // ユーザー名を取得 (例: emailの@より前の部分)
  const userName = user.email ? user.email.split('@')[0] : "ゲスト";

  // TODO: アンケート一覧の取得ロジックを実装

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          ようこそ、{userName}さん！
        </h1>
        <Link href="/dashboard/create">
          <Button>新しいアンケートを作成</Button>
        </Link>
      </header>

      <section>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          あなたのアンケート
        </h2>
        {/* PollList コンポーネントでアンケート一覧を表示 */}
        <PollList />
      </section>
    </div>
  );
}
