# ☁️ Guia de Configuração do Servidor de Sincronização em Nuvem

Este guia explica como configurar a sincronização em nuvem para o **Advanced Search for X (Twitter) 🔍**, permitindo o uso em vários dispositivos.

Vamos guiá-lo na criação do seu próprio servidor de sincronização dedicado, usando **apenas uma conta Cloudflare** (o plano gratuito é suficiente).

Todo o processo pode ser concluído no navegador.<br><br>

## Pré-requisitos

* Crie uma conta na [Cloudflare](https://dash.cloudflare.com/sign-up) (apenas endereço de e-mail necessário).<br><br>


## Passo 1: Criar um Banco de Dados (D1)

Crie um banco de dados para armazenar seus dados.

1. Faça login no painel da Cloudflare e clique em **"Storage & Databases"** > **"D1 SQL Database"** na barra lateral esquerda.
2. Clique no botão **"Create"**.
<img width="3455" height="1908" alt="image" src="https://github.com/user-attachments/assets/e40247b2-8da5-4dea-b9dd-d4cc33cd73c6" />
<br><br>

3. Em **"Database name"**, digite `x-sync-db` (ou qualquer nome que preferir) e clique em **Create**.
<img width="3452" height="1766" alt="image" src="https://github.com/user-attachments/assets/18a00b76-beeb-4fba-9e47-025eaa90585e" />
<br><br>

4. Após a criação do banco de dados, clique na guia **Console**.
<img width="3448" height="1769" alt="image" src="https://github.com/user-attachments/assets/4e16b766-034d-4964-aab2-9002428626a3" />
<br><br>

5. Abra o arquivo SQL no link abaixo e **copie todo o seu conteúdo**.
   
   📄 **[Abrir schema.sql](./schema.sql)** 👈 Clique aqui!

6. Cole o código no editor da tela Console e clique no botão **Execute**.
<img width="3450" height="1856" alt="image" src="https://github.com/user-attachments/assets/8705d6eb-f266-478b-9bc1-f9563cd611a9" />
<br><br>

7. Se a mensagem "The query was executed successfully" aparecer, o processo foi bem-sucedido.
<img width="3454" height="1863" alt="image" src="https://github.com/user-attachments/assets/ea6c2f68-c98b-47e8-815f-2dbaec83e93b" />
<br><br>

## Passo 2: Criar um Worker

Crie o programa (Worker) que executará a lógica.

1. Clique em **"Compute (Workers)"** > **"Workers & Pages"** na barra lateral esquerda e depois em **"Create application"**.
<img width="3458" height="1901" alt="image" src="https://github.com/user-attachments/assets/3af4b8a0-5fb4-4555-a34d-e072900f3925" />
<br><br>

2. Clique em **"Create Worker"** (geralmente o modelo "Hello World").
<img width="3455" height="2031" alt="image" src="https://github.com/user-attachments/assets/78d2400f-377c-4282-a4a1-b323894fc656" />
<br><br>

3. Digite `my-x-sync` (ou um nome aleatório) como nome do Worker e clique em **Deploy**.
   * *Nota: Um script "Hello World" será implantado neste estágio, o que é normal.*
<img width="3459" height="2032" alt="image" src="https://github.com/user-attachments/assets/34f586db-6b9b-4d45-9184-bd294d248500" />
<br><br>

4. Na tela de conclusão da implantação, clique em **Edit code**.
<img width="3452" height="2020" alt="image" src="https://github.com/user-attachments/assets/86c2a75f-07ac-4185-a3fd-9caf0195138c" />
<br><br>

## Passo 3: Implantar o Código

Substitua o conteúdo do programa.

1. Abra o código do Worker no link abaixo e **copie todo o seu conteúdo**.

   📄 **[Abrir worker.js](./worker.js)** 👈 Clique aqui!

2. Apague o código existente no editor, **cole o código que acabou de copiar e clique em "Deploy" no canto superior direito**.
   * *Sucesso se a mensagem "Version saved" aparecer.*
<img width="3458" height="2014" alt="image" src="https://github.com/user-attachments/assets/79482c96-2333-4402-b698-dc219b7036e8" />
<br><br>

## Passo 4: Conectar o Banco de Dados (Importante)

Configure a conexão entre o Worker e o banco de dados. **Se pular esta etapa, ocorrerá um erro.**

1. Clique na seta "**←** (Voltar)" no canto superior esquerdo para retornar à tela de gerenciamento do Worker.
<img width="3450" height="2018" alt="image" src="https://github.com/user-attachments/assets/520856a4-627d-4d9c-add2-61c1be17f82a" />
<br><br>

2. Clique na guia **Settings** (ou Bindings), localize a seção **"Bindings"** e clique em **Add**.
<img width="3455" height="1937" alt="image" src="https://github.com/user-attachments/assets/96fcd7a2-667d-415d-bc1e-521f29651ba0" />
<br><br>

3. Selecione **D1 Database** e clique em **Add binding**.
<img width="3453" height="2026" alt="image" src="https://github.com/user-attachments/assets/d30341da-829c-4d47-9cec-41488bf04edf" />
<br><br>

4. Configure da seguinte forma:
   * **Variable name**: `DB`
     * ⚠️ **Importante**: Você deve digitar `DB` em letras maiúsculas. Caso contrário, não funcionará.
   * **D1 Database**: Selecione o banco de dados criado no Passo 1 (`x-sync-db` ou seu nome personalizado).
   * Clique em **Deploy** (ou Save).
<img width="3449" height="2031" alt="image" src="https://github.com/user-attachments/assets/bd859009-99ff-4970-a2ad-b224fb3a03f4" />
<br><br>

6. Se uma tela indicando que o vínculo foi adicionado aparecer, você teve sucesso.
<img width="3459" height="1912" alt="image" src="https://github.com/user-attachments/assets/fdb92c3e-0603-4321-b167-147984e0443e" />
<br><br>

## 🎉 Conclusão

Parabéns! A configuração está completa.

1. Volte para a tela principal de gerenciamento do Worker (guia Overview) e copie o URL exibido em **Preview** ou **Routes** (ex: `my-x-sync.xxxxx.workers.dev`).
<img width="3452" height="1944" alt="image" src="https://github.com/user-attachments/assets/227cd5ce-324e-4a84-b83d-bd74b96a109f" />
<br><br>

2. Abra as **Configurações** da extensão do navegador, cole o URL em **"URL do Endpoint"** e salve.
   * ⚠️ **Importante**: Certifique-se de incluir `https://` no início.
<img width="3459" height="1888" alt="image" src="https://github.com/user-attachments/assets/f065fbfb-b3e7-4a72-b80b-1eca3e087e32" />
