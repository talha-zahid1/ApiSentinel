from django.contrib import admin
from .models import App,Api_key,analytics
# Register your models here.
admin.site.register(analytics)
admin.site.register(App)
admin.site.register(Api_key)