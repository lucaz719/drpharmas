#!/usr/bin/env python
"""
Script to create sample supplier transaction data for testing
Run this from Django shell: python manage.py shell < inventory/create_sample_data.py
"""

import os
import sys
import django
from datetime import datetime, date
from decimal import Decimal

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pharmacy_backend.settings')
django.setup()

from inventory.models import (
    PurchaseTransaction, PaymentRecord, CustomSupplier, 
    BulkOrder, BulkOrderItem, BulkOrderPayment, Product, Category
)
from accounts.models import User
from organizations.models import Organization, Branch

def create_sample_data():
    print("Creating sample supplier transaction data...")
    
    # Get or create organization and branch
    try:
        org = Organization.objects.get(id=3)
        print(f"Using existing organization: {org.name}")
    except Organization.DoesNotExist:
        org = Organization.objects.create(
            name="Test Pharmacy",
            organization_type="pharmacy",
            registration_number="TEST123"
        )
        print(f"Created organization: {org.name}")
    
    try:
        branch = Branch.objects.get(id=1)
        print(f"Using existing branch: {branch.name}")
    except Branch.DoesNotExist:
        branch = Branch.objects.create(
            name="Main Branch",
            organization=org,
            branch_type="main",
            address="Test Address"
        )
        print(f"Created branch: {branch.name}")
    
    # Get or create a user
    try:
        user = User.objects.get(email="admin@test.com")
        print(f"Using existing user: {user.email}")
    except User.DoesNotExist:
        user = User.objects.create_user(
            email="admin@test.com",
            password="password123",
            first_name="Admin",
            last_name="User",
            role="pharmacy_admin"
        )
        user.organization_id = org.id
        user.branch_id = branch.id
        user.save()
        print(f"Created user: {user.email}")
    
    # Create supplier user
    try:
        supplier_user = User.objects.get(email="supplier@agro.com")
        print(f"Using existing supplier: {supplier_user.email}")
    except User.DoesNotExist:
        supplier_user = User.objects.create_user(
            email="supplier@agro.com",
            password="password123",
            first_name="Supplier",
            last_name="Agro",
            role="supplier_admin"
        )
        supplier_user.organization_id = 4  # Different org
        supplier_user.save()
        print(f"Created supplier user: {supplier_user.email}")
    
    # Create custom supplier
    custom_supplier, created = CustomSupplier.objects.get_or_create(
        name="Supplier Agro",
        organization_id=org.id,
        defaults={
            'contact_person': 'Agro Manager',
            'phone': '5252525252',
            'email': 'supplier_user@gmail.com',
            'created_by': user
        }
    )
    if created:
        print(f"Created custom supplier: {custom_supplier.name}")
    else:
        print(f"Using existing custom supplier: {custom_supplier.name}")
    
    # Create sample purchase transactions
    for i in range(3):
        transaction_num = f"TXN-TEST-{i+1}"
        
        # Check if transaction already exists
        if PurchaseTransaction.objects.filter(transaction_number=transaction_num).exists():
            print(f"Transaction {transaction_num} already exists, skipping...")
            continue
        
        transaction = PurchaseTransaction.objects.create(
            transaction_number=transaction_num,
            supplier_name="Supplier Agro",
            supplier_contact="5252525252",
            total_amount=Decimal(str(15000 + (i * 5000))),  # 15000, 20000, 25000
            organization_id=org.id,
            branch_id=branch.id,
            created_by=user
        )
        
        # Create payment record
        paid_amount = Decimal(str(10000 + (i * 2000)))  # 10000, 12000, 14000
        credit_amount = transaction.total_amount - paid_amount
        
        payment = PaymentRecord.objects.create(
            payment_number=f"PAY-TEST-{i+1}",
            transaction=transaction,
            payment_method='partial',
            payment_date=date.today(),
            total_amount=transaction.total_amount,
            paid_amount=paid_amount,
            credit_amount=credit_amount,
            notes=f"Test payment {i+1}",
            organization_id=org.id,
            created_by=user
        )
        
        print(f"Created transaction {transaction_num}: Total={transaction.total_amount}, Paid={paid_amount}, Credit={credit_amount}")
    
    # Create sample bulk order
    try:
        bulk_order = BulkOrder.objects.get(order_number="BO-TEST-001")
        print(f"Using existing bulk order: {bulk_order.order_number}")
    except BulkOrder.DoesNotExist:
        # Create supplier organization
        try:
            supplier_org = Organization.objects.get(id=4)
        except Organization.DoesNotExist:
            supplier_org = Organization.objects.create(
                name="Agro Suppliers Ltd",
                organization_type="supplier",
                registration_number="AGRO123"
            )
        
        bulk_order = BulkOrder.objects.create(
            order_number="BO-TEST-001",
            buyer_organization=org,
            buyer_branch=branch,
            supplier_organization=supplier_org,
            supplier_user=supplier_user,
            expected_delivery_date=date.today(),
            status=BulkOrder.COMPLETED,
            total_amount=Decimal('35000'),
            total_paid_amount=Decimal('20000'),
            remaining_amount=Decimal('15000'),
            payment_status='partial',
            created_by=user
        )
        
        # Create bulk order payment
        BulkOrderPayment.objects.create(
            bulk_order=bulk_order,
            payment_type=BulkOrderPayment.INSTALLMENT,
            payment_method=BulkOrderPayment.CASH,
            amount=Decimal('20000'),
            payment_date=datetime.now(),
            installment_number=1,
            created_by=user
        )
        
        print(f"Created bulk order: {bulk_order.order_number} with amount {bulk_order.total_amount}")
    
    print("\nSample data creation completed!")
    print(f"Organization: {org.name} (ID: {org.id})")
    print(f"Branch: {branch.name} (ID: {branch.id})")
    print(f"User: {user.email} (org_id: {getattr(user, 'organization_id', None)})")
    print(f"Supplier User: {supplier_user.email}")
    print(f"Custom Supplier: {custom_supplier.name}")

if __name__ == "__main__":
    create_sample_data()