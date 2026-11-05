window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('preloader-hide');
        setTimeout(() => {
            preloader.remove();
        }, 500);
    }
});

setTimeout(() => {
    const preloader = document.getElementById('preloader');
    if (preloader && !preloader.classList.contains('preloader-hide')) {
        preloader.classList.add('preloader-hide');
        setTimeout(() => preloader.remove(), 500);
    }
}, 5000);

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
            if (burgerBtn.querySelector('i')) {
                burgerBtn.querySelector('i').classList.remove('fa-xmark');
                burgerBtn.querySelector('i').classList.add('fa-bars');
            }
        });
    });
}

const PLACEHOLDER_IMG = 'assets/img/news/placeholder.webp';
window.addEventListener('error', function (e) {
    if (e.target.tagName && e.target.tagName.toLowerCase() === 'img') {
        if (e.target.src !== PLACEHOLDER_IMG && !e.target.classList.contains('real-symbol-img')) {
            e.target.src = PLACEHOLDER_IMG;
        }
    }
}, true);

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

    if (titleEl && descEl && imgEl) {
        imgEl.style.opacity = 0;
        setTimeout(() => {
            titleEl.textContent = newTitle;
            descEl.textContent = newDesc;
            imgEl.src = newImg;
            imgEl.style.opacity = 1;
        }, 300);
    }
}

document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', () => {
        if (navigator.vibrate) navigator.vibrate(40);
    });
});

const scrollBtn = document.getElementById('scrollTop');
if (scrollBtn) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollBtn.classList.add('show');
        } else {
            scrollBtn.classList.remove('show');
        }
    });

    scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}


let currentNewsSource = 'college';
let currentNewsCategory = 'all';
let newsSearchQuery = '';
let newsCurrentPage = 1;
const NEWS_PER_PAGE = 9;
let currentModalArticle = null;
let currentGalleryIndex = 0;
let currentGalleryList = [];

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function getSourceArticles(source) {
    if (typeof newsData === 'undefined') return [];
    return (newsData && newsData[source]) ? newsData[source] : [];
}

function getAllArticles() {
    if (typeof newsData === 'undefined') return [];
    return [...getSourceArticles('college'), ...getSourceArticles('city')];
}

function getFilteredNewsList() {
    const list = getSourceArticles(currentNewsSource);
    return list.filter(item => {
        if (currentNewsCategory !== 'all' && item.category !== currentNewsCategory) {
            return false;
        }
        if (newsSearchQuery) {
            const q = newsSearchQuery.toLowerCase();
            const inTitle = (item.title || '').toLowerCase().includes(q);
            const inText = (item.text || '').toLowerCase().includes(q);
            const inFull = (item.full_text || '').toLowerCase().includes(q);
            const inTag = (item.tag || '').toLowerCase().includes(q);
            const inDate = (item.date || '').toLowerCase().includes(q);
            if (!inTitle && !inText && !inFull && !inTag && !inDate) {
                return false;
            }
        }
        return true;
    });
}

function updateTabCounters() {
    const collegeCountEl = document.getElementById('college-count');
    const cityCountEl = document.getElementById('city-count');
    if (collegeCountEl) collegeCountEl.textContent = getSourceArticles('college').length;
    if (cityCountEl) cityCountEl.textContent = getSourceArticles('city').length;
}

