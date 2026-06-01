from .models import Api_key,analytics
from django.utils import timezone
from datetime import timedelta
from django.http import JsonResponse

class Middleware:
    def __init__(self,getresponse):
        self.getresponse=getresponse
    def __call__(self,req, *args, **kwds):
        public_routes=[
            '/ApiSentinel/register/',
            '/ApiSentinel/api/token/',
            '/ApiSentinel/api/token/refresh/',
            '/ApiSentinel/get_api_key/',
            '/ApiSentinel/rotate_api_key/', 
            '/ApiSentinel/revoke_api_key/',
        ]
        if req.path in public_routes:
            return self.getresponse(req)
        api_key=req.META.get('HTTP_X_API_KEY')
        if not api_key or '.' not in api_key:
            return JsonResponse({'status':False,'error':'Invalid Api Key'})
        prefix=api_key.split('.')[0]
        try:
            obj=Api_key.objects.get(prefix=prefix)
        except  Api_key.DoesNotExist:
            return JsonResponse({
                'status':False,
                'error':'Invalid Api key'
            })
        rate=int(obj.rate_limit)
        count=analytics.objects.filter(api_key=obj,time__gte=timezone.now()-timedelta(minutes=1)).count()
        if count>=rate:
            return JsonResponse({
                'status':False,
                'error':'Rate Limit Exceeded'
            })
        resp=self.getresponse(req)
        # Now Create analytics from here
        sc=resp.status_code
        ip=req.META.get('HTTP_X_FORWARDED_FOR') or req.META.get('REMOTE_ADDR')
        path=req.path
        method=req.method
        analytics.objects.create(api_key=obj,status_code=sc,ip=ip,path=path,method=method)
        return resp

        