import json
import logging
from datetime import date, datetime, time, timedelta
from django.forms import model_to_dict
from django.http import Http404, HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods, require_POST
from django.utils.dateparse import parse_datetime

from .models import (
    LinePress,
    Part_Number,
    Production_records,
    Rubber_Query_history,
    ShiftSchedule,
    StateBarwell,
    StatePress,
    StateTroquelado,
    ProductionPress,
    Qc_Scrap,
    Insert,
    Presses_monthly_goals,
)
from .utils import set_shift, sum_pieces
from django.db.models import Q, Sum
from django.shortcuts import get_object_or_404


@csrf_exempt
def arduino_data(request, path, value):
    if not path or not value:
        return HttpResponse("Path and value are required", status=400)

    if value.startswith("MP-") or value.startswith("MVFP-"):
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
        model_instance.state = {
            "R": "Running",
            "I": "Inactive",
            "P": "Pause",
            "F": "Failure",
        }[path]
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
        if "." not in time_str:
            time_str += ".000000"
        return time_str

    try:
        start_datetime = datetime.strptime(add_milliseconds(start_time), "%H:%M:%S.%f")
        end_datetime = datetime.strptime(add_milliseconds(end_time), "%H:%M:%S.%f")
    except ValueError:
        raise ValueError(
            f"Los valores de tiempo '{start_time}' y '{end_time}' no coinciden con el formato esperado."
        )

    time_difference = (end_datetime - start_datetime).total_seconds() // 60
    return int(time_difference)


@csrf_exempt
@require_POST
def client_data(request):
    logger = logging.getLogger(__name__)

    data = request.POST.dict()

    if request.method == "POST":
        last_record = (
            StatePress.objects.filter(name=data.get("name"))
            .order_by("-date", "-start_time")
            .first()
        )
        if not last_record and data.get("state") == "":
            logger.error("Registro invalido")
            return JsonResponse({"message": "Registro invalido."}, status=201)

        current_time = datetime.now().time()
        shift = set_shift(current_time)

        if last_record:
            if data.get("employeeNumber") == "":
                employeeNumber = last_record.employee_number
            else:
                employeeNumber = data.get("employeeNumber")
        else:
            if data.get("employeeNumber") == "":
                employeeNumber = None
            else:
                employeeNumber = data.get("employeeNumber")

        if last_record:
            if data.get("state") == last_record.state or data.get("state") == "":
                if data.get("comments") != "":
                    if last_record.comments:
                        last_record.comments = (
                            last_record.comments + ", " + data.get("comments")
                        )
                        last_record.save()
                    else:
                        last_record.comments = data.get("comments")
                        last_record.save()
                if data.get("employeeNumber") != "":
                    if last_record.employee_number:
                        update_last_record(last_record)
                        register_client_data(
                            data, last_record.state, employeeNumber, shift
                        )
                    else:
                        last_record.employee_number = data.get("employeeNumber")
                        last_record.save()
                logger.error("Guardado 1")
                return JsonResponse(
                    {"message": "Datos guardados correctamente."}, status=201
                )

        update_last_record(last_record)

        try:
            register_client_data(data, data.get("state"), employeeNumber, shift)

            logger.error("Guardado 3")
            return JsonResponse(
                {"message": "Datos guardados correctamente."}, status=201
            )

        except Exception as e:
            logger.error(f"Error in client_data view: {str(e)}")
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Método no permitido"}, status=405)


def register_client_data(data, state, employeeNumber, shift):
    StatePress.objects.create(
        name=data.get("name"),
        shift=shift,
        date=datetime.now().date(),
        start_time=datetime.now().time(),
        end_time=None,
        total_time=None,
        state=state,
        employee_number=employeeNumber,
        comments=data.get("comments"),
    )


