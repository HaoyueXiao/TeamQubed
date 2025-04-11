# Q³ - Qubed Project

![Q³ Logo](https://placeholder-for-logo.com/200x80)

Q³ is a streamlined learning management system (LMS) designed for educators to manage courses, track student progress, and analyze performance data. The application provides an intuitive interface for professors to organize their course materials, monitor student grades, and generate insights about class performance.

## Features

### User Management
- **Account Creation**: Users can register with their first name, last name, email, and password
- **User Authentication**: Secure login system with session management
- **Profile Settings**: Users can update their name and password

### Course Management
- **Course Creation**: Create new courses with name, subject, and description
- **Student Import**: Bulk import students from CSV or Excel files
- **Course Dashboard**: Overview of all courses with quick access to management tools

### Student Management
- **Student Profiles**: Track individual student information and performance
- **Grading System**: Comprehensive grading for midterms, finals, assignments, and homework
- **Activity Tracking**: Toggle student active/inactive status
- **Student Reports**: Generate detailed progress reports for each student

### Grade Analysis
- **Performance Metrics**: Calculate weighted grades based on customizable criteria
- **Visual Representations**: Progress bars for quick grade assessment
- **AI-Powered Insights**: Generate AI summaries of student performance

## Technologies Used

- HTML5, CSS3, and vanilla JavaScript
- LocalStorage for data persistence
- Modular architecture for easy extension
- Responsive design for desktop and mobile

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server or database setup required (uses client-side storage)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/qubed-project.git
   ```

2. Open the project folder
   ```
   cd qubed-project
   ```

3. Open the `index.html` file in your browser
   ```
   open index.html
   ```

### First-time Setup

1. Create a new account from the registration page
2. Log in with your credentials
3. Create your first course from the home dashboard
4. Import students or add them manually

## Usage Guide

### Creating a Course
1. Click the "+" button on the home dashboard
2. Fill in the course details (name, subject, description)
3. Optionally import students via CSV/Excel file
4. Click "Create Course"

### Managing Students
1. Navigate to a course
2. View the list of students
3. Use the edit button to update student information or grades
4. Use the toggle to change student active status
5. Click "Get Report" to view detailed student reports

### Updating Account Settings
1. Click the settings icon in the sidebar
2. Update your first name, last name, or password
3. Enter your current password to confirm changes
4. Click "Save Settings"

## Data Format

### Student Import Format
CSV file with the following columns:
- First Name
- Last Name
- Email
- Student ID (optional)
- Midterm Grade
- Assignment 1 Grade
- Assignment 2 Grade
- Assignment 3 Grade
- Homework 1 Grade
- Homework 2 Grade
- Homework 3 Grade
- Final Grade
- Comments (optional)

## Contributing

We welcome contributions to improve Q³. Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Project Link: https://github.com/yourusername/qubed-project

## Acknowledgements

- Google Fonts for Material Icons
- The amazing educators who provided feedback during development 
