import json
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.http import HttpResponse, JsonResponse

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from masterflash.core.models import Qc_Scrap, RubberQueryhistory
import io

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
            "total_rubber_weight_lbs",
            "total_inserts_weight_lbs",
            "inserts_total",
        )

    elif report == "Gripper":
        # Aquí agregas la lógica para Grippers si es necesario
        pass
    elif report == "0.025":
        filters["caliber"] = report

        print(filters)
        # Omitir registros residenciales si el reporte es 0.025
        data = (
            Qc_Scrap.objects.filter(**filters)
            .exclude(insert__startswith="RS")
            .values(
                "compound",
                "total_rubber_weight_in_insert_lbs",
                "total_rubber_weight_in_insert",
                "total_rubber_weight_lbs",
                "total_inserts_weight_lbs",
                "inserts_total",
            )
        )

    else:
        filters["caliber"] = report
        if insert:
            filters["insert"] = insert

        print(filters)
        data = Qc_Scrap.objects.filter(**filters).values(
            "compound",
            "total_rubber_weight_in_insert_lbs",
            "total_rubber_weight_in_insert",
            "total_rubber_weight_lbs",
            "total_inserts_weight_lbs",
            "inserts_total",
        )

    if isinstance(data, dict) or not data:
        print(
            f"Error: No se encontraron registros o el formato de `data` no es correcto. Datos: {data}"
        )
        return HttpResponse(
            "Error: No se encontraron registros o el formato de `data` no es correcto.",
            status=400,
        )

    print("Registros filtrados:", data)

    try:
        total_rubber_weight_in_insert_lbs_sum = sum(
            item["total_rubber_weight_in_insert_lbs"] for item in data
        )

        inserts_total_sum = sum(
            item["inserts_total"] if item["inserts_total"] is not None else 0
            for item in data
        )

        total_inserts_weight_lbs = sum(
            item["total_inserts_weight_lbs"] for item in data
        )

        total_sum = total_rubber_weight_in_insert_lbs_sum + total_inserts_weight_lbs

        grouped_data = {
            field["compound"]: [
                sum(
                    d["total_rubber_weight_in_insert"]
                    for d in data
                    if d["compound"] == field["compound"]
                ),
                sum(
                    d["total_rubber_weight_in_insert_lbs"]
                    for d in data
                    if d["compound"] == field["compound"]
                ),
            ]
            for field in data
        }

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
            total_rubber_weight_in_insert, total_rubber_weight_in_insert_lbs = values
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
            f"Hule/Sil lbs: {total_rubber_weight_in_insert_lbs_sum:.2f}",
            f"Total de insertos: {inserts_total_sum:.2f}",
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


@csrf_exempt
@require_POST
def generate_rubber_report(request):
    try:
        data = json.loads(request.body.decode("utf-8"))
        print(f"se recibio esto {data}")

        compounds_data = data
        start_date = data[0].get(
            "startDate"
        )  # Usa la primera entrada para las fechas si son iguales para todos
        end_date = data[0].get("endDate")

        # Lista de compuestos especiales
        special_compounds = ["MF E BLK 70", "MF E BLK", "MF E GRY", "MF E DGRY 4606"]

        # Filtrar los compuestos especiales y normales
        all_compounds = [item["compound"] for item in compounds_data]
        special_compound_selected = [c for c in all_compounds if c in special_compounds]
        normal_compounds = [c for c in all_compounds if c not in special_compounds]

        # Guardar en el historial cada compuesto por separado
        for compound in compounds_data:
            RubberQueryhistory.objects.create(
                start_date=start_date, end_date=end_date, compound=compound
            )

        # Función auxiliar para generar reportes
        def create_report(selected_compounds, report_name):
            filters = {
                "date_time__date__range": [start_date, end_date],
                "compound__in": selected_compounds,
            }
            data = Qc_Scrap.objects.filter(**filters).values(
                "compound", "total_bodies_weight_lbs"
            )

            if not data.exists():
                return None, f"Error: No se encontraron registros para {report_name}."

            # Agrupar y sumar pesos por compound
            grouped_data = {}
            total_weight = 0
            for item in data:
                compound = item["compound"]
                weight = item["total_bodies_weight_lbs"]
                grouped_data[compound] = grouped_data.get(compound, 0) + weight
                total_weight += weight

            # Crear PDF
            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            elements = []
            styles = getSampleStyleSheet()

            title = Paragraph(f"Reporte de Mermas: {report_name}", styles["Heading1"])
            elements.append(title)
            elements.append(Spacer(1, 12))

            data_table = [["Compound", "Lbs"]]
            for compound, weight in grouped_data.items():
                data_table.append(
                    [
                        Paragraph(compound, styles["Normal"]),
                        Paragraph(f"{weight:.2f}", styles["Normal"]),
                    ]
                )

            table = Table(data_table, colWidths=[200, 100])
            table.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                        ("GRID", (0, 0), (-1, -1), 1, colors.black),
                    ]
                )
            )
            elements.append(table)
            elements.append(
                Paragraph(f"Total Weight: {total_weight:.2f} Lbs", styles["Normal"])
            )

            doc.build(elements)
            buffer.seek(0)
            return buffer, None

        # Generar el primer reporte (compuestos normales)
        normal_buffer, normal_error = create_report(normal_compounds, "Reporte General")
        if normal_compounds:
            normal_buffer, normal_error = create_report(
                normal_compounds, "Reporte General"
            )
            if normal_error:
                return HttpResponse(normal_error, status=400)

            # Generar el segundo reporte (compuestos especiales)
            normal_buffer, normal_error = create_report(
                normal_compounds, "Reporte General"
            )
            if normal_error:
                return HttpResponse(normal_error, status=400)

            # Generar el segundo reporte (compuestos especiales)
            special_buffer, special_error = create_report(
                special_compound_selected, "Reporte Especial"
            )
            if special_error:
                return HttpResponse(special_error, status=400)

            # Preparar la respuesta
            if normal_compounds and special_compound_selected:
                # Combinar ambos reportes en un ZIP o alguna forma de descarga múltiple
                response = HttpResponse(
                    "Multiple report generation logic to be implemented",
                    content_type="text/plain",
                )
            elif normal_compounds:
                response = HttpResponse(normal_buffer, content_type="application/pdf")
                response["Content-Disposition"] = "inline; filename=reporte_general.pdf"
            elif special_compound_selected:
                response = HttpResponse(special_buffer, content_type="application/pdf")
                response["Content-Disposition"] = (
                    "inline; filename=reporte_especial.pdf"
                )

            return response

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        print(f"Error al generar el reporte: {e}")
        return JsonResponse({"error": str(e)}, status=500)
