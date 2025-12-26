# ☁️ クラウド同期サーバー セットアップガイド

このガイドでは、**Advanced Search for X (Twitter) 🔍**をクラウド同期させ、多端末での利用可能にする為の方法を解説します。

**Cloudflareのアカウントのみ**（無料枠で十分）を使用し、あなた専用の同期サーバーを構築する手順を解説します。

ブラウザ上の操作だけで完結します。<br><br>

## 事前準備

* [Cloudflare](https://dash.cloudflare.com/sign-up) のアカウントを作成してください（メールアドレスのみで作成可能）<br><br>


## Step 1: データベース (D1) の作成

データの保存先となるデータベースを作成します。

1. Cloudflareダッシュボードにログインし、左サイドバーから **「ストレージとデータベース」** > **「D1 SQL データベース」** をクリックします。
2. **「データベースを作成」** ボタンをクリックします。
<img width="3455" height="1908" alt="image" src="https://github.com/user-attachments/assets/e40247b2-8da5-4dea-b9dd-d4cc33cd73c6" />
<br><br>

3. 「名前」 に `x-sync-db` （または好きな名前）を入力し、**作成** をクリックします。
<img width="3452" height="1766" alt="image" src="https://github.com/user-attachments/assets/18a00b76-beeb-4fba-9e47-025eaa90585e" />
<br><br>

4. データベースが作成された画面が出たら、次に **コンソール** タブをクリックします。
<img width="3448" height="1769" alt="image" src="https://github.com/user-attachments/assets/4e16b766-034d-4964-aab2-9002428626a3" />
<br><br>

5. 以下のリンクからSQLファイルを開き、**中身をすべてコピー**してください。
   
   📄 **[schema.sql を開く](./schema.sql)** 👈 Click here!

6. コンソール画面のエディタ部分にコードを貼り付け、**実行** ボタンをクリックします。
<img width="3450" height="1856" alt="image" src="https://github.com/user-attachments/assets/8705d6eb-f266-478b-9bc1-f9563cd611a9" />
<br><br>

7. 「このクエリーは正常に実行されました。」と表示されていれば成功です。
<img width="3454" height="1863" alt="image" src="https://github.com/user-attachments/assets/ea6c2f68-c98b-47e8-815f-2dbaec83e93b" />
<br><br>

## Step 2: Worker の作成

実際に動作するプログラム（Worker）を作成します。

1. 左サイドバーの **「コンピューティングとAI」** > **「Workers & Pages」** をクリックし、**「アプリケーションを作成する」**をクリックします。
<img width="3458" height="1901" alt="image" src="https://github.com/user-attachments/assets/3af4b8a0-5fb4-4555-a34d-e072900f3925" />
<br><br>

2. **「Hello Worldを開始する」** をクリックします。
<img width="3455" height="2031" alt="image" src="https://github.com/user-attachments/assets/78d2400f-377c-4282-a4a1-b323894fc656" />
<br><br>

3. Worker name に `my-x-sync` （または好きな名前orランダム文字列）を入力し、**デプロイ** をクリックします。
   * ※この時点では "Hello World" がデプロイされますが問題ありません。
<img width="3459" height="2032" alt="image" src="https://github.com/user-attachments/assets/34f586db-6b9b-4d45-9184-bd294d248500" />
<br><br>

4. デプロイ完了画面で **コードを編集する** をクリックします。
<img width="3452" height="2020" alt="image" src="https://github.com/user-attachments/assets/86c2a75f-07ac-4185-a3fd-9caf0195138c" />
<br><br>

## Step 3: コードのデプロイ

プログラムの中身を書き換えます。

1. 以下のリンクからWorkerのコードを開き、**中身をすべてコピー**してください。

   📄 **[worker.js を開く](./worker.js)** 👈 Click here!

2. エディタに表示されている既存のコードを削除し、 **コピーしたコードを貼り付け、画面右上のデプロイをクリック** します。
   * ※バージョンを保存しましたと出たら成功です。
<img width="3458" height="2014" alt="image" src="https://github.com/user-attachments/assets/79482c96-2333-4402-b698-dc219b7036e8" />
<br><br>

## Step 4: データベースの接続 (重要)

Workerとデータベースを繋ぐ設定です。**これを行わないとエラーになります。**

1. 画面左上の「**←** (戻る矢印)」をクリックして、Workerの管理画面に戻ります。
<img width="3450" height="2018" alt="image" src="https://github.com/user-attachments/assets/520856a4-627d-4d9c-add2-61c1be17f82a" />
<br><br>

2. 上部タブの **バインディング** をクリックし、**バインディングを追加＋** をクリックします。
<img width="3455" height="1937" alt="image" src="https://github.com/user-attachments/assets/96fcd7a2-667d-415d-bc1e-521f29651ba0" />
<br><br>

3. **D1 データベース** を選択し、右下の**バインディングを追加** をクリックします。
<img width="3453" height="2026" alt="image" src="https://github.com/user-attachments/assets/d30341da-829c-4d47-9cec-41488bf04edf" />
<br><br>

4. 以下のように設定します：
   * **変数**: `DB`
     * ⚠️ **重要**: 必ず大文字で `DB` と入力してください。これ以外だと動きません。
   * **D1 データベース**: Step 1で作成したデータベース（`x-sync-db` 或いはご自身で設定されたデータベース名）を選択します。
   * **バインディングを追加**をクリックします。
<img width="3449" height="2031" alt="image" src="https://github.com/user-attachments/assets/bd859009-99ff-4970-a2ad-b224fb3a03f4" />
<br><br>

6. 以下のような画面が表示されれば成功です。
<img width="3459" height="1912" alt="image" src="https://github.com/user-attachments/assets/fdb92c3e-0603-4321-b167-147984e0443e" />
<br><br>

## 🎉 完了

お疲れ様でした！構築は完了です。

1. Worker管理画面のトップ（概要タブ）に戻り、右側の **ドメインとルート** に表示されている URL（例: `my-x-sync.xxxxx.workers.dev`）をコピーします。
<img width="3452" height="1944" alt="image" src="https://github.com/user-attachments/assets/227cd5ce-324e-4a84-b83d-bd74b96a109f" />
<br><br>

2. 拡張機能の設定画面を開き、**「同期サーバーURL」** に貼り付けて保存してください。
   * ⚠️ **重要**: 必ず `https://` を冒頭に付けてください。付けないとエラーになります。
<img width="3459" height="1888" alt="image" src="https://github.com/user-attachments/assets/f065fbfb-b3e7-4a72-b80b-1eca3e087e32" />

