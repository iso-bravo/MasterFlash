# type: ignore
from django.db import models
from django.utils import timezone


class LinePress(models.Model):
    name = models.CharField(max_length=50)
    status = models.CharField(max_length=50)
    comments = models.TextField(null=True, blank=True)


class StatePress(models.Model):
    name = models.CharField(max_length=50)
    shift = models.CharField(max_length=50, null=True, blank=True)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField(null=True, blank=True)
    total_time = models.FloatField(null=True, blank=True)
    state = models.CharField(max_length=50)
    employee_number = models.IntegerField(null=True, blank=True)
    comments = models.TextField(null=True, blank=True)


class StateTroquelado(models.Model):
    name = models.CharField(max_length=50)
    shift = models.CharField(max_length=50, null=True, blank=True)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField(null=True, blank=True)
    total_time = models.FloatField(null=True, blank=True)
    state = models.CharField(max_length=50)
    employee_number = models.IntegerField(null=True, blank=True)
    comments = models.TextField(null=True, blank=True)


class StateBarwell(models.Model):
    name = models.CharField(max_length=50)
    shift = models.CharField(max_length=50, null=True, blank=True)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField(null=True, blank=True)
    total_time = models.FloatField(null=True, blank=True)
    state = models.CharField(max_length=50)
    employee_number = models.IntegerField(null=True, blank=True)
    comments = models.TextField(null=True, blank=True)


class ProductionPress(models.Model):
    press = models.CharField(default=None, max_length=50)
    date_time = models.DateTimeField()
    employee_number = models.IntegerField(null=True, blank=True)
    pieces_ok = models.IntegerField(null=True, blank=True)
    pieces_scrap = models.IntegerField(null=True, blank=True)
    pieces_rework = models.IntegerField(null=True, blank=True)
    part_number = models.CharField(max_length=50, blank=True)
    work_order = models.CharField(max_length=50, blank=True)
    shift = models.CharField(default="", max_length=50)
    molder_number = models.IntegerField(default=None, null=True, blank=True)


class Insert(models.Model):
    insert = models.CharField(max_length=50, blank=True, null=True)
    weight = models.FloatField(null=True, blank=True)
    caliber = models.FloatField(null=True, blank=True)


def upload_path(filename):
    return "/".join(["images"], filename)


class Part_Number(models.Model):
    part_number = models.CharField(max_length=50, blank=True, null=True)
    client = models.CharField(max_length=50, blank=True, null=True)
    box = models.CharField(max_length=50, blank=True, null=True)
    pieces_x_box = models.IntegerField(null=True, blank=True)
    rubber_compound = models.CharField(max_length=50, blank=True, null=True)
    price = models.FloatField(null=True, blank=True)
    standard = models.IntegerField(null=True, blank=True)
    pallet = models.CharField(max_length=50, blank=True, null=True)
    box_x_pallet = models.IntegerField(null=True, blank=True)
    pieces_x_pallet = models.IntegerField(null=True, blank=True)
    assembly = models.CharField(max_length=50, blank=True, null=True)
    accessories = models.CharField(max_length=50, blank=True, null=True)
    mold = models.CharField(max_length=50, blank=True, null=True)
    instructive = models.CharField(max_length=50, blank=True, null=True)
    insert = models.CharField(max_length=50, blank=True, null=True)
    gripper = models.CharField(max_length=50, blank=True, null=True)
    caliber = models.CharField(max_length=50, blank=True, null=True)
    paint = models.CharField(max_length=50, blank=True, null=True)
    std_paint = models.IntegerField(null=True, blank=True)
    painter = models.FloatField(null=True, blank=True)
    scrap = models.FloatField(null=True, blank=True)
    box_logo = models.CharField(max_length=50, blank=True, null=True)
    cavities = models.IntegerField(null=True, blank=True)
    category = models.CharField(max_length=50, blank=True, null=True)
    type2 = models.CharField(max_length=50, blank=True, null=True)
    measurement = models.CharField(max_length=50, blank=True, null=True)
    special = models.CharField(max_length=50, blank=True, null=True)
    piece_label = models.CharField(max_length=50, blank=True, null=True)
    qty_piece_labels = models.IntegerField(null=True, blank=True)
    box_label = models.CharField(max_length=20, blank=True, null=True)
    qty_box_labels = models.IntegerField(null=True, blank=True)
    box_label_2 = models.CharField(max_length=20, blank=True, null=True)
    qty_box_labels_2 = models.IntegerField(null=True, blank=True)
    box_label_3 = models.CharField(max_length=20, blank=True, null=True)
    qty_box_labels_3 = models.IntegerField(null=True, blank=True)
    made_in_mexico = models.CharField(max_length=50, blank=True, null=True)
    staples = models.CharField(max_length=50, blank=True, null=True)
    image_piece_label = models.ImageField(upload_to=upload_path, null=True, blank=True)
    image_box_label = models.ImageField(upload_to=upload_path, null=True, blank=True)
    image_box_label_2 = models.ImageField(upload_to=upload_path, null=True, blank=True)
    image_box_label_3 = models.ImageField(upload_to=upload_path, null=True, blank=True)


