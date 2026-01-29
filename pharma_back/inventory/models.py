from decimal import Decimal

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils.translation import gettext_lazy as _

from organizations.models import Branch, Organization


class Category(models.Model):
    """Product categories for inventory organization."""

    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="subcategories",
    )
    is_active = models.BooleanField(default=True)

    # Organization relationship for multi-tenancy
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="categories"
    )

    # Audit fields
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_categories",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        unique_together = ["organization", "name"]

    def __str__(self):
        return self.name

    @property
    def full_name(self):
        """Get full category path."""
        if self.parent:
            return f"{self.parent.full_name} > {self.name}"
        return self.name


class Manufacturer(models.Model):
    """Product manufacturers/suppliers."""

    name = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=15, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    website = models.URLField(blank=True)
    license_number = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)

    # Organization relationship
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="manufacturers"
    )

    # Audit fields
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_manufacturers",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Manufacturer"
        verbose_name_plural = "Manufacturers"
        unique_together = ["organization", "name"]

    def __str__(self):
        return self.name


class Product(models.Model):
    """Main product model for pharmacy inventory."""

    # Dosage Forms
    TABLET = "tablet"
    CAPSULE = "capsule"
    SYRUP = "syrup"
    INJECTION = "injection"
    CREAM = "cream"
    DROPS = "drops"
    POWDER = "powder"
    GEL = "gel"
    SPRAY = "spray"
    OTHER = "other"

    DOSAGE_FORM_CHOICES = [
        (TABLET, "Tablet"),
        (CAPSULE, "Capsule"),
        (SYRUP, "Syrup"),
        (INJECTION, "Injection"),
        (CREAM, "Cream/Ointment"),
        (DROPS, "Eye/Ear Drops"),
        (POWDER, "Powder"),
        (GEL, "Gel"),
        (SPRAY, "Spray"),
        (OTHER, "Other"),
    ]

    # Product Status
    ACTIVE = "active"
    INACTIVE = "inactive"
    DISCONTINUED = "discontinued"

    STATUS_CHOICES = [
        (ACTIVE, "Active"),
        (INACTIVE, "Inactive"),
        (DISCONTINUED, "Discontinued"),
    ]

    # Basic Information
    name = models.CharField(max_length=200)
    generic_name = models.CharField(max_length=200, blank=True)
    brand_name = models.CharField(max_length=200, blank=True)
    product_code = models.CharField(max_length=50)
    barcode = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)

    # Classification
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products",
    )
    manufacturer = models.ForeignKey(
        Manufacturer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products",
    )

    # Product Details
    dosage_form = models.CharField(max_length=20, choices=DOSAGE_FORM_CHOICES, default=TABLET)
    strength = models.CharField(max_length=100, blank=True)
    pack_size = models.CharField(max_length=100, blank=True)
    unit = models.CharField(max_length=50, default="pieces")

    # Regulatory Information
    is_controlled = models.BooleanField(default=False)
    requires_prescription = models.BooleanField(default=False)
    license_required = models.BooleanField(default=False)
    batch_number = models.CharField(max_length=50, blank=True)
    expiry_date = models.DateField(null=True, blank=True)

    # Pricing
    cost_price = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(0)]
    )
    selling_price = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(0)]
    )
    mrp = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
    )

    # Stock Management
    min_stock_level = models.PositiveIntegerField(default=10)
    max_stock_level = models.PositiveIntegerField(default=1000)
    reorder_point = models.PositiveIntegerField(default=20)

    # Status
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default=ACTIVE)
    is_active = models.BooleanField(default=True)

    # Organization relationship
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="products"
    )

    # Images and Documents
    image = models.ImageField(upload_to="products/", null=True, blank=True)
    document = models.FileField(upload_to="product_docs/", null=True, blank=True)

    # Audit fields
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_products",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Product"
        verbose_name_plural = "Products"
        unique_together = ["organization", "product_code"]

    def __str__(self):
        return f"{self.name} ({self.product_code})"

    @property
    def profit_margin(self):
        """Calculate profit margin percentage."""
        if self.cost_price and self.cost_price > 0:
            return ((self.selling_price - self.cost_price) / self.cost_price) * 100
        return 0

    @property
    def total_stock(self):
        """Get total stock across all branches."""
        return sum(stock.quantity for stock in self.stock_entries.all())

    @property
    def is_low_stock(self):
        """Check if product is low on stock."""
        return self.total_stock <= self.min_stock_level

    @property
    def is_expired(self):
        """Check if product is expired."""
        if self.expiry_date:
            from datetime import date

            return self.expiry_date < date.today()
        return False

    @property
    def days_to_expiry(self):
        """Get days until expiry."""
        if self.expiry_date:
            from datetime import date

            return (self.expiry_date - date.today()).days
        return None


