#!/usr/bin/env python3
"""
Script to create default subscription plans
Run this with: python manage.py shell < organizations/create_default_plans.py
"""

from organizations.models import SubscriptionPlan

def create_default_plans():
    """Create default subscription plans if they don't exist."""
    
    plans_data = [
        {
            'name': 'trial',
            'display_name': 'Trial Plan',
            'price': 0,
            'currency': 'NPR',
            'billing_cycle': 'monthly',
            'max_users': 5,
            'max_organizations': 1,
            'max_branches': 1,
            'features': [
                'Basic inventory management',
                'Up to 5 users',
                'Single branch',
                '30-day trial period',
                'Email support'
            ],
            'pricing_tiers': [
                {'cycle': 'monthly', 'price': '0'}
            ],
            'is_active': True
        },
        {
            'name': 'basic',
            'display_name': 'Basic Plan',
            'price': 5000,
            'currency': 'NPR',
            'billing_cycle': 'monthly',
            'max_users': 10,
            'max_organizations': 1,
            'max_branches': 3,
            'features': [
                'Complete inventory management',
                'Up to 10 users',
                'Up to 3 branches',
                'POS system',
                'Basic reports',
                'Email support'
            ],
            'pricing_tiers': [
                {'cycle': 'monthly', 'price': '5000'},
                {'cycle': 'quarterly', 'price': '14000'},
                {'cycle': 'half-yearly', 'price': '27000'},
                {'cycle': 'yearly', 'price': '50000'}
            ],
            'is_active': True
        },
        {
            'name': 'professional',
            'display_name': 'Professional Plan',
            'price': 15000,
            'currency': 'NPR',
            'billing_cycle': 'monthly',
            'max_users': 25,
            'max_organizations': 1,
            'max_branches': 10,
            'features': [
                'Advanced inventory management',
                'Up to 25 users',
                'Up to 10 branches',
                'Advanced POS system',
                'Patient management',
                'Advanced reports & analytics',
                'API access',
                'Priority support'
            ],
            'pricing_tiers': [
                {'cycle': 'monthly', 'price': '15000'},
                {'cycle': 'quarterly', 'price': '42000'},
                {'cycle': 'half-yearly', 'price': '81000'},
                {'cycle': 'yearly', 'price': '150000'}
            ],
            'is_active': True
        },
        {
            'name': 'enterprise',
            'display_name': 'Enterprise Plan',
            'price': 50000,
            'currency': 'NPR',
            'billing_cycle': 'monthly',
            'max_users': None,  # Unlimited
            'max_organizations': None,  # Unlimited
            'max_branches': None,  # Unlimited
            'features': [
                'Complete pharmacy management suite',
                'Unlimited users',
                'Unlimited branches',
                'Multi-organization support',
                'Advanced analytics & BI',
                'Custom integrations',
                'Dedicated account manager',
                '24/7 priority support',
                'Custom training'
            ],
            'pricing_tiers': [
                {'cycle': 'monthly', 'price': '50000'},
                {'cycle': 'quarterly', 'price': '140000'},
                {'cycle': 'half-yearly', 'price': '270000'},
                {'cycle': 'yearly', 'price': '500000'}
            ],
            'is_active': True
        }
    ]
    
    created_count = 0
    updated_count = 0
    
    for plan_data in plans_data:
        plan, created = SubscriptionPlan.objects.get_or_create(
            name=plan_data['name'],
            defaults=plan_data
        )
        
        if created:
            created_count += 1
            print(f"✅ Created plan: {plan.display_name}")
        else:
            # Update existing plan with new data
            for key, value in plan_data.items():
                if key != 'name':  # Don't update the name field
                    setattr(plan, key, value)
            plan.save()
            updated_count += 1
            print(f"🔄 Updated plan: {plan.display_name}")
    
    print(f"\n📊 Summary:")
    print(f"   Created: {created_count} plans")
    print(f"   Updated: {updated_count} plans")
    print(f"   Total: {SubscriptionPlan.objects.count()} plans in database")

if __name__ == '__main__':
    create_default_plans()