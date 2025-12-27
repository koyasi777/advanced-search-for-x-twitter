# ☁️ Guía de configuración del servidor de sincronización en la nube

Esta guía explica cómo configurar la sincronización en la nube para **Advanced Search for X (Twitter) 🔍**, permitiendo su uso en múltiples dispositivos.

Te guiaremos paso a paso para crear tu propio servidor de sincronización utilizando **solo una cuenta de Cloudflare** (el plan gratuito es suficiente).

Todo el proceso se puede realizar desde el navegador.<br><br>

## Requisitos previos

* Crea una cuenta en [Cloudflare](https://dash.cloudflare.com/sign-up) (solo se requiere una dirección de correo electrónico).<br><br>


## Paso 1: Crear una base de datos (D1)

Crea una base de datos para almacenar tus datos.

1. Inicia sesión en el panel de Cloudflare y haz clic en **"Storage & Databases"** > **"D1 SQL Database"** en la barra lateral izquierda.
2. Haz clic en el botón **"Create"**.
<img width="3455" height="1908" alt="image" src="https://github.com/user-attachments/assets/e40247b2-8da5-4dea-b9dd-d4cc33cd73c6" />
<br><br>

3. En el campo **"Database name"**, escribe `x-sync-db` (o el nombre que prefieras) y haz clic en **Create**.
<img width="3452" height="1766" alt="image" src="https://github.com/user-attachments/assets/18a00b76-beeb-4fba-9e47-025eaa90585e" />
<br><br>

4. Una vez creada la base de datos, haz clic en la pestaña **Console**.
<img width="3448" height="1769" alt="image" src="https://github.com/user-attachments/assets/4e16b766-034d-4964-aab2-9002428626a3" />
<br><br>

5. Abre el archivo SQL desde el siguiente enlace y **copia todo su contenido**.
   
   📄 **[Abrir schema.sql](./schema.sql)** 👈 ¡Haz clic aquí!

6. Pega el código en el editor de la pantalla Console y haz clic en el botón **Execute**.
<img width="3450" height="1856" alt="image" src="https://github.com/user-attachments/assets/8705d6eb-f266-478b-9bc1-f9563cd611a9" />
<br><br>

7. Si ves el mensaje "The query was executed successfully", la operación ha sido exitosa.
<img width="3454" height="1863" alt="image" src="https://github.com/user-attachments/assets/ea6c2f68-c98b-47e8-815f-2dbaec83e93b" />
<br><br>

## Paso 2: Crear un Worker

Crea el programa (Worker) que ejecutará la lógica.

1. Haz clic en **"Compute (Workers)"** > **"Workers & Pages"** en la barra lateral izquierda y luego en **"Create application"**.
<img width="3458" height="1901" alt="image" src="https://github.com/user-attachments/assets/3af4b8a0-5fb4-4555-a34d-e072900f3925" />
<br><br>

2. Haz clic en **"Create Worker"** (generalmente la plantilla "Hello World").
<img width="3455" height="2031" alt="image" src="https://github.com/user-attachments/assets/78d2400f-377c-4282-a4a1-b323894fc656" />
<br><br>

3. Escribe `my-x-sync` (o un nombre aleatorio) como nombre del Worker y haz clic en **Deploy**.
   * *Nota: En esta etapa se desplegará un script "Hello World", lo cual es correcto.*
<img width="3459" height="2032" alt="image" src="https://github.com/user-attachments/assets/34f586db-6b9b-4d45-9184-bd294d248500" />
<br><br>

4. En la pantalla de finalización, haz clic en **Edit code**.
<img width="3452" height="2020" alt="image" src="https://github.com/user-attachments/assets/86c2a75f-07ac-4185-a3fd-9caf0195138c" />
<br><br>

## Paso 3: Desplegar el código

Reemplaza el contenido del programa.

1. Abre el código del Worker desde el siguiente enlace y **copia todo su contenido**.

   📄 **[Abrir worker.js](./worker.js)** 👈 ¡Haz clic aquí!

2. Borra el código existente en el editor, **pega el código que acabas de copiar y haz clic en "Deploy" en la esquina superior derecha**.
   * *Éxito si aparece el mensaje "Version saved".*
<img width="3458" height="2014" alt="image" src="https://github.com/user-attachments/assets/79482c96-2333-4402-b698-dc219b7036e8" />
<br><br>

## Paso 4: Conectar la base de datos (Crucial)

Configura la conexión entre el Worker y la base de datos. **Si omites este paso, ocurrirá un error.**

1. Haz clic en la flecha "**←** (Atrás)" en la esquina superior izquierda para volver al panel del Worker.
<img width="3450" height="2018" alt="image" src="https://github.com/user-attachments/assets/520856a4-627d-4d9c-add2-61c1be17f82a" />
<br><br>

2. Haz clic en la pestaña **Settings** (o Bindings), busca la sección **"Bindings"** y haz clic en **Add**.
<img width="3455" height="1937" alt="image" src="https://github.com/user-attachments/assets/96fcd7a2-667d-415d-bc1e-521f29651ba0" />
<br><br>

3. Selecciona **D1 Database** y haz clic en **Add binding**.
<img width="3453" height="2026" alt="image" src="https://github.com/user-attachments/assets/d30341da-829c-4d47-9cec-41488bf04edf" />
<br><br>

4. Configura de la siguiente manera:
   * **Variable name**: `DB`
     * ⚠️ **Importante**: Debes escribir `DB` en mayúsculas. De lo contrario, no funcionará.
   * **D1 Database**: Selecciona la base de datos creada en el Paso 1 (`x-sync-db` o tu nombre personalizado).
   * Haz clic en **Deploy** (o Save).
<img width="3449" height="2031" alt="image" src="https://github.com/user-attachments/assets/bd859009-99ff-4970-a2ad-b224fb3a03f4" />
<br><br>

6. Si ves una pantalla indicando que se ha añadido el enlace, has tenido éxito.
<img width="3459" height="1912" alt="image" src="https://github.com/user-attachments/assets/fdb92c3e-0603-4321-b167-147984e0443e" />
<br><br>

## 🎉 Finalización

¡Felicidades! La configuración está completa.

1. Vuelve a la pantalla principal de gestión del Worker (pestaña Overview) y copia la URL que aparece en **Preview** o **Routes** (ej. `my-x-sync.xxxxx.workers.dev`).
<img width="3452" height="1944" alt="image" src="https://github.com/user-attachments/assets/227cd5ce-324e-4a84-b83d-bd74b96a109f" />
<br><br>

2. Abre la **Configuración** de la extensión del navegador, pega la URL en **"URL del Endpoint"** y guarda.
   * ⚠️ **Importante**: Asegúrate de incluir `https://` al principio.
   * ⚠️ **Importante**: Introduce el mismo "ID de Sincronización" y "Contraseña" en todos los dispositivos que desees sincronizar.
<img width="3459" height="1888" alt="image" src="https://github.com/user-attachments/assets/f065fbfb-b3e7-4a72-b80b-1eca3e087e32" />