class StockEntry(models.Model):
    """Stock entries for products in different branches."""

    # Entry Types
    PURCHASE = "purchase"
    SALE = "sale"
    ADJUSTMENT = "adjustment"
    TRANSFER_IN = "transfer_in"
    TRANSFER_OUT = "transfer_out"
    RETURN = "return"
    DAMAGE = "damage"
    EXPIRY = "expiry"

    ENTRY_TYPE_CHOICES = [
        (PURCHASE, "Purchase"),
        (SALE, "Sale"),
        (ADJUSTMENT, "Stock Adjustment"),
        (TRANSFER_IN, "Transfer In"),
        (TRANSFER_OUT, "Transfer Out"),
        (RETURN, "Return"),
        (DAMAGE, "Damage"),
        (EXPIRY, "Expiry"),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="stock_entries")
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name="stock_entries")

    # Stock Information
    quantity = models.IntegerField()
    previous_quantity = models.IntegerField(default=0)
    current_quantity = models.IntegerField()

    # Transaction Details
    entry_type = models.CharField(max_length=15, choices=ENTRY_TYPE_CHOICES)
    reference_number = models.CharField(max_length=50, blank=True)
    batch_number = models.CharField(max_length=50, blank=True)
    expiry_date = models.DateField(null=True, blank=True)

    # Pricing
    unit_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
    )
    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
    )

    # Notes and Comments
    notes = models.TextField(blank=True)

    # Audit fields
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_stock_entries",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Stock Entry"
        verbose_name_plural = "Stock Entries"
        indexes = [
            models.Index(fields=["product", "branch", "created_at"]),
            models.Index(fields=["entry_type", "created_at"]),
        ]

    def __str__(self):
        return f"{self.product.name} - {self.entry_type} - {self.quantity}"

    @property
    def total_value(self):
        """Calculate total value of this entry."""
        if self.unit_cost and self.quantity:
            return self.unit_cost * abs(self.quantity)
        return 0


class CustomSupplier(models.Model):
    """Custom supplier model for non-user suppliers."""

    name = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=15, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    # Organization relationship
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="custom_suppliers"
    )

    # Audit fields
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_custom_suppliers",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Custom Supplier"
        verbose_name_plural = "Custom Suppliers"
        unique_together = ["organization", "name"]

    def __str__(self):
        return self.name


class Supplier(models.Model):
    """Supplier model for pharmacy suppliers."""

    # Supplier Types
    PHARMACEUTICAL = "pharmaceutical"
    MEDICAL = "medical"
    GENERAL = "general"
    WHOLESALER = "wholesaler"

    SUPPLIER_TYPE_CHOICES = [
        (PHARMACEUTICAL, "Pharmaceutical"),
        (MEDICAL, "Medical Equipment"),
        (GENERAL, "General Supplier"),
        (WHOLESALER, "Wholesaler"),
    ]

    # Status
    ACTIVE = "active"
    INACTIVE = "inactive"
    BLACKLISTED = "blacklisted"

    STATUS_CHOICES = [
        (ACTIVE, "Active"),
        (INACTIVE, "Inactive"),
        (BLACKLISTED, "Blacklisted"),
    ]

    # Basic Information
    name = models.CharField(max_length=200)
    supplier_code = models.CharField(max_length=20)
    type = models.CharField(max_length=20, choices=SUPPLIER_TYPE_CHOICES, default=PHARMACEUTICAL)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default=ACTIVE)

    # Contact Information
    contact_person = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    email = models.EmailField()
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100, default="Nepal")

    # Business Information
    license_number = models.CharField(max_length=50, blank=True)
    tax_id = models.CharField(max_length=50, blank=True)
    registration_number = models.CharField(max_length=50, blank=True)

    # Payment Terms
    payment_terms = models.CharField(max_length=100, default="Net 30")
    credit_limit = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal(0),
        validators=[MinValueValidator(0)],
    )

    # Performance Metrics
    on_time_delivery_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal(95),
        validators=[MinValueValidator(0)],
    )
    quality_rating = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        default=Decimal(4.5),
        validators=[MinValueValidator(0), MaxValueValidator(5)],
    )

    # Organization relationship
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="suppliers"
    )

    # Audit fields
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_suppliers",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Supplier"
        verbose_name_plural = "Suppliers"
        unique_together = ["organization", "supplier_code"]

    def __str__(self):
        return self.name

    @property
    def total_orders(self):
        """Get total number of orders from this supplier."""
        return self.purchase_orders.count()

    @property
    def total_value(self):
        """Get total value of orders from this supplier."""
        return sum(order.total_value for order in self.purchase_orders.all())