def update_last_record(last_record):
    logger = logging.getLogger(__name__)
    if last_record:
        logger.error(f"Start time: {last_record.start_time}")
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
                "name": machine.name,
                "state": last_state.state,
                "employee_number": last_state.employee_number,
            }
        else:
            machine_data = {
                "name": machine.name,
                "state": "Inactive",
                "employee_number": "",
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
        if machine.status != "Available":
            continue

        production = (
            ProductionPress.objects.filter(press=machine.name)
            .order_by("-date_time")
            .first()
        )
        states = StatePress.objects.filter(name=machine.name)

        if production:
            if production.part_number == None or production.part_number == "":
                partNumber = "--------"
            else:
                partNumber = production.part_number

            if production.employee_number == None or production.employee_number == "":
                employeeNumber = "----"
            else:
                employeeNumber = production.employee_number

            if production.work_order == None or production.work_order == "":
                workOrder = ""
            else:
                workOrder = production.work_order

            if production.molder_number == None or production.molder_number == "":
                molderNumber = "----"
            else:
                molderNumber = production.molder_number
        else:
            partNumber = "--------"
            employeeNumber = "----"
            workOrder = ""
            molderNumber = "----"

        if shift == "First":
            production = ProductionPress.objects.filter(
                press=machine.name,
                shift=shift,
                date_time__date=current_date,
                date_time__time__range=(time(5, 0), time(16, 35)),
            ).aggregate(total_ok=Sum("pieces_ok"), total_rework=Sum("pieces_rework"))
        elif shift == "Second":
            production = ProductionPress.objects.filter(
                Q(
                    press=machine.name,
                    shift=shift,
                    date_time__date=current_date,
                    date_time__time__range=(time(16, 36), time.max),
                )
                | Q(
                    press=machine.name,
                    shift=shift,
                    date_time__date=current_date,
                    date_time__time__range=(time.min, time(1, 20)),
                )
            ).aggregate(total_ok=Sum("pieces_ok"), total_rework=Sum("pieces_rework"))

        if (production and (shift == "First")) or (production and (shift == "Second")):
            total_ok = production["total_ok"] if production["total_ok"] else 0
            total_rework = (
                production["total_rework"] if production["total_rework"] else 0
            )
            actual_ok = sum_pieces(machine, shift, current_date)
        else:
            total_ok = 0
            total_rework = 0
            actual_ok = 0

        if len(states) > 0:
            last_state = states.latest("date", "start_time")
            machine_state = last_state.state
        else:
            machine_state = "Inactive"

        machine_data = {
            "name": machine.name,
            "state": machine_state,
            "employee_number": employeeNumber,
            "pieces_ok": actual_ok,
            "pieces_rework": total_rework,
            "part_number": partNumber,
            "work_order": workOrder,
            "total_ok": total_ok,
            "molder_number": molderNumber,
        }
        total_piecesProduced += total_ok
        machines_data.append(machine_data)

    # logger.error(f'total_piecesProduced: {total_piecesProduced}')
    response_data = {
        "machines_data": machines_data,
        "total_piecesProduced": total_piecesProduced,
    }
    # logger.error(f'total_piecesProduced: {response_data}')
    return JsonResponse(response_data, safe=False)


@csrf_exempt
@require_POST
def register_data_production(request):
    logger = logging.getLogger(__name__)

    data = json.loads(request.body.decode("utf-8"))
    logger.error(f"Data received: {data}")

    if all(
        value == ""
        for value in [
            data.get("part_number"),
            data.get("employee_number"),
            data.get("work_order"),
        ]
    ):
        logger.error("Registro invalido")
        return JsonResponse({"message": "Registro invalido."}, status=201)

    if not Part_Number.objects.filter(part_number=data.get("part_number")).exists():
        return JsonResponse({"message": "Número de parte no existe"}, status=404)

    # Asigna los valores directamente desde el request
    employeeNumber = data.get("employee_number")
    partNumber = data.get("part_number")
    molderNumber = data.get("molder_number")
    workOrder = data.get("work_order")

    piecesOk = data.get("pieces_ok") or 0
    piecesRework = data.get("pieces_rework") or 0

    # Obtén el turno actual
    current_time = datetime.now().time()
    shift = set_shift(current_time)

    logger.error(f"shift: {shift}")

    # Crea un nuevo registro de producción
    ProductionPress.objects.create(
        date_time=datetime.now(),
        employee_number=employeeNumber,
        pieces_ok=piecesOk,
        pieces_scrap=0,
        pieces_rework=piecesRework,
        part_number=partNumber,
        work_order=workOrder,
        molder_number=molderNumber,
        press=data.get("name"),
        shift=shift,
    )
    return JsonResponse({"message": "Datos guardados correctamente."}, status=201)


@csrf_exempt
@require_POST
def get_production_press_by_date(request):
    data = request.POST.dict()
    print("Received data:", data)
    date = data.get("date")
    shift = data.get("shift")
    if not date or not shift:
        return JsonResponse({"error": "Date parameter is missing"}, status=400)

    production_press_records = ProductionPress.objects.filter(
        date_time__date=date, shift=shift
    ).values(
        "id",
        "press",
        "molder_number",
        "part_number",
        "work_order",
        "pieces_ok",
        "date_time",
    )

    print("ProductionPress records found:", production_press_records)

    result = []

    for record in production_press_records:
        print("Processing record:", record)
        part_number_record = (
            Part_Number.objects.filter(part_number=record["part_number"])
            .values("caliber", "cavities", "standard")
            .first()
        )
        print("Part_Number record found:", part_number_record)
        if part_number_record:
            combined_record = {
                "id": record["id"],
                "press": record["press"],
                "molder_number": record["molder_number"],
                "part_number": record["part_number"],
                "work_order": record["work_order"],
                "caliber": part_number_record["caliber"],
                "cavities": part_number_record["cavities"],
                "standard": part_number_record["standard"],
                "pieces_ok": record["pieces_ok"],
                "hour": record["date_time"].strftime("%H:%M:%S"),
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
            StatePress.objects.filter(name=machine.name)
            .order_by("-date", "-start_time")
            .first()
        )
        if last_record and last_record.state == "Running":
            StatePress.objects.create(
                name=machine.name,
                shift=shift,
                date=datetime.now().date(),
                start_time=datetime.now().time(),
                end_time=None,
                total_time=None,
                state="Pause",
                employee_number=last_record.employee_number,
                comments=last_record.comments,
            )
            last_record.end_time = datetime.now().time()
            last_record.total_time = calculate_total_time(
                last_record.start_time, last_record.end_time
            )
            last_record.save()

    return JsonResponse({"message": "General Pause Success."}, status=201)


@csrf_exempt
@require_POST
def presses_general_failure(request):
    machines = LinePress.objects.all()

    current_time = datetime.now().time()
    shift = set_shift(current_time)

    for machine in machines:
        last_record = (
            StatePress.objects.filter(name=machine.name)
            .order_by("-date", "-start_time")
            .first()
        )

        if last_record:
            if last_record.state == "Running" or last_record.state == "Pause":
                StatePress.objects.create(
                    name=machine.name,
                    shift=shift,
                    date=datetime.now().date(),
                    start_time=datetime.now().time(),
                    end_time=None,
                    total_time=None,
                    state="Failure",
                    employee_number=last_record.employee_number,
                    comments=last_record.comments,
                )
                last_record.end_time = datetime.now().time()
                last_record.total_time = calculate_total_time(
                    last_record.start_time, last_record.end_time
                )
                last_record.save()

    return JsonResponse({"message": "General Failure Success."}, status=201)


# Register Scrap
def load_scrap_data(request):
    machines_query = LinePress.objects.filter(status="Available").values_list(
        "name", flat=True
    )
    machines = list(machines_query)

    return JsonResponse(machines, safe=False)


def search_in_part_number(request):
    data = request.GET.dict()
    part_number = data.get("part_number")
    print(f"Searching for part number: {part_number}")

    if not part_number:
        return JsonResponse({"error": "part_number is required"}, status=400)

    part_record = get_object_or_404(Part_Number, part_number=part_number)

    rubber_compound = getattr(part_record, "rubber_compound", None)
    insert = getattr(part_record, "insert", None)
    caliber = getattr(part_record, "caliber", None)
    gripper = getattr(part_record, "gripper", None)

    if insert is not None and caliber is not None:
        try:
            insert_record = Insert.objects.get(insert=insert, caliber=caliber)
            weight = getattr(insert_record, "weight", None)
        except Insert.DoesNotExist:
            print("Insert record not found")
            weight = None
    else:
        weight = None

    data = {
        "Compuesto": rubber_compound,
        "Inserto": insert,
        "Gripper": gripper,
        "Metal": caliber,
        "Ito. s/hule": weight,
    }

    return JsonResponse(data, safe=False)


def search_weight(request):
    data = request.GET.dict()
    metal = data.get("metal")
    insert = data.get("inserto")
    gripper = data.get("gripper")

    print(metal, insert, gripper)

    if not metal or not insert:
        return JsonResponse({"error": "metal and insert are required"}, status=400)

    insert_record = get_object_or_404(Insert, insert=insert, caliber=metal)
    weight = getattr(insert_record, "weight", None)

    response_data = {
        "Ito. s/hule": weight,
    }

    if gripper:
        gripper_record = get_object_or_404(Insert, insert=gripper)
        gripper_weight = getattr(gripper_record, "weight", None)
        response_data["Gripper"] = gripper_weight

    print(response_data)

    return JsonResponse(response_data, safe=False)


@csrf_exempt
@require_POST
def register_scrap(request):
    try:
        print("entro")
        data = json.loads(request.body.decode("utf-8"))

        print(data)

        total_pieces = 0

        def empty_to_none(value):
            return None if value == "" else value

        def part_number_data(field, part_number):
            try:
                part = Part_Number.objects.get(part_number=part_number)
                print(part)
                return getattr(part, field, None)
            except Exception as e:
                print(f"Error in client_data view: {str(e)}")
                return JsonResponse({"error": str(e)}, status=500)

        def gr_to_lbs(gr):
            return gr * 0.00220462

        date = empty_to_none(data.get("date"))
        shift = empty_to_none(data.get("shift"))
        line = empty_to_none(data.get("line"))
        auditor = empty_to_none(data.get("auditor"))
        molder = empty_to_none(data.get("molder"))

        # Accediendo a los inputs como un diccionario
        inputs = data.get("inputs", {})
        codes = data.get("codes", {})

        part_number = empty_to_none(inputs.get("partNumber"))
        compound = empty_to_none(inputs.get("compound"))
        insert = empty_to_none(inputs.get("insert"))
        gripper = empty_to_none(inputs.get("gripper"))
        metal = empty_to_none(inputs.get("metal"))
        insert_without_rubber = empty_to_none(inputs.get("insertWithoutRubber"))
        gripper_without_rubber = empty_to_none(inputs.get("gripperWithoutRubber"))
        rubber_weight = empty_to_none(inputs.get("rubberWeight"))
        insert_with_rubber = empty_to_none(inputs.get("insertWithRubber"))
        gripper_with_rubber = empty_to_none(inputs.get("gripperWithRubber"))
        recycled_inserts = empty_to_none(inputs.get("recycledInserts"))
        total_inserts = empty_to_none(inputs.get("totalInserts"))
        total_grippers = empty_to_none(inputs.get("totalGrippers"))

        # Validación del partNumber
        if part_number is None:
            return JsonResponse({"message": "Part Number Required"}, status=400)

        current_time_str = datetime.now().strftime("%H:%M:%S.%f")

        if not date:
            date = datetime.now()
        else:
            date = f"{data.get('date')} {current_time_str}"

        scrap_entry = Qc_Scrap(
            date_time=date,
            shift=shift,
            line=line,
            auditor_qc=auditor,
            molder_number=molder,
            part_number=part_number,
            gripper=gripper,
            caliber=metal,
            rubber_weight=rubber_weight,
            insert_weight_w_rubber=insert_with_rubber,
            gripper_weight_w_rubber=gripper_with_rubber,
            insert_weight_wout_rubber=insert_without_rubber,
            gripper_weight_wout_rubber=gripper_without_rubber,
            recycled_inserts=recycled_inserts,
            compound=compound,
            mold=part_number_data("mold", part_number),
            insert=insert,
            inserts_total=total_inserts,
            grippers_total=total_grippers,
        )

        # Procesando los códigos
        for code, value in codes.items():
            if value is None:
                setattr(scrap_entry, code, None)
            else:
                setattr(scrap_entry, code, int(value))
                total_pieces += int(value)

        print(total_pieces)

        # Cálculos de peso
        total_bodies_weight = int(rubber_weight) if rubber_weight else 0
        total_inserts_weight = (
            int(insert_without_rubber) * int(total_inserts)
            if insert_without_rubber and total_inserts
            else 0
        )

        total_grippers_weight = (
            float(gripper_without_rubber) * float(total_grippers)
            if gripper_without_rubber and total_grippers
            else 0
        )

        total_rubber_weight_in_insert = (
            int(insert_with_rubber) - total_inserts_weight if insert_with_rubber else 0
        )

        total_rubber_weight_in_gripper = (
            float(gripper_with_rubber) - total_grippers_weight
            if gripper_with_rubber
            else 0
        )

        total_rubber_weight = total_bodies_weight + total_rubber_weight_in_insert

        scrap_entry.total_pieces = total_pieces
        scrap_entry.total_bodies_weight = total_bodies_weight
        scrap_entry.total_inserts_weight = total_inserts_weight
        scrap_entry.total_rubber_weight_in_insert = total_rubber_weight_in_insert
        scrap_entry.total_rubber_weight_in_gripper = total_rubber_weight_in_gripper
        scrap_entry.total_rubber_weight = total_rubber_weight
        scrap_entry.total_bodies_weight_lbs = gr_to_lbs(total_bodies_weight)
        scrap_entry.total_inserts_weight_lbs = gr_to_lbs(total_inserts_weight)
        scrap_entry.total_grippers_weight = total_grippers_weight
        scrap_entry.total_grippers_weight_lbs = gr_to_lbs(total_grippers_weight)
        scrap_entry.total_rubber_weight_in_insert_lbs = gr_to_lbs(
            total_rubber_weight_in_insert
        )
        scrap_entry.total_rubber_weight_in_gripper_lbs = gr_to_lbs(
            total_rubber_weight_in_gripper
        )
        scrap_entry.total_rubber_weight_lbs = gr_to_lbs(total_rubber_weight)

        scrap_entry.save()

        return JsonResponse({"message": "Registro exitoso"}, status=200)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)


