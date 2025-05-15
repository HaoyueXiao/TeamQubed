
const STORAGE_KEYS = {
    USERS: 'q3_users',
    CURRENT_USER: 'q3_current_user',
    DARK_MODE: 'q3_dark_mode',
    COURSE_DATA_PREFIX: 'courseData_'
};

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
    register(firstName, lastName, email, password) {
        try {
            if (!firstName || !lastName || !email || !password) {
                throw new Error('All fields are required');
            }
            
            const users = getUsers();
            
            if (users.some(user => user.email === email)) {
                throw new Error('Email already registered');
            }

            const newUser = {
                id: Date.now(),
                firstName,
                lastName,
                name: `${firstName} ${lastName}`,
                email,
                password,
                courses: [],
                darkMode: false,
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

            const userSession = {
                id: user.id,
                name: user.name,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email,
                darkMode: user.darkMode || false
            };
            
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userSession));

            this.setDarkMode(user.darkMode || false);

            return user;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    logout() {
        try {
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, '');
            
            localStorage.setItem(STORAGE_KEYS.DARK_MODE, 'false');
            document.documentElement.classList.remove('dark-mode');
            
            window.location.href = 'index.html';
            return true;
        } catch (error) {
            console.error('Logout error:', error);
            return false;
        }
    },


    getCurrentUser() {
        try {
            return getCurrentUserObj();
        } catch (error) {
            console.error('Get current user error:', error);
            return null;
        }
    },


    isLoggedIn() {
        return !!this.getCurrentUser();
    },


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

    addCourse(course) {
        try {
            if (!course) return false;
            
            const currentUser = this.getCurrentUser();
            if (!currentUser) return false;

            const users = getUsers();
            const userIndex = findCurrentUserIndex(users, currentUser);
            
            if (userIndex === -1) return false;

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
            
            users[userIndex].courses[courseIndex] = updatedCourse;
            
            saveUsers(users);
            
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
            
            localStorage.removeItem(`${STORAGE_KEYS.COURSE_DATA_PREFIX}${courseId}`);
            
            return true;
        } catch (error) {
            console.error('Delete course error:', error);
            return false;
        }
    },

    getDarkMode() {
        return localStorage.getItem(STORAGE_KEYS.DARK_MODE) === 'true';
    },

    setDarkMode(isDark) {
        localStorage.setItem(STORAGE_KEYS.DARK_MODE, isDark.toString());
        
        const currentUser = this.getCurrentUser();
        if (currentUser) {
            const users = getUsers();
            const userIndex = findCurrentUserIndex(users, currentUser);
            
            if (userIndex !== -1) {
                users[userIndex].darkMode = isDark;
                saveUsers(users);
                
                currentUser.darkMode = isDark;
                localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
            }
        }
        
        document.documentElement.classList.add('dark-mode-transition');
        
        if (isDark) {
            setTimeout(() => document.documentElement.classList.add('dark-mode'), 50);
        } else {
            document.documentElement.classList.remove('dark-mode');
        }
        
        return isDark;
    },

    toggleDarkMode() {
        return this.setDarkMode(!this.getDarkMode());
    },
    
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

function protectRoute() {
    if (!auth.isLoggedIn() && !window.location.pathname.endsWith('index.html')) {
        window.location.href = 'index.html';
    }
}

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