class PurchaseOrder(models.Model):
    """Purchase orders from suppliers."""

    # Status
    DRAFT = "draft"
    PENDING = "pending"
    APPROVED = "approved"
    ORDERED = "ordered"
    PARTIALLY_RECEIVED = "partially_received"
    RECEIVED = "received"
    CANCELLED = "cancelled"

    STATUS_CHOICES = [
        (DRAFT, "Draft"),
        (PENDING, "Pending Approval"),
        (APPROVED, "Approved"),
        (ORDERED, "Ordered"),
        (PARTIALLY_RECEIVED, "Partially Received"),
        (RECEIVED, "Received"),
        (CANCELLED, "Cancelled"),
    ]

    # Basic Information
    order_number = models.CharField(max_length=50)
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name="purchase_orders")
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name="purchase_orders")

    # Order Details
    order_date = models.DateField(auto_now_add=True)
    expected_delivery_date = models.DateField(null=True, blank=True)
    actual_delivery_date = models.DateField(null=True, blank=True)

    # Status and Priority
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=DRAFT)
    priority = models.CharField(
        max_length=10,
        choices=[("low", "Low"), ("medium", "Medium"), ("high", "High")],
        default="medium",
    )

    # Financial Information
    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal(0),
        validators=[MinValueValidator(0)],
    )
    tax_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal(0),
        validators=[MinValueValidator(0)],
    )
    discount_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal(0),
        validators=[MinValueValidator(0)],
    )
    shipping_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal(0),
        validators=[MinValueValidator(0)],
    )
    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal(0),
        validators=[MinValueValidator(0)],
    )

    # Notes
    notes = models.TextField(blank=True)
    internal_notes = models.TextField(blank=True)

    # Audit fields
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_purchase_orders",
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_purchase_orders",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Purchase Order"
        verbose_name_plural = "Purchase Orders"
        unique_together = ["supplier", "order_number"]

    def __str__(self):
        return f"PO-{self.order_number} - {self.supplier.name}"

    @property
    def total_items(self):
        """Get total number of items in the order."""
        return self.items.count()

    @property
    def received_items(self):
        """Get number of received items."""
        return sum(item.quantity_received for item in self.items.all())

    @property
    def is_fully_received(self):
        """Check if order is fully received."""
        return all(item.quantity_received >= item.quantity_ordered for item in self.items.all())


class PurchaseOrderItem(models.Model):
    """Items in purchase orders."""

    purchase_order = models.ForeignKey(
        PurchaseOrder, on_delete=models.CASCADE, related_name="items"
    )
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="purchase_order_items"
    )

    # Quantities
    quantity_ordered = models.PositiveIntegerField()
    quantity_received = models.PositiveIntegerField(default=0)

    # Pricing
    unit_cost = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(0)]
    )
    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
    )

    # Item Details
    batch_number = models.CharField(max_length=50, blank=True)
    expiry_date = models.DateField(null=True, blank=True)

    # Status
    is_received = models.BooleanField(default=False)
    received_date = models.DateField(null=True, blank=True)

    # Notes
    notes = models.TextField(blank=True)

    class Meta:
        unique_together = ["purchase_order", "product"]
        verbose_name = "Purchase Order Item"
        verbose_name_plural = "Purchase Order Items"

    def __str__(self):
        return f"{self.product.name} - {self.quantity_ordered}"

    @property
    def total_cost(self):
        """Calculate total cost for this item."""
        return self.unit_cost * self.quantity_ordered

    @property
    def is_fully_received(self):
        """Check if item is fully received."""
        return self.quantity_received >= self.quantity_ordered


