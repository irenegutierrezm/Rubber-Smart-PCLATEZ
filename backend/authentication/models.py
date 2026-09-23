from django.contrib.auth.models import AbstractUser
from django.db import models


class Usuario(AbstractUser):
    ROLES = [
        ('admin',    'Administrador'),
        ('tecnico',  'Técnico de campo'),
        ('auxiliar', 'Auxiliar'),
    ]
    rol      = models.CharField(max_length=20, choices=ROLES, default='auxiliar')
    telefono = models.CharField(max_length=20, blank=True)
    localidad = models.CharField(max_length=100, blank=True)
    activo   = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True, null=True)
    creado_por = models.ForeignKey(
        'self', null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='usuarios_creados'
    )

    groups = models.ManyToManyField(
        'auth.Group', related_name='usuario_set', blank=True)
    user_permissions = models.ManyToManyField(
        'auth.Permission', related_name='usuario_set', blank=True)

    def __str__(self):
        return f'{self.username} - {self.get_rol_display()}'


class BitacoraAcceso(models.Model):
    ACCIONES = [
        ('login',    'Inicio de sesión'),
        ('logout',   'Cierre de sesión'),
        ('cambio_pass', 'Cambio de contraseña'),
        ('crear_usuario', 'Crear usuario'),
        ('editar_usuario', 'Editar usuario'),
    ]
    usuario    = models.ForeignKey(Usuario, on_delete=models.CASCADE,
                                   related_name='bitacora')
    accion     = models.CharField(max_length=30, choices=ACCIONES)
    fecha      = models.DateTimeField(auto_now_add=True)
    ip         = models.GenericIPAddressField(null=True, blank=True)
    detalle    = models.TextField(blank=True)
    exitoso    = models.BooleanField(default=True)

    class Meta:
        ordering = ['-fecha']

    def __str__(self):
        return f'{self.usuario.username} - {self.accion} - {self.fecha}'