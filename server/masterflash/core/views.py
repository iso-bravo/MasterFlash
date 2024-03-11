import logging
from datetime import datetime

from django.http import HttpResponse, HttpResponseNotAllowed, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from .models import StateBarwell, StatePress, StateTroquelado


@csrf_exempt
def arduino_data(request, path, value):
    if not path or not value:
        return HttpResponse("Path and value are required", status=400)

    if value.startswith("MP-"):
        return register_data(StatePress, path, value)
    elif value.startswith("MT-"):
        return register_data(StateTroquelado, path, value)
    elif value.startswith("MB-"):
        return register_data(StateBarwell, path, value)
    else:
        return HttpResponse("Invalid machine value", status=400)

@csrf_exempt
def register_data(model_class, path, value):
    last_record = (
        model_class.objects.filter(name=value).order_by("-date", "-start_time").first()
    )

    if last_record and last_record.state == path:
        return HttpResponse(
            "No change in state value, skipping registration", status=200
        )

    if last_record:
        last_record.end_time = datetime.now().time()
        last_record.total_time = calculate_total_time(
            last_record.start_time, last_record.end_time
        )
        last_record.save()

    model_instance = model_class(
        name=value, date=datetime.now().date(), start_time=datetime.now().time()
    )

    model_instance.shift = None
    
    if path in ["R", "I", "P"]:
        model_instance.state = {"R": "Running", "I": "Inactive", "P": "Pause"}[path]
    elif path in ["FM", "FA", "FB"]:
        model_instance.state = "Failure"
        model_instance.comments = {
            "FM": "Failure por mantenimiento",
            "FA": "Failure por a",
            "FB": "Failure por b",
        }[path]
    else:
        return HttpResponse("Invalid state value", status=400)

    model_instance.save()
    return HttpResponse("Data recorded successfully", status=200)


def calculate_total_time(start_time, end_time):
    try:
        start_datetime = datetime.strptime(str(start_time), "%H:%M:%S")
        end_datetime = datetime.strptime(str(end_time), "%H:%M:%S")
    except ValueError:
        start_datetime = datetime.strptime(str(start_time), "%H:%M:%S.%f")
        end_datetime = datetime.strptime(str(end_time), "%H:%M:%S.%f")

    time_difference = (end_datetime - start_datetime).seconds // 60
    return time_difference

@csrf_exempt
@require_POST
def client_data(request):
    logger = logging.getLogger(__name__)
    
    data = request.POST.dict()
    logger.error(f'Data received: {data}')
    
    if request.method == 'POST':
        last_record = (
        StatePress.objects.filter(name=data.get('name')).order_by("-date", "-start_time").first()
    )
        if not last_record and data.get('state') == '':
            logger.error(f'Registro invalido')
            return JsonResponse({'message': 'Registro invalido.'}, status=201)
        
        if last_record:
            if data.get('employeeNumber') == '':
                employeeNumber = last_record.employee_number;
            else:
                employeeNumber = data.get('employeeNumber')
        else:
            if data.get('employeeNumber') == '':
                employeeNumber = None;
            else:
                employeeNumber = data.get('employeeNumber')
        
        if last_record:
            if data.get('state') == last_record.state:
                if data.get('comments') != '':
                    if last_record.comments:
                        last_record.comments = last_record.comments + ", " + data.get('comments')
                        last_record.save()
                    else:
                        last_record.comments = data.get('comments')
                        last_record.save()
                if data.get('employeeNumber') != '':
                    if last_record.employee_number:
                        update_last_record(last_record)
                        register_client_data(data, last_record.state, employeeNumber)
                    else:
                        last_record.employee_number = data.get('employeeNumber')
                        last_record.save()
                logger.error("Guardado 1")
                return JsonResponse({'message': 'Datos guardados correctamente.'}, status=201)
        
        update_last_record(last_record)
        
        try:
            register_client_data(data, data.get('state'), employeeNumber)
            
            logger.error("Guardado 3")
            return JsonResponse({'message': 'Datos guardados correctamente.'}, status=201)
        
        except Exception as e:
            logger.error(f'Error in client_data view: {str(e)}')
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Método no permitido'}, status=405)

def register_client_data(data, state, employeeNumber):
    StatePress.objects.create(
                name = data.get('name'),
                shift = None,
                date = datetime.now().date(),
                start_time = datetime.now().time(),
                end_time = None,
                total_time = None,
                state = state,
                employee_number = employeeNumber,
                comments = data.get('comments'),
            )
    
def update_last_record(last_record):
    if last_record:
            last_record.end_time = datetime.now().time()
            last_record.total_time = calculate_total_time(
                last_record.start_time, last_record.end_time
            )
            last_record.save()
