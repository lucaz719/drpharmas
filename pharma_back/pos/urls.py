from django.urls import path
from . import views
from . import reports_views
from .manager_dashboard_views import *

app_name = 'pos'

urlpatterns = [
    # Stock allocation and validation
    path('allocate-stock/', views.allocate_stock, name='allocate_stock'),
    path('validate-stock/', views.validate_stock_before_sale, name='validate_stock'),
    
    # Sales management
    path('sales/', views.get_sales, name='get_sales'),
    path('sales/create/', views.create_sale, name='create_sale'),
    path('sales/save-pending/', views.save_pending_bill, name='save_pending_bill'),
    path('sales/<int:sale_id>/update-pending/', views.update_pending_bill, name='update_pending_bill'),
    path('sales/complete/', views.complete_sale, name='complete_sale'),
    path('sales/pending/', views.get_pending_bills, name='get_pending_bills'),
    path('sales/<str:sale_id>/', views.get_sale_detail, name='sale_detail'),
    path('sales/<str:sale_id>/delete/', views.delete_sale, name='delete_sale'),
    path('sales/<str:sale_id>/receipt/', views.generate_receipt, name='generate_receipt'),
    path('sales/<str:sale_id>/pay-credit/', views.process_credit_payment, name='process_credit_payment'),

    # Returns management
    path('returns/', views.get_returns, name='get_returns'),
    path('returns/create/', views.create_return, name='create_return'),
    path('returns/<str:return_id>/', views.get_return_detail, name='return_detail'),
    path('returns/<str:return_id>/approve/', views.approve_return, name='approve_return'),
    path('returns/<str:return_id>/process/', views.process_return, name='process_return'),
    path('returns/<str:return_id>/reject/', views.reject_return, name='reject_return'),
    
    # Statistics
    path('stats/', views.pos_stats, name='pos_stats'),

    # Pharmacy Dashboard APIs
    path('dashboard/stats/', views.pharmacy_dashboard_stats, name='pharmacy_dashboard_stats'),
    path('dashboard/sales-chart/', views.pharmacy_sales_chart, name='pharmacy_sales_chart'),
    path('dashboard/stock-categories/', views.pharmacy_stock_categories, name='pharmacy_stock_categories'),
    path('dashboard/recent-activities/', views.pharmacy_recent_activities, name='pharmacy_recent_activities'),
    path('dashboard/staff-performance/', views.pharmacy_staff_performance, name='pharmacy_staff_performance'),
    path('organization/branches/', views.get_organization_branches, name='get_organization_branches'),
    path('search/', views.global_search, name='global_search'),
    path('medicine/<int:product_id>/sales-history/', views.get_medicine_sales_history, name='medicine_sales_history'),

    # Patient APIs
    path('credit-history/', views.patient_credit_history, name='patient_credit_history'),
    
    # Settings
    path('settings/', views.pos_settings, name='pos_settings'),
    
    # Manager Dashboard APIs
    path('manager/dashboard/stats/', views.manager_dashboard_stats, name='manager_dashboard_stats'),
    path('manager/dashboard/sales-over-time/', views.manager_sales_over_time, name='manager_sales_over_time'),
    path('manager/dashboard/payment-methods/', views.manager_payment_methods_chart, name='manager_payment_methods_chart'),
    path('manager/dashboard/top-products/', views.manager_top_products, name='manager_top_products'),
    path('manager/dashboard/recent-activities/', views.manager_recent_activities, name='manager_recent_activities'),
    path('manager/dashboard/staff-performance/', views.manager_staff_performance, name='manager_staff_performance'),
    
    # Reports endpoints
    path('reports/sales-summary/', reports_views.sales_summary, name='sales_summary'),
    path('reports/daily-trend/', reports_views.daily_sales_trend, name='daily_sales_trend'),
    path('reports/hourly-pattern/', reports_views.hourly_sales_pattern, name='hourly_sales_pattern'),
    path('reports/top-products/', reports_views.top_selling_products, name='top_selling_products'),
    path('reports/payment-methods/', reports_views.payment_methods_report, name='payment_methods_report'),
    path('reports/staff-performance/', reports_views.staff_performance_report, name='staff_performance_report'),
    path('reports/customer-analytics/', reports_views.customer_analytics, name='customer_analytics'),
    path('reports/export/', reports_views.export_sales_report, name='export_sales_report'),
]