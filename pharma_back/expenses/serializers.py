from rest_framework import serializers
from .models import ExpenseCategory, Expense, InventoryLoss

class ExpenseCategorySerializer(serializers.ModelSerializer):
    spent = serializers.ReadOnlyField()
    transactions = serializers.ReadOnlyField()
    remaining = serializers.ReadOnlyField()

    class Meta:
        model = ExpenseCategory
        fields = ['id', 'name', 'description', 'budget', 'color', 'is_active', 
                 'spent', 'transactions', 'remaining', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class ExpenseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Expense
        fields = ['id', 'category', 'category_name', 'amount', 'description', 
                 'receipt', 'pharmacy', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class InventoryLossSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryLoss
        fields = ['id', 'item_name', 'batch_no', 'quantity', 'unit_cost', 
                 'total_loss', 'reason', 'pharmacy', 'created_at', 'updated_at']
        read_only_fields = ['id', 'total_loss', 'created_at', 'updated_at']