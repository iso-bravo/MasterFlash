from django.urls import path
from . import views

urlpatterns = [
    path('inserts/generate/', views.generate_inserts_report, name='generate_inserts_report'),
    path("rubber/generate/",views.generate_rubber_report, name='generate_rubber_report')
]