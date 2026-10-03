# Wonhyun Lee — Research Website

**Before the Water Rises** · Physics · Probability · AI · People

빌드 과정이 필요 없는 정적(static) 웹사이트입니다. **내용은 전부 `content/` 폴더의 `.yml` 텍스트 파일**에 들어 있어서, HTML을 몰라도 메모장이나 GitHub 웹 화면에서 바로 고칠 수 있습니다. GitHub Pages에 올리면 무료로 공개됩니다.

---

## 0. 폴더 구조

```
index.html            ← 페이지 뼈대 (보통 수정할 일 없음)
content/              ← ★ 여기만 고치면 됩니다
  profile.yml         이름·소개·연락처·핵심 숫자·링크·사진/영상 경로
  research.yml        연구 주제 4개(Physics/Probability/AI/People) + 'Beyond flooding' 카드
  publications.yml    논문 목록 (연도별 자동 정렬, 필터·검색 자동)
  projects.yml        연구 과제 (current / pending / past)
  news.yml            최근 소식
  people.yml          지도 학생, 협력 기관
  honors.yml          수상, 초청강연, 학술봉사, 언론, 툴박스
  gallery.yml         사진 갤러리 (학회·현장·연구실·일상)
assets/
  img/                사진·그림 (profile-portrait.jpg, profile.jpg 등)
  video/              hero-loop.mp4 (첫 화면 배경), research-overview.mp4 (2½분 소개 영상), ai-lsm.mp4
  cv/                 Wonhyun_Lee_CV.pdf  (공개용: 전화번호·추천인·보안인가 항목 삭제본)
  css/style.css       디자인 (색상은 맨 위 :root 변수)
  js/main.js          yml을 읽어 화면을 그리는 코드 (수정 불필요)
```

---

## 1. 웹에 공개하기 (GitHub Pages) — 처음 한 번만

### 1-1. 주소 정하기
GitHub Pages 개인 사이트 주소는 **`https://<GitHub아이디>.github.io/`** 입니다.

| 선택 | 결과 주소 | 비고 |
|---|---|---|
| **A. 기존 계정 `zprivf` 사용** | `https://zprivf.github.io/` | 연구실 사이트 `https://zprivf.github.io/applied-water-research-lab/` 는 그대로 유지됩니다 (서로 간섭 없음). |
| B. 새 계정 (예: `wonhyunlee`) | `https://wonhyunlee.github.io/` | 이름이 들어간 주소. 계정만 새로 만들면 됨. |
| C. 개인 도메인 (예: `wonhyunlee.com`) | `https://wonhyunlee.com` | 아래 6번 참고 (연 $10~15). |

> A를 고를 때: 이미 `zprivf.github.io` 라는 이름의 저장소가 있다면 그 저장소에 올리면 됩니다 (기존 내용이 있다면 백업 먼저).

### 1-2. 저장소 만들기
1. https://github.com 로그인 → 오른쪽 위 **+** → **New repository**
2. **Repository name** 에 정확히 `<아이디>.github.io` 입력 (예: `zprivf.github.io`)
3. **Public** 선택 → **Create repository**

### 1-3. 파일 올리기 (웹 브라우저만으로)
1. 새 저장소 화면에서 **uploading an existing file** 링크 클릭
2. 이 폴더 **안의 내용물 전체**(`index.html`, `content`, `assets`, `README.md`, `.nojekyll`)를 드래그해서 놓습니다.
   - ⚠️ 폴더 자체가 아니라 *안의 파일들*을 올려야 `index.html` 이 맨 위(root)에 위치합니다.
   - `.nojekyll` 은 숨김 파일이라 안 보일 수 있습니다. 없어도 동작하지만, 탐색기에서 "숨김 항목 표시"를 켜고 함께 올리는 것을 권장합니다.
3. 아래 **Commit changes** 클릭 (파일 크기가 커서 1~2분 걸릴 수 있음. 영상 15.5 MB → 웹 업로드 한도 25 MB 이내)