class InventoryItem(models.Model):
    """Inventory items with stock details for purchase entries."""

    # Supplier Types
    USER_SUPPLIER = "user"
    CUSTOM_SUPPLIER = "custom"

    SUPPLIER_TYPE_CHOICES = [
        (USER_SUPPLIER, "User Supplier"),
        (CUSTOM_SUPPLIER, "Custom Supplier"),
    ]

    # Product reference
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="inventory_items")

    # Supplier information
    supplier_type = models.CharField(
        max_length=10, choices=SUPPLIER_TYPE_CHOICES, default=USER_SUPPLIER
    )
    supplier_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="supplied_items",
        help_text="User with supplier_admin role",
    )
    custom_supplier = models.ForeignKey(
        CustomSupplier,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="inventory_items",
    )

    # Stock details
    quantity = models.PositiveIntegerField()
    unit = models.CharField(max_length=50, default="pieces")

    # Pricing
    cost_price = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(0)]
    )
    selling_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        null=True,
        blank=True,
    )

    # Batch information
    batch_number = models.CharField(max_length=50)
    manufacturing_date = models.DateField()
    expiry_date = models.DateField()

    # Organization and branch
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="inventory_items"
    )
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name="inventory_items")

    # Stock management fields
    min_stock_level = models.PositiveIntegerField(default=10)
    max_stock_level = models.PositiveIntegerField(default=1000)
    location = models.CharField(
        max_length=100,
        blank=True,
        help_text="Storage location (e.g., A1-01)",
    )

    # Status
    is_active = models.BooleanField(default=True)

    # Audit fields
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_inventory_items",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Inventory Item"
        verbose_name_plural = "Inventory Items"
        indexes = [
            models.Index(fields=["product", "batch_number"]),
            models.Index(fields=["expiry_date"]),
            models.Index(fields=["organization", "branch"]),
        ]

    def __str__(self):
        return f"{self.product.name} - Batch: {self.batch_number} - Qty: {self.quantity}"

    @property
    def supplier_name(self):
        """Get supplier name regardless of type."""
        if self.supplier_type == self.USER_SUPPLIER and self.supplier_user:
            return self.supplier_user.get_full_name() or self.supplier_user.email
        elif self.supplier_type == self.CUSTOM_SUPPLIER and self.custom_supplier:
            return self.custom_supplier.name
        return "Unknown Supplier"

    @property
    def total_cost(self):
        """Calculate total cost for this inventory item."""
        return self.cost_price * self.quantity

    @property
    def is_expired(self):
        """Check if item is expired."""
        from datetime import date

        return self.expiry_date < date.today()

    @property
    def days_to_expiry(self):
        """Get days until expiry."""
        from datetime import date

        return (self.expiry_date - date.today()).days


class PurchaseTransaction(models.Model):
    """Purchase transaction record for inventory restocking."""

    transaction_number = models.CharField(max_length=50)
    supplier_name = models.CharField(max_length=200)
    supplier_contact = models.CharField(max_length=100, blank=True)
    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )

    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="purchase_transactions"
    )
    branch = models.ForeignKey(
        Branch, on_delete=models.CASCADE, related_name="purchase_transactions"
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["organization", "transaction_number"]

    def save(self, *args, **kwargs):
        if not self.transaction_number:
            from datetime import datetime

            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            self.transaction_number = f"TXN-{timestamp}"
        super().save(*args, **kwargs)


class PurchaseItem(models.Model):
    """Individual items in purchase transactions."""

    purchase_transaction = models.ForeignKey(
        PurchaseTransaction, on_delete=models.CASCADE, related_name="items"
    )
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="purchase_items")

    # Purchase details
    quantity_purchased = models.PositiveIntegerField()
    unit = models.CharField(max_length=50, default="pieces")
    cost_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    selling_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
    )

    # Batch info
    batch_number = models.CharField(max_length=50)
    manufacturing_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField()

    # Links to inventory
    inventory_item = models.ForeignKey(
        InventoryItem,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="purchase_items",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Purchase Item"
        verbose_name_plural = "Purchase Items"

    def __str__(self):
        return f"{self.product.name} - {self.quantity_purchased} {self.unit}"

    @property
    def total_cost(self):
        """Calculate total cost for this purchase item."""
        return self.cost_price * self.quantity_purchased


class PaymentRecord(models.Model):
    """Payment records for purchase transactions."""

    CASH = "cash"
    CREDIT = "credit"
    PARTIAL = "partial"

    PAYMENT_METHOD_CHOICES = [
        (CASH, "Cash Payment"),
        (CREDIT, "Credit (Pay Later)"),
        (PARTIAL, "Partial Payment"),
    ]

    payment_number = models.CharField(max_length=50)
    transaction = models.ForeignKey(
        PurchaseTransaction, on_delete=models.CASCADE, related_name="payments"
    )
    payment_method = models.CharField(max_length=15, choices=PAYMENT_METHOD_CHOICES, default=CASH)
    payment_date = models.DateField()
    total_amount = models.DecimalField(
        max_digits=12, decimal_places=2, validators=[MinValueValidator(0)]
    )
    paid_amount = models.DecimalField(
        max_digits=12, decimal_places=2, validators=[MinValueValidator(0)]
    )
    credit_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal(0),
        validators=[MinValueValidator(0)],
    )
    notes = models.TextField(blank=True)

    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="payment_records"
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["organization", "payment_number"]

    def save(self, *args, **kwargs):
        if not self.payment_number:
            from datetime import datetime

            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            self.payment_number = f"PAY-{timestamp}"
        self.credit_amount = max(0, self.total_amount - self.paid_amount)
        super().save(*args, **kwargs)


