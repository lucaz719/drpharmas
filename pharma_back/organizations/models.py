from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator, RegexValidator
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone


class Organization(models.Model):
    """Multi-tenant organization model for pharmacy chains."""

    # Organization Types
    PHARMACY_CHAIN = "pharmacy_chain"
    HOSPITAL_PHARMACY = "hospital_pharmacy"
    RETAIL_PHARMACY = "retail_pharmacy"
    WHOLESALE_PHARMACY = "wholesale_pharmacy"
    ONLINE_PHARMACY = "online_pharmacy"

    ORGANIZATION_TYPE_CHOICES = [
        (PHARMACY_CHAIN, "Pharmacy Chain"),
        (HOSPITAL_PHARMACY, "Hospital Pharmacy"),
        (RETAIL_PHARMACY, "Retail Pharmacy"),
        (WHOLESALE_PHARMACY, "Wholesale Pharmacy"),
        (ONLINE_PHARMACY, "Online Pharmacy"),
    ]

    # Medical Systems
    ALLOPATHIC = "allopathic"
    AYURVEDIC = "ayurvedic"
    HYBRID = "hybrid"

    MEDICAL_SYSTEM_CHOICES = [
        (ALLOPATHIC, "Allopathic (Western Medicine)"),
        (AYURVEDIC, "Ayurvedic (Traditional Medicine)"),
        (HYBRID, "Hybrid (Both)"),
    ]

    # Status
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"

    STATUS_CHOICES = [
        (ACTIVE, "Active"),
        (INACTIVE, "Inactive"),
        (SUSPENDED, "Suspended"),
        (PENDING, "Pending Approval"),
    ]

    # Basic Information
    name = models.CharField(max_length=200, unique=True)
    type = models.CharField(
        max_length=20, choices=ORGANIZATION_TYPE_CHOICES, default=RETAIL_PHARMACY
    )
    medical_system = models.CharField(
        max_length=20, choices=MEDICAL_SYSTEM_CHOICES, default=ALLOPATHIC
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=PENDING)

    # Contact Information
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100, default="Nepal")

    phone = models.CharField(
        max_length=15,
        validators=[
            RegexValidator(
                regex=r"^(?:\+977[-]?\d{1,2}[-]?\d{6,8}|\d{10})$",
                message="Phone number must be entered in the format: '+977-1-234567' or '9801234567' (10 digits for local Nepali numbers).",
            )
        ],
    )
    email = models.EmailField(unique=True)
    website = models.URLField(blank=True)

    # Business Information
    license_number = models.CharField(max_length=50, unique=True)
    license_expiry = models.DateField()
    tax_id = models.CharField(max_length=50, blank=True)
    registration_number = models.CharField(max_length=50, blank=True)

    # Financial Information
    currency = models.CharField(max_length=3, default="NPR")
    tax_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal(13),
        validators=[MinValueValidator(0)],
        help_text="Default tax rate for the organization",
    )

    # Settings
    timezone = models.CharField(max_length=50, default="Asia/Kathmandu")
    language = models.CharField(max_length=10, default="en")

    # Subscription/Plan Information
    subscription_plan = models.CharField(max_length=50, default="basic")
    subscription_status = models.CharField(max_length=20, default="active")
    subscription_expiry = models.DateField(null=True, blank=True)

    # Owner and Management
    owner = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="owned_organization",
        null=True,
        blank=True,
    )

    # Audit Fields
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_organizations",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Organization"
        verbose_name_plural = "Organizations"

    def __str__(self):
        return self.name

    @property
    def total_branches(self):
        """Get total number of branches."""
        return self.branches.count()

    @property
    def active_branches(self):
        """Get number of active branches."""
        return self.branches.filter(status=Branch.ACTIVE).count()

    @property
    def total_users(self):
        """Get total number of users."""
        return self.users.count()

    @property
    def active_users(self):
        """Get number of active users."""
        return self.users.filter(status="active", is_active=True).count()


