from rest_framework import serializers
from .models import App

class App_serializer(serializers.ModelSerializer):
    class Meta:
        model=App
        fields="__all__"
class user_serializer(serializers.Serializer):
    username=serializers.CharField()
    email=serializers.EmailField()
    password=serializers.CharField(write_only=True)
