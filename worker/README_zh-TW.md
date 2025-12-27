# ☁️ 雲端同步伺服器設定指南

本指南將說明如何為 **Advanced Search for X (Twitter) 🔍** 設定雲端同步功能，以便在多個裝置上使用。

我們將講解如何**僅使用 Cloudflare 帳戶**（免費方案即可）來建立您專屬的同步伺服器。

所有操作皆可在瀏覽器中完成。<br><br>

## 事前準備

* 註冊一個 [Cloudflare](https://dash.cloudflare.com/sign-up) 帳戶（僅需電子郵件地址）。<br><br>


## Step 1: 建立資料庫 (D1)

建立一個資料庫以儲存資料。

1. 登入 Cloudflare 控制台，點擊左側選單的 **「Storage & Databases」 (儲存與資料庫)** > **「D1 SQL Database」**。
2. 點擊 **「Create」 (建立)** 按鈕。
<img width="3455" height="1908" alt="image" src="https://github.com/user-attachments/assets/e40247b2-8da5-4dea-b9dd-d4cc33cd73c6" />
<br><br>

3. 在「Name」 (名稱) 中輸入 `x-sync-db`（或您喜歡的名稱），然後點擊 **Create (建立)**。
<img width="3452" height="1766" alt="image" src="https://github.com/user-attachments/assets/18a00b76-beeb-4fba-9e47-025eaa90585e" />
<br><br>

4. 資料庫建立完成後，點擊 **Console (控制台)** 分頁。
<img width="3448" height="1769" alt="image" src="https://github.com/user-attachments/assets/4e16b766-034d-4964-aab2-9002428626a3" />
<br><br>

5. 開啟下方連結中的 SQL 檔案，並**複製全部內容**。
   
   📄 **[開啟 schema.sql](./schema.sql)** 👈 點擊這裡！

6. 將程式碼貼到控制台畫面的編輯器中，然後點擊 **Execute (執行)** 按鈕。
<img width="3450" height="1856" alt="image" src="https://github.com/user-attachments/assets/8705d6eb-f266-478b-9bc1-f9563cd611a9" />
<br><br>

7. 如果顯示「The query was executed successfully」 (查詢已成功執行)，即表示成功。
<img width="3454" height="1863" alt="image" src="https://github.com/user-attachments/assets/ea6c2f68-c98b-47e8-815f-2dbaec83e93b" />
<br><br>

## Step 2: 建立 Worker

建立實際執行程式的 Worker。

1. 點擊左側選單的 **「Compute (Workers)」** > **「Workers & Pages」**，然後點擊 **「Create application」 (建立應用程式)**。
<img width="3458" height="1901" alt="image" src="https://github.com/user-attachments/assets/3af4b8a0-5fb4-4555-a34d-e072900f3925" />
<br><br>

2. 點擊 **「Create Worker」** (通常顯示為 Hello World 模板)。
<img width="3455" height="2031" alt="image" src="https://github.com/user-attachments/assets/78d2400f-377c-4282-a4a1-b323894fc656" />
<br><br>

3. 在 Worker name 中輸入 `my-x-sync`（或您喜歡的名稱/隨機字串），然後點擊 **Deploy (部署)**。
   * *注意：此時會部署一個 "Hello World" 程式，這是正常的。*
<img width="3459" height="2032" alt="image" src="https://github.com/user-attachments/assets/34f586db-6b9b-4d45-9184-bd294d248500" />
<br><br>

4. 在部署完成畫面，點擊 **Edit code (編輯程式碼)**。
<img width="3452" height="2020" alt="image" src="https://github.com/user-attachments/assets/86c2a75f-07ac-4185-a3fd-9caf0195138c" />
<br><br>

## Step 3: 部署程式碼

改寫程式內容。

1. 開啟下方連結中的 Worker 程式碼，並**複製全部內容**。

   📄 **[開啟 worker.js](./worker.js)** 👈 點擊這裡！

2. 刪除編輯器中現有的程式碼，**貼上剛才複製的程式碼，然後點擊右上角的 "Deploy" (部署)**。
   * *注意：如果出現「Version saved」 (版本已儲存)，即表示成功。*
<img width="3458" height="2014" alt="image" src="https://github.com/user-attachments/assets/79482c96-2333-4402-b698-dc219b7036e8" />
<br><br>

## Step 4: 連接資料庫 (重要)

設定 Worker 與資料庫的連線。**如果不執行此操作，將會發生錯誤。**

1. 點擊畫面左上角的「**←** (返回箭頭)」回到 Worker 管理畫面。
<img width="3450" height="2018" alt="image" src="https://github.com/user-attachments/assets/520856a4-627d-4d9c-add2-61c1be17f82a" />
<br><br>

2. 點擊上方的 **Settings (設定)** 分頁（或 Bindings），找到 **「Bindings」 (綁定)** 區塊，點擊 **Add (新增)**。
<img width="3455" height="1937" alt="image" src="https://github.com/user-attachments/assets/96fcd7a2-667d-415d-bc1e-521f29651ba0" />
<br><br>

3. 選擇 **D1 Database**，然後點擊 **Add binding**。
<img width="3453" height="2026" alt="image" src="https://github.com/user-attachments/assets/d30341da-829c-4d47-9cec-41488bf04edf" />
<br><br>

4. 進行如下設定：
   * **Variable name (變數名稱)**: `DB`
     * ⚠️ **重要**: 必須輸入大寫的 `DB`。否則無法運作。
   * **D1 Database**: 選擇在 Step 1 中建立的資料庫（`x-sync-db` 或您設定的名稱）。
   * 點擊 **Deploy** (或 Save)。
<img width="3449" height="2031" alt="image" src="https://github.com/user-attachments/assets/bd859009-99ff-4970-a2ad-b224fb3a03f4" />
<br><br>

6. 如果顯示綁定已新增的畫面，即表示成功。
<img width="3459" height="1912" alt="image" src="https://github.com/user-attachments/assets/fdb92c3e-0603-4321-b167-147984e0443e" />
<br><br>

## 🎉 完成

辛苦了！建置工作已完成。

1. 返回 Worker 管理畫面的首頁（Overview 分頁），複製右側 **Preview** 或 **Routes** 中顯示的 URL（例如：`my-x-sync.xxxxx.workers.dev`）。
<img width="3452" height="1944" alt="image" src="https://github.com/user-attachments/assets/227cd5ce-324e-4a84-b83d-bd74b96a109f" />
<br><br>

2. 開啟擴充功能的設定畫面，將其貼上到 **「端點 URL」 (Endpoint URL)** 中並儲存。
   * ⚠️ **重要**: 請務必在開頭加上 `https://`。如果不加將會發生錯誤。
   * ⚠️ **重要**: 請在所有需要同步的裝置上輸入相同的「同步 ID」和「密碼」。
<img width="3459" height="1888" alt="image" src="https://github.com/user-attachments/assets/f065fbfb-b3e7-4a72-b80b-1eca3e087e32" />
