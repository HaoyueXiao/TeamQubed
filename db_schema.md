# Course Data Schema Reference

### Courses
```json
Course {
  id: number;
  name: string;
  instructorId: number;
  createdAt: string;
  topics: string[]; // optional: ["Data Structures", "Algorithms"]
  assignments: Assignment[]; // structured assignment metadata
  students: Student[]; // enrolled students
}
```
### Assignments
```json
Assignment {
  id: string; // uuid or number
  title: string; // "Assignment 1"
  dueDate: string; // ISO string
  topic?: string; // "Algorithms"
  type: 'assignment' | 'homework' | 'quiz' | 'project';
  maxScore: number; // e.g. 100
}
```
### Students
```json
Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
  comments?: Comment[];
  submissions: Submission[]; // tracks scores per assignment
  midterm?: number;
  final?: number;
  totalGrade?: number; // auto-computed
}
```
### Submissions
```json
Submission {
  assignmentId: string; // match to Course.assignments.id
  score: number;
  submittedAt?: string; // optional: for lateness analysis
  feedback?: string;
}
```
### Example:

```json
{
  id: 123,
  name: "CS 101",
  assignments: [
    { id: "a1", title: "Assignment 1", dueDate: "2025-04-10", topic: "Data Structures", type: "assignment", maxScore: 100 },
    { id: "h1", title: "Homework 1", dueDate: "2025-04-15", topic: "Algorithms", type: "homework", maxScore: 100 }
  ],
  students: [
    {
      id: "s1",
      firstName: "Alice",
      lastName: "Smith",
      email: "alice@example.com",
      active: true,
      submissions: [
        { assignmentId: "a1", score: 90, submittedAt: "2025-04-09" },
        { assignmentId: "h1", score: 85, submittedAt: "2025-04-15" }
      ],
      midterm: 92,
      final: 87
    }
  ]
}
```
