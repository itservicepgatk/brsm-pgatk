// --- 1. БУРГЕР МЕНЮ ---
const burgerBtn = document.querySelector('.burger-menu');
const navMenu = document.querySelector('.main-nav');

if (burgerBtn) {
    burgerBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        
        const icon = burgerBtn.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
        } else {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            burgerBtn.querySelector('i').classList.remove('fa-xmark');
            burgerBtn.querySelector('i').classList.add('fa-bars');
        });
    });
}

// --- 2. ЗАГЛУШКА ДЛЯ КАРТИНОК ---
const PLACEHOLDER_IMG = 'https://placehold.co/600x800/EEE/D91D24?font=montserrat&text=БРСМ+ПГАТК';

window.addEventListener('error', function (e) {
    if (e.target.tagName.toLowerCase() === 'img') {
        if (e.target.src !== PLACEHOLDER_IMG && !e.target.classList.contains('real-symbol-img')) {
            e.target.src = PLACEHOLDER_IMG;
        }
    }
}, true);

// --- 3. ПЕРЕКЛЮЧЕНИЕ НАПРАВЛЕНИЙ (ТАБЫ) ---
function changeDirection(element) {
    const allItems = document.querySelectorAll('.dir-nav-item');
    allItems.forEach(item => item.classList.remove('active'));
    element.classList.add('active');

    const newTitle = element.getAttribute('data-title');
    const newDesc = element.getAttribute('data-desc');
    const newImg = element.getAttribute('data-img');

    const titleEl = document.getElementById('dir-dynamic-title');
    const descEl = document.getElementById('dir-dynamic-desc');
    const imgEl = document.getElementById('main-dir-image');

    imgEl.style.opacity = 0;
    
    setTimeout(() => {
        titleEl.textContent = newTitle;
        descEl.textContent = newDesc;
        imgEl.src = newImg;
        imgEl.style.opacity = 1;
    }, 300);
}

// --- 4. ВИБРАЦИЯ НА ТЕЛЕФОНЕ ---
document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', () => {
        if (navigator.vibrate) {
            navigator.vibrate(40);
        }
    });
});

// --- 5. КНОПКА СКРОЛЛА НАВЕРХ ---
const scrollBtn = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollBtn.classList.add('show');
    } else {
        scrollBtn.classList.remove('show');
    }
});

scrollBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// --- 6. ПЕРЕКЛЮЧЕНИЕ НОВОСТЕЙ ---
function switchNews(type) {
    const tabs = document.querySelectorAll('.news-tab');
    const grids = document.querySelectorAll('.news-grid');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    grids.forEach(grid => grid.classList.remove('active'));
    
    if (type === 'college') {
        tabs[0].classList.add('active');
        document.getElementById('news-college').classList.add('active');
    } else {
        tabs[1].classList.add('active');
        document.getElementById('news-city').classList.add('active');
    }
}

