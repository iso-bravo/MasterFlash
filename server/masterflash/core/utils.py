from datetime import date, time, datetime
from django.conf import settings
from django.db.models import Q, Sum
import redis

from masterflash.core.models import (
    LinePress,
    Presses_monthly_goals,
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

    machines = LinePress.objects.all()
    machines_data = []
    total_piecesProduced = 0
    redis_client = redis.StrictRedis(
        host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=0
    )

    # 'total_pieces and 'percentage' calculation
    year = current_date.year
    month = current_date.month

    try:
        start_date = date(year, month, 1)
        end_date = date(year + 1, 1, 1) if month == 12 else date(year, month + 1, 1)

        total_pieces = (
            ProductionPress.objects.filter(
                date_time__gte=start_date, date_time__lt=end_date
            ).aggregate(Sum("pieces_ok"))["pieces_ok__sum"]
            or 0
        )
    except Presses_monthly_goals.DoesNotExist:
        total_pieces = 0

    for machine in machines:
        if machine.status != "Available":
            continue

        production = (
            ProductionPress.objects.filter(press=machine.name)
            .order_by("-date_time")
            .first()
        )
        states = StatePress.objects.filter(name=machine.name)

        partNumber = (
            production.part_number
            if production and production.part_number
            else "--------"
        )
        employeeNumber = (
            production.employee_number
            if production and production.employee_number
            else "----"
        )
        workOrder = (
            production.work_order if production and production.work_order else ""
        )
        molderNumber = (
            production.molder_number
            if production and production.molder_number
            else "----"
        )
        caliber = production.caliber if production and production.caliber else "----"

        worked_hours_entry = (
            WorkedHours.objects.filter(
                start_time__date=current_date, start_time__lte=datetime.now()
            )
            .order_by("-start_time")
            .first()
        )
        start_time = worked_hours_entry.start_time if worked_hours_entry else None

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

        if production and (shift == "First" or shift == "Second"):
            total_ok = production["total_ok"] if production["total_ok"] else 0
            total_rework = (
                production["total_rework"] if production["total_rework"] else 0
            )
            actual_ok = sum_pieces(machine, shift, current_date)
        else:
            total_ok = 0
            total_rework = 0
            actual_ok = 0

        if states:
            last_state = states.latest("date", "start_time")
            machine_state = last_state.state
        else:
            machine_state = "Inactive"

        previous_molder_number = redis_client.get(
            f"previous_molder_number_{machine.name}"
        )
        previous_molder_number = (
            previous_molder_number.decode("utf-8") if previous_molder_number else "----"
        )

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
            "previous_molder_number": previous_molder_number,
            "caliber": caliber,
            "start_time": start_time.isoformat() if start_time else None,
        }
        total_piecesProduced += total_ok
        machines_data.append(machine_data)

    response_data = {
        "machines_data": machines_data,
        "total_piecesProduced": total_piecesProduced,
        "actual_produced": total_pieces,
    }

    return response_data