@csrf_exempt
@require_POST
def register_scrap_test(request):
    try:
        print("entro")
        data = json.loads(request.body.decode("utf-8"))

        total_pieces = 0

        def empty_to_none(value):
            return None if value == "" else value

        def gr_to_lbs(gr):
            return gr * 0.00220462

        # Extracción de datos
        date = empty_to_none(data.get("date"))
        shift = empty_to_none(data.get("shift"))
        line = empty_to_none(data.get("line"))
        auditor = empty_to_none(data.get("auditor"))
        molder = empty_to_none(data.get("molder"))

        inputs = data.get("inputs", {})
        codes = data.get("codes", {})

        part_number = empty_to_none(inputs.get("partNumber"))
        compound = empty_to_none(inputs.get("compound"))
        insert = empty_to_none(inputs.get("insert"))
        gripper = empty_to_none(inputs.get("gripper"))
        metal = empty_to_none(inputs.get("metal"))
        insert_without_rubber = empty_to_none(inputs.get("insertWithoutRubber"))
        gripper_without_rubber = empty_to_none(inputs.get("gripperWithoutRubber"))
        rubber_weight = empty_to_none(inputs.get("rubberWeight"))
        insert_with_rubber = empty_to_none(inputs.get("insertWithRubber"))
        gripper_with_rubber = empty_to_none(inputs.get("gripperWithRubber"))
        recycled_inserts = empty_to_none(inputs.get("recycledInserts"))
        total_inserts = empty_to_none(inputs.get("totalInserts"))
        total_grippers = empty_to_none(inputs.get("totalGrippers"))

        # Si no hay fecha, se establece la actual
        current_time_str = datetime.now().strftime("%H:%M:%S.%f")
        date = f"{data.get('date')} {current_time_str}" if date else datetime.now()

        scrap_entry = Qc_Scrap(
            date_time=date,
            shift=shift,
            line=line,
            auditor_qc=auditor,
            molder_number=molder,
            part_number=part_number,
            gripper=gripper,
            caliber=metal,
            rubber_weight=rubber_weight,
            insert_weight_w_rubber=insert_with_rubber,
            gripper_weight_w_rubber=gripper_with_rubber,
            insert_weight_wout_rubber=insert_without_rubber,
            gripper_weight_wout_rubber=gripper_without_rubber,
            recycled_inserts=recycled_inserts,
            compound=compound,
            insert=insert,
            inserts_total=total_inserts,
            grippers_total=total_grippers,
        )

        # Procesar códigos
        for code, value in codes.items():
            if value is None or value == "":
                setattr(scrap_entry, code, None)
            else:
                setattr(scrap_entry, code, int(value))
                total_pieces += int(value)

        # Cálculos de peso
        total_bodies_weight = int(rubber_weight) if rubber_weight else 0
        total_inserts_weight = (
            int(insert_without_rubber) * int(total_inserts)
            if insert_without_rubber and total_inserts
            else 0
        )
        total_grippers_weight = (
            float(gripper_without_rubber) * float(total_grippers)
            if gripper_without_rubber and total_grippers
            else 0
        )
        total_rubber_weight_in_insert = (
            int(insert_with_rubber) - total_inserts_weight if insert_with_rubber else 0
        )
        total_rubber_weight_in_gripper = (
            float(gripper_with_rubber) - total_grippers_weight
            if gripper_with_rubber
            else 0
        )

        total_rubber_weight = total_bodies_weight + total_rubber_weight_in_insert

        scrap_entry.total_pieces = total_pieces
        scrap_entry.total_bodies_weight = total_bodies_weight
        scrap_entry.total_inserts_weight = total_inserts_weight
        scrap_entry.total_rubber_weight_in_insert = total_rubber_weight_in_insert
        scrap_entry.total_rubber_weight_in_gripper = total_rubber_weight_in_gripper
        scrap_entry.total_rubber_weight = total_rubber_weight
        scrap_entry.total_bodies_weight_lbs = gr_to_lbs(total_bodies_weight)
        scrap_entry.total_inserts_weight_lbs = gr_to_lbs(total_inserts_weight)
        scrap_entry.total_grippers_weight = total_grippers_weight
        scrap_entry.total_grippers_weight_lbs = gr_to_lbs(total_grippers_weight)
        scrap_entry.total_rubber_weight_in_insert_lbs = gr_to_lbs(
            total_rubber_weight_in_insert
        )
        scrap_entry.total_rubber_weight_in_gripper_lbs = gr_to_lbs(
            total_rubber_weight_in_gripper
        )
        scrap_entry.total_rubber_weight_lbs = gr_to_lbs(total_rubber_weight)

        scrap_entry.save()

        return JsonResponse({"message": "Registro exitoso"}, status=200)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

