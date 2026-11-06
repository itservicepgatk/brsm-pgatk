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
    "сила закона", "зимний патруль", "задело", "патриот", "волонтер"
]

spam = ["расписание", "замена", "изменения в", "педсовет"]

rubrics = [
    ("БСО", ["бсо", "студотряд", "студенческ", "трудовой семестр", "командир отряда", "боец отряда"]),
    ("Доброе Сердце", ["доброе сердце", "волонтер", "ярмарка.добра", "помощь пожилым", "благотворительн"]),
    ("МООП", ["мооп", "охрана порядка", "днд", "патрулирован", "правопорядок"]),
    ("100 идей", ["100 идей", "сто идей", "инновацион", "рационализатор"]),
    ("Королева Студенчества", ["королева студенчества", "грация"]),
    ("Сила Закона", ["сила закона", "правовая олимпиада"]),
    ("Зимний патруль", ["зимний патруль", "безопасность на льду"]),
    ("Властелин Села", ["властелин села"]),
    ("ЗаДело", ["задело", "за дело", "субботник", "чистый пинск", "посадка деревьев"]),
    ("Спорт", ["спорт", "зож", "турнир", "соревнования", "футбол", "волейбол", "эстафета"]),
    ("Патриотика", ["патриот", "день победы", "хатынь", "память", "великая отечественная", "ветеран"])
]

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

def detect_category(text):
    low = text.lower()
    for cat_name, terms in rubrics:
        if any(t in low for t in terms):
            return cat_name
    return "Молодежь"

def convert_and_save_webp(img_url, out_path):
    if not img_url or "placehold.co" in img_url:
        return False
    if os.path.exists(out_path) and os.path.getsize(out_path) > 1000:
        return True
    try:
        resp = requests.get(img_url, headers=headers, timeout=10)
        if resp.status_code == 200 and len(resp.content) > 500:
            pil_img = Image.open(io.BytesIO(resp.content))
            if pil_img.mode in ("RGBA", "LA", "P"):
                pil_img = pil_img.convert("RGB")
            if pil_img.width > 960:
                ratio = 960.0 / pil_img.width
                new_h = int(pil_img.height * ratio)
                pil_img = pil_img.resize((960, new_h), Image.Resampling.LANCZOS)
            pil_img.save(out_path, "WEBP", quality=78, method=4)
            return True
    except Exception:
        pass
    return False

def process_post_media(media_urls, conf_id, post_id):
    saved_paths = []
    for idx, url in enumerate(media_urls):
        suffix = "" if idx == 0 else f"_{idx}"
        filename = f"{conf_id}_{post_id}{suffix}.webp"
        rel_path = f"assets/img/news/{filename}"
        full_path = os.path.join(img_dir, filename)
        
        if os.path.exists(full_path) and os.path.getsize(full_path) > 1000:
            saved_paths.append(rel_path)
            continue
            
        ok = convert_and_save_webp(url, full_path)
        if ok:
            saved_paths.append(rel_path)

    if not saved_paths:
        saved_paths.append("assets/img/news/placeholder.webp")
    return saved_paths

def clean_tg_html(soup, soup_div):
    if not soup_div:
        return ""
    
    for tg_emoji in soup_div.find_all(['tg-emoji', 'i']):
        classes = tg_emoji.get('class', [])
        if 'emoji' in classes:
            style = tg_emoji.get('style', '')
            m = re.search(r'//telegram\.org/[^()\s\'\"]+', style)
            emoji_char = tg_emoji.get_text().strip()
            if m:
                img_url = 'https:' + m.group(0)
                new_tag = soup.new_tag('img')
                new_tag['src'] = img_url
                new_tag['alt'] = emoji_char
                new_tag['class'] = 'tg-custom-emoji'
                new_tag['loading'] = 'lazy'
                tg_emoji.replace_with(new_tag)
            else:
                tg_emoji.replace_with(emoji_char)

    for bq in soup_div.find_all('blockquote'):
        bq['class'] = 'tg-blockquote'

    for a in soup_div.find_all('a'):
        href = a.get('href', '')
        if href.startswith('?q='):
            tag_text = a.get_text().strip()
            span = soup.new_tag('span')
            span['class'] = 'tg-hashtag'
            span.string = tag_text
            a.replace_with(span)
        else:
            a['target'] = '_blank'
            a['rel'] = 'noopener noreferrer'
            if 'onclick' in a.attrs:
                del a['onclick']

    raw_html = "".join(str(c) for c in soup_div.contents).strip()
    raw_html = re.sub(r'[\r\n]+', ' ', raw_html)
    
    paragraphs = re.split(r'(?:<br\s*/?>\s*){2,}', raw_html)
    cleaned_paragraphs = []
    for p in paragraphs:
        p_clean = p.strip()
        if p_clean:
            if not p_clean.startswith('<blockquote'):
                p_clean = f"<p>{p_clean}</p>"
            cleaned_paragraphs.append(p_clean)

    return "\n".join(cleaned_paragraphs)

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
                
                post_num = ""
                try:
                    post_num = href.rstrip("/").split("/")[-1]
                except Exception:
                    pass
                if not post_num or not post_num.isdigit():
                    import hashlib
                    post_num = hashlib.md5(href.encode()).hexdigest()[:10]
                
                post_id = f"{conf['id']}_{post_num}"

                full_article = txt_div.get_text(separator='\n\n', strip=True) if txt_div else ""
                single_line = " ".join(full_article.split())
                desc = (single_line[:140] + '...') if len(single_line) > 140 else single_line
                
                head = single_line.split('.')[0]
                words = [w for w in head.split() if not w.startswith('#') and not w.startswith('http')]
                title = " ".join(words)
                if len(title) > 65: title = title[:65] + '...'
                if len(title) < 3: title = conf['def']

                category = detect_category(full_article)

                media_urls = []
                for p in i.find_all('a', class_='tgme_widget_message_photo_wrap'):
                    b = get_bg(p.get('style'))
                    if b and b not in media_urls: media_urls.append(b)

                for v in i.find_all(class_='tgme_widget_message_video_thumb'):
                    b = get_bg(v.get('style'))
                    if b and b not in media_urls: media_urls.append(b)

                grp = i.find('div', class_='tgme_widget_message_inline_media')
                if grp:
                    for a_el in grp.find_all('a', style=True):
                        b = get_bg(a_el.get('style'))
                        if b and b not in media_urls: media_urls.append(b)

                local_images = process_post_media(media_urls, conf['id'], post_num)
                cover_image = local_images[0]

                if not any(x['link'] == href for x in res):
                    res.append({
                        'id': post_id,
                        'category': category,
                        'title': title,
                        'text': desc,
                        'full_text': full_article,
                        'full_text_html': clean_tg_html(soup, txt_div) if txt_div else '',
                        'image': cover_image,
                        'images': local_images,
                        'link': href,
                        'date': dt.strftime("%d.%m.%Y"),
                        'tag': conf['tag'],
                        'tagColor': conf['col']
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

    js = f"""const newsData = {{
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
