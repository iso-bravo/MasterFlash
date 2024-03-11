from django.urls import path
from . import views

urlpatterns = [
    path('arduino_data/<str:path>/<str:value>/', views.arduino_data, name='arduino_data'),
    path('client_data/', views.client_data, name='client_data'),
    
]