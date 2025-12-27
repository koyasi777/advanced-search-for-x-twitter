# ☁️ Einrichtungsanleitung für den Cloud-Sync-Server

Diese Anleitung erklärt, wie Sie die Cloud-Synchronisierung für **Advanced Search for X (Twitter) 🔍** einrichten, um Ihre Daten auf mehreren Geräten zu nutzen.

Wir zeigen Ihnen, wie Sie **nur mit einem Cloudflare-Konto** (der kostenlose Plan reicht aus) Ihren eigenen dedizierten Synchronisierungsserver erstellen.

Der gesamte Prozess kann im Browser durchgeführt werden.<br><br>

## Voraussetzungen

* Erstellen Sie ein [Cloudflare](https://dash.cloudflare.com/sign-up)-Konto (nur E-Mail-Adresse erforderlich).<br><br>


## Schritt 1: Datenbank (D1) erstellen

Erstellen Sie eine Datenbank, um Ihre Daten zu speichern.

1. Melden Sie sich im Cloudflare-Dashboard an und klicken Sie in der linken Seitenleiste auf **"Storage & Databases"** > **"D1 SQL Database"**.
2. Klicken Sie auf die Schaltfläche **"Create"**.
<img width="3455" height="1908" alt="image" src="https://github.com/user-attachments/assets/e40247b2-8da5-4dea-b9dd-d4cc33cd73c6" />
<br><br>

3. Geben Sie unter **"Database name"** den Namen `x-sync-db` (oder einen beliebigen Namen) ein und klicken Sie auf **Create**.
<img width="3452" height="1766" alt="image" src="https://github.com/user-attachments/assets/18a00b76-beeb-4fba-9e47-025eaa90585e" />
<br><br>

4. Sobald die Datenbank erstellt ist, klicken Sie auf den Reiter **Console**.
<img width="3448" height="1769" alt="image" src="https://github.com/user-attachments/assets/4e16b766-034d-4964-aab2-9002428626a3" />
<br><br>

5. Öffnen Sie die SQL-Datei über den untenstehenden Link und **kopieren Sie den gesamten Inhalt**.
   
   📄 **[schema.sql öffnen](./schema.sql)** 👈 Hier klicken!

6. Fügen Sie den Code in den Editor im Konsolenbildschirm ein und klicken Sie auf **Execute**.
<img width="3450" height="1856" alt="image" src="https://github.com/user-attachments/assets/8705d6eb-f266-478b-9bc1-f9563cd611a9" />
<br><br>

7. Wenn die Meldung "The query was executed successfully" erscheint, war der Vorgang erfolgreich.
<img width="3454" height="1863" alt="image" src="https://github.com/user-attachments/assets/ea6c2f68-c98b-47e8-815f-2dbaec83e93b" />
<br><br>

## Schritt 2: Worker erstellen

Erstellen Sie das Programm (Worker), das die Logik ausführt.

1. Klicken Sie in der linken Seitenleiste auf **"Compute (Workers)"** > **"Workers & Pages"** und dann auf **"Create application"**.
<img width="3458" height="1901" alt="image" src="https://github.com/user-attachments/assets/3af4b8a0-5fb4-4555-a34d-e072900f3925" />
<br><br>

2. Klicken Sie auf **"Create Worker"** (meistens die Vorlage "Hello World").
<img width="3455" height="2031" alt="image" src="https://github.com/user-attachments/assets/78d2400f-377c-4282-a4a1-b323894fc656" />
<br><br>

3. Geben Sie `my-x-sync` (oder einen beliebigen Namen) als Worker-Namen ein und klicken Sie auf **Deploy**.
   * *Hinweis: Zu diesem Zeitpunkt wird ein "Hello World"-Skript bereitgestellt, das ist in Ordnung.*
<img width="3459" height="2032" alt="image" src="https://github.com/user-attachments/assets/34f586db-6b9b-4d45-9184-bd294d248500" />
<br><br>

4. Klicken Sie auf dem Abschlussbildschirm auf **Edit code**.
<img width="3452" height="2020" alt="image" src="https://github.com/user-attachments/assets/86c2a75f-07ac-4185-a3fd-9caf0195138c" />
<br><br>

## Schritt 3: Code bereitstellen

Ersetzen Sie den Inhalt des Programms.

1. Öffnen Sie den Worker-Code über den untenstehenden Link und **kopieren Sie den gesamten Inhalt**.

   📄 **[worker.js öffnen](./worker.js)** 👈 Hier klicken!

2. Löschen Sie den vorhandenen Code im Editor, **fügen Sie den kopierten Code ein und klicken Sie oben rechts auf "Deploy"**.
   * *Erfolgreich, wenn die Meldung "Version saved" erscheint.*
<img width="3458" height="2014" alt="image" src="https://github.com/user-attachments/assets/79482c96-2333-4402-b698-dc219b7036e8" />
<br><br>

## Schritt 4: Datenbank verbinden (Wichtig)

Konfigurieren Sie die Verbindung zwischen dem Worker und der Datenbank. **Wenn Sie dies überspringen, tritt ein Fehler auf.**

1. Klicken Sie oben links auf den Pfeil "**←** (Zurück)", um zum Worker-Verwaltungsbildschirm zurückzukehren.
<img width="3450" height="2018" alt="image" src="https://github.com/user-attachments/assets/520856a4-627d-4d9c-add2-61c1be17f82a" />
<br><br>

2. Klicken Sie auf den Reiter **Settings** (oder Bindings), suchen Sie den Abschnitt **"Bindings"** und klicken Sie auf **Add**.
<img width="3455" height="1937" alt="image" src="https://github.com/user-attachments/assets/96fcd7a2-667d-415d-bc1e-521f29651ba0" />
<br><br>

3. Wählen Sie **D1 Database** und klicken Sie auf **Add binding**.
<img width="3453" height="2026" alt="image" src="https://github.com/user-attachments/assets/d30341da-829c-4d47-9cec-41488bf04edf" />
<br><br>

4. Konfigurieren Sie wie folgt:
   * **Variable name**: `DB`
     * ⚠️ **Wichtig**: Sie müssen `DB` in Großbuchstaben eingeben. Andernfalls funktioniert es nicht.
   * **D1 Database**: Wählen Sie die in Schritt 1 erstellte Datenbank (`x-sync-db` oder Ihren eigenen Namen).
   * Klicken Sie auf **Deploy** (oder Save).
<img width="3449" height="2031" alt="image" src="https://github.com/user-attachments/assets/bd859009-99ff-4970-a2ad-b224fb3a03f4" />
<br><br>

6. Wenn ein Bildschirm angezeigt wird, der bestätigt, dass die Bindung hinzugefügt wurde, war es erfolgreich.
<img width="3459" height="1912" alt="image" src="https://github.com/user-attachments/assets/fdb92c3e-0603-4321-b167-147984e0443e" />
<br><br>

## 🎉 Fertigstellung

Herzlichen Glückwunsch! Die Einrichtung ist abgeschlossen.

1. Kehren Sie zur Hauptseite der Worker-Verwaltung zurück (Reiter Overview) und kopieren Sie die URL, die unter **Preview** oder **Routes** angezeigt wird (z. B. `my-x-sync.xxxxx.workers.dev`).
<img width="3452" height="1944" alt="image" src="https://github.com/user-attachments/assets/227cd5ce-324e-4a84-b83d-bd74b96a109f" />
<br><br>

2. Öffnen Sie die **Einstellungen** der Browser-Erweiterung, fügen Sie die URL in **"Endpunkt-URL"** ein und speichern Sie.
   * ⚠️ **Wichtig**: Stellen Sie sicher, dass am Anfang `https://` steht.
   * ⚠️ **Wichtig**: Geben Sie auf allen zu synchronisierenden Geräten dieselbe „Sync-ID“ und dasselbe „Passwort“ ein.
<img width="3459" height="1888" alt="image" src="https://github.com/user-attachments/assets/f065fbfb-b3e7-4a72-b80b-1eca3e087e32" />
