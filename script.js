// DOM Elements
const elements = {
  // Menu Elements
  menuBtn: document.querySelector('.menu-btn'),
  sideMenu: document.getElementById('side-menu'),
  closeMenu: document.getElementById('close-menu'),
  menuItems: document.querySelectorAll('.menu-item'),
  
  // Time Elements
  time: document.getElementById('time'),
  currentTime: document.getElementById('current-time'),
  greeting: document.getElementById('greeting'),
  
  // Focus Elements
  focusInput: document.getElementById('focusInput'),
  focusDisplay: document.getElementById('focusDisplay'),
  
  // Focus Timer Elements
  pomodoroTimer: document.getElementById('pomodoro-timer'),
  startPomodoroBtn: document.getElementById('start-pomodoro'),
  resetPomodoroBtn: document.getElementById('reset-pomodoro'),
  
  // To-Do List Elements
  todoList: document.getElementById('todo-list'),
  todoEmpty: document.getElementById('todo-empty'),
  todoInput: document.getElementById('todo-input'),
  submitTodo: document.getElementById('submit-todo'),
  
  // Weather Elements
  weatherIcon: document.getElementById('weather-icon'),
  weatherTemp: document.getElementById('weather-temp'),
  weatherDesc: document.getElementById('weather-desc'),
  
  // Notes Elements
  notesArea: document.getElementById('notes-area'),
  saveNotes: document.getElementById('save-notes'),
  
  // Inspiration Elements
  quote: document.getElementById('quote'),
  author: document.getElementById('author'),
  newQuoteBtn: document.getElementById('new-quote-btn'),
  
  // Content Sections
  contentSections: document.querySelectorAll('.content-section')
};

// App State
const state = {
  currentSection: null,
  isPomodoroRunning: false,
  timeLeft: 25 * 60,
  todos: [],
  weather: {
    temp: null,
    desc: "Loading...",
    icon: "spinner"
  },
  notes: "",
  focusText: "",
  quotes: [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "The future depends on what you do today.", author: "Mahatma Gandhi" }
  ],
  backgrounds: [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    'https://images.unsplash.com/photo-1500534623283-312aade485b7',
    'https://images.unsplash.com/photo-1746950862855-ccd90286a57c',
    'https://images.unsplash.com/photo-1745681619881-975e836e432c',
    'https://images.unsplash.com/photo-1746990263194-0e2826fed608',
    'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d',
    'https://plus.unsplash.com/premium_photo-1675827055620-24d540e0892a',
  ],
  currentBackground: null
};

