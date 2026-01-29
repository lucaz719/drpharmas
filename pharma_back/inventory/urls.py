from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views.customer_views import collect_customer_payment
from .views.rack_views import (
    rack_list_create, rack_detail, rack_sections,
    assign_medicine_to_section, remove_medicine_from_section
)

app_name = 'inventory'

# Create router for ViewSets
router = DefaultRouter()
router.register(r'products', views.ProductViewSet, basename='products')

urlpatterns = [
    # Custom product endpoints (before router to avoid conflicts)
    path('products/purchase-order/', views.products_for_purchase_order, name='products_for_purchase_order'),
    
    # Include router URLs
    path('', include(router.urls)),

    # Medication list specific endpoints
    path('medications/', views.ProductViewSet.as_view({'get': 'list'}), name='medication_list'),
    path('medications/stats/', views.ProductViewSet.as_view({'get': 'stats'}), name='medication_stats'),
    path('medications/bulk-upload/', views.ProductViewSet.as_view({'post': 'bulk_upload'}), name='bulk_upload'),
    
    # Categories and Manufacturers
    path('categories/', views.categories_list, name='categories_list'),
    path('manufacturers/', views.manufacturers_list, name='manufacturers_list'),


    
    # Stock deallocation
    path('deallocate-stock/', views.deallocate_stock, name='deallocate_stock'),

    # Test endpoint
    path('test/', views.test_api, name='test_api'),
    path('debug/suppliers/', views.debug_suppliers, name='debug_suppliers'),
    path('debug/payment-calculation/', views.test_payment_calculation, name='test_payment_calculation'),
    
    # Search endpoints
    path('suppliers/search/', views.supplier_search, name='supplier_search'),
    path('medicines/search/', views.medicine_search, name='medicine_search'),
    
    # Inventory management
    path('inventory/create/', views.create_inventory_item, name='create_inventory_item'),
    path('inventory/bulk-upload/', views.bulk_upload_inventory, name='bulk_upload_inventory'),
    path('inventory/download-template/', views.download_inventory_template, name='download_inventory_template'),
    path('inventory-items/', views.inventory_items_list, name='inventory_items_list'),
    path('inventory-items/<int:item_id>/', views.update_inventory_item, name='update_inventory_item'),
    path('restock/', views.restock_item, name='restock_item'),
    path('allocate-stock/', views.allocate_stock_fifo, name='allocate_stock_fifo'),
    path('purchase-history/', views.purchase_history, name='purchase_history'),
    
    # Bulk Order endpoints
    path('bulk-orders/', views.bulk_orders_list, name='bulk_orders_list'),
    path('bulk-orders/<int:order_id>/', views.bulk_order_detail, name='bulk_order_detail'),
    path('bulk-orders/<int:order_id>/status/', views.bulk_order_status_update, name='bulk_order_status_update'),
    path('bulk-orders/<int:order_id>/payment/', views.bulk_order_payment, name='bulk_order_payment'),

    path('bulk-orders/stats/', views.bulk_order_stats, name='bulk_order_stats'),
    
    # Supplier Order Management
    path('supplier/orders/', views.bulk_orders_list, name='supplier_orders_list'),
    path('supplier/orders/<int:order_id>/update/', views.update_supplier_order, name='update_supplier_order'),
    
    # Enhanced Purchase Order Workflow
    path('purchase-orders/manage/', views.purchase_orders_manage, name='purchase_orders_manage'),
    path('purchase-orders/<int:order_id>/adjust/', views.purchase_order_buyer_adjust, name='purchase_order_buyer_adjust'),
    path('purchase-orders/<int:order_id>/reconfirm/', views.purchase_order_reconfirm, name='purchase_order_reconfirm'),
    path('purchase-orders/<int:order_id>/proceed/', views.purchase_order_proceed, name='purchase_order_proceed'),
    path('purchase-orders/<int:order_id>/payment/', views.purchase_order_payment, name='purchase_order_payment'),
    path('purchase-orders/<int:order_id>/ship/', views.purchase_order_ship, name='purchase_order_ship'),
    path('purchase-orders/<int:order_id>/deliver/', views.purchase_order_deliver, name='purchase_order_deliver'),
    path('purchase-orders/<int:order_id>/release-stock/', views.purchase_order_release_stock, name='purchase_order_release_stock'),
    path('purchase-orders/<int:order_id>/import-preview/', views.purchase_order_import_preview, name='purchase_order_import_preview'),
    path('purchase-orders/<int:order_id>/import-stock/', views.purchase_order_import_stock, name='purchase_order_import_stock'),
    path('purchase-orders/<int:order_id>/actions/', views.purchase_order_actions, name='purchase_order_actions'),
    path('supplier/inventory-prices/', views.get_supplier_inventory_prices, name='get_supplier_inventory_prices'),
    
    # Supplier management
    path('suppliers/<int:supplier_id>/', views.supplier_detail, name='supplier_detail_short'),
    path('suppliers/detail/<int:supplier_id>/', views.supplier_detail, name='supplier_detail'),
    path('suppliers/<int:supplier_id>/transactions/', views.supplier_ledger_detail, name='supplier_transactions'),
    path('suppliers/<str:supplier_id>/transactions/', views.supplier_ledger_detail, name='supplier_transactions_str'),
    path('suppliers/<str:supplier_name>/transactions/', views.supplier_transactions_by_name, name='supplier_transactions_by_name'),
    
    # Custom Supplier Management
    path('custom-suppliers/', views.list_custom_suppliers, name='list_custom_suppliers'),
    path('custom-suppliers/create/', views.create_custom_supplier, name='create_custom_supplier'),
    path('custom-suppliers/<int:supplier_id>/', views.update_custom_supplier, name='update_custom_supplier'),
    
    # Unified Supplier Ledger
    path('suppliers/<int:supplier_id>/ledger/', views.supplier_ledger_detail, name='supplier_ledger_detail'),
    path('supplier-ledger/summary/', views.supplier_ledger_summary, name='supplier_ledger_summary'),
    path('supplier-ledger/detail/', views.supplier_ledger_detail_by_name, name='supplier_ledger_detail_by_name'),
    path('supplier-ledger/suppliers/', views.supplier_ledger_suppliers, name='supplier_ledger_suppliers'),
    path('transaction-details/', views.get_transaction_details, name='get_transaction_details'),

    path('supplier-payment/', views.record_supplier_payment, name='record_supplier_payment'),

    # Rack Management
    path('racks/', rack_list_create, name='rack_list_create'),
    path('racks/<int:rack_id>/', rack_detail, name='rack_detail'),
    path('racks/<int:rack_id>/sections/', rack_sections, name='rack_sections'),
    path('rack-sections/<int:section_id>/assign-medicine/', assign_medicine_to_section, name='assign_medicine_to_section'),
    path('rack-sections/<int:section_id>/remove-medicine/', remove_medicine_from_section, name='remove_medicine_from_section'),

    # Customer management
    path('customers/<str:customer_id>/details/', views.get_customer_details, name='get_customer_details'),
    path('customers/<str:customer_id>/transactions/', views.customer_transactions, name='customer_transactions'),
    path('customers/<str:customer_id>/collect-payment/', views.collect_customer_payment, name='collect_customer_payment'),
    path('customers/', views.customer_list, name='customer_list'),
    
    # Supplier Dashboard
    path('supplier/dashboard/stats/', views.supplier_dashboard_stats, name='supplier_dashboard_stats'),
    path('supplier/dashboard/recent-orders/', views.supplier_recent_orders, name='supplier_recent_orders'),
    path('supplier/dashboard/orders-over-time/', views.supplier_orders_over_time, name='supplier_orders_over_time'),
    path('supplier/dashboard/customers-chart/', views.supplier_customers_chart, name='supplier_customers_chart'),
    path('supplier/dashboard/top-products/', views.supplier_top_products, name='supplier_top_products'),
]