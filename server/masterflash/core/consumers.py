import json
from datetime import datetime, time
from channels.generic.websocket import WebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.db.models import Q, Sum
from .utils import set_shift
from .models import LinePress, ProductionPress, StatePress
from .views import sum_pieces

class ProductionConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()
        async_to_sync(self.channel_layer.group_add)("production_group", self.channel_name)
        self.send(text_data=json.dumps({"type": "connected", "message": "Conexión establecida"}))
        self.send_production_data()

    def disconnect(self, code):
        async_to_sync(self.channel_layer.group_discard)("production_group", self.channel_name)
        self.send(text_data=json.dumps({"type": "disconnected", "message": "Consumidor desconectado"}))

    def receive(self, text_data):
        self.send(text_data=json.dumps({"type": "received", "message": "Received message: " + text_data}))
        self.send_production_data()

    def production_message(self, event):
        message = event['message']
        print(message)
        self.send(text_data=message)

    def send_production_data(self):
        print("Sending production data...")
        current_date = datetime.now().date()
        current_time = datetime.now().time()
        shift = set_shift(current_time)

        machines = LinePress.objects.all()
        machines_data = []
        total_piecesProduced = 0

        for machine in machines:
            if machine.status != 'Available':
                continue

            production = ProductionPress.objects.filter(press=machine.name).order_by('-date_time').first()
            states = StatePress.objects.filter(name=machine.name)

            partNumber = production.part_number if production and production.part_number else '--------'
            employeeNumber = production.employee_number if production and production.employee_number else '----'
            workOrder = production.work_order if production and production.work_order else ''
            molderNumber = production.molder_number if production and production.molder_number else '----'

            if shift == 'First':
                production = ProductionPress.objects.filter(
                    press=machine.name,
                    shift=shift,
                    date_time__date=current_date,
                    date_time__time__range=(time(7, 0), time(16, 35))
                ).aggregate(
                    total_ok=Sum('pieces_ok'),
                    total_rework=Sum('pieces_rework')
                )
            elif shift == 'Second':
                production = ProductionPress.objects.filter(
                    Q(press=machine.name, shift=shift, date_time__date=current_date, date_time__time__range=(time(16, 36), time.max)) |
                    Q(press=machine.name, shift=shift, date_time__date=current_date, date_time__time__range=(time.min, time(1, 20)))
                ).aggregate(
                    total_ok=Sum('pieces_ok'),
                    total_rework=Sum('pieces_rework')
                )

            if production and (shift == 'First' or shift == 'Second'):
                total_ok = production['total_ok'] if production['total_ok'] else 0
                total_rework = production['total_rework'] if production['total_rework'] else 0
                actual_ok = sum_pieces(machine, shift, current_date)
            else:
                total_ok = 0
                total_rework = 0
                actual_ok = 0

            if states:
                last_state = states.latest("date", "start_time")
                machine_state = last_state.state
            else:
                machine_state = 'Inactive'

            machine_data = {
                'name': machine.name,
                'state': machine_state,
                'employee_number': employeeNumber,
                'pieces_ok': actual_ok,
                'pieces_rework': total_rework,
                'part_number': partNumber,
                'work_order': workOrder,
                'total_ok': total_ok,
                'molder_number': molderNumber
            }
            total_piecesProduced += total_ok
            machines_data.append(machine_data)

        response_data = {
            'machines_data': machines_data,
            'total_piecesProduced': total_piecesProduced,
        }

        self.send(text_data=json.dumps(response_data))
