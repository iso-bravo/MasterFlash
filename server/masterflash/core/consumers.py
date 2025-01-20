import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from .utils import send_production_data

class ProductionConsumer(WebsocketConsumer):

    def connect(self):
        self.accept()
        async_to_sync(self.channel_layer.group_add)("production_group", self.channel_name)
        self.send(text_data=json.dumps({"type": "connected", "message": "Conexión establecida"}))
        self.send_production_update()

    def disconnect(self, code):
        async_to_sync(self.channel_layer.group_discard)("production_group", self.channel_name)
        self.send(text_data=json.dumps({"type": "disconnected", "message": "Consumidor desconectado"}))

    def receive(self, text_data):
        self.send(
            text_data=json.dumps(
                {"type": "received", "message": "Received message: " + text_data}
            )
        )
        self.send_production_update()
        

    def send_production_update(self):
        production_data = send_production_data()
        self.send(text_data=json.dumps(production_data))

    def production_message(self, event):
        message = event['message']
        self.send(text_data=json.dumps(message))

    @staticmethod
    def get_production_data(machine_name=None):
        return send_production_data()


