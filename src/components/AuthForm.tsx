"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // 後で作成
import { Label } from "@/components/ui/label";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("認証に成功しました！リダイレクト中...");
      router.refresh(); // 認証状態を更新
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleAuth} className="space-y-4">
      {message && <p className="text-sm text-red-500 dark:text-red-400">{message}</p>}
      <div>
        <Label htmlFor="email">メールアドレス</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@example.com"
          required
        />
      </div>
      <div>
        <Label htmlFor="password">パスワード</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "処理中..." : isSignUp ? "サインアップ" : "ログイン"}
      </Button>
      <Button
        type="button"
        variant="link"
        className="w-full"
        onClick={() => setIsSignUp(!isSignUp)}
        disabled={loading}
      >
        {isSignUp ? "アカウントをお持ちですか？ログイン" : "アカウントをお持ちでないですか？サインアップ"}
      </Button>
    </form>
  );
}
