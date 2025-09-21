import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm"; // 後で作成

export default async function Index() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return redirect("/dashboard");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          リアルタイムアンケート
        </h1>
        <AuthForm />
      </div>
    </div>
  );
}