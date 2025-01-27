import json
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.http import HttpResponse, JsonResponse

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import (
    SimpleDocTemplate,
    Table,
    TableStyle,
    Paragraph,
    Spacer,
)
from masterflash.core.models import Insert_Query_history, Qc_Scrap, Rubber_Query_history
from django.db.models import Q
import base64
import io
import datetime

# Create your views here.


@csrf_exempt
@require_POST
def generate_inserts_report(request):
    data = request.POST.dict()
    print(data)
    start_date = data.get("start_date")
    end_date = data.get("end_date")
    report = data.get("report")
    insert = data.get("insert") if report == "0.040" else None

    filters = {"date_time__date__range": [start_date, end_date]}

    if report == "Residencial":
        filters["caliber"] = "0.025"
        filters["insert__startswith"] = "RS"

        data = Qc_Scrap.objects.filter(**filters).values(
            "compound",
            "total_rubber_weight_in_insert_lbs",
            "total_rubber_weight_in_insert",
            "chemlok_x_insert_w_rubber",
            "total_rubber_weight_lbs",
            "total_inserts_weight_lbs",
            "inserts_total",
        )

    elif report == "0.025":
        filters["caliber"] = report

        # Omitir registros residenciales si el reporte es 0.025
        data = (
            Qc_Scrap.objects.filter(**filters)
            .exclude(insert__startswith="RS")
            .values(
                "compound",
                "total_rubber_weight_in_insert_lbs",
                "total_rubber_weight_in_insert",
                "chemlok_x_insert_w_rubber",
                "total_rubber_weight_lbs",
                "total_inserts_weight_lbs",
                "inserts_total",
            )
        )

    else:
        filters["caliber"] = report
        if insert:
            filters["insert"] = insert

        data = Qc_Scrap.objects.filter(**filters).values(
            "compound",
            "total_rubber_weight_in_insert_lbs",
            "total_rubber_weight_in_insert",
            "chemlok_x_insert_w_rubber",
            "total_rubber_weight_lbs",
            "total_inserts_weight_lbs",
            "inserts_total",
        )

    if not data:
        return HttpResponse("Error: No se encontraron registros", status=400)

    try:
        total_rubber_weight_in_insert_lbs_sum = sum(
            item["total_rubber_weight_in_insert_lbs"] for item in data
        )

        inserts_total_sum = sum(
            item["inserts_total"] if item["inserts_total"] is not None else 0
            for item in data
        )

        chemlok_sum = sum(
            item["chemlok_x_insert_w_rubber"]
            if item["chemlok_x_insert_w_rubber"] is not None
            else 0
            for item in data
        )

        total_inserts_weight_lbs = sum(
            item["total_inserts_weight_lbs"] for item in data
        )

        total_sum = total_rubber_weight_in_insert_lbs_sum + total_inserts_weight_lbs

        data = list(data)
        print("data in list: ", data)

        grouped_data = {}
        for field in data:
            compound = field["compound"]
            if compound not in grouped_data:
                grouped_data[compound] = [0, 0]

            grouped_data[compound][0] += field["total_rubber_weight_in_insert"]
            grouped_data[compound][1] += field["total_rubber_weight_in_insert_lbs"]

        print("Grouped data: ", grouped_data)

        Insert_Query_history.objects.create(
            query_date=datetime.datetime.now(),
            start_date=start_date,
            end_date=end_date,
            insert=report,
            total_insert=inserts_total_sum,
            total_chemlok=chemlok_sum,
            total_rubber=total_rubber_weight_in_insert_lbs_sum,
            total_metal=total_inserts_weight_lbs,
            total_sum=total_sum,
        )

        # Crear el PDF
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []

        styles = getSampleStyleSheet()
        title_style = styles["Heading1"]
        normal_style = styles["Normal"]

        # Título del reporte
        title = Paragraph(
            f"Reporte desde: {start_date} hasta: {end_date} para reporte: {report}",
            title_style,
        )
        elements.append(title)
        elements.append(Paragraph(" ", normal_style))

        # Crear la tabla de datos
        data_table = [["Compound", "Total", "Lbs"]]
        for compound, values in grouped_data.items():
            total_rubber_weight_in_insert = values[0]
            total_rubber_weight_in_insert_lbs = values[1]
            data_table.append(
                [
                    compound,
                    f"{total_rubber_weight_in_insert:.2f}",
                    f"{total_rubber_weight_in_insert_lbs:.2f}",
                ]
            )

        table = Table(data_table)
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                    ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
                    ("GRID", (0, 0), (-1, -1), 1, colors.black),
                ]
            )
        )
        elements.append(table)
        elements.append(Paragraph(" ", normal_style))

        # Añadir los totales
        totals = [
            f"Total de insertos: {inserts_total_sum:.2f}",
            f"Total Chemlok: {chemlok_sum:.2f}",
            f"Hule/Sil lbs: {total_rubber_weight_in_insert_lbs_sum:.2f}",
            f"Metal lbs: {total_inserts_weight_lbs:.2f}",
            f"Suma Total: {total_sum:.2f}",
        ]
        for total in totals:
            elements.append(Paragraph(total, normal_style))

        doc.build(elements)

        buffer.seek(0)
        response = HttpResponse(buffer, content_type="application/pdf")
        response["Content-Disposition"] = (
            f"inline; filename=reporte_scrap_{start_date}_a_{end_date}.pdf"
        )
        return response
    except Exception as e:
        print(
            f"Error al generar el reporte de fecha desde {start_date} hasta {end_date} con reporte {report}, Excepción: {e}"
        )
        return HttpResponse(
            "Error interno del servidor al generar el reporte", status=500
        )


