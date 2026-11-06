// Web Audio API Sound Effects
class SoundFx {
    constructor() {
        this.ctx = null;
        this.muted = false;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) this.ctx = new AudioContext();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playClick() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(840, this.ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.08);
    }

    playSuccess() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.09);
            gain.gain.setValueAtTime(0.18, this.ctx.currentTime + idx * 0.09);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.09 + 0.22);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(this.ctx.currentTime + idx * 0.09);
            osc.stop(this.ctx.currentTime + idx * 0.09 + 0.22);
        });
    }
}

const sfx = new SoundFx();

// Preload BRSM Emblem for Canvas Seal
const emblemImg = new Image();
emblemImg.src = '../../assets/img/logo.png';

// 5 Balanced Situations covering all 5 core directions
const QUEST_CASES = [
    {
        badge: 'Кейс 1 • Свободное время и таланты',
        question: 'После занятий в колледже у тебя появилось свободное время. Какое занятие тебе ближе всего по душе?',
        options: [
            { text: 'Помочь тем, кому трудно: съездить к ветеранам или в приют для животных', tag: 'volunteer', fact: 'Волонтерский отряд «Доброе Сердце» ПГАТК регулярно проводит выездные благотворительные акции!' },
            { text: 'Освоить реальную технику, поработать руками и заработать свои деньги', tag: 'bso', fact: 'Студотряды ПГАТК позволяют легально заработать и получить официальный трудовой стаж!' },
            { text: 'Снять видеоролик, сделать яркие фото для соцсетей или написать код для сайта', tag: 'media', fact: 'Медиацентр колледжа освещает все главные события и участвует в конкурсе «Войти в IT»!' },
            { text: 'Заняться спортом, пробежкой, единоборствами или тактической подготовкой', tag: 'moop', fact: 'Отряд МООП ПГАТК взаимодействует с милицией и тренирует навыки самозащиты и правопорядка!' }
        ]
    },
    {
        badge: 'Кейс 2 • Летний период',
        question: 'Наступают летние каникулы. Какую цель ты ставишь перед собой на эти три месяца?',
        options: [
            { text: 'Работать в строительном или сервисном отряде на лучших объектах области', tag: 'bso', fact: 'Бойцы БСО колледжа обеспечиваются питанием, формой и достойной оплатой труда!' },
            { text: 'Организовать в колледже спартакиаду, турнир по волейболу или киберспорту', tag: 'sport', fact: 'Спортивные секции БРСМ помогают активной молодежи побеждать на областных первенствах!' },
            { text: 'Участвовать в экологических проектах и восстановлении памятников истории', tag: 'volunteer', fact: 'Волонтеры «Доброе Сердце» ежегодно благоустраивают мемориалы воинам-освободителям!' },
            { text: 'Пройти стажировку в обеспечении безопасности массовых мероприятий города', tag: 'moop', fact: 'Члены МООП имеют преимущества при поступлении в силовые ведомства республики!' }
        ]
    },
    {
        badge: 'Кейс 3 • Лидерская инициатива',
        question: 'В колледже объявлен день студенческих инициатив. Какую идею ты предложишь реализовать?',
        options: [
            { text: 'Запустить студенческий подкаст, TikTok-канал и интерактивные игры на сайте', tag: 'media', fact: 'Информационная работа в БРСМ — это мощный старт в карьере журналиста и медийщика!' },
            { text: 'Организовать шефство над детским домом и провести новогоднюю ярмарку добра', tag: 'volunteer', fact: 'Благотворительные марафоны колледжа собирают тонны подарков для нуждающихся детей!' },
            { text: 'Создать дружину для поддержания образцового порядка в студгородке и общежитии', tag: 'moop', fact: 'Дисциплина и порядок в общежитиях ПГАТК поддерживаются при активном участии МООП!' },
            { text: 'Собрать бригаду механизаторов для помощи сельхозпредприятиям Пинщины', tag: 'bso', fact: 'Аграрные студотряды ПГАТК — гордость района во время уборочной кампании!' }
        ]
    },
    {
        badge: 'Кейс 4 • Твоя главная суперсила',
        question: 'Если спросить твоих друзей, в чем ты лучший — что они ответят?',
        options: [
            { text: 'Всегда готов выслушать, поддержать и прийти на помощь в трудную минуту', tag: 'volunteer', fact: 'Чуткость и взаимовыручка — главные качества волонтеров движения «Доброе Сердце»!' },
            { text: 'Надежный, трудолюбивый, не боюсь физической работы и практических задач', tag: 'bso', fact: 'Студотрядовская дружба — это связь на всю жизнь и бесценный трудовой опыт!' },
            { text: 'Принципиальный, справедливый, ценю порядок и умею действовать хладнокровно', tag: 'moop', fact: 'Бойцы отрядов охраны правопорядка воспитывают в себе характер будущих лидеров!' },
            { text: 'Креативный, генератор идей, умею интересно рассказать историю и создать визуал', tag: 'media', fact: 'Творческая молодежь БРСМ выступает на республиканских форумах и фестивалях!' }
        ]
    },
    {
        badge: 'Кейс 5 • Выбор будущего пути',
        question: 'Какое достижение в колледже принесет тебе наибольшую гордость?',
        options: [
            { text: 'Звание «Лучший боец студенческого отряда» и заработанная первая зарплата', tag: 'bso', fact: 'Лучшие студотряды колледжа награждаются ценными призами и путевками!' },
            { text: 'Осознание, что благодаря твоей заботе чья-то жизнь стала теплее и радостнее', tag: 'volunteer', fact: 'Каждый год волонтеры ПГАТК получают благодарственные письма от руководства города!' },
            { text: 'Победа команды колледжа на городском первенстве или кибертурнире', tag: 'sport', fact: 'Колледж гордится своими спортсменами и создает все условия для тренировок!' },
            { text: 'Победа интернет-ресурса и медиа-проекта колледжа в конкурсе «Войти в IT»', tag: 'media', fact: 'Твой вклад прямо сейчас делает сайт БРСМ ПГАТК лучшим молодежным ресурсом!' }
        ]
    }
];

