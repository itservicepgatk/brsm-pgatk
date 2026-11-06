(function () {
    const STORAGE_KEY = 'a11y_settings_v1';

    const defaultSettings = {
        active: false,
        font: '1',
        scheme: 'c1',
        images: 'on',
        spacing: 'normal',
        fontFamily: 'sans'
    };

    function loadSettings() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? { ...defaultSettings, ...JSON.parse(raw) } : { ...defaultSettings };
        } catch (e) {
            return { ...defaultSettings };
        }
    }

    function saveSettings(s) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
        } catch (e) {}
    }

    let state = loadSettings();
    applyA11yClasses();

    function applyA11yClasses() {
        const root = document.documentElement;
        if (!state.active) {
            root.classList.remove(
                'a11y-active',
                'a11y-font-1', 'a11y-font-2', 'a11y-font-3',
                'a11y-scheme-c1', 'a11y-scheme-c2', 'a11y-scheme-c3', 'a11y-scheme-c4',
                'a11y-no-images', 'a11y-spacing-wide', 'a11y-font-serif'
            );
            updateSideTrigger();
            updateDrawerUI();
            return;
        }

        root.classList.add('a11y-active');

        root.classList.remove('a11y-font-1', 'a11y-font-2', 'a11y-font-3');
        root.classList.add('a11y-font-' + (state.font || '1'));

        root.classList.remove('a11y-scheme-c1', 'a11y-scheme-c2', 'a11y-scheme-c3', 'a11y-scheme-c4');
        root.classList.add('a11y-scheme-' + (state.scheme || 'c1'));

        if (state.images === 'off') {
            root.classList.add('a11y-no-images');
        } else {
            root.classList.remove('a11y-no-images');
        }

        if (state.spacing === 'wide') {
            root.classList.add('a11y-spacing-wide');
        } else {
            root.classList.remove('a11y-spacing-wide');
        }

        if (state.fontFamily === 'serif') {
            root.classList.add('a11y-font-serif');
        } else {
            root.classList.remove('a11y-font-serif');
        }

        updateSideTrigger();
        updateDrawerUI();
    }

    function updateSideTrigger() {
        const trigger = document.getElementById('a11y-side-trigger');
        if (!trigger) return;
        trigger.classList.toggle('active-mode', !!state.active);
    }

    function updateDrawerUI() {
        const drawer = document.getElementById('a11y-drawer');
        if (!drawer) return;

        drawer.querySelectorAll('[data-a11y-font]').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-a11y-font') === state.font);
        });

        drawer.querySelectorAll('[data-a11y-scheme]').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-a11y-scheme') === state.scheme);
        });

        drawer.querySelectorAll('[data-a11y-images]').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-a11y-images') === state.images);
        });

        drawer.querySelectorAll('[data-a11y-spacing]').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-a11y-spacing') === state.spacing);
        });

        drawer.querySelectorAll('[data-a11y-fontfam]').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-a11y-fontfam') === state.fontFamily);
        });

        const statusBadge = drawer.querySelector('.a11y-drawer-status');
        if (statusBadge) {
            statusBadge.textContent = state.active ? 'Режим доступности активен' : 'Обычный режим';
            statusBadge.classList.toggle('is-active', !!state.active);
        }
    }

    function setFont(val) {
        state.font = val;
        state.active = true;
        saveSettings(state);
        applyA11yClasses();
    }

    function setScheme(val) {
        state.scheme = val;
        state.active = true;
        saveSettings(state);
        applyA11yClasses();
    }

    function setImages(val) {
        state.images = val;
        state.active = true;
        saveSettings(state);
        applyA11yClasses();
    }

    function setSpacing(val) {
        state.spacing = val;
        state.active = true;
        saveSettings(state);
        applyA11yClasses();
    }

    function setFontFamily(val) {
        state.fontFamily = val;
        state.active = true;
        saveSettings(state);
        applyA11yClasses();
    }

    function resetA11y() {
        state.active = false;
        state.font = '1';
        state.scheme = 'c1';
        state.images = 'on';
        state.spacing = 'normal';
        state.fontFamily = 'sans';
        saveSettings(state);
        applyA11yClasses();
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        closeDrawer();
    }

    function openDrawer() {
        const drawer = document.getElementById('a11y-drawer');
        const backdrop = document.getElementById('a11y-backdrop');
        if (drawer) drawer.classList.add('open');
        if (backdrop) backdrop.classList.add('open');
        document.body.classList.add('a11y-drawer-opened');
    }

    function closeDrawer() {
        const drawer = document.getElementById('a11y-drawer');
        const backdrop = document.getElementById('a11y-backdrop');
        if (drawer) drawer.classList.remove('open');
        if (backdrop) backdrop.classList.remove('open');
        document.body.classList.remove('a11y-drawer-opened');
    }

    function toggleDrawer() {
        const drawer = document.getElementById('a11y-drawer');
        if (drawer && drawer.classList.contains('open')) {
            closeDrawer();
        } else {
            openDrawer();
        }
    }

    let isSpeaking = false;
    function speakText() {
        if (!('speechSynthesis' in window)) {
            alert('Синтез речи не поддерживается вашим браузером');
            return;
        }

        const synth = window.speechSynthesis;
        const btn = document.getElementById('a11y-speak-btn');

        if (isSpeaking) {
            synth.cancel();
            isSpeaking = false;
            if (btn) {
                btn.classList.remove('speaking');
                btn.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span>Озвучить текст</span>';
            }
            return;
        }

        let textToRead = window.getSelection().toString().trim();
        if (!textToRead) {
            const heading = document.querySelector('h1, h2');
            const intro = document.querySelector('p');
            textToRead = (heading ? heading.textContent : '') + '. ' + (intro ? intro.textContent : '');
        }

        if (!textToRead) {
            textToRead = 'Официальный сайт первичной организации ОО БРСМ колледжа имени Клещева.';
        }

        const utter = new SpeechSynthesisUtterance(textToRead);
        utter.lang = 'ru-RU';
        utter.rate = 0.95;

        utter.onend = () => {
            isSpeaking = false;
            if (btn) {
                btn.classList.remove('speaking');
                btn.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span>Озвучить текст</span>';
            }
        };

        utter.onerror = () => {
            isSpeaking = false;
            if (btn) {
                btn.classList.remove('speaking');
                btn.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span>Озвучить текст</span>';
            }
        };

        isSpeaking = true;
        if (btn) {
            btn.classList.add('speaking');
            btn.innerHTML = '<i class="fa-solid fa-stop"></i> <span>Остановить речь</span>';
        }
        synth.speak(utter);
    }

    function createA11yDOM() {
        if (document.getElementById('a11y-side-trigger')) return;

        const trigger = document.createElement('button');
        trigger.id = 'a11y-side-trigger';
        trigger.type = 'button';
        trigger.className = 'a11y-side-trigger';
        trigger.setAttribute('aria-label', 'Открыть меню версии для слабовидящих');
        trigger.setAttribute('title', 'Версия для слабовидящих (Alt+A)');
        trigger.innerHTML = `
            <span class="a11y-trigger-icon"><i class="fa-solid fa-eye"></i></span>
            <span class="a11y-trigger-text">Доступность</span>
        `;
        document.body.appendChild(trigger);

        const backdrop = document.createElement('div');
        backdrop.id = 'a11y-backdrop';
        backdrop.className = 'a11y-backdrop';
        document.body.appendChild(backdrop);

        const drawer = document.createElement('aside');
        drawer.id = 'a11y-drawer';
        drawer.className = 'a11y-drawer';
        drawer.setAttribute('role', 'dialog');
        drawer.setAttribute('aria-label', 'Панель доступности для слабовидящих');

        drawer.innerHTML = `
            <div class="a11y-drawer-header">
                <div class="a11y-drawer-title-box">
                    <i class="fa-solid fa-universal-access"></i>
                    <div>
                        <h2 class="a11y-drawer-heading">Доступность</h2>
                        <span class="a11y-drawer-sub">СТБ 2105-2012 / WCAG 2.1</span>
                    </div>
                </div>
                <button type="button" class="a11y-drawer-close" aria-label="Закрыть меню доступности">&times;</button>
            </div>

            <div class="a11y-drawer-status-bar">
                <span class="a11y-drawer-status">Обычный режим</span>
            </div>

            <div class="a11y-drawer-body">
                <div class="a11y-drawer-section">
                    <span class="a11y-section-label"><i class="fa-solid fa-text-height"></i> Размер шрифта:</span>
                    <div class="a11y-btn-row">
                        <button type="button" class="a11y-drawer-btn" data-a11y-font="1">A <span>Обычный</span></button>
                        <button type="button" class="a11y-drawer-btn" data-a11y-font="2">A+ <span>Средний</span></button>
                        <button type="button" class="a11y-drawer-btn" data-a11y-font="3">A++ <span>Крупный</span></button>
                    </div>
                </div>

                <div class="a11y-drawer-section">
                    <span class="a11y-section-label"><i class="fa-solid fa-palette"></i> Цветовая схема:</span>
                    <div class="a11y-scheme-grid">
                        <button type="button" class="a11y-drawer-btn scheme-c1" data-a11y-scheme="c1">
                            <span class="color-preview c1-preview">C</span>
                            <span>Черным по белому</span>
                        </button>
                        <button type="button" class="a11y-drawer-btn scheme-c2" data-a11y-scheme="c2">
                            <span class="color-preview c2-preview">C</span>
                            <span>Белым по черному</span>
                        </button>
                        <button type="button" class="a11y-drawer-btn scheme-c3" data-a11y-scheme="c3">
                            <span class="color-preview c3-preview">C</span>
                            <span>Желтым по черному</span>
                        </button>
                        <button type="button" class="a11y-drawer-btn scheme-c4" data-a11y-scheme="c4">
                            <span class="color-preview c4-preview">C</span>
                            <span>Синим по голубому</span>
                        </button>
                    </div>
                </div>

                <div class="a11y-drawer-section">
                    <span class="a11y-section-label"><i class="fa-solid fa-image"></i> Изображения:</span>
                    <div class="a11y-btn-row">
                        <button type="button" class="a11y-drawer-btn" data-a11y-images="on"><i class="fa-solid fa-image"></i> Включены</button>
                        <button type="button" class="a11y-drawer-btn" data-a11y-images="off"><i class="fa-solid fa-image-slash"></i> Отключены</button>
                    </div>
                </div>

                <div class="a11y-drawer-section">
                    <span class="a11y-section-label"><i class="fa-solid fa-arrows-left-right-to-line"></i> Интервал:</span>
                    <div class="a11y-btn-row">
                        <button type="button" class="a11y-drawer-btn" data-a11y-spacing="normal">1x Стандарт</button>
                        <button type="button" class="a11y-drawer-btn" data-a11y-spacing="wide">1.5x Большой</button>
                    </div>
                </div>

                <div class="a11y-drawer-section">
                    <span class="a11y-section-label"><i class="fa-solid fa-font"></i> Шрифт:</span>
                    <div class="a11y-btn-row">
                        <button type="button" class="a11y-drawer-btn" data-a11y-fontfam="sans">Sans (Без засечек)</button>
                        <button type="button" class="a11y-drawer-btn" data-a11y-fontfam="serif">Serif (С засечками)</button>
                    </div>
                </div>

                <div class="a11y-drawer-section">
                    <button type="button" id="a11y-speak-btn" class="a11y-action-btn speak-action"><i class="fa-solid fa-volume-high"></i> <span>Озвучить текст</span></button>
                </div>

                <div class="a11y-drawer-section">
                    <button type="button" class="a11y-action-btn reset-action"><i class="fa-solid fa-arrow-rotate-left"></i> <span>Вернуть обычную версию</span></button>
                </div>
            </div>
        `;

        document.body.appendChild(drawer);

        trigger.addEventListener('click', toggleDrawer);
        backdrop.addEventListener('click', closeDrawer);

        const closeBtn = drawer.querySelector('.a11y-drawer-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeDrawer);
        }

        drawer.querySelectorAll('[data-a11y-font]').forEach(b => {
            b.addEventListener('click', () => setFont(b.getAttribute('data-a11y-font')));
        });

        drawer.querySelectorAll('[data-a11y-scheme]').forEach(b => {
            b.addEventListener('click', () => setScheme(b.getAttribute('data-a11y-scheme')));
        });

        drawer.querySelectorAll('[data-a11y-images]').forEach(b => {
            b.addEventListener('click', () => setImages(b.getAttribute('data-a11y-images')));
        });

        drawer.querySelectorAll('[data-a11y-spacing]').forEach(b => {
            b.addEventListener('click', () => setSpacing(b.getAttribute('data-a11y-spacing')));
        });

        drawer.querySelectorAll('[data-a11y-fontfam]').forEach(b => {
            b.addEventListener('click', () => setFontFamily(b.getAttribute('data-a11y-fontfam')));
        });

        const speakBtn = drawer.querySelector('#a11y-speak-btn');
        if (speakBtn) {
            speakBtn.addEventListener('click', speakText);
        }

        const resetBtn = drawer.querySelector('.reset-action');
        if (resetBtn) {
            resetBtn.addEventListener('click', resetA11y);
        }

        document.querySelectorAll('.a11y-toggle-btn').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                openDrawer();
            });
        });

        updateSideTrigger();
        updateDrawerUI();
    }

    function init() {
        applyA11yClasses();
        createA11yDOM();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeDrawer();
        }
        if (e.altKey && (e.key === 'a' || e.key === 'A' || e.key === 'ф' || e.key === 'Ф')) {
            e.preventDefault();
            toggleDrawer();
        }
    });

    window.toggleA11yMode = toggleDrawer;
    window.openA11yDrawer = openDrawer;
    window.closeA11yDrawer = closeDrawer;
})();
