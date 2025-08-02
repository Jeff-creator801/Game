// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

// Ваш TON кошелёк для выплат
const YOUR_WALLET = "UQAmTM_EE8D6seecLKf-h8aXVQasliniDDQ52EvBj7PqExNr";

// Конфиг Firebase (замените на свой!)
const firebaseConfig = {
    apiKey: "AIzaSyA2mxa0BR-V7FtqCFxkXtSoOTGUFXbI4M4",
  authDomain: "gammaton-fdbfd.firebaseapp.com",
  databaseURL: "https://gammaton-fdbfd-default-rtdb.firebaseio.com",
  projectId: "gammaton-fdbfd",
  storageBucket: "gammaton-fdbfd.firebasestorage.app",
  messagingSenderId: "118045498245",
  appId: "1:118045498245:web:f09ac245c00b2040c1c2ec"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Элементы DOM
const connectWalletBtn = document.getElementById('connectWalletBtn');
const walletAddress = document.getElementById('walletAddress');
const clickBtn = document.getElementById('clickBtn');
const scoreDisplay = document.getElementById('score');
const cashOutBtn = document.getElementById('cashOutBtn');
const scoresList = document.getElementById('scoresList');

// Переменные игры
let score = 0;
let tonAddress = null;
let connector = null;

// Инициализация TON Connect
function initTonConnect() {
    connector = new TonConnect.TonConnect({
        manifestUrl: 'https://Jeff-creator801.github.io/Game/tonconnect-manifest.json'
    });

    // Проверяем существующее подключение
    connector.restoreConnection();
    connector.onStatusChange((wallet) => {
        if (wallet) {
            tonAddress = wallet.account.address;
            walletAddress.textContent = `${tonAddress.slice(0, 6)}...${tonAddress.slice(-4)}`;
            connectWalletBtn.textContent = "Connected ✅";
            connectWalletBtn.disabled = true;
        }
    });
}

// Подключение кошелька
connectWalletBtn.addEventListener('click', async () => {
    const wallets = await connector.getWallets();
    await connector.connect(wallets[0], { jsBridgeKey: 'tonconnect' });
});

// Логика игры
clickBtn.addEventListener('click', () => {
    score += Math.floor(Math.random() * 5) + 1;
    scoreDisplay.textContent = score;
    saveScore();
});

// Обналичивание
cashOutBtn.addEventListener('click', async () => {
    if (score < 100) {
        alert("Need at least 100 coins to cash out!");
        return;
    }
    
    if (!connector || !tonAddress) {
        alert("Connect wallet first!");
        return;
    }

    const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [
            {
                address: YOUR_WALLET, // Деньги идут вам!
                amount: "1000000000", // 1 TON в нанотонах
                comment: "Payment for in-game coins"
            }
        ]
    };

    try {
        await connector.sendTransaction(transaction);
        score -= 100;
        scoreDisplay.textContent = score;
        alert("Payment sent to game owner!");
    } catch (e) {
        alert("Payment failed: " + e.message);
    }
});

// Сохранение счета
function saveScore() {
    const userId = tonAddress || `guest_${tg.initDataUnsafe.user?.id || 'anon'}`;
    database.ref('scores/' + userId).set({
        name: tg.initDataUnsafe.user?.first_name || "Anonymous",
        score: score,
        wallet: tonAddress ? tonAddress.slice(-6) : null
    });
}

// Загрузка лидерборда
function loadLeaderboard() {
    database.ref('scores')
        .orderByChild('score')
        .limitToLast(10)
        .on('value', (snapshot) => {
            const scores = [];
            snapshot.forEach((child) => {
                scores.push(child.val());
            });
            scores.sort((a, b) => b.score - a.score);
            updateLeaderboard(scores);
        });
}

// Обновление лидерборда
function updateLeaderboard(scores) {
    scoresList.innerHTML = scores.map(user => 
        `<li>
            <span>${user.name}</span>
            <span>${user.score} ${user.wallet ? ' (TON)' : ''}</span>
        </li>`
    ).join('');
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    initTonConnect();
    loadLeaderboard();
});
