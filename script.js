// Инициализация Firebase (замените конфиг!)
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "ваш-проект.firebaseapp.com",
  databaseURL: "https://ваш-проект.firebaseio.com",
  projectId: "ваш-проект",
  storageBucket: "ваш-проект.appspot.com",
  appId: "1:123...web:456..."
};
firebase.initializeApp(firebaseConfig);

// Сохраняем результат
function saveScore(score) {
  firebase.database().ref('scores/' + Date.now()).set({
    name: "Test User",
    score: score
  });
}

// Загружаем лидерборд
function loadLeaderboard() {
  firebase.database().ref('scores').on('value', (snapshot) => {
    const scores = [];
    snapshot.forEach((child) => {
      scores.push(child.val());
    });
    console.log("Данные из Firebase:", scores); // Проверьте в консоли
  });
}

// Тест: запустите это в консоли
saveScore(100);
loadLeaderboard();
