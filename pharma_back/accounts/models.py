from decimal import Decimal

from django.conf import settings
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import MinValueValidator, RegexValidator
from django.db import models
from django.utils.translation import gettext_lazy as _


class UserManager(BaseUserManager):
    """Custom manager for User model with role-based creation."""

    def _create_user(self, email, password, **extra_fields):
        """Create and save a user with the given email and password."""
        if not email:
            raise ValueError("The Email must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        """Create a regular user."""
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        """Create a superuser."""
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", User.SUPER_ADMIN)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Custom User model with role-based permissions for pharmacy system."""

    # User Roles
    SUPER_ADMIN = "super_admin"
    PHARMACY_OWNER = "pharmacy_owner"
    BRANCH_MANAGER = "branch_manager"
    SENIOR_PHARMACIST = "senior_pharmacist"
    PHARMACIST = "pharmacist"
    PHARMACY_TECHNICIAN = "pharmacy_technician"
    CASHIER = "cashier"
    SUPPLIER_ADMIN = "supplier_admin"
    SALES_REPRESENTATIVE = "sales_representative"

    ROLE_CHOICES = [
        (SUPER_ADMIN, "Super Administrator"),
        (PHARMACY_OWNER, "Pharmacy Owner"),
        (BRANCH_MANAGER, "Branch Manager"),
        (SENIOR_PHARMACIST, "Senior Pharmacist"),
        (PHARMACIST, "Pharmacist"),
        (PHARMACY_TECHNICIAN, "Pharmacy Technician"),
        (CASHIER, "Cashier"),
        (SUPPLIER_ADMIN, "Supplier Administrator"),
        (SALES_REPRESENTATIVE, "Sales Representative"),
    ]

    # User Status
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

    STATUS_CHOICES = [
        (ACTIVE, "Active"),
        (INACTIVE, "Inactive"),
        (SUSPENDED, "Suspended"),
    ]

    # Remove username field and use email as username
    username = None
    email = models.EmailField(_("email address"), unique=True)
    phone = models.CharField(
        max_length=15,
        validators=[
            RegexValidator(
                regex=r"^(?:\+977[-]?\d{1,2}[-]?\d{6,8}|\d{10})$",
                message="Phone number must be entered in the format: '+977-1-234567' or '9801234567' (10 digits for local Nepali numbers).",
            )
        ],
    )

    # Role and permissions
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=PHARMACIST)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=ACTIVE)

    # Organization and Branch relationships (will be added after initial migration)
    # organization = models.ForeignKey(
    #     'organizations.Organization',
    #     on_delete=models.CASCADE,
    #     null=True,
    #     blank=True,
    #     related_name='users'
    # )
    # branch = models.ForeignKey(
    #     'organizations.Branch',
    #     on_delete=models.SET_NULL,
    #     null=True,
    #     blank=True,
    #     related_name='users'
    # )

    # Temporary fields for organization and branch (will be replaced with foreign keys)
    organization_id = models.IntegerField(null=True, blank=True)
    branch_id = models.IntegerField(null=True, blank=True)

    # Profile information
    employee_id = models.CharField(max_length=20, unique=True, null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    address = models.TextField(blank=True)
    emergency_contact = models.CharField(max_length=100, blank=True)
    emergency_phone = models.CharField(max_length=15, blank=True)

    # Professional information
    license_number = models.CharField(max_length=50, blank=True)
    license_expiry = models.DateField(null=True, blank=True)
    qualifications = models.TextField(blank=True)

    # Performance tracking
    collection_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal(0),
        validators=[MinValueValidator(0)],
        help_text="Monthly collection amount",
    )
    sales_target = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal(0),
        validators=[MinValueValidator(0)],
    )
    collection_target = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal(0),
        validators=[MinValueValidator(0)],
    )

    # Supplier specific fields (for users who are also suppliers)
    is_supplier = models.BooleanField(default=False)
    supplier_company = models.CharField(max_length=100, blank=True)
    supplier_license = models.CharField(max_length=50, blank=True)

    # Plain text password storage (for display purposes only)
    plain_text_password = models.CharField(
        max_length=128,
        blank=True,
        help_text="Plain text password for display purposes (not for authentication)",
    )

    # Audit fields
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_users",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Manager
    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name", "phone"]

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "User"
        verbose_name_plural = "Users"
        permissions = [
            ("can_manage_organization", "Can manage organization"),
            ("can_manage_branches", "Can manage branches"),
            ("can_manage_users", "Can manage users"),
            ("can_manage_inventory", "Can manage inventory"),
            ("can_manage_pos", "Can manage POS"),
            ("can_manage_suppliers", "Can manage suppliers"),
            ("can_manage_customers", "Can manage customers"),
            ("can_view_reports", "Can view reports"),
            ("can_manage_compliance", "Can manage compliance"),
        ]

    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"

    def get_full_name(self):
        """Return the first_name plus the last_name, with a space in between."""
        full_name = f"{self.first_name} {self.last_name}".strip()
        return full_name or self.email

    def get_role_display_name(self):
        """Get human-readable role name."""
        return dict(self.ROLE_CHOICES).get(self.role, self.role)

    def has_organization_permission(self, permission):
        """Check if user has organization-level permission."""
        if self.role == self.SUPER_ADMIN:
            return True
        if self.role == self.PHARMACY_OWNER:
            return True
        return False

    def has_branch_permission(self, permission):
        """Check if user has branch-level permission."""
        if self.role in [self.SUPER_ADMIN, self.PHARMACY_OWNER, self.BRANCH_MANAGER]:
            return True
        return False

    def can_manage_inventory(self):
        """Check if user can manage inventory."""
        allowed_roles = [
            self.SUPER_ADMIN,
            self.PHARMACY_OWNER,
            self.BRANCH_MANAGER,
            self.SENIOR_PHARMACIST,
            self.PHARMACIST,
            self.PHARMACY_TECHNICIAN,
        ]
        return self.role in allowed_roles

    def can_manage_pos(self):
        """Check if user can manage POS."""
        allowed_roles = [
            self.SUPER_ADMIN,
            self.PHARMACY_OWNER,
            self.BRANCH_MANAGER,
            self.SENIOR_PHARMACIST,
            self.PHARMACIST,
            self.PHARMACY_TECHNICIAN,
            self.CASHIER,
        ]
        return self.role in allowed_roles

    def can_manage_prescriptions(self):
        """Check if user can manage prescriptions."""
        allowed_roles = [
            self.SUPER_ADMIN,
            self.PHARMACY_OWNER,
            self.BRANCH_MANAGER,
            self.SENIOR_PHARMACIST,
            self.PHARMACIST,
        ]
        return self.role in allowed_roles

    def is_supplier_user(self):
        """Check if user is a supplier."""
        return self.role in [self.SUPPLIER_ADMIN, self.SALES_REPRESENTATIVE] or self.is_supplier

    @property
    def is_active_user(self):
        """Check if user is active."""
        return self.status == self.ACTIVE and self.is_active

    @property
    def organization_name(self):
        """Get organization name."""
        if self.organization_id:
            try:
                from organizations.models import Organization

                org = Organization.objects.get(id=self.organization_id)
                return org.name
            except:
                pass
        return None

    @property
    def branch_name(self):
        """Get branch name."""
        if self.branch_id:
            try:
                from organizations.models import Branch

                branch = Branch.objects.get(id=self.branch_id)
                return branch.name
            except:
                pass
        return None


class UserPermission(models.Model):
    """Custom permissions for users beyond Django's default permissions."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="custom_permissions")
    permission = models.CharField(max_length=100)
    granted_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="granted_permissions"
    )
    granted_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ["user", "permission"]
        ordering = ["-granted_at"]

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.permission}"


class UserActivity(models.Model):
    """Track user activities for audit purposes."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="activities")
    action = models.CharField(max_length=100)
    description = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-timestamp"]
        verbose_name_plural = "User Activities"

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.action} - {self.timestamp}"
