from django.db import models


class Productor(models.Model):
    ESTADOS_MX = [
        ('VER', 'Veracruz'),
        ('OAX', 'Oaxaca'),
        ('PUE', 'Puebla'),
        ('CDMX', 'Ciudad de México'),
        ('JAL', 'Jalisco'),
    ]
    STATUS = [
        ('activo',   'Activo'),
        ('inactivo', 'Inactivo'),
    ]

    # Identificacion
    folio           = models.CharField(max_length=20, unique=True, blank=True)
    nombre          = models.CharField(max_length=60)
    apellido_paterno = models.CharField(max_length=60)
    apellido_materno = models.CharField(max_length=60, blank=True)
    curp            = models.CharField(max_length=18, blank=True)
    rfc             = models.CharField(max_length=13, blank=True)

    # Contacto
    telefono        = models.CharField(max_length=20, blank=True)
    telefono_alt    = models.CharField(max_length=20, blank=True)
    correo          = models.EmailField(blank=True)

    # Direccion
    calle           = models.CharField(max_length=150, blank=True)
    numero          = models.CharField(max_length=20, blank=True)
    localidad       = models.CharField(max_length=100, blank=True)
    municipio       = models.CharField(max_length=100, blank=True)
    estado          = models.CharField(max_length=4, choices=ESTADOS_MX,
                                       default='VER')
    codigo_postal   = models.CharField(max_length=10, blank=True)

    # Status
    status          = models.CharField(max_length=10, choices=STATUS,
                                       default='activo')
    fecha_ingreso   = models.DateField(auto_now_add=True, null=True)

    # Historial y notas
    historial_productivo = models.TextField(blank=True)
    observaciones        = models.TextField(blank=True)

    # Auditoria
    creado_en    = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['apellido_paterno', 'apellido_materno', 'nombre']

    def __str__(self):
        return f'{self.apellido_paterno} {self.apellido_materno} {self.nombre}'

    @property
    def nombre_completo(self):
        return f'{self.apellido_paterno} {self.apellido_materno} {self.nombre}'.strip()

    @property
    def total_parcelas(self):
        return self.parcelas.count()

    @property
    def superficie_total(self):
        from django.db.models import Sum
        result = self.parcelas.aggregate(Sum('hectareas'))
        return result['hectareas__sum'] or 0


class Parcela(models.Model):
    STATUS = [
        ('produccion',    'En producción'),
        ('establecimiento', 'Establecimiento'),
        ('vivero',        'Vivero'),
        ('renovacion',    'Renovación'),
        ('abandonada',    'Abandonada'),
    ]
    VARIEDADES = [
        ('RRIM 600', 'RRIM 600'),
        ('GT-1',     'GT-1'),
        ('PB 260',   'PB 260'),
        ('IAN 873',  'IAN 873'),
        ('Otro',     'Otro'),
    ]

    productor       = models.ForeignKey(Productor, on_delete=models.CASCADE,
                                        related_name='parcelas')
    nombre          = models.CharField(max_length=100)
    clave           = models.CharField(max_length=30, blank=True)
    localidad       = models.CharField(max_length=100, blank=True)
    municipio       = models.CharField(max_length=100, blank=True)
    variedad        = models.CharField(max_length=20, choices=VARIEDADES,
                                       blank=True)
    hectareas       = models.DecimalField(max_digits=8, decimal_places=2,
                                          default=0)
    edad_anos       = models.IntegerField(default=0)
    densidad_arboles = models.IntegerField(default=0)
    status          = models.CharField(max_length=20, choices=STATUS,
                                       default='produccion')
    lat_centro      = models.DecimalField(max_digits=10, decimal_places=7,
                                          null=True, blank=True)
    lon_centro      = models.DecimalField(max_digits=10, decimal_places=7,
                                          null=True, blank=True)
    observaciones   = models.TextField(blank=True)
    fecha_siembra   = models.DateField(null=True, blank=True)
    creado_en       = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['nombre']

    def __str__(self):
        return f'{self.nombre} — {self.productor.nombre_completo}'

    @property
    def total_arboles(self):
        return int(self.hectareas * self.densidad_arboles)