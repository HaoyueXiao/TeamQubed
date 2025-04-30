from django.urls import path
from . import views

app_name = 'course'  # <- this is the namespace

urlpatterns = [
    path('add-course-csv/', views.add_course_with_csv, name='add_course_csv'),
    path('upload-scores/<int:exam_id>/', views.upload_test_scores, name='upload_test_scores'),
]
