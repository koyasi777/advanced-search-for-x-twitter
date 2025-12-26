# ☁️ Guide de configuration du serveur de synchronisation Cloud

Ce guide explique comment configurer la synchronisation cloud pour **Advanced Search for X (Twitter) 🔍**, afin d'utiliser vos données sur plusieurs appareils.

Nous allons vous guider pour créer votre propre serveur de synchronisation dédié en utilisant **uniquement un compte Cloudflare** (l'offre gratuite suffit).

L'ensemble du processus se déroule dans votre navigateur.<br><br>

## Prérequis

* Créez un compte [Cloudflare](https://dash.cloudflare.com/sign-up) (une adresse e-mail suffit).<br><br>


## Étape 1 : Créer une base de données (D1)

Créez une base de données pour stocker vos données.

1. Connectez-vous au tableau de bord Cloudflare et cliquez sur **"Storage & Databases"** > **"D1 SQL Database"** dans la barre latérale gauche.
2. Cliquez sur le bouton **"Create"** (Créer).
<img width="3455" height="1908" alt="image" src="https://github.com/user-attachments/assets/e40247b2-8da5-4dea-b9dd-d4cc33cd73c6" />
<br><br>

3. Saisissez `x-sync-db` (ou le nom de votre choix) dans le champ **"Database name"** et cliquez sur **Create**.
<img width="3452" height="1766" alt="image" src="https://github.com/user-attachments/assets/18a00b76-beeb-4fba-9e47-025eaa90585e" />
<br><br>

4. Une fois la base de données créée, cliquez sur l'onglet **Console**.
<img width="3448" height="1769" alt="image" src="https://github.com/user-attachments/assets/4e16b766-034d-4964-aab2-9002428626a3" />
<br><br>

5. Ouvrez le fichier SQL à partir du lien ci-dessous et **copiez tout son contenu**.
   
   📄 **[Ouvrir schema.sql](./schema.sql)** 👈 Cliquez ici !

6. Collez le code dans l'éditeur de l'écran Console et cliquez sur le bouton **Execute**.
<img width="3450" height="1856" alt="image" src="https://github.com/user-attachments/assets/8705d6eb-f266-478b-9bc1-f9563cd611a9" />
<br><br>

7. Si le message "The query was executed successfully" s'affiche, c'est réussi.
<img width="3454" height="1863" alt="image" src="https://github.com/user-attachments/assets/ea6c2f68-c98b-47e8-815f-2dbaec83e93b" />
<br><br>

## Étape 2 : Créer un Worker

Créez le programme (Worker) qui exécutera la logique de synchronisation.

1. Cliquez sur **"Compute (Workers)"** > **"Workers & Pages"** dans la barre latérale gauche, puis sur **"Create application"**.
<img width="3458" height="1901" alt="image" src="https://github.com/user-attachments/assets/3af4b8a0-5fb4-4555-a34d-e072900f3925" />
<br><br>

2. Cliquez sur **"Create Worker"** (généralement le modèle "Hello World").
<img width="3455" height="2031" alt="image" src="https://github.com/user-attachments/assets/78d2400f-377c-4282-a4a1-b323894fc656" />
<br><br>

3. Saisissez `my-x-sync` (ou un nom de votre choix) pour le nom du Worker et cliquez sur **Deploy**.
   * *Note : Un script "Hello World" sera déployé à ce stade, c'est normal.*
<img width="3459" height="2032" alt="image" src="https://github.com/user-attachments/assets/34f586db-6b9b-4d45-9184-bd294d248500" />
<br><br>

4. Sur l'écran de confirmation, cliquez sur **Edit code**.
<img width="3452" height="2020" alt="image" src="https://github.com/user-attachments/assets/86c2a75f-07ac-4185-a3fd-9caf0195138c" />
<br><br>

## Étape 3 : Déployer le code

Remplacez le contenu du programme.

1. Ouvrez le code du Worker à partir du lien ci-dessous et **copiez tout son contenu**.

   📄 **[Ouvrir worker.js](./worker.js)** 👈 Cliquez ici !

2. Supprimez le code existant dans l'éditeur, **collez le code que vous venez de copier, puis cliquez sur "Deploy" en haut à droite**.
   * *Succès si le message "Version saved" apparaît.*
<img width="3458" height="2014" alt="image" src="https://github.com/user-attachments/assets/79482c96-2333-4402-b698-dc219b7036e8" />
<br><br>

## Étape 4 : Connecter la base de données (Important)

Configurez la liaison entre le Worker et la base de données. **Si vous sautez cette étape, une erreur se produira.**

1. Cliquez sur la flèche "**←** (Retour)" en haut à gauche pour revenir au tableau de bord du Worker.
<img width="3450" height="2018" alt="image" src="https://github.com/user-attachments/assets/520856a4-627d-4d9c-add2-61c1be17f82a" />
<br><br>

2. Cliquez sur l'onglet **Settings** (ou Bindings), trouvez la section **"Bindings"** et cliquez sur **Add**.
<img width="3455" height="1937" alt="image" src="https://github.com/user-attachments/assets/96fcd7a2-667d-415d-bc1e-521f29651ba0" />
<br><br>

3. Sélectionnez **D1 Database** et cliquez sur **Add binding**.
<img width="3453" height="2026" alt="image" src="https://github.com/user-attachments/assets/d30341da-829c-4d47-9cec-41488bf04edf" />
<br><br>

4. Configurez comme suit :
   * **Variable name** : `DB`
     * ⚠️ **Important** : Vous devez impérativement saisir `DB` en majuscules. Sinon, cela ne fonctionnera pas.
   * **D1 Database** : Sélectionnez la base de données créée à l'étape 1 (`x-sync-db` ou votre nom personnalisé).
   * Cliquez sur **Deploy** (ou Save).
<img width="3449" height="2031" alt="image" src="https://github.com/user-attachments/assets/bd859009-99ff-4970-a2ad-b224fb3a03f4" />
<br><br>

6. Si un écran indiquant que la liaison a été ajoutée apparaît, c'est réussi.
<img width="3459" height="1912" alt="image" src="https://github.com/user-attachments/assets/fdb92c3e-0603-4321-b167-147984e0443e" />
<br><br>

## 🎉 Terminé

Félicitations ! La configuration est terminée.

1. Revenez à l'écran principal du Worker (onglet Overview) et copiez l'URL affichée sous **Preview** ou **Routes** (ex: `my-x-sync.xxxxx.workers.dev`).
<img width="3452" height="1944" alt="image" src="https://github.com/user-attachments/assets/227cd5ce-324e-4a84-b83d-bd74b96a109f" />
<br><br>

2. Ouvrez les **Paramètres** de l'extension de navigateur, collez l'URL dans **"URL Endpoint"** et enregistrez.
   * ⚠️ **Important** : Assurez-vous d'inclure `https://` au début.
<img width="3459" height="1888" alt="image" src="https://github.com/user-attachments/assets/f065fbfb-b3e7-4a72-b80b-1eca3e087e32" />
