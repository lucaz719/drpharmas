from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from organizations.models import Organization, Branch

User = get_user_model()

class Command(BaseCommand):
    help = 'Create demo users for testing'

    def handle(self, *args, **options):
        # Create demo organization
        org, created = Organization.objects.get_or_create(
            name='MediCare Hospital Network',
            defaults={
                'type': 'hospital',
                'status': 'active',
                'address': '123 Medical Center Drive',
                'city': 'Kathmandu',
                'state': 'Bagmati',
                'postal_code': '44600',
                'country': 'Nepal',
                'phone': '+977-1-1234567',
                'email': 'info@medicare.com.np',
                'license_number': 'HOSP-2024-001',
                'currency': 'NPR',
                'tax_rate': 13.0,
                'timezone': 'Asia/Kathmandu',
                'language': 'en',
                'subscription_plan': 'premium',
                'subscription_status': 'active',
            }
        )

        # Create demo branch
        branch, created = Branch.objects.get_or_create(
            organization=org,
            name='Central Branch',
            defaults={
                'code': 'MC-CENTRAL',
                'type': 'main',
                'status': 'active',
                'address': '456 Pharmacy Street',
                'city': 'Kathmandu',
                'state': 'Bagmati',
                'postal_code': '44600',
                'country': 'Nepal',
                'phone': '+977-1-7654321',
                'email': 'central@medicare.com.np',
                'timezone': 'Asia/Kathmandu',
                'currency': 'NPR',
            }
        )

        # Demo users data
        demo_users = [
            {
                'email': 'admin@medipro.com',
                'password': 'admin123',
                'first_name': 'Super',
                'last_name': 'Admin',
                'role': 'super_admin',
                'organization_id': None,
                'branch_id': None,
            },
            {
                'email': 'owner@medipro.com',
                'password': 'owner123',
                'first_name': 'Pharmacy',
                'last_name': 'Owner',
                'role': 'owner',
                'organization_id': org.id if org else None,
                'branch_id': None,
            },
            {
                'email': 'manager@medipro.com',
                'password': 'manager123',
                'first_name': 'Branch',
                'last_name': 'Manager',
                'role': 'manager',
                'organization_id': org.id if org else None,
                'branch_id': branch.id if branch else None,
            },
            {
                'email': 'pharmacist@medipro.com',
                'password': 'pharm123',
                'first_name': 'Senior',
                'last_name': 'Pharmacist',
                'role': 'pharmacist',
                'organization_id': org.id if org else None,
                'branch_id': branch.id if branch else None,
            },
        ]

        for user_data in demo_users:
            user, created = User.objects.get_or_create(
                email=user_data['email'],
                defaults={
                    'first_name': user_data['first_name'],
                    'last_name': user_data['last_name'],
                    'role': user_data['role'],
                    'organization_id': user_data['organization_id'],
                    'branch_id': user_data['branch_id'],
                    'is_active': True,
                }
            )

            if created:
                user.set_password(user_data['password'])
                user.save()
                self.stdout.write(
                    self.style.SUCCESS(f'Created user: {user.email} ({user.get_role_display()})')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'User already exists: {user.email}')
                )

        self.stdout.write(
            self.style.SUCCESS('\nDemo users created successfully!')
        )
        self.stdout.write('Login credentials:')
        for user_data in demo_users:
            self.stdout.write(f'  {user_data["email"]} : {user_data["password"]}')

        self.stdout.write('\nDemo login buttons in frontend:')
        self.stdout.write('  - Super Administrator')
        self.stdout.write('  - Pharmacy Owner')
        self.stdout.write('  - Branch Manager')
        self.stdout.write('  - Pharmacist')