def register(request):
    print("Aqui")
    return JsonResponse({"message": "Registro exitoso"}, status=200)


@csrf_exempt
@require_http_methods(["POST", "PUT"])
def post_or_put_monthly_goal(request):
    # TODO agregar seguridad para que si se agrega el mismo mes 2 veces, se haga PUT y no POST
    data = request.POST.dict()
    print(data)

    try:
        month = int(data["month"])
        year = int(data["year"])
        target_amount = float(data["target_amount"])

        if month < 1 or month > 12:
            return JsonResponse({"error": "month out of range"}, status=400)

        # Verificar si ya existe una meta para el mes y año dados
        goal, created = Presses_monthly_goals.objects.get_or_create(
            month=month, year=year, defaults={"target_amount": target_amount}
        )

        if not created:
            # Si ya existe, actualizamos el target_amount
            goal.target_amount = target_amount
            goal.save()
            return JsonResponse(
                {
                    "message": "Goal updated successfully",
                    "id": goal.id,
                    "month": goal.month,
                    "year": goal.year,
                    "target_amount": goal.target_amount,
                },
                status=200,
            )
        else:
            return JsonResponse(
                {
                    "message": "Goal created successfully",
                    "id": goal.id,
                    "month": goal.month,
                    "year": goal.year,
                    "target_amount": goal.target_amount,
                },
                status=201,
            )

    except KeyError:
        return JsonResponse({"error": "Missing fields"}, status=400)

    except ValueError:
        return JsonResponse({"error": "Invalid data types"}, status=400)


