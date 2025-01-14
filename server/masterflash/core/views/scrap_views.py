from datetime import datetime, timedelta
import json
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from ..models import (
    Insert_Query_history,
    LinePress,
    Part_Number,
    Insert,
    Qc_Scrap,
    Rubber_Query_history,
)
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST


def load_scrap_data(request):
    machines_query = LinePress.objects.filter(status="Available").values_list(
        "name", flat=True
    )
    machines = list(machines_query)

    return JsonResponse(machines, safe=False)


def search_in_part_number(request):
    data = request.GET.dict()
    part_number = data.get("part_number")
    print(f"Searching for part number: {part_number}")

    if not part_number:
        return JsonResponse({"error": "part_number is required"}, status=400)

    part_record = get_object_or_404(Part_Number, part_number=part_number)

    rubber_compound = getattr(part_record, "rubber_compound", None)
    insert = getattr(part_record, "insert", None)
    caliber = getattr(part_record, "caliber", None)
    gripper = getattr(part_record, "gripper", None)

    if insert is not None and caliber is not None:
        try:
            insert_record = Insert.objects.get(insert=insert, caliber=caliber)
            weight = getattr(insert_record, "weight", None)
        except Insert.DoesNotExist:
            print("Insert record not found")
            weight = None
    else:
        weight = None

    data = {
        "Compuesto": rubber_compound,
        "Inserto": insert,
        "Gripper": gripper,
        "Metal": caliber,
        "Ito. s/hule": weight,
    }

    return JsonResponse(data, safe=False)


def search_weight(request):
    data = request.GET.dict()
    metal = data.get("metal")
    insert = data.get("inserto")
    gripper = data.get("gripper")

    print(metal, insert, gripper)

    if not metal or not insert:
        return JsonResponse({"error": "metal and insert are required"}, status=400)

    insert_record = get_object_or_404(Insert, insert=insert, caliber=metal)
    weight = getattr(insert_record, "weight", None)
    chemlok = getattr(insert_record, "chemlok")

    response_data = {
        "Ito. s/hule": weight,
    }

    if chemlok:
        chemlok_record = get_object_or_404(Insert, chemlok=chemlok)
        chemlok_weight = getattr(chemlok_record, "weight", None)
        response_data["Chemlok"] = chemlok_weight

    if gripper:
        gripper_record = get_object_or_404(Insert, insert=gripper)
        gripper_weight = getattr(gripper_record, "weight", None)
        response_data["Gripper"] = gripper_weight

    print(response_data)

    return JsonResponse(response_data, safe=False)


