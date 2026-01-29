"""
Script to create sample subscription plans and data.
Run this after migrations: python manage.py shell < organizations/create_subscription_data.py
"""

from organizations.models import SubscriptionPlan, OrganizationSubscription, Organization
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

# Create subscription plans
plans_data = [
    {
        'name': 'trial',
        'display_name': 'Trial',
        'price': Decimal('0'),
        'currency': 'NPR',
        'billing_cycle': 'monthly',
        'max_users': 10,
        'max_organizations': 1,
        'features': [
            'Basic features',
            'Up to 10 users',
            '1 organization',
            'Community support'
        ],
        'is_active': True
    },
    {
        'name': 'basic',
        'display_name': 'Basic',
        'price': Decimal('5000'),
        'currency': 'NPR',
        'billing_cycle': 'monthly',
        'max_users': 50,
        'max_organizations': 5,
        'features': [
            'All trial features',
            'Up to 50 users',
            '5 organizations',
            'Email support',
            'Basic reporting'
        ],
        'is_active': True
    },
    {
        'name': 'professional',
        'display_name': 'Professional',
        'price': Decimal('15000'),
        'currency': 'NPR',
        'billing_cycle': 'monthly',
        'max_users': None,  # Unlimited
        'max_organizations': None,  # Unlimited
        'features': [
            'All basic features',
            'Unlimited users',
            'Unlimited organizations',
            'Priority support',
            'Advanced reporting',
            'API access'
        ],
        'is_active': True
    },
    {
        'name': 'enterprise',
        'display_name': 'Enterprise',
        'price': Decimal('50000'),
        'currency': 'NPR',
        'billing_cycle': 'monthly',
        'max_users': None,  # Unlimited
        'max_organizations': None,  # Unlimited
        'features': [
            'All professional features',
            'Custom integrations',
            'Dedicated support',
            'SLA guarantee',
            'White-label option'
        ],
        'is_active': True
    }
]

print("Creating subscription plans...")

for plan_data in plans_data:
    plan, created = SubscriptionPlan.objects.get_or_create(
        name=plan_data['name'],
        defaults=plan_data
    )
    if created:
        print(f"Created plan: {plan.display_name}")
    else:
        print(f"Plan already exists: {plan.display_name}")

print("\nSubscription plans created successfully!")

# Create sample subscriptions for existing organizations
print("\nCreating sample subscriptions...")

organizations = Organization.objects.all()[:5]  # Get first 5 organizations
plans = SubscriptionPlan.objects.all()

for i, org in enumerate(organizations):
    # Assign different plans to different organizations
    plan_index = i % len(plans)
    plan = plans[plan_index]
    
    # Check if subscription already exists
    if not hasattr(org, 'subscription'):
        subscription = OrganizationSubscription.objects.create(
            organization=org,
            plan=plan,
            status='active',
            start_date=timezone.now() - timedelta(days=30),
            end_date=timezone.now() + timedelta(days=30),
            auto_renew=True
        )
        
        # Update organization subscription fields
        org.subscription_plan = plan.name
        org.subscription_status = 'active'
        org.subscription_expiry = subscription.end_date.date()
        org.save()
        
        print(f"Created subscription for {org.name} with {plan.display_name} plan")
    else:
        print(f"Subscription already exists for {org.name}")

print("\nSample subscriptions created successfully!")
print(f"Total plans: {SubscriptionPlan.objects.count()}")
print(f"Total subscriptions: {OrganizationSubscription.objects.count()}")