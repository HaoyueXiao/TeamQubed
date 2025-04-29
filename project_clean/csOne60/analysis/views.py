import csv
import io
from django.shortcuts import render, redirect, get_object_or_404
# from django.contrib.auth.decorators import login_required
from .models import Course, Student, Enroll, Professor, \
                    Exam, Question, TestTaken, Objective, \
                    Feedback
from .forms import StudentCSVUploadForm
from .forms import TestTakenUploadForm
# from django.conf import settings
import json
# from django.utils.safestring import mark_safe
from decimal import Decimal
from collections import defaultdict
import squarify


# View function for homepage
def index(request):
    courses = Course.objects.all()
    return render(request, 'index.html', {'courses': courses})

def contact(request):
    return render(request, 'analysis/contact.html')

def about(request):
    return render(request, 'analysis/about.html')

# @login_required
import csv
import io
from django.shortcuts import render, get_object_or_404
from .forms import StudentCSVUploadForm
from .models import Student, Enroll, Course, Professor

def upload_students_to_course(request, course_id):
    professor = get_object_or_404(Professor, professor_id=1)  # using placeholder ID
    course = get_object_or_404(Course, course_id=course_id, prof_id=professor)

    if request.method == 'POST':
        form = StudentCSVUploadForm(request.POST, request.FILES)
        if form.is_valid():
            csv_file = request.FILES['csv_file']
            decoded = csv_file.read().decode('utf-8')
            io_string = io.StringIO(decoded)
            reader = csv.DictReader(io_string)

            added_students = []

            for row in reader:
                if 'email' in row and 'f_name' in row and 'l_name' in row:
                    email = row['email'].strip()
                    f_name = row['f_name'].strip()
                    l_name = row['l_name'].strip()

                    student, _ = Student.objects.get_or_create(
                        email=email,
                        defaults={'f_name': f_name, 'l_name': l_name}
                    )
                    if not Enroll.objects.filter(student=student, course=course).exists():
                        Enroll.objects.create(student=student, course=course)

                    added_students.append(student)

            return render(request, 'analysis/upload_success.html', {
                'course': course,
                'students': added_students
            })
    else:
        form = StudentCSVUploadForm()

    return render(request, 'analysis/upload_students.html', {'form': form, 'course': course})


def courses_view(request):
    courses = Course.objects.all()
    return render(request, 'analysis/courses.html', {'courses': courses})
    
def course_students_view(request, course_id):
    course = get_object_or_404(Course, course_id=course_id)
    enrollments = Enroll.objects.filter(course=course)

    students = []
    for enrollment in enrollments:
        try:
            students.append(enrollment.student)
        except Student.DoesNotExist:
            continue

    return render(request, 'analysis/course_students.html', {
        'course': course,
        'students': students
    })

def class_slo_analysis_view(request, course_id):
    objectives = Objective.objects.filter(course_id=course_id)
    slo_names = [obj.name for obj in objectives]
    slo_percentages = []

    for obj in objectives:
        questions = Question.objects.filter(objective=obj)
        total_earned = 0
        total_possible = 0

        for q in questions:
            test_scores = TestTaken.objects.filter(question=q)
            for score in test_scores:
                total_earned += float(score.score)  # Convert Decimal to float
                total_possible += float(q.points)   # Convert Decimal to float

        # ✅ Convert percentage to float before appending
        percentage = (total_earned / total_possible * 100) if total_possible > 0 else 0
        slo_percentages.append(round(percentage, 2))  # No Decimal here

    context = {
        'slo_names_json': json.dumps(slo_names),  # Note the key name
        'slo_scores_json': json.dumps(slo_percentages)  # No need for mark_safe anymore
    }

    return render(request, 'analysis/slo_analysis.html', context)

def student_slo_analysis_view(request, course_id, student_id):
    course = get_object_or_404(Course, course_id=course_id)
    student = get_object_or_404(Student, student_id=student_id)   # <-- ADD THIS

    objectives = Objective.objects.filter(course_id=course_id)
    slo_names = [obj.name for obj in objectives]
    slo_percentages = []

    for obj in objectives:
        questions = Question.objects.filter(objective=obj)
        total_earned = 0
        total_possible = 0

        for q in questions:
            try:
                score_obj = TestTaken.objects.get(question=q, student_id=student_id)
                total_earned += float(score_obj.score)
                total_possible += float(q.points)
            except TestTaken.DoesNotExist:
                continue

        percentage = (total_earned / total_possible * 100) if total_possible > 0 else 0
        slo_percentages.append(round(percentage, 2))

    context = {
        'student': student,                    # <-- ADD THIS
        'course': course,                       # <-- ADD THIS (optional if you want course name too)
        'slo_names_json': json.dumps(slo_names),
        'slo_scores_json': json.dumps(slo_percentages),
    }

    return render(request, 'analysis/student_slo_analysis.html', context)

