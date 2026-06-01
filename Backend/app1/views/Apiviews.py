from rest_framework.views import APIView
from ..authentication import ApiKeyAuthentication
import secrets
from django.contrib.auth.hashers import make_password,check_password
from ..serializer import App_serializer
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from ..models import Api_key,analytics
from datetime import timedelta
from django.db.models import Count
from django.utils import timezone
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated

# Create your views here.
class rotate_api(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes=[IsAuthenticated]
    def post(self,req):
        # Rotate End point
        prefix = req.data.get('prefix','').strip()
        
        
        if not prefix:
            return Response({'status': False, 'error': 'Prefix is required'}, status=400)
        try:
            api=Api_key.objects.get(prefix=prefix)
            api.status=False
            api.save()
            app_instance = api.app_name 
            app_name_str = api.app_name.app_name if hasattr(api.app_name, 'app_name') else str(api.app_name)
            newprefix=secrets.token_hex(4)
            newapi_key=newprefix+'.'+secrets.token_urlsafe(32)
            new_hashed_key=make_password(newapi_key)
            exp_time=timezone.now()+timedelta(days=1)
            Api_key.objects.create(app_name=app_instance,prefix=newprefix,api_key=new_hashed_key,  exp_date=exp_time,rate_limit=30)
            return Response({
                'status': True,
                'raw_key': newapi_key,
                'prefix': newprefix,
                'exp_date': exp_time,
                'app_name':app_name_str,
                'key_status': True
                })
        except Api_key.DoesNotExist:
            return Response({'status':False,'error':'Invalid Api Key'}, status=400  )
        



class generate_api(APIView):
    permission_classes=[IsAuthenticated]
    
    def post(self,req):
        data=req.data.copy()
        data['owner'] = req.user.username
        serializer=App_serializer(data=data)
        if serializer.is_valid():
            app=serializer.save()
            prefix=secrets.token_urlsafe(6)
            raw_key=prefix+'.'+secrets.token_urlsafe(32)
            hashed_key=make_password(raw_key)
            exp_time=timezone.now()+timedelta(days=2)
            obj=Api_key.objects.create(app_name=app,prefix=prefix,api_key=hashed_key,exp_date=exp_time,rate_limit=30)
            return Response({
                'status':True,
                'raw_key':raw_key,
                'prefix':prefix,
                'exp_date':exp_time,
                'app_name':obj.app_name.app_name,
                'key_status':obj.status
                })
        return Response(serializer.errors)


class analytics_view(APIView):
    permission_classes=[IsAuthenticated]
    authentication_classes=[ApiKeyAuthentication]
    def get(self,req):
        obj=req.auth
        today=timezone.now().date()
        q=analytics.objects
        total_req=q.filter(api_key=obj).count()
        req_per_day=q.filter(api_key=obj,time__date=today).values('path').annotate(total=Count('id'))
        top_endpoints=q.filter(api_key=obj).values('path').annotate(total=Count('id')).order_by('-total')
        failed_req=q.filter(api_key=obj,status_code__gte=401).values('path').annotate(total=Count('id'))
        return Response({
            'total_requests':total_req,
            'requests_per_day':list(req_per_day),
            'top_endpoints':list(top_endpoints),
            'failed_requests':list(failed_req)
        })

    
class revoke_view(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes=[IsAuthenticated]
    def post(self,req):
        prefix = req.data.get('prefix')
        
        if not prefix:
            return Response({'status': False, 'error': 'Prefix is required'}, status=400)
        try:
            api=Api_key.objects.get(prefix=prefix)
            api.status=False
            api.save()
        except Api_key.DoesNotExist:
            return Response({'status':False,'error':'Invalid Api Key'})
        return Response({
                'status': True,
                'message': 'Key revoked successfully',
                'prefix': api.prefix,
                'app_name': api.app_name.app_name,
                'exp_date': api.exp_date,
                'key_status': 'Revoked' 
            })


class protected_view(APIView):
    authentication_classes=[ApiKeyAuthentication]
    permission_classes=[IsAuthenticated]
    def get(self,req):
        return Response({'message':'Success'})
