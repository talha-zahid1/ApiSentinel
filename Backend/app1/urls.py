from rest_framework.urls import path
from .views import Apiviews as av
from .views import authviews as uv
from rest_framework_simplejwt.views import (TokenObtainPairView,TokenRefreshView)

urlpatterns=[
    path('api/token/',TokenObtainPairView.as_view()),
    path('api/token/refresh/',TokenRefreshView.as_view()),
    path('register/',uv.register_view.as_view()),
    path('get_api_key/',av.generate_api.as_view()),
    path('rotate_api_key/',av.rotate_api.as_view()),
    path('revoke_api_key/',av.revoke_view.as_view()),
    path('analytics/',av.analytics_view.as_view()),
    path('protected/',av.protected_view.as_view()),
]