// --- 7. ГЕНЕРАТОР НОВОСТЕЙ ---
function renderNews() {
    const ITEMS_PER_PAGE = 6; 

    const createCard = (item) => {
        return `
        <div class="news-card">
            <div class="news-img">
                <!-- ДОБАВИЛ loading="lazy" ВОТ СЮДА 👇 -->
                <img src="${item.image}" loading="lazy" alt="News">
                
                <span class="news-tag" style="background: ${item.tagColor}">${item.tag}</span>
            </div>
            <div class="news-content">
                <div class="news-date-row">
                    <i class="fa-regular fa-calendar"></i> ${item.date}
                </div>
                <h3>${item.title}</h3>
                <p>${item.text}</p>
                <a href="${item.link}" target="_blank" class="btn btn-small">Читать в Telegram</a>
            </div>
        </div>
        `;
    };

    const renderCategory = (containerId, data) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!data || data.length === 0) {
            container.innerHTML = '<p style="text-align:center; width:100%;">Новостей пока нет</p>';
            return;
        }

        const visibleItems = data.slice(0, ITEMS_PER_PAGE).map(createCard).join('');
        
        let hiddenItems = '';
        if (data.length > ITEMS_PER_PAGE) {
            hiddenItems = `
                <div class="news-hidden-block" style="display: none; grid-column: 1 / -1; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 30px; width: 100%;">
                    ${data.slice(ITEMS_PER_PAGE).map(createCard).join('')}
                </div>
            `;
        }

        container.innerHTML = visibleItems + hiddenItems;

        if (data.length > ITEMS_PER_PAGE) {
            const btnWrap = document.createElement('div');
            btnWrap.className = 'load-more-wrap';
            btnWrap.style.width = '100%';
            btnWrap.style.gridColumn = '1 / -1';
            btnWrap.style.textAlign = 'center';
            btnWrap.style.marginTop = '20px';
            
            btnWrap.innerHTML = `<button class="btn btn-outline load-more-btn">Показать больше</button>`;
            
            container.appendChild(btnWrap);

            const btn = btnWrap.querySelector('button');
            const hiddenBlock = container.querySelector('.news-hidden-block');
            
            btn.addEventListener('click', () => {
                hiddenBlock.style.display = 'grid'; 
                btnWrap.style.display = 'none'; 
            });
        }
    };

    if (typeof newsData !== 'undefined') {
        renderCategory('news-college', newsData.college);
        renderCategory('news-city', newsData.city);
    }
}

document.addEventListener('DOMContentLoaded', renderNews);


// --- 8. ЛОГИКА ФОРМЫ "ВСТУПИТЬ" ---
const joinModal = document.getElementById('joinModal');
const openJoinBtns = document.querySelectorAll('.open-join');
const closeJoinBtns = document.querySelectorAll('.close-join, .close-join-btn');
const joinForm = document.getElementById('joinForm');
const successMsg = document.getElementById('successMessage');

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxLktyJpznQ7g1U9QhUKNrRGwZXkiLU44mHgmI_V9_eGFG5PqbTfDfTFOHzSmyOwzztAg/exec';

if (joinModal) {
    openJoinBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            joinModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            if(joinForm) {
                joinForm.style.display = 'block';
                joinForm.reset();
            }
            if(successMsg) successMsg.style.display = 'none';
        });
    });

    const closeJoin = () => {
        joinModal.classList.remove('active');
        document.body.style.overflow = '';
    };

    closeJoinBtns.forEach(btn => {
        btn.addEventListener('click', closeJoin);
    });

    joinModal.addEventListener('click', (e) => {
        if (e.target === joinModal) closeJoin();
    });

    if (joinForm) {
        joinForm.addEventListener('submit', async (e) => {
            e.preventDefault();

        
            const btn = joinForm.querySelector('button');
            const originalBtnText = btn.innerText;
            

            const formData = new FormData(joinForm);
            const data = {
                fio: formData.get('fio'),
                group: formData.get('group'),
                phone: formData.get('phone')
            };

            btn.disabled = true;
            btn.innerText = 'Отправка...';

            try {
                await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify(data),
                    mode: 'no-cors', 
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                joinForm.style.display = 'none';
                successMsg.style.display = 'block';

            } catch (error) {
                console.error(error);
                alert('Произошла ошибка при отправке. Пожалуйста, попробуйте позже.');
            } finally {
                btn.disabled = false;
                btn.innerText = originalBtnText;
            }
        });
    }
}

// --- 9. ЛАЙТБОКС (УВЕЛИЧЕНИЕ ФОТО) ---
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.querySelector('.lightbox-img');
const lightboxClose = document.querySelector('.lightbox-close');
const galleryImages = document.querySelectorAll('.gallery-grid img');

if (lightbox) {
    // Открытие фото
    galleryImages.forEach(img => {
        img.addEventListener('click', () => {
            lightbox.classList.add('active');
            lightboxImg.src = img.src;
            document.body.style.overflow = 'hidden'; // Блокируем прокрутку
        });
    });

    // Закрытие
    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => {
            lightboxImg.src = '';
        }, 300);
    };

    lightboxClose.addEventListener('click', closeLightbox);

    // Закрытие по клику на фон
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
}