> 💡 파일이 많거나 자주 올릴 거라면 **GitHub Desktop**(https://desktop.github.com) 이 더 편합니다: *Clone repository* → 폴더에 파일 복사 → *Commit* → *Push origin*.

### 1-4. Pages 켜기
1. 저장소 **Settings** → 왼쪽 **Pages**
2. **Source: Deploy from a branch** → **Branch: `main`**, 폴더 **`/ (root)`** → **Save**
3. 1~3분 뒤 같은 화면 위쪽에 *"Your site is live at https://…github.io/"* 가 뜨면 완료 🎉
4. 진행 상황은 저장소 **Actions** 탭에서 볼 수 있습니다 (초록 체크 = 배포 완료).

### 1-5. 공유
- 주소를 이메일 서명, CV, 연구실 사이트, Google Scholar 프로필, LinkedIn에 넣으세요.
- 연구실 사이트(applied-water-research-lab)에도 이 개인 사이트 링크를 추가하면 서로 연결됩니다.

---

## 2. 내용 수정하기 (가장 많이 쓸 부분)

### 방법 ① GitHub 웹에서 바로 (설치 없음, 추천)
1. 저장소에서 `content/news.yml` 같은 파일 클릭
2. 오른쪽 위 **연필 아이콘(Edit this file)**
3. 수정 → **Commit changes…** → **Commit changes**
4. 1~2분 후 사이트 새로고침 (**Ctrl + F5** / Mac **Cmd + Shift + R**)

### 방법 ② 내 컴퓨터에서 고치고 미리보기
```bash
# 이 폴더에서 (Python 이 있으면)
python -m http.server 8000
# 브라우저에서 http://localhost:8000 열기
```
> `index.html` 을 더블클릭해서 열면(file://) 보안 정책 때문에 yml을 못 읽습니다 — 반드시 위처럼 서버로 여세요.
> VS Code 를 쓰신다면 *Live Server* 확장 → "Go Live" 도 같습니다.

### YAML 규칙 3가지 (이것만 지키면 오류 없음)
1. **들여쓰기는 스페이스 2칸** (Tab 금지). 같은 항목끼리 줄을 맞춥니다.
2. 목록 항목은 `- ` 로 시작합니다.
3. 문장은 `"큰따옴표"` 로 감싸세요 (특히 `:` 콜론이 들어갈 때). 문장 안에서 큰따옴표가 필요하면 `'작은따옴표'` 를 쓰세요.

본문 안에서 `**굵게**`, `*기울임*`, `[링크 글자](https://주소)` 를 쓸 수 있습니다.

> 오류가 있으면 사이트 하단에 **주황색 안내창**이 뜨고 *어느 파일, 몇 번째 줄*인지 알려줍니다.

### 자주 하는 수정 예시

**새 논문 추가** — `content/publications.yml` 의 `papers:` 바로 아래에 붙여넣기
```yaml
  - year: 2027
    type: journal            # journal | conference | submitted | report | thesis
    authors: "Lee, W., Yang, H. and Scanlon, B.R."
    title: "New paper title"
    venue: "Water Resources Research"
    details: "63, e2027WR0xxxxx"
    doi: "10.1029/2027WR0xxxxx"
    selected: true           # 대표 논문이면 true (★ 표시 + Selected 필터)
```
- 심사 중 논문이 게재되면 `type: submitted` → `journal` 로 바꾸고 `doi` 추가.
- 내 이름 굵게 표시는 파일 맨 위 `me:` 목록의 표기와 일치할 때 자동 적용됩니다.

**새 소식 추가** — `content/news.yml` 의 `news:` 바로 아래 (최신이 위)
```yaml
  - date: "2027-01"
    tag: paper               # award | paper | grant | talk | media | service
    text: "New paper in **Water Resources Research** with Hyunje Yang. [doi](https://doi.org/...)"
```
처음 6개만 보이고 나머지는 "Show all" 버튼으로 펼쳐집니다.

**숫자(통계) 갱신** — `content/profile.yml` → `stats:` 의 `value`, `label` 수정

**새 과제** — `content/projects.yml` 에 항목 추가, `status: current | pending | past`

**학생 추가/졸업** — `content/people.yml` → `mentees:` 항목 추가, 졸업하면 `current: false`

**연구 주제 그림 바꾸기** — `content/research.yml` 의 `media: src:` 경로, 추가 그림은 `gallery:` 에. 영상이면 `type: video`.

**Google Scholar / ORCID 버튼** — `content/profile.yml` → `links:` 아래 주석(`#`)을 지우고 주소 입력.

---

## 2-1. 사진 갤러리 (Gallery) 📷

학회·현장·연구실·일상 사진은 **Gallery** 섹션(어두운 배경, 카테고리 필터, 크게 보기/좌우 넘기기)에 나옵니다.
내용은 `content/gallery.yml`, 사진 파일은 `assets/img/gallery/` 에 있습니다. 사진이 하나도 없으면 섹션과 메뉴가 자동으로 숨겨집니다.

### 방법 A — 자동 (추천, 내 컴퓨터에서)
1. `ResearchWebsite/photo_inbox/` 안의 카테고리 폴더에 사진을 넣습니다.
   `Conferences` · `Fieldwork` · `Lab & Team` · `Everyday` (새 폴더를 만들면 새 카테고리가 됩니다)
2. `site` 폴더에서 터미널(Anaconda Prompt 등)을 열고 실행:
   ```bash
   python tools/add_photos.py
   # 장소를 한꺼번에 지정:  python tools/add_photos.py --place "New Orleans, LA"
   ```
   - 휴대폰 사진 회전 보정, 긴 변 1800px로 축소(보통 200~400 KB)
   - **EXIF 정보(촬영 위치 GPS 포함)를 지우고 저장** → 개인정보 보호
   - 촬영 날짜를 읽어 `gallery.yml` 에 자동 추가 (최신순 정렬)
   - 처리된 원본은 `photo_inbox/_done/` 으로 이동 (원본은 웹에 올라가지 않음)
3. `content/gallery.yml` 맨 아래 새 항목의 `title`, `caption`, `place` 를 다듬습니다.
4. 바뀐 파일(`assets/img/gallery/` 새 사진들 + `content/gallery.yml`)을 GitHub에 올립니다.

### 방법 B — GitHub 웹에서 직접
1. 사진을 미리 줄여 주세요 (긴 변 1600~2000px, 1 MB 이하 권장). ⚠️ 휴대폰 원본은 위치정보가 들어 있으니 방법 A를 권장합니다.
2. 저장소에서 `assets/img/gallery/` → *Add file → Upload files*
3. `content/gallery.yml` 의 `photos:` 아래에 추가:
```yaml
  - src: "assets/img/gallery/2025-12-agu.jpg"
    title: "AGU Fall Meeting 2025"
    caption: "Talk on Harvey & Beryl compound flooding"
    date: "2025-12"
    place: "New Orleans, LA"
    category: "Conferences"
```

- 카테고리 색/순서: `gallery.yml` 의 `categories:`
- 처음 보이는 장수: `show: 12` (나머지는 "Show more photos" 버튼)
- 사진 삭제: `gallery.yml` 에서 해당 항목을 지우고, 원하면 사진 파일도 삭제
- 💡 다른 사람이 나온 사진은 공개 전에 동의를 받는 것이 좋습니다.

---

## 3. 사진 · CV · 영상 교체

가장 쉬운 방법: **같은 파일명으로 덮어쓰기 업로드** (GitHub에서 해당 폴더로 이동 → *Add file → Upload files*).

| 바꿀 것 | 파일 | 권장 |
|---|---|---|
| 소개 사진(세로) | `assets/img/profile-portrait.jpg` | 4:5 비율, 폭 800px 정도, 300 KB 이하 |
| 연락처 동그라미 사진 | `assets/img/profile.jpg` | 정사각형 600×600 |
| CV | `assets/cv/Wonhyun_Lee_CV.pdf` | ⚠️ 공개용으로 **전화번호·추천인 연락처·보안인가** 정보를 지운 PDF 사용 |
| 첫 화면 배경 영상 | `assets/video/hero-loop.mp4` | 5~15초, 음소거, 2 MB 이하 |
| 2½분 소개 영상 | `assets/video/research-overview.mp4` | 25 MB 이하 (웹 업로드 한도) |

파일명을 바꾸고 싶다면 `content/profile.yml` 의 `media:` / `contact: cv:` 경로도 같이 바꿔주세요.

### 소개 영상을 YouTube로 (추천: 더 빠르고 고화질)
1. YouTube에 영상 업로드 (공개 또는 '일부 공개')
2. 주소 `https://youtu.be/AbCdEf12345` 의 마지막 부분이 ID
3. `content/profile.yml` → `overview_youtube: "AbCdEf12345"` 입력 → 자동으로 YouTube 플레이어로 바뀝니다.

---

## 4. 색상 · 디자인

- 네 기둥 색: `content/profile.yml` → `pillars:` 의 `color` (사이트 전체 강조색에 반영)
- 그 외 색/글꼴: `assets/css/style.css` 맨 위 `:root { … }` 변수
- 섹션 순서/제목을 바꾸려면 `index.html` 의 해당 `<section>` 블록을 통째로 옮기거나 제목 문구를 수정

---

## 5. 업데이트 체크리스트 (학기마다 5분)
- [ ] `news.yml` 새 소식 2~3개
- [ ] `publications.yml` 게재 확정 논문 → `journal` + DOI
- [ ] `profile.yml` 숫자(stats)
- [ ] `projects.yml` 새 과제 / 종료 과제 → `past`
- [ ] CV PDF 교체 (공개용 버전) + `cv_updated` 연도

---

## 6. 개인 도메인 연결 (선택)
1. 도메인 구입 (Cloudflare, Namecheap 등)
2. DNS에 GitHub Pages 주소 등록
   - 루트 도메인: `A` 레코드 4개 → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `www`: `CNAME` → `<아이디>.github.io`
3. 저장소 **Settings → Pages → Custom domain** 에 도메인 입력 → **Enforce HTTPS** 체크

---

## 7. 문제 해결
| 증상 | 해결 |
|---|---|
| 404 페이지 | 저장소 이름이 정확히 `<아이디>.github.io` 인지, `index.html` 이 최상위에 있는지 확인. Pages 설정의 branch가 `main` / `(root)` 인지 확인. |
| 수정했는데 안 바뀜 | 1~3분 대기 후 **Ctrl+F5**. Actions 탭에서 배포 완료(초록 체크) 확인. |
| 주황색 오류창 | 안내된 파일·줄 번호에서 들여쓰기/따옴표 확인. |
| 내 컴퓨터에서 내용이 비어 보임 | `index.html` 더블클릭 대신 `python -m http.server` 로 열기. |
| 영상이 안 올라감 | 웹 업로드 25 MB 제한 → YouTube 사용 또는 GitHub Desktop 사용 (파일당 100 MB 제한). |

---

## English (short)
Static site, no build step. All content lives in `content/*.yml`; `assets/js/main.js` renders it.
**Preview:** `python -m http.server 8000` → http://localhost:8000.
**Publish:** create a public repo named `<username>.github.io`, upload the *contents* of this folder, then *Settings → Pages → Deploy from branch → main / (root)*.
**Edit:** open any `content/*.yml` on github.com → pencil icon → commit; the site updates in 1–2 minutes. YAML errors are shown in an orange banner with file and line number.
Libraries: js-yaml 4.1.0 (bundled locally, MIT). Fonts: Google Fonts (Fraunces, Inter, JetBrains Mono).
