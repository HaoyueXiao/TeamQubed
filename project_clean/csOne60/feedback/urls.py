from django.urls import path
from . import views

app_name = 'feedback'   # <<<<<< ADD THIS LINE

urlpatterns = [
    path('generate-feedback/<int:exam_id>/', views.generate_feedback_view, name='generate_feedback'),
    path('feedback-report/<int:course_id>/', views.feedback_report, name='feedback_report'),
    path('courses/<int:course_id>/students/feedback/', views.feedback_students_view, name='feedback_students'),
    path('courses/<int:course_id>/student/<int:student_id>/feedback/', views.feedback_students_view, name='feedback_students_view'),
    path('search/<int:course_id>/', views.feedback_search, name='feedback_search'),
    path('create/<int:course_id>/<int:student_id>/', views.create_feedback, name='create_feedback'),
]
