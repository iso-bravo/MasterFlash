import json
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import ProductionPress

@receiver(post_save, sender=ProductionPress)
def notify_production_update(sender, instance, **kwargs):
    channel_layer = get_channel_layer()
    production_data = {
        'id': instance.id,
        'press': instance.press,
        'employee_number': instance.employee_number,
        'pieces_ok': instance.pieces_ok,
        'pieces_rework': instance.pieces_rework,
        'part_number': instance.part_number,
        'work_order': instance.work_order,
        'molder_number': instance.molder_number,
        'date_time': instance.date_time.isoformat(),
        'shift': instance.shift,
    }
    async_to_sync(channel_layer.group_send)(
        "production_group",
        {
            "type": "production_message",
            "message": json.dumps(production_data)
        }
    )
