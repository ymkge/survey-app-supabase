import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import PollList from "@/components/PollList";
import { PlusCircle } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/");
  }

  const userName = user.email ? user.email.split('@')[0] : "ゲスト";

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-blue-500 text-red-500">
            ようこそ、{userName}さん！
          </h1>
          <p className="text-muted-foreground mt-1">
            アンケートを作成・管理しましょう。
          </p>
        </div>
        <Link href="/dashboard/create" className="mt-4 sm:mt-0">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            新しいアンケートを作成
          </Button>
        </Link>
      </header>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight mb-6">
          あなたのアンケート
        </h2>
        <PollList />
      </section>
    </div>
  );
}
