# ☁️ 云同步服务器设置指南

本指南将介绍如何为 **Advanced Search for X (Twitter) 🔍** 设置云同步功能，以便在多台设备上使用。

我们将讲解如何**仅使用 Cloudflare 账户**（免费版即可）来搭建您专属的同步服务器。

所有操作均可在浏览器中完成。<br><br>

## 准备工作

* 注册一个 [Cloudflare](https://dash.cloudflare.com/sign-up) 账户（仅需邮箱地址）。<br><br>


## Step 1: 创建数据库 (D1)

创建一个数据库用于存储数据。

1. 登录 Cloudflare 控制台，点击左侧边栏的 **“Storage & Databases” (存储和数据库)** > **“D1 SQL Database”**。
2. 点击 **“Create” (创建)** 按钮。
<img width="3455" height="1908" alt="image" src="https://github.com/user-attachments/assets/e40247b2-8da5-4dea-b9dd-d4cc33cd73c6" />
<br><br>

3. 在“Name” (名称) 中输入 `x-sync-db`（或您喜欢的任何名称），然后点击 **Create (创建)**。
<img width="3452" height="1766" alt="image" src="https://github.com/user-attachments/assets/18a00b76-beeb-4fba-9e47-025eaa90585e" />
<br><br>

4. 数据库创建完成后，点击 **Console (控制台)** 标签页。
<img width="3448" height="1769" alt="image" src="https://github.com/user-attachments/assets/4e16b766-034d-4964-aab2-9002428626a3" />
<br><br>

5. 打开下方链接中的 SQL 文件，并**复制全部内容**。
   
   📄 **[打开 schema.sql](./schema.sql)** 👈 点击这里！

6. 将代码粘贴到控制台界面的编辑器中，然后点击 **Execute (执行)** 按钮。
<img width="3450" height="1856" alt="image" src="https://github.com/user-attachments/assets/8705d6eb-f266-478b-9bc1-f9563cd611a9" />
<br><br>

7. 如果显示“The query was executed successfully” (查询已成功执行)，即表示成功。
<img width="3454" height="1863" alt="image" src="https://github.com/user-attachments/assets/ea6c2f68-c98b-47e8-815f-2dbaec83e93b" />
<br><br>

## Step 2: 创建 Worker

创建实际运行程序的 Worker。

1. 点击左侧边栏的 **“Compute (Workers)”** > **“Workers & Pages”**，然后点击 **“Create application” (创建应用程序)**。
<img width="3458" height="1901" alt="image" src="https://github.com/user-attachments/assets/3af4b8a0-5fb4-4555-a34d-e072900f3925" />
<br><br>

2. 点击 **“Create Worker”** (通常显示为 Hello World 模板)。
<img width="3455" height="2031" alt="image" src="https://github.com/user-attachments/assets/78d2400f-377c-4282-a4a1-b323894fc656" />
<br><br>

3. 在 Worker name 中输入 `my-x-sync`（或您喜欢的名称/随机字符），然后点击 **Deploy (部署)**。
   * *注意：此时会部署一个 "Hello World" 程序，这是正常的。*
<img width="3459" height="2032" alt="image" src="https://github.com/user-attachments/assets/34f586db-6b9b-4d45-9184-bd294d248500" />
<br><br>

4. 在部署完成界面，点击 **Edit code (编辑代码)**。
<img width="3452" height="2020" alt="image" src="https://github.com/user-attachments/assets/86c2a75f-07ac-4185-a3fd-9caf0195138c" />
<br><br>

## Step 3: 部署代码

重写程序内容。

1. 打开下方链接中的 Worker 代码，并**复制全部内容**。

   📄 **[打开 worker.js](./worker.js)** 👈 点击这里！

2. 删除编辑器中现有的代码，**粘贴刚才复制的代码，然后点击右上角的 "Deploy" (部署)**。
   * *注意：如果出现“Version saved” (版本已保存)，即表示成功。*
<img width="3458" height="2014" alt="image" src="https://github.com/user-attachments/assets/79482c96-2333-4402-b698-dc219b7036e8" />
<br><br>

## Step 4: 连接数据库 (重要)

配置 Worker 与数据库的连接。**如果不执行此操作，将会报错。**

1. 点击屏幕左上角的“**←** (返回箭头)”回到 Worker 管理界面。
<img width="3450" height="2018" alt="image" src="https://github.com/user-attachments/assets/520856a4-627d-4d9c-add2-61c1be17f82a" />
<br><br>

2. 点击上方的 **Settings (设置)** 选项卡（或 Bindings），找到 **“Bindings” (绑定)** 部分，点击 **Add (添加)**。
<img width="3455" height="1937" alt="image" src="https://github.com/user-attachments/assets/96fcd7a2-667d-415d-bc1e-521f29651ba0" />
<br><br>

3. 选择 **D1 Database**，然后点击 **Add binding**。
<img width="3453" height="2026" alt="image" src="https://github.com/user-attachments/assets/d30341da-829c-4d47-9cec-41488bf04edf" />
<br><br>

4. 进行如下设置：
   * **Variable name (变量名)**: `DB`
     * ⚠️ **重要**: 必须输入大写的 `DB`。否则无法运行。
   * **D1 Database**: 选择在 Step 1 中创建的数据库（`x-sync-db` 或您设置的名称）。
   * 点击 **Deploy** (或 Save)。
<img width="3449" height="2031" alt="image" src="https://github.com/user-attachments/assets/bd859009-99ff-4970-a2ad-b224fb3a03f4" />
<br><br>

6. 如果显示绑定已添加的界面，即表示成功。
<img width="3459" height="1912" alt="image" src="https://github.com/user-attachments/assets/fdb92c3e-0603-4321-b167-147984e0443e" />
<br><br>

## 🎉 完成

辛苦了！搭建工作已完成。

1. 返回 Worker 管理界面的首页（Overview 标签页），复制右侧 **Preview** 或 **Routes** 中显示的 URL（例如：`my-x-sync.xxxxx.workers.dev`）。
<img width="3452" height="1944" alt="image" src="https://github.com/user-attachments/assets/227cd5ce-324e-4a84-b83d-bd74b96a109f" />
<br><br>

2. 打开扩展程序的设置界面，将其粘贴到 **“端点 URL” (Endpoint URL)** 中并保存。
   * ⚠️ **重要**: 请务必在开头加上 `https://`。如果不加将会报错。
   * ⚠️ **重要**: 请在所有需要同步的设备上输入相同的“同步 ID”和“密码”。
<img width="3459" height="1888" alt="image" src="https://github.com/user-attachments/assets/f065fbfb-b3e7-4a72-b80b-1eca3e087e32" />
