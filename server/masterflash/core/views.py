import json
import logging
from datetime import date, datetime, time
from urllib import response
from django.http import HttpResponse, HttpResponseNotAllowed, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods, require_POST
from django.http import JsonResponse
from asgiref.sync import async_to_sync
from .models import LinePress, Part_Number, Production_records, StateBarwell, StatePress, StateTroquelado, ProductionPress, Qc_Scrap, Insert, Presses_monthly_goals
from .utils import set_shift, sum_pieces
from django.db.models import Q, Sum
from django.shortcuts import get_object_or_404


@csrf_exempt
def arduino_data(request, path, value):
    if not path or not value:
        return HttpResponse("Path and value are required", status=400)

    if value.startswith("LIN-") or value.startswith("MVFP-"):
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
    
    if last_record.employee_number:
        model_instance.employee_number = last_record.employee_number
    
    if path in ["R", "I", "P", "F"]:
        model_instance.state = {"R": "Running", "I": "Inactive", "P": "Pause", "F": "Failure"}[path]
    # elif path in ["FM", "FA", "FB"]:
    #    model_instance.state = "Failure"
    #    model_instance.comments = {
    #        "FM": "Failure por mantenimiento",
    #        "FA": "Failure por a",
    #        "FB": "Failure por b",
    #    }[path]
    else:
        return HttpResponse("Invalid state value", status=400)

    model_instance.save()
    return HttpResponse("Data recorded successfully", status=200)


def calculate_total_time(start_time, end_time):
    def add_milliseconds(time_obj):
        time_str = str(time_obj)
        if '.' not in time_str:
            time_str += '.000000'
        return time_str

    try:
        start_datetime = datetime.strptime(add_milliseconds(start_time), "%H:%M:%S.%f")
        end_datetime = datetime.strptime(add_milliseconds(end_time), "%H:%M:%S.%f")
    except ValueError:
        raise ValueError(f"Los valores de tiempo '{start_time}' y '{end_time}' no coinciden con el formato esperado.")

    time_difference = (end_datetime - start_datetime).total_seconds() // 60
    return int(time_difference)

@csrf_exempt
@require_POST
def client_data(request):
    logger = logging.getLogger(__name__)
    
    data = request.POST.dict()
    
    if request.method == 'POST':
        last_record = (
        StatePress.objects.filter(name=data.get('name')).order_by("-date", "-start_time").first()
    )
        if not last_record and data.get('state') == '':
            logger.error('Registro invalido')
            return JsonResponse({'message': 'Registro invalido.'}, status=201)
        
        current_time = datetime.now().time()
        if time(7, 0) <= current_time <= time(16, 35):
            shift = 'First'
        elif time(16, 36) <= current_time or current_time <= time(1, 20):
            shift = 'Second'
        else:
            shift = 'Free'

        if last_record:
            if data.get('employeeNumber') == '':
                employeeNumber = last_record.employee_number
            else:
                employeeNumber = data.get('employeeNumber')
        else:
            if data.get('employeeNumber') == '':
                employeeNumber = None
            else:
                employeeNumber = data.get('employeeNumber')
        
        if last_record:
            if data.get('state') == last_record.state or data.get('state') == '':
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
                        register_client_data(data, last_record.state, employeeNumber, shift)
                    else:
                        last_record.employee_number = data.get('employeeNumber')
                        last_record.save()
                logger.error("Guardado 1")
                return JsonResponse({'message': 'Datos guardados correctamente.'}, status=201)
        
        update_last_record(last_record)
        
        try:
            register_client_data(data, data.get('state'), employeeNumber, shift)
            
            logger.error("Guardado 3")
            return JsonResponse({'message': 'Datos guardados correctamente.'}, status=201)
        
        except Exception as e:
            logger.error(f'Error in client_data view: {str(e)}')
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Método no permitido'}, status=405)

def register_client_data(data, state, employeeNumber, shift):
    StatePress.objects.create(
                name = data.get('name'),
                shift = shift,
                date = datetime.now().date(),
                start_time = datetime.now().time(),
                end_time = None,
                total_time = None,
                state = state,
                employee_number = employeeNumber,
                comments = data.get('comments'),
            )
    
def update_last_record(last_record):
    logger = logging.getLogger(__name__)
    if last_record:
            logger.error(f'Start time: {last_record.start_time}')
            last_record.end_time = datetime.now().time()
            last_record.total_time = calculate_total_time(
                last_record.start_time, last_record.end_time
            )
            last_record.save()
            
            