@csrf_exempt
@require_POST
def generate_rubber_report(request):
    try:
        # Procesar los datos recibidos
        compounds_data = json.loads(request.body.decode("utf-8"))
        print(f"Datos recibidos: {compounds_data}")

        # Guardar en el historial cada compuesto con sus propias fechas y comentarios
        for compound in compounds_data:
            Rubber_Query_history.objects.create(
                query_date=datetime.datetime.now(),
                start_date=compound["startDate"],
                end_date=compound["endDate"],
                compound=compound["compound"],
                total_weight=compound["totalWeight"],
                comments=compound.get("comments", ""),
            )

        def create_report(selected_compounds_data, report_name):
            print(f"Creando reporte para: {report_name}")
            filters = Q()
            for item in selected_compounds_data:
                filters |= Q(
                    compound=item["compound"],
                    date_time__date__range=[item["startDate"], item["endDate"]],
                )

            data = Qc_Scrap.objects.filter(filters).values(
                "compound", "total_bodies_weight_lbs"
            )
            if not data.exists():
                return None, f"Error: No se encontraron registros para {report_name}."

            # Agrupar datos
            grouped_data, total_weight = {}, 0
            for item in selected_compounds_data:
                compound = item["compound"]
                weight = sum(
                    d["total_bodies_weight_lbs"]
                    for d in data
                    if d["compound"] == compound
                )
                grouped_data[compound] = {
                    "weight": weight,
                    "start_date": item["startDate"],
                    "end_date": item["endDate"],
                    "comments": item.get("comments", ""),
                }
                total_weight += weight

            # Generar el PDF
            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            elements, styles = [], getSampleStyleSheet()

            date = datetime.datetime.now().strftime("%x")
            elements.append(
                Paragraph(
                    f"{date} - Reporte de Mermas: {report_name}", styles["Heading1"]
                )
            )
            elements.append(Spacer(1, 12))

            data_table = [
                ["Fecha Inicio", "Fecha Fin", "Compuesto", "Lbs", "Comentarios"]
            ]
            for compound, info in grouped_data.items():
                data_table.append(
                    [
                        Paragraph(info["start_date"], styles["Normal"]),
                        Paragraph(info["end_date"], styles["Normal"]),
                        Paragraph(compound, styles["Normal"]),
                        Paragraph(f"{info['weight']:.2f}", styles["Normal"]),
                        Paragraph(info["comments"], styles["Normal"]),
                    ]
                )

            table = Table(data_table, colWidths=[80, 80, 140, 80, 120])
            table.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                        ("GRID", (0, 0), (-1, -1), 1, colors.black),
                    ]
                )
            )
            elements.extend(
                [
                    table,
                    Spacer(1, 12),
                    Paragraph(
                        f"Total Weight: {total_weight:.2f} Lbs", styles["Normal"]
                    ),
                ]
            )

            doc.build(elements)
            buffer.seek(0)
            return buffer, None

        normal_buffer, normal_error = create_report(compounds_data, "Reporte General")
        if normal_buffer:
            normal_base64 = base64.b64encode(normal_buffer.getvalue()).decode("utf-8")
            return JsonResponse(
                {"pdfs": [{"name": "reporte_general.pdf", "data": normal_base64}]}
            )

        return JsonResponse({"error": "No se generaron reportes."}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        print(f"Excepción: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)
