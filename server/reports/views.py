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
    PageBreak,
)
from masterflash.core.models import Qc_Scrap, Rubber_Query_history
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
        # Decodificación del JSON y manejo de excepciones
        data = json.loads(request.body.decode("utf-8"))
        print(f"Datos recibidos: {data}")

        compounds_data = data
        special_compounds = ["MF E BLK 70", "MF E BLK", "MF E GRY", "MF E DGRY 4606"]

        # Guardar en el historial cada compuesto con sus propias fechas
        for compound in compounds_data:
            Rubber_Query_history.objects.create(
                query_date= datetime.datetime,
                start_date=compound["startDate"],
                end_date=compound["endDate"],
                compound=compound["compound"],
                total_weight=compound["totalWeight"],
            )

        def create_report(selected_compounds_data, report_name):
            print(f"Creando reporte para: {report_name}")
            filters = [
                Q(
                    compound=item["compound"],
                    date_time__date__range=[item["startDate"], item["endDate"]],
                )
                for item in selected_compounds_data
            ]

            # Combinación de filtros
            if len(filters) > 1:
                combined_filter = filters[0]
                for f in filters[1:]:
                    combined_filter |= f
            elif filters:
                combined_filter = filters[0]
            else:
                return None, f"Error: No se encontraron registros para {report_name}."

            data = Qc_Scrap.objects.filter(combined_filter).values(
                "compound", "total_bodies_weight_lbs"
            )

            if not data.exists():
                return None, f"Error: No se encontraron registros para {report_name}."

            grouped_data = {}
            total_weight = 0
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
                }
                total_weight += weight

            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            elements = []
            styles = getSampleStyleSheet()

            full_date = datetime.datetime.now()
            date = full_date.strftime("%x")

            title = Paragraph(
                f"{date} - Reporte de Mermas: {report_name}", styles["Heading1"]
            )
            elements.append(title)
            elements.append(Spacer(1, 12))

            data_table = [["Fecha Inicio", "Fecha Fin", "Compuesto", "Lbs"]]
            for compound, info in grouped_data.items():
                data_table.append(
                    [
                        Paragraph(info["start_date"], styles["Normal"]),
                        Paragraph(info["end_date"], styles["Normal"]),
                        Paragraph(compound, styles["Normal"]),
                        Paragraph(f"{info['weight']:.2f}", styles["Normal"]),
                    ]
                )

            table = Table(data_table, colWidths=[100, 100, 200, 100])
            table.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                        ("GRID", (0, 0), (-1, -1), 1, colors.black),
                    ]
                )
            )
            elements.append(table)
            elements.append(Spacer(1, 12))
            elements.append(
                Paragraph(f"Total Weight: {total_weight:.2f} Lbs", styles["Normal"])
            )

            doc.build(elements)
            buffer.seek(0)
            return buffer, None

        def create_report_for_special_compounds(compounds_data):
            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            elements = []
            styles = getSampleStyleSheet()

            full_date = datetime.datetime.now()
            date = full_date.strftime("%x")

            title = Paragraph(
                "Reporte de Compuestos Especiales", styles["Heading1"]
            )
            elements.append(title)
            elements.append(Spacer(1, 12))

            for compound_data in compounds_data:
                # Título de la sección para cada compuesto
                elements.append(
                    Paragraph(
                        f"{date} - Compuesto: {compound_data['compound']}", styles["Heading2"]
                    )
                )

                # Datos del compuesto
                data_table = [["Fecha Inicio", "Fecha Fin", "Compuesto", "Lbs"]]
                data_table.append(
                    [
                        Paragraph(compound_data["startDate"], styles["Normal"]),
                        Paragraph(compound_data["endDate"], styles["Normal"]),
                        Paragraph(compound_data["compound"], styles["Normal"]),
                        Paragraph(
                            f"{compound_data['totalWeight']:.2f}", styles["Normal"]
                        ),
                    ]
                )
                table = Table(data_table, colWidths=[100, 100, 200, 100])
                table.setStyle(
                    TableStyle(
                        [
                            ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                            ("GRID", (0, 0), (-1, -1), 1, colors.black),
                        ]
                    )
                )
                elements.append(table)

                # Agregar un salto de página
                elements.append(Spacer(1,16))

            doc.build(elements)
            buffer.seek(0)
            return buffer

        normal_buffer, normal_error = create_report(
            [
                comp
                for comp in compounds_data
                if comp["compound"] not in special_compounds
            ],
            "Reporte General",
        )
        special_buffer = create_report_for_special_compounds(
            [comp for comp in compounds_data if comp["compound"] in special_compounds],
        )

        print(f"Error Reporte General: {normal_error}")

        pdfs = []
        if normal_buffer:
            normal_base64 = base64.b64encode(normal_buffer.getvalue()).decode("utf-8")
            pdfs.append({"name": "reporte_general.pdf", "data": normal_base64})
        if special_buffer:
            special_base64 = base64.b64encode(special_buffer.getvalue()).decode("utf-8")
            pdfs.append({"name": "reporte_especial.pdf", "data": special_base64})

        if pdfs:
            return JsonResponse({"pdfs": pdfs})

        # Si no hay PDFs generados, retornar un error general
        return JsonResponse({"error": "No se generaron reportes."}, status=400)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        print(f"Excepción: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)