@csrf_exempt
@require_POST
def register_scrap(request):
    try:
        print("entro")
        data = json.loads(request.body.decode("utf-8"))

        print(data)

        total_pieces = 0

        def empty_to_none(value):
            return None if value == "" else value

        def part_number_data(field, part_number):
            try:
                part = Part_Number.objects.get(part_number=part_number)
                print(part)
                return getattr(part, field, None)
            except Exception as e:
                print(f"Error in client_data view: {str(e)}")
                return JsonResponse({"error": str(e)}, status=500)

        def gr_to_lbs(gr):
            return gr * 0.00220462

        date = empty_to_none(data.get("date"))
        shift = empty_to_none(data.get("shift"))
        line = empty_to_none(data.get("line"))
        auditor = empty_to_none(data.get("auditor"))
        molder = empty_to_none(data.get("molder"))

        # Accediendo a los inputs como un diccionario
        inputs = data.get("inputs", {})
        codes = data.get("codes", {})

        part_number = empty_to_none(inputs.get("partNumber"))
        compound = empty_to_none(inputs.get("compound"))
        insert = empty_to_none(inputs.get("insert"))
        gripper = empty_to_none(inputs.get("gripper"))
        metal = empty_to_none(inputs.get("metal"))
        insert_without_rubber = empty_to_none(inputs.get("insertWithoutRubber"))
        gripper_without_rubber = empty_to_none(inputs.get("gripperWithoutRubber"))
        rubber_weight = empty_to_none(inputs.get("rubberWeight"))
        insert_with_rubber = empty_to_none(inputs.get("insertWithRubber"))
        gripper_with_rubber = empty_to_none(inputs.get("gripperWithRubber"))
        recycled_inserts = empty_to_none(inputs.get("recycledInserts"))
        total_inserts = empty_to_none(inputs.get("totalInserts"))
        total_grippers = empty_to_none(inputs.get("totalGrippers"))
        chemlok = empty_to_none(inputs.get("chemlok"))

        if insert_with_rubber and chemlok:
            chemlok_x_inserts = chemlok * int(insert_with_rubber)

        # Validación del partNumber
        if part_number is None:
            return JsonResponse({"message": "Part Number Required"}, status=400)

        current_time_str = datetime.now().strftime("%H:%M:%S.%f")

        if not date:
            date = datetime.now()
        else:
            date = f"{data.get('date')} {current_time_str}"

        scrap_entry = Qc_Scrap(
            date_time=date,
            shift=shift,
            line=line,
            auditor_qc=auditor,
            molder_number=molder,
            part_number=part_number,
            gripper=gripper,
            caliber=metal,
            rubber_weight=rubber_weight,
            insert_weight_w_rubber=insert_with_rubber,
            chemlok_x_insert_w_rubber=chemlok_x_inserts,
            gripper_weight_w_rubber=gripper_with_rubber,
            insert_weight_wout_rubber=insert_without_rubber,
            gripper_weight_wout_rubber=gripper_without_rubber,
            recycled_inserts=recycled_inserts,
            compound=compound,
            mold=part_number_data("mold", part_number),
            insert=insert,
            inserts_total=total_inserts,
            grippers_total=total_grippers,
        )

        # Procesando los códigos
        for code, value in codes.items():
            if value is None:
                setattr(scrap_entry, code, None)
            else:
                setattr(scrap_entry, code, int(value))
                total_pieces += int(value)

        print(total_pieces)

        # Cálculos de peso
        total_bodies_weight = int(rubber_weight) if rubber_weight else 0
        total_inserts_weight = (
            int(insert_without_rubber) * int(total_inserts)
            if insert_without_rubber and total_inserts
            else 0
        )

        total_grippers_weight = (
            float(gripper_without_rubber) * float(total_grippers)
            if gripper_without_rubber and total_grippers
            else 0
        )

        total_rubber_weight_in_insert = (
            int(insert_with_rubber) - total_inserts_weight if insert_with_rubber else 0
        )

        total_rubber_weight_in_gripper = (
            float(gripper_with_rubber) - total_grippers_weight
            if gripper_with_rubber
            else 0
        )

        total_rubber_weight = total_bodies_weight + total_rubber_weight_in_insert

        scrap_entry.total_pieces = total_pieces
        scrap_entry.total_bodies_weight = total_bodies_weight
        scrap_entry.total_inserts_weight = total_inserts_weight
        scrap_entry.total_rubber_weight_in_insert = total_rubber_weight_in_insert
        scrap_entry.total_rubber_weight_in_gripper = total_rubber_weight_in_gripper
        scrap_entry.total_rubber_weight = total_rubber_weight
        scrap_entry.total_bodies_weight_lbs = gr_to_lbs(total_bodies_weight)
        scrap_entry.total_inserts_weight_lbs = gr_to_lbs(total_inserts_weight)
        scrap_entry.total_grippers_weight = total_grippers_weight
        scrap_entry.total_grippers_weight_lbs = gr_to_lbs(total_grippers_weight)
        scrap_entry.total_rubber_weight_in_insert_lbs = gr_to_lbs(
            total_rubber_weight_in_insert
        )
        scrap_entry.total_rubber_weight_in_gripper_lbs = gr_to_lbs(
            total_rubber_weight_in_gripper
        )
        scrap_entry.total_rubber_weight_lbs = gr_to_lbs(total_rubber_weight)

        scrap_entry.save()

        return JsonResponse({"message": "Registro exitoso"}, status=200)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)


