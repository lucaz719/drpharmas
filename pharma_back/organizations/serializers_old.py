from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from django.conf import settings
from django.contrib.auth import get_user_model

from .models import Organization, Branch, OrganizationSettings, SubscriptionPlan, OrganizationSubscription


class OrganizationSerializer(serializers.ModelSerializer):
    """Basic organization serializer."""
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    total_branches = serializers.IntegerField(read_only=True)
    active_branches = serializers.IntegerField(read_only=True)
    total_users = serializers.IntegerField(read_only=True)
    active_users = serializers.IntegerField(read_only=True)

    class Meta:
        model = Organization
        fields = [
            'id', 'name', 'type', 'status', 'owner', 'owner_name',
            'address', 'city', 'state', 'postal_code', 'country',
            'phone', 'email', 'website', 'license_number', 'license_expiry',
            'tax_id', 'registration_number', 'currency', 'tax_rate',
            'timezone', 'language', 'subscription_plan', 'subscription_status',
            'subscription_expiry', 'total_branches', 'active_branches',
            'total_users', 'active_users', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class OrganizationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating organizations."""
    owner = serializers.PrimaryKeyRelatedField(
        queryset=get_user_model().objects.all(),
        required=False,
        allow_null=True
    )

    # Explicitly define required fields
    name = serializers.CharField(required=True)
    address = serializers.CharField(required=True)
    city = serializers.CharField(required=True)
    state = serializers.CharField(required=True)
    postal_code = serializers.CharField(required=True)
    phone = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    license_number = serializers.CharField(required=True)
    license_expiry = serializers.DateField(required=True)

    # Optional fields with defaults
    type = serializers.ChoiceField(
        choices=Organization.ORGANIZATION_TYPE_CHOICES,
        required=False,
        default=Organization.RETAIL_PHARMACY
    )
    country = serializers.CharField(required=False, default='Nepal')
    website = serializers.URLField(required=False, allow_blank=True)
    tax_id = serializers.CharField(required=False, allow_blank=True)
    registration_number = serializers.CharField(required=False, allow_blank=True)
    currency = serializers.CharField(required=False, default='NPR')
    tax_rate = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        required=False,
        default=13.00
    )
    timezone = serializers.CharField(required=False, default='Asia/Kathmandu')
    language = serializers.CharField(required=False, default='en')
    subscription_plan = serializers.CharField(required=False, default='basic')
    subscription_status = serializers.CharField(required=False, default='active')
    subscription_expiry = serializers.DateField(required=False, allow_null=True)

    class Meta:
        model = Organization
        fields = [
            'name', 'type', 'owner', 'address', 'city', 'state',
            'postal_code', 'country', 'phone', 'email', 'website',
            'license_number', 'license_expiry', 'tax_id', 'registration_number',
            'currency', 'tax_rate', 'timezone', 'language',
            'subscription_plan', 'subscription_status', 'subscription_expiry'
        ]

    def validate_license_number(self, value):
        """Validate license number uniqueness."""
        if Organization.objects.filter(license_number=value).exists():
            raise serializers.ValidationError(_('License number already exists.'))
        return value

    def validate_email(self, value):
        """Validate email uniqueness."""
        if Organization.objects.filter(email=value).exists():
            raise serializers.ValidationError(_('Email already exists.'))
        return value


class OrganizationUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating organizations."""

    class Meta:
        model = Organization
        fields = [
            'name', 'type', 'status', 'address', 'city', 'state',
            'postal_code', 'country', 'phone', 'email', 'website',
            'license_number', 'license_expiry', 'tax_id', 'registration_number',
            'currency', 'tax_rate', 'timezone', 'language',
            'subscription_plan', 'subscription_status', 'subscription_expiry'
        ]

    def validate_license_number(self, value):
        """Validate license number uniqueness excluding current instance."""
        instance = self.instance
        if instance and Organization.objects.filter(license_number=value).exclude(id=instance.id).exists():
            raise serializers.ValidationError(_('License number already exists.'))
        elif not instance and Organization.objects.filter(license_number=value).exists():
            raise serializers.ValidationError(_('License number already exists.'))
        return value

    def validate_email(self, value):
        """Validate email uniqueness excluding current instance."""
        instance = self.instance
        if instance and Organization.objects.filter(email=value).exclude(id=instance.id).exists():
            raise serializers.ValidationError(_('Email already exists.'))
        elif not instance and Organization.objects.filter(email=value).exists():
            raise serializers.ValidationError(_('Email already exists.'))
        return value


class BranchSerializer(serializers.ModelSerializer):
    """Basic branch serializer."""
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    manager_name = serializers.CharField(source='manager.get_full_name', read_only=True)
    total_users = serializers.IntegerField(read_only=True)
    active_users = serializers.IntegerField(read_only=True)
    full_address = serializers.CharField(read_only=True)

    class Meta:
        model = Branch
        fields = [
            'id', 'name', 'code', 'type', 'status', 'organization',
            'organization_name', 'address', 'city', 'state', 'postal_code',
            'country', 'full_address', 'phone', 'email', 'fax',
            'manager', 'manager_name', 'license_number', 'license_expiry',
            'timezone', 'currency', 'latitude', 'longitude',
            'monday_open', 'monday_close', 'tuesday_open', 'tuesday_close',
            'wednesday_open', 'wednesday_close', 'thursday_open', 'thursday_close',
            'friday_open', 'friday_close', 'saturday_open', 'saturday_close',
            'sunday_open', 'sunday_close', 'total_users', 'active_users',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class BranchCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating branches."""

    class Meta:
        model = Branch
        fields = [
            'name', 'code', 'type', 'organization', 'address', 'city', 'state',
            'postal_code', 'country', 'phone', 'email', 'fax', 'manager',
            'license_number', 'license_expiry', 'timezone', 'currency',
            'latitude', 'longitude', 'monday_open', 'monday_close',
            'tuesday_open', 'tuesday_close', 'wednesday_open', 'wednesday_close',
            'thursday_open', 'thursday_close', 'friday_open', 'friday_close',
            'saturday_open', 'saturday_close', 'sunday_open', 'sunday_close'
        ]

    def validate_code(self, value):
        """Validate branch code uniqueness within organization."""
        if Branch.objects.filter(code=value).exists():
            raise serializers.ValidationError(_('Branch code already exists.'))
        return value

    def validate(self, attrs):
        """Validate branch creation."""
        organization = attrs.get('organization')
        manager = attrs.get('manager')

        # Validate manager belongs to the organization
        if manager and manager.organization != organization:
            raise serializers.ValidationError({
                'manager': _('Manager must belong to the selected organization.')
            })

        return attrs


class BranchUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating branches."""

    class Meta:
        model = Branch
        fields = [
            'name', 'type', 'status', 'address', 'city', 'state',
            'postal_code', 'country', 'phone', 'email', 'fax', 'manager',
            'license_number', 'license_expiry', 'timezone', 'currency',
            'latitude', 'longitude', 'monday_open', 'monday_close',
            'tuesday_open', 'tuesday_close', 'wednesday_open', 'wednesday_close',
            'thursday_open', 'thursday_close', 'friday_open', 'friday_close',
            'saturday_open', 'saturday_close', 'sunday_open', 'sunday_close'
        ]

    def validate_code(self, value):
        """Validate branch code uniqueness within organization."""
        instance = self.instance
        if instance and Branch.objects.filter(code=value).exclude(id=instance.id).exists():
            raise serializers.ValidationError(_('Branch code already exists.'))
        elif not instance and Branch.objects.filter(code=value).exists():
            raise serializers.ValidationError(_('Branch code already exists.'))
        return value

    def validate(self, attrs):
        """Validate branch update."""
        instance = self.instance
        organization = instance.organization if instance else attrs.get('organization')
        manager = attrs.get('manager')

        # Validate manager belongs to the organization
        if manager and manager.organization != organization:
            raise serializers.ValidationError({
                'manager': _('Manager must belong to the selected organization.')
            })

        return attrs


class OrganizationSettingsSerializer(serializers.ModelSerializer):
    """Organization settings serializer."""

    class Meta:
        model = OrganizationSettings
        fields = [
            'id', 'low_stock_threshold', 'expiry_alert_days', 'auto_reorder',
            'reorder_point', 'require_prescription', 'allow_discounts',
            'max_discount_percent', 'email_notifications', 'sms_notifications',
            'low_stock_alerts', 'expiry_alerts', 'enable_api_access',
            'api_key', 'webhook_url', 'updated_at'
        ]
        read_only_fields = ['id', 'updated_at']


class OrganizationStatsSerializer(serializers.Serializer):
    """Serializer for organization statistics."""
    total_organizations = serializers.IntegerField()
    active_organizations = serializers.IntegerField()
    total_branches = serializers.IntegerField()
    active_branches = serializers.IntegerField()
    organization_name = serializers.CharField(allow_null=True)
    total_users = serializers.IntegerField()
    active_users = serializers.IntegerField()
    branch_name = serializers.CharField(allow_null=True)
    branch_users = serializers.IntegerField()
    branch_active_users = serializers.IntegerField()


class OrganizationWithOwnerSerializer(serializers.Serializer):
    """Serializer for creating organization with owner."""

    # Organization fields
    name = serializers.CharField(max_length=200)
    type = serializers.ChoiceField(choices=Organization.ORGANIZATION_TYPE_CHOICES)
    address = serializers.CharField()
    city = serializers.CharField(max_length=100)
    state = serializers.CharField(max_length=100)
    postal_code = serializers.CharField(max_length=20)
    country = serializers.CharField(max_length=100, default='Nepal')
    phone = serializers.CharField(max_length=15)
    email = serializers.EmailField()
    website = serializers.URLField(required=False)
    license_number = serializers.CharField(max_length=50)
    license_expiry = serializers.DateField()
    tax_id = serializers.CharField(max_length=50, required=False)
    registration_number = serializers.CharField(max_length=50, required=False)
    currency = serializers.CharField(max_length=3, default='NPR')
    tax_rate = serializers.DecimalField(max_digits=5, decimal_places=2, default=13.00)
    timezone = serializers.CharField(max_length=50, default='Asia/Kathmandu')
    language = serializers.CharField(max_length=10, default='en')
    subscription_plan = serializers.CharField(max_length=50, default='basic')
    subscription_status = serializers.CharField(max_length=20, default='active')
    subscription_expiry = serializers.DateField(required=False, allow_null=True)

    # Owner fields (nested)
    owner = serializers.DictField(required=False, allow_empty=True)

    def validate_license_number(self, value):
        """Validate license number uniqueness."""
        if Organization.objects.filter(license_number=value).exists():
            raise serializers.ValidationError(_('License number already exists.'))
        return value

    def validate_email(self, value):
        """Validate email uniqueness."""
        if Organization.objects.filter(email=value).exists():
            raise serializers.ValidationError(_('Email already exists.'))
        return value


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    """Subscription plan serializer."""
    
    class Meta:
        model = SubscriptionPlan
        fields = [
            'id', 'name', 'display_name', 'price', 'currency', 'billing_cycle',
            'max_users', 'max_organizations', 'max_branches', 'features', 'pricing_tiers', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class OrganizationSubscriptionSerializer(serializers.ModelSerializer):
    """Organization subscription serializer."""
    plan_details = SubscriptionPlanSerializer(source='plan', read_only=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = OrganizationSubscription
        fields = [
            'id', 'organization', 'organization_name', 'plan', 'plan_details',
            'status', 'start_date', 'end_date', 'auto_renew', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SubscriptionStatsSerializer(serializers.Serializer):
    """Subscription statistics serializer."""
    total_organizations = serializers.IntegerField()
    active_subscriptions = serializers.IntegerField()
    monthly_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    growth_rate = serializers.FloatField()
    subscription_distribution = serializers.DictField()
    recent_subscriptions = OrganizationSubscriptionSerializer(many=True)
    
    def create(self, validated_data):
        if 'pricing_tiers' in validated_data and validated_data['pricing_tiers']:
            validated_data['price'] = float(validated_data['pricing_tiers'][0]['price'])
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        if 'pricing_tiers' in validated_data and validated_data['pricing_tiers']:
            validated_data['price'] = float(validated_data['pricing_tiers'][0]['price'])
        return super().update(instance, validated_data)
        extra_kwargs = {'price': {'required': False}}
    
    def create(self, validated_data):
        if 'pricing_tiers' in validated_data and validated_data['pricing_tiers']:
            validated_data['price'] = float(validated_data['pricing_tiers'][0]['price'])
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        if 'pricing_tiers' in validated_data and validated_data['pricing_tiers']:
            validated_data['price'] = float(validated_data['pricing_tiers'][0]['price'])
        return super().update(instance, validated_data)