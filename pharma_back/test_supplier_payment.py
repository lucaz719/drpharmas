#!/usr/bin/env python
"""
Test script to verify supplier payment functionality
Run this from the Django project root: python test_supplier_payment.py
"""

import os
import sys
import django
from decimal import Decimal

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pharmacy_system.settings')
django.setup()

from inventory.models import PurchaseTransaction, PaymentRecord, CustomSupplier
from accounts.models import User
from organizations.models import Organization, Branch

def test_supplier_payment_system():
    """Test the supplier payment recording and balance calculation"""
    
    print("Testing Supplier Payment System...")
    
    # Get or create test organization and branch
    org, created = Organization.objects.get_or_create(
        name="Test Pharmacy",
        defaults={
            'email': 'test@pharmacy.com',
            'phone': '1234567890',
            'address': 'Test Address'
        }
    )
    
    branch, created = Branch.objects.get_or_create(
        name="Main Branch",
        organization=org,
        defaults={
            'address': 'Main Branch Address',
            'phone': '1234567890'
        }
    )
    
    # Get or create test user
    user, created = User.objects.get_or_create(
        email='test@pharmacy.com',
        defaults={
            'first_name': 'Test',
            'last_name': 'User',
            'role': 'pharmacy_admin',
            'organization': org,
            'branch': branch
        }
    )
    
    # Create test supplier
    supplier_name = "Test Supplier Ltd"
    
    # Create a purchase transaction
    purchase_txn = PurchaseTransaction.objects.create(
        supplier_name=supplier_name,
        supplier_contact='supplier@test.com',
        total_amount=Decimal('10000.00'),
        organization=org,
        branch=branch,
        created_by=user
    )
    
    # Create initial payment record for the purchase
    initial_payment = PaymentRecord.objects.create(
        transaction=purchase_txn,
        payment_method='cash',
        payment_date=purchase_txn.created_at.date(),
        total_amount=Decimal('10000.00'),
        paid_amount=Decimal('3000.00'),  # Partial payment
        credit_amount=Decimal('7000.00'),  # Remaining credit
        organization=org,
        created_by=user
    )
    
    print(f"Created purchase transaction: {purchase_txn.transaction_number}")
    print(f"Initial payment: Paid {initial_payment.paid_amount}, Credit {initial_payment.credit_amount}")
    
    # Now simulate recording an individual payment
    individual_payment_txn = PurchaseTransaction.objects.create(
        supplier_name=supplier_name,
        supplier_contact='',
        total_amount=Decimal('0'),  # Zero for individual payments
        organization=org,
        branch=branch,
        created_by=user
    )
    
    individual_payment = PaymentRecord.objects.create(
        transaction=individual_payment_txn,
        payment_method='bank_transfer',
        payment_date=individual_payment_txn.created_at.date(),
        total_amount=Decimal('0'),
        paid_amount=Decimal('2000.00'),  # Additional payment
        credit_amount=Decimal('0'),  # Zero for individual payments
        notes="Individual payment test",
        organization=org,
        created_by=user
    )
    
    print(f"Created individual payment: {individual_payment.payment_number}")
    print(f"Individual payment amount: {individual_payment.paid_amount}")
    
    # Update the original transaction's credit
    initial_payment.paid_amount += individual_payment.paid_amount
    initial_payment.credit_amount -= individual_payment.paid_amount
    initial_payment.save()
    
    print(f"Updated original payment: Paid {initial_payment.paid_amount}, Credit {initial_payment.credit_amount}")
    
    # Test the ledger calculation
    from inventory.views.supplier_ledger_views import get_custom_supplier_data
    
    ledger_data = get_custom_supplier_data(supplier_name, org.id, branch.id)
    
    print("\nLedger Summary:")
    print(f"Total Purchases: {ledger_data['total_purchases']}")
    print(f"Total Paid: {ledger_data['total_paid']}")
    print(f"Total Credit: {ledger_data['total_credit']}")
    
    print(f"\nTransactions ({len(ledger_data['transactions'])}):")
    for txn in ledger_data['transactions']:
        print(f"  {txn['date'].strftime('%Y-%m-%d')} - {txn['description']} - Purchase: {txn['purchase']} - Payment: {txn['payment']} - Balance: {txn['balance']}")
    
    # Verify the calculations
    expected_total_paid = 5000.00  # 3000 + 2000
    expected_credit = 5000.00  # 10000 - 5000
    
    assert ledger_data['total_purchases'] == 10000.00, f"Expected 10000, got {ledger_data['total_purchases']}"
    assert ledger_data['total_paid'] == expected_total_paid, f"Expected {expected_total_paid}, got {ledger_data['total_paid']}"
    assert ledger_data['total_credit'] == expected_credit, f"Expected {expected_credit}, got {ledger_data['total_credit']}"
    
    print("\n✅ All tests passed! Payment system is working correctly.")
    
    # Cleanup
    PurchaseTransaction.objects.filter(supplier_name=supplier_name).delete()
    
    return True

if __name__ == "__main__":
    try:
        test_supplier_payment_system()
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()