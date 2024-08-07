# signals.py
import json
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import ProductionPress
from .utils import send_production_data

@receiver(post_save, sender=ProductionPress)
def notify_production_update(sender, instance, **kwargs):
    channel_layer = get_channel_layer()
    production_data = send_production_data()
    async_to_sync(channel_layer.group_send)(
        "production_group",
        {
            "type": "production_message",
            "message": production_data
        }
    )
