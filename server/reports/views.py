from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.http import HttpResponse
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from masterflash.core.models import Qc_Scrap
import io

# Create your views here.

@csrf_exempt
@require_POST
def generate_report(request):
    data = request.POST.dict()
    print(data)
    date = data.get('date')
    caliber = data.get('caliber')
    insert = data.get('insert') if caliber == '0.040' else None

    filters = {
        'date_time__date': date,
        'caliber':caliber
    }
    if insert:
        filters['insert'] = insert
    
    data = Qc_Scrap.objects.filter(**filters).values('compound','total_rubber_weight_in_insert_lbs','total_rubber_weight_in_insert','total_rubber_weight_lbs','total_inserts_weight_lbs','inserts_total')
    print(data)


    #total de hule
    total_rubber_weight_in_inserts_sum = sum(item['total_rubber_weight_in_insert'] for item in data)

    # Hule/Sil Lbs
    total_rubber_weight_in_insert_lbs_sum = sum(item['total_rubber_weight_in_insert_lbs'] for item in data)

    inserts_total_sum = sum(item['inserts_total'] for item in data)

    # suma total
    total_sum = total_rubber_weight_in_insert_lbs_sum + inserts_total_sum


    # Crear el PDF
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    elements = []

    styles = getSampleStyleSheet()
    title_style = styles['Heading1']
    normal_style = styles['Normal']

    # Título del reporte
    title = Paragraph(f"Reporte para la fecha: {date} y calibre: {caliber}", title_style)
    elements.append(title)
    elements.append(Paragraph(" ", normal_style))  

    # Crear la tabla de datos
    data_table = [["Compound", "Total", "Lbs", "Aluminio lbs"]]
    for item in data:
        data_table.append([
            item['compound'],
            f"{item['total_rubber_weight_in_insert']:.2f}",
            f"{item['total_rubber_weight_in_insert_lbs']:.2f}",
            f"{item['total_inserts_weight_lbs']:.2f}"
        ])

    table = Table(data_table)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    elements.append(table)
    elements.append(Paragraph(" ", normal_style))  

    # Añadir los totales
    totals = [
        f"Hule/Sil lbs: {total_rubber_weight_in_insert_lbs_sum:.2f}",
        f"Total de insertos: {inserts_total_sum:.2f}",
        f"Total de hule: {total_rubber_weight_in_inserts_sum:.2f}",
        f"Suma Total: {total_sum:.2f}"
    ]
    for total in totals:
        elements.append(Paragraph(total, normal_style))

    doc.build(elements)

    buffer.seek(0)
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f"inline; filename=reporte_scrap_{date}.pdf"
    return response