function switchNewsSource(source) {
    currentNewsSource = source;
    newsCurrentPage = 1;
    document.querySelectorAll('.news-tab').forEach(tab => {
        if (tab.getAttribute('data-source') === source) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    renderNewsModern();
}

function switchNewsCategory(cat) {
    currentNewsCategory = cat;
    newsCurrentPage = 1;
    document.querySelectorAll('.cat-chip').forEach(chip => {
        if (chip.getAttribute('data-cat') === cat) {
            chip.classList.add('active');
        } else {
            chip.classList.remove('active');
        }
    });
    renderNewsModern();
}

function resetNewsFilters() {
    currentNewsCategory = 'all';
    newsSearchQuery = '';
    newsCurrentPage = 1;
    const searchInput = document.getElementById('news-search-input');
    const clearBtn = document.getElementById('news-search-clear');
    if (searchInput) searchInput.value = '';
    if (clearBtn) clearBtn.style.display = 'none';
    document.querySelectorAll('.cat-chip').forEach(chip => {
        chip.classList.toggle('active', chip.getAttribute('data-cat') === 'all');
    });
    renderNewsModern();
}

function createModernNewsCard(item) {
    const photoCount = (item.images && Array.isArray(item.images)) ? item.images.length : 1;
    const badgeHtml = photoCount > 1 
        ? `<span class="photo-album-badge"><i class="fa-solid fa-camera"></i> ${photoCount} фото</span>` 
        : '';
    const safeTitle = escapeHtml(item.title);
    const safeSnippet = escapeHtml(item.text);
    const categoryName = item.category || 'БРСМ';
    const tagColor = item.tagColor || 'var(--green)';

    return `
    <article class="news-card-modern" data-id="${item.id}">
        <div class="news-card-media" onclick="openArticle('${item.id}')">
            <img src="${item.image}" alt="${safeTitle}" loading="lazy" decoding="async">
            ${badgeHtml}
            <span class="news-card-category" style="background: ${tagColor}">${categoryName}</span>
        </div>
        <div class="news-card-body">
            <div class="news-card-meta">
                <span class="news-card-date"><i class="fa-regular fa-calendar"></i> ${item.date}</span>
                <span class="news-card-tag" style="color: ${tagColor}">${item.tag}</span>
            </div>
            <h3 class="news-card-title" onclick="openArticle('${item.id}')">${safeTitle}</h3>
            <p class="news-card-snippet">${safeSnippet}</p>
            <div class="news-card-actions">
                <button type="button" class="btn btn-primary read-full-btn" onclick="openArticle('${item.id}')">
                    <i class="fa-solid fa-book-open"></i> Читать статью
                </button>
                <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="card-tg-icon" title="Открыть в Telegram">
                    <i class="fa-brands fa-telegram"></i>
                </a>
            </div>
        </div>
    </article>`;
}

function renderNewsModern() {
    const grid = document.getElementById('news-grid-container');
    if (!grid) return;

    updateTabCounters();
    const filtered = getFilteredNewsList();
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / NEWS_PER_PAGE) || 1;

    if (newsCurrentPage > totalPages) newsCurrentPage = totalPages;
    if (newsCurrentPage < 1) newsCurrentPage = 1;

    const startIndex = (newsCurrentPage - 1) * NEWS_PER_PAGE;
    const endIndex = Math.min(startIndex + NEWS_PER_PAGE, totalItems);
    const pageItems = filtered.slice(startIndex, endIndex);

    const counterText = document.getElementById('news-counter-text');
    const resetBtn = document.getElementById('news-filter-reset');

    if (totalItems === 0) {
        if (counterText) counterText.textContent = 'Публикации не найдены';
        if (resetBtn) resetBtn.style.display = 'inline-flex';
        grid.innerHTML = `
            <div class="news-empty-state">
                <i class="fa-regular fa-newspaper"></i>
                <h3>Ничего не найдено</h3>
                <p>По вашему запросу не найдено публикаций. Попробуйте изменить параметры поиска или сбросить фильтры.</p>
                <button type="button" class="btn btn-primary" onclick="resetNewsFilters()">Сбросить фильтры</button>
            </div>
        `;
        renderPagination(0);
        return;
    }

    if (counterText) {
        counterText.textContent = `Показано ${startIndex + 1}–${endIndex} из ${totalItems} публикаций`;
    }

    const hasActiveFilters = (currentNewsCategory !== 'all') || (newsSearchQuery.trim() !== '');
    if (resetBtn) {
        resetBtn.style.display = hasActiveFilters ? 'inline-flex' : 'none';
    }

    grid.innerHTML = pageItems.map(createModernNewsCard).join('');
    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    const paginWrap = document.getElementById('news-pagination');
    if (!paginWrap) return;

    if (totalPages <= 1) {
        paginWrap.innerHTML = '';
        return;
    }

    let html = '';
    const prevDisabled = newsCurrentPage === 1 ? 'disabled' : '';
    html += `<button type="button" class="page-btn nav-btn" ${prevDisabled} onclick="goToNewsPage(${newsCurrentPage - 1})" aria-label="Предыдущая страница"><i class="fa-solid fa-chevron-left"></i></button>`;

    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (newsCurrentPage > 3) pages.push('...');
            const start = Math.max(2, newsCurrentPage - 1);
            const end = Math.min(totalPages - 1, newsCurrentPage + 1);
            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i);
            }
            if (newsCurrentPage < totalPages - 2) pages.push('...');
            if (!pages.includes(totalPages)) pages.push(totalPages);
        }
        return pages;
    };

    getPageNumbers().forEach(p => {
        if (p === '...') {
            html += `<span class="page-ellipsis">...</span>`;
        } else {
            const activeClass = p === newsCurrentPage ? 'active' : '';
            html += `<button type="button" class="page-btn ${activeClass}" onclick="goToNewsPage(${p})">${p}</button>`;
        }
    });

    const nextDisabled = newsCurrentPage === totalPages ? 'disabled' : '';
    html += `<button type="button" class="page-btn nav-btn" ${nextDisabled} onclick="goToNewsPage(${newsCurrentPage + 1})" aria-label="Следующая страница"><i class="fa-solid fa-chevron-right"></i></button>`;

    paginWrap.innerHTML = html;
}

