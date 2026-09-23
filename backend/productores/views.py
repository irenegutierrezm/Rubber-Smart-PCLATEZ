from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Productor, Parcela
import json


def verificar_permiso(request):
    if not request.user.is_authenticated:
        return True  # Permitir acceso a usuarios no autenticados para pruebas
    return request.user.rol in ['admin', 'auxiliar']


class ProductoresView(APIView):
    permission_classes = []

    def get(self, request):
        if not verificar_permiso(request):
            return Response({'error': 'Sin permisos'},
                            status=status.HTTP_403_FORBIDDEN)
        buscar = request.GET.get('q', '')
        qs = Productor.objects.all()
        if buscar:
            qs = qs.filter(
                apellido_paterno__icontains=buscar
            ) | qs.filter(
                apellido_materno__icontains=buscar
            ) | qs.filter(
                nombre__icontains=buscar
            ) | qs.filter(
                folio__icontains=buscar
            ) | qs.filter(
                localidad__icontains=buscar
            )
            qs = qs.distinct()
        data = []
        for p in qs:
            data.append({
                'id':               p.id,
                'folio':            p.folio,
                'nombre_completo':  p.nombre_completo,
                'nombre':           p.nombre,
                'apellido_paterno': p.apellido_paterno,
                'apellido_materno': p.apellido_materno,
                'curp':             p.curp,
                'rfc':              p.rfc,
                'telefono':         p.telefono,
                'correo':           p.correo,
                'localidad':        p.localidad,
                'municipio':        p.municipio,
                'estado':           p.estado,
                'status':           p.status,
                'total_parcelas':   p.total_parcelas,
                'superficie_total': float(p.superficie_total),
                'fecha_ingreso':    str(p.fecha_ingreso) if p.fecha_ingreso else '',
            })
        return Response(data)

    def post(self, request):
        if not verificar_permiso(request):
            return Response({'error': 'Sin permisos'},
                            status=status.HTTP_403_FORBIDDEN)
        d = request.data
        ultimo = Productor.objects.count() + 1
        folio = f'PROD-{str(ultimo).zfill(4)}'
        p = Productor.objects.create(
            folio            = folio,
            nombre           = d.get('nombre', ''),
            apellido_paterno = d.get('apellido_paterno', ''),
            apellido_materno = d.get('apellido_materno', ''),
            curp             = d.get('curp', ''),
            rfc              = d.get('rfc', ''),
            telefono         = d.get('telefono', ''),
            telefono_alt     = d.get('telefono_alt', ''),
            correo           = d.get('correo', ''),
            calle            = d.get('calle', ''),
            numero           = d.get('numero', ''),
            localidad        = d.get('localidad', ''),
            municipio        = d.get('municipio', ''),
            estado           = d.get('estado', 'VER'),
            codigo_postal    = d.get('codigo_postal', ''),
            status           = d.get('status', 'activo'),
            historial_productivo = d.get('historial_productivo', ''),
            observaciones    = d.get('observaciones', ''),
        )
        return Response({'success': True, 'id': p.id, 'folio': p.folio},
                        status=status.HTTP_201_CREATED)