class BulkOrder(models.Model):
    """Bulk orders between organizations for inter-company procurement."""

    # Order Status
    DRAFT = "draft"
    SUBMITTED = "submitted"
    SUPPLIER_REVIEWING = "supplier_reviewing"
    SUPPLIER_CONFIRMED = "supplier_confirmed"
    SUPPLIER_REJECTED = "supplier_rejected"
    BUYER_REVIEWING = "buyer_reviewing"
    BUYER_CONFIRMED = "buyer_confirmed"
    BUYER_RECONFIRMING = "buyer_reconfirming"
    BUYER_CANCELLED = "buyer_cancelled"
    PAYMENT_PENDING = "payment_pending"
    PAYMENT_PARTIAL = "payment_partial"
    PAYMENT_COMPLETED = "payment_completed"
    READY_TO_SHIP = "ready_to_ship"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    COMPLETED = "completed"
    RELEASED = "released"  # Supplier releases stock from inventory
    IMPORTED = "imported"  # Buyer imports stock to inventory
    CANCELLED = "cancelled"

    STATUS_CHOICES = [
        (DRAFT, "Draft"),
        (SUBMITTED, "Submitted to Supplier"),
        (SUPPLIER_REVIEWING, "Supplier Reviewing"),
        (SUPPLIER_CONFIRMED, "Supplier Confirmed"),
        (SUPPLIER_REJECTED, "Supplier Rejected"),
        (BUYER_REVIEWING, "Buyer Reviewing Quote"),
        (BUYER_CONFIRMED, "Buyer Confirmed"),
        (BUYER_RECONFIRMING, "Buyer Reconfirming Order"),
        (BUYER_CANCELLED, "Buyer Cancelled"),
        (PAYMENT_PENDING, "Payment Pending"),
        (PAYMENT_PARTIAL, "Partial Payment Made"),
        (PAYMENT_COMPLETED, "Payment Completed"),
        (READY_TO_SHIP, "Ready to Ship"),
        (SHIPPED, "Shipped"),
        (DELIVERED, "Delivered"),
        (COMPLETED, "Completed"),
        (RELEASED, "Released from Supplier Stock"),
        (IMPORTED, "Imported to Buyer Stock"),
        (CANCELLED, "Cancelled"),
    ]

    # Basic Information
    order_number = models.CharField(max_length=50, unique=True)

    # Organizations involved
    buyer_organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="bulk_orders_as_buyer"
    )
    buyer_branch = models.ForeignKey(
        Branch, on_delete=models.CASCADE, related_name="bulk_orders_as_buyer"
    )
    supplier_organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="bulk_orders_as_supplier"
    )
    supplier_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bulk_orders_as_supplier",
        help_text="Supplier admin user",
    )

    # Order Details
    order_date = models.DateTimeField(auto_now_add=True)
    expected_delivery_date = models.DateField()

    # Status and workflow
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=DRAFT)

    # Financial Information (set by supplier)
    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal(0),
        validators=[MinValueValidator(0)],
    )
    tax_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal(0),
        validators=[MinValueValidator(0)],
    )
    shipping_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal(0),
        validators=[MinValueValidator(0)],
    )
    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal(0),
        validators=[MinValueValidator(0)],
    )

    # Payment tracking
    advance_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal(0),
        validators=[MinValueValidator(0)],
    )
    advance_paid = models.BooleanField(default=False)
    advance_payment_date = models.DateTimeField(null=True, blank=True)
    total_paid_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal(0),
        validators=[MinValueValidator(0)],
    )
    remaining_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal(0),
        validators=[MinValueValidator(0)],
    )
    payment_status = models.CharField(
        max_length=20,
        choices=[
            ("pending", "Payment Pending"),
            ("partial", "Partial Payment"),
            ("completed", "Payment Completed"),
            ("overdue", "Payment Overdue"),
        ],
        default="pending",
    )

    # Shipping Information
    shipping_method = models.CharField(max_length=100, blank=True)
    tracking_number = models.CharField(max_length=100, blank=True)
    shipped_date = models.DateTimeField(null=True, blank=True)
    delivered_date = models.DateTimeField(null=True, blank=True)

    # Stock Management
    released_date = models.DateTimeField(
        null=True, blank=True, help_text="When supplier released stock"
    )
    imported_date = models.DateTimeField(
        null=True, blank=True, help_text="When buyer imported to stock"
    )
    released_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="released_bulk_orders",
        help_text="Supplier user who released the stock",
    )
    imported_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="imported_bulk_orders",
        help_text="Buyer user who imported the stock",
    )

    # Notes and Comments
    buyer_notes = models.TextField(blank=True, help_text="Initial order notes from buyer")
    supplier_notes = models.TextField(blank=True, help_text="Supplier response notes")
    buyer_delivery_notes = models.TextField(
        blank=True, help_text="Buyer notes after reviewing quote"
    )
    buyer_reconfirm_notes = models.TextField(
        blank=True, help_text="Buyer notes during reconfirmation"
    )
    shipping_notes = models.TextField(blank=True, help_text="Shipping instructions")
    delivery_notes = models.TextField(blank=True, help_text="Final delivery notes")

    # Workflow control
    can_modify_items = models.BooleanField(
        default=True, help_text="Whether buyer can still modify items"
    )
    supplier_locked = models.BooleanField(
        default=False, help_text="Supplier has locked their response"
    )

    # Audit fields
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_bulk_orders",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Bulk Order"
        verbose_name_plural = "Bulk Orders"
        indexes = [
            models.Index(fields=["buyer_organization", "status"]),
            models.Index(fields=["supplier_organization", "status"]),
            models.Index(fields=["order_date"]),
        ]

    def __str__(self):
        return f"{self.order_number} - {self.buyer_organization.name} to {self.supplier_organization.name}"

    def save(self, *args, **kwargs):
        if not self.order_number:
            from datetime import datetime

            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            self.order_number = f"BO-{timestamp}"
        super().save(*args, **kwargs)

    @property
    def total_items(self):
        """Get total number of items in the order."""
        return self.items.count()

    @property
    def total_quantity(self):
        """Get total quantity of all items."""
        return sum(item.quantity_requested for item in self.items.all())


