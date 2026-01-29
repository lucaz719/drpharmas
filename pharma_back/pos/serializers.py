from rest_framework import serializers
from .models import Sale, SaleItem, Prescription, PrescriptionItem, Payment, Return, ReturnItem
from patients.models import Patient
from inventory.models import Product, InventoryItem


class PatientSerializer(serializers.ModelSerializer):
    """Serializer for Patient model."""
    full_name = serializers.CharField(read_only=True)
    age = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Patient
        fields = [
            'id', 'patient_id', 'first_name', 'last_name', 'full_name',
            'date_of_birth', 'age', 'gender', 'phone', 'email', 'address',
            'city', 'state', 'postal_code', 'country', 'status'
        ]


class ProductSerializer(serializers.ModelSerializer):
    """Serializer for Product model."""
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'generic_name', 'brand_name', 'product_code',
            'strength', 'dosage_form', 'unit', 'cost_price', 'selling_price'
        ]


class SaleItemSerializer(serializers.ModelSerializer):
    """Serializer for SaleItem model."""
    product = ProductSerializer(read_only=True)
    line_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = SaleItem
        fields = [
            'id', 'product', 'quantity', 'unit_price', 'discount_percent',
            'discount_amount', 'batch_number', 'expiry_date', 'line_total',
            'allocated_batches', 'notes'
        ]


class SaleSerializer(serializers.ModelSerializer):
    """Serializer for Sale model."""
    patient = PatientSerializer(read_only=True)
    items = SaleItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    is_paid = serializers.BooleanField(read_only=True)
    outstanding_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Sale
        fields = [
            'id', 'sale_number', 'patient', 'patient_name', 'patient_age',
            'patient_phone', 'patient_gender', 'sale_date', 'sale_type',
            'status', 'subtotal', 'tax_amount', 'discount_amount', 'total_amount',
            'amount_paid', 'credit_amount', 'change_amount', 'payment_method',
            'transaction_id', 'items', 'total_items', 'is_paid', 'outstanding_amount',
            'notes', 'created_at', 'updated_at'
        ]


class SaleCreateSerializer(serializers.Serializer):
    """Serializer for creating sales."""
    patient_id = serializers.CharField(required=False, allow_blank=True)
    patient_name = serializers.CharField(required=False, allow_blank=True)
    patient_age = serializers.CharField(required=False, allow_blank=True)
    patient_phone = serializers.CharField(required=False, allow_blank=True)
    patient_gender = serializers.CharField(required=False, allow_blank=True)
    branch_id = serializers.IntegerField(required=False)
    
    items = serializers.ListField(
        child=serializers.DictField(),
        min_length=1
    )
    
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2)
    total = serializers.DecimalField(max_digits=12, decimal_places=2)
    discount_amount = serializers.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_amount = serializers.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_method = serializers.CharField(default='cash')
    paid_amount = serializers.DecimalField(max_digits=12, decimal_places=2, default=0)
    credit_amount = serializers.DecimalField(max_digits=10, decimal_places=2, default=0)
    transaction_id = serializers.CharField(required=False, allow_blank=True)


class PrescriptionItemSerializer(serializers.ModelSerializer):
    """Serializer for PrescriptionItem model."""
    product = ProductSerializer(read_only=True)
    remaining_quantity = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = PrescriptionItem
        fields = [
            'id', 'product', 'dosage', 'frequency', 'duration',
            'quantity_prescribed', 'quantity_dispensed', 'remaining_quantity',
            'is_dispensed', 'dispensed_date', 'instructions', 'pharmacist_notes'
        ]


class PrescriptionSerializer(serializers.ModelSerializer):
    """Serializer for Prescription model."""
    patient = PatientSerializer(read_only=True)
    items = PrescriptionItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    dispensed_items = serializers.IntegerField(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Prescription
        fields = [
            'id', 'prescription_number', 'patient', 'prescribed_by',
            'prescribed_date', 'expiry_date', 'status', 'diagnosis',
            'instructions', 'notes', 'items', 'total_items', 'dispensed_items',
            'is_expired', 'created_at', 'updated_at'
        ]


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payment model."""
    
    class Meta:
        model = Payment
        fields = [
            'id', 'amount', 'payment_method', 'payment_date',
            'reference_number', 'card_last_four', 'bank_name',
            'cheque_number', 'notes'
        ]


class ReturnItemSerializer(serializers.ModelSerializer):
    """Serializer for ReturnItem model."""
    product = ProductSerializer(read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    batch_number = serializers.CharField(source='original_sale_item.batch_number', read_only=True)
    line_refund = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = ReturnItem
        fields = [
            'id', 'product', 'product_name', 'quantity_returned', 'quantity_accepted',
            'unit_price', 'refund_amount', 'condition', 'line_refund', 'notes', 'batch_number'
        ]


class ReturnSerializer(serializers.ModelSerializer):
    """Serializer for Return model."""
    patient = PatientSerializer(read_only=True)
    original_sale = SaleSerializer(read_only=True)
    return_items = ReturnItemSerializer(source='items', many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = Return
        fields = [
            'id', 'return_number', 'original_sale', 'patient', 'patient_name', 'return_date',
            'reason', 'status', 'total_amount', 'refund_amount', 'return_items',
            'total_items', 'notes', 'internal_notes', 'created_at', 'updated_at', 'created_by_name'
        ]


class StockAllocationSerializer(serializers.Serializer):
    """Serializer for stock allocation requests."""
    medicine_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)
    branch_id = serializers.IntegerField(required=False)


class StockAllocationResponseSerializer(serializers.Serializer):
    """Serializer for stock allocation responses."""
    allocations = serializers.ListField(
        child=serializers.DictField()
    )
    total_allocated = serializers.IntegerField()
    medicine_id = serializers.IntegerField()