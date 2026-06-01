from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models import Api_key
from django.contrib.auth.hashers import check_password
from django.utils import timezone


class ApiKeyAuthentication(BaseAuthentication):
    def authenticate(self,req):
        
        api_key=req.META.get('HTTP_X_API_KEY')
        if not api_key or  '.' not in  api_key:
            return None
        prefix=api_key.split('.')[0]
        try:
            match=Api_key.objects.get(prefix=prefix)
        except Api_key.DoesNotExist:
            raise AuthenticationFailed('Invalid Api key')
        if not check_password(api_key,match.api_key):
            raise AuthenticationFailed("Invalid API key")
        
        if  not (match.status and match.exp_date>timezone.now()):
            raise AuthenticationFailed('Api key expired or invalid')
        return (match.app_name,match)
