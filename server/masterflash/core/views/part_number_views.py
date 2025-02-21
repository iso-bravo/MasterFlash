
import json
from django.http import Http404,JsonResponse
from ..models import Part_Number
from django.forms import model_to_dict
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST,require_http_methods


def get_mold_by_part_number(request, part_number):
    try:
        part = Part_Number.objects.get(part_number=part_number)
        return JsonResponse({"mold": part.mold})
    except Part_Number.DoesNotExist:
        raise Http404("Part number not found")


@csrf_exempt
def validate_part_number(request, part_number):
    try:
        part = Part_Number.objects.get(part_number=part_number)
        return JsonResponse({"exists": True, "part_number": part.part_number})
    except Part_Number.DoesNotExist:
        return JsonResponse(
            {"exists": False, "error": "Part number not found"}, status=404
        )


@csrf_exempt
def get_part_nums(request):
    part_nums = Part_Number.objects.all()

    data = [
        {
            "id": p.id,
            "part_number": p.part_number,
            "client": p.client,
            "box": p.box,
            "pieces_x_box": p.pieces_x_box,
            "rubber_compound": p.rubber_compound,
            "standard": p.standard,
            "pallet": p.pallet,
            "box_x_pallet": p.box_x_pallet,
            "pieces_x_pallet": p.pieces_x_pallet,
            "mold": p.mold,
            "insert": p.insert,
            "caliber": p.caliber,
            "gripper": p.gripper,
        }
        for p in part_nums
    ]

    return JsonResponse(data, safe=False)


# ? Podría ser útil en el futuro
# @csrf_exempt
# def get_all_part_nums(request):
#     part_nums = Part_Number.objects.all()
#     data = serializers.serialize('json',part_nums)
#     return JsonResponse(data, safe=False)


@csrf_exempt
def get_all_part_nums_names(request):
    search_query = request.GET.get("search", "")
    part_nums = Part_Number.objects.filter(part_number__icontains=search_query).values(
        "part_number"
    )
    return JsonResponse(list(part_nums), safe=False)


@csrf_exempt
def get_part_num_by_name(request, name):
    part_num = Part_Number.objects.filter(part_number=name).first()
    if part_num:
        # Excluimos los campos de imagen
        data = model_to_dict(
            part_num,
            exclude=[
                "image_piece_label",
                "image_box_label",
                "image_box_label_2",
                "image_box_label_3",
            ],
        )

        # Añadimos las URLs de las imágenes si existen
        if part_num.image_piece_label:
            data["image_piece_label_url"] = part_num.image_piece_label.url
        if part_num.image_box_label:
            data["image_box_label_url"] = part_num.image_box_label.url
        if part_num.image_box_label_2:
            data["image_box_label_2_url"] = part_num.image_box_label_2.url
        if part_num.image_box_label_3:
            data["image_box_label_3_url"] = part_num.image_box_label_3.url

        return JsonResponse(data, safe=False)
    else:
        return JsonResponse({"error": "Part number not found"}, status=404)


@csrf_exempt
@require_POST
def post_part_number(request):
    try:
        data = json.loads(request.body)
        print(data)

        if Part_Number.objects.filter(part_number=data.get("part_number")).exists():
            print("El número de parte ya existe")
            return JsonResponse({"error": "El número de parte ya existe."}, status=400)

        Part_Number.objects.create(
            part_number=data.get("part_number"),
            client=data.get("client"),
            box=data.get("box"),
            pieces_x_box=data.get("pieces_x_box"),
            rubber_compound=data.get("rubber_compound"),
            price=data.get("price"),
            standard=data.get("standard"),
            pallet=data.get("pallet"),
            box_x_pallet=data.get("box_x_pallet"),
            pieces_x_pallet=data.get("pieces_x_pallet"),
            assembly=data.get("assembly"),
            accessories=data.get("accessories"),
            mold=data.get("mold"),
            instructive=data.get("instructive"),
            insert=data.get("insert"),
            gripper=data.get("gripper"),
            caliber=data.get("caliber"),
            paint=data.get("paint"),
            std_paint=data.get("std_paint"),
            painter=data.get("painter"),
            scrap=data.get("scrap"),
            box_logo=data.get("box_logo"),
            cavities=data.get("cavities"),
            category=data.get("category"),
            type2=data.get("type2"),
            measurement=data.get("measurement"),
            special=data.get("special"),
            piece_label=data.get("piece_label"),
            qty_piece_labels=data.get("qty_piece_labels"),
            box_label=data.get("box_label"),
            qty_box_labels=data.get("qty_box_labels"),
            box_label_2=data.get("box_label_2"),
            qty_box_labels_2=data.get("qty_box_labels_2"),
            box_label_3=data.get("box_label_3"),
            qty_box_labels_3=data.get("qty_box_labels_3"),
            made_in_mexico=data.get("made_in_mexico"),
            staples=data.get("staples"),
            image_piece_label=data.get("image_piece_label"),
            image_box_label=data.get("image_box_label"),
            image_box_label_2=data.get("image_box_label_2"),
            image_box_label_3=data.get("image_box_label_3"),
        )

        return JsonResponse({"message": "Part number created successfully"}, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
@require_http_methods(["PATCH"])
def update_part_number(request, pk):
    try:
        part_number = Part_Number.objects.get(pk=pk)
    except Part_Number.DoesNotExist:
        return JsonResponse({"error": "Part number not found"}, status=404)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    # Actualización de los campos que se proporcionan
    for key, value in data.items():
        if hasattr(part_number, key):  # Verifica que el campo exista en el modelo
            setattr(part_number, key, value)

    part_number.save()

    return JsonResponse({"message": "Part number updated successfully"}, status=200)

def get_part_num_by_id(request, id):
    try:
        part_num = Part_Number.objects.filter(id=id).values().first()
    
    
        if part_num is None:
            return JsonResponse({"error": "Part_number not found"}, status=404)

        return JsonResponse(part_num, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)