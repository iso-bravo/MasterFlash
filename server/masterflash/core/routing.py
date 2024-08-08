from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/load_machine_data_production/', consumers.ProductionConsumer.as_asgi()),
]