class BulkOrderItem(models.Model):
    """Items in bulk orders with supplier confirmation workflow."""

    bulk_order = models.ForeignKey(BulkOrder, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="bulk_order_items")

    # Buyer's request
    quantity_requested = models.PositiveIntegerField()
    buyer_notes = models.TextField(blank=True)

    # Supplier's response
    quantity_confirmed = models.PositiveIntegerField(default=0)
    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text="Price set by supplier",
    )
    supplier_notes = models.TextField(blank=True, help_text="Supplier notes about this item")
    is_available = models.BooleanField(default=True)

    # Buyer's final confirmation (can be different from confirmed)
    quantity_final = models.PositiveIntegerField(
        default=0, help_text="Final quantity after buyer reconfirmation"
    )
    is_cancelled = models.BooleanField(default=False, help_text="Item cancelled by buyer")
    buyer_reconfirm_notes = models.TextField(
        blank=True, help_text="Buyer notes during reconfirmation"
    )

    # Delivery tracking
    quantity_shipped = models.PositiveIntegerField(default=0)
    quantity_delivered = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ["bulk_order", "product"]
        verbose_name = "Bulk Order Item"
        verbose_name_plural = "Bulk Order Items"

    def __str__(self):
        return (
            f"{self.product.name} - Req: {self.quantity_requested}, Conf: {self.quantity_confirmed}"
        )

    @property
    def total_price(self):
        """Calculate total price for confirmed quantity."""
        if self.unit_price and self.quantity_confirmed:
            return self.unit_price * self.quantity_confirmed
        return 0

    @property
    def is_fully_delivered(self):
        """Check if item is fully delivered."""
        return self.quantity_delivered >= self.quantity_confirmed


