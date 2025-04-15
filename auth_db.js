// User Authentication and Management System

// Initialize localStorage if needed
const SHEET_API_BASE = 'https://script.google.com/macros/s/AKfycbxEV3HA7RfPCxozYN9JcKKQFs5GsY6o6Cup-BuIPyKxmPJwboOwcTEzo18DgrxoRNXb1w/exec';
const WEB_APP_ID = "AKfycbxEV3HA7RfPCxozYN9JcKKQFs5GsY6o6Cup-BuIPyKxmPJwboOwcTEzo18DgrxoRNXb1w"
const auth = {
  // Register a new user
  register: async function(firstName, lastName, email, password) {
    const payload = {
      action: 'register',
      firstName,
      lastName,
      email,
      password,
    };

    const response = await fetch(SHEET_API_BASE, {
      method: 'POST',
      //headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    localStorage.setItem('q3_current_user', JSON.stringify(result.user));
    return result.user;
  },

  login: async function(email, password) {
    const response = await fetch(`${SHEET_API_BASE}?action=login&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    localStorage.setItem('q3_current_user', JSON.stringify(result.user));
    return result.user;
  },

  logout: function() {
    localStorage.setItem('q3_current_user', '');
    window.location.href = 'index.html';
  },

  getCurrentUser: function() {
    const user = localStorage.getItem('q3_current_user');
    return user ? JSON.parse(user) : null;
  },

  isLoggedIn: function() {
    return !!this.getCurrentUser();
  },

  getUserCourses: async function() {
    const user = this.getCurrentUser();
    if (!user) return [];
    const response = await fetch(`${SHEET_API_BASE}?action=getCourses&userId=${user.id}`);
    const result = await response.json();
    return result.courses || [];
  },

  addCourse: async function(course) {
    const user = this.getCurrentUser();
    if (!user) return false;
    const response = await fetch(SHEET_API_BASE, {
      method: 'POST',
      //headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'addCourse', userId: user.id, course })
    });
    const result = await response.json();
    return result.success;
  },

  updateCourse: async function(courseId, updatedCourse) {
    const user = this.getCurrentUser();
    if (!user) return false;
    const response = await fetch(SHEET_API_BASE, {
      method: 'POST',
      //headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateCourse', courseId, updatedCourse })
    });
    const result = await response.json();
    return result.success;
  },

  deleteCourse: async function(courseId) {
    const user = this.getCurrentUser();
    if (!user) return false;
    const response = await fetch(SHEET_API_BASE, {
      method: 'POST',
      //headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deleteCourse', courseId })
    });
    const result = await response.json();
    return result.success;
  },

  isLoggedIn: function() {
    return !!this.getCurrentUser();
  }  
};

function protectRoute() {
    if (!auth.isLoggedIn() && !window.location.pathname.endsWith('index.html')) {
      window.location.href = 'index.html';
    }
  }
  