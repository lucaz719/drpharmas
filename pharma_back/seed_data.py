import os
import django
import sys
from datetime import timedelta
from decimal import Decimal
from django.utils import timezone

# Set up Django environment
sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "pharmacy_system.settings")
django.setup()

from accounts.models import User, UserActivity
from organizations.models import Organization, Branch, SubscriptionPlan, OrganizationSubscription
from inventory.models import Category, Manufacturer, Product, StockEntry
from pos.models import Customer, Sale, SaleItem, Payment
from patients.models import Patient

def seed_data():
    print("Starting data seeding...")

    # 1. Create Subscription Plans
    plans = [
        {'name': 'trial', 'display_name': 'Free Trial', 'price': 0},
        {'name': 'basic', 'display_name': 'Basic Plan', 'price': 1000},
        {'name': 'professional', 'display_name': 'Professional Plan', 'price': 5000},
        {'name': 'enterprise', 'display_name': 'Enterprise Plan', 'price': 15000},
    ]
    
    plan_objects = {}
    for p in plans:
        plan, created = SubscriptionPlan.objects.get_or_create(
            name=p['name'],
            defaults={'display_name': p['display_name'], 'price': p['price'], 'is_active': True}
        )
        plan_objects[p['name']] = plan
        if created: print(f"Created plan: {p['display_name']}")

    # 2. Create Organization Owner
    owner_email = "owner@citypharma.com"
    owner, created = User.objects.get_or_create(
        email=owner_email,
        defaults={
            'first_name': 'John',
            'last_name': 'Owner',
            'role': User.PHARMACY_OWNER,
            'phone': '9800000001',
            'is_active': True
        }
    )
    if created:
        owner.set_password("ownerpassword")
        owner.save()
        print(f"Created owner: {owner_email}")

    # 3. Create Organization
    org_name = "City Pharma"
    org, created = Organization.objects.get_or_create(
        name=org_name,
        defaults={
            'type': Organization.RETAIL_PHARMACY,
            'medical_system': Organization.ALLOPATHIC,
            'status': Organization.ACTIVE,
            'address': 'Main Street, Kathmandu',
            'city': 'Kathmandu',
            'state': 'Bagmati',
            'postal_code': '44600',
            'phone': '9800000001',
            'email': 'contact@citypharma.com',
            'license_number': 'PH-2026-001',
            'license_expiry': timezone.now().date() + timedelta(days=365),
            'owner': owner
        }
    )
    if created: print(f"Created organization: {org_name}")

    # Create Ayurvedic Organization
    ayur_owner_email = "owner@ayurcare.com"
    ayur_owner, created = User.objects.get_or_create(
        email=ayur_owner_email,
        defaults={
            'first_name': 'Ram',
            'last_name': 'Vaidya',
            'role': User.PHARMACY_OWNER,
            'phone': '9800000010',
            'is_active': True
        }
    )
    if created:
        ayur_owner.set_password("ayurpassword")
        ayur_owner.save()
        print(f"Created ayurvedic owner: {ayur_owner_email}")

    ayur_org_name = "Ayurvedic Care Center"
    ayur_org, created = Organization.objects.get_or_create(
        name=ayur_org_name,
        defaults={
            'type': Organization.RETAIL_PHARMACY,
            'medical_system': Organization.AYURVEDIC,
            'status': Organization.ACTIVE,
            'address': 'Kirtipur, Kathmandu',
            'city': 'Kathmandu',
            'state': 'Bagmati',
            'postal_code': '44618',
            'phone': '9800000011',
            'email': 'contact@ayurcare.com',
            'license_number': 'AY-2026-002',
            'license_expiry': timezone.now().date() + timedelta(days=365),
            'owner': ayur_owner
        }
    )
    if created: print(f"Created ayurvedic organization: {ayur_org_name}")

    # Attach ayur owner to org
    ayur_owner.organization_id = ayur_org.id
    ayur_owner.save()

    # Create Org Subscription for Ayur Org
    OrganizationSubscription.objects.get_or_create(
        organization=ayur_org,
        defaults={
            'plan': plan_objects['basic'],
            'start_date': timezone.now(),
            'end_date': timezone.now() + timedelta(days=30),
            'status': 'active'
        }
    )

    # Attach owner to org
    owner.organization_id = org.id
    owner.save()

    # Create Org Subscription
    OrganizationSubscription.objects.get_or_create(
        organization=org,
        defaults={
            'plan': plan_objects['professional'],
            'start_date': timezone.now(),
            'end_date': timezone.now() + timedelta(days=30),
            'status': 'active'
        }
    )

    # 4. Create Branch
    branch, created = Branch.objects.get_or_create(
        code="CP-MAIN",
        defaults={
            'name': 'Main Street Branch',
            'organization': org,
            'address': 'Main Street, Kathmandu',
            'city': 'Kathmandu',
            'state': 'Bagmati',
            'postal_code': '44600',
            'phone': '9801234567',
            'email': 'main@citypharma.com',
            'type': Branch.MAIN,
            'status': Branch.ACTIVE
        }
    )
    if created: print(f"Created branch: {branch.name}")

    # 5. Create Additional Users
    users_data = [
        {
            'email': 'manager@citypharma.com',
            'first_name': 'Alice',
            'last_name': 'Manager',
            'role': User.BRANCH_MANAGER,
            'password': 'managerpassword'
        },
        {
            'email': 'staff@citypharma.com',
            'first_name': 'Bob',
            'last_name': 'Pharmacist',
            'role': User.PHARMACIST,
            'password': 'staffpassword'
        }
    ]

    for u_data in users_data:
        user, created = User.objects.get_or_create(
            email=u_data['email'],
            defaults={
                'first_name': u_data['first_name'],
                'last_name': u_data['last_name'],
                'role': u_data['role'],
                'phone': '9800000002',
                'organization_id': org.id,
                'branch_id': branch.id,
                'is_active': True
            }
        )
        if created:
            user.set_password(u_data['password'])
            user.save()
            print(f"Created user: {u_data['email']} ({u_data['role']})")

    # 6. Create Inventory Hierarchy
    cat, _ = Category.objects.get_or_create(
        name="Tablets", 
        organization=org,
        defaults={'description': 'General Tablets'}
    )
    man, _ = Manufacturer.objects.get_or_create(
        name="Nepal Pharma Ltd",
        organization=org,
        defaults={'contact_person': 'Mr. Gupta'}
    )

    # 7. Create Products
    products_data = [
        {
            'name': 'Paracetamol 500mg',
            'code': 'PARA500',
            'cost': Decimal('1.50'),
            'mrp': Decimal('5.00'),
            'sell': Decimal('4.50')
        },
        {
            'name': 'Amoxicillin 250mg',
            'code': 'AMOX250',
            'cost': Decimal('10.00'),
            'mrp': Decimal('25.00'),
            'sell': Decimal('22.00')
        }
    ]

    for p_data in products_data:
        prod, created = Product.objects.get_or_create(
            product_code=p_data['code'],
            organization=org,
            defaults={
                'name': p_data['name'],
                'category': cat,
                'manufacturer': man,
                'cost_price': p_data['cost'],
                'mrp': p_data['mrp'],
                'selling_price': p_data['sell'],
                'status': 'active'
            }
        )
        if created:
            print(f"Created product: {p_data['name']}")
            # Add initial stock
            StockEntry.objects.create(
                product=prod,
                branch=branch,
                quantity=1000,
                previous_quantity=0,
                current_quantity=1000,
                entry_type='purchase',
                created_by=owner
            )

    # 8. Create Patient (POS Customer)
    patient, created = Patient.objects.get_or_create(
        patient_id='P-1001',
        defaults={
            'first_name': 'Jane',
            'last_name': 'Doe',
            'organization_id': org.id,
            'branch_id': branch.id,
            'phone': '9800112233',
            'gender': 'female',
            'date_of_birth': '1990-01-01',
            'address': 'Koteshwor, Kathmandu',
            'city': 'Kathmandu'
        }
    )
    if created: print(f"Created patient: Jane Doe")

    # 9. Create a Sale
    if Sale.objects.filter(organization=org).count() == 0:
        sale = Sale.objects.create(
            sale_number="S-2026-0001",
            organization=org,
            branch=branch,
            patient=patient,
            sale_type='cash',
            status='completed',
            subtotal=Decimal('45.00'),
            total_amount=Decimal('45.00'),
            amount_paid=Decimal('50.00'),
            change_amount=Decimal('5.00'),
            created_by=owner
        )
        # Add Sale Item
        para = Product.objects.get(product_code='PARA500', organization=org)
        SaleItem.objects.create(
            sale=sale,
            product=para,
            quantity=10,
            unit_price=Decimal('4.50')
        )
        # Payment
        Payment.objects.create(
            sale=sale,
            amount=Decimal('50.00'),
            payment_method='cash',
            received_by=owner
        )
        print("Created sample completed sale.")

    # 10. Create Logs (User Activity)
    logs_data = [
        {'user': owner, 'action': 'Login', 'desc': 'Super admin logged into dashboard'},
        {'user': owner, 'action': 'Organization Update', 'desc': 'Updated City Pharma settings'},
        {'user': owner, 'action': 'Inventory Add', 'desc': 'Added 1000 units of Paracetamol'},
    ]
    for log in logs_data:
        UserActivity.objects.create(
            user=log['user'],
            action=log['action'],
            description=log['desc'],
            ip_address='127.0.0.1'
        )
    print("Created sample activity logs.")

    print("Seeding completed successfully!")

if __name__ == "__main__":
    seed_data()
