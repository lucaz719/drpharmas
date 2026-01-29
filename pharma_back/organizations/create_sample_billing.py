#!/usr/bin/env python
"""
Script to create sample billing history records for testing.
Run this from the Django shell: python manage.py shell < organizations/create_sample_billing.py
"""

import os
import sys
import django
from datetime import datetime, timedelta
from decimal import Decimal

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pharmacy_system.settings')
django.setup()

from organizations.models import Organization, BillingHistory, OrganizationSubscription
from django.utils import timezone

def create_sample_billing_records():
    """Create sample billing records for existing organizations."""
    
    organizations = Organization.objects.all()[:5]  # Get first 5 organizations
    
    for org in organizations:
        print(f"Creating billing records for {org.name}")
        
        # Get or create subscription for this organization
        subscription = OrganizationSubscription.objects.filter(organization=org).first()
        
        # Create sample billing records
        billing_records = [
            {
                'organization': org,
                'subscription': subscription,
                'transaction_type': 'invoice',
                'status': 'completed',
                'amount': Decimal('15000.00'),
                'currency': 'NPR',
                'invoice_number': f'INV-{org.id}-001',
                'payment_method': 'Bank Transfer',
                'payment_reference': f'TXN{org.id}001',
                'description': 'Monthly subscription fee - Professional Plan',
                'billing_period_start': timezone.now().date() - timedelta(days=30),
                'billing_period_end': timezone.now().date(),
                'due_date': timezone.now().date() - timedelta(days=15),
                'paid_date': timezone.now() - timedelta(days=10),
            },
            {
                'organization': org,
                'subscription': subscription,
                'transaction_type': 'payment',
                'status': 'completed',
                'amount': Decimal('15000.00'),
                'currency': 'NPR',
                'payment_method': 'Credit Card',
                'payment_reference': f'PAY{org.id}001',
                'description': 'Payment received for invoice INV-{}-001'.format(org.id),
                'paid_date': timezone.now() - timedelta(days=10),
            },
            {
                'organization': org,
                'subscription': subscription,
                'transaction_type': 'invoice',
                'status': 'pending',
                'amount': Decimal('15000.00'),
                'currency': 'NPR',
                'invoice_number': f'INV-{org.id}-002',
                'description': 'Monthly subscription fee - Professional Plan',
                'billing_period_start': timezone.now().date(),
                'billing_period_end': timezone.now().date() + timedelta(days=30),
                'due_date': timezone.now().date() + timedelta(days=15),
            },
            {
                'organization': org,
                'subscription': subscription,
                'transaction_type': 'credit',
                'status': 'completed',
                'amount': Decimal('1500.00'),
                'currency': 'NPR',
                'payment_reference': f'CRD{org.id}001',
                'description': 'Account credit for service downtime',
                'paid_date': timezone.now() - timedelta(days=5),
            }
        ]
        
        for record_data in billing_records:
            try:
                billing_record = BillingHistory.objects.create(**record_data)
                print(f"  Created {billing_record.transaction_type} record: {billing_record.amount} {billing_record.currency}")
            except Exception as e:
                print(f"  Error creating billing record: {e}")
    
    print(f"\nSample billing records created successfully!")
    print(f"Total billing records: {BillingHistory.objects.count()}")

if __name__ == '__main__':
    create_sample_billing_records()