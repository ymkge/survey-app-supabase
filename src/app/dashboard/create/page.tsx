import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PollForm from "@/components/PollForm";

export default async function CreatePollPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          新しいアンケートを作成
        </h1>
        <PollForm />
      </div>
    </div>
  );
}
