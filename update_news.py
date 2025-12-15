import requests
from bs4 import BeautifulSoup
from datetime import datetime
import time
import json
import re
from concurrent.futures import ThreadPoolExecutor

# Настройки
save_path = "assets/js/news-data.js"
start_date = datetime(2025, 8, 1)
now = datetime.now()

# ФИЛЬТРЫ (Жесткие - только брендовые слова)
# Если этих слов нет в тексте, новость не попадет на сайт
keywords = [
    "брсм", "союз молодежи", "молодежный билет", "молодежного билета",
    "доброе сердце", "студотряд", "студенческ", "мооп",
    "100 идей", "властелин села", "королева студенчества", 
    "сила закона", "зимний патруль", "задело"
]

# Мусор, который точно не нужен
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
            
            # ID для пагинации
            ids = []
            for i in items:
                a = i.find('a', class_='tgme_widget_message_date')
                if a and a.get('href'):
                    try: ids.append(int(a['href'].split('/')[-1]))
                    except: pass

            # Парсинг
            for i in reversed(items):
                t_tag = i.find('time')
                if not t_tag: continue
                
                dt = check_date(t_tag.get('datetime'))
                if not dt: continue
                
                if dt > now: continue
                if dt < start_date:
                    print(f"Done {conf['url']}")
                    return res 

                # Текст
                txt_div = i.find('div', class_='tgme_widget_message_text')
                raw = txt_div.get_text().lower() if txt_div else ""
                
                # 1. Проверка на спам
                if any(x in raw for x in spam): continue
                
                # 2. ЖЕСТКАЯ ПРОВЕРКА БРСМ
                if not raw or not any(x in raw for x in keywords): continue

                # Ссылка
                lnk = i.find('a', class_='tgme_widget_message_date')
                href = lnk['href'] if lnk else "#"

                # Заголовок
                full = txt_div.get_text(separator=' ', strip=True)
                full = full.replace('"', '\\"').replace('\n', ' ')
                desc = (full[:130] + '...') if len(full) > 130 else full
                
                head = full.split('.')[0]
                words = [w for w in head.split() if not w.startswith('#') and not w.startswith('http')]
                title = " ".join(words)
                if len(title) > 50: title = title[:50] + '...'
                if len(title) < 3: title = conf['def']

                # Картинка (Smart search)
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

                if not img:
                    img = "https://placehold.co/600x400/EEE/333?text=БРСМ"

                # Сохраняем
                if not any(x['link'] == href for x in res):
                    res.append({
                        'image': img,
                        'tag': conf['tag'],
                        'tagColor': conf['col'],
                        'title': title,
                        'text': desc,
                        'link': href,
                        'date': dt.strftime("%d.%m.%Y")
                    })

            # Листаем назад
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

    js = f"""
// АВТОМАТИЧЕСКИ СГЕНЕРИРОВАНО
// {now.strftime("%Y-%m-%d %H:%M")}

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
