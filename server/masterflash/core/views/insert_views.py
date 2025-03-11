import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods, require_POST
from ..models import Insert


@csrf_exempt
def get_all_inserts(request):
    try:
        inserts = Insert.objects.all()

        data = [
            {
                "id": i.id,
                "insert": i.insert,
                "caliber": i.caliber,
                "weight": i.weight,
                "chemlok": i.chemlok,
            }
            for i in inserts
        ]
        return JsonResponse(data, safe=False)
    except Exception as e:
        print(e)
        return JsonResponse({"error": str(e)}, status=400)


@csrf_exempt
def get_insert_by_id(request, id):
    try:
        insert = Insert.objects.get(pk=id)
        return JsonResponse(
            {
                "id": insert.id,
                "insert": insert.insert,
                "caliber": insert.caliber,
                "weight": insert.weight,
                "chemlok": insert.chemlok,
            },
            status=200,
        )
    except Exception as e:
        print(e)
        return JsonResponse({"error": str(e)}, status=400)


@csrf_exempt
@require_POST
def post_insert(request):
    try:
        data = json.loads(request.body.decode("utf-8"))
        print(data)

        insert = Insert(
            insert=data.get("insert"),
            caliber=data.get("caliber"),
            weight=data.get("weight"),
            chemlok=data.get("chemlok"),
        )
        insert.save()

        # insertQuery = Insert.objects.get(insert=insert.insert, caliber=insert.caliber, weight=insert.weight, chemlok=insert.chemlok)
        return JsonResponse(insert.to_dict(), status=201)
    except Exception as e:
        print(e)
        return JsonResponse({"error": str(e)}, status=400)


@csrf_exempt
@require_http_methods(["PATCH"])
def update_insert(request, id):
    try:
        # Asegúrate de decodificar el JSON del cuerpo de la petición
        data = json.loads(request.body)
        print("Datos recibidos:", data)

        if not isinstance(data, dict):
            return JsonResponse(
                {"error": "El cuerpo de la petición debe ser un objeto JSON"},
                status=400,
            )

        # Busca el registro existente
        insert = Insert.objects.get(id=id)

        insert.insert = data.get("insert", insert.insert)
        insert.caliber = float(data.get("caliber", insert.caliber))
        insert.weight = float(data.get("weight", insert.weight))
        insert.chemlok = float(data.get("chemlok", insert.chemlok))
        insert.save()

        # Asegúrate de devolver un diccionario como respuesta
        response_data = {
            "id": insert.id,
            "insert": insert.insert,
            "caliber": insert.caliber,
            "weight": insert.weight,
            "chemlok": insert.chemlok,
            "message": "Registro actualizado correctamente",
        }

        return JsonResponse(response_data, status=200)

    except Insert.DoesNotExist:
        return JsonResponse({"error": "Registro no encontrado"}, status=404)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Error al decodificar el JSON"}, status=400)

    except Exception as e:
        print("Error:", e)
        return JsonResponse({"error": str(e)}, status=500)