class BulkOrderStatusLog(models.Model):
    """Status change log for bulk orders to track workflow."""

    bulk_order = models.ForeignKey(BulkOrder, on_delete=models.CASCADE, related_name="status_logs")
    from_status = models.CharField(max_length=20, blank=True)
    to_status = models.CharField(max_length=20)
    notes = models.TextField(blank=True)

    # User who made the change
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-changed_at"]
        verbose_name = "Bulk Order Status Log"
        verbose_name_plural = "Bulk Order Status Logs"

    def __str__(self):
        return f"{self.bulk_order.order_number}: {self.from_status} → {self.to_status}"


class BulkOrderPayment(models.Model):
    """Payment records for bulk orders including installments."""

    ADVANCE = "advance"
    INSTALLMENT = "installment"
    FINAL = "final"
    FULL = "full"
    PARTIAL = "partial"

    PAYMENT_TYPE_CHOICES = [
        (ADVANCE, "Advance Payment"),
        (INSTALLMENT, "Installment Payment"),
        (FINAL, "Final Payment"),
        (FULL, "Full Payment"),
        (PARTIAL, "Partial Payment"),
    ]

    CASH = "cash"
    BANK_TRANSFER = "bank_transfer"
    CHEQUE = "cheque"
    ONLINE = "online"
    CREDIT = "credit"
    MIXED = "mixed"

    PAYMENT_METHOD_CHOICES = [
        (CASH, "Cash"),
        (BANK_TRANSFER, "Bank Transfer"),
        (CHEQUE, "Cheque"),
        (ONLINE, "Online Payment"),
        (CREDIT, "Credit/Pay Later"),
        (MIXED, "Mixed Payment"),
    ]

    bulk_order = models.ForeignKey(BulkOrder, on_delete=models.CASCADE, related_name="payments")

    payment_type = models.CharField(max_length=15, choices=PAYMENT_TYPE_CHOICES)
    payment_method = models.CharField(max_length=15, choices=PAYMENT_METHOD_CHOICES)

    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    payment_date = models.DateTimeField()
    reference_number = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)

    # Installment details
    installment_number = models.PositiveIntegerField(default=1)
    is_final_payment = models.BooleanField(default=False)

    # Mixed payment breakdown
    cash_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal(0),
        validators=[MinValueValidator(0)],
    )
    online_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal(0),
        validators=[MinValueValidator(0)],
    )
    credit_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal(0),
        validators=[MinValueValidator(0)],
    )

    # Audit fields
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-payment_date"]
        verbose_name = "Bulk Order Payment"
        verbose_name_plural = "Bulk Order Payments"

    def __str__(self):
        return f"{self.bulk_order.order_number} - {self.payment_type} - {self.amount}"


class Rack(models.Model):
    """Storage rack management for pharmacy inventory organization."""

    name = models.CharField(max_length=100, help_text="Rack name (e.g., Main Rack A)")
    description = models.TextField(blank=True, help_text="Optional description")
    rows = models.PositiveIntegerField(help_text="Number of rows in the rack")
    columns = models.PositiveIntegerField(help_text="Number of columns in the rack")

    # Organization and branch
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="racks"
    )
    branch = models.ForeignKey(
        Branch, on_delete=models.CASCADE, related_name="racks"
    )

    # Status
    is_active = models.BooleanField(default=True)

    # Audit fields
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_racks",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Rack"
        verbose_name_plural = "Racks"
        unique_together = ["organization", "branch", "name"]

    def __str__(self):
        return f"{self.name} ({self.rows}×{self.columns})"

    @property
    def total_sections(self):
        """Calculate total number of sections in the rack."""
        return self.rows * self.columns


