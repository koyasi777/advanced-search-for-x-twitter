# ☁️ 클라우드 동기화 서버 설정 가이드

이 가이드에서는 **Advanced Search for X (Twitter) 🔍**의 클라우드 동기화 기능을 설정하여 여러 기기에서 데이터를 동기화하는 방법을 설명합니다.

**Cloudflare 계정만으로** (무료 플랜으로 충분) 나만의 전용 동기화 서버를 구축하는 절차를 안내합니다.

모든 과정은 브라우저 상에서 완료할 수 있습니다.<br><br>

## 사전 준비

* [Cloudflare](https://dash.cloudflare.com/sign-up) 계정을 생성하세요 (이메일 주소만 있으면 가능).<br><br>


## Step 1: 데이터베이스 (D1) 생성

데이터 저장소가 될 데이터베이스를 생성합니다.

1. Cloudflare 대시보드에 로그인하고 왼쪽 사이드바에서 **"Storage & Databases" (스토리지 및 데이터베이스)** > **"D1 SQL Database"**를 클릭합니다.
2. **"Create" (생성)** 버튼을 클릭합니다.
<img width="3455" height="1908" alt="image" src="https://github.com/user-attachments/assets/e40247b2-8da5-4dea-b9dd-d4cc33cd73c6" />
<br><br>

3. "Name" (이름)에 `x-sync-db` (또는 원하는 이름)를 입력하고 **Create (생성)**을 클릭합니다.
<img width="3452" height="1766" alt="image" src="https://github.com/user-attachments/assets/18a00b76-beeb-4fba-9e47-025eaa90585e" />
<br><br>

4. 데이터베이스가 생성되면 **Console (콘솔)** 탭을 클릭합니다.
<img width="3448" height="1769" alt="image" src="https://github.com/user-attachments/assets/4e16b766-034d-4964-aab2-9002428626a3" />
<br><br>

5. 아래 링크에서 SQL 파일을 열고, **내용을 모두 복사**하세요.
   
   📄 **[schema.sql 열기](./schema.sql)** 👈 Click here!

6. 콘솔 화면의 에디터 부분에 코드를 붙여넣고 **Execute (실행)** 버튼을 클릭합니다.
<img width="3450" height="1856" alt="image" src="https://github.com/user-attachments/assets/8705d6eb-f266-478b-9bc1-f9563cd611a9" />
<br><br>

7. "The query was executed successfully" (쿼리가 성공적으로 실행되었습니다)라고 표시되면 성공입니다.
<img width="3454" height="1863" alt="image" src="https://github.com/user-attachments/assets/ea6c2f68-c98b-47e8-815f-2dbaec83e93b" />
<br><br>

## Step 2: Worker 생성

실제로 동작할 프로그램(Worker)을 생성합니다.

1. 왼쪽 사이드바의 **"Compute (Workers)"** > **"Workers & Pages"**를 클릭하고, **"Create application" (애플리케이션 생성)**을 클릭합니다.
<img width="3458" height="1901" alt="image" src="https://github.com/user-attachments/assets/3af4b8a0-5fb4-4555-a34d-e072900f3925" />
<br><br>

2. **"Create Worker"** (보통 Hello World 템플릿으로 표시됨)를 클릭합니다.
<img width="3455" height="2031" alt="image" src="https://github.com/user-attachments/assets/78d2400f-377c-4282-a4a1-b323894fc656" />
<br><br>

3. Worker name에 `my-x-sync` (또는 원하는 이름이나 랜덤 문자열)를 입력하고 **Deploy (배포)**를 클릭합니다.
   * *참고: 이 시점에서는 "Hello World"가 배포되지만 문제없습니다.*
<img width="3459" height="2032" alt="image" src="https://github.com/user-attachments/assets/34f586db-6b9b-4d45-9184-bd294d248500" />
<br><br>

4. 배포 완료 화면에서 **Edit code (코드 편집)**를 클릭합니다.
<img width="3452" height="2020" alt="image" src="https://github.com/user-attachments/assets/86c2a75f-07ac-4185-a3fd-9caf0195138c" />
<br><br>

## Step 3: 코드 배포

프로그램 내용을 덮어씁니다.

1. 아래 링크에서 Worker 코드를 열고, **내용을 모두 복사**하세요.

   📄 **[worker.js 열기](./worker.js)** 👈 Click here!

2. 에디터에 표시된 기존 코드를 삭제하고, **복사한 코드를 붙여넣은 뒤 화면 오른쪽 상단의 "Deploy" (배포)를 클릭**합니다.
   * *참고: "Version saved" (버전이 저장됨) 메시지가 나오면 성공입니다.*
<img width="3458" height="2014" alt="image" src="https://github.com/user-attachments/assets/79482c96-2333-4402-b698-dc219b7036e8" />
<br><br>

## Step 4: 데이터베이스 연결 (중요)

Worker와 데이터베이스를 연결하는 설정입니다. **이 과정을 건너뛰면 에러가 발생합니다.**

1. 화면 왼쪽 상단의 "**←** (뒤로 가기 화살표)"를 클릭하여 Worker 관리 화면으로 돌아옵니다.
<img width="3450" height="2018" alt="image" src="https://github.com/user-attachments/assets/520856a4-627d-4d9c-add2-61c1be17f82a" />
<br><br>

2. 상단 탭의 **Settings (설정)** (또는 Bindings)을 클릭하고, **"Bindings" (바인딩)** 항목을 찾아 **Add (추가)**를 클릭합니다.
<img width="3455" height="1937" alt="image" src="https://github.com/user-attachments/assets/96fcd7a2-667d-415d-bc1e-521f29651ba0" />
<br><br>

3. **D1 Database**를 선택하고, **Add binding**을 클릭합니다.
<img width="3453" height="2026" alt="image" src="https://github.com/user-attachments/assets/d30341da-829c-4d47-9cec-41488bf04edf" />
<br><br>

4. 다음과 같이 설정합니다:
   * **Variable name (변수명)**: `DB`
     * ⚠️ **중요**: 반드시 대문자 `DB`로 입력해야 합니다. 이외의 이름은 작동하지 않습니다.
   * **D1 Database**: Step 1에서 생성한 데이터베이스(`x-sync-db` 또는 본인이 설정한 이름)를 선택합니다.
   * **Deploy** (또는 Save)를 클릭합니다.
<img width="3449" height="2031" alt="image" src="https://github.com/user-attachments/assets/bd859009-99ff-4970-a2ad-b224fb3a03f4" />
<br><br>

6. 바인딩이 추가되었다는 화면이 표시되면 성공입니다.
<img width="3459" height="1912" alt="image" src="https://github.com/user-attachments/assets/fdb92c3e-0603-4321-b167-147984e0443e" />
<br><br>

## 🎉 완료

수고하셨습니다! 구축이 완료되었습니다.

1. Worker 관리 화면의 메인(Overview 탭)으로 돌아가, 오른쪽의 **Preview** 또는 **Routes**에 표시된 URL(예: `my-x-sync.xxxxx.workers.dev`)을 복사합니다.
<img width="3452" height="1944" alt="image" src="https://github.com/user-attachments/assets/227cd5ce-324e-4a84-b83d-bd74b96a109f" />
<br><br>

2. 확장 기능의 설정 화면을 열고 **"엔드포인트 URL" (Endpoint URL)**에 붙여넣고 저장하세요.
   * ⚠️ **중요**: 반드시 맨 앞에 `https://`를 붙여야 합니다. 붙이지 않으면 에러가 발생합니다.
   * ⚠️ **중요**: 동기화하려는 모든 기기에 동일한 "동기화 ID"와 "비밀번호"를 입력하세요.
<img width="3459" height="1888" alt="image" src="https://github.com/user-attachments/assets/f065fbfb-b3e7-4a72-b80b-1eca3e087e32" />