function goToNewsPage(page) {
    const filtered = getFilteredNewsList();
    const totalPages = Math.ceil(filtered.length / NEWS_PER_PAGE) || 1;
    if (page < 1 || page > totalPages) return;
    newsCurrentPage = page;
    renderNewsModern();
    const newsSection = document.getElementById('news');
    if (newsSection) {
        const top = newsSection.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top, behavior: 'smooth' });
    }
}

function formatArticleBody(text) {
    if (!text) return '';
    const paragraphs = text.split(/\n\s*\n+/).filter(p => p.trim().length > 0);
    return paragraphs.map(p => {
        let clean = escapeHtml(p.trim());
        clean = clean.replace(/#([a-zA-Zа-яА-Я0-9_]+)/g, '<span class="article-hashtag">#$1</span>');
        clean = clean.replace(/(https?:\\/\\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
        return `<p>${clean}</p>`;
    }).join('');
}

function openArticle(id) {
    const all = getAllArticles();
    const article = all.find(item => item.id === id);
    if (!article) return;

    currentModalArticle = article;
    const modal = document.getElementById('newsReaderModal');
    if (!modal) return;

    const catBadge = document.getElementById('reader-modal-category');
    const sourceBadge = document.getElementById('reader-modal-tag');
    const dateBadge = document.getElementById('reader-modal-date');
    const titleEl = document.getElementById('reader-modal-title');
    const bodyEl = document.getElementById('reader-modal-body');
    const tgLink = document.getElementById('reader-modal-tg-link');

    if (catBadge) {
        catBadge.textContent = article.category || 'БРСМ';
        catBadge.style.background = article.tagColor || 'var(--green)';
    }
    if (sourceBadge) {
        sourceBadge.textContent = article.tag || '';
    }
    if (dateBadge) {
        dateBadge.textContent = article.date || '';
    }
    if (titleEl) {
        titleEl.textContent = article.title || '';
    }
    if (bodyEl) {
        const content = article.full_text || article.text || '';
        bodyEl.innerHTML = formatArticleBody(content);
    }
    if (tgLink) {
        tgLink.href = article.link || '#';
    }

    if (article.images && Array.isArray(article.images) && article.images.length > 0) {
        currentGalleryList = article.images;
    } else if (article.image) {
        currentGalleryList = [article.image];
    } else {
        currentGalleryList = [PLACEHOLDER_IMG];
    }
    currentGalleryIndex = 0;
    setupReaderGallery();
    updateReaderPagerButtons();

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    try {
        history.replaceState(null, '', `#news-${article.id}`);
    } catch (e) {}
}

function setupReaderGallery() {
    const stage = document.getElementById('reader-stage');
    const activeImg = document.getElementById('reader-active-img');
    const counterPill = document.getElementById('reader-counter-pill');
    const prevBtn = document.getElementById('reader-gallery-prev');
    const nextBtn = document.getElementById('reader-gallery-next');
    const thumbsContainer = document.getElementById('reader-thumbs');

    if (!activeImg || !stage) return;

    const total = currentGalleryList.length;
    activeImg.src = currentGalleryList[currentGalleryIndex];

    if (counterPill) {
        counterPill.textContent = `${currentGalleryIndex + 1} / ${total}`;
        counterPill.style.display = total > 1 ? 'block' : 'none';
    }

    if (prevBtn) prevBtn.style.display = total > 1 ? 'flex' : 'none';
    if (nextBtn) nextBtn.style.display = total > 1 ? 'flex' : 'none';

    if (thumbsContainer) {
        if (total <= 1) {
            thumbsContainer.innerHTML = '';
            thumbsContainer.style.display = 'none';
        } else {
            thumbsContainer.style.display = 'flex';
            thumbsContainer.innerHTML = currentGalleryList.map((url, idx) => `
                <div class="reader-thumb ${idx === currentGalleryIndex ? 'active' : ''}" onclick="selectGalleryPhoto(${idx})">
                    <img src="${url}" alt="Фото ${idx + 1}" loading="lazy">
                </div>
            `).join('');
        }
    }
}

function selectGalleryPhoto(idx) {
    if (idx < 0 || idx >= currentGalleryList.length) return;
    currentGalleryIndex = idx;
    const activeImg = document.getElementById('reader-active-img');
    const counterPill = document.getElementById('reader-counter-pill');
    if (activeImg) activeImg.src = currentGalleryList[currentGalleryIndex];
    if (counterPill) counterPill.textContent = `${currentGalleryIndex + 1} / ${currentGalleryList.length}`;
    document.querySelectorAll('.reader-thumb').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === currentGalleryIndex);
    });
}

