// TradePulse — Authentication (localStorage demo)

const AUTH_USERS_KEY = 'tradepulse_users';
const AUTH_SESSION_KEY = 'tradepulse_session';

const DEMO_USER = {
  name: 'Abhinay Singh',
  email: 'demo@tradepulse.com',
  password: 'demo123',
  clientId: 'TradePulse User'
};

function getUsers() {
  const stored = localStorage.getItem(AUTH_USERS_KEY);
  let users = stored ? JSON.parse(stored) : [];
  users = users.map(u => {
    if (u.email === DEMO_USER.email || u.name === 'Ankit Sharma') {
      return { ...u, name: 'Abhinay Singh', clientId: 'TradePulse User' };
    }
    return u;
  });
  const hasDemo = users.some(u => u.email === DEMO_USER.email);
  if (!hasDemo) {
    users.unshift({ ...DEMO_USER });
  }
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
  return users;
}

function saveUsers(users) {
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
}

function getSession() {
  const session = localStorage.getItem(AUTH_SESSION_KEY);
  if (!session) return null;
  try {
    const parsed = JSON.parse(session);
    if (parsed.name === 'Ankit Sharma') parsed.name = 'Abhinay Singh';
    if (parsed.clientId === 'TP1024') parsed.clientId = 'TradePulse User';
    return parsed;
  } catch (e) {
    return null;
  }
}

function setSession(user) {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({
    name: user.name || 'Abhinay Singh',
    email: user.email,
    clientId: user.clientId || 'TradePulse User'
  }));
}

function clearSession() {
  localStorage.removeItem(AUTH_SESSION_KEY);
}

function requireAuth() {
  if (!getSession()) {
    window.location.href = 'login.html';
  }
}

function redirectIfLoggedIn() {
  if (getSession()) {
    window.location.href = 'index.html';
  }
}

function login(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password !== password) {
    return { success: false, message: 'Invalid email or password' };
  }
  setSession(user);
  return { success: true };
}

function signup(name, email, password) {
  const users = getUsers();
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, message: 'An account with this email already exists' };
  }
  const newUser = {
    name,
    email,
    password,
    clientId: 'TP' + Math.floor(1000 + Math.random() * 9000)
  };
  users.push(newUser);
  saveUsers(users);
  setSession(newUser);
  return { success: true };
}

function logout() {
  clearSession();
  window.location.href = 'login.html';
}

// Login page init
if (document.getElementById('loginForm')) {
  redirectIfLoggedIn();

  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.auth-form').forEach(f => f.classList.add('hidden'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab + 'Form').classList.remove('hidden');
    });
  });

  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');
    const result = login(email, password);
    if (result.success) {
      window.location.href = 'index.html';
    } else {
      errorEl.textContent = result.message;
      errorEl.classList.remove('hidden');
    }
  });

  document.getElementById('signupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;
    const errorEl = document.getElementById('signupError');

    if (password !== confirm) {
      errorEl.textContent = 'Passwords do not match';
      errorEl.classList.remove('hidden');
      return;
    }

    const result = signup(name, email, password);
    if (result.success) {
      window.location.href = 'index.html';
    } else {
      errorEl.textContent = result.message;
      errorEl.classList.remove('hidden');
    }
  });
}