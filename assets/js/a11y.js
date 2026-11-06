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

        updatePanelUI();
    }

    function updatePanelUI() {
        const panel = document.getElementById('a11y-panel');
        if (!panel) return;

        panel.querySelectorAll('[data-a11y-font]').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-a11y-font') === state.font);
        });

        panel.querySelectorAll('[data-a11y-scheme]').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-a11y-scheme') === state.scheme);
        });

        panel.querySelectorAll('[data-a11y-images]').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-a11y-images') === state.images);
        });

        panel.querySelectorAll('[data-a11y-spacing]').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-a11y-spacing') === state.spacing);
        });

        panel.querySelectorAll('[data-a11y-fontfam]').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-a11y-fontfam') === state.fontFamily);
        });
    }

    function toggleA11y(forceState) {
        if (typeof forceState === 'boolean') {
            state.active = forceState;
        } else {
            state.active = !state.active;
        }
        saveSettings(state);
        applyA11yClasses();
    }

    function setFont(val) {
        state.font = val;
        saveSettings(state);
        applyA11yClasses();
    }

    function setScheme(val) {
        state.scheme = val;
        saveSettings(state);
        applyA11yClasses();
    }

    function setImages(val) {
        state.images = val;
        saveSettings(state);
        applyA11yClasses();
    }

    function setSpacing(val) {
        state.spacing = val;
        saveSettings(state);
        applyA11yClasses();
    }

    function setFontFamily(val) {
        state.fontFamily = val;
        saveSettings(state);
        applyA11yClasses();
    }

    function resetA11y() {
        toggleA11y(false);
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
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
                btn.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span>Озвучить</span>';
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
                btn.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span>Озвучить</span>';
            }
        };

        utter.onerror = () => {
            isSpeaking = false;
            if (btn) {
                btn.classList.remove('speaking');
                btn.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span>Озвучить</span>';
            }
        };

        isSpeaking = true;
        if (btn) {
            btn.classList.add('speaking');
            btn.innerHTML = '<i class="fa-solid fa-stop"></i> <span>Стоп</span>';
        }
        synth.speak(utter);
    }

    function createA11yPanel() {
        if (document.getElementById('a11y-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'a11y-panel';
        panel.setAttribute('role', 'region');
        panel.setAttribute('aria-label', 'Панель настроек доступности для слабовидящих');

        panel.innerHTML = `
            <div class="a11y-panel-inner">
                <div class="a11y-groups-wrap">
                    <div class="a11y-group" role="group" aria-label="Размер шрифта">
                        <span class="a11y-group-title">Размер:</span>
                        <button type="button" class="a11y-opt-btn" data-a11y-font="1" aria-label="Стандартный размер шрифта">A</button>
                        <button type="button" class="a11y-opt-btn" data-a11y-font="2" aria-label="Увеличенный размер шрифта">A+</button>
                        <button type="button" class="a11y-opt-btn" data-a11y-font="3" aria-label="Максимальный размер шрифта">A++</button>
                    </div>

                    <div class="a11y-group" role="group" aria-label="Цветовая схема">
                        <span class="a11y-group-title">Цвета:</span>
                        <button type="button" class="a11y-opt-btn a11y-scheme-c1-btn" data-a11y-scheme="c1" title="Черным по белому" aria-label="Схема черным по белому">C</button>
                        <button type="button" class="a11y-opt-btn a11y-scheme-c2-btn" data-a11y-scheme="c2" title="Белым по черному" aria-label="Схема белым по черному">C</button>
                        <button type="button" class="a11y-opt-btn a11y-scheme-c3-btn" data-a11y-scheme="c3" title="Желтым по черному (СТБ 2105)" aria-label="Схема желтым по черному">C</button>
                        <button type="button" class="a11y-opt-btn a11y-scheme-c4-btn" data-a11y-scheme="c4" title="Синим по голубому" aria-label="Схема синим по голубому">C</button>
                    </div>

                    <div class="a11y-group" role="group" aria-label="Изображения">
                        <span class="a11y-group-title">Фото:</span>
                        <button type="button" class="a11y-opt-btn" data-a11y-images="on" aria-label="Включить изображения"><i class="fa-solid fa-image"></i></button>
                        <button type="button" class="a11y-opt-btn" data-a11y-images="off" aria-label="Отключить изображения"><i class="fa-solid fa-image-slash"></i></button>
                    </div>

                    <div class="a11y-group" role="group" aria-label="Интервал">
                        <span class="a11y-group-title">Интервал:</span>
                        <button type="button" class="a11y-opt-btn" data-a11y-spacing="normal" aria-label="Стандартный интервал">1x</button>
                        <button type="button" class="a11y-opt-btn" data-a11y-spacing="wide" aria-label="Увеличенный интервал">1.5x</button>
                    </div>

                    <div class="a11y-group" role="group" aria-label="Гарнитура шрифта">
                        <span class="a11y-group-title">Шрифт:</span>
                        <button type="button" class="a11y-opt-btn" data-a11y-fontfam="sans" aria-label="Шрифт без засечек">Sans</button>
                        <button type="button" class="a11y-opt-btn" data-a11y-fontfam="serif" aria-label="Шрифт с засечками">Serif</button>
                    </div>

                    <div class="a11y-group">
                        <button type="button" id="a11y-speak-btn" class="a11y-speech-btn" aria-label="Озвучить текст страницы"><i class="fa-solid fa-volume-high"></i> <span>Озвучить</span></button>
                    </div>
                </div>

                <div class="a11y-group">
                    <button type="button" class="a11y-close-btn" aria-label="Вернуться к обычной версии сайта"><i class="fa-solid fa-arrow-rotate-left"></i> <span>Обычная версия</span></button>
                </div>
            </div>
        `;

        document.body.prepend(panel);

        panel.querySelectorAll('[data-a11y-font]').forEach(b => {
            b.addEventListener('click', () => setFont(b.getAttribute('data-a11y-font')));
        });

        panel.querySelectorAll('[data-a11y-scheme]').forEach(b => {
            b.addEventListener('click', () => setScheme(b.getAttribute('data-a11y-scheme')));
        });

        panel.querySelectorAll('[data-a11y-images]').forEach(b => {
            b.addEventListener('click', () => setImages(b.getAttribute('data-a11y-images')));
        });

        panel.querySelectorAll('[data-a11y-spacing]').forEach(b => {
            b.addEventListener('click', () => setSpacing(b.getAttribute('data-a11y-spacing')));
        });

        panel.querySelectorAll('[data-a11y-fontfam]').forEach(b => {
            b.addEventListener('click', () => setFontFamily(b.getAttribute('data-a11y-fontfam')));
        });

        const speakBtn = panel.querySelector('#a11y-speak-btn');
        if (speakBtn) {
            speakBtn.addEventListener('click', speakText);
        }

        const closeBtn = panel.querySelector('.a11y-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', resetA11y);
        }

        updatePanelUI();
    }

    function setupToggleButtons() {
        const btns = document.querySelectorAll('.a11y-toggle-btn');
        if (btns.length === 0) {
            const floatBtn = document.createElement('button');
            floatBtn.type = 'button';
            floatBtn.className = 'a11y-toggle-btn a11y-floating-btn';
            floatBtn.setAttribute('aria-label', 'Версия для слабовидящих');
            floatBtn.setAttribute('title', 'Версия для слабовидящих (Alt+A)');
            floatBtn.innerHTML = '<i class="fa-solid fa-eye"></i> <span>Версия для слабовидящих</span>';
            document.body.appendChild(floatBtn);
            floatBtn.addEventListener('click', function (e) {
                e.preventDefault();
                toggleA11y();
            });
        } else {
            btns.forEach(btn => {
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    toggleA11y();
                });
            });
        }
    }

    function init() {
        applyA11yClasses();
        createA11yPanel();
        setupToggleButtons();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    document.addEventListener('keydown', (e) => {
        if (e.altKey && (e.key === 'a' || e.key === 'A' || e.key === 'ф' || e.key === 'Ф')) {
            e.preventDefault();
            toggleA11y();
        }
    });

    window.toggleA11yMode = toggleA11y;
})();