// Utility Functions
function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function getGreeting(hour) {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// Weather Simulation
// function simulateWeather() {
//   const now = new Date();
//   const currentMonth = now.getMonth() + 1;
//   const hour = now.getHours();
  
//   let baseTemp = 25;
//   if ([12, 1, 2].includes(currentMonth)) baseTemp = 15;
//   if ([3, 4, 5].includes(currentMonth)) baseTemp = 22;
//   if ([6, 7, 8].includes(currentMonth)) baseTemp = 32;
//   if ([9, 10, 11].includes(currentMonth)) baseTemp = 28;
  
//   if (hour >= 18 || hour <= 6) baseTemp -= 3;
  
//   const temp = baseTemp + Math.floor(Math.random() * 10) - 5;
  
//   const weatherTypes = [
//     { desc: "Sunny", icon: "sun" },
//     { desc: "Partly Cloudy", icon: "cloud-sun" },
//     { desc: "Cloudy", icon: "cloud" },
//     { desc: "Rainy", icon: "cloud-rain" }
//   ];
  
//   if ([12, 1, 2].includes(currentMonth)) {
//     weatherTypes.push({ desc: "Snowy", icon: "snowflake" });
//   }
  
//   if (hour >= 18 || hour <= 6) {
//     weatherTypes.push({ desc: "Clear Night", icon: "moon" });
//   }
  
//   const weather = getRandomItem(weatherTypes);
  
//   state.weather = {
//     temp: Math.round(temp),
//     desc: weather.desc,
//     icon: weather.icon
//   };
  
//   setupWeather();
// }
async function fetchWeather() {
  const apiKey = '8fa42fb3fbc34ec88a631723251705';
  const city = 'Ho Chi Minh';
  const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&lang=en`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();

    state.weather = {
      temp: Math.round(data.current.temp_c),
      desc: data.current.condition.text,
      icon: mapWeatherIcon(data.current.condition.code, data.current.is_day)
    };
    setupWeather();
  } catch (error) {
    state.weather = {
      temp: '--',
      desc: 'Không lấy được dữ liệu',
      icon: 'exclamation-triangle'
    };
    setupWeather();
  }
}

// Chuyển mã code WeatherAPI sang FontAwesome
function mapWeatherIcon(code, isDay) {
  if (code === 1000) return isDay ? 'sun' : 'moon';
  if ([1003, 1006, 1009].includes(code)) return 'cloud';
  if ([1030, 1135, 1147].includes(code)) return 'smog';
  if ([1063, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(code)) return 'cloud-rain';
  if ([1066, 1069, 1072, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258, 1261, 1264].includes(code)) return 'snowflake';
  if ([1087, 1273, 1276, 1279, 1282].includes(code)) return 'bolt';
  return 'cloud';
}
// Clock Functions
function updateClock() {
  const now = new Date();
  
  elements.currentTime.textContent = now.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Sửa phần này để hiển thị giờ 24h không có AM/PM
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  elements.time.textContent = `${hours}:${minutes}`;
  
  elements.greeting.textContent = getGreeting(now.getHours());
}

// Menu Functions
function setupMenu() {
  elements.menuBtn.addEventListener('click', toggleMenu);
  elements.closeMenu.addEventListener('click', toggleMenu);
  
  document.addEventListener('click', (e) => {
    if (e.target === document.querySelector('body.menu-open::after')) {
      toggleMenu();
    }
  });
  
  elements.menuItems.forEach(item => {
    item.addEventListener('click', function() {
      const sectionId = this.dataset.section;
      showSection(sectionId);
    });
  });
}

function toggleMenu() {
  elements.sideMenu.classList.toggle('active');
  document.body.classList.toggle('menu-open');
}

function showSection(sectionId) {
  elements.contentSections.forEach(section => {
    section.classList.remove('active');
  });
  
  const sectionToShow = document.getElementById(`${sectionId}-section`);
  if (sectionToShow) {
    sectionToShow.classList.add('active');
    state.currentSection = sectionId;
  }
  
  toggleMenu();
}

// Focus Input
function setupFocusInput() {
  const savedFocus = localStorage.getItem('focusText');
  if (savedFocus) {
    state.focusText = savedFocus;
    elements.focusDisplay.textContent = savedFocus;
    elements.focusInput.value = savedFocus;
  }

  elements.focusInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const text = e.target.value.trim();
      if (text) {
        state.focusText = text;
        elements.focusDisplay.textContent = text;
        localStorage.setItem('focusText', text);
        e.target.value = '';
      }
    }
  });
}

// ===== FOCUS OF THE DAY =====
const focusInput = document.getElementById('focusInput');
const focusDisplay = document.getElementById('focusDisplay');

focusInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && focusInput.value.trim()) {
    const focus = focusInput.value.trim();
    focusDisplay.textContent = `Today: ${focus}`;
    focusInput.style.display = 'none';
    localStorage.setItem('dailyFocus', focus);
  }
});

// Load focus từ localStorage
if (localStorage.getItem('dailyFocus')) {
  focusDisplay.textContent = `Today: ${localStorage.getItem('dailyFocus')}`;
  focusInput.style.display = 'none';
}

// // Pomodoro Timer
// let pomodoroInterval;

// function startPomodoro() {
//   if (!state.isPomodoroRunning) {
//     state.isPomodoroRunning = true;
//     elements.startPomodoroBtn.textContent = 'Pause';
    
//     pomodoroInterval = setInterval(() => {
//       state.timeLeft--;
//       updatePomodoroDisplay();
      
//       if (state.timeLeft <= 0) {
//         clearInterval(pomodoroInterval);
//         state.isPomodoroRunning = false;
//         elements.startPomodoroBtn.textContent = 'Start';
        
//         const alarm = document.getElementById('timer-alarm');
//         alarm.play();
        
//         alert("Time's up! Take a break");
//         state.timeLeft = 5 * 60;
//         updatePomodoroDisplay();
//         document.getElementById('stop-alarm').classList.remove('hidden');
//       }
//     }, 1000);
//   } else {
//     clearInterval(pomodoroInterval);
//     state.isPomodoroRunning = false;
//     elements.startPomodoroBtn.textContent = 'Resume';
//   }
// }

// function resetPomodoro() {
//   clearInterval(pomodoroInterval);
//   state.isPomodoroRunning = false;
//   state.timeLeft = 25 * 60;
//   updatePomodoroDisplay();
//   elements.startPomodoroBtn.textContent = 'Start';
//   document.getElementById('stop-alarm').classList.add('hidden');
// }

// function updatePomodoroDisplay() {
//   elements.pomodoroTimer.textContent = formatTime(state.timeLeft);
// }

// ...existing code...

// Pomodoro Timer
let pomodoroInterval;
let pomodoroMode = 'focus'; // 'focus' hoặc 'break'

function startPomodoro() {
  if (!state.isPomodoroRunning) {
    state.isPomodoroRunning = true;
    elements.startPomodoroBtn.textContent = 'Pause';

    pomodoroInterval = setInterval(() => {
      state.timeLeft--;
      updatePomodoroDisplay();

      if (state.timeLeft <= 0) {
        clearInterval(pomodoroInterval);
        state.isPomodoroRunning = false;
        elements.startPomodoroBtn.textContent = 'Start';

        const alarm = document.getElementById('timer-alarm');
        alarm.play();
        document.getElementById('stop-alarm').classList.remove('hidden');

        if (pomodoroMode === 'focus') {
          alert("Time's up! Take a 5-minute break");
          state.timeLeft = 5 * 60;
          pomodoroMode = 'break';
        } else {
          alert("Break is over! Time to focus for 25 minutes");
          state.timeLeft = 25 * 60;
          pomodoroMode = 'focus';
        }
        updatePomodoroDisplay();
      }
    }, 1000);
  } else {
    clearInterval(pomodoroInterval);
    state.isPomodoroRunning = false;
    elements.startPomodoroBtn.textContent = 'Resume';
  }
}

function resetPomodoro() {
  clearInterval(pomodoroInterval);
  state.isPomodoroRunning = false;
  state.timeLeft = 25 * 60;
  pomodoroMode = 'focus';
  updatePomodoroDisplay();
  elements.startPomodoroBtn.textContent = 'Start';
  document.getElementById('stop-alarm').classList.add('hidden');
}

function updatePomodoroDisplay() {
  elements.pomodoroTimer.textContent = formatTime(state.timeLeft);
}

// ...existing code...

// To-Do List
function setupTodoList() {
  const savedTodos = localStorage.getItem('todos');
  if (savedTodos) {
    state.todos = JSON.parse(savedTodos);
    renderTodos();
  }

  elements.submitTodo.addEventListener('click', addTodo);
  elements.todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
  });
}

function addTodo() {
  const text = elements.todoInput.value.trim();
  if (text) {
    state.todos.push({
      id: Date.now(),
      text,
      completed: false
    });
    
    elements.todoInput.value = '';
    saveTodos();
    renderTodos();
  }
}

function renderTodos() {
  if (state.todos.length === 0) {
    elements.todoEmpty.style.display = 'block';
    elements.todoList.innerHTML = '';
    return;
  }
  
  elements.todoEmpty.style.display = 'none';
  elements.todoList.innerHTML = state.todos.map(todo => `
    <li data-id="${todo.id}">
      <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
      <span class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
      <button class="delete-todo"><i class="fas fa-trash"></i></button>
    </li>
  `).join('');
  
  document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', toggleTodoComplete);
  });
  
  document.querySelectorAll('.delete-todo').forEach(btn => {
    btn.addEventListener('click', deleteTodo);
  });
}

function toggleTodoComplete(e) {
  const id = parseInt(e.target.closest('li').dataset.id);
  const todo = state.todos.find(t => t.id === id);
  if (todo) {
    todo.completed = e.target.checked;
    saveTodos();
    renderTodos();
  }
}

function deleteTodo(e) {
  const id = parseInt(e.target.closest('li').dataset.id);
  state.todos = state.todos.filter(t => t.id !== id);
  saveTodos();
  renderTodos();
}

function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(state.todos));
}

// Weather
function setupWeather() {
  elements.weatherIcon.innerHTML = `<i class="fas fa-${state.weather.icon}"></i>`;
  elements.weatherTemp.textContent = `${state.weather.temp}°C`;
  elements.weatherDesc.textContent = state.weather.desc;
}

// Notes
function setupNotes() {
  const savedNotes = localStorage.getItem('notes');
  if (savedNotes) {
    elements.notesArea.value = savedNotes;
    state.notes = savedNotes;
  }
  
  elements.saveNotes.addEventListener('click', saveNotes);
}

function saveNotes() {
  state.notes = elements.notesArea.value;
  localStorage.setItem('notes', state.notes);
  alert('Notes saved successfully!');
}

// Inspiration
function setupInspiration() {
  displayRandomQuote();
  elements.newQuoteBtn.addEventListener('click', displayRandomQuote);
}

function displayRandomQuote() {
  const quote = getRandomItem(state.quotes);
  elements.quote.textContent = quote.text;
  elements.author.textContent = `- ${quote.author}`;
}

// Background
function setRandomBackground() {
  state.currentBackground = getRandomItem(state.backgrounds);
  document.body.style.backgroundImage = `url('${state.currentBackground}?auto=format&fit=crop&w=1350&q=80')`;
}

// Initialize App
function init() {
  updateClock();
  setInterval(updateClock, 1000);
  
  setupMenu();
  setupTodoList();
  setupNotes();
  setupInspiration();
  setupFocusInput();
  setRandomBackground();
  
  // simulateWeather();
  // setInterval(simulateWeather, 2 * 60 * 60 * 1000);
  fetchWeather();
  setInterval(fetchWeather, 10 * 60 * 1000); // Cập nhật mỗi 10 phút
  
  elements.startPomodoroBtn.addEventListener('click', startPomodoro);
  elements.resetPomodoroBtn.addEventListener('click', resetPomodoro);

  const alarm = document.getElementById('timer-alarm');
  document.getElementById('stop-alarm').addEventListener('click', () => {
    alarm.pause();
    alarm.currentTime = 0;
    document.getElementById('stop-alarm').classList.add('hidden');
  });
}

document.addEventListener('DOMContentLoaded', init);


document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.getElementById('switch-version-toggle');
  if (!toggle) return;

  // Nếu đang ở PRO thì bật toggle, còn không thì tắt
  const path = window.location.pathname;
  if (path.toUpperCase().includes('/PRO/')) {
    toggle.checked = true;
    toggle.nextElementSibling.nextElementSibling.textContent = "PRO";
    toggle.title = "Chuyển sang NORMAL";
  } else {
    toggle.checked = false;
    toggle.nextElementSibling.nextElementSibling.textContent = "PRO";
    toggle.title = "Chuyển sang PRO";
  }

  toggle.addEventListener('change', function() {
    if (toggle.checked) {
      // Sang PRO
      window.location.href = window.location.origin + window.location.pathname.replace(/\/$/, '') + '/PRO/';
    } else {
      // Sang NORMAL (gốc)
      window.location.href = window.location.origin + window.location.pathname.replace(/\/PRO\/$/, '/');
    }
  });
});