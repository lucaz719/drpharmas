from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from django.utils.translation import gettext_lazy as _

from inventory.models import InventoryItem, Product
from organizations.models import Branch, Organization
from patients.models import Patient


class Customer(models.Model):
    """Customer model for pharmacy customers."""

    # Customer Types
    RETAIL = "retail"
    WHOLESALE = "wholesale"
    HOSPITAL = "hospital"
    CLINIC = "clinic"
    PHARMACY = "pharmacy"

    CUSTOMER_TYPE_CHOICES = [
        (RETAIL, "Retail Customer"),
        (WHOLESALE, "Wholesale Customer"),
        (HOSPITAL, "Hospital"),
        (CLINIC, "Clinic"),
        (PHARMACY, "Pharmacy"),
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
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    customer_code = models.CharField(max_length=20, unique=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=15)
    date_of_birth = models.DateField(null=True, blank=True)

    # Address Information
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, default="Nepal")

    # Customer Details
    customer_type = models.CharField(max_length=15, choices=CUSTOMER_TYPE_CHOICES, default=RETAIL)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default=ACTIVE)

    # Medical Information
    allergies = models.TextField(blank=True)
    medical_conditions = models.TextField(blank=True)
    emergency_contact = models.CharField(max_length=100, blank=True)
    emergency_phone = models.CharField(max_length=15, blank=True)

    # Loyalty Program
    loyalty_points = models.PositiveIntegerField(default=0)
    total_purchases = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal(0),
        validators=[MinValueValidator(0)],
    )
    total_spent = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal(0),
        validators=[MinValueValidator(0)],
    )
    member_since = models.DateField(auto_now_add=True)
    last_visit = models.DateField(null=True, blank=True)

    # Credit Information
    credit_limit = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal(0),
        validators=[MinValueValidator(0)],
    )
    current_balance = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal(0),
        validators=[MinValueValidator(0)],
    )

    # Organization relationship
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="customers"
    )

    # Audit fields
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_customers",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-last_visit", "first_name", "last_name"]
        verbose_name = "Customer"
        verbose_name_plural = "Customers"
        unique_together = ["organization", "customer_code"]

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.customer_code})"

    @property
    def full_name(self):
        """Get full name."""
        return f"{self.first_name} {self.last_name}".strip()

    @property
    def available_credit(self):
        """Get available credit."""
        return self.credit_limit - self.current_balance

    @property
    def loyalty_tier(self):
        """Get loyalty tier based on total spent."""
        if self.total_spent >= 50000:
            return "Platinum"
        elif self.total_spent >= 25000:
            return "Gold"
        elif self.total_spent >= 10000:
            return "Silver"
        else:
            return "Bronze"


class Prescription(models.Model):
    """Prescription model for managing patient prescriptions."""

    # Status
    PENDING = "pending"
    APPROVED = "approved"
    DISPENSED = "dispensed"
    CANCELLED = "cancelled"
    EXPIRED = "expired"

    STATUS_CHOICES = [
        (PENDING, "Pending"),
        (APPROVED, "Approved"),
        (DISPENSED, "Dispensed"),
        (CANCELLED, "Cancelled"),
        (EXPIRED, "Expired"),
    ]

    # Basic Information
    prescription_number = models.CharField(max_length=50, unique=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="prescriptions")

    # Prescription Details
    prescribed_by = models.CharField(max_length=100)  # Doctor's name
    prescribed_date = models.DateField()
    expiry_date = models.DateField()

    # Status
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default=PENDING)

    # Notes
    diagnosis = models.TextField(blank=True)
    instructions = models.TextField(blank=True)
    notes = models.TextField(blank=True)

    # Organization and Branch
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="prescriptions"
    )
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name="prescriptions")

    # Audit fields
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_pos_prescriptions",
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_prescriptions",
    )
    dispensed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="dispensed_prescriptions",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-prescribed_date"]
        verbose_name = "Prescription"
        verbose_name_plural = "Prescriptions"
        unique_together = ["organization", "prescription_number"]

    def __str__(self):
        return f"Rx-{self.prescription_number} - {self.customer.full_name}"

    @property
    def is_expired(self):
        """Check if prescription is expired."""
        from datetime import date

        return self.expiry_date < date.today()

    @property
    def total_items(self):
        """Get total number of items in prescription."""
        return self.items.count()

    @property
    def dispensed_items(self):
        """Get number of dispensed items."""
        return sum(1 for item in self.items.all() if item.is_dispensed)


class PrescriptionItem(models.Model):
    """Items in prescriptions."""

    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="prescription_items"
    )

    # Prescription Details
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=100)
    duration = models.CharField(max_length=100)
    quantity_prescribed = models.PositiveIntegerField()
    quantity_dispensed = models.PositiveIntegerField(default=0)

    # Status
    is_dispensed = models.BooleanField(default=False)
    dispensed_date = models.DateField(null=True, blank=True)

    # Notes
    instructions = models.TextField(blank=True)
    pharmacist_notes = models.TextField(blank=True)

    class Meta:
        unique_together = ["prescription", "product"]
        verbose_name = "Prescription Item"
        verbose_name_plural = "Prescription Items"

    def __str__(self):
        return f"{self.product.name} - {self.dosage}"

    @property
    def remaining_quantity(self):
        """Get remaining quantity to dispense."""
        return self.quantity_prescribed - self.quantity_dispensed


