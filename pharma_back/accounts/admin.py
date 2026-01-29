from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import Group

from .models import User, UserPermission, UserActivity


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """Custom admin for User model."""

    # Display fields in list view
    list_display = [
        'email', 'get_full_name', 'role', 'status', 'organization_id',
        'branch_id', 'is_active', 'last_login', 'created_at'
    ]

    # Filter options
    list_filter = [
        'role', 'status', 'is_active', 'organization_id', 'branch_id',
        'is_supplier', 'created_at', 'last_login'
    ]

    # Search fields
    search_fields = [
        'email', 'first_name', 'last_name', 'phone',
        'employee_id', 'license_number'
    ]

    # Ordering
    ordering = ['-created_at']

    # Fieldsets for add/edit forms
    fieldsets = (
        (_('Basic Information'), {
            'fields': (
                'email', 'first_name', 'last_name', 'phone',
                'password', 'role', 'status', 'is_active'
            )
        }),
        (_('Organization & Branch'), {
            'fields': ('organization_id', 'branch_id')
        }),
        (_('Professional Information'), {
            'fields': (
                'employee_id', 'license_number', 'license_expiry',
                'qualifications', 'date_of_birth'
            )
        }),
        (_('Contact Information'), {
            'fields': ('address', 'emergency_contact', 'emergency_phone')
        }),
        (_('Supplier Information'), {
            'fields': ('is_supplier', 'supplier_company', 'supplier_license'),
            'classes': ('collapse',)
        }),
        (_('Performance Tracking'), {
            'fields': ('collection_amount', 'sales_target', 'collection_target'),
            'classes': ('collapse',)
        }),
        (_('Permissions'), {
            'fields': ('is_staff', 'is_superuser', 'groups', 'user_permissions'),
            'classes': ('collapse',)
        }),
        (_('Important Dates'), {
            'fields': ('last_login', 'date_joined'),
            'classes': ('collapse',)
        }),
    )

    # Fieldsets for add form
    add_fieldsets = (
        (_('Create User'), {
            'classes': ('wide',),
            'fields': (
                'email', 'first_name', 'last_name', 'phone',
                'password1', 'password2', 'role', 'organization_id', 'branch_id'
            ),
        }),
    )

    # Read-only fields
    readonly_fields = ['created_at', 'updated_at', 'last_login']

    # Custom methods
    def get_full_name(self, obj):
        return obj.get_full_name()
    get_full_name.short_description = _('Full Name')

    def get_queryset(self, request):
        """Filter queryset based on user permissions."""
        qs = super().get_queryset(request)

        # Superusers can see all users
        if request.user.is_superuser:
            return qs

        # Organization owners can see users in their organization
        if hasattr(request.user, 'role') and request.user.role == User.PHARMACY_OWNER:
            return qs.filter(organization_id=request.user.organization_id)

        # Branch managers can see users in their branch
        if hasattr(request.user, 'role') and request.user.role == User.BRANCH_MANAGER:
            return qs.filter(
                organization_id=request.user.organization_id,
                branch_id=request.user.branch_id
            )

        # Regular users can only see themselves
        return qs.filter(id=request.user.id)

    def has_change_permission(self, request, obj=None):
        """Check if user can change this object."""
        if not super().has_change_permission(request, obj):
            return False

        if obj is None:
            return True

        # Users can edit their own profile
        if obj.id == request.user.id:
            return True

        # Superusers can edit anyone
        if request.user.is_superuser:
            return True

        # Check role-based permissions
        if hasattr(request.user, 'role'):
            user_role = request.user.role

            if user_role == User.PHARMACY_OWNER:
                return obj.organization_id == request.user.organization_id
            elif user_role == User.BRANCH_MANAGER:
                return (obj.organization_id == request.user.organization_id and
                       obj.branch_id == request.user.branch_id)

        return False

    def has_delete_permission(self, request, obj=None):
        """Check if user can delete this object."""
        if not super().has_delete_permission(request, obj):
            return False

        if obj is None:
            return True

        # Users cannot delete themselves
        if obj.id == request.user.id:
            return False

        # Superusers can delete anyone
        if request.user.is_superuser:
            return True

        # Check role-based permissions
        if hasattr(request.user, 'role'):
            user_role = request.user.role

            if user_role == User.PHARMACY_OWNER:
                return obj.organization_id == request.user.organization_id
            elif user_role == User.BRANCH_MANAGER:
                return (obj.organization_id == request.user.organization_id and
                       obj.branch_id == request.user.branch_id)

        return False


@admin.register(UserPermission)
class UserPermissionAdmin(admin.ModelAdmin):
    """Admin for UserPermission model."""

    list_display = ['user', 'permission', 'granted_by', 'granted_at', 'expires_at']
    list_filter = ['permission', 'granted_at', 'expires_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'permission']
    readonly_fields = ['granted_at']

    def get_queryset(self, request):
        """Filter queryset based on user permissions."""
        qs = super().get_queryset(request)

        if request.user.is_superuser:
            return qs

        if hasattr(request.user, 'role'):
            if request.user.role == User.PHARMACY_OWNER:
                return qs.filter(user__organization_id=request.user.organization_id)
            elif request.user.role == User.BRANCH_MANAGER:
                return qs.filter(
                    user__organization_id=request.user.organization_id,
                    user__branch_id=request.user.branch_id
                )

        return qs.filter(user=request.user)


@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    """Admin for UserActivity model."""

    list_display = ['user', 'action', 'timestamp', 'ip_address']
    list_filter = ['action', 'timestamp']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'action']
    readonly_fields = ['timestamp', 'metadata']

    def get_queryset(self, request):
        """Filter queryset based on user permissions."""
        qs = super().get_queryset(request)

        if request.user.is_superuser:
            return qs

        if hasattr(request.user, 'role'):
            if request.user.role == User.PHARMACY_OWNER:
                return qs.filter(user__organization_id=request.user.organization_id)
            elif request.user.role == User.BRANCH_MANAGER:
                return qs.filter(
                    user__organization_id=request.user.organization_id,
                    user__branch_id=request.user.branch_id
                )

        return qs.filter(user=request.user)


# Unregister the default Group model since we're using role-based permissions
admin.site.unregister(Group)

# Customize admin site
admin.site.site_header = "MediPro Pharmacy System"
admin.site.site_title = "MediPro Admin"
admin.site.index_title = "Welcome to MediPro Administration"