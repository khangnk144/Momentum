// DOM Elements
const elements = {
  menuBtn: document.querySelector('.menu-btn'),
  sideMenu: document.getElementById('side-menu'),
  closeMenu: document.getElementById('close-menu'),
  menuItems: document.querySelectorAll('.menu-item'),
  time: document.getElementById('time'),
  currentTime: document.getElementById('current-time'),
  greeting: document.getElementById('greeting'),
  focusInput: document.getElementById('focusInput'),
  focusDisplay: document.getElementById('focusDisplay'),
  pomodoroTimer: document.getElementById('pomodoro-timer'),
  startPomodoroBtn: document.getElementById('start-pomodoro'),
  resetPomodoroBtn: document.getElementById('reset-pomodoro'),
  stopAlarmBtn: document.getElementById('stop-alarm'),
  todoList: document.getElementById('todo-list'),
  todoEmpty: document.getElementById('todo-empty'),
  todoInput: document.getElementById('todo-input'),
  prioritySelect: document.getElementById('priority-select'),
  submitTodo: document.getElementById('submit-todo'),
  weatherIcon: document.getElementById('weather-icon'),
  weatherTemp: document.getElementById('weather-temp'),
  weatherDesc: document.getElementById('weather-desc'),
  notesArea: document.getElementById('notes-area'),
  saveNotes: document.getElementById('save-notes'),
  quote: document.getElementById('quote'),
  author: document.getElementById('author'),
  newQuoteBtn: document.getElementById('new-quote-btn'),
  productivitySection: document.getElementById('productivity-section'),
  focusHours: document.getElementById('focus-hours'),
  tasksCompleted: document.getElementById('tasks-completed'),
  productivityScore: document.getElementById('productivity-score'),
  dailyGoal: document.getElementById('daily-goal'),
  setGoal: document.getElementById('set-goal'),
  lightThemeBtn: document.getElementById('light-theme-btn'),
  darkThemeBtn: document.getElementById('dark-theme-btn'),
  premiumThemeBtn: document.getElementById('premium-theme-btn'),
  zenModeBtn: document.getElementById('zen-mode-btn'),
  zenMode: document.getElementById('zen-mode'),
  zenTimer: document.getElementById('zen-timer'),
  exitZenMode: document.getElementById('exit-zen-mode'),
  toggleAmbient: document.getElementById('toggle-ambient'),
  ambientSound: document.getElementById('ambient-sound'),
  contentSections: document.querySelectorAll('.content-section')
};

// App State
const state = {
  currentSection: null,
  isPomodoroRunning: false,
  timeLeft: 25 * 60,
  pomodoroStartTime: null,
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
    'https://images.unsplash.com/photo-1746990263194-0e2826fed608'
  ],
  currentBackground: null,
  currentTheme: 'dark',
  zenMode: false,
  ambientPlaying: false,
  productivity: {
    focusSessions: [],
    completedTasks: [],
    dailyGoal: 4,
    lastTrackedTime: 0
  },
  lastFocusResetDate: new Date().getDate()
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

// Clock Functions
function updateClock() {
  const now = new Date();
  
  if (now.getDate() !== state.lastFocusResetDate) {
    resetDailyFocus();
    state.lastFocusResetDate = now.getDate();
  }
  
  elements.currentTime.textContent = now.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  elements.time.textContent = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  });
  
  elements.greeting.textContent = getGreeting(now.getHours());
}

function resetDailyFocus() {
  localStorage.removeItem('dailyFocus');
  elements.focusDisplay.textContent = '';
  elements.focusInput.style.display = 'block';
  elements.focusInput.value = '';
}

// Menu Functions
function setupMenu() {
  elements.menuBtn.addEventListener('click', toggleMenu);
  elements.closeMenu.addEventListener('click', toggleMenu);
  
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
    
    if (sectionId === 'productivity') {
      updateProductivityStats();
      updateProductivityChart();
    }
  }
  
  toggleMenu();
}

// Focus Input
function setupFocusInput() {
  const savedFocus = localStorage.getItem('dailyFocus');
  if (savedFocus) {
    elements.focusDisplay.textContent = `Today: ${savedFocus}`;
    elements.focusInput.style.display = 'none';
  }

  elements.focusInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      const focus = e.target.value.trim();
      elements.focusDisplay.textContent = `Today: ${focus}`;
      elements.focusInput.style.display = 'none';
      localStorage.setItem('dailyFocus', focus);
    }
  });
}

// Pomodoro Timer
let pomodoroInterval;

