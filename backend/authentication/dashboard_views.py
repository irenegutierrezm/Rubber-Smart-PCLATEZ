from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import connection


class StatsView(APIView):
    permission_classes = []

    def get(self, request):
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM productores_productor")
            total_productores = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM productores_parcela")
            total_parcelas = cursor.fetchone()[0]

            cursor.execute("""
                SELECT COALESCE(SUM(hectareas), 0)
                FROM productores_parcela
            """)
            total_hectareas = cursor.fetchone()[0]

            cursor.execute("""
                SELECT COUNT(*) FROM alertas WHERE estado = 'activa'
            """)
            total_alertas = cursor.fetchone()[0]

            cursor.execute("""
                SELECT COUNT(*) FROM productores_productor
                WHERE status = 'activo'
            """)
            total_activos = cursor.fetchone()[0]

        return Response({
            'total_productores': total_productores,
            'total_parcelas':    total_parcelas,
            'total_hectareas':   float(total_hectareas),
            'total_alertas':     total_alertas,
            'total_activos':     total_activos,
            'ndvi_promedio':     0.72,
        })


class ProductoresView(APIView):
    permission_classes = []

    def get(self, request):
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT p.id, p.folio,
                       p.apellido_paterno, p.apellido_materno, p.nombre,
                       p.telefono, p.localidad, p.municipio, p.status,
                       COUNT(parc.id) as total_parcelas,
                       COALESCE(SUM(parc.hectareas), 0) as total_ha
                FROM productores_productor p
                LEFT JOIN productores_parcela parc ON parc.productor_id = p.id
                GROUP BY p.id
                ORDER BY p.apellido_paterno, p.nombre
                LIMIT 10
            """)
            rows = cursor.fetchall()

        data = [{
            'id':             r[0],
            'folio':          r[1],
            'nombre_completo': f'{r[2]} {r[3]} {r[4]}'.strip(),
            'telefono':       r[5],
            'localidad':      r[6],
            'municipio':      r[7],
            'status':         r[8],
            'total_parcelas': r[9],
            'total_ha':       float(r[10]),
        } for r in rows]
        return Response(data)


class ParcelasView(APIView):
    permission_classes = []

    def get(self, request):
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT p.id, p.nombre, p.hectareas, p.variedad,
                       p.status, pr.nombre, pr.apellido_paterno
                FROM productores_parcela p
                JOIN productores_productor pr ON p.productor_id = pr.id
                LIMIT 20
            """)
            rows = cursor.fetchall()

        data = [{
            'id':       r[0],
            'nombre':   r[1],
            'hectareas': float(r[2]) if r[2] else 0,
            'variedad': r[3],
            'status':   r[4],
            'productor': f'{r[5]} {r[6]}'.strip(),
        } for r in rows]
        return Response(data)