class Qc_Scrap(models.Model):
    date_time = models.DateTimeField()
    shift = models.CharField(max_length=50, blank=True, null=True)
    line = models.CharField(max_length=50, blank=True, null=True)
    auditor_qc = models.IntegerField(null=True, blank=True)
    molder_number = models.IntegerField(null=True, blank=True)
    part_number = models.CharField(max_length=50, blank=True, null=True)
    compound = models.CharField(max_length=50, blank=True, null=True)
    mold = models.CharField(max_length=50, blank=True, null=True)
    insert = models.CharField(max_length=50, blank=True, null=True)
    gripper = models.CharField(max_length=50, blank=True, null=True)
    caliber = models.CharField(max_length=50, blank=True, null=True)
    B = models.IntegerField(null=True, blank=True)
    CC = models.IntegerField(null=True, blank=True)
    CD = models.IntegerField(null=True, blank=True)
    CH = models.IntegerField(null=True, blank=True)
    CM = models.IntegerField(null=True, blank=True)
    CMB = models.IntegerField(null=True, blank=True)
    CR = models.IntegerField(null=True, blank=True)
    CROP = models.IntegerField(null=True, blank=True)
    CS = models.IntegerField(null=True, blank=True)
    D = models.IntegerField(null=True, blank=True)
    DI = models.IntegerField(null=True, blank=True)
    DP = models.IntegerField(null=True, blank=True)
    F = models.IntegerField(null=True, blank=True)
    FC = models.IntegerField(null=True, blank=True)
    FPM = models.IntegerField(null=True, blank=True)
    FPO = models.IntegerField(null=True, blank=True)
    GA = models.IntegerField(null=True, blank=True)
    GM = models.IntegerField(null=True, blank=True)
    H = models.IntegerField(null=True, blank=True)
    _ID = models.IntegerField(null=True, blank=True)
    IM = models.IntegerField(null=True, blank=True)
    IMC = models.IntegerField(null=True, blank=True)
    IP = models.IntegerField(null=True, blank=True)
    IR = models.IntegerField(null=True, blank=True)
    M = models.IntegerField(null=True, blank=True)
    MR = models.IntegerField(null=True, blank=True)
    O = models.IntegerField(null=True, blank=True)
    PD = models.IntegerField(null=True, blank=True)
    PR = models.IntegerField(null=True, blank=True)
    Q = models.IntegerField(null=True, blank=True)
    R = models.IntegerField(null=True, blank=True)
    RC = models.IntegerField(null=True, blank=True)
    RPM = models.IntegerField(null=True, blank=True)
    SG = models.IntegerField(null=True, blank=True)
    SI = models.IntegerField(null=True, blank=True)
    SL = models.IntegerField(null=True, blank=True)
    SR = models.IntegerField(null=True, blank=True)
    total_pieces = models.IntegerField(null=True, blank=True)
    rubber_weight = models.FloatField(null=True, blank=True)
    insert_weight_wout_rubber = models.FloatField(null=True, blank=True)
    gripper_weight_wout_rubber = models.FloatField(null=True, blank=True)
    insert_weight_w_rubber = models.FloatField(null=True, blank=True)
    gripper_weight_w_rubber = models.FloatField(null=True, blank=True)
    recycled_inserts = models.IntegerField(null=True, blank=True)
    total_bodies_weight = models.FloatField(null=True, blank=True)
    total_inserts_weight = models.FloatField(null=True, blank=True)
    total_grippers_weight = models.FloatField(null=True, blank=True)
    total_rubber_weight_in_insert = models.FloatField(null=True, blank=True)
    total_rubber_weight_in_gripper = models.FloatField(null=True, blank=True)
    total_rubber_weight = models.FloatField(null=True, blank=True)
    total_bodies_weight_lbs = models.FloatField(null=True, blank=True)
    total_inserts_weight_lbs = models.FloatField(null=True, blank=True)
    total_grippers_weight_lbs = models.FloatField(null=True, blank=True)
    total_rubber_weight_in_insert_lbs = models.FloatField(null=True, blank=True)
    total_rubber_weight_in_gripper_lbs = models.FloatField(null=True, blank=True)
    total_rubber_weight_lbs = models.FloatField(null=True, blank=True)
    inserts_total = models.IntegerField(null=True, blank=True)
    grippers_total = models.IntegerField(null=True, blank=True)


class Mold_presses(models.Model):
    press = models.CharField(max_length=50, blank=True, null=True)
    mold = models.CharField(max_length=50, blank=True, null=True)


class Presses_monthly_goals(models.Model):
    month = models.IntegerField()
    year = models.IntegerField()
    target_amount = models.IntegerField()

    def __str__(self):
        return f"{self.month}/{self.year} - {self.target_amount}"


class Production_records(models.Model):
    press = models.CharField(default=None, max_length=50)
    employee_number = models.IntegerField(null=True, blank=True)
    part_number = models.CharField(max_length=50, blank=True)
    work_order = models.CharField(max_length=50, blank=True)
    caliber = models.CharField(max_length=50, blank=True, null=True)
    worked_hrs = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True
    )
    dead_time_cause_1 = models.CharField(max_length=50, null=True, blank=True)
    cavities = models.PositiveIntegerField(null=True, blank=True)
    standard = models.IntegerField(null=True, blank=True)
    proposed_standard = models.PositiveIntegerField(null=True, blank=True)
    dead_time_cause_2 = models.CharField(max_length=50, null=True, blank=True)
    pieces_ok = models.PositiveIntegerField(null=True, blank=True)
    efficiency = models.DecimalField(max_digits=5, decimal_places=2)
    date = models.DateField()
    shift = models.CharField(default="", max_length=50)
    mod_date = models.DateTimeField()

    def __str__(self) -> str:
        return f"{self.press} - {self.employee_number} - {self.part_number}"

    class Meta:
        verbose_name = "Production Record"
        verbose_name_plural = "Production Records"


class Rubber_Query_history(models.Model):
    query_date = models.DateTimeField()
    start_date = models.DateField()
    end_date = models.DateField()
    compound = models.CharField(max_length=100)
    total_weight = models.FloatField()

    def __str__(self) -> str:
        return f"{self.query_date} - {self.compound}"