class RackSection(models.Model):
    """Individual sections within a rack for storing medicines."""

    rack = models.ForeignKey(Rack, on_delete=models.CASCADE, related_name="sections")
    section_name = models.CharField(max_length=10, help_text="Section identifier (e.g., A1, B2)")

    # Position in rack
    row_number = models.PositiveIntegerField()
    column_number = models.PositiveIntegerField()

    # Medicine storage (optional - can be empty)
    medicine = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="rack_sections",
        help_text="Medicine currently stored in this section"
    )

    # Quantity tracking
    quantity = models.PositiveIntegerField(default=0, help_text="Quantity of medicine in this section")

    # Batch information (if applicable)
    batch_number = models.CharField(max_length=50, blank=True)
    expiry_date = models.DateField(null=True, blank=True)

    # Status
    is_occupied = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    # Notes
    notes = models.TextField(blank=True)

    # Audit fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["rack", "row_number", "column_number"]
        verbose_name = "Rack Section"
        verbose_name_plural = "Rack Sections"
        unique_together = ["rack", "section_name"]

    def __str__(self):
        return f"{self.rack.name} - {self.section_name}"

    @property
    def is_low_stock(self):
        """Check if section has low stock."""
        if not self.medicine:
            return False
        return self.quantity <= (self.medicine.min_stock_level or 10)

    @property
    def is_expired(self):
        """Check if medicine in section is expired."""
        if not self.expiry_date:
            return False
        from datetime import date
        return self.expiry_date < date.today()

    @property
    def days_to_expiry(self):
        """Get days until expiry."""
        if not self.expiry_date:
            return None
        from datetime import date
        return (self.expiry_date - date.today()).days


class RackSectionAssignment(models.Model):
    """Track medicine assignments to rack sections."""

    rack_section = models.ForeignKey(
        RackSection,
        on_delete=models.CASCADE,
        related_name="assignments"
    )
    medicine = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="rack_assignments"
    )

    # Assignment details
    quantity_assigned = models.PositiveIntegerField()
    batch_number = models.CharField(max_length=50, blank=True)
    expiry_date = models.DateField(null=True, blank=True)

    # Assignment metadata
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="rack_assignments"
    )
    assigned_at = models.DateTimeField(auto_now_add=True)

    # Removal tracking
    removed_at = models.DateTimeField(null=True, blank=True)
    removed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="removed_rack_assignments"
    )
    removal_reason = models.TextField(blank=True)

    class Meta:
        ordering = ["-assigned_at"]
        verbose_name = "Rack Section Assignment"
        verbose_name_plural = "Rack Section Assignments"

    def __str__(self):
        return f"{self.rack_section} - {self.medicine.name} ({self.quantity_assigned})"


class SupplierLedger(models.Model):
    """Unified supplier payment tracking across all systems"""

    SUPPLIER_USER = "user"
    SUPPLIER_CUSTOM = "custom"

    SUPPLIER_TYPE_CHOICES = [
        (SUPPLIER_USER, "User Supplier"),
        (SUPPLIER_CUSTOM, "Custom Supplier"),
    ]

    SOURCE_STOCK = "stock_management"
    SOURCE_BULK = "bulk_order"

    SOURCE_CHOICES = [
        (SOURCE_STOCK, "Stock Management"),
        (SOURCE_BULK, "Bulk Order"),
    ]

    # Supplier identification
    supplier_type = models.CharField(max_length=10, choices=SUPPLIER_TYPE_CHOICES)
    supplier_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="supplier_ledger_entries",
    )
    supplier_name = models.CharField(max_length=200)  # Unified name

    # Transaction details
    source_type = models.CharField(max_length=20, choices=SOURCE_CHOICES)
    reference_id = models.CharField(max_length=50)  # Transaction/Order ID

    # Financial tracking
    transaction_amount = models.DecimalField(
        max_digits=12, decimal_places=2, validators=[MinValueValidator(0)]
    )
    paid_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal(0),
        validators=[MinValueValidator(0)],
    )
    credit_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal(0),
        validators=[MinValueValidator(0)],
    )

    # Organization/Branch
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE)

    # Timestamps
    transaction_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["supplier_name", "organization"]),
            models.Index(fields=["supplier_user", "organization"]),
        ]
        unique_together = ["source_type", "reference_id"]

    def __str__(self):
        return f"{self.supplier_name} - {self.source_type} - {self.reference_id}"
