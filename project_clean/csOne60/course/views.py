import csv
from django.shortcuts import render, redirect, get_object_or_404
from analysis.models import Course, Professor, Exam, Objective, TestTaken
# from django.contrib import messages

def add_course_with_csv(request):
    if request.method == 'POST':
        course_name = request.POST.get('course_name')
        prof_id = request.POST.get('prof_id')
        exam_file = request.FILES.get('exam_csv')
        slo_file = request.FILES.get('slo_csv')

        # 1. Create the course
        course = Course.objects.create(name=course_name, prof_id=prof_id)

        # 2. Create exams linked to this course
        if exam_file:
            decoded_exam = exam_file.read().decode('utf-8').splitlines()
            exam_reader = csv.reader(decoded_exam)
            for row in exam_reader:
                if row and row[0].strip():
                    Exam.objects.create(course_id=course.course_id, name=row[0].strip())

        # 3. Create SLOs linked to this course
        if slo_file:
            decoded_slo = slo_file.read().decode('utf-8').splitlines()
            slo_reader = csv.reader(decoded_slo)
            for row in slo_reader:
                if row and row[0].strip():
                    Objective.objects.create(course_id=course.course_id, outcome=row[0].strip())

        return redirect('courses')  # Or wherever your courses list is

    professors = Professor.objects.all()
    return render(request, 'course/add_course_csv.html', {'professors': professors})


def upload_test_scores(request, exam_id):
    exam = get_object_or_404(Exam, pk=exam_id)
    course = exam.course  # optional, for context

    if request.method == 'POST' and request.FILES.get('scores_csv'):
        scores_file = request.FILES['scores_csv']
        decoded_file = scores_file.read().decode('utf-8').splitlines()
        reader = csv.DictReader(decoded_file)

        for row in reader:
            student_id = row.get('student_id')
            question_id = row.get('question_id')
            score = row.get('score')

            if student_id and question_id and score != "":
                try:
                    score_val = float(score)  # convert to float
                    TestTaken.objects.update_or_create(
                        exam_id=exam_id,
                        student_id=student_id,
                        question_id=question_id,
                        defaults={'score': score_val}
                    )
                except ValueError:
                    continue

        return redirect('courses')  # or to the exam detail page

    return render(request, 'course/upload_scores.html', {'exam': exam, 'course': course})
