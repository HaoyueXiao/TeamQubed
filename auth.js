// User Authentication and Management System

// Storage keys
const STORAGE_KEYS = {
    USERS: 'q3_users',
    CURRENT_USER: 'q3_current_user',
    DARK_MODE: 'q3_dark_mode',
    COURSE_DATA_PREFIX: 'courseData_'
};

// Initialize localStorage if needed
(() => {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
    }
    
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, '');
    }
    
    if (!localStorage.getItem(STORAGE_KEYS.DARK_MODE)) {
        localStorage.setItem(STORAGE_KEYS.DARK_MODE, 'false');
    }
})();

function getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS));
}

function saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

function getCurrentUserObj() {
    const currentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return currentUser ? JSON.parse(currentUser) : null;
}

function findCurrentUserIndex(users, currentUser) {
    return users.findIndex(u => u.id === currentUser.id);
}

const auth = {
    // Register a new user
    register(firstName, lastName, email, password) {
        try {
            if (!firstName || !lastName || !email || !password) {
                throw new Error('All fields are required');
            }
            
            const users = getUsers();
            
            // Check if email already exists
            if (users.some(user => user.email === email)) {
                throw new Error('Email already registered');
            }

            const newUser = {
                id: Date.now(),
                firstName,
                lastName,
                name: `${firstName} ${lastName}`, // Keep for backward compatibility
                email,
                password, // Note: In production, this should be hashed
                courses: [],
                darkMode: false, // Default to light mode
                created: new Date().toISOString()
            };

            users.push(newUser);
            saveUsers(users);
            return newUser;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    // Login user
    login(email, password) {
        try {
            if (!email || !password) {
                throw new Error('Email and password are required');
            }
            
            const users = getUsers();
            const user = users.find(u => u.email === email && u.password === password);
            
            if (!user) {
                throw new Error('Invalid credentials');
            }

            // Set current user session
            const userSession = {
                id: user.id,
                name: user.name,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email,
                darkMode: user.darkMode || false
            };
            
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userSession));

            // Set dark mode based on user preference
            this.setDarkMode(user.darkMode || false);

            return user;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    // Logout user
    logout() {
        try {
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, '');
            
            // Reset dark mode to light mode on logout
            localStorage.setItem(STORAGE_KEYS.DARK_MODE, 'false');
            document.documentElement.classList.remove('dark-mode');
            
            window.location.href = 'index.html';
            return true;
        } catch (error) {
            console.error('Logout error:', error);
            return false;
        }
    },

    // Get current user
    getCurrentUser() {
        try {
            return getCurrentUserObj();
        } catch (error) {
            console.error('Get current user error:', error);
            return null;
        }
    },

    // Check if user is logged in
    isLoggedIn() {
        return !!this.getCurrentUser();
    },

    // Get user's courses
    getUserCourses() {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) return [];

            const users = getUsers();
            const user = users.find(u => u.id === currentUser.id);
            return user ? user.courses : [];
        } catch (error) {
            console.error('Get user courses error:', error);
            return [];
        }
    },

    // Add course for current user
    addCourse(course) {
        try {
            if (!course) return false;
            
            const currentUser = this.getCurrentUser();
            if (!currentUser) return false;

            const users = getUsers();
            const userIndex = findCurrentUserIndex(users, currentUser);
            
            if (userIndex === -1) return false;

            // Ensure course has all required fields
            const newCourse = {
                id: course.id || Date.now(),
                name: course.name,
                subject: course.subject,
                description: course.description || '',
                students: course.students || [],
                importedData: course.importedData || [],
                created: course.created || new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            };

            users[userIndex].courses.push(newCourse);
            saveUsers(users);
            return true;
        } catch (error) {
            console.error('Add course error:', error);
            return false;
        }
    },

    // Update course for current user
    updateCourse(courseId, updatedCourse) {
        try {
            const users = getUsers();
            const currentUser = this.getCurrentUser();
            
            if (!currentUser) {
                throw new Error('User not logged in');
            }
            
            const userIndex = findCurrentUserIndex(users, currentUser);
            
            if (userIndex === -1) {
                throw new Error('User not found');
            }
            
            const courseIndex = users[userIndex].courses.findIndex(c => c.id === courseId);
            
            if (courseIndex === -1) {
                throw new Error('Course not found');
            }
            
            // Update the course
            users[userIndex].courses[courseIndex] = updatedCourse;
            
            // Save to localStorage
            saveUsers(users);
            
            // Update analysis data
            const courseDataForAnalysis = {
                id: updatedCourse.id,
                name: updatedCourse.name,
                subject: updatedCourse.subject,
                students: updatedCourse.students.map(student => ({
                    id: student.id,
                    name: `${student.firstName} ${student.lastName}`,
                    firstName: student.firstName,
                    lastName: student.lastName,
                    assignments: student.grades.assignments.map(assignment => ({
                        name: assignment.name,
                        grade: assignment.grade
                    })),
                    exams: [
                        { name: 'Midterm', grade: student.grades.midterm },
                        { name: 'Final', grade: student.grades.final }
                    ]
                }))
            };
            this.saveCourseDataForAnalysis(courseId, courseDataForAnalysis);
            
            return true;
        } catch (error) {
            console.error('Error updating course:', error);
            return false;
        }
    },

    // Delete course for current user
    deleteCourse(courseId) {
        try {
            if (!courseId) return false;
            
            const currentUser = this.getCurrentUser();
            if (!currentUser) return false;

            const users = getUsers();
            const userIndex = findCurrentUserIndex(users, currentUser);
            
            if (userIndex === -1) return false;

            users[userIndex].courses = users[userIndex].courses.filter(c => c.id !== courseId);
            saveUsers(users);
            
            // Also delete course analysis data if it exists
            localStorage.removeItem(`${STORAGE_KEYS.COURSE_DATA_PREFIX}${courseId}`);
            
            return true;
        } catch (error) {
            console.error('Delete course error:', error);
            return false;
        }
    },

    // Get dark mode preference
    getDarkMode() {
        return localStorage.getItem(STORAGE_KEYS.DARK_MODE) === 'true';
    },

    // Set dark mode preference
    setDarkMode(isDark) {
        localStorage.setItem(STORAGE_KEYS.DARK_MODE, isDark.toString());
        
        // Update the current user's preference if logged in
        const currentUser = this.getCurrentUser();
        if (currentUser) {
            const users = getUsers();
            const userIndex = findCurrentUserIndex(users, currentUser);
            
            if (userIndex !== -1) {
                users[userIndex].darkMode = isDark;
                saveUsers(users);
                
                // Update current user session
                currentUser.darkMode = isDark;
                localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
            }
        }
        
        // Apply dark mode to the document with transition
        document.documentElement.classList.add('dark-mode-transition');
        
        if (isDark) {
            setTimeout(() => document.documentElement.classList.add('dark-mode'), 50);
        } else {
            document.documentElement.classList.remove('dark-mode');
        }
        
        return isDark;
    },

    // Toggle dark mode
    toggleDarkMode() {
        return this.setDarkMode(!this.getDarkMode());
    },
    
    // Save course data for analysis
    saveCourseDataForAnalysis(courseId, data) {
        try {
            const analysisData = JSON.parse(localStorage.getItem('q3_analysis_data') || '{}');
            analysisData[courseId] = data;
            localStorage.setItem('q3_analysis_data', JSON.stringify(analysisData));
            return true;
        } catch (error) {
            console.error('Error saving analysis data:', error);
            return false;
        }
    },
    
    // Get course data for analysis
    getCourseDataForAnalysis(courseId) {
        try {
            const analysisData = JSON.parse(localStorage.getItem('q3_analysis_data') || '{}');
            return analysisData[courseId] || null;
        } catch (error) {
            console.error('Error getting analysis data:', error);
            return null;
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
        if (savedCourses && typeof updateDisplay === 'function') {
            courses = JSON.parse(savedCourses);
            updateDisplay();
        }
    } catch (error) {
        console.error('Error loading courses:', error);
    }
} 