class ProductorDetalleView(APIView):
    permission_classes = []

    def get(self, request, pk):
        if not verificar_permiso(request):
            return Response({'error': 'Sin permisos'},
                            status=status.HTTP_403_FORBIDDEN)
        try:
            p = Productor.objects.get(pk=pk)
        except Productor.DoesNotExist:
            return Response({'error': 'No encontrado'},
                            status=status.HTTP_404_NOT_FOUND)

        parcelas = []
        for parc in p.parcelas.all():
            parcelas.append({
                'id':               parc.id,
                'nombre':           parc.nombre,
                'clave':            parc.clave,
                'localidad':        parc.localidad,
                'municipio':        parc.municipio,
                'variedad':         parc.variedad,
                'hectareas':        float(parc.hectareas),
                'edad_anos':        parc.edad_anos,
                'densidad_arboles': parc.densidad_arboles,
                'total_arboles':    parc.total_arboles,
                'status':           parc.status,
                'lat_centro':       float(parc.lat_centro) if parc.lat_centro else None,
                'lon_centro':       float(parc.lon_centro) if parc.lon_centro else None,
                'observaciones':    parc.observaciones,
                'fecha_siembra':    str(parc.fecha_siembra) if parc.fecha_siembra else '',
            })

        return Response({
            'id':               p.id,
            'folio':            p.folio,
            'nombre':           p.nombre,
            'apellido_paterno': p.apellido_paterno,
            'apellido_materno': p.apellido_materno,
            'nombre_completo':  p.nombre_completo,
            'curp':             p.curp,
            'rfc':              p.rfc,
            'telefono':         p.telefono,
            'telefono_alt':     p.telefono_alt,
            'correo':           p.correo,
            'calle':            p.calle,
            'numero':           p.numero,
            'localidad':        p.localidad,
            'municipio':        p.municipio,
            'estado':           p.estado,
            'codigo_postal':    p.codigo_postal,
            'status':           p.status,
            'historial_productivo': p.historial_productivo,
            'observaciones':    p.observaciones,
            'fecha_ingreso':    str(p.fecha_ingreso) if p.fecha_ingreso else '',
            'total_parcelas':   p.total_parcelas,
            'superficie_total': float(p.superficie_total),
            'parcelas':         parcelas,
        })

    def put(self, request, pk):
        if not verificar_permiso(request):
            return Response({'error': 'Sin permisos'},
                            status=status.HTTP_403_FORBIDDEN)
        try:
            p = Productor.objects.get(pk=pk)
        except Productor.DoesNotExist:
            return Response({'error': 'No encontrado'},
                            status=status.HTTP_404_NOT_FOUND)
        d = request.data
        p.nombre           = d.get('nombre',           p.nombre)
        p.apellido_paterno = d.get('apellido_paterno', p.apellido_paterno)
        p.apellido_materno = d.get('apellido_materno', p.apellido_materno)
        p.curp             = d.get('curp',             p.curp)
        p.rfc              = d.get('rfc',              p.rfc)
        p.telefono         = d.get('telefono',         p.telefono)
        p.telefono_alt     = d.get('telefono_alt',     p.telefono_alt)
        p.correo           = d.get('correo',           p.correo)
        p.calle            = d.get('calle',            p.calle)
        p.numero           = d.get('numero',           p.numero)
        p.localidad        = d.get('localidad',        p.localidad)
        p.municipio        = d.get('municipio',        p.municipio)
        p.estado           = d.get('estado',           p.estado)
        p.codigo_postal    = d.get('codigo_postal',    p.codigo_postal)
        p.status           = d.get('status',           p.status)
        p.historial_productivo = d.get('historial_productivo', p.historial_productivo)
        p.observaciones    = d.get('observaciones',    p.observaciones)
        p.save()
        return Response({'success': True})

    def delete(self, request, pk):
        if not request.user.is_authenticated or request.user.rol != 'admin':
            return Response({'error': 'Solo el administrador puede eliminar'},
                            status=status.HTTP_403_FORBIDDEN)
        try:
            p = Productor.objects.get(pk=pk)
            p.delete()
            return Response({'success': True})
        except Productor.DoesNotExist:
            return Response({'error': 'No encontrado'},
                            status=status.HTTP_404_NOT_FOUND)


class ParcelasView(APIView):
    permission_classes = []

    def post(self, request, productor_pk):
        if not verificar_permiso(request):
            return Response({'error': 'Sin permisos'},
                            status=status.HTTP_403_FORBIDDEN)
        try:
            productor = Productor.objects.get(pk=productor_pk)
        except Productor.DoesNotExist:
            return Response({'error': 'Productor no encontrado'},
                            status=status.HTTP_404_NOT_FOUND)
        d = request.data
        parc = Parcela.objects.create(
            productor        = productor,
            nombre           = d.get('nombre', ''),
            clave            = d.get('clave', ''),
            localidad        = d.get('localidad', ''),
            municipio        = d.get('municipio', ''),
            variedad         = d.get('variedad', ''),
            hectareas        = d.get('hectareas', 0),
            edad_anos        = d.get('edad_anos', 0),
            densidad_arboles = d.get('densidad_arboles', 0),
            status           = d.get('status', 'produccion'),
            lat_centro       = d.get('lat_centro') or None,
            lon_centro       = d.get('lon_centro') or None,
            observaciones    = d.get('observaciones', ''),
        )
        return Response({'success': True, 'id': parc.id},
                        status=status.HTTP_201_CREATED)


class ParcelaDetalleView(APIView):
    permission_classes = []

    def put(self, request, pk):
        if not verificar_permiso(request):
            return Response({'error': 'Sin permisos'},
                            status=status.HTTP_403_FORBIDDEN)
        try:
            parc = Parcela.objects.get(pk=pk)
        except Parcela.DoesNotExist:
            return Response({'error': 'No encontrado'},
                            status=status.HTTP_404_NOT_FOUND)
        d = request.data
        parc.nombre           = d.get('nombre',           parc.nombre)
        parc.clave            = d.get('clave',            parc.clave)
        parc.localidad        = d.get('localidad',        parc.localidad)
        parc.municipio        = d.get('municipio',        parc.municipio)
        parc.variedad         = d.get('variedad',         parc.variedad)
        parc.hectareas        = d.get('hectareas',        parc.hectareas)
        parc.edad_anos        = d.get('edad_anos',        parc.edad_anos)
        parc.densidad_arboles = d.get('densidad_arboles', parc.densidad_arboles)
        parc.status           = d.get('status',           parc.status)
        parc.lat_centro       = d.get('lat_centro') or parc.lat_centro
        parc.lon_centro       = d.get('lon_centro') or parc.lon_centro
        parc.observaciones    = d.get('observaciones',    parc.observaciones)
        parc.save()
        return Response({'success': True})

    def delete(self, request, pk):
        if not request.user.is_authenticated or request.user.rol != 'admin':
            return Response({'error': 'Solo el administrador puede eliminar'},
                            status=status.HTTP_403_FORBIDDEN)
        try:
            parc = Parcela.objects.get(pk=pk)
            parc.delete()
            return Response({'success': True})
        except Parcela.DoesNotExist:
            return Response({'error': 'No encontrado'},
                            status=status.HTTP_404_NOT_FOUND)