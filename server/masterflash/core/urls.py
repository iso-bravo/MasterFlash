from django.urls import path
from . import views
from django.core.asgi import get_asgi_application
from django.urls import re_path

urlpatterns = [
    path('client_data/', views.client_data, name='client_data'),
    path('load_machine_data/', views.load_machine_data, name='load_machine_data'),
    path('arduino_data/<str:path>/<str:value>/', views.arduino_data, name='arduino_data'),
    
    path('load_machine_data_production/', views.load_machine_data_production, name='load_machine_data_production'),
    path('register_data_production/', views.register_data_production, name='register_data_production'),

    path('presses_general_pause/', views.presses_general_pause, name='presses_general_pause'),
    path('presses_general_failure/', views.presses_general_failure, name='presses_general_failure'),

    path('load_scrap_data/', views.load_scrap_data, name='load_scrap_data'),
    path('search_in_part_number/', views.search_in_part_number, name='search_in_part_number'),
    path('search_weight/', views.search_weight, name='search_weight'),
    path('register_scrap/', views.register_scrap, name='register_scrap'),
    path('register/', views.register, name='register'),
    path('monthly-goal/',views.post_or_put_monthly_goal, name = 'post_montly_goal'),
    path('monthly-goal/<int:year>/<int:month>/', views.get_presses_monthly_goal, name='get_monthly_goal'),
    path('production-percentage/<int:year>/<int:month>/', views.get_presses_production_percentage, name='get_production_percentage'),
]