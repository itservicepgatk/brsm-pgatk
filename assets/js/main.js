// Меню (бургер)
const burgerBtn = document.querySelector('.burger-menu');
const navMenu = document.querySelector('.main-nav');

if (burgerBtn) {
    burgerBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        // меняем полоски на крестик
        const icon = burgerBtn.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
        } else {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        }
    });

    // закрываем если кликнули по ссылке
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            burgerBtn.querySelector('i').classList.remove('fa-xmark');
            burgerBtn.querySelector('i').classList.add('fa-bars');
        });
    });
}

// Заглушка (если битая картинка)
const PLACEHOLDER_IMG = 'https://placehold.co/600x800/EEE/D91D24?font=montserrat&text=БРСМ+ПГАТК';

window.addEventListener('error', function (e) {
    if (e.target.tagName.toLowerCase() === 'img') {
        // проверка чтобы не зациклилось
        if (e.target.src !== PLACEHOLDER_IMG && !e.target.classList.contains('real-symbol-img')) {
            e.target.src = PLACEHOLDER_IMG;
        }
    }
}, true);

// Логика табов (направления)
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

    // анимация исчезновения
    imgEl.style.opacity = 0;
    
    setTimeout(() => {
        titleEl.textContent = newTitle;
        descEl.textContent = newDesc;
        imgEl.src = newImg;
        imgEl.style.opacity = 1;
    }, 300);
}

// Вибрация (мобил)
document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', () => {
        // если браузер умеет вибрировать
        if (navigator.vibrate) {
            navigator.vibrate(40);
        }
    });
});

// Кнопка наверх
const scrollBtn = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
    // если прокрутили больше 300px - показывать
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