def get_presses_monthly_goal(request, year, month):
    try:
        goal = Presses_monthly_goals.objects.get(year=year, month=month)
        return JsonResponse(
            {
                "id": goal.id,
                "month": goal.month,
                "year": goal.year,
                "target_amount": goal.target_amount,
            }
        )

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

        total_pieces = (
            ProductionPress.objects.filter(
                date_time__gte=start_date, date_time__lt=end_date
            ).aggregate(Sum("pieces_ok"))["pieces_ok__sum"]
            or 0
        )

        percentage = (total_pieces / goal.target_amount) * 100

        return JsonResponse({"percentage": percentage, "total_pieces": total_pieces})
    except Presses_monthly_goals.DoesNotExist:
        return HttpResponse(status=404)


@csrf_exempt
@require_POST
def save_production_records(request):
    try:
        data = json.loads(request.body)
        date = data["date"]
        shift = data["shift"]
        records = data["records"]
        overwrite = data.get("overwrite", False)

        # Verifica si ya existen registros para la misma fecha y turno
        existing_records = Production_records.objects.filter(date=date, shift=shift)

        if existing_records.exists() and not overwrite:
            return JsonResponse(
                {
                    "status": "exists",
                    "message": "Ya existen registros para la fecha y turno seleccionados. ¿Desea sobrescribirlos?",
                },
                status=200,
            )

        if overwrite:
            # Elimina los registros anteriores si se decide sobrescribir
            existing_records.delete()

        # Crea nuevos registros
        for record in records:
            Production_records.objects.create(
                press=record["press"],
                employee_number=record["employee_number"],
                part_number=record["part_number"],
                work_order=record["work_order"],
                caliber=record["caliber"],
                worked_hrs=record["worked_hrs"],
                dead_time_cause_1=record["dead_time_cause_1"],
                cavities=record["cavities"],
                standard=record["standard"],
                proposed_standard=record["proposed_standard"],
                dead_time_cause_2=record["dead_time_cause_2"],
                pieces_ok=record["pieces_ok"],
                efficiency=record["efficiency"],
                date=date,
                shift=shift,
                mod_date=datetime.now(),
            )

        return JsonResponse({"status": "success"}, status=200)

    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=400)


