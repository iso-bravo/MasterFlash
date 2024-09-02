from django.urls import path
from . import views

urlpatterns = [
    path('inserts/generate/', views.generate_inserts_report, name='generate_report'),
    path("rubber/generate/")
]