def grade_treemap(request, exam_id):

    test_results = TestTaken.objects.filter(exam_id=exam_id)

    student_scores = defaultdict(float)
    for result in test_results:
        student_scores[result.student_id] += float(result.score)

    students = Student.objects.in_bulk(student_scores.keys())

    grade_scale = [
        (97, 'A+', '#00441b'),
        (93, 'A',  '#006d2c'),
        (90, 'A-', '#238b45'),
        (87, 'B+', '#41ab5d'),
        (83, 'B',  '#74c476'),
        (80, 'B-', '#a1d99b'),
        (77, 'C+', '#fdbb84'),
        (73, 'C',  '#fc8d59'),
        (70, 'C-', '#ef6548'),
        (67, 'D+', '#d7301f'),
        (63, 'D',  '#b30000'),
        (60, 'D-', '#7f0000'),
        (0,  'F',  '#000000'),
    ]

    student_boxes = []

    for student_id, total_score in student_scores.items():
        for threshold, grade, color in grade_scale:
            if total_score >= threshold:
                student = students.get(student_id)
                full_name = f"{student.f_name} {student.l_name}" if student else f"Student {student_id}"

                # full_name = f"{student.f_name} {student.l_name}" if student else f"Student {student_id}" 
                student_boxes.append({
                    'student_id': student_id,
                    'student_name': full_name,
                    'total_score': round(total_score, 2),
                    'grade': grade,
                    'color': color,
                    'x': 0,
                    'y': 0,
                    'width': 50,
                    'height': 50
                })
                                
                break

    grouped_by_grade = defaultdict(list)
    for box in student_boxes:
        grouped_by_grade[box['grade']].append(box)

    grade_order = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F']

    ordered_boxes = []
    for grade in grade_order:
        ordered_boxes.extend(grouped_by_grade.get(grade, []))

    sizes = [1 for _ in ordered_boxes]
    if sizes:
        rectangles = squarify.normalize_sizes(sizes, 100, 100)
        rectangles = squarify.squarify(rectangles, 0, 0, 100, 100)

        for student, rect in zip(ordered_boxes, rectangles):
            student['x'] = rect['x']
            student['y'] = rect['y']
            student['width'] = rect['dx']
            student['height'] = rect['dy']
            
    print("Sample student box:", ordered_boxes[0])

    return render(request, 'analysis/grade_treemap.html', {'student_boxes': ordered_boxes})
    # return render(request, 'grade_treemap.html', {'student_boxes': ordered_boxes})

def select_exam_upload_scores(request, course_id):
    course = get_object_or_404(Course, course_id=course_id)
    exams = Exam.objects.filter(course=course)

    return render(request, 'analysis/select_exam_upload_scores.html', {
        'course': course,
        'exams': exams
    })
    
def upload_test_scores(request, course_id):
    course = get_object_or_404(Course, course_id=course_id)
    exams = Exam.objects.filter(course=course)

    if request.method == 'POST':
        form = TestTakenUploadForm(request.POST, request.FILES)
        exam_id = request.POST.get('exam_id')

        if form.is_valid() and exam_id:
            exam = get_object_or_404(Exam, exam_id=exam_id)

            csv_file = request.FILES['csv_file']
            decoded = csv_file.read().decode('utf-8')
            io_string = io.StringIO(decoded)
            reader = csv.DictReader(io_string)

            records = []
            for row in reader:
                student_id = int(row['student_id'])
                question_id = int(row['question_id'])
                score = float(row['score'])

                student = get_object_or_404(Student, student_id=student_id)
                question = get_object_or_404(Question, question_id=question_id, exam=exam)

                test_taken, _ = TestTaken.objects.update_or_create(
                    student=student,
                    question=question,
                    exam=exam,
                    defaults={'score': score}
                )
                records.append(test_taken)

            return render(request, 'analysis/upload_test_success.html', {
                'exam': exam,
                'records': records
            })

    else:
        form = TestTakenUploadForm()

    return render(request, 'analysis/upload_test_scores.html', {
        'form': form,
        'course': course,
        'exams': exams
    })
    
def course_page(request, course_id):
    course = get_object_or_404(Course, pk=course_id)
    return render(request, 'course_page.html', {'course': course})

def add_single_student(request, course_id):
    course = get_object_or_404(Course, pk=course_id)

    if request.method == 'POST':
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        email = request.POST.get('email')

        if first_name and last_name and email:
            # Create the student
            student = Student.objects.create(
                f_name=first_name,
                l_name=last_name,
                email=email
            )
            # Enroll the student in the course
            Enroll.objects.create(
                student_id=student.student_id,
                course_id=course.course_id
            )

        return redirect('upload_students', course_id=course_id)

    return redirect('upload_students', course_id=course_id)