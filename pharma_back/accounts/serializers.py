from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, UserPermission, UserActivity


class UserSerializer(serializers.ModelSerializer):
    """Basic user serializer."""
    full_name = serializers.CharField(read_only=True)
    role_display = serializers.CharField(source='get_role_display_name', read_only=True)
    organization_name = serializers.SerializerMethodField()
    branch_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'phone', 'role', 'role_display', 'status', 'is_active',
            'organization_id', 'organization_name', 'branch_id', 'branch_name',
            'employee_id', 'date_of_birth', 'address', 'emergency_contact',
            'emergency_phone', 'license_number', 'license_expiry',
            'qualifications', 'collection_amount', 'sales_target',
            'collection_target', 'is_supplier', 'supplier_company',
            'supplier_license', 'plain_text_password', 'last_login', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_login']
    
    def get_organization_name(self, obj):
        """Get organization name from organization_id"""
        if obj.organization_id:
            try:
                from organizations.models import Organization
                org = Organization.objects.get(id=obj.organization_id)
                return org.name
            except Organization.DoesNotExist:
                return 'N/A'
        return 'N/A'
    
    def get_branch_name(self, obj):
        """Get branch name from branch_id"""
        if obj.branch_id:
            try:
                from organizations.models import Branch
                branch = Branch.objects.get(id=obj.branch_id)
                return branch.name
            except Branch.DoesNotExist:
                return 'N/A'
        return 'N/A'


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new users."""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'email', 'first_name', 'last_name', 'phone', 'password',
            'password_confirm', 'role', 'organization_id', 'branch_id',
            'employee_id', 'date_of_birth', 'address', 'emergency_contact',
            'emergency_phone', 'license_number', 'license_expiry',
            'qualifications', 'is_supplier', 'supplier_company',
            'supplier_license'
        ]

    def validate(self, attrs):
        """Validate user creation data."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': _('Passwords do not match.')
            })

        # Check role-based permissions
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            current_user = request.user

            # Super admin can create any role
            if current_user.role == User.SUPER_ADMIN:
                pass
            # Pharmacy owner can create roles within their organization
            elif current_user.role == User.PHARMACY_OWNER:
                if attrs.get('organization_id') != current_user.organization_id:
                    raise serializers.ValidationError({
                        'organization_id': _('Cannot create users for other organizations.')
                    })
                # Cannot create super admin or pharmacy owner roles
                if attrs['role'] in [User.SUPER_ADMIN, User.PHARMACY_OWNER]:
                    raise serializers.ValidationError({
                        'role': _('Insufficient permissions to create this role.')
                    })
            # Branch managers can only create lower-level roles in their branch
            elif current_user.role in [User.BRANCH_MANAGER, User.SENIOR_PHARMACIST]:
                if attrs.get('organization_id') != current_user.organization_id:
                    raise serializers.ValidationError({
                        'organization_id': _('Cannot create users for other organizations.')
                    })
                if attrs.get('branch_id') != current_user.branch_id:
                    raise serializers.ValidationError({
                        'branch_id': _('Cannot create users for other branches.')
                    })
                # Can only create pharmacist, technician, or cashier roles
                allowed_roles = [User.PHARMACIST, User.PHARMACY_TECHNICIAN, User.CASHIER]
                if attrs['role'] not in allowed_roles:
                    raise serializers.ValidationError({
                        'role': _('Insufficient permissions to create this role.')
                    })
            else:
                raise serializers.ValidationError({
                    'role': _('Insufficient permissions to create users.')
                })

        return attrs

    def create(self, validated_data):
        """Create user with encrypted password and store plain text."""
        validated_data.pop('password_confirm')
        plain_password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(plain_password)
        user.plain_text_password = plain_password  # Store plain text password
        user.save()
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user information."""

    class Meta:
        model = User
        fields = [
            'email', 'first_name', 'last_name', 'phone', 'role', 'status',
            'organization_id', 'branch_id', 'employee_id', 'date_of_birth',
            'address', 'emergency_contact', 'emergency_phone',
            'license_number', 'license_expiry', 'qualifications',
            'is_supplier', 'supplier_company', 'supplier_license',
            'collection_amount', 'sales_target', 'collection_target'
        ]
        read_only_fields = ['email']  # Email should not be changed

    def validate(self, attrs):
        """Validate user update data."""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            current_user = request.user
            instance = self.instance

            # Super admin can update anything
            if current_user.role == User.SUPER_ADMIN:
                pass
            # Users can update their own profile
            elif instance and instance.id == current_user.id:
                # Regular users can only update basic info, not role/organization
                allowed_fields = [
                    'first_name', 'last_name', 'phone', 'date_of_birth',
                    'address', 'emergency_contact', 'emergency_phone'
                ]
                for field in attrs.keys():
                    if field not in allowed_fields:
                        raise serializers.ValidationError({
                            field: _('Cannot update this field.')
                        })
            # Pharmacy owners can update users in their organization
            elif current_user.role == User.PHARMACY_OWNER:
                if instance and instance.organization_id != current_user.organization_id:
                    raise serializers.ValidationError({
                        'organization_id': _('Cannot update users from other organizations.')
                    })
                # Cannot change role to super admin or pharmacy owner
                if 'role' in attrs and attrs['role'] in [User.SUPER_ADMIN, User.PHARMACY_OWNER]:
                    raise serializers.ValidationError({
                        'role': _('Insufficient permissions to assign this role.')
                    })
            # Branch managers can update users in their branch
            elif current_user.role in [User.BRANCH_MANAGER, User.SENIOR_PHARMACIST]:
                if instance and (instance.organization_id != current_user.organization_id or
                               instance.branch_id != current_user.branch_id):
                    raise serializers.ValidationError({
                        'branch_id': _('Cannot update users from other branches.')
                    })
                # Can only assign lower-level roles
                if 'role' in attrs:
                    allowed_roles = [User.PHARMACIST, User.PHARMACY_TECHNICIAN, User.CASHIER]
                    if attrs['role'] not in allowed_roles:
                        raise serializers.ValidationError({
                            'role': _('Insufficient permissions to assign this role.')
                        })
            else:
                raise serializers.ValidationError({
                    'detail': _('Insufficient permissions to update users.')
                })

        return attrs


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        """Validate login credentials."""
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(email=email, password=password)
            if not user:
                raise serializers.ValidationError({
                    'detail': _('Invalid email or password.')
                })
            if not user.is_active:
                raise serializers.ValidationError({
                    'detail': _('Account is disabled.')
                })
            attrs['user'] = user
        else:
            raise serializers.ValidationError({
                'detail': _('Must include email and password.')
            })

        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password."""
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs):
        """Validate password change data."""
        request = self.context.get('request')
        user = request.user if request else None

        if not user:
            raise serializers.ValidationError({
                'detail': _('Authentication required.')
            })

        # Check old password
        if not user.check_password(attrs['old_password']):
            raise serializers.ValidationError({
                'old_password': _('Current password is incorrect.')
            })

        # Check new passwords match
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': _('New passwords do not match.')
            })

        # Check new password is different from old
        if user.check_password(attrs['new_password']):
            raise serializers.ValidationError({
                'new_password': _('New password must be different from current password.')
            })

        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile information."""
    full_name = serializers.CharField(read_only=True)
    role_display = serializers.CharField(source='get_role_display_name', read_only=True)
    organization_name = serializers.CharField(read_only=True)
    branch_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'phone', 'role', 'role_display', 'organization_id',
            'organization_name', 'branch_id', 'branch_name',
            'employee_id', 'date_of_birth', 'address',
            'emergency_contact', 'emergency_phone', 'license_number',
            'license_expiry', 'qualifications', 'last_login'
        ]
        read_only_fields = ['id', 'email', 'role', 'organization_id', 'branch_id', 'last_login']


class UserStatsSerializer(serializers.Serializer):
    """Serializer for user statistics."""
    total_users = serializers.IntegerField()
    active_users = serializers.IntegerField()
    inactive_users = serializers.IntegerField()
    recent_logins = serializers.IntegerField()


class UserPermissionsSerializer(serializers.Serializer):
    """Serializer for user permissions."""
    permissions = serializers.ListField(child=serializers.CharField())
    role = serializers.CharField()
    organization = serializers.CharField(allow_null=True)
    branch = serializers.CharField(allow_null=True)


class UserPermissionSerializer(serializers.ModelSerializer):
    """Serializer for UserPermission model."""
    granted_by_name = serializers.CharField(source='granted_by.get_full_name', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = UserPermission
        fields = [
            'id', 'user', 'user_name', 'permission', 'granted_by',
            'granted_by_name', 'granted_at', 'expires_at'
        ]
        read_only_fields = ['id', 'granted_at']


class ModulePermissionSerializer(serializers.Serializer):
    """Serializer for module-based permissions."""
    module_id = serializers.CharField()
    module_name = serializers.CharField()
    has_access = serializers.BooleanField()
    sub_modules = serializers.ListField(child=serializers.DictField())


class UserActivitySerializer(serializers.ModelSerializer):
    """Serializer for UserActivity model."""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = UserActivity
        fields = [
            'id', 'user', 'user_name', 'action', 'description', 
            'ip_address', 'user_agent', 'timestamp', 'metadata'
        ]
        read_only_fields = ['id', 'timestamp']