@csrf_exempt
@require_http_methods(["PATCH"])
def update_pieces_ok(request, id):
    try:
        data = json.loads(request.body)
        print(data)
        production_press = ProductionPress.objects.get(id=id)

        production_press.pieces_ok = data.get("pieces_ok", production_press.pieces_ok)
        production_press.save()

        return JsonResponse({"message": "Registro actualizado correctamente"})

    except ProductionPress.DoesNotExist:
        return JsonResponse({"error": "Registro no encontrado"}, status=404)

    except Exception as e:
        print("Error: ", e)
        return JsonResponse({"error": str(e)}, status=400)


def get_rubber_compounds(request):
    compounds = Part_Number.objects.values_list("rubber_compound", flat=True).distinct()

    return JsonResponse(list(compounds), safe=False)


@csrf_exempt
@require_POST
def get_total_weight(request):
    data = json.loads(request.body)
    start_date = data.get("start_date")
    end_date = data.get("end_date")
    compound = data.get("compound")
    print(data)

    try:
        # Convertir las fechas a formato de datetime
        start_date = datetime.strptime(start_date, "%Y-%m-%d")
        end_date = datetime.strptime(end_date, "%Y-%m-%d")

        # Incluir el final del día en end_date
        end_date = end_date + timedelta(days=1) - timedelta(seconds=1)

        records = Qc_Scrap.objects.filter(
            date_time__range=(start_date, end_date), compound=compound
        )
        total_weight = sum(
            record.total_bodies_weight_lbs
            for record in records
            if record.total_bodies_weight_lbs
        )
        print(records)

        total_weight = round(total_weight, 2)

        return JsonResponse({"total_weight": total_weight or 0})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


