from django.urls import path
from . import views

app_name = 'course' 

urlpatterns = [
    path('course/add/', views.add_course, name='add_course')

]
