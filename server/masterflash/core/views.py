import logging
from datetime import date, datetime, time
from urllib import response
from django.http import HttpResponse, HttpResponseNotAllowed, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods, require_POST
from django.http import JsonResponse
from asgiref.sync import async_to_sync
from .models import LinePress, Part_Number, StateBarwell, StatePress, StateTroquelado, ProductionPress, Qc_Scrap, Insert
from django.utils import timezone
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
    shift = ''
    if time(7, 0) <= current_time <= time(16, 35):
        shift = 'First'
    elif time(16, 36) <= current_time or current_time <= time(1, 20):
        shift = 'Second'
    else:
        shift = 'Free'

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

def sum_pieces(machine, shift, current_date):
        logger = logging.getLogger(__name__)    
        last_record = ProductionPress.objects.filter(press=machine.name).order_by('-date_time').first()

        #logger.error(f'machine: {machine.name}')
        #logger.error(f'last_record: {last_record}')

        if not last_record:
            return 0

        part_number = last_record.part_number
        work_order = last_record.work_order
        pieces_sum = 0
        
        #logger.error(f'last_record: {machine.name}')
        #logger.error(f'shift: {shift}')
        if shift == 'First':
            records = ProductionPress.objects.filter(
                press=machine.name,
                shift=shift,
                date_time__date=current_date,
                date_time__time__range=(time(7, 0), time(16, 35))
            ).order_by('-date_time')
        elif shift == 'Second':
            records = ProductionPress.objects.filter(
                Q(press=machine.name, shift=shift, date_time__date=current_date, date_time__time__range=(time(16, 36), time.max)) |
                Q(press=machine.name, shift=shift, date_time__date=current_date, date_time__time__range=(time.min, time(1, 20)))
            ).order_by('-date_time')
        else:
            return 0
        
        record_iterator = records.iterator()

        current_record = next(record_iterator, None)
        while current_record and current_record.part_number == part_number and current_record.work_order == work_order:
            pieces_sum += current_record.pieces_ok or 0
            current_record = next(record_iterator, None)
        #logger.error(f'pieces_sum: {pieces_sum}')
        #logger.error('------------------------------------------------------')

        return pieces_sum

@csrf_exempt
@require_POST
def register_data_production(request):
    logger = logging.getLogger(__name__)
    
    data = request.POST.dict()
    logger.error(f'Data received: {data}')
    
    if all(value == '' for value in [data.get('part_number'), data.get('employee_number'), data.get('pieces_ok'), data.get('pieces_rework'), data.get('work_order'),data.get('inserts_total')]):
        logger.error('Registro invalido')
        return JsonResponse({'message': 'Registro invalido.'}, status=201)
    
    if Part_Number.objects.filter(part_number=data.get('part_number')).exists():
        pass
    else:
        return JsonResponse({'message': 'Registro invalido.'}, status=404)

    last_record = ProductionPress.objects.filter(press=data.get('name')).order_by('-date_time').first()
    
    if data.get('pieces_ok') == '':
        piecesOk = 0
    else:
        piecesOk = data.get('pieces_ok')
            
    if data.get('pieces_rework') == '':
        piecesRework = 0
    else:
        piecesRework = data.get('pieces_rework')
    
    if last_record:
        if data.get('employee_number') == '' and last_record.employee_number:
            employeeNumber = last_record.employee_number
        elif data.get('employee_number') != '':
            employeeNumber = int(data.get('employee_number'))
        else:
            employeeNumber = None
            
        if data.get('part_number') == '' or data.get('part_number') == None:
            partNumber = last_record.part_number
        else:
            partNumber = data.get('part_number')
            
        if data.get('molder_number') == '' or data.get('molder_number') == None:
            molderNumber = last_record.molder_number
        else:
            molderNumber = data.get('molder_number')

        if data.get('work_order') == '' or data.get('work_order') == None:
            workOrder = last_record.work_order
        else:
            workOrder = data.get('work_order')
    else:
        if data.get('employee_number') == '' or data.get('employee_number') == None:
            employeeNumber = None
        else:
            employeeNumber = int(data.get('employee_number'))
            
        partNumber = data.get('part_number')

        if data.get('work_order') == '' or data.get('work_order') == None:
            workOrder = ''
        else:
            workOrder = data.get('work_order')

        if data.get('molder_number') == '' or data.get('molder_number') == None:
            molderNumber = None
        else:
            molderNumber = data.get('molder_number')

        if data.get('inserts_total') == '' or data.get('inserts_total') == None:
            inserts_total = None
        else:
            inserts_total = data.get('inserts_total')

    current_time = datetime.now().time()
    if time(7, 0) <= current_time <= time(16, 35):
        shift = 'First'
    elif time(16, 36) <= current_time or current_time <= time(1, 20):
        shift = 'Second'
    else:
        shift = 'Free'
    
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
                inserts_total = inserts_total
            )
    return JsonResponse({'message': 'Datos guardados correctamente.'}, status=201)

@csrf_exempt
@require_POST
def presses_general_pause(request):
    machines = LinePress.objects.all()
    
    current_time = datetime.now().time()
    if time(7, 0) <= current_time <= time(16, 35):
        shift = 'First'
    elif time(16, 36) <= current_time or current_time <= time(1, 20):
        shift = 'Second'
    else:
        shift = 'Free'
    
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
    if time(7, 0) <= current_time <= time(16, 35):
        shift = 'First'
    elif time(16, 36) <= current_time or current_time <= time(1, 20):
        shift = 'Second'
    else:
        shift = 'Free'
    
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

@csrf_exempt
@require_POST
def get_production_press_by_date(request):
    data = request.POST.dict()
    print("Received data:", data)
    date = data.get('date')
    if not date:
        return JsonResponse({'error': 'Date parameter is missing'}, status=400)

    #? preguntar de donde sale el produccion
    production_press_records = ProductionPress.objects.filter(date_time__date=date).values('press', 'employee_number', 'part_number', 'work_order')

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
            }
            result.append(combined_record)
    print("Final result:", result)
    return JsonResponse(result, safe=False)


def register_production(request):
    try:
        data = request.POST.dict()
        date = data.get('fecha')

        records = ProductionPress.objects.filter(date_time=date)

        
        
        

    except Exception as e:
            return JsonResponse({'message': "Error: {}".format(str(e))}, status=400)