class Branch(models.Model):
    """Branch model for organization locations."""

    # Branch Types
    MAIN = "main"
    BRANCH = "branch"
    WAREHOUSE = "warehouse"
    DISTRIBUTION = "distribution"

    BRANCH_TYPE_CHOICES = [
        (MAIN, "Main Branch"),
        (BRANCH, "Branch"),
        (WAREHOUSE, "Warehouse"),
        (DISTRIBUTION, "Distribution Center"),
    ]

    # Status
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"
    CLOSED = "closed"

    STATUS_CHOICES = [
        (ACTIVE, "Active"),
        (INACTIVE, "Inactive"),
        (MAINTENANCE, "Under Maintenance"),
        (CLOSED, "Closed"),
    ]

    # Basic Information
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True, help_text="Unique branch code")
    type = models.CharField(max_length=15, choices=BRANCH_TYPE_CHOICES, default=BRANCH)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default=ACTIVE)

    # Organization Relationship
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="branches"
    )

    # Contact Information
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100, default="Nepal")

    phone = models.CharField(
        max_length=15,
        validators=[
            RegexValidator(
                regex=r"^(?:\+977[-]?\d{1,2}[-]?\d{6,8}|\d{10})$",
                message="Phone number must be entered in the format: '+977-1-234567' or '9801234567' (10 digits for local Nepali numbers).",
            )
        ],
    )
    email = models.EmailField()
    fax = models.CharField(max_length=15, blank=True)

    # Business Hours
    monday_open = models.TimeField(default="09:00:00")
    monday_close = models.TimeField(default="18:00:00")
    tuesday_open = models.TimeField(default="09:00:00")
    tuesday_close = models.TimeField(default="18:00:00")
    wednesday_open = models.TimeField(default="09:00:00")
    wednesday_close = models.TimeField(default="18:00:00")
    thursday_open = models.TimeField(default="09:00:00")
    thursday_close = models.TimeField(default="18:00:00")
    friday_open = models.TimeField(default="09:00:00")
    friday_close = models.TimeField(default="18:00:00")
    saturday_open = models.TimeField(default="09:00:00")
    saturday_close = models.TimeField(default="17:00:00")
    sunday_open = models.TimeField(null=True, blank=True)
    sunday_close = models.TimeField(null=True, blank=True)

    # Management
    manager = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="managed_branches",
    )

    # License Information
    license_number = models.CharField(max_length=50, blank=True)
    license_expiry = models.DateField(null=True, blank=True)

    # Settings
    timezone = models.CharField(max_length=50, default="Asia/Kathmandu")
    currency = models.CharField(max_length=3, default="NPR")

    # Coordinates for mapping
    latitude = models.DecimalField(
        max_digits=10,
        decimal_places=8,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
    )
    longitude = models.DecimalField(
        max_digits=11,
        decimal_places=8,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
    )

    # Audit Fields
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_branches",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["organization", "name"]
        unique_together = ["organization", "code"]
        verbose_name = "Branch"
        verbose_name_plural = "Branches"

    def __str__(self):
        return f"{self.organization.name} - {self.name}"

    @property
    def full_address(self):
        """Get full address string."""
        return f"{self.address}, {self.city}, {self.state} {self.postal_code}, {self.country}"

    @property
    def total_users(self):
        """Get total number of users in this branch."""
        return self.users.count()

    @property
    def active_users(self):
        """Get number of active users in this branch."""
        return self.users.filter(status="active", is_active=True).count()

    def is_open_today(self):
        """Check if branch is open today."""
        from datetime import datetime

        now = datetime.now()
        weekday = now.weekday()  # 0=Monday, 6=Sunday

        if weekday == 0:  # Monday
            return self.monday_open <= now.time() <= self.monday_close
        elif weekday == 1:  # Tuesday
            return self.tuesday_open <= now.time() <= self.tuesday_close
        elif weekday == 2:  # Wednesday
            return self.wednesday_open <= now.time() <= self.wednesday_close
        elif weekday == 3:  # Thursday
            return self.thursday_open <= now.time() <= self.thursday_close
        elif weekday == 4:  # Friday
            return self.friday_open <= now.time() <= self.friday_close
        elif weekday == 5:  # Saturday
            return self.saturday_open <= now.time() <= self.saturday_close
        elif weekday == 6:  # Sunday
            if self.sunday_open and self.sunday_close:
                return self.sunday_open <= now.time() <= self.sunday_close
            return False

        return False


