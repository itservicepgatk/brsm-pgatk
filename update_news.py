import requests
from bs4 import BeautifulSoup
from datetime import datetime
import time
import json
import re
import os
import io
from PIL import Image
from concurrent.futures import ThreadPoolExecutor

save_path = "assets/js/news-data.js"
img_dir = "assets/img/news"
os.makedirs(img_dir, exist_ok=True)
start_date = datetime(2025, 8, 1)
now = datetime.now()

keywords = [
    "брсм", "союз молодежи", "молодежный билет", "молодежного билета",
    "доброе сердце", "студотряд", "студенческ", "мооп",
    "100 идей", "властелин села", "королева студенчества", 
    "сила закона", "зимний патруль", "задело"
]

spam = ["расписание", "замена", "изменения в", "педсовет"]

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Referer': 'https://t.me/'
}

targets = [
    {'id': 'college', 'url': 'pgatkk', 'tag': '#ПГАТККЛЕЩЕВА', 'col': '#2C9342', 'def': 'Новости колледжа'},
    {'id': 'city', 'url': 'pinskgk', 'tag': 'ГК ОО БРСМ', 'col': '#D91D24', 'def': 'Новости города'}
]

def get_bg(s):
    if not s: return ""
    m = re.search(r"url\('?([^']+)'?\)", s)
    return m.group(1) if m else ""

def check_date(s):
    try:
        if not s: return None
        return datetime.fromisoformat(s).replace(tzinfo=None)
    except: return None

def process_image(img_url, conf_id, href):
    if not img_url or "placehold.co" in img_url:
        return "assets/img/news/placeholder.webp" if os.path.exists("assets/img/news/placeholder.webp") else img_url

    post_id = ""
    try:
        post_id = href.rstrip("/").split("/")[-1]
    except Exception:
        pass
    if not post_id or not post_id.isdigit():
        import hashlib
        post_id = hashlib.md5(href.encode()).hexdigest()[:10]

    filename = f"{conf_id}_{post_id}.webp"
    local_rel = f"assets/img/news/{filename}"
    local_full = os.path.join(img_dir, filename)

    if os.path.exists(local_full) and os.path.getsize(local_full) > 1000:
        return local_rel

    try:
        resp = requests.get(img_url, headers=headers, timeout=10)
        if resp.status_code == 200 and len(resp.content) > 500:
            pil_img = Image.open(io.BytesIO(resp.content))
            if pil_img.mode in ("RGBA", "LA", "P"):
                pil_img = pil_img.convert("RGB")
            if pil_img.width > 640:
                ratio = 640.0 / pil_img.width
                new_h = int(pil_img.height * ratio)
                pil_img = pil_img.resize((640, new_h), Image.Resampling.LANCZOS)
            pil_img.save(local_full, "WEBP", quality=75, method=4)
            return local_rel
    except Exception:
        pass

    return local_rel if (os.path.exists(local_full) and os.path.getsize(local_full) > 1000) else "assets/img/news/placeholder.webp"

def parser(conf):
    link_base = f"https://t.me/s/{conf['url']}"
    curr_url = link_base
    res = []
    last = -1
    
    print(f"Start: {conf['url']}")

    while True:
        try:
            r = requests.get(curr_url, headers=headers, timeout=10)
            if r.status_code != 200: break
            
            soup = BeautifulSoup(r.text, 'html.parser')
            items = soup.find_all('div', class_='tgme_widget_message_wrap')
            
            if not items: break
            
            ids = []
            for i in items:
                a = i.find('a', class_='tgme_widget_message_date')
                if a and a.get('href'):
                    try: ids.append(int(a['href'].split('/')[-1]))
                    except: pass

            for i in reversed(items):
                t_tag = i.find('time')
                if not t_tag: continue
                
                dt = check_date(t_tag.get('datetime'))
                if not dt: continue
                
                if dt > now: continue
                if dt < start_date:
                    print(f"Done {conf['url']}")
                    return res 

                txt_div = i.find('div', class_='tgme_widget_message_text')
                raw = txt_div.get_text().lower() if txt_div else ""
                
                if any(x in raw for x in spam): continue
                if not raw or not any(x in raw for x in keywords): continue

                lnk = i.find('a', class_='tgme_widget_message_date')
                href = lnk['href'] if lnk else "#"

                full = txt_div.get_text(separator=' ', strip=True)
                full = full.replace('"', '\\"').replace('\n', ' ')
                desc = (full[:130] + '...') if len(full) > 130 else full
                
                head = full.split('.')[0]
                words = [w for w in head.split() if not w.startswith('#') and not w.startswith('http')]
                title = " ".join(words)
                if len(title) > 50: title = title[:50] + '...'
                if len(title) < 3: title = conf['def']

                img = ""
                photo = i.find('a', class_='tgme_widget_message_photo_wrap')
                if photo: img = get_bg(photo.get('style'))
                
                if not img:
                    vid = i.find('div', class_='tgme_widget_message_video_thumb') or \
                          i.find('i', class_='tgme_widget_message_video_thumb')
                    if vid: img = get_bg(vid.get('style'))
                
                if not img:
                    grp = i.find('div', class_='tgme_widget_message_inline_media')
                    if grp:
                        first = grp.find('a', style=True)
                        if first: img = get_bg(first.get('style'))

                local_img = process_image(img, conf['id'], href)

                if not any(x['link'] == href for x in res):
                    res.append({
                        'image': local_img,
                        'tag': conf['tag'],
                        'tagColor': conf['col'],
                        'title': title,
                        'text': desc,
                        'link': href,
                        'date': dt.strftime("%d.%m.%Y")
                    })

            if not ids: break
            mn = min(ids)
            if mn == last: break
            last = mn
            
            curr_url = f"{link_base}?before={mn}"
            time.sleep(0.5)

        except Exception as e:
            print(f"Err {conf['url']}: {e}")
            break
            
    return res

if __name__ == "__main__":
    print("Working...")
    
    with ThreadPoolExecutor(max_workers=2) as pool:
        f1 = pool.submit(parser, targets[0])
        f2 = pool.submit(parser, targets[1])
        d1 = f1.result()
        d2 = f2.result()

    js = f"""// АВТОМАТИЧЕСКИ СГЕНЕРИРОВАНО
// {now.strftime("%Y-%m-%d %H:%M")} (WebP Mode)

const newsData = {{
    college: {json.dumps(d1, ensure_ascii=False, indent=4)},
    city: {json.dumps(d2, ensure_ascii=False, indent=4)}
}};
"""
    try:
        with open(save_path, "w", encoding="utf-8") as f:
            f.write(js)
        print(f"OK. College: {len(d1)}, City: {len(d2)}")
    except:
        print("Save error")
