from datetime import datetime
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.utils.dateparse import parse_datetime
from django.views.decorators.http import require_POST
from django.db.models import Sum, F, Value, IntegerField
from django.db.models.functions import Coalesce
import json
from masterflash.core.models import Qc_Scrap

DEFECT_CODES = [
    "B",
    "CC",
    "CD",
    "CH",
    "CM",
    "CMB",
    "CR",
    "CROP",
    "CS",
    "D",
    "DI",
    "DP",
    "F",
    "FC",
    "FPM",
    "FPO",
    "GA",
    "GM",
    "H",
    "_ID",
    "IM",
    "IMC",
    "IP",
    "IR",
    "M",
    "MR",
    "O",
    "PD",
    "PR",
    "Q",
    "R",
    "RC",
    "RPM",
    "SG",
    "SI",
    "SL",
    "SR",
]


@csrf_exempt
@require_POST
def get_scrap_by_date_range(request):
    try:
        data = json.loads(request.body)
        start_date = parse_datetime(data.get("start_date"))
        end_date = parse_datetime(data.get("end_date"))

        if not start_date or not end_date:
            return JsonResponse(
                {"error": "start_date and end_date are required"}, status=400
            )

        scrap_queryset = Qc_Scrap.objects.filter(
            date_time__range=(start_date, end_date)
        )

        response_data = []

        for scrap in scrap_queryset:
            defect_data = {code: getattr(scrap, code, None) for code in DEFECT_CODES}

            entry = {
                "date_time": scrap.date_time.isoformat(),
                "line": scrap.line,
                "molder_number": scrap.molder_number,
                "part_number": scrap.part_number,
                "caliber": scrap.caliber,
                "total_pieces": scrap.total_pieces,
                "defects": defect_data,
            }

            response_data.append(entry)

        return JsonResponse(response_data, safe=False)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


def get_defect_ranking(group_by_field: str, start_date: datetime, end_date: datetime):
    annotations = {code: Coalesce(Sum(code), Value(0)) for code in DEFECT_CODES}

    # Defects total sum as sum of each field
    annotations["total_defects"] = Coalesce(
        sum([Coalesce(Sum(code), Value(0)) for code in DEFECT_CODES]), Value(0)
    )

    query_set = (
        Qc_Scrap.objects.filter(date_time__range=(start_date, end_date))
        .values(group_by_field)
        .annotate(**annotations)
        .order_by("-total_defects")
    )

    return list(query_set)


@csrf_exempt
@require_POST
def top_defects_by_mp(request):
    try:
        data = json.loads(request.body)
        start_date = parse_datetime(data.get("start_date"))
        end_date = parse_datetime(data.get("end_date"))

        if not start_date or not end_date:
            return JsonResponse(
                {"error": "start_date and end_date are required"}, status=400
            )

        # Get the top defects by molder number
        top_defects = get_defect_ranking("line", start_date, end_date)

        return JsonResponse(top_defects, safe=False)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_POST
def top_defects_by_part_number(request):
    try:
        data = json.loads(request.body)
        start_date = parse_datetime(data.get("start_date"))
        end_date = parse_datetime(data.get("end_date"))

        if not start_date or not end_date:
            return JsonResponse(
                {"error": "start_date and end_date are required"}, status=400
            )

        # Get the top defects by part number
        top_defects = get_defect_ranking("part_number", start_date, end_date)

        return JsonResponse(top_defects, safe=False)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_POST
def top_defects_by_molder_number(request):
    try:
        data = json.loads(request.body)
        start_date = parse_datetime(data.get("start_date"))
        end_date = parse_datetime(data.get("end_date"))

        if not start_date or not end_date:
            return JsonResponse(
                {"error": "start_date and end_date are required"}, status=400
            )

        # Get the top defects by molder number
        top_defects = get_defect_ranking("molder_number", start_date, end_date)

        return JsonResponse(top_defects, safe=False)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
