# Career Coaching AI Project

高校生向けのキャリア支援チャットAIプロジェクトです。
進路選択の自己効力（Taylor & Betz, 1983）の5つの行動領域を刺激するコーチング機能を提供します。

## 機能概要

- **5つのコーチング領域**:
  1. 自己認識 (Self-awareness)
  2. 職業情報の収集 (Information Gathering)
  3. 目標選択 (Goal Selection)
  4. 計画作成 (Planning)
  5. 問題解決 (Problem Solving)

- **ゴール判定機能**:
  ユーザーの回答が各領域の目標（例：具体的な行動が含まれているか）を満たしているかを自動判定し、フィードバックを行います。

## セットアップ

### 1. インストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、以下の変数を設定してください。

```env
GEMINI_API_KEY=your_api_key_here
# テスト用モックモード (任意)
# USE_MOCK_GEMINI=true
```

### 3. 起動

```bash
npm run dev
```

## テスト

ゴール判定ロジックのテストを実行するには：

```bash
npx jest tests/goalEvaluator.test.ts
```

## UIについて

`/mnt/data/b1022155slide.pdf` の資料を参考に、5つの領域を選択できるタブUIと、チャット画面を実装しています。
ゴール達成時には「到達しました」というフィードバックが表示されます。
