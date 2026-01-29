from django.contrib import admin
from .models import ExpenseCategory, Expense, InventoryLoss

@admin.register(ExpenseCategory)
class ExpenseCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'organization', 'budget', 'is_active', 'created_at']
    list_filter = ['is_active', 'organization', 'created_at']
    search_fields = ['name', 'description']

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ['category', 'amount', 'pharmacy', 'organization', 'created_at']
    list_filter = ['category', 'pharmacy', 'organization', 'created_at']
    search_fields = ['description', 'category__name']

@admin.register(InventoryLoss)
class InventoryLossAdmin(admin.ModelAdmin):
    list_display = ['item_name', 'quantity', 'total_loss', 'reason', 'pharmacy', 'created_at']
    list_filter = ['reason', 'pharmacy', 'organization', 'created_at']
    search_fields = ['item_name', 'batch_no']