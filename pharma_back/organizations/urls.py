from django.urls import path

from . import views

app_name = 'organizations'

urlpatterns = [
    # Organization endpoints
    path('', views.OrganizationListView.as_view(), name='organization_list'),
    path('<int:pk>/', views.OrganizationDetailView.as_view(), name='organization_detail'),

    # Branch endpoints
    path('branches/', views.BranchListView.as_view(), name='branch_list'),
    path('branches/<int:pk>/', views.BranchDetailView.as_view(), name='branch_detail'),

    # Organization settings
    path('settings/', views.OrganizationSettingsView.as_view(), name='organization_settings'),

    # Utility endpoints
    path('stats/', views.get_organization_stats, name='organization_stats'),
    path('system-health/', views.get_system_health, name='system_health'),
    path('create-with-owner/', views.create_organization_with_owner, name='create_organization_with_owner'),
    path('create-default-branch/', views.create_default_branch, name='create_default_branch'),
    
    # Subscription endpoints
    path('subscription-plans/', views.SubscriptionPlanListView.as_view(), name='subscription_plans'),
    path('subscription-plans/<int:pk>/', views.SubscriptionPlanDetailView.as_view(), name='subscription_plan_detail'),
    path('subscription-plans/<int:plan_id>/toggle-status/', views.toggle_plan_status, name='toggle_plan_status'),
    path('subscriptions/', views.OrganizationSubscriptionListView.as_view(), name='subscriptions'),
    path('subscriptions/<int:pk>/', views.OrganizationSubscriptionDetailView.as_view(), name='subscription_detail'),
    path('subscription-stats/', views.subscription_stats, name='subscription_stats'),
    path('create-subscription/', views.create_subscription, name='create_subscription'),
    path('<int:organization_id>/update-plan/', views.update_organization_plan, name='update_organization_plan'),
    
    # Billing history endpoints
    path('<int:organization_id>/billing-history/', views.get_billing_history, name='billing_history'),
    path('billing-records/', views.BillingHistoryCreateView.as_view(), name='create_billing_record'),
    path('billing-records/<int:pk>/', views.BillingHistoryUpdateView.as_view(), name='update_billing_record'),
]