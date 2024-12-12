import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from ..models import (
    EmailConfig,
    ShiftSchedule,
)


@csrf_exempt
def get_shift_schedule(request):
    try:
        schedule = ShiftSchedule.objects.first()
        if not schedule:
            return JsonResponse({"error": "Shift schedule not found"}, status=404)

        return JsonResponse(
            {
                "first_shift_start": schedule.first_shift_start,
                "first_shift_end": schedule.first_shift_end,
                "second_shift_start": schedule.second_shift_start,
                "second_shift_end": schedule.second_shift_end,
            }
        )
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_POST
def update_shift_schedule(request):
    try:
        data = json.loads(request.body)
        schedule, created = ShiftSchedule.objects.get_or_create(id=1)

        schedule.first_shift_start = data.get(
            "first_shift_start", schedule.first_shift_start
        )
        schedule.first_shift_end = data.get("first_shift_end", schedule.first_shift_end)
        schedule.second_shift_start = data.get(
            "second_shift_start", schedule.second_shift_start
        )
        schedule.second_shift_end = data.get(
            "second_shift_end", schedule.second_shift_end
        )

        schedule.save()

        return JsonResponse(
            {
                "message": "Shift schedule updated successfully",
                "first_shift_start": schedule.first_shift_start,
                "first_shift_end": schedule.first_shift_end,
                "second_shift_start": schedule.second_shift_start,
                "second_shift_end": schedule.second_shift_end,
            }
        )
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def email_config(request):
    if request.method == "GET":
        try:
            config = EmailConfig.objects.first()
            if not config:
                return JsonResponse(
                    {"message": "No email configuration found"}, status=404
                )

            return JsonResponse(
                {
                    "sender_email": config.sender_email,
                    "smtp_host": config.smtp_host,
                    "smtp_port": config.smtp_port,
                    "use_tls": config.use_tls,
                    "recipients": config.get_recipients_list(),
                }
            )
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    elif request.method == "POST":
        try:
            data = json.loads(request.body)
            sender_email = data.get("email")
            sender_password = data.get("password")
            recipients = data.get("recipients", [])
            smtp_host = data.get("smtp_host", "smtp.gmail.com")
            smtp_port = data.get("smtp_port", 587)
            use_tls = data.get("use_tls", True)

            if not sender_email or not sender_password:
                return JsonResponse(
                    {"error": "Sender email and password are required"}, status=400
                )

            # Actualizar o crear la configuración única
            config, created = EmailConfig.objects.update_or_create(
                id=1,
                defaults={
                    "sender_email": sender_email,
                    "recipients": json.dumps(recipients),
                    "smtp_host": smtp_host,
                    "smtp_port": smtp_port,
                    "use_tls": use_tls,
                },
            )
            config.set_password(sender_password)
            config.save()

            return JsonResponse({"message": "Email configuration updated successfully"})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