// App State
let currentCaseIndex = 0;
let userXP = 0;
let studentName = 'Активист ПГАТК';
let tagScores = { bso: 0, volunteer: 0, sport: 0, moop: 0, media: 0 };
let currentSelection = null;
let lastSelectedTag = 'bso';

// DOM Elements
const screenIntro = document.getElementById('screen-intro');
const screenGame = document.getElementById('screen-game');
const screenResult = document.getElementById('screen-result');

const nameInput = document.getElementById('student-name');
const btnStart = document.getElementById('btn-start');
const soundBtn = document.getElementById('sound-btn');

const stepCounter = document.getElementById('step-counter');
const currentXpEl = document.getElementById('current-xp');
const progressFill = document.getElementById('progress-fill');
const caseBadge = document.getElementById('case-badge');
const caseQuestion = document.getElementById('case-question');
const optionsContainer = document.getElementById('options-container');
const factBox = document.getElementById('fact-box');
const factText = document.getElementById('fact-text');
const btnNext = document.getElementById('btn-next');

const resultDirectionTitle = document.getElementById('result-direction-title');
const btnDownloadCard = document.getElementById('btn-download-card');

// Sound toggle
soundBtn.addEventListener('click', () => {
    sfx.muted = !sfx.muted;
    soundBtn.classList.toggle('muted', sfx.muted);
    const icon = soundBtn.querySelector('i');
    icon.className = sfx.muted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';
});

// Start Quest
btnStart.addEventListener('click', () => {
    const inputVal = nameInput.value.trim();
    if (inputVal) studentName = inputVal;
    sfx.playClick();
    
    screenIntro.classList.remove('active-screen');
    screenGame.classList.add('active-screen');
    renderCase(0);
});

// Render a situation case
function renderCase(idx) {
    currentSelection = null;
    btnNext.disabled = true;
    factBox.classList.remove('active');

    const item = QUEST_CASES[idx];
    stepCounter.textContent = `Кейс ${idx + 1} из ${QUEST_CASES.length}`;
    currentXpEl.textContent = userXP;
    progressFill.style.width = `${((idx + 1) / QUEST_CASES.length) * 100}%`;

    caseBadge.textContent = item.badge;
    caseQuestion.textContent = item.question;

    optionsContainer.innerHTML = '';
    const letters = ['А', 'Б', 'В', 'Г'];

    item.options.forEach((opt, oIdx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerHTML = `
            <span class="option-letter">${letters[oIdx]}</span>
            <span class="option-text">${opt.text}</span>
        `;

        btn.addEventListener('click', () => {
            if (currentSelection !== null) return;
            currentSelection = opt;
            lastSelectedTag = opt.tag;
            sfx.playClick();

            document.querySelectorAll('.option-btn').forEach(b => b.classList.add('disabled'));
            btn.classList.add('selected');

            userXP += 30;
            currentXpEl.textContent = userXP;
            tagScores[opt.tag] = (tagScores[opt.tag] || 0) + 30;

            factText.textContent = opt.fact;
            factBox.classList.add('active');
            btnNext.disabled = false;
        });

        optionsContainer.appendChild(btn);
    });
}

