from datetime import datetime, timedelta
from django.http import JsonResponse
from ..models import (
    Presses_monthly_goals,
    ProductionPress,
    Qc_Scrap,
    StatePress,
)
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Sum, Count, Q


# TODO: things that we need for the dashboard
# 4. renew: no formula yet


@csrf_exempt
def production_summary(request):
    if request.method == "GET":
        # Obtener parámetros de consulta (mes y año)
        month = request.GET.get("month")
        year = request.GET.get("year")

        # Validar que los parámetros sean válidos
        if not month or not year:
            return JsonResponse(
                {"error": "Please provide 'month' and 'year' query parameters."},
                status=400,
            )

        try:
            month = int(month)
            year = int(year)
        except ValueError:
            return JsonResponse(
                {"error": "'month' and 'year' must be integers."}, status=400
            )

        # Validar rango de mes
        if month < 1 or month > 12:
            return JsonResponse(
                {"error": "'month' must be between 1 and 12."}, status=400
            )

        # Filtrar ProductionPress por mes y año
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1)
        else:
            end_date = datetime(year, month + 1, 1)

        pieces_ok_total = (
            ProductionPress.objects.filter(
                date_time__gte=start_date, date_time__lt=end_date
            ).aggregate(total_pieces_ok=Sum("pieces_ok"))["total_pieces_ok"]
            or 0
        )

        # Obtener el objetivo mensual
        monthly_goal = Presses_monthly_goals.objects.filter(
            month=month, year=year
        ).first()

        target_amount = monthly_goal.target_amount if monthly_goal else 0

        # Preparar respuesta
        response_data = {
            "month": month,
            "year": year,
            "pieces_ok_total": pieces_ok_total,
            "target_amount": target_amount,
        }

        return JsonResponse(response_data, status=200)

    return JsonResponse({"error": "Only GET method is allowed."}, status=405)


@csrf_exempt
def mps_fails_and_pauses(request):
    if request.method == "GET":
        # Obtener parámetros de consulta (mes y año)
        month = request.GET.get("month")
        year = request.GET.get("year")

        if not month or not year:
            return JsonResponse(
                {"error": "Se requieren los parámetros 'month' y 'year'."}, status=400
            )

        try:
            month = int(month)
            year = int(year)
        except ValueError:
            return JsonResponse(
                {"error": "Los parámetros 'month' y 'year' deben ser números."},
                status=400,
            )

        results = StatePress.objects.filter(
            date__year=year,
            date__month=month,
        ).aggregate(
            pause_count=Count("state", filter=Q(state="Pause")),
            failure_count=Count("state", filter=Q(state="Failure")),
        )

        return JsonResponse(results, safe=False)

    return JsonResponse({"error": "Only GET method is allowed."}, status=405)


@csrf_exempt
def scrap_per_employee(request):
    if request.method == "GET":
        date = request.GET.get("date")
        if not date:
            return JsonResponse(
                {"error": "Se requiere el parámetro 'date'."}, status=400
            )
        try:
            date = datetime.strptime(date, "%Y-%m-%d")
        except ValueError:
            return JsonResponse(
                {"error": "El parámetro 'date' debe tener el formato 'YYYY-MM-DD'."},
                status=400,
            )

        results = (
            Qc_Scrap.objects.filter(date_time__date=date)
            .values("molder_number")
            .annotate(
                CS=Sum("CS"),
                CROP=Sum("CROP"),
                DP=Sum("DP"),
                DI=Sum("DI"),
                F=Sum("F"),
                FC=Sum("FC"),
                FPO=Sum("FPO"),
                GA=Sum("GA"),
                GM=Sum("GM"),
                H=Sum("H"),
                IM=Sum("IM"),
                IMC=Sum("IMC"),
                IR=Sum("IR"),
                M=Sum("M"),
                MR=Sum("MR"),
                R=Sum("R"),
                SG=Sum("SG"),
                SI=Sum("SI"),
            )
        )

        general_total = 0

        data = []
        for result in results:
            cleaned_result = {k: v for k, v in result.items() if v is not None}

            employee_total = sum(
                v for k, v in cleaned_result.items() if k != "molder_number"
            )

            cleaned_result["total"] = employee_total

            general_total += employee_total

            data.append(cleaned_result)

        response = {"data": data, "general_total": general_total}

        return JsonResponse(response, safe=False)

    return JsonResponse({"error": "Only GET method is allowed."}, status=405)


@csrf_exempt
def get_week_production(request):
    if request.method == "GET":
        date = request.GET.get("date")
        if not date:
            return JsonResponse(
                {"error": "Se requiere el parámetro 'date'."}, status=400
            )
        try:
            date = datetime.strptime(date, "%Y-%m-%d")
        except ValueError:
            return JsonResponse(
                {"error": "El parámetro 'date' debe tener el formato 'YYYY-MM-DD'."},
                status=400,
            )

        start_of_week = date - timedelta(days=date.weekday())

        end_of_week = start_of_week + timedelta(days=6)

        week_data = ProductionPress.objects.filter(
            date_time__date__gte=start_of_week,
            date_time__date__lte=end_of_week,
        )

        production_by_day = {
            "Monday": 0,
            "Tuesday": 0,
            "Wednesday": 0,
            "Thursday": 0,
            "Friday": 0,
        }

        for record in week_data:
            day_name = record.date_time.strftime("%A")
            if day_name in production_by_day:
                production_by_day[day_name] += record.pieces_ok or 0

        response_data = [
            {"day": day, "Producción": pieces_ok}
            for day, pieces_ok in production_by_day.items()
        ]

        return JsonResponse(response_data, safe=False)

    return JsonResponse({"error": "Only GET method is allowed."}, status=405)


@csrf_exempt
def get_anual_production(request):
    if request.method == "GET":
        year = request.GET.get("year")
        if not year:
            return JsonResponse(
                {"error": "Se requiere el parámetro 'year'."}, status=400
            )
        try:
            monthly_goals = Presses_monthly_goals.objects.filter(year=year)
            goals_dict = {goal.month: goal.target_amount for goal in monthly_goals}

            production_data = (
                ProductionPress.objects.filter(date_time__year=year)
                .values("date_time__month")
                .annotate(pieces_ok=Sum("pieces_ok"))
                .order_by("date_time__month")
            )

            response_data = []
            for month in range(1, 13):
                response_data.append(
                    {
                        "month": month,
                        "Goal": goals_dict.get(month, 0),
                        "Producción": next(
                            (
                                p["pieces_ok"]
                                for p in production_data
                                if p["date_time__month"] == month
                            ),
                            0,
                        ),
                    }
                )

            return JsonResponse(response_data, safe=False)

        except ValueError:
            return JsonResponse(
                {"error": "El parámetro 'year' debe ser un número entero."}, status=400
            )