@csrf_exempt
@require_POST
def register_scrap_test(request):
    try:
        print("entro")
        data = json.loads(request.body.decode("utf-8"))

        total_pieces = 0

        def empty_to_none(value):
            return None if value == "" else value

        def gr_to_lbs(gr):
            return gr * 0.00220462

        # Extracción de datos
        date = empty_to_none(data.get("date"))
        shift = empty_to_none(data.get("shift"))
        line = empty_to_none(data.get("line"))
        auditor = empty_to_none(data.get("auditor"))
        molder = empty_to_none(data.get("molder"))

        inputs = data.get("inputs", {})
        codes = data.get("codes", {})

        part_number = empty_to_none(inputs.get("partNumber"))
        compound = empty_to_none(inputs.get("compound"))
        insert = empty_to_none(inputs.get("insert"))
        gripper = empty_to_none(inputs.get("gripper"))
        metal = empty_to_none(inputs.get("metal"))
        insert_without_rubber = empty_to_none(inputs.get("insertWithoutRubber"))
        gripper_without_rubber = empty_to_none(inputs.get("gripperWithoutRubber"))
        rubber_weight = empty_to_none(inputs.get("rubberWeight"))
        insert_with_rubber = empty_to_none(inputs.get("insertWithRubber"))
        gripper_with_rubber = empty_to_none(inputs.get("gripperWithRubber"))
        recycled_inserts = empty_to_none(inputs.get("recycledInserts"))
        total_inserts = empty_to_none(inputs.get("totalInserts"))
        total_grippers = empty_to_none(inputs.get("totalGrippers"))

        # Si no hay fecha, se establece la actual
        current_time_str = datetime.now().strftime("%H:%M:%S.%f")
        date = f"{data.get('date')} {current_time_str}" if date else datetime.now()

        scrap_entry = Qc_Scrap(
            date_time=date,
            shift=shift,
            line=line,
            auditor_qc=auditor,
            molder_number=molder,
            part_number=part_number,
            gripper=gripper,
            caliber=metal,
            rubber_weight=rubber_weight,
            insert_weight_w_rubber=insert_with_rubber,
            gripper_weight_w_rubber=gripper_with_rubber,
            insert_weight_wout_rubber=insert_without_rubber,
            gripper_weight_wout_rubber=gripper_without_rubber,
            recycled_inserts=recycled_inserts,
            compound=compound,
            insert=insert,
            inserts_total=total_inserts,
            grippers_total=total_grippers,
        )

        # Procesar códigos
        for code, value in codes.items():
            if value is None or value == "":
                setattr(scrap_entry, code, None)
            else:
                setattr(scrap_entry, code, int(value))
                total_pieces += int(value)

        # Cálculos de peso
        total_bodies_weight = int(rubber_weight) if rubber_weight else 0
        total_inserts_weight = (
            int(insert_without_rubber) * int(total_inserts)
            if insert_without_rubber and total_inserts
            else 0
        )
        total_grippers_weight = (
            float(gripper_without_rubber) * float(total_grippers)
            if gripper_without_rubber and total_grippers
            else 0
        )
        total_rubber_weight_in_insert = (
            int(insert_with_rubber) - total_inserts_weight if insert_with_rubber else 0
        )
        total_rubber_weight_in_gripper = (
            float(gripper_with_rubber) - total_grippers_weight
            if gripper_with_rubber
            else 0
        )

        total_rubber_weight = total_bodies_weight + total_rubber_weight_in_insert

        scrap_entry.total_pieces = total_pieces
        scrap_entry.total_bodies_weight = total_bodies_weight
        scrap_entry.total_inserts_weight = total_inserts_weight
        scrap_entry.total_rubber_weight_in_insert = total_rubber_weight_in_insert
        scrap_entry.total_rubber_weight_in_gripper = total_rubber_weight_in_gripper
        scrap_entry.total_rubber_weight = total_rubber_weight
        scrap_entry.total_bodies_weight_lbs = gr_to_lbs(total_bodies_weight)
        scrap_entry.total_inserts_weight_lbs = gr_to_lbs(total_inserts_weight)
        scrap_entry.total_grippers_weight = total_grippers_weight
        scrap_entry.total_grippers_weight_lbs = gr_to_lbs(total_grippers_weight)
        scrap_entry.total_rubber_weight_in_insert_lbs = gr_to_lbs(
            total_rubber_weight_in_insert
        )
        scrap_entry.total_rubber_weight_in_gripper_lbs = gr_to_lbs(
            total_rubber_weight_in_gripper
        )
        scrap_entry.total_rubber_weight_lbs = gr_to_lbs(total_rubber_weight)

        scrap_entry.save()

        return JsonResponse({"message": "Registro exitoso"}, status=200)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)


