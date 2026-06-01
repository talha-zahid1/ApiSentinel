from rest_framework.views import APIView
from rest_framework.response import Response
from ..serializer import user_serializer
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken



class register_view(APIView):
    permission_classes=[AllowAny]



    def get_tokens(self,user):
        refresh=RefreshToken.for_user(user)
        return{
            'access':str(refresh.access_token),
            'refresh':str(refresh)
        }

    def post(self,req):
        
        serializer=user_serializer(data=req.data)
        if serializer.is_valid():
            data=serializer.validated_data
            if User.objects.filter(username=data['username']).exists():
                return Response({
                    'status':False,
                    'message':'Username Already Taken'
                },status=400)
            if User.objects.filter(email=data['email']).exists():
                return Response({
                    'status':False,
                    'message':'email Already Taken'
                },status=400)
            user=User.objects.create_user(username=data['username'],email=data['email'],password=data['password'])
            tokens=self.get_tokens(user=user)
            return Response({
                'username':data['username'],
                'email':data['email'],
                'tokens':tokens
            })
        return Response(serializer.errors)