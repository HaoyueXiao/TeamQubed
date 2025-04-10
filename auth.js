// User Authentication and Management System

// Initialize localStorage if needed
if (!localStorage.getItem('q3_users')) {
    localStorage.setItem('q3_users', JSON.stringify([]));
}

if (!localStorage.getItem('q3_current_user')) {
    localStorage.setItem('q3_current_user', '');
}

const auth = {
    // Register a new user
    register: function(name, email, password) {
        try {
            if (!name || !email || !password) {
                throw new Error('All fields are required');
            }
            
            const users = JSON.parse(localStorage.getItem('q3_users'));
            
            // Check if email already exists
            if (users.some(user => user.email === email)) {
                throw new Error('Email already registered');
            }

            const newUser = {
                id: Date.now(),
                name,
                email,
                password, // Note: In production, this should be hashed
                courses: [],
                created: new Date().toISOString()
            };

            users.push(newUser);
            localStorage.setItem('q3_users', JSON.stringify(users));
            return newUser;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    // Login user
    login: function(email, password) {
        try {
            if (!email || !password) {
                throw new Error('Email and password are required');
            }
            
            const users = JSON.parse(localStorage.getItem('q3_users'));
            const user = users.find(u => u.email === email && u.password === password);
            
            if (!user) {
                throw new Error('Invalid credentials');
            }

            // Set current user session
            localStorage.setItem('q3_current_user', JSON.stringify({
                id: user.id,
                name: user.name,
                email: user.email
            }));

            return user;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    // Logout user
    logout: function() {
        try {
            localStorage.setItem('q3_current_user', '');
            window.location.href = 'index.html';
            return true;
        } catch (error) {
            console.error('Logout error:', error);
            return false;
        }
    },

    // Get current user
    getCurrentUser: function() {
        try {
            const currentUser = localStorage.getItem('q3_current_user');
            return currentUser ? JSON.parse(currentUser) : null;
        } catch (error) {
            console.error('Get current user error:', error);
            return null;
        }
    },

    // Check if user is logged in
    isLoggedIn: function() {
        return !!this.getCurrentUser();
    },

    // Get user's courses
    getUserCourses: function() {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) return [];

            const users = JSON.parse(localStorage.getItem('q3_users'));
            const user = users.find(u => u.id === currentUser.id);
            return user ? user.courses : [];
        } catch (error) {
            console.error('Get user courses error:', error);
            return [];
        }
    },

    // Add course for current user
    addCourse: function(course) {
        try {
            if (!course) {
                return false;
            }
            
            const currentUser = this.getCurrentUser();
            if (!currentUser) return false;

            const users = JSON.parse(localStorage.getItem('q3_users'));
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            
            if (userIndex === -1) return false;

            users[userIndex].courses.push(course);
            localStorage.setItem('q3_users', JSON.stringify(users));
            return true;
        } catch (error) {
            console.error('Add course error:', error);
            return false;
        }
    },

    // Update course for current user
    updateCourse: function(courseId, updatedCourse) {
        try {
            if (!courseId || !updatedCourse) {
                return false;
            }
            
            const currentUser = this.getCurrentUser();
            if (!currentUser) return false;

            const users = JSON.parse(localStorage.getItem('q3_users'));
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            
            if (userIndex === -1) return false;

            const courseIndex = users[userIndex].courses.findIndex(c => c.id === courseId);
            if (courseIndex === -1) return false;

            // Ensure we preserve the course structure
            users[userIndex].courses[courseIndex] = {
                id: courseId,
                name: updatedCourse.name,
                subject: updatedCourse.subject,
                description: updatedCourse.description || '',
                students: updatedCourse.students || [],
                created: updatedCourse.created || users[userIndex].courses[courseIndex].created
            };

            localStorage.setItem('q3_users', JSON.stringify(users));
            return true;
        } catch (error) {
            console.error('Update course error:', error);
            return false;
        }
    },

    // Delete course for current user
    deleteCourse: function(courseId) {
        try {
            if (!courseId) {
                return false;
            }
            
            const currentUser = this.getCurrentUser();
            if (!currentUser) return false;

            const users = JSON.parse(localStorage.getItem('q3_users'));
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            
            if (userIndex === -1) return false;

            users[userIndex].courses = users[userIndex].courses.filter(c => c.id !== courseId);
            localStorage.setItem('q3_users', JSON.stringify(users));
            return true;
        } catch (error) {
            console.error('Delete course error:', error);
            return false;
        }
    }
};

// Protect routes - redirect to login if not authenticated
function protectRoute() {
    if (!auth.isLoggedIn() && !window.location.pathname.endsWith('index.html')) {
        window.location.href = 'index.html';
    }
}

// Load courses from localStorage on page load
window.onload = function() {
    try {
        const savedCourses = localStorage.getItem('courses');
        if (savedCourses) {
            courses = JSON.parse(savedCourses);
            if (typeof updateDisplay === 'function') {
                updateDisplay();
            }
        }
    } catch (error) {
        console.error('Error loading courses:', error);
    }
} 