@require_http_methods(["GET"])
def load_machine_data(request):
    machines = LinePress.objects.all()
    machines_data = []

    for machine in machines:
        states = StatePress.objects.filter(name=machine.name)
        if len(states) > 0:
            last_state = states.latest("date", "start_time")
            machine_data = {
                'name': machine.name,
                'state': last_state.state,
                'employee_number': last_state.employee_number,
            }
        else:
            machine_data = {
                'name': machine.name,
                'state': 'Inactive',
                'employee_number': '',
            }
        machines_data.append(machine_data)

    return JsonResponse(machines_data, safe=False)

# Presses Production

@require_http_methods(["GET"])
def load_machine_data_production(request):
    logger = logging.getLogger(__name__)
    machines = LinePress.objects.all()
    machines_data = []
    total_piecesProduced = 0
    
    current_date = datetime.now().date()
    current_time = datetime.now().time()
    shift = set_shift(current_time)

    for machine in machines:
        if machine.status != 'Available':
            continue
        
        production = ProductionPress.objects.filter(press=machine.name).order_by('-date_time').first()
        states = StatePress.objects.filter(name=machine.name)
        
        if production:
            if production.part_number == None or production.part_number == '':
                partNumber = '--------'
            else:
                partNumber = production.part_number
                
            if production.employee_number == None or production.employee_number == '':
                employeeNumber = '----'
            else:
                employeeNumber = production.employee_number
                
            if production.work_order == None or production.work_order == '':
                workOrder = ''
            else:
                workOrder = production.work_order

            if production.molder_number == None or production.molder_number == '':
                molderNumber = '----'
            else:
                molderNumber = production.molder_number
        else:
            partNumber = '--------'
            employeeNumber = '----'
            workOrder = ''
            molderNumber = '----'

        if shift == 'First':
            production = ProductionPress.objects.filter(
                press=machine.name,
                shift=shift,
                date_time__date=current_date,
                date_time__time__range=(time(7, 0), time(16, 35))
            ).aggregate(
                total_ok=Sum('pieces_ok'),
                total_rework=Sum('pieces_rework')
            )
        elif shift == 'Second':
            production = ProductionPress.objects.filter(
                Q(press=machine.name, shift=shift, date_time__date=current_date, date_time__time__range=(time(16, 36), time.max)) |
                Q(press=machine.name, shift=shift, date_time__date=current_date, date_time__time__range=(time.min, time(1, 20)))
            ).aggregate(
                total_ok=Sum('pieces_ok'),
                total_rework=Sum('pieces_rework')
            )
    
        if (production and (shift == 'First')) or (production and (shift == 'Second')):
            total_ok = production['total_ok'] if production['total_ok'] else 0
            total_rework = production['total_rework'] if production['total_rework'] else 0
            actual_ok = sum_pieces(machine, shift, current_date)
        else:
            total_ok = 0
            total_rework = 0
            actual_ok = 0
        
        if len(states) > 0:
            last_state = states.latest("date", "start_time")
            machine_state = last_state.state
        else:
            machine_state = 'Inactive'
            
        machine_data = {
            'name': machine.name,
            'state': machine_state,
            'employee_number': employeeNumber,
            'pieces_ok': actual_ok,
            'pieces_rework': total_rework,
            'part_number': partNumber,
            'work_order' : workOrder,
            'total_ok': total_ok,
            'molder_number': molderNumber
        }
        total_piecesProduced += total_ok
        machines_data.append(machine_data)

    #logger.error(f'total_piecesProduced: {total_piecesProduced}')    
    response_data = {
        'machines_data': machines_data,
        'total_piecesProduced': total_piecesProduced,
    }
    #logger.error(f'total_piecesProduced: {response_data}') 
    return JsonResponse(response_data, safe=False)



@csrf_exempt
@require_POST
def register_data_production(request):
    logger = logging.getLogger(__name__)
    
    data = json.loads(request.body.decode('utf-8'))
    logger.error(f'Data received: {data}')
    
    if all(value == '' for value in [data.get('part_number'), data.get('employee_number'), data.get('pieces_ok'), data.get('pieces_rework'), data.get('work_order')]):
        logger.error('Registro invalido')
        return JsonResponse({'message': 'Registro invalido.'}, status=201)
    
    if not Part_Number.objects.filter(part_number=data.get('part_number')).exists():
        return JsonResponse({'message': 'Registro invalido.'}, status=404)

    last_record = ProductionPress.objects.filter(press=data.get('name')).order_by('-date_time').first()
    
    piecesOk = data.get('pieces_ok') or 0
    piecesRework = data.get('pieces_rework') or 0

    if last_record:
        employeeNumber = data.get('employee_number') or last_record.employee_number or None
        partNumber = data.get('part_number') or last_record.part_number or None
        molderNumber = data.get('molder_number') or last_record.molder_number or None
        workOrder = data.get('work_order') or last_record.work_order or ''
    else:
        employeeNumber = data.get('employee_number') or None
        partNumber = data.get('part_number')
        molderNumber = data.get('molder_number') or None
        workOrder = data.get('work_order') or ''

    current_time = datetime.now().time()
    shift = set_shift(current_time)
    
    logger.error(f'shift: {shift}')
    
    ProductionPress.objects.create(
        date_time = datetime.now(),
        employee_number = employeeNumber,
        pieces_ok = piecesOk,
        pieces_scrap = 0,
        pieces_rework = piecesRework,
        part_number = partNumber,
        work_order = workOrder,
        molder_number = molderNumber,
        press = data.get('name'),
        shift = shift,
    )
    return JsonResponse({'message': 'Datos guardados correctamente.'}, status=201)


