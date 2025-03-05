from datetime import date, datetime, time
import json
from django.http import HttpResponse, HttpResponseNotAllowed, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from ..models import (
    LinePress,
    Part_Number,
    Presses_monthly_goals,
    ProductionPress,
    StateBarwell,
    StatePress,
    StateTroquelado,
    WorkedHours,
)
from ..utils import get_shift, sum_pieces
from django.conf import settings
import logging
import redis
from django.db.models import Q, Sum
from django.db import transaction
from django.views.decorators.http import require_http_methods, require_POST


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
        shift = get_shift(current_time)

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
    machines = LinePress.objects.all()
    machines_data = []
    total_piecesProduced = 0

    current_date = datetime.now().date()
    current_time = datetime.now().time()
    shift = get_shift(current_time)

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
            if production.part_number is None or production.part_number == "":
                partNumber = "--------"
            else:
                partNumber = production.part_number

            if production.employee_number is None or production.employee_number == "":
                employeeNumber = "----"
            else:
                employeeNumber = production.employee_number

            if production.work_order is None or production.work_order == "":
                workOrder = ""
            else:
                workOrder = production.work_order

            if production.molder_number is None or production.molder_number == "":
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

    redis_client = redis.StrictRedis(
        host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=0
    )

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

    press_name = data.get("name")
    worked_hours_id = data.get("worked_hours_id")
    previousMolderNumber = data.get("previous_molder_number")
    relay = data.get("is_relay")
    start_time = data.get("start_time")
    end_time = data.get("end_time")

    if end_time and end_time < start_time:
        return JsonResponse(
            {"message": "La hora de finalización no puede ser anterior a la de inicio"},
            status=400,
        )

    previous_worked_hours_id = redis_client.get(
        f"previous_worked_hours_id_{press_name}"
    )

    if relay and previousMolderNumber:
        redis_client.set(
            f"previous_molder_number_{data.get('name')}", previousMolderNumber
        )

    if relay:
        try:
            redis_client.set(f"previous_worked_hours_id_{press_name}", worked_hours_id)
            worked_hours = WorkedHours.objects.create(
                press=press_name,
                start_time=start_time,
                end_time=end_time,
            )
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    elif worked_hours_id:
        try:
            worked_hours = WorkedHours.objects.get(id=worked_hours_id, press=press_name)
        except WorkedHours.DoesNotExist:
            return JsonResponse(
                {"error": "Horas trabajadas no encontradas"}, status=404
            )

    elif previous_worked_hours_id:
        try:
            worked_hours = WorkedHours.objects.get(
                id=previous_worked_hours_id, press=press_name
            )
            redis_client.delete(f"previous_worked_hours_id_{press_name}")
        except WorkedHours.DoesNotExist:
            return JsonResponse(
                {"error": "Horas trabajadas no encontradas"}, status=404
            )
    else:
        worked_hours = WorkedHours.objects.create(
            press=press_name,
            start_time=start_time,
            end_time=end_time,
        )

    if end_time and not relay:
        worked_hours.end_time = end_time
        worked_hours.save()
        redis_client.delete(f"previous_molder_number_{data.get('name')}")

    # Asigna los valores directamente desde el request
    employeeNumber = data.get("employee_number")
    partNumber = data.get("part_number")
    caliber = data.get("caliber")
    molderNumber = data.get("molder_number")
    workOrder = data.get("work_order")

    piecesOk = data.get("pieces_ok") or 0
    piecesRework = data.get("pieces_rework") or 0

    # Obtén el turno actual
    current_time = datetime.now().time()
    shift = get_shift(current_time)

    logger.error(f"shift: {shift}")

    # Crea un nuevo registro de producción
    ProductionPress.objects.create(
        date_time=start_time,
        employee_number=employeeNumber,
        pieces_ok=piecesOk,
        pieces_scrap=0,
        pieces_rework=piecesRework,
        part_number=partNumber,
        caliber=caliber,
        work_order=workOrder,
        molder_number=molderNumber,
        press=data.get("name"),
        shift=shift,
        relay=relay,
        worked_hours=worked_hours,
    )

    transaction.commit()

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
        "caliber",
        "part_number",
        "work_order",
        "pieces_ok",
        "date_time",
        "worked_hours",
        "relay",
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
        if record["worked_hours"]:
            worked_hours_obj = WorkedHours.objects.get(id=record["worked_hours"])
            duration = worked_hours_obj.duration
            if duration:
                worked_hours_hours = round(duration.total_seconds() / 3600, 2)
            else:
                worked_hours_hours = None
        else:
            worked_hours_hours = None
        if part_number_record:
            combined_record = {
                "id": record["id"],
                "press": record["press"],
                "molder_number": record["molder_number"],
                "part_number": record["part_number"],
                "work_order": record["work_order"],
                "caliber": record["caliber"],
                "cavities": part_number_record["cavities"],
                "standard": part_number_record["standard"],
                "pieces_ok": record["pieces_ok"],
                "hour": record["date_time"].strftime("%H:%M:%S"),
                "worked_hours": worked_hours_hours,
                "relay": record["relay"],
            }
            result.append(combined_record)
    print("Final result:", result)
    return JsonResponse(result, safe=False)


@csrf_exempt
@require_POST
def presses_general_pause(request):
    machines = LinePress.objects.all()

    current_time = datetime.now().time()
    shift = get_shift(current_time)

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
    shift = get_shift(current_time)

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


@csrf_exempt
@require_http_methods(["POST", "PUT"])
def post_or_put_monthly_goal(request):
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


@csrf_exempt
def get_todays_machine_production(request):
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])
    else:
        machine = request.GET.get("mp")
        shift = request.GET.get("shift")
        if not machine:
            return JsonResponse({"error": "Missing machine parameter"}, status=400)

        try:
            production_data = (
                ProductionPress.objects.filter(
                    press=machine, date_time__date=date.today(), shift=shift
                )
                .values("part_number")
                .annotate(total_pieces_ok=Sum("pieces_ok"))
            )
            print(production_data)

            return JsonResponse(list(production_data), safe=False)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def get_worked_hours_by_id(request, id):
    try:
        worked_hours = WorkedHours.objects.get(id=id)
        if worked_hours.end_time:
            return JsonResponse({"duration": worked_hours.duration()}, safe=False)
        else:
            return JsonResponse({"start_time": worked_hours.start_time}, safe=False)
    except WorkedHours.DoesNotExist:
        return HttpResponse(status=404)