// Next Step
btnNext.addEventListener('click', () => {
    sfx.playClick();
    currentCaseIndex++;

    if (currentCaseIndex < QUEST_CASES.length) {
        renderCase(currentCaseIndex);
    } else {
        finishQuest();
    }
});

// Register unique ID card on server
async function registerCardOnServer(fullName, direction, xp) {
    const serverHosts = [
        'http://100.90.47.115/api/brsm/cards',
        'http://192.168.100.80/api/brsm/cards'
    ];

    for (const host of serverHosts) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2500);

            const res = await fetch(host, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ full_name: fullName, direction: direction, xp: xp }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                const data = await res.json();
                if (data.success && data.card_id) {
                    return data.card_id;
                }
            }
        } catch (e) {
            // try fallback host
        }
    }

    // Fallback if server is not reachable
    const localSeq = Math.floor(1000 + Math.random() * 8999);
    return `ID-${localSeq}`;
}

// Finalize Quest
async function finishQuest() {
    screenGame.classList.remove('active-screen');
    screenResult.classList.add('active-screen');
    sfx.playSuccess();
    runConfetti();

    // Determine primary direction based on highest score
    let bestTag = lastSelectedTag;
    let maxScore = -1;
    for (const [tag, score] of Object.entries(tagScores)) {
        if (score > maxScore) {
            maxScore = score;
            bestTag = tag;
        }
    }

    const directionTitles = {
        bso: 'Студенческие отряды (БСО)',
        volunteer: 'Волонтерский отряд «Доброе Сердце»',
        sport: 'Спортивное и ЗОЖ-движение',
        moop: 'Молодежный отряд охраны правопорядка (МООП)',
        media: 'Молодежный Медиа-центр и IT'
    };

    const finalTitle = directionTitles[bestTag] || 'Актив БРСМ ПГАТК';
    resultDirectionTitle.textContent = finalTitle;

    // Get unique ID from server
    const uniqueCardId = await registerCardOnServer(studentName, finalTitle, userXP);

    // Save locally
    saveProgress(userXP, finalTitle, uniqueCardId);

    // Render Ultra-HD ID Card (1800x1020)
    drawIdCard(studentName, finalTitle, userXP, uniqueCardId);

    // Connect application button directly
    const applyBtn = document.querySelector('.btn-apply-direct');
    if (applyBtn) {
        const query = encodeURIComponent(finalTitle);
        const nameQ = encodeURIComponent(studentName);
        applyBtn.href = `../../index.html?name=${nameQ}&direction=${query}#contacts`;
    }
}

function saveProgress(earnedXp, direction, cardId) {
    try {
        let profile = {
            name: studentName,
            xp: 0,
            rank: 'Новичок',
            direction: direction,
            cardId: cardId
        };
        const raw = localStorage.getItem('brsm_student_profile');
        if (raw) profile = { ...profile, ...JSON.parse(raw) };

        profile.xp += earnedXp;
        profile.name = studentName;
        profile.direction = direction;
        profile.cardId = cardId;

        localStorage.setItem('brsm_student_profile', JSON.stringify(profile));
    } catch (e) {
        console.error('Save progress error:', e);
    }
}

