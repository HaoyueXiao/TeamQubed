from django.urls import path,include
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('contact/', views.contact, name='contact'),
    path('about/', views.about, name='about'),

    path('courses/', views.courses_view, name='courses'),
    path('courses/<int:course_id>/students/', views.course_students_view, name='course_students'),
    path('courses/<int:course_id>/upload-scores/', views.upload_test_scores, name='upload_test_scores'),
    path('courses/<int:course_id>/slo-analysis/', views.class_slo_analysis_view, name='class_slo_analysis'),
    path('courses/<int:course_id>/student/<int:student_id>/slo-analysis/', views.student_slo_analysis_view, name='student_slo_analysis'),

    path('upload-students/<int:course_id>/', views.upload_students_to_course, name='upload_students'),
    path('treemap/<int:exam_id>/', views.grade_treemap, name='grade_treemap'),
    
    
    
    path('add-single-student/<int:course_id>/', views.add_single_student, name='add_single_student'),
    
    path('courses/<int:course_id>/', views.course_page, name='course_page'),

]