@csrf_exempt
@require_POST
def get_production_press_by_date(request):
    data = request.POST.dict()
    print("Received data:", data)
    date = data.get('date')
    shift = data.get('shift')
    if not date or not shift:
        return JsonResponse({'error': 'Date parameter is missing'}, status=400)

    production_press_records = ProductionPress.objects.filter(  date_time__date=date,
                                                                shift=shift
                    ).values('press', 'employee_number', 'part_number', 'work_order','pieces_ok')

    print("ProductionPress records found:", production_press_records)

    result = []

    for record in production_press_records:
        print("Processing record:", record)
        part_number_record = Part_Number.objects.filter(part_number=record['part_number']).values('caliber', 'cavities', 'standard').first()
        print("Part_Number record found:", part_number_record)
        if part_number_record:
            combined_record = {
                'press': record['press'],
                'employee_number': record['employee_number'],
                'part_number': record['part_number'],
                'work_order': record['work_order'],
                'caliber': part_number_record['caliber'],
                'cavities': part_number_record['cavities'],
                'standard': part_number_record['standard'],
                'pieces_ok':record['pieces_ok']
            }
            result.append(combined_record)
    print("Final result:", result)
    return JsonResponse(result, safe=False)


@csrf_exempt
@require_POST
def presses_general_pause(request):
    machines = LinePress.objects.all()
    
    current_time = datetime.now().time()
    shift = set_shift(current_time)
    
    for machine in machines:
        
        last_record = (
            StatePress.objects.filter(name=machine.name).order_by("-date", "-start_time").first()
        )
        if last_record and last_record.state == 'Running':
            StatePress.objects.create(
                name = machine.name,
                shift = shift,
                date = datetime.now().date(),
                start_time = datetime.now().time(),
                end_time = None,
                total_time = None,
                state = 'Pause',
                employee_number = last_record.employee_number,
                comments = last_record.comments,
            )
            last_record.end_time = datetime.now().time()
            last_record.total_time = calculate_total_time(
                last_record.start_time, last_record.end_time
                )
            last_record.save()

    return JsonResponse({'message': 'General Pause Success.'}, status=201)
            
@csrf_exempt
@require_POST
def presses_general_failure(request):
    machines = LinePress.objects.all()
    
    current_time = datetime.now().time()
    shift = set_shift(current_time)
    
    for machine in machines:
        
        last_record = (
            StatePress.objects.filter(name=machine.name).order_by("-date", "-start_time").first()
        )
        
        if last_record:

            if last_record.state == 'Running' or last_record.state == 'Pause':
                StatePress.objects.create(
                name = machine.name,
                shift = shift,
                date = datetime.now().date(),
                start_time = datetime.now().time(),
                end_time = None,
                total_time = None,
                state = 'Failure',
                employee_number = last_record.employee_number,
                comments = last_record.comments,
                )
                last_record.end_time = datetime.now().time()
                last_record.total_time = calculate_total_time(
                    last_record.start_time, last_record.end_time
                )
                last_record.save()

    return JsonResponse({'message': 'General Failure Success.'}, status=201)

# Register Scrap
def load_scrap_data(request):
    machines_query = LinePress.objects.filter(status="Available").values_list('name', flat=True)
    machines = list(machines_query)
    
    return JsonResponse(machines, safe=False)

