# Career Survey Chat (Next.js + Supabase + Gemini)

匿名セッションIDに紐づくアンケート回答を活用して、Gemini 1.5-flash と対話できる最小構成の Next.js 14 アプリです。アンケート要約をチャットの初期コンテキストとして利用し、送受信メッセージを Supabase(Postgres) に保存します。

## セットアップ

1. Supabase プロジェクトを作成し、`NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を控える。
2. ルートに `.env.local` を作成し、以下の環境変数を設定する。

   ```env
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   GEMINI_MODEL=gemini-1.5-flash-latest
   GEMINI_API_VERSION=v1
   GEMINI_API_KEY=
   ```

3. Supabase の SQL エディタで下記スキーマを実行し、テーブルを準備する。
4. 依存関係をインストールして開発サーバーを起動する。

   ```bash
   npm install
   npm run dev
   ```

5. ブラウザで `http://localhost:3000/survey` を開き、アンケート回答後にチャットへ遷移する。

## データベーススキーマ

```sql
create extension if not exists "pgcrypto";

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  consent boolean not null default false,
  grade smallint,
  survey_summary text,
  created_at timestamptz default now()
);

create table if not exists public.surveys (
  id bigserial primary key,
  session_id uuid references public.sessions(id) on delete cascade,
  strengths text,
  interests text,
  favorite_subjects text,
  concerns text,
  free_text text,
  created_at timestamptz default now()
);

create table if not exists public.message_logs (
  id bigserial primary key,
  session_id uuid references public.sessions(id) on delete cascade,
  role text check (role in ('user','assistant')),
  content text,
  created_at timestamptz default now()
);
```

> **メモ**: 最小構成のため RLS は無効です。運用時は RLS/JWT などで強化してください。

## 利用方法

- `/survey` でアンケートに回答すると、匿名セッションIDに紐づけて Supabase へ保存され、要約が生成されます。送信後に `/chat` へ自動で遷移します。
- `/chat` では送信したメッセージを `/api/chat` が受け取り、Gemini からの応答とともに Supabase に `session_id` で保存します。

Gemini のモデル名は `GEMINI_MODEL`、API バージョンは `GEMINI_API_VERSION`（既定は `v1`）で上書きできます。無料枠の API キーで `gemini-1.5-flash-latest` が利用できない場合は、`gemini-1.5-flash` など `ListModels` で確認した名称に変更し、必要に応じて `GEMINI_API_VERSION` を `v1beta` などに調整してください。

## 注意事項と今後の拡張

- 個人情報を入力しないでください。学習用途のサンプルです。
- Gemini API の無料枠ではレート制限やレスポンス遅延が発生する可能性があります。
- 今後の拡張アイデア: RLS/JWT による保護、要約のみ保存する仕組み、ストリーミング応答、メッセージ閲覧制限など。
