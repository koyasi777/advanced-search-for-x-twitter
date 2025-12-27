# ☁️ Cloud Sync Server Setup Guide

This guide explains how to set up cloud synchronization for **Advanced Search for X (Twitter) 🔍**, allowing you to use it across multiple devices.

We will walk you through the steps to build your own dedicated sync server using **only a Cloudflare account** (the free tier is sufficient).

The entire process can be completed within your browser.<br><br>

## Prerequisites

* Create a [Cloudflare](https://dash.cloudflare.com/sign-up) account (email address only required).<br><br>


## Step 1: Create a Database (D1)

Create a database to store your data.

1. Log in to the Cloudflare dashboard and click **"Storage & Databases"** > **"D1 SQL Database"** in the left sidebar.
2. Click the **"Create"** button.
<img width="3455" height="1908" alt="image" src="https://github.com/user-attachments/assets/e40247b2-8da5-4dea-b9dd-d4cc33cd73c6" />
<br><br>

3. Enter `x-sync-db` (or any name you prefer) in the **"Database name"** field and click **Create**.
<img width="3452" height="1766" alt="image" src="https://github.com/user-attachments/assets/18a00b76-beeb-4fba-9e47-025eaa90585e" />
<br><br>

4. Once the database is created, click the **Console** tab.
<img width="3448" height="1769" alt="image" src="https://github.com/user-attachments/assets/4e16b766-034d-4964-aab2-9002428626a3" />
<br><br>

5. Open the SQL file from the link below and **copy all of its content**.
   
   📄 **[Open schema.sql](./schema.sql)** 👈 Click here!

6. Paste the code into the editor in the Console screen and click the **Execute** button.
<img width="3450" height="1856" alt="image" src="https://github.com/user-attachments/assets/8705d6eb-f266-478b-9bc1-f9563cd611a9" />
<br><br>

7. If you see the message "The query was executed successfully," it was successful.
<img width="3454" height="1863" alt="image" src="https://github.com/user-attachments/assets/ea6c2f68-c98b-47e8-815f-2dbaec83e93b" />
<br><br>

## Step 2: Create a Worker

Create the program (Worker) that will actually run the logic.

1. Click **"Compute (Workers)"** > **"Workers & Pages"** in the left sidebar, then click **"Create application"**.
<img width="3458" height="1901" alt="image" src="https://github.com/user-attachments/assets/3af4b8a0-5fb4-4555-a34d-e072900f3925" />
<br><br>

2. Click **"Create Worker"** (often labeled as "Hello World" template).
<img width="3455" height="2031" alt="image" src="https://github.com/user-attachments/assets/78d2400f-377c-4282-a4a1-b323894fc656" />
<br><br>

3. Enter `my-x-sync` (or any name/random string) for the Worker name and click **Deploy**.
   * *Note: A "Hello World" script will be deployed at this stage, which is fine.*
<img width="3459" height="2032" alt="image" src="https://github.com/user-attachments/assets/34f586db-6b9b-4d45-9184-bd294d248500" />
<br><br>

4. On the deployment completion screen, click **Edit code**.
<img width="3452" height="2020" alt="image" src="https://github.com/user-attachments/assets/86c2a75f-07ac-4185-a3fd-9caf0195138c" />
<br><br>

## Step 3: Deploy the Code

Rewrite the contents of the program.

1. Open the Worker code from the link below and **copy all of its content**.

   📄 **[Open worker.js](./worker.js)** 👈 Click here!

2. Delete the existing code shown in the editor, **paste the code you just copied, and click "Deploy" at the top right**.
   * *Success if the message "Version saved" appears.*
<img width="3458" height="2014" alt="image" src="https://github.com/user-attachments/assets/79482c96-2333-4402-b698-dc219b7036e8" />
<br><br>

## Step 4: Connect the Database (Crucial)

Configure the connection between the Worker and the database. **If you skip this, it will result in an error.**

1. Click the "**←** (Back arrow)" at the top left of the screen to return to the Worker management dashboard.
<img width="3450" height="2018" alt="image" src="https://github.com/user-attachments/assets/520856a4-627d-4d9c-add2-61c1be17f82a" />
<br><br>

2. Click the **Settings** tab (or **Bindings** depending on the UI version), then find **"Bindings"** and click **Add**.
   * *Note: In some UIs, this is under Settings > Variables > Bindings.*
<img width="3455" height="1937" alt="image" src="https://github.com/user-attachments/assets/96fcd7a2-667d-415d-bc1e-521f29651ba0" />
<br><br>

3. Select **D1 Database** and click **Add binding**.
<img width="3453" height="2026" alt="image" src="https://github.com/user-attachments/assets/d30341da-829c-4d47-9cec-41488bf04edf" />
<br><br>

4. Configure as follows:
   * **Variable name**: `DB`
     * ⚠️ **Important**: You must enter `DB` in uppercase. It will not work otherwise.
   * **D1 Database**: Select the database you created in Step 1 (`x-sync-db` or your custom name).
   * Click **Deploy** (or Save/Add binding).
<img width="3449" height="2031" alt="image" src="https://github.com/user-attachments/assets/bd859009-99ff-4970-a2ad-b224fb3a03f4" />
<br><br>

6. If you see a screen indicating the binding has been added, you are successful.
<img width="3459" height="1912" alt="image" src="https://github.com/user-attachments/assets/fdb92c3e-0603-4321-b167-147984e0443e" />
<br><br>

## 🎉 Completion

Congratulations! The setup is complete.

1. Go back to the top of the Worker management screen (Overview tab) and copy the URL displayed under **Preview** or **Routes** (e.g., `my-x-sync.xxxxx.workers.dev`).
<img width="3452" height="1944" alt="image" src="https://github.com/user-attachments/assets/227cd5ce-324e-4a84-b83d-bd74b96a109f" />
<br><br>

2. Open the **Settings** of the browser extension, paste the URL into **"Endpoint URL"**, and save.
   * ⚠️ **Important**: Be sure to include `https://` at the beginning. It will error without it.
   * ⚠️ **Important**: Enter the same "Sync ID" and "Password" on all devices you wish to sync.
<img width="3459" height="1888" alt="image" src="https://github.com/user-attachments/assets/f065fbfb-b3e7-4a72-b80b-1eca3e087e32" />