def search_in_part_number(request):
    data = request.GET.dict()
    part_number = data.get('part_number')

    if not part_number:
        return JsonResponse({"error": "part_number is required"}, status=400)

    part_record = get_object_or_404(Part_Number, part_number=part_number)

    rubber_compound = getattr(part_record, 'rubber_compound', None)
    insert = getattr(part_record, 'insert', None)
    caliber = getattr(part_record, 'caliber', None)

    if insert is not None and caliber is not None:
        insert_record = get_object_or_404(Insert, insert=insert, caliber=caliber)
        weight = getattr(insert_record, 'weight', None)
    else:
        weight = None

    data = {
        'Compuesto': rubber_compound,
        'Inserto': insert,
        'Metal': caliber,
        'Ito. s/hule': weight,
    }

    return JsonResponse(data, safe=False)

def search_weight(request):
    data = request.GET.dict()
    metal = data.get('metal')
    insert = data.get('inserto')

    print(metal, insert)

    if not metal or not insert:
        return JsonResponse({"error": "metal and insert are required"}, status=400)     

    insert_record = get_object_or_404(Insert, insert=insert, caliber=metal  )   
    weight = getattr(insert_record, 'weight', None)

    response_data = {
        'Ito. s/hule': weight,
    }

    return JsonResponse(response_data, safe=False)                                                                     

@csrf_exempt
@require_POST
def register_scrap(request):
            print('entro')
            data = request.POST.dict()
            print(data)
            total_pieces = 0

            def empty_to_none(value):
                return None if value == '' else value
        
            def part_number_data(field, part_number):
                try:
                    part = Part_Number.objects.get(part_number=part_number)
                    print(part)
                    return getattr(part, field, None)
                except Exception as e:
                    print(f'Error in client_data view: {str(e)}')
                    return JsonResponse({'error': str(e)}, status=500)
        
            def gr_to_lbs(gr):
                return gr * 0.00220462

            date = empty_to_none(data.get('date'))
            shift = empty_to_none(data.get('shift'))
            line = empty_to_none(data.get('line'))
            auditor = empty_to_none(data.get('auditor'))
            inputs = [empty_to_none(data.get(f'inputs[{i}]', '')) for i in range(10)]
            codes = {code: empty_to_none(value) for code, value in data.items() if code.startswith('codes[')}

            if inputs[0] == None:
                return JsonResponse({'message': 'Part Number Required'}, status=400)

            current_time = datetime.now().time()
            current_time_str = current_time.strftime('%H:%M:%S.%f')

            if date == '' or date == None:
                date = datetime.now(),
            else:
                date = data.get('date') + ' ' + current_time_str
    

            scrap_entry = Qc_Scrap(
                date_time=date,
                shift=shift,
                line=line,
                auditor_qc=auditor,
                part_number=inputs[0] if len(inputs) > 0 else None,
                molder_number=inputs[1] if len(inputs) > 1 else None,
                caliber=inputs[4] if len(inputs) > 4 else None,
                rubber_weight=inputs[5] if len(inputs) > 5 else None,
                insert_weight_w_rubber=inputs[6] if len(inputs) > 6 else None,
                insert_weight_wout_rubber=inputs[7] if len(inputs) > 7 else None,
                recycled_inserts=inputs[8] if len(inputs) > 8 else None,
                compound=inputs[2] if len(inputs) > 2 else None,
                mold=part_number_data('mold', inputs[0]),
                insert=inputs[3] if len(inputs) > 3 else None,
                inserts_total = inputs[9] if len(inputs) > 9 else None,
            )

            for code, value in codes.items():
                if value is None:
                    setattr(scrap_entry, code[6:-1], None)
                else:
                    setattr(scrap_entry, code[6:-1], int(value))
                    total_pieces += int(value)

            print(total_pieces)        

            if len(inputs) > 5:
                total_bodies_weight = int(inputs[5])
            else:
                total_bodies_weight = 0

            print(total_bodies_weight)

            if len(inputs) > 9:
                total_inserts_weight = int(inputs[7]) * int(inputs[9])
            else:
                total_inserts_weight = 0

            print(total_inserts_weight)

            if len(inputs) > 6:
                total_rubber_weight_in_insert = (int(inputs[6])) - total_inserts_weight
            else:
                total_rubber_weight_in_insert = 0
            
            print(total_rubber_weight_in_insert)

            total_rubber_weight = (total_bodies_weight + total_rubber_weight_in_insert)

            scrap_entry.total_pieces = total_pieces
            scrap_entry.total_bodies_weight = total_bodies_weight
            scrap_entry.total_inserts_weight = total_inserts_weight
            scrap_entry.total_rubber_weight_in_insert = total_rubber_weight_in_insert
            scrap_entry.total_rubber_weight = total_rubber_weight
            scrap_entry.total_bodies_weight_lbs = gr_to_lbs(total_bodies_weight)
            scrap_entry.total_inserts_weight_lbs = gr_to_lbs(total_inserts_weight)
            scrap_entry.total_rubber_weight_in_insert_lbs = gr_to_lbs(total_rubber_weight_in_insert)
            scrap_entry.total_rubber_weight_lbs = gr_to_lbs(total_rubber_weight)

            scrap_entry.save()
        
            return JsonResponse({'message': 'Registro exitoso'}, status=200)
        
