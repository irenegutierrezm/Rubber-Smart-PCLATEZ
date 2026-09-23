from django.core.management.base import BaseCommand
from authentication.models import Usuario


class Command(BaseCommand):
    help = 'Crea el usuario administrador si no existe'

    def handle(self, *args, **kwargs):
        if not Usuario.objects.filter(username='admin').exists():
            Usuario.objects.create_superuser(
                username='admin',
                email='admin@latexsmart.mx',
                password='Admin2024*',
                rol='admin',
                first_name='Administrador',
                last_name='LatexSmart'
            )
            self.stdout.write(self.style.SUCCESS('✅ Usuario admin creado'))
        else:
            self.stdout.write('ℹ️  Usuario admin ya existe')