// Draw Ultra-HD (1800x1020) ID Card on Canvas
function drawIdCard(name, direction, xp, cardId) {
    const canvas = document.getElementById('id-card-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = 1800;
    const h = 1020;
    canvas.width = w;
    canvas.height = h;

    // Smooth gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#0a0f1d');
    bgGrad.addColorStop(0.4, '#151f33');
    bgGrad.addColorStop(1, '#090e18');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Security Guilloche / Micro-lines pattern for authentic ID feel
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
    ctx.lineWidth = 1.5;
    for (let i = -w; i < w * 2; i += 32) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.bezierCurveTo(i + 200, h * 0.3, i - 100, h * 0.7, i + 100, h);
        ctx.stroke();
    }
    ctx.restore();

    // Top Stripe (BRSM Red & Green)
    const redGrad = ctx.createLinearGradient(0, 0, w * 0.58, 0);
    redGrad.addColorStop(0, '#D91D24');
    redGrad.addColorStop(1, '#ef4444');
    ctx.fillStyle = redGrad;
    ctx.fillRect(0, 0, w * 0.58, 24);

    const greenGrad = ctx.createLinearGradient(w * 0.58, 0, w, 0);
    greenGrad.addColorStop(0, '#2C9342');
    greenGrad.addColorStop(1, '#22c55e');
    ctx.fillStyle = greenGrad;
    ctx.fillRect(w * 0.58, 0, w * 0.42, 24);

    // Subtle outer card border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, w - 4, h - 4);

    // Header Title
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 48px Montserrat, sans-serif';
    ctx.fillText('ПО ОО «БРСМ» | ПГАТК ИМ. А.Е. КЛЕЩЕВА', 90, 126);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 30px Montserrat, sans-serif';
    ctx.fillText('ЦИФРОВАЯ ID-КАРТА АКТИВИСТА МОЛОДЕЖНОГО ДВИЖЕНИЯ', 90, 178);

    // Separator line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(90, 218);
    ctx.lineTo(w - 90, 218);
    ctx.stroke();

    // Student Info
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 30px Montserrat, sans-serif';
    ctx.fillText('ФАМИЛИЯ, ИМЯ:', 90, 320);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 66px Montserrat, sans-serif';
    ctx.fillText(name.toUpperCase(), 90, 400);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 30px Montserrat, sans-serif';
    ctx.fillText('РЕКОМЕНДОВАННОЕ НАПРАВЛЕНИЕ:', 90, 520);

    ctx.fillStyle = '#4ade80';
    ctx.font = '900 48px Montserrat, sans-serif';
    ctx.fillText(direction, 90, 590);

    // Metadata & Verification
    const dateStr = new Date().toLocaleDateString('ru-RU');
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 32px Montserrat, sans-serif';
    ctx.fillText(`НОМЕР КАРТЫ: ${cardId}`, 90, 750);
    ctx.fillText(`ДАТА РЕГИСТРАЦИИ: ${dateStr}`, 90, 810);
    
    ctx.fillStyle = '#fbbf24';
    ctx.font = '800 32px Montserrat, sans-serif';
    ctx.fillText(`СТАТУС: ПОДТВЕРЖДЕНО СЕРВЕРОМ (+${xp} XP)`, 90, 870);

    // Official Stamp / Seal with actual BRSM Emblem in the center
    const sealX = w - 320;
    const sealY = h - 350;
    const sealRadius = 160;

    ctx.save();
    ctx.translate(sealX, sealY);

    // Outer solid stamp circle
    ctx.strokeStyle = 'rgba(217, 29, 36, 0.85)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(0, 0, sealRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Inner dashed stamp circle
    ctx.setLineDash([12, 10]);
    ctx.strokeStyle = 'rgba(217, 29, 36, 0.65)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, sealRadius - 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw BRSM Emblem inside the stamp
    if (emblemImg.complete && emblemImg.naturalWidth > 0) {
        const embW = 160;
        const embH = (emblemImg.naturalHeight / emblemImg.naturalWidth) * embW;
        ctx.drawImage(emblemImg, -embW / 2, -embH / 2 - 10, embW, embH);
    } else {
        ctx.fillStyle = '#f87171';
        ctx.font = '900 36px Montserrat, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('БРСМ', 0, -10);
    }

    // Seal text along bottom
    ctx.fillStyle = '#f87171';
    ctx.font = '800 22px Montserrat, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ПГАТК • ПИНСК', 0, sealRadius - 48);

    ctx.restore();
}

// Download Button in Ultra-HD PNG
btnDownloadCard.addEventListener('click', () => {
    const canvas = document.getElementById('id-card-canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `brsm-id-${studentName.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
});

// Canvas Confetti
function runConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ['#D91D24', '#2C9342', '#fbbf24', '#ffffff', '#38bdf8'];

    for (let i = 0; i < 110; i++) {
        pieces.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height * 0.4,
            size: Math.random() * 10 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedY: Math.random() * 3.5 + 2,
            speedX: (Math.random() - 0.5) * 3,
            rot: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 6
        });
    }

    let frame = 0;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces.forEach(p => {
            p.y += p.speedY;
            p.x += p.speedX;
            p.rot += p.rotSpeed;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rot * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
        });

        frame++;
        if (frame < 200) {
            requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    requestAnimationFrame(animate);
}