function startPomodoro(isAutoResume = false) {
  if (!state.isPomodoroRunning) {
    state.isPomodoroRunning = true;
    
    if (!isAutoResume) {
      state.pomodoroStartTime = Date.now();
      state.productivity.lastTrackedTime = 25 * 60;
    }
    
    elements.startPomodoroBtn.textContent = 'Pause';
    
    clearInterval(pomodoroInterval);
    
    pomodoroInterval = setInterval(() => {
      state.timeLeft--;
      updatePomodoroDisplay();
      
      if ((25 * 60 - state.timeLeft) % (5 * 60) === 0 && state.timeLeft !== 25 * 60) {
        trackProductivity(5);
      }
      
      if (state.timeLeft <= 0) {
        finishPomodoroSession();
      }
      
      savePomodoroState();
    }, 1000);
    
    savePomodoroState();
  } else {
    pausePomodoro();
  }
}

function trackProductivity(minutes) {
  state.productivity.focusSessions.push({
    date: new Date().toISOString(),
    duration: minutes
  });
  saveProductivityData();
  updateProductivityStats();
}

function pausePomodoro() {
  clearInterval(pomodoroInterval);
  state.isPomodoroRunning = false;
  elements.startPomodoroBtn.textContent = 'Resume';
  savePomodoroState();
}

function finishPomodoroSession() {
  clearInterval(pomodoroInterval);
  state.isPomodoroRunning = false;
  elements.startPomodoroBtn.textContent = 'Start';
  
  const remainingMinutes = Math.floor(state.timeLeft / 60);
  const trackedMinutes = 25 - remainingMinutes;
  if (trackedMinutes > 0) {
    trackProductivity(trackedMinutes);
  }
  
  const alarm = document.getElementById('timer-alarm');
  alarm.play();
  elements.stopAlarmBtn.classList.remove('hidden');
  
  state.timeLeft = 5 * 60;
  updatePomodoroDisplay();
  savePomodoroState();
  
  alert("Time's up! Take a 5-minute break");
}

function resetPomodoro() {
  clearInterval(pomodoroInterval);
  state.isPomodoroRunning = false;
  state.timeLeft = 25 * 60;
  updatePomodoroDisplay();
  elements.startPomodoroBtn.textContent = 'Start';
  elements.stopAlarmBtn.classList.add('hidden');
  savePomodoroState();
}

function updatePomodoroDisplay() {
  elements.pomodoroTimer.textContent = formatTime(state.timeLeft);
  if (state.zenMode) {
    elements.zenTimer.textContent = formatTime(state.timeLeft);
  }
}

function savePomodoroState() {
  const pomodoroState = {
    isRunning: state.isPomodoroRunning,
    startTime: state.pomodoroStartTime,
    timeLeft: state.timeLeft,
    lastUpdated: Date.now()
  };
  localStorage.setItem('pomodoroState', JSON.stringify(pomodoroState));
}

function loadAndResumePomodoro() {
  const savedData = localStorage.getItem('pomodoroState');
  if (!savedData) return;

  const savedState = JSON.parse(savedData);
  
  if (savedState.isRunning) {
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - savedState.lastUpdated) / 1000);
    
    state.timeLeft = Math.max(0, savedState.timeLeft - elapsedSeconds);
    state.pomodoroStartTime = savedState.startTime;
    
    if (state.timeLeft > 0) {
      state.isPomodoroRunning = true;
      startPomodoro(true);
      elements.startPomodoroBtn.textContent = 'Pause';
      updatePomodoroDisplay();
    } else {
      state.timeLeft = 25 * 60;
      state.isPomodoroRunning = false;
      finishPomodoroSession();
    }
  }
}

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
  const priority = elements.prioritySelect.value;
  
  if (text) {
    state.todos.push({
      id: Date.now(),
      text,
      completed: false,
      priority
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
    <li data-id="${todo.id}" class="todo-item priority-${todo.priority || 'medium'}">
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
    if (todo.completed) {
      state.productivity.completedTasks.push({
        date: new Date().toISOString(),
        task: todo.text
      });
      saveProductivityData();
      updateProductivityStats();
    }
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

// Weather Simulation
function simulateWeather() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const hour = now.getHours();
  
  let baseTemp = 25;
  if ([12, 1, 2].includes(currentMonth)) baseTemp = 15;
  if ([3, 4, 5].includes(currentMonth)) baseTemp = 22;
  if ([6, 7, 8].includes(currentMonth)) baseTemp = 32;
  if ([9, 10, 11].includes(currentMonth)) baseTemp = 28;
  
  if (hour >= 18 || hour <= 6) baseTemp -= 3;
  
  const temp = baseTemp + Math.floor(Math.random() * 10) - 5;
  
  const weatherTypes = [
    { desc: "Sunny", icon: "sun" },
    { desc: "Partly Cloudy", icon: "cloud-sun" },
    { desc: "Cloudy", icon: "cloud" },
    { desc: "Rainy", icon: "cloud-rain" }
  ];
  
  if ([12, 1, 2].includes(currentMonth)) {
    weatherTypes.push({ desc: "Snowy", icon: "snowflake" });
  }
  
  if (hour >= 18 || hour <= 6) {
    weatherTypes.push({ desc: "Clear Night", icon: "moon" });
  }
  
  const weather = getRandomItem(weatherTypes);
  
  state.weather = {
    temp: Math.round(temp),
    desc: weather.desc,
    icon: weather.icon
  };
  
  setupWeather();
}

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

// Productivity Stats
function setupProductivity() {
  const savedData = localStorage.getItem('productivity');
  if (savedData) {
    state.productivity = JSON.parse(savedData);
    updateProductivityStats();
  }
  
  if (state.productivity.dailyGoal) {
    elements.dailyGoal.value = state.productivity.dailyGoal;
  }
  
  elements.setGoal.addEventListener('click', setDailyGoal);
  elements.dailyGoal.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') setDailyGoal();
  });
}

