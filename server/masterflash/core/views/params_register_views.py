from datetime import datetime
import json
import logging

from django.http import JsonResponse
from ..models import EmailConfig, Params
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.core.mail import EmailMessage, get_connection
from django.template.loader import render_to_string


logger = logging.getLogger("__name__")


@csrf_exempt
@require_POST
def save_params(request):
    try:
        # Obtener los datos del cuerpo de la solicitud
        logger.info("Recibiendo solicitud...")
        data = json.loads(request.body)
        logger.info(f"Datos recibidos: {data}")

        # Validar que los datos requeridos estén presentes
        init_params = data.get("initParams", {})
        second_params = data.get("secondParams", {})
        third_params = data.get("thirdParams", {})
        logger.info(
            f"initParams: {init_params}, secondParams: {second_params}, thirdParams: {third_params}"
        )

        if not init_params or not second_params:
            return JsonResponse({"error": "Faltan parámetros obligatorios"}, status=400)

        param_instance = Params(
            partnum=init_params.get("partnum"),
            auditor=init_params.get("auditor"),
            shift=init_params.get("shift", ""),
            mp=init_params.get("mp"),
            molder=init_params.get("molder"),
            icc=init_params.get("icc"),
            register_date=init_params.get("register_date"),
            mold=second_params.get("mold"),
            cavities=second_params.get("cavities"),
            metal=second_params.get("metal"),
            body=second_params.get("body"),
            strips=second_params.get("strips"),
            full_cycle=second_params.get("full_cycle"),
            cycle_time=second_params.get("cycle_time", 0),
            screen_superior=second_params.get("screen", {}).get("superior", 0),
            screen_inferior=second_params.get("screen", {}).get("inferior", 0),
            mold_superior=second_params.get("mold2", {}).get("superior", 0),
            mold_inferior=second_params.get("mold2", {}).get("inferior", 0),
            platen_superior=second_params.get("platen", {}).get("superior", 0),
            platen_inferior=second_params.get("platen", {}).get("inferior", 0),
            pressure=second_params.get("pressure"),
            waste_pct=float(second_params.get("waste_pct", 0) or 0),
            batch=third_params.get("batch"),
            julian=third_params.get("julian", None),
            ts2=third_params.get("ts2", None),
            cavities_arr=third_params.get("cavities_arr", []),
        )

        # Guardar el registro en la base de datos
        param_instance.save()
        logger.info("Parámetros guardados correctamente.")

        email_config = EmailConfig.objects.first()
        if not email_config:
            raise Exception("Configuración de correo no encontrada.")

        connection = get_connection(
            host=email_config.smtp_host,
            port=email_config.smtp_port,
            username=email_config.sender_username,
            password=email_config.get_password(),
            use_tls=email_config.use_tls,
            use_ssl=False if email_config.use_tls else True,
        )

        # Formatear el mensaje del correo
        email_subject = f"{param_instance.mp} Registro de parámetros {param_instance.register_date} "

        param_instance_dict = param_instance.to_dict()

        def clean_param_instance(param_instance_dict):
            """Limpia el diccionario de parámetros según las condiciones especificadas."""
            icc_value = param_instance_dict["general_info"].get("icc") == "Sí"

            if not icc_value:
                param_instance_dict["general_info"].pop("icc", None)
                param_instance_dict["batch_info"].pop("Julian", None)
            else:
                param_instance_dict["batch_info"].pop("ts2", None)

            return param_instance_dict

        param_instance_dict = clean_param_instance(param_instance_dict)

        general_info = {
            key: value
            for key, value in param_instance_dict["general_info"].items()
            if key not in ["parameters", "temperature", "cavities_arr", "batch_info"]
        }

        context = {
            "general_info": general_info,
            "parameters": param_instance_dict["parameters"],
            "temperature": param_instance_dict["temperature"],
            "batch_info": param_instance_dict["batch_info"],
            "cavities_arr": param_instance_dict["cavities_arr"],
        }

        html_content = render_to_string("emails/params_email.html", context=context)

        # Enviar el correo
        email = EmailMessage(
            subject=email_subject,
            body=html_content,
            from_email=email_config.sender_email,
            to=email_config.get_recipients_list(),
            connection=connection,
        )
        email.content_subtype = "html"
        email.fail_silently = False
        email.send()
        logger.info("Correo enviado correctamente.")

        # Responder con un mensaje de éxito
        return JsonResponse(
            {"message": "Parámetros guardados correctamente"}, status=201
        )

    except json.JSONDecodeError:
        logger.exception("Error en el formato de los datos enviados.")
        return JsonResponse(
            {"error": "Error en el formato de los datos enviados"}, status=400
        )
    except Exception as e:
        logger.exception("Error interno.")
        return JsonResponse({"error": f"Error interno: {str(e)}"}, status=500)


@csrf_exempt
def get_params_by_date(request, date):
    try:
        date = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        return JsonResponse(
            {"error": "Formato de fecha inválido. Usa YYYY-MM-DD."}, status=400
        )

    params = Params.objects.filter(register_date__date=date)

    data = list(
        params.values(
            "id",
            "register_date",
            "mp",
            "shift",
            "auditor",
            "molder",
            "partnum",
            "mold"
        )
    )


    return JsonResponse(data, safe=False)


@csrf_exempt
def get_params_by_id(request, id):
    try:
        params = Params.objects.get(id=id)
    except Params.DoesNotExist:
        return JsonResponse({"error": "Registro no encontrado."}, status=404)

    return JsonResponse(params.to_dict(), safe=False)
