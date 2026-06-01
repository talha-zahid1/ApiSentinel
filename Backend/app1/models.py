from django.db import models

# Create your models here.
class App(models.Model):
    app_name=models.CharField(max_length=50)
    owner=models.CharField(max_length=50)
    created_date=models.DateTimeField(auto_now_add=True)
    @property
    def is_authenticated(self):
        return True
class Api_key(models.Model):
    api_id=models.AutoField(primary_key=True)
    app_name=models.ForeignKey(App,on_delete=models.CASCADE)
    prefix=models.CharField(max_length=20)
    api_key=models.CharField(max_length=500,unique=True)
    created_date=models.DateTimeField(auto_now_add=True)
    exp_date=models.DateTimeField()
    status=models.BooleanField(default=True)
    rate_limit=models.IntegerField()
class analytics(models.Model):
    api_key=models.ForeignKey(Api_key,on_delete=models.CASCADE)
    status_code=models.IntegerField()
    ip=models.CharField(max_length=100)
    path=models.CharField(max_length=400)
    method=models.CharField(max_length=50)
    time=models.DateTimeField(auto_now_add=True)