from django.urls import path
from . import views
from .stats_views import user_stats

urlpatterns = [
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('profile/', views.user_profile, name='user_profile'),
    path('users/', views.users_list, name='users_list'),
    path('users/<int:user_id>/', views.user_detail, name='user_detail'),
    path('users/<int:user_id>/change-password/', views.change_user_password, name='change_user_password'),
    path('users/<int:user_id>/module-permissions/', views.get_user_module_permissions, name='get_user_module_permissions'),
    path('users/<int:user_id>/update-permissions/', views.update_user_permissions, name='update_user_permissions'),
    path('modules/', views.get_available_modules, name='get_available_modules'),
    path('stats/', user_stats, name='user_stats'),
    path('activities/', views.get_user_activities, name='get_user_activities'),
]