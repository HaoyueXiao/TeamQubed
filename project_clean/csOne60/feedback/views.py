from django.shortcuts import render, get_object_or_404, redirect
from analysis.models import Course, Student
from .models import Feedback
from django.contrib import messages

# def feedback_students_view(request, course_id):
#     course = get_object_or_404(Course, pk=course_id)
#     students = Student.objects.filter(enrollments__course_id=course_id).distinct()
#     return render(request, 'feedback/feedback_students.html', {'course': course, 'students': students})

def feedback_search(request, course_id):
    course = get_object_or_404(Course, pk=course_id)
    students = Student.objects.filter(enrollments__course_id=course_id).distinct()
    return render(request, 'feedback/feedback_students.html', {'course': course, 'students': students})

def feedback_report(request, course_id):
    course = get_object_or_404(Course, pk=course_id)
    feedbacks = Feedback.objects.filter(course_id=course_id)
    return render(request, 'feedback/feedback_report.html', {'course': course, 'feedbacks': feedbacks})


def feedback_students_view(request, course_id, student_id):
    course_id = int(course_id)
    student_id = int(student_id)
    
    student = get_object_or_404(Student, pk=student_id)
    feedbacks = Feedback.objects.filter(course_id=course_id, student_id=student_id).order_by('-feedback_id')

    context = {
        'course_id': course_id,
        'student': student,
        'feedbacks': feedbacks,
    }
    return render(request, 'feedback/student_feedback.html', context)


def create_feedback(request, course_id, student_id):
    course = get_object_or_404(Course, pk=course_id)
    student = get_object_or_404(Student, pk=student_id)

    if request.method == 'POST':
        feedback_text = request.POST.get('feedback')

        feedback_obj, created = Feedback.objects.get_or_create(
            student=student,       # <- OK to pass object, because FK
            prof=course.prof,       # <- OK to pass object, because FK
            course=course,          # <- OK to pass object, because FK
            defaults={'feedback': feedback_text}
        )

        return redirect('feedback:feedback_report', course_id=course_id)

    return render(request, 'feedback/create_feedback.html', {
        'course': course,
        'student': student,
    })
    

def generate_feedback_view(request, exam_id):
    return render(request, 'feedback/feedback_generated.html')
