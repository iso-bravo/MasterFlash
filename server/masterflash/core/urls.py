from django.urls import path
from . import views

urlpatterns = [
    path("client_data/", views.client_data, name="client_data"),
    path("load_machine_data/", views.load_machine_data, name="load_machine_data"),
    path(
        "arduino_data/<str:path>/<str:value>/", views.arduino_data, name="arduino_data"
    ),
    path(
        "load_machine_data_production/",
        views.load_machine_data_production,
        name="load_machine_data_production",
    ),
    path(
        "register_data_production/",
        views.register_data_production,
        name="register_data_production",
    ),
    path(
        "presses_general_pause/",
        views.presses_general_pause,
        name="presses_general_pause",
    ),
    path(
        "presses_general_failure/",
        views.presses_general_failure,
        name="presses_general_failure",
    ),
    path("load_scrap_data/", views.load_scrap_data, name="load_scrap_data"),
    path(
        "search_in_part_number/",
        views.search_in_part_number,
        name="search_in_part_number",
    ),
    path("search_weight/", views.search_weight, name="search_weight"),
    path("register_scrap/", views.register_scrap, name="register_scrap"),
    path("register_scrap_test/", views.register_scrap_test, name="register_scrap_test"),
    path("register/", views.register, name="register"),
    path(
        "get_production_press_by_date/",
        views.get_production_press_by_date,
        name="get_all_production_press",
    ),
    path("monthly-goal/", views.post_or_put_monthly_goal, name="post_montly_goal"),
    path(
        "monthly-goal/<int:year>/<int:month>/",
        views.get_presses_monthly_goal,
        name="get_monthly_goal",
    ),
    path(
        "production-percentage/<int:year>/<int:month>/",
        views.get_presses_production_percentage,
        name="get_production_percentage",
    ),
    path(
        "save_production_records/",
        views.save_production_records,
        name="save_production_records",
    ),
    path("update_pieces_ok/<int:id>/", views.update_pieces_ok, name="update_pieces_ok"),
    path("rubber_compounds/", views.get_rubber_compounds, name="get_rubber_compounds"),
    path("get_total_weight_lbs/", views.get_total_weight, name="get_total_weight"),
    path(
        "get-mold/<str:part_number>/",
        views.get_mold_by_part_number,
        name="get_mold_by_part_number",
    ),
    path(
        "get_scrap_sumary/<str:date>",
        views.get_scrap_register_summary,
        name="get_scrap_register_summary",
    ),
    path(
        "delete_scrap_register/<int:id>",
        views.delete_scrap_register,
        name="delete_scrap_register",
    ),
    path(
        "get_rubber_report_history/",
        views.get_rubber_report_history,
        name="get_rubber_report_history",
    ),
    path(
        "get_inserts_report_history/",
        views.get_inserts_report_history,
        name="get_inserts_report_history",
    ),
    path("get_all_part_nums/", views.get_part_nums, name="get_all_part_nums"),
    path(
        "part-numbers/names/",
        views.get_all_part_nums_names,
        name="get_all_part_nums_names",
    ),
    path(
        "part-numbers/<str:name>/",
        views.get_part_num_by_name,
        name="get_part_num_by_name",
    ),
    path("new/part-number/", views.post_part_number, name="post_new_part_number"),
    path("get_shift_schedule/", views.get_shift_schedule, name="get_shift_schedule"),
    path(
        "update_shift_schedule/",
        views.update_shift_schedule,
        name="update_shift_schedule",
    ),
    path(
        "get_pieces_ok_by_date_range",
        views.get_pieces_ok_by_date_range,
        name="get_pieces_ok_by_date_range",
    ),
    path(
        "get_record_by_id/<int:id>",
        views.get_record_by_id,
        name="get_production_record_by_id",
    ),
    path("save-params", views.save_params, name="save_params"),
    path(
        "validate_part_number/<str:part_number>/",
        views.validate_part_number,
        name="validate_part_number",
    ),
    path(
        "part_numbers/<int:pk>/update/",
        views.update_part_number,
        name="update_part_number",
    ),
    path("email_config/", views.email_config, name="email_config"),
]