function setDailyGoal() {
  const goal = parseInt(elements.dailyGoal.value);
  if (goal > 0 && goal <= 12) {
    state.productivity.dailyGoal = goal;
    saveProductivityData();
    updateProductivityStats();
    alert('Daily goal updated to ' + goal + ' hours!');
  } else {
    alert('Please enter a valid goal between 1 and 12 hours');
    elements.dailyGoal.value = state.productivity.dailyGoal;
  }
}

function updateProductivityStats() {
  const totalFocusMinutes = state.productivity.focusSessions.reduce(
    (total, session) => total + session.duration, 0
  );
  const focusHours = (totalFocusMinutes / 60).toFixed(1);
  
  const tasksCompleted = state.productivity.completedTasks.length;
  
  const productivityScore = state.productivity.dailyGoal > 0 
    ? Math.min(100, Math.round((totalFocusMinutes / (state.productivity.dailyGoal * 60)) * 100))
    : 0;
  
  elements.focusHours.textContent = focusHours;
  elements.tasksCompleted.textContent = tasksCompleted;
  elements.productivityScore.textContent = `${productivityScore}%`;
  
  if (window.Chart) {
    updateProductivityChart();
  }
}

function updateProductivityChart() {
  const ctx = document.getElementById('productivity-chart').getContext('2d');
  
  const sessionsByDate = {};
  state.productivity.focusSessions.forEach(session => {
    const date = session.date.split('T')[0];
    sessionsByDate[date] = (sessionsByDate[date] || 0) + session.duration;
  });
  
  const dates = Object.keys(sessionsByDate).sort();
  const durations = dates.map(date => (sessionsByDate[date] / 60).toFixed(1));
  
  if (window.productivityChart) {
    window.productivityChart.data.labels = dates;
    window.productivityChart.data.datasets[0].data = durations;
    window.productivityChart.update();
  } else {
    window.productivityChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dates,
        datasets: [{
          label: 'Focus Hours',
          data: durations,
          backgroundColor: 'rgba(66, 133, 244, 0.7)',
          borderColor: 'rgba(66, 133, 244, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Hours'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date'
            }
          }
        }
      }
    });
  }
}
function updateProductivityChart() {
  const ctx = document.getElementById('productivity-chart').getContext('2d');
  
  // Clear previous chart if exists
  if (window.productivityChart) {
    window.productivityChart.destroy();
  }

  const sessionsByDate = {};
  state.productivity.focusSessions.forEach(session => {
    const date = new Date(session.date).toLocaleDateString();
    sessionsByDate[date] = (sessionsByDate[date] || 0) + session.duration;
  });
  
  const dates = Object.keys(sessionsByDate).sort();
  const durations = dates.map(date => (sessionsByDate[date] / 60).toFixed(1));
  
  // Get computed style for theme colors
  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color');
  const gridColor = 'rgba(255, 255, 255, 0.1)';
  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color');

  window.productivityChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dates,
      datasets: [{
        label: 'Focus Hours',
        data: durations,
        backgroundColor: primaryColor + '80', // Add opacity
        borderColor: primaryColor,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Hours',
            color: textColor
          },
          grid: {
            color: gridColor
          },
          ticks: {
            color: textColor,
            callback: function(value) {
              return value + 'h';
            }
          }
        },
        x: {
          title: {
            display: true,
            text: 'Date',
            color: textColor
          },
          grid: {
            color: gridColor
          },
          ticks: {
            color: textColor,
            maxRotation: 45,
            minRotation: 45
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: textColor,
            font: {
              size: 14
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.parsed.y + ' hours';
            }
          }
        }
      }
    }
  });
}

