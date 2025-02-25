import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from .utils import send_production_data


class ProductionConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await self.channel_layer.group_add("production_group", self.channel_name)
        await self.send(
            text_data=json.dumps(
                {"type": "connected", "message": "Conexión establecida"}
            )
        )
        await self.send_production_update()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("production_group", self.channel_name)
        await self.send(
            text_data=json.dumps(
                {"type": "disconnected", "message": "Consumidor desconectado"}
            )
        )

    async def receive(self, text_data):
        data = json.loads(text_data)

        if data.get("type") == "request_update":
            await self.send_production_update()
        else:
            await self.send(
                text_data=json.dumps(
                    {"type": "received", "message": "Received message: " + text_data}
                )
            )

    @sync_to_async
    def get_production_data_async(self):
        return send_production_data()

    async def send_production_update(self):
        production_data = await self.get_production_data_async()
        await self.send(text_data=json.dumps(production_data))

    async def production_message(self, event):
        message = event["message"]
        await self.send(text_data=json.dumps(message))
