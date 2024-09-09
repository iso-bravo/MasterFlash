from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.http import HttpResponse

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from masterflash.core.models import Qc_Scrap
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
    data = request.POST.dict()
    print(data)
    start_date = data.get("start_date")
    end_date = data.get("end_date")
    compound = data.get("compound")

    filters = {"date_time__date__range": [start_date, end_date]}

    if compound != "general":
        filters["compound"] = compound

        data = Qc_Scrap.objects.filter(**filters).values(
            "compound",
            "total_bodies_weight_lbs",
        )
    else:
        exclude_compounds = ["MF E BLK 70", "MF E BLK", "MF E GRY", "MF E DGRY 4606"]
        data = (
            Qc_Scrap.objects.filter(**filters)
            .exclude(compound__in=exclude_compounds)
            .values(
                "compound",
                "total_bodies_weight_lbs",
            )
        )

    if not data.exists():
        print(f"Error: No se encontraron registros. Datos: {data}")
        return HttpResponse("Error: No se encontraron registros.", status=400)

    print("Registros filtrados:", data)

    try:
        # Agrupar y sumar los pesos por compound
        grouped_data = {}
        total_weight = 0

        for item in data:
            compound = item["compound"]
            weight = item["total_bodies_weight_lbs"]
            if compound in grouped_data:
                grouped_data[compound] += weight
            else:
                grouped_data[compound] = weight
            total_weight += weight

        # Crear el PDF
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []

        styles = getSampleStyleSheet()
        title_style = styles["Heading1"]
        title_style.fontSize = 20
        title_style.alignment = 1

        subtitle_style = styles["Heading2"]
        subtitle_style.fontSize = 16
        subtitle_style.alignment = 1

        normal_style = styles["Normal"]
        normal_style.fontSize = 12

        # Título del reporte
        title = Paragraph("Reporte de mermas", title_style)
        elements.append(title)
        elements.append(
            Paragraph(
                f"Fecha: {start_date} a {end_date} - Compuesto: {compound}",
                subtitle_style,
            )
        )
        elements.append(Spacer(1, 12))

        # Crear la tabla de datos
        data_table = [["Compound", "Lbs"]]
        for compound, weight in grouped_data.items():
            data_table.append(
                [
                    Paragraph(compound, normal_style),
                    Paragraph(f"{weight:.2f}", normal_style),
                ]
            )

        column_widths = [200, 100]  # Puedes ajustar estos valores según tus necesidades

        table = Table(data_table, colWidths=column_widths)
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                    ("ALIGN", (0, 0), (-1, -1), "LEFT"),  # Alinear tabla a la izquierda
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                    ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
                    ("GRID", (0, 0), (-1, -1), 1, colors.black),
                    (
                        "LEFTPADDING",
                        (0, 0),
                        (-1, -1),
                        10,
                    ),  # Añadir padding a la izquierda
                ]
            )
        )
        elements.append(table)
        elements.append(Spacer(1, 12))

        # Añadir los totales
        elements.append(Paragraph(f"Suma Total: {total_weight:.2f} Lbs", normal_style))

        doc.build(elements)

        buffer.seek(0)
        response = HttpResponse(buffer, content_type="application/pdf")
        response["Content-Disposition"] = (
            f"inline; filename=reporte_merma_{start_date}_a_{end_date}.pdf"
        )
        return response
    except Exception as e:
        print(
            f"Error al generar el reporte desde: {start_date} hasta: {end_date} durante el {compound}º turno, Excepción: {e}"
        )