class Sale(models.Model):
    """Main sales transaction model."""

    # Sale Types
    CASH = "cash"
    ONLINE = "online"
    CREDIT = "credit"
    INSURANCE = "insurance"
    MIXED = "mixed"

    SALE_TYPE_CHOICES = [
        (CASH, "Cash"),
        (ONLINE, "Online"),
        (CREDIT, "Credit"),
        (INSURANCE, "Insurance"),
        (MIXED, "Mixed Payment"),
    ]

    # Status
    PENDING = "pending"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"

    STATUS_CHOICES = [
        (PENDING, "Pending"),
        (COMPLETED, "Completed"),
        (CANCELLED, "Cancelled"),
        (REFUNDED, "Refunded"),
    ]

    # Basic Information
    sale_number = models.CharField(max_length=50, unique=True)
    patient = models.ForeignKey(
        Patient, on_delete=models.SET_NULL, null=True, blank=True, related_name="sales"
    )

    # Anonymous patient info for walk-in customers
    patient_name = models.CharField(max_length=200, blank=True)
    patient_age = models.CharField(max_length=10, blank=True)
    patient_phone = models.CharField(max_length=15, blank=True)
    patient_gender = models.CharField(max_length=10, blank=True)

    # Sale Details
    sale_date = models.DateTimeField(auto_now_add=True)
    sale_type = models.CharField(max_length=15, choices=SALE_TYPE_CHOICES, default=CASH)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default=PENDING)

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
    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal(0),
        validators=[MinValueValidator(0)],
    )

    # Payment Information
    amount_paid = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal(0),
        validators=[MinValueValidator(0)],
    )
    change_amount = models.DecimalField(
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
    payment_method = models.CharField(max_length=50, blank=True)
    transaction_id = models.CharField(max_length=100, blank=True)

    # Prescription Information
    prescription = models.ForeignKey(
        Prescription, on_delete=models.SET_NULL, null=True, blank=True, related_name="sales"
    )

    # Organization and Branch
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="sales")
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name="sales")

    # Notes
    notes = models.TextField(blank=True)
    internal_notes = models.TextField(blank=True)

    # Audit fields
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_sales",
    )
    completed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="completed_sales",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-sale_date"]
        verbose_name = "Sale"
        verbose_name_plural = "Sales"
        unique_together = ["organization", "sale_number"]
        indexes = [
            models.Index(fields=["sale_date", "organization"]),
            models.Index(fields=["status", "sale_date"]),
        ]

    def __str__(self):
        return f"Sale-{self.sale_number}"

    @property
    def total_items(self):
        """Get total number of items in the sale."""
        return self.items.count()

    @property
    def is_paid(self):
        """Check if sale is fully paid."""
        return self.amount_paid >= self.total_amount

    @property
    def outstanding_amount(self):
        """Get outstanding amount."""
        return max(0, self.total_amount - self.amount_paid)


class SaleItem(models.Model):
    """Items in sales transactions."""

    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="sale_items")
    inventory_item = models.ForeignKey(
        InventoryItem, on_delete=models.SET_NULL, null=True, blank=True, related_name="sale_items"
    )
    prescription_item = models.ForeignKey(
        PrescriptionItem,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sale_items",
    )

    # Quantities
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    discount_percent = models.DecimalField(
        max_digits=5, decimal_places=2, default=Decimal(0), validators=[MinValueValidator(0)]
    )
    discount_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal(0),
        validators=[MinValueValidator(0)],
    )

    # Batch Information
    batch_number = models.CharField(max_length=50, blank=True)
    expiry_date = models.DateField(null=True, blank=True)

    # Stock allocation details
    allocated_batches = models.JSONField(
        default=list, blank=True, help_text="Details of batch allocations"
    )

    # Notes
    notes = models.TextField(blank=True)

    class Meta:
        unique_together = ["sale", "product"]
        verbose_name = "Sale Item"
        verbose_name_plural = "Sale Items"

    def __str__(self):
        return f"{self.product.name} - {self.quantity}"

    @property
    def line_total(self):
        """Calculate line total after discount."""
        subtotal = self.quantity * self.unit_price
        return subtotal - self.discount_amount

    @property
    def effective_discount(self):
        """Get effective discount percentage."""
        if self.unit_price > 0:
            return (self.discount_amount / (self.quantity * self.unit_price)) * 100
        return 0