function switchGalleryPhoto(step) {
    const total = currentGalleryList.length;
    if (total <= 1) return;
    let nextIdx = currentGalleryIndex + step;
    if (nextIdx < 0) nextIdx = total - 1;
    if (nextIdx >= total) nextIdx = 0;
    selectGalleryPhoto(nextIdx);
}

function updateReaderPagerButtons() {
    const prevBtn = document.getElementById('reader-prev-article');
    const nextBtn = document.getElementById('reader-next-article');
    if (!currentModalArticle) return;

    const list = getFilteredNewsList();
    const currIdx = list.findIndex(a => a.id === currentModalArticle.id);

    if (prevBtn) {
        if (currIdx > 0) {
            prevBtn.disabled = false;
            prevBtn.style.opacity = '1';
            prevBtn.onclick = () => openArticle(list[currIdx - 1].id);
        } else {
            prevBtn.disabled = true;
            prevBtn.style.opacity = '0.4';
            prevBtn.onclick = null;
        }
    }

    if (nextBtn) {
        if (currIdx >= 0 && currIdx < list.length - 1) {
            nextBtn.disabled = false;
            nextBtn.style.opacity = '1';
            nextBtn.onclick = () => openArticle(list[currIdx + 1].id);
        } else {
            nextBtn.disabled = true;
            nextBtn.style.opacity = '0.4';
            nextBtn.onclick = null;
        }
    }
}

function closeArticleModal() {
    const modal = document.getElementById('newsReaderModal');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    currentModalArticle = null;
    if (window.location.hash.startsWith('#news-')) {
        try {
            history.replaceState(null, '', window.location.pathname + window.location.search);
        } catch (e) {}
    }
}

function showToast(message) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'app-toast';
        toast.className = 'app-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

