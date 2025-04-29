from django.contrib import admin
from .models import Professor, Course, Student, Enroll, \
                    Exam, Objective, Question, TestTaken, \
                    Feedback

admin.site.register(Professor)
admin.site.register(Course)
admin.site.register(Student)
admin.site.register(Enroll)
admin.site.register(Exam)
admin.site.register(Objective)
admin.site.register(Question)
admin.site.register(TestTaken)
admin.site.register(Feedback)
