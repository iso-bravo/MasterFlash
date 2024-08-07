from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'masterflash.core'

    def ready(self) -> None:
        import masterflash.core.signals 