def register(request):
    print('Aqui')
    return JsonResponse({'message': 'Registro exitoso'}, status=200)
    

#Report Quality
#""""
def export_report(request):
    try:
        data = request.POST.dict()

        caliber = data.get('aluminio')
        date = data.get('fecha')

        records = Qc_Scrap.objects.filter(date_time=date)

        def gr_to_lbs(gr):
                return gr * 0.00220462
        
        

    except Exception as e:
            return JsonResponse({'message': "Error: {}".format(str(e))}, status=400)
#"""

def register_production(request):
    try:
        data = request.POST.dict()
        date = data.get('fecha')

        records = ProductionPress.objects.filter(date_time=date)

        
        
        

    except Exception as e:
            return JsonResponse({'message': "Error: {}".format(str(e))}, status=400)

@csrf_exempt
@require_http_methods(["POST", "PUT"])
def post_or_put_monthly_goal(request):
    #TODO agregar seguridad para que si se agrega el mismo mes 2 veces, se haga PUT y no POST
    data = request.POST.dict()
    print(data)
    
    try:
        month = int(data['month'])
        year = int(data['year'])
        target_amount = float(data['target_amount'])
        
        if month < 1 or month > 12:
            return JsonResponse({'error': 'month out of range'}, status=400)
        
        # Verificar si ya existe una meta para el mes y año dados
        goal, created = Presses_monthly_goals.objects.get_or_create(
            month=month, year=year,
            defaults={'target_amount': target_amount}
        )

        if not created:
            # Si ya existe, actualizamos el target_amount
            goal.target_amount = target_amount
            goal.save()
            return JsonResponse({'message': 'Goal updated successfully', 'id': goal.id, 'month': goal.month, 'year': goal.year, 'target_amount': goal.target_amount}, status=200)
        else:
            return JsonResponse({'message': 'Goal created successfully', 'id': goal.id, 'month': goal.month, 'year': goal.year, 'target_amount': goal.target_amount}, status=201)

    except KeyError:
        return JsonResponse({'error': 'Missing fields'}, status=400)

    except ValueError:
        return JsonResponse({'error': 'Invalid data types'}, status=400)
    

def get_presses_monthly_goal(request,year,month):
    try:
        goal = Presses_monthly_goals.objects.get(year=year,month=month)
        return JsonResponse({'id': goal.id, 'month': goal.month, 'year': goal.year, 'target_amount': goal.target_amount})

    except Presses_monthly_goals.DoesNotExist:
        return HttpResponse(status=404)

def get_presses_production_percentage(request, year, month):
    try:
        goal = Presses_monthly_goals.objects.get(year=year, month=month)
        
        start_date = date(year, month, 1)

        if month == 12:
            end_date = date(year + 1, 1, 1)
        else:
            end_date = date(year, month + 1, 1)

        total_pieces = ProductionPress.objects.filter(
            date_time__gte=start_date,
            date_time__lt=end_date
        ).aggregate(Sum('pieces_ok'))['pieces_ok__sum'] or 0

        percentage = (total_pieces / goal.target_amount) * 100

        return JsonResponse({'percentage': percentage, 'total_pieces': total_pieces})
    except Presses_monthly_goals.DoesNotExist:
        return HttpResponse(status=404)

@csrf_exempt
@require_POST
def save_production_records(request):
    try:
        data = json.loads(request.body)
        date = data['date']
        shift = data['shift']
        records = data['records']
        
        for record in records:
            Production_records.objects.create(
                press=record['press'],
                employee_number=record['employee_number'],
                part_number=record['part_number'],
                work_order=record['work_order'],
                caliber=record.get('caliber'),
                worked_hrs=record.get('worked_hrs'),
                dead_time_cause_1=record.get('dead_time_cause_1'),
                cavities=record.get('cavities'),
                standard=record.get('standard'),
                proposed_standard=record.get('proposed_standard'),
                dead_time_cause_2=record.get('dead_time_cause_2'),
                pieces_ok=record['pieces_ok'],
                efficiency=record['efficiency'],
                date=date,  
                shift=shift,     
            )
        
        return JsonResponse({"message":"Records saved successfully"}, status=201)
    except Exception as e:
        print(f"Error: {e}")
        return JsonResponse({"error": str(e)}, status=400)