def get_mold_by_part_number(request, part_number):
    try:
        part = Part_Number.objects.get(part_number=part_number)
        return JsonResponse({"mold": part.mold})
    except Part_Number.DoesNotExist:
        raise Http404("Part number not found")


@csrf_exempt
def get_scrap_register_summary(request, date):
    # Convierte la fecha del parámetro
    try:
        date = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        return JsonResponse(
            {"error": "Formato de fecha inválido. Usa YYYY-MM-DD."}, status=400
        )

    # Filtra los registros de acuerdo a la fecha
    scrap_data = Qc_Scrap.objects.filter(date_time__date=date)

    # Extrae los datos que necesitas de cada registro
    result = list(
        scrap_data.values(
            "id",
            "rubber_weight",
            "total_pieces",
            "insert_weight_w_rubber",
            "date_time",
            "shift",
            "line",
            "auditor_qc",
            "molder_number",
            "part_number",
            "compound",
            "caliber",
        )
    )

    # Retorna la respuesta en formato JSON
    return JsonResponse(result, safe=False)


@csrf_exempt
def delete_scrap_register(request, id):
    if request.method == "DELETE":
        try:
            scrap_record = Qc_Scrap.objects.get(id=id)
            scrap_record.delete()
            return JsonResponse(
                {"message": "Registro eliminado exitosamente."}, status=200
            )
        except Qc_Scrap.DoesNotExist:
            return JsonResponse({"error": "Registro no encontrado."}, status=404)
    return JsonResponse({"error": "Método no permitido."}, status=405)


@csrf_exempt
def get_rubber_report_history(request):
    history = Rubber_Query_history.objects.all()

    data = [
        {
            "query_date": h.query_date,
            "start_date": h.start_date,
            "end_date": h.end_date,
            "compound": h.compound,
            "total_weight": h.total_weight,
        }
        for h in history
    ]

    return JsonResponse(data, safe=False)


@csrf_exempt
def get_part_nums(request):
    part_nums = Part_Number.objects.all()

    data = [
        {
            "part_number": p.part_number,
            "client": p.client,
            "box": p.box,
            "pieces_x_box": p.pieces_x_box,
            "rubber_compound": p.rubber_compound,
            "standard": p.standard,
            "pallet": p.pallet,
            "box_x_pallet": p.box_x_pallet,
            "pieces_x_pallet": p.pieces_x_pallet,
            "mold": p.mold,
            "insert": p.insert,
            "caliber": p.caliber,
            "gripper": p.gripper,
        }
        for p in part_nums
    ]

    return JsonResponse(data, safe=False)


# ? Podría ser útil en el futuro
# @csrf_exempt
# def get_all_part_nums(request):
#     part_nums = Part_Number.objects.all()
#     data = serializers.serialize('json',part_nums)
#     return JsonResponse(data, safe=False)


@csrf_exempt
def get_all_part_nums_names(request):
    search_query = request.GET.get("search", "")
    part_nums = Part_Number.objects.filter(part_number__icontains=search_query).values(
        "part_number"
    )
    return JsonResponse(list(part_nums), safe=False)


