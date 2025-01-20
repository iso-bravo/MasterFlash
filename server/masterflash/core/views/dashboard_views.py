from datetime import datetime
from django.http import JsonResponse
from ..models import (
    LinePress,
    Presses_monthly_goals,
    ProductionPress,
    Qc_Scrap,
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

        result = LinePress.objects.annotate(
            pause_count=Count(
                "StatePress",
                filter=Q(StatePress__state="Pause")
                & Q(StatePress__date__year=year)
                & Q(StatePress__date__month=month),
            ),
            failure_count=Count(
                "StatePress",
                filter=Q(StatePress__state="Failure")
                & Q(StatePress__date__year=year)
                & Q(StatePress__date__month=month),
            ),
        ).values("name", "pause_count", "failure_count")

        data = list(result)

        return JsonResponse(data, safe=False)

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

        data = []
        for result in results:
            cleaned_result = {k: v for k, v in result.items() if v is not None}
            data.append(cleaned_result)

        return JsonResponse(data, safe=False)

    return JsonResponse({"error": "Only GET method is allowed."}, status=405)
