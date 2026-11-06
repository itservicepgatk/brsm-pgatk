document.addEventListener('DOMContentLoaded', () => {
    initUserProfile();
});

function getUserData() {
    const defaultData = {
        name: 'Учащийся ПГАТК',
        xp: 0,
        rank: 'Новичок',
        completedQuests: []
    };

    try {
        const stored = localStorage.getItem('brsm_student_profile');
        if (stored) {
            return { ...defaultData, ...JSON.parse(stored) };
        }
    } catch (e) {
        console.error('LocalStorage read error:', e);
    }
    return defaultData;
}

function calculateRank(xp) {
    if (xp >= 450) return { name: 'Лидер молодежи', step: 4 };
    if (xp >= 250) return { name: 'Комиссар', step: 3 };
    if (xp >= 100) return { name: 'Активист', step: 2 };
    return { name: 'Новичок', step: 1 };
}

function initUserProfile() {
    const user = getUserData();
    const rankInfo = calculateRank(user.xp);

    const xpEl = document.getElementById('profile-xp');
    const rankEl = document.getElementById('profile-rank');

    if (xpEl) xpEl.textContent = user.xp;
    if (rankEl) rankEl.textContent = rankInfo.name;

    document.querySelectorAll('.rank-step').forEach(stepEl => {
        const stepNum = parseInt(stepEl.getAttribute('data-step'), 10);
        if (stepNum <= rankInfo.step) {
            stepEl.classList.add('active');
        } else {
            stepEl.classList.remove('active');
        }
    });
}
