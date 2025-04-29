from django.db import models

# Professor model
class Professor(models.Model):
    professor_id = models.AutoField(primary_key=True)
    l_name = models.CharField(max_length=255)
    f_name = models.CharField(max_length=255)
    email = models.EmailField()

    def __str__(self):
        return f"{self.f_name} {self.l_name}"

# Course model
class Course(models.Model):
    course_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    prof = models.ForeignKey(Professor, on_delete=models.CASCADE, related_name='courses')

    def __str__(self):
        return self.name

    # Exam model

class Exam(models.Model):
    exam_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255 , default='')  # Add this line
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='exams')

    def __str__(self):
        return f"{self.name} (Course ID: {self.course.course_id})"

    
# Objective model
class Objective(models.Model):
    objective_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, default='')  # Add this line
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='objectives')
    outcome = models.TextField()

    def __str__(self):
        return f"{self.name} - {self.course.name}"


# Question model    
class Question(models.Model):
    question_id = models.AutoField(primary_key=True)
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='questions')
    objective = models.ForeignKey(Objective, on_delete=models.CASCADE, related_name='questions')
    question = models.TextField()
    points = models.DecimalField(max_digits=5, decimal_places=2, default=10.00)  # New field for points

    def __str__(self):
        return f"{self.question}"


# Student model
class Student(models.Model):
    student_id = models.AutoField(primary_key=True)
    l_name = models.CharField(max_length=255)
    f_name = models.CharField(max_length=255)
    email = models.EmailField()

    def __str__(self):
        return f"{self.f_name} {self.l_name}"

# Enroll model (many-to-many relationship between students and courses)
class Enroll(models.Model):
    enroll_id = models.AutoField(primary_key=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')

    def __str__(self):
        return f"{self.student.f_name} {self.student.l_name} - {self.course.name}"

# TestTaken model (tracks student performance on questions within an exam)
class TestTaken(models.Model):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='test_taken')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='tests_taken')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='test_takens')
    score = models.DecimalField(max_digits=5, decimal_places=2)  # Score can be a decimal

    def __str__(self):
        return f"Student {self.student.f_name} {self.student.l_name} scored {self.score} on {self.exam}"


# Feedback model (students give feedback to professors about courses)
class Feedback(models.Model):
    feedback_id = models.AutoField(primary_key=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='feedbacks')
    prof = models.ForeignKey(Professor, on_delete=models.CASCADE, related_name='feedbacks')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='feedbacks')
    feedback = models.TextField(max_length=2000)

    def __str__(self):
        return f"Feedback by {self.student.f_name} {self.student.l_name} for {self.prof.f_name} {self.prof.l_name} in {self.course.name}"