class OrganizationSettings(models.Model):
    """Additional settings for organizations."""

    organization = models.OneToOneField(
        Organization, on_delete=models.CASCADE, related_name="settings"
    )

    # Inventory Settings
    low_stock_threshold = models.PositiveIntegerField(default=10)
    expiry_alert_days = models.PositiveIntegerField(default=30)
    auto_reorder = models.BooleanField(default=False)
    reorder_point = models.PositiveIntegerField(default=20)

    # POS Settings
    require_prescription = models.BooleanField(default=True)
    allow_discounts = models.BooleanField(default=True)
    max_discount_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal(10),
        validators=[MinValueValidator(0)],
    )

    # Notification Settings
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    low_stock_alerts = models.BooleanField(default=True)
    expiry_alerts = models.BooleanField(default=True)

    # Integration Settings
    enable_api_access = models.BooleanField(default=False)
    api_key = models.CharField(max_length=100, blank=True)
    webhook_url = models.URLField(blank=True)

    # Audit Fields
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="updated_organization_settings",
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Organization Settings"
        verbose_name_plural = "Organization Settings"

    def __str__(self):
        return f"Settings for {self.organization.name}"


class SubscriptionPlan(models.Model):
    """Subscription plan model."""
    
    TRIAL = 'trial'
    BASIC = 'basic'
    PROFESSIONAL = 'professional'
    ENTERPRISE = 'enterprise'
    
    PLAN_CHOICES = [
        (TRIAL, 'Trial'),
        (BASIC, 'Basic'),
        (PROFESSIONAL, 'Professional'),
        (ENTERPRISE, 'Enterprise'),
    ]
    
    name = models.CharField(max_length=50, choices=PLAN_CHOICES)
    display_name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default='NPR')
    billing_cycle = models.CharField(max_length=20, default='monthly')
    
    # Features
    max_users = models.IntegerField(null=True, blank=True)
    max_organizations = models.IntegerField(null=True, blank=True)
    max_branches = models.IntegerField(null=True, blank=True)
    features = models.JSONField(default=list)
    pricing_tiers = models.JSONField(default=list, help_text="List of pricing tiers with cycle and price")
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['price']
        constraints = [
            models.UniqueConstraint(
                fields=['name'],
                condition=models.Q(is_active=True),
                name='unique_active_plan_name'
            )
        ]
    
    def __str__(self):
        return self.display_name


class OrganizationSubscription(models.Model):
    """Organization subscription model."""
    
    ACTIVE = 'active'
    INACTIVE = 'inactive'
    EXPIRED = 'expired'
    CANCELLED = 'cancelled'
    
    STATUS_CHOICES = [
        (ACTIVE, 'Active'),
        (INACTIVE, 'Inactive'),
        (EXPIRED, 'Expired'),
        (CANCELLED, 'Cancelled'),
    ]
    
    organization = models.OneToOneField(
        Organization, 
        on_delete=models.CASCADE, 
        related_name='subscription'
    )
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=ACTIVE)
    
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    auto_renew = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.organization.name} - {self.plan.display_name}"
    
    @property
    def is_active(self):
        from django.utils import timezone
        return self.status == self.ACTIVE and self.end_date > timezone.now()


class BillingHistory(models.Model):
    """Billing history model for tracking payments and invoices."""
    
    INVOICE = 'invoice'
    PAYMENT = 'payment'
    REFUND = 'refund'
    CREDIT = 'credit'
    
    TRANSACTION_TYPE_CHOICES = [
        (INVOICE, 'Invoice'),
        (PAYMENT, 'Payment'),
        (REFUND, 'Refund'),
        (CREDIT, 'Credit'),
    ]
    
    PENDING = 'pending'
    COMPLETED = 'completed'
    FAILED = 'failed'
    CANCELLED = 'cancelled'
    
    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (COMPLETED, 'Completed'),
        (FAILED, 'Failed'),
        (CANCELLED, 'Cancelled'),
    ]
    
    organization = models.ForeignKey(
        Organization, 
        on_delete=models.CASCADE, 
        related_name='billing_history'
    )
    subscription = models.ForeignKey(
        OrganizationSubscription, 
        on_delete=models.CASCADE,
        related_name='billing_records',
        null=True,
        blank=True
    )
    
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='NPR')
    
    invoice_number = models.CharField(max_length=50, unique=True, null=True, blank=True)
    payment_method = models.CharField(max_length=50, blank=True)
    payment_reference = models.CharField(max_length=100, blank=True)
    
    description = models.TextField(blank=True)
    billing_period_start = models.DateField(null=True, blank=True)
    billing_period_end = models.DateField(null=True, blank=True)
    
    due_date = models.DateField(null=True, blank=True)
    paid_date = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Billing History'
        verbose_name_plural = 'Billing History'
    
    def __str__(self):
        return f"{self.organization.name} - {self.transaction_type} - {self.amount} {self.currency}"