function initNewsHub() {
    updateTabCounters();
    renderNewsModern();

    const searchInput = document.getElementById('news-search-input');
    const clearBtn = document.getElementById('news-search-clear');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                newsSearchQuery = e.target.value.trim();
                newsCurrentPage = 1;
                if (clearBtn) clearBtn.style.display = newsSearchQuery ? 'flex' : 'none';
                renderNewsModern();
            }, 250);
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            clearBtn.style.display = 'none';
            newsSearchQuery = '';
            newsCurrentPage = 1;
            renderNewsModern();
        });
    }

    document.querySelectorAll('.cat-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const cat = chip.getAttribute('data-cat');
            switchNewsCategory(cat);
        });
    });

    const closeBtn = document.getElementById('reader-modal-close');
    const modal = document.getElementById('newsReaderModal');
    if (closeBtn) closeBtn.addEventListener('click', closeArticleModal);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeArticleModal();
        });
    }

    const prevGallery = document.getElementById('reader-gallery-prev');
    const nextGallery = document.getElementById('reader-gallery-next');
    if (prevGallery) prevGallery.addEventListener('click', () => switchGalleryPhoto(-1));
    if (nextGallery) nextGallery.addEventListener('click', () => switchGalleryPhoto(1));

    const shareBtn = document.getElementById('reader-share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            if (!currentModalArticle) return;
            const shareUrl = window.location.origin + window.location.pathname + '#news-' + currentModalArticle.id;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(shareUrl).then(() => {
                    showToast('Ссылка на статью скопирована в буфер обмена!');
                }).catch(() => {
                    showToast('Ссылка: ' + shareUrl);
                });
            } else {
                showToast('Ссылка: ' + shareUrl);
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        const m = document.getElementById('newsReaderModal');
        if (!m || !m.classList.contains('active')) return;
        if (e.key === 'Escape') {
            closeArticleModal();
        } else if (e.key === 'ArrowLeft') {
            if (currentGalleryList.length > 1) switchGalleryPhoto(-1);
        } else if (e.key === 'ArrowRight') {
            if (currentGalleryList.length > 1) switchGalleryPhoto(1);
        }
    });

    if (window.location.hash.startsWith('#news-')) {
        const id = window.location.hash.replace('#news-', '');
        setTimeout(() => {
            const all = getAllArticles();
            const target = all.find(a => a.id === id);
            if (target) {
                if (target.id.startsWith('pinskgk_')) {
                    switchNewsSource('city');
                } else {
                    switchNewsSource('college');
                }
                openArticle(id);
            }
        }, 100);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNewsHub);
} else {
    initNewsHub();
}


const lightbox = document.getElementById('lightbox');
if (lightbox) {
    const lightboxImg = document.querySelector('.lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');
    const galleryImages = document.querySelectorAll('.gallery-grid img');

    galleryImages.forEach(img => {
        img.addEventListener('click', () => {
            lightbox.classList.add('active');
            lightboxImg.src = img.src;
            document.body.style.overflow = 'hidden';
        });
    });

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => { lightboxImg.src = ''; }, 300);
    };

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
}

const joinModal = document.getElementById('joinModal');
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxLktyJpznQ7g1U9QhUKNrRGwZXkiLU44mHgmI_V9_eGFG5PqbTfDfTFOHzSmyOwzztAg/exec';

if (joinModal) {
    const openJoinBtns = document.querySelectorAll('.open-join');
    const closeJoinBtns = document.querySelectorAll('.close-join, .close-join-btn');
    const joinForm = document.getElementById('joinForm');
    const successMsg = document.getElementById('successMessage');

    openJoinBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            joinModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            if (joinForm) { joinForm.style.display = 'block'; joinForm.reset(); }
            if (successMsg) successMsg.style.display = 'none';
        });
    });

    const closeJoin = () => {
        joinModal.classList.remove('active');
        document.body.style.overflow = '';
    };

    closeJoinBtns.forEach(btn => btn.addEventListener('click', closeJoin));
    joinModal.addEventListener('click', (e) => { if (e.target === joinModal) closeJoin(); });

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
                    headers: { 'Content-Type': 'application/json' }
                });
                joinForm.style.display = 'none';
                successMsg.style.display = 'block';
            } catch (error) {
                console.error(error);
                alert('Ошибка отправки.');
            } finally {
                btn.disabled = false;
                btn.innerText = originalBtnText;
            }
        });
    }
}
