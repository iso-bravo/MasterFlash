from datetime import datetime
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
def get_actual_shift(request):
    try:
        time_str = request.GET.get("time")
        if not time_str:
            return JsonResponse({"error": "Time parameter is missing"}, status=400)
        try:
            print("time_str", time_str)
            if len(time_str) == 5:  # HH:MM
                current_time = datetime.strptime(time_str, "%H:%M").time()
            elif len(time_str) == 8:  # HH:MM:SS
                current_time = datetime.strptime(time_str, "%H:%M:%S").time()
            else:
                return JsonResponse(
                    {"error": "Invalid time format. Use HH:MM or HH:MM:SS"}, status=400
                )
        except ValueError:
            return JsonResponse(
                {"error": "Invalid time format. Use HH:MM or HH:MM:SS"}, status=400
            )

        schedule = ShiftSchedule.objects.first()
        if not schedule:
            return JsonResponse({"error": "Shift schedule not found"}, status=404)

        if schedule.first_shift_start <= current_time <= schedule.first_shift_end:
            shift = "First"
        elif schedule.second_shift_start <= current_time <= schedule.second_shift_end:
            shift = "Second"
        else:
            shift = "Free"

        return JsonResponse({"shift": shift})
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
                    "sender_username": config.sender_username,
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
            sender_username = data.get("username")
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
                    "sender_username": sender_username,
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
