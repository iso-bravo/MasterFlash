from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.http import HttpResponse
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
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
    
    data = Qc_Scrap.objects.filter(**filters).values('date_time','compound','total_rubber_weight_in_insert','total_rubber_weight_lbs','total_inserts_weight_lbs')
    print(data)

    total_rubber_weight_lbs_sum = sum(item['total_rubber_weight_lbs'] for item in data)

    buffer = io.BytesIO()
    p = canvas.Canvas(buffer,pagesize=letter)
    width,height = letter

    p.drawString(100, height - 100, f"Reporte para la fecha: {date} y calibre: {caliber}")
    y = height - 150

    for item in data:
        p.drawString(100,y,f"Fecha: {item['date_time'].strftime('%Y-%m-%d %H:%M:%S')}, compound: {item['compound']} ")
        p.drawString(100,y - 15, f"Total: {item['total_rubber_weight_in_insert']}, Lbs: {item['total_rubber_weight_lbs']}, Aluminio: {item['total_inserts_weight_lbs']}")
        y -= 45
        if y < 50:
            p.showPage()
            y = height - 50

    p.drawString(100,y - 45,f"Suma Total: {total_rubber_weight_lbs_sum}")

    p.save()

    buffer.seek(0)
    response = HttpResponse(buffer,content_type = 'application/pdf')
    response['Content-Disposition'] = f"inline; filename= reporte scrap - {date}"
    return response

