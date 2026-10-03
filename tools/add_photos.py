"""
add_photos.py — 사진을 갤러리에 자동 추가합니다.

사용법 (site 폴더에서):
    python tools/add_photos.py                    # ../photo_inbox 를 읽음
    python tools/add_photos.py D:/photos/AGU2025 --category Conferences --place "New Orleans, LA"

동작:
  * photo_inbox/<카테고리>/ 안의 jpg/jpeg/png/webp(/heic*) 사진을 읽어
  * 회전 보정, 긴 변 1800px로 축소, EXIF(위치정보 GPS 포함) 제거 후
  * assets/img/gallery/<YYYY-MM>-<파일이름>.jpg 로 저장하고
  * content/gallery.yml 의 photos: 목록 끝에 항목을 추가합니다.
  * 처리한 원본은 photo_inbox/_done/ 으로 옮깁니다 (원본은 웹에 올라가지 않음).
  (*HEIC 는  pip install pillow-heif  설치 시 지원)
필요: Python 3 + Pillow (pip install pillow)
"""
import argparse, datetime, json, re, shutil, sys
from pathlib import Path
from PIL import Image, ImageOps

try:
    import pillow_heif; pillow_heif.register_heif_opener()
except Exception:
    pass

SITE = Path(__file__).resolve().parents[1]
OUT_DIR = SITE / 'assets' / 'img' / 'gallery'
YML = SITE / 'content' / 'gallery.yml'
EXTS = {'.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'}

def slug(s):
    s = re.sub(r'[^\w\s-]', '', s, flags=re.UNICODE).strip().lower()
    return re.sub(r'[\s_]+', '-', s)[:60] or 'photo'

def taken_date(im, path):
    try:
        ex = im.getexif()
        v = ex.get_ifd(0x8769).get(36867) or ex.get(306)  # DateTimeOriginal / DateTime
        if v: return datetime.datetime.strptime(str(v)[:19], '%Y:%m:%d %H:%M:%S').date()
    except Exception:
        pass
    return datetime.date.fromtimestamp(path.stat().st_mtime)

def q(s): return json.dumps(s, ensure_ascii=False)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('inbox', nargs='?', default=str(SITE.parent / 'photo_inbox'))
    ap.add_argument('--category', help='카테고리 강제 지정 (기본: 하위 폴더 이름)')
    ap.add_argument('--place', default='')
    ap.add_argument('--max', type=int, default=1800, help='긴 변 최대 픽셀')
    ap.add_argument('--keep', action='store_true', help='원본을 _done 으로 옮기지 않음')
    a = ap.parse_args()
    inbox = Path(a.inbox)
    if not inbox.exists(): sys.exit(f'폴더가 없습니다: {inbox}')
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    files = sorted(p for p in inbox.rglob('*') if p.suffix.lower() in EXTS and '_done' not in p.parts)
    if not files: print('추가할 사진이 없습니다:', inbox); return
    entries = []
    for p in files:
        try:
            im = Image.open(p)
        except Exception as e:
            print('  건너뜀 (열 수 없음):', p.name, e); continue
        d = taken_date(im, p)
        im = ImageOps.exif_transpose(im).convert('RGB')
        im.thumbnail((a.max, a.max), Image.LANCZOS)
        name = f'{d:%Y-%m}-{slug(p.stem)}.jpg'; out = OUT_DIR / name; k = 2
        while out.exists(): out = OUT_DIR / f'{d:%Y-%m}-{slug(p.stem)}-{k}.jpg'; k += 1
        im.save(out, 'JPEG', quality=82, optimize=True, progressive=True)  # EXIF/GPS 저장 안 함
        rel = p.relative_to(inbox)
        cat = a.category or (rel.parts[0] if len(rel.parts) > 1 else 'Everyday')
        title = re.sub(r'[_-]+', ' ', p.stem).strip()
        entries.append((f'{d:%Y-%m-%d}', out, title, cat))
        print(f'  + {out.relative_to(SITE)}  ({im.width}x{im.height}, {out.stat().st_size // 1024} KB, {cat})')
        if not a.keep:
            dst = inbox / '_done' / rel; dst.parent.mkdir(parents=True, exist_ok=True); shutil.move(str(p), str(dst))
    txt = YML.read_text(encoding='utf-8') if YML.exists() else 'photos:\n'
    if not txt.endswith('\n'): txt += '\n'
    for date, out, title, cat in entries:
        txt += (f'  - src: {q(out.relative_to(SITE).as_posix())}\n'
                f'    title: {q(title)}\n'
                f'    caption: ""\n'
                f'    date: {q(date)}\n'
                f'    place: {q(a.place)}\n'
                f'    category: {q(cat)}\n')
    YML.write_text(txt, encoding='utf-8')
    print(f'\n{len(entries)}장 추가 완료 → content/gallery.yml 에서 title / caption / place 를 다듬으세요.')

if __name__ == '__main__':
    main()