function saveProductivityData() {
  localStorage.setItem('productivity', JSON.stringify(state.productivity));
}

// Theme Switching
function setupThemes() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.body.classList.add(`${savedTheme}-theme`);
  state.currentTheme = savedTheme;
  
  elements.lightThemeBtn.addEventListener('click', () => {
    document.body.classList.remove('dark-theme', 'premium-theme');
    document.body.classList.add('light-theme');
    state.currentTheme = 'light';
    localStorage.setItem('theme', 'light');
  });

  elements.darkThemeBtn.addEventListener('click', () => {
    document.body.classList.remove('light-theme', 'premium-theme');
    document.body.classList.add('dark-theme');
    state.currentTheme = 'dark';
    localStorage.setItem('theme', 'dark');
  });

  elements.premiumThemeBtn.addEventListener('click', () => {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add('premium-theme');
    state.currentTheme = 'premium';
    localStorage.setItem('theme', 'premium');
  });
}

// Zen Mode
function setupZenMode() {
  elements.zenModeBtn.addEventListener('click', toggleZenMode);
  elements.exitZenMode.addEventListener('click', toggleZenMode);
  elements.toggleAmbient.addEventListener('click', toggleAmbientSound);
}

function toggleZenMode() {
  state.zenMode = !state.zenMode;
  if (state.zenMode) {
    elements.zenMode.classList.remove('hidden');
    elements.zenTimer.textContent = formatTime(state.timeLeft);
    document.body.classList.add('zen-mode');
  } else {
    elements.zenMode.classList.add('hidden');
    document.body.classList.remove('zen-mode');
    if (state.ambientPlaying) {
      toggleAmbientSound();
    }
  }
}

function toggleAmbientSound() {
  state.ambientPlaying = !state.ambientPlaying;
  if (state.ambientPlaying) {
    elements.ambientSound.play();
    elements.toggleAmbient.innerHTML = '<i class="fas fa-volume-up"></i> Sound On';
  } else {
    elements.ambientSound.pause();
    elements.toggleAmbient.innerHTML = '<i class="fas fa-volume-mute"></i> Sound Off';
  }
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
  
  loadAndResumePomodoro();
  
  setupMenu();
  setupTodoList();
  setupNotes();
  setupInspiration();
  setupFocusInput();
  setupThemes();
  setupZenMode();
  setupProductivity();
  setRandomBackground();
  simulateWeather();
  
  elements.startPomodoroBtn.addEventListener('click', () => startPomodoro(false));
  elements.resetPomodoroBtn.addEventListener('click', resetPomodoro);
  elements.stopAlarmBtn.addEventListener('click', () => {
    document.getElementById('timer-alarm').pause();
    elements.stopAlarmBtn.classList.add('hidden');
  });
  
  window.addEventListener('beforeunload', savePomodoroState);
}

document.addEventListener('DOMContentLoaded', init);

document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.getElementById('switch-version-toggle');
  if (!toggle) return;

  // Đặt trạng thái toggle dựa trên đường dẫn
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
    // Thay thế đúng phần NORMAL hoặc PRO trong URL
    let newPath = path.replace(/\/NORMAL\//i, '/PRO/').replace(/\/PRO\//i, '/NORMAL/');
    // Nếu đang ở NORMAL thì chuyển sang PRO, ngược lại thì chuyển sang NORMAL
    if (toggle.checked) {
      if (!/\/PRO\//i.test(path)) {
        newPath = path.replace(/\/NORMAL\//i, '/PRO/');
      }
    } else {
      if (!/\/NORMAL\//i.test(path)) {
        newPath = path.replace(/\/PRO\//i, '/NORMAL/');
      }
    }
    // Nếu không tìm thấy NORMAL hoặc PRO trong path, chuyển về gốc + PRO/NORMAL
    if (!/\/NORMAL\//i.test(path) && !/\/PRO\//i.test(path)) {
      const base = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/') + '/';
      newPath = base + (toggle.checked ? 'PRO/' : 'NORMAL/');
    }
    window.location.href = newPath;
  });
});