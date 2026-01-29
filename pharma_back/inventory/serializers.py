from rest_framework import serializers
from .models import (
    Category, Manufacturer, Product, StockEntry, CustomSupplier,
    Supplier, PurchaseOrder, PurchaseOrderItem, InventoryItem,
    PurchaseTransaction, PurchaseItem, PaymentRecord,
    BulkOrder, BulkOrderItem, BulkOrderStatusLog, BulkOrderPayment,
    SupplierLedger, Rack, RackSection, RackSectionAssignment
)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ManufacturerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Manufacturer
        fields = '__all__'


class ProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'name', 'generic_name', 'brand_name', 'product_code', 'barcode',
            'description', 'category', 'manufacturer', 'dosage_form', 'strength',
            'pack_size', 'unit', 'is_controlled', 'requires_prescription',
            'license_required', 'batch_number', 'expiry_date', 'cost_price',
            'selling_price', 'mrp', 'min_stock_level', 'max_stock_level',
            'reorder_point', 'status', 'is_active', 'image', 'document'
        ]


class ProductUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'name', 'generic_name', 'brand_name', 'product_code', 'barcode',
            'description', 'category', 'manufacturer', 'dosage_form', 'strength',
            'pack_size', 'unit', 'is_controlled', 'requires_prescription',
            'license_required', 'batch_number', 'expiry_date', 'cost_price',
            'selling_price', 'mrp', 'min_stock_level', 'max_stock_level',
            'reorder_point', 'status', 'is_active', 'image', 'document'
        ]


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    manufacturer_name = serializers.CharField(source='manufacturer.name', read_only=True)

    class Meta:
        model = Product
        fields = '__all__'


class MedicationListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    manufacturer_name = serializers.CharField(source='manufacturer.name', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'generic_name', 'brand_name', 'product_code',
            'dosage_form', 'strength', 'pack_size', 'unit', 'cost_price',
            'selling_price', 'requires_prescription', 'is_controlled',
            'status', 'category_name', 'manufacturer_name'
        ]


class BulkMedicationUploadSerializer(serializers.Serializer):
    file = serializers.FileField()


class BulkInventoryUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    supplier_name = serializers.CharField(max_length=255)
    supplier_contact = serializers.CharField(max_length=255, required=False, allow_blank=True)
    supplier_id = serializers.IntegerField(required=False, allow_null=True)
    supplier_type = serializers.CharField(max_length=50, default='custom')
    payment_method = serializers.CharField(max_length=50, default='cash')
    payment_date = serializers.DateField(required=False)
    paid_amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    notes = serializers.CharField(max_length=500, required=False, allow_blank=True)


class MedicationStatsSerializer(serializers.Serializer):
    total_medications = serializers.IntegerField()
    active_medications = serializers.IntegerField()
    prescription_medications = serializers.IntegerField()
    controlled_medications = serializers.IntegerField()
    insured_medications = serializers.IntegerField()
    categories_count = serializers.IntegerField()
    manufacturers_count = serializers.IntegerField()


class StockEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = StockEntry
        fields = '__all__'


class CustomSupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomSupplier
        fields = '__all__'


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'


class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = PurchaseOrderItem
        fields = '__all__'


class PurchaseOrderSerializer(serializers.ModelSerializer):
    items = PurchaseOrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = '__all__'


class InventoryItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    supplier_name = serializers.CharField(source='supplier_name', read_only=True)

    class Meta:
        model = InventoryItem
        fields = '__all__'


class PurchaseItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = PurchaseItem
        fields = '__all__'


class PurchaseTransactionSerializer(serializers.ModelSerializer):
    items = PurchaseItemSerializer(many=True, read_only=True)

    class Meta:
        model = PurchaseTransaction
        fields = '__all__'


class PaymentRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentRecord
        fields = '__all__'


class BulkOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = BulkOrderItem
        fields = '__all__'


class BulkOrderSerializer(serializers.ModelSerializer):
    items = BulkOrderItemSerializer(many=True, read_only=True)
    buyer_organization_name = serializers.CharField(source='buyer_organization.name', read_only=True)
    buyer_branch_name = serializers.CharField(source='buyer_branch.name', read_only=True)
    supplier_organization_name = serializers.CharField(source='supplier_organization.name', read_only=True)

    class Meta:
        model = BulkOrder
        fields = '__all__'


class BulkOrderStatusLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = BulkOrderStatusLog
        fields = '__all__'


class BulkOrderCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BulkOrder
        fields = [
            'buyer_organization', 'buyer_branch', 'supplier_organization',
            'supplier_user', 'expected_delivery_date', 'buyer_notes'
        ]


class BulkOrderSupplierUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BulkOrder
        fields = ['supplier_notes']


class BulkOrderBuyerUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BulkOrder
        fields = ['buyer_reconfirm_notes']


class BulkOrderShippingUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BulkOrder
        fields = ['shipping_method', 'tracking_number', 'shipping_notes']


class BulkOrderPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = BulkOrderPayment
        fields = '__all__'


class SupplierLedgerSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupplierLedger
        fields = '__all__'


class RackSectionSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source='medicine.name', read_only=True)
    medicine_generic_name = serializers.CharField(source='medicine.generic_name', read_only=True)
    medicine_brand_name = serializers.CharField(source='medicine.brand_name', read_only=True)
    medicine_strength = serializers.CharField(source='medicine.strength', read_only=True)
    medicine_dosage_form = serializers.CharField(source='medicine.dosage_form', read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    days_to_expiry = serializers.IntegerField(read_only=True)

    class Meta:
        model = RackSection
        fields = '__all__'


class RackSerializer(serializers.ModelSerializer):
    sections = RackSectionSerializer(many=True, read_only=True)

    class Meta:
        model = Rack
        fields = '__all__'


class RackSectionAssignmentSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source='medicine.name', read_only=True)
    rack_section_name = serializers.CharField(source='rack_section.section_name', read_only=True)
    assigned_by_name = serializers.CharField(source='assigned_by.get_full_name', read_only=True)

    class Meta:
        model = RackSectionAssignment
        fields = '__all__'