def get_rubber_compounds(request):
    compounds = Qc_Scrap.objects.values_list("compound", flat=True).distinct()

    return JsonResponse(list(compounds), safe=False)


@csrf_exempt
@require_POST
def get_total_weight(request):
    data = json.loads(request.body)
    start_date = data.get("start_date")
    end_date = data.get("end_date")
    compound = data.get("compound")
    print(data)

    try:
        # Convertir las fechas a formato de datetime
        start_date = datetime.strptime(start_date, "%Y-%m-%d")
        end_date = datetime.strptime(end_date, "%Y-%m-%d")

        # Incluir el final del día en end_date
        end_date = end_date + timedelta(days=1) - timedelta(seconds=1)

        records = Qc_Scrap.objects.filter(
            date_time__range=(start_date, end_date), compound=compound
        )
        total_weight = sum(
            record.total_bodies_weight_lbs
            for record in records
            if record.total_bodies_weight_lbs
        )
        print(records)

        total_weight = round(total_weight, 2)

        return JsonResponse({"total_weight": total_weight or 0})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@csrf_exempt
def get_scrap_register_summary(request, date):
    # Convierte la fecha del parámetro
    try:
        date = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        return JsonResponse(
            {"error": "Formato de fecha inválido. Usa YYYY-MM-DD."}, status=400
        )

    # Filtra los registros de acuerdo a la fecha
    scrap_data = Qc_Scrap.objects.filter(date_time__date=date)

    # Extrae los datos que necesitas de cada registro
    result = list(
        scrap_data.values(
            "id",
            "rubber_weight",
            "total_pieces",
            "insert_weight_w_rubber",
            "date_time",
            "shift",
            "line",
            "auditor_qc",
            "molder_number",
            "part_number",
            "compound",
            "caliber",
        )
    )

    # Retorna la respuesta en formato JSON
    return JsonResponse(result, safe=False)


@csrf_exempt
def delete_scrap_register(request, id):
    if request.method == "DELETE":
        try:
            scrap_record = Qc_Scrap.objects.get(id=id)
            scrap_record.delete()
            return JsonResponse(
                {"message": "Registro eliminado exitosamente."}, status=200
            )
        except Qc_Scrap.DoesNotExist:
            return JsonResponse({"error": "Registro no encontrado."}, status=404)
    return JsonResponse({"error": "Método no permitido."}, status=405)


@csrf_exempt
def get_rubber_report_history(request):
    history = Rubber_Query_history.objects.all()

    data = [
        {
            "query_date": h.query_date,
            "start_date": h.start_date,
            "end_date": h.end_date,
            "compound": h.compound,
            "total_weight": h.total_weight,
            "comments": h.comments,
        }
        for h in history
    ]

    return JsonResponse(data, safe=False)


@csrf_exempt
def get_inserts_report_history(request):
    history = Insert_Query_history.objects.all()

    data = [
        {
            "query_date": h.query_date,
            "start_date": h.start_date,
            "end_date": h.end_date,
            "insert": h.insert,
            "total_insert": h.total_insert,
            "total_chemlok": h.total_chemlok,
            "total_rubber": h.total_rubber,
            "total_metal": h.total_metal,
            "total_sum": h.total_sum,
        }
        for h in history
    ]

    return JsonResponse(data, safe=False)
