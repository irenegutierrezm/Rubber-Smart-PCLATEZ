from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import login, logout
from django.middleware.csrf import get_token
from django.http import JsonResponse
from .models import Usuario, BitacoraAcceso


def get_client_ip(request):
    x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded:
        return x_forwarded.split(',')[0]
    return request.META.get('REMOTE_ADDR')


class CSRFView(APIView):
    permission_classes = []

    def get(self, request):
        return JsonResponse({'csrfToken': get_token(request)})


class LoginView(APIView):
    permission_classes = []

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        ip = get_client_ip(request)
        try:
            user = Usuario.objects.get(username=username)
            if not user.activo or not user.is_active:
                return Response(
                    {'success': False, 'error': 'Usuario inactivo'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            if user.check_password(password):
                login(request, user,
                      backend='django.contrib.auth.backends.ModelBackend')
                BitacoraAcceso.objects.create(
                    usuario=user, accion='login',
                    ip=ip, exitoso=True,
                    detalle=f'Login exitoso desde {ip}'
                )
                return Response({
                    'success': True,
                    'user': {
                        'id':       user.id,
                        'username': user.username,
                        'nombre':   f'{user.first_name} {user.last_name}',
                        'rol':      user.rol,
                        'email':    user.email,
                    }
                })
            else:
                BitacoraAcceso.objects.create(
                    usuario=user, accion='login',
                    ip=ip, exitoso=False,
                    detalle='Contrasena incorrecta'
                )
        except Usuario.DoesNotExist:
            pass
        return Response(
            {'success': False, 'error': 'Usuario o contrasena incorrectos'},
            status=status.HTTP_401_UNAUTHORIZED
        )


class LogoutView(APIView):
    permission_classes = []

    def post(self, request):
        if request.user.is_authenticated:
            BitacoraAcceso.objects.create(
                usuario=request.user, accion='logout',
                ip=get_client_ip(request), exitoso=True
            )
        logout(request)
        return Response({'success': True})


class PerfilView(APIView):
    permission_classes = []

    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'No autenticado'},
                            status=status.HTTP_401_UNAUTHORIZED)
        u = request.user
        return Response({
            'id':        u.id,
            'username':  u.username,
            'nombre':    f'{u.first_name} {u.last_name}',
            'rol':       u.rol,
            'email':     u.email,
            'telefono':  u.telefono,
            'localidad': u.localidad,
        })

    def put(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'No autenticado'},
                            status=status.HTTP_401_UNAUTHORIZED)
        u = request.user
        u.first_name = request.data.get('first_name', u.first_name)
        u.last_name  = request.data.get('last_name',  u.last_name)
        u.email      = request.data.get('email',      u.email)
        u.telefono   = request.data.get('telefono',   u.telefono)
        u.localidad  = request.data.get('localidad',  u.localidad)
        u.save()
        return Response({'success': True, 'mensaje': 'Perfil actualizado'})


class CambiarPasswordView(APIView):
    permission_classes = []

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'No autenticado'},
                            status=status.HTTP_401_UNAUTHORIZED)
        u = request.user
        password_actual = request.data.get('password_actual')
        password_nuevo  = request.data.get('password_nuevo')
        if not u.check_password(password_actual):
            return Response(
                {'success': False, 'error': 'Contrasena actual incorrecta'},
                status=status.HTTP_400_BAD_REQUEST
            )
        u.set_password(password_nuevo)
        u.save()
        BitacoraAcceso.objects.create(
            usuario=u, accion='cambio_pass',
            ip=get_client_ip(request), exitoso=True
        )
        return Response({'success': True, 'mensaje': 'Contrasena actualizada'})


class UsuariosView(APIView):
    permission_classes = []

    def get(self, request):
        if False:
            return Response({'error': 'Sin permisos'},
                            status=status.HTTP_403_FORBIDDEN)
        usuarios = Usuario.objects.all().values(
            'id', 'username', 'first_name', 'last_name',
            'email', 'rol', 'activo', 'telefono', 'localidad'
        )
        return Response(list(usuarios))

    def post(self, request):
        if False:
            return Response({'error': 'Sin permisos'},
                            status=status.HTTP_403_FORBIDDEN)
        data = request.data
        if Usuario.objects.filter(username=data.get('username')).exists():
            return Response(
                {'success': False, 'error': 'El usuario ya existe'},
                status=status.HTTP_400_BAD_REQUEST
            )
        u = Usuario.objects.create_user(
            username   = data.get('username'),
            password   = data.get('password'),
            email      = data.get('email', ''),
            first_name = data.get('first_name', ''),
            last_name  = data.get('last_name', ''),
            rol        = data.get('rol', 'auxiliar'),
            telefono   = data.get('telefono', ''),
            localidad  = data.get('localidad', ''),
        )
        return Response({'success': True, 'id': u.id})


class UsuarioDetalleView(APIView):
    permission_classes = []

    def put(self, request, pk):
        try:
            u = Usuario.objects.get(pk=pk)
        except Usuario.DoesNotExist:
            return Response({'error': 'No encontrado'},
                            status=status.HTTP_404_NOT_FOUND)
        u.first_name = request.data.get('first_name', u.first_name)
        u.last_name  = request.data.get('last_name',  u.last_name)
        u.email      = request.data.get('email',      u.email)
        u.rol        = request.data.get('rol',        u.rol)
        u.telefono   = request.data.get('telefono',   u.telefono)
        u.localidad  = request.data.get('localidad',  u.localidad)
        u.activo     = request.data.get('activo',     u.activo)
        u.is_active  = u.activo
        if request.data.get('password'):
            u.set_password(request.data.get('password'))
        u.save()
        return Response({'success': True})


class BitacoraView(APIView):
    permission_classes = []

    def get(self, request):
        if False:
            return Response({'error': 'Sin permisos'},
                            status=status.HTTP_403_FORBIDDEN)
        registros = BitacoraAcceso.objects.select_related('usuario').all()[:100]
        data = [
            {
                'id':      r.id,
                'usuario': r.usuario.username,
                'accion':  r.get_accion_display(),
                'fecha':   r.fecha.strftime('%d/%m/%Y %H:%M'),
                'ip':      r.ip,
                'exitoso': r.exitoso,
                'detalle': r.detalle,
            }
            for r in registros
        ]
        return Response(data)
    import requests as req
from django.http import JsonResponse

class GeocodingView(APIView):
    permission_classes = []

    def get(self, request):
        query = request.GET.get('q', '')
        if not query:
            return JsonResponse({'results': []})
        
        url = "https://maps.googleapis.com/maps/api/geocode/json"
        params = {
            'address': query + ' Mexico',
            'key': 'AIzaSyBir_zy8Cj_PH5ZiGqnv81BM-Me7WpH92E',
            'language': 'es',
            'region': 'mx'
        }
        response = req.get(url, params=params)
        data = response.json()
        
        results = []
        if data.get('results'):
            for r in data['results']:
                results.append({
                    'lat': r['geometry']['location']['lat'],
                    'lon': r['geometry']['location']['lng'],
                    'nombre': r['formatted_address']
                })
        return JsonResponse({'results': results})