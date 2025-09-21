# survey-app-supabase

リアルタイムで投票結果が更新されるアンケートアプリケーションです。

## 概要

このアプリケーションでは、ユーザーがアンケートを作成し、他のユーザーが投票できます。投票結果はリアルタイムでグラフに反映されます。

## 主な機能

- **ユーザー認証:** Supabase Authを利用したメールアドレスとパスワードによる認証機能。
- **アンケート作成:** 認証済みユーザーは新しいアンケートを作成できます。
- **アンケート一覧:** 作成されたアンケートの一覧を表示します。
- **投票機能:** 各アンケートに対して、ユーザーは1つの選択肢に投票できます。
- **リアルタイム結果表示:** 投票結果をリアルタイムで円グラフに表示します。

## 技術スタック

- **フレームワーク:** [Next.js](https://nextjs.org/) (App Router)
- **言語:** [TypeScript](https://www.typescriptlang.org/)
- **データベース & 認証:** [Supabase](https://supabase.io/)
- **UI:** [Tailwind CSS](https://tailwindcss.com/), [Shadcn/ui](https://ui.shadcn.com/)
- **グラフ:** [Recharts](https://recharts.org/)
- **フォーム管理:** [React Hook Form](https://react-hook-form.com/)
- **リンター:** [ESLint](https://eslint.org/)

## 環境構築

### 1. リポジトリのクローン

```bash
git clone https://github.com/<your-username>/survey-app-supabase.git
cd survey-app-supabase
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

Supabaseプロジェクトを作成し、以下の情報を記載した`.env.local`ファイルをプロジェクトルートに作成します。

```
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) にアクセスしてアプリケーションを表示します。

## ディレクトリ構成の概要

```
.
├── src
│   ├── app/              # Next.jsのApp Routerページ
│   │   ├── dashboard/    # ダッシュボードページ
│   │   ├── poll/[id]/    # 投票・結果表示ページ
│   │   └── ...
│   ├── components/       # 再利用可能なUIコンポーネント
│   │   └── ui/           # Shadcn/uiのコンポーネント
│   └── lib/              # ライブラリ、ユーティリティ
│       └── supabase/     # Supabaseクライアント設定
└── ...
```