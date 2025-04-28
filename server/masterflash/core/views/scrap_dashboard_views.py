import json
from datetime import datetime
from collections import OrderedDict

from django.db.models import Sum, Value, F, IntegerField, ExpressionWrapper
from django.db.models.functions import Coalesce
from django.http import JsonResponse
from django.utils.dateparse import parse_datetime
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

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

        # accumlators
        total_defects_accumulator = {code: 0 for code in DEFECT_CODES}
        total_pieces_accumulator = 0

        for scrap in scrap_queryset:
            defect_data = {code: getattr(scrap, code, None) for code in DEFECT_CODES}

            for code, value in defect_data.items():
                total_defects_accumulator[code] += 0 if value is None else value

            total_pieces_accumulator += scrap.total_pieces or 0

            entry = {
                "date_time": scrap.date_time.strftime("%Y-%m-%d"),
                "line": scrap.line,
                "molder_number": scrap.molder_number,
                "part_number": scrap.part_number,
                "caliber": scrap.caliber,
                "total_pieces": scrap.total_pieces,
                "defects": defect_data,
            }

            response_data.append(entry)

        # Total line

        total_entry = {
            "date_time": "TOTAL",
            "line": "",
            "molder_number": "",
            "part_number": "",
            "caliber": "",
            "total_pieces": total_pieces_accumulator,
            "defects": total_defects_accumulator,
        }

        response_data.append(total_entry)

        return JsonResponse(response_data, safe=False)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


def get_defect_ranking(
    group_by_field: str, start_date: datetime, end_date: datetime, top_n: int
):
    # Anotar cada código individual
    annotations = {
        code: Coalesce(Sum(code, output_field=IntegerField()), Value(0))
        for code in DEFECT_CODES
    }

    total_defects_expr = ExpressionWrapper(
        sum(F(code) for code in DEFECT_CODES), output_field=IntegerField()
    )

    annotations["total_defects"] = Coalesce(total_defects_expr, Value(0))

    query_set = (
        Qc_Scrap.objects.filter(date_time__range=(start_date, end_date))
        .values(group_by_field)
        .annotate(**annotations)
        .order_by("-total_defects")[:top_n]  # << cortamos aquí
    )

    result = []
    for item in query_set:
        filtered_item = OrderedDict()
        filtered_item[group_by_field] = item[group_by_field]
        filtered_item["total_defects"] = item["total_defects"]

        for code in DEFECT_CODES:
            if item[code] > 0:
                filtered_item[code] = item[code]

        result.append(filtered_item)

    return result


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

        top_defects = get_defect_ranking("line", start_date, end_date, top_n=15)

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

        top_defects = get_defect_ranking("part_number", start_date, end_date, top_n=10)

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

        top_defects = get_defect_ranking(
            "molder_number", start_date, end_date, top_n=20
        )

        return JsonResponse(top_defects, safe=False)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
