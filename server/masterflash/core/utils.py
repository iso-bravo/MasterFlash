from datetime import time, datetime
from django.conf import settings
from django.db.models import Q, Sum, Max
import redis

from masterflash.core.models import (
    LinePress,
    ProductionPress,
    ShiftSchedule,
    StatePress,
    WorkedHours,
)


def set_shift(current_time: time) -> str:
    # Obtiene el registro de horarios de la base de datos
    try:
        schedule = ShiftSchedule.objects.get(
            id=1
        )  # Ajusta si usas otro ID o condiciones
    except ShiftSchedule.DoesNotExist:
        return "Free"  # En caso de no existir el registro, retornar 'Free'

    first_shift_start = schedule.first_shift_start
    first_shift_end = schedule.first_shift_end
    second_shift_start = schedule.second_shift_start
    second_shift_end = schedule.second_shift_end

    # Comprobación de turno usando los valores de base de datos
    if first_shift_start <= current_time <= first_shift_end:
        return "First"
    elif second_shift_start <= current_time or current_time <= second_shift_end:
        return "Second"
    else:
        return "Free"


def sum_pieces(machine, shift, current_date):
    last_record = (
        ProductionPress.objects.filter(press=machine.name)
        .order_by("-date_time")
        .first()
    )

    if not last_record:
        return 0

    part_number = last_record.part_number
    work_order = last_record.work_order
    pieces_sum = 0

    if shift == "First":
        records = ProductionPress.objects.filter(
            press=machine.name,
            shift=shift,
            date_time__date=current_date,
            date_time__time__range=(time(5, 0), time(16, 35)),
        ).order_by("-date_time")
    elif shift == "Second":
        records = ProductionPress.objects.filter(
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
        ).order_by("-date_time")
    else:
        return 0

    record_iterator = records.iterator()

    current_record = next(record_iterator, None)
    while (
        current_record
        and current_record.part_number == part_number
        and current_record.work_order == work_order
    ):
        pieces_sum += current_record.pieces_ok or 0
        current_record = next(record_iterator, None)

    return pieces_sum


def send_production_data():
    print("Sending production data...")
    current_date = datetime.now().date()
    current_time = datetime.now().time()
    shift = set_shift(current_time)

    machines = LinePress.objects.filter(status="Available")

    states = StatePress.objects.all().values("name", "state")
    states_dict = {s["name"]: s["state"] for s in states}

    latest_dates = (
        ProductionPress.objects.filter(press__in=[m.name for m in machines])
        .values("press")
        .annotate(max_date=Max("date_time"))
    )

    latest_prod_dict = {}
    for item in latest_dates:
        prod = ProductionPress.objects.filter(
            press=item["press"], date_time=item["max_date"]
        ).first()
        if prod:
            latest_prod_dict[item["press"]] = prod

    latest_hours = (
        WorkedHours.objects.filter(
            press__in=[m.name for m in machines],
            end_time__isnull=True,
            start_time__date=current_date,
            start_time__lte=datetime.now(),
        )
        .values("press")
        .annotate(max_start_time=Max("start_time"))
    )

    worked_hours_dict = {}
    for item in latest_hours:
        wh = WorkedHours.objects.filter(
            press=item["press"], start_time=item["max_start_time"]
        ).first()
        if wh:
            worked_hours_dict[item["press"]] = wh

    # Obtener el horario de turnos
    try:
        schedule = ShiftSchedule.objects.first()
        if not schedule:
            raise Exception("No Shift Schedule defined")
    except ShiftSchedule.DoesNotExist:
        # Crear valores por defecto si no existen
        schedule = ShiftSchedule.objects.create()

    # Definir los rangos de tiempo dinámicamente
    if shift == "First":
        shift_filter = Q(
            date_time__time__range=(
                schedule.first_shift_start,
                schedule.first_shift_end,
            )
        )
    elif shift == "Second":
        shift_filter = Q(
            date_time__time__range=(
                schedule.second_shift_start,
                schedule.second_shift_end,
            )
        ) | Q(date_time__time__range=(time.min, schedule.second_shift_end))

    shift_productions = (
        ProductionPress.objects.filter(shift=shift, date_time__date=current_date)
        .filter(shift_filter)
        .values("press")
        .annotate(total_ok=Sum("pieces_ok"), total_rework=Sum("pieces_rework"))
    )

    shift_data = {item["press"]: item for item in shift_productions}

    redis_client = redis.StrictRedis(
        host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=0
    )

    molder_keys = [f"previous_molder_number_{machine.name}" for machine in machines]
    previous_molders = redis_client.mget(molder_keys)

    molder_dict = {
        machine.name: val.decode("utf-8") if val else "----"
        for machine, val in zip(machines, previous_molders)
    }

    machines_data = []
    total_piecesProduced = 0
    total_pieces = (
        ProductionPress.objects.filter(
            date_time__year=current_date.year, date_time__month=current_date.month
        ).aggregate(total=Sum("pieces_ok"))["total"]
        or 0
    )

    for machine in machines:
        # Obtener la última producción para datos como part_number, molder_number, etc.
        latest_production = latest_prod_dict.get(machine.name)

        partNumber = getattr(latest_production, "part_number", "--------")
        employeeNumber = getattr(latest_production, "employee_number", "----")
        workOrder = getattr(latest_production, "work_order", "")
        molderNumber = getattr(latest_production, "molder_number", "----")
        caliber = getattr(latest_production, "caliber", "----")

        # Obtener horas trabajadas desde el diccionario
        worked_hours_entry = worked_hours_dict.get(machine.name)
        start_time = worked_hours_entry.start_time if worked_hours_entry else None

        # Obtener datos del turno desde el diccionario
        shift_info = shift_data.get(machine.name, {})
        total_ok = shift_info.get("total_ok", 0)
        total_rework = shift_info.get("total_rework", 0)
        actual_ok = sum_pieces(machine, shift, current_date) if shift else 0

        # Obtener el estado desde el diccionario de estados
        machine_state = states_dict.get(machine.name, "Inactive")

        previous_molder_number = molder_dict.get(machine.name, "----")

        machine_data = {
            "name": machine.name,
            "state": machine_state,
            "employee_number": employeeNumber,
            "pieces_ok": actual_ok,
            "pieces_rework": total_rework,
            "part_number": partNumber,
            "work_order": workOrder,
            "total_ok": total_ok,
            "molder_number": previous_molder_number
            if previous_molder_number != "----"
            else molderNumber,
            "previous_molder_number": previous_molder_number,
            "caliber": caliber,
            "start_time": start_time.isoformat() if start_time else None,
            "worked_hours_id": worked_hours_entry.pk if worked_hours_entry else None,
        }
        total_piecesProduced += total_ok
        machines_data.append(machine_data)

    response_data = {
        "machines_data": machines_data,
        "total_piecesProduced": total_piecesProduced,
        "actual_produced": total_pieces,
    }

    return response_data
