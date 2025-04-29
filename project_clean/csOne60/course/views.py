from django.shortcuts import render, redirect
from analysis.models import Course, Professor
from django.contrib import messages

def add_course(request):
    if request.method == 'POST':
        course_name = request.POST.get('course_name')
        prof_id = request.POST.get('prof_id')

        if course_name and prof_id:
            Course.objects.create(name=course_name, prof_id=prof_id)
            messages.success(request, 'Course added successfully!')
            return redirect('courses')  # Home page

    return render(request, 'course/add_course.html')


def add_course(request):
    if request.method == 'POST':
        course_name = request.POST.get('course_name')

        # TEMP: Use a hardcoded professor (e.g., professor_id = 1)
        try:
            professor = Professor.objects.get(professor_id=1)  # TODO:Replace 1 with a valid ID
        except Professor.DoesNotExist:
            return render(request, 'course/add_course.html', {
                'error': 'Temporary professor not found in database.'
            })

        Course.objects.create(name=course_name, prof_id=professor.professor_id)
        return redirect('index')

    return render(request, 'course/add_course.html')