class Payment(models.Model):
    """Payment records for sales."""

    # Payment Methods
    CASH = "cash"
    CARD = "card"
    BANK_TRANSFER = "bank_transfer"
    CHEQUE = "cheque"
    CREDIT = "credit"
    INSURANCE = "insurance"

    PAYMENT_METHOD_CHOICES = [
        (CASH, "Cash"),
        (CARD, "Card"),
        (BANK_TRANSFER, "Bank Transfer"),
        (CHEQUE, "Cheque"),
        (CREDIT, "Credit"),
        (INSURANCE, "Insurance"),
    ]

    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name="payments")

    # Payment Details
    amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    payment_method = models.CharField(max_length=15, choices=PAYMENT_METHOD_CHOICES, default=CASH)
    payment_date = models.DateTimeField(auto_now_add=True)

    # Additional Information
    reference_number = models.CharField(max_length=100, blank=True)
    card_last_four = models.CharField(max_length=4, blank=True)
    bank_name = models.CharField(max_length=100, blank=True)
    cheque_number = models.CharField(max_length=50, blank=True)

    # Notes
    notes = models.TextField(blank=True)

    # Audit fields
    received_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="received_payments",
    )

    class Meta:
        ordering = ["-payment_date"]
        verbose_name = "Payment"
        verbose_name_plural = "Payments"

    def __str__(self):
        return f"Payment - {self.amount} ({self.payment_method})"


class Return(models.Model):
    """Return transactions for sales."""

    # Return Reasons
    DAMAGED = "damaged"
    EXPIRED = "expired"
    WRONG_ITEM = "wrong_item"
    CUSTOMER_REQUEST = "customer_request"
    OTHER = "other"

    RETURN_REASON_CHOICES = [
        (DAMAGED, "Damaged Product"),
        (EXPIRED, "Expired Product"),
        (WRONG_ITEM, "Wrong Item"),
        (CUSTOMER_REQUEST, "Customer Request"),
        (OTHER, "Other"),
    ]

    # Status
    PENDING = "pending"
    APPROVED = "approved"
    COMPLETED = "completed"
    REJECTED = "rejected"

    STATUS_CHOICES = [
        (PENDING, "Pending"),
        (APPROVED, "Approved"),
        (COMPLETED, "Completed"),
        (REJECTED, "Rejected"),
    ]

    # Basic Information
    return_number = models.CharField(max_length=50, unique=True)
    original_sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name="returns")
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="returns")

    # Return Details
    return_date = models.DateTimeField(auto_now_add=True)
    reason = models.CharField(max_length=20, choices=RETURN_REASON_CHOICES)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default=PENDING)

    # Financial Information
    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal(0),
        validators=[MinValueValidator(0)],
    )
    refund_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal(0),
        validators=[MinValueValidator(0)],
    )

    # Notes
    notes = models.TextField(blank=True)
    internal_notes = models.TextField(blank=True)

    # Organization and Branch
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="returns")
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name="returns")

    # Audit fields
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_returns",
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_returns",
    )
    processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="processed_returns",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-return_date"]
        verbose_name = "Return"
        verbose_name_plural = "Returns"
        unique_together = ["organization", "return_number"]

    def __str__(self):
        return f"Return-{self.return_number}"

    @property
    def total_items(self):
        """Get total number of items in the return."""
        return self.items.count()


class ReturnItem(models.Model):
    """Items in return transactions."""

    return_transaction = models.ForeignKey(Return, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="return_items")
    original_sale_item = models.ForeignKey(
        SaleItem, on_delete=models.CASCADE, related_name="return_items"
    )

    # Quantities
    quantity_returned = models.PositiveIntegerField()
    quantity_accepted = models.PositiveIntegerField(default=0)

    # Financial Information
    unit_price = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(0)]
    )
    refund_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal(0),
        validators=[MinValueValidator(0)],
    )

    # Condition
    condition = models.CharField(
        max_length=20,
        choices=[
            ("good", "Good"),
            ("damaged", "Damaged"),
            ("expired", "Expired"),
        ],
        default="good",
    )

    # Notes
    notes = models.TextField(blank=True)

    class Meta:
        unique_together = ["return_transaction", "product"]
        verbose_name = "Return Item"
        verbose_name_plural = "Return Items"

    def __str__(self):
        return f"{self.product.name} - {self.quantity_returned}"

    @property
    def line_refund(self):
        """Calculate line refund amount."""
        return self.quantity_accepted * self.unit_price


class POSSettings(models.Model):
    """POS Settings model for branch-specific configurations."""

    # Receipt Settings
    business_name = models.CharField(max_length=200, blank=True)
    business_address = models.TextField(blank=True)
    business_phone = models.CharField(max_length=20, blank=True)
    business_email = models.EmailField(blank=True)
    receipt_footer = models.TextField(blank=True)
    receipt_logo = models.ImageField(upload_to="pos/receipts/", blank=True, null=True)

    # Tax Settings
    tax_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal(0),
        validators=[MinValueValidator(0)],
    )
    tax_inclusive = models.BooleanField(default=False)

    # Payment Methods
    payment_methods = models.JSONField(default=list, blank=True)

    # Organization and Branch
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="pos_settings"
    )
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name="pos_settings")

    # Audit fields
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ["organization", "branch"]
        verbose_name = "POS Settings"
        verbose_name_plural = "POS Settings"

    def __str__(self):
        return f"POS Settings - {self.branch.name}"