@csrf_exempt
def get_part_num_by_name(request, name):
    part_num = Part_Number.objects.filter(part_number=name).first()
    if part_num:
        # Excluimos los campos de imagen
        data = model_to_dict(
            part_num,
            exclude=[
                "image_piece_label",
                "image_box_label",
                "image_box_label_2",
                "image_box_label_3",
            ],
        )

        # Añadimos las URLs de las imágenes si existen
        if part_num.image_piece_label:
            data["image_piece_label_url"] = part_num.image_piece_label.url
        if part_num.image_box_label:
            data["image_box_label_url"] = part_num.image_box_label.url
        if part_num.image_box_label_2:
            data["image_box_label_2_url"] = part_num.image_box_label_2.url
        if part_num.image_box_label_3:
            data["image_box_label_3_url"] = part_num.image_box_label_3.url

        return JsonResponse(data, safe=False)
    else:
        return JsonResponse({"error": "Part number not found"}, status=404)


@csrf_exempt
@require_POST
def post_part_number(request):
    try:
        data = json.loads(request.body)
        print(data)

        if Part_Number.objects.filter(part_number=data.get("part_number")).exists():
            print("El número de parte ya existe")
            return JsonResponse({"error": "El número de parte ya existe."}, status=400)

        Part_Number.objects.create(
            part_number=data.get("part_number"),
            client=data.get("client"),
            box=data.get("box"),
            pieces_x_box=data.get("pieces_x_box"),
            rubber_compound=data.get("rubber_compound"),
            price=data.get("price"),
            standard=data.get("standard"),
            pallet=data.get("pallet"),
            box_x_pallet=data.get("box_x_pallet"),
            pieces_x_pallet=data.get("pieces_x_pallet"),
            assembly=data.get("assembly"),
            accessories=data.get("accessories"),
            mold=data.get("mold"),
            instructive=data.get("instructive"),
            insert=data.get("insert"),
            gripper=data.get("gripper"),
            caliber=data.get("caliber"),
            paint=data.get("paint"),
            std_paint=data.get("std_paint"),
            painter=data.get("painter"),
            scrap=data.get("scrap"),
            box_logo=data.get("box_logo"),
            cavities=data.get("cavities"),
            category=data.get("category"),
            type2=data.get("type2"),
            measurement=data.get("measurement"),
            special=data.get("special"),
            piece_label=data.get("piece_label"),
            qty_piece_labels=data.get("qty_piece_labels"),
            box_label=data.get("box_label"),
            qty_box_labels=data.get("qty_box_labels"),
            box_label_2=data.get("box_label_2"),
            qty_box_labels_2=data.get("qty_box_labels_2"),
            box_label_3=data.get("box_label_3"),
            qty_box_labels_3=data.get("qty_box_labels_3"),
            made_in_mexico=data.get("made_in_mexico"),
            staples=data.get("staples"),
            image_piece_label=data.get("image_piece_label"),
            image_box_label=data.get("image_box_label"),
            image_box_label_2=data.get("image_box_label_2"),
            image_box_label_3=data.get("image_box_label_3"),
        )

        return JsonResponse({"message": "Part number created successfully"}, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


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
@require_POST
def get_pieces_ok_by_date_range(request):
    try:
        data = json.loads(request.body)
        start_date = parse_datetime(data.get("start_date"))
        end_date = parse_datetime(data.get("end_date"))

        if not start_date or not end_date:
            return JsonResponse(
                {"error": "start_date and end_date are required"}, status=400
            )

        records = Production_records.objects.filter(date__range=(start_date, end_date))

        # Serializa los datos
        response_data = [
            {
                "id": record.id,
                "press": record.press,
                "employee_number": record.employee_number,
                "part_number": record.part_number,
                "work_order": record.work_order,
                "caliber": record.caliber,
                "worked_hrs": float(record.worked_hrs)
                if record.worked_hrs is not None
                else None,
                "dead_time_cause_1": record.dead_time_cause_1,
                "cavities": record.cavities,
                "standard": record.standard,
                "proposed_standard": record.proposed_standard,
                "dead_time_cause_2": record.dead_time_cause_2,
                "pieces_ok": record.pieces_ok,
                "efficiency": float(record.efficiency),
                "date": record.date,
                "shift": record.shift,
                "mod_date": record.mod_date,
            }
            for record in records
        ]

        return JsonResponse(response_data, safe=False)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def get_record_by_id(request, id):
    try:
        record = Production_records.objects.filter(id=id).values().first()

        if record is None:
            return JsonResponse({"error": "Record not found"}, status=404)

        return JsonResponse(record, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
