import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pharmacy_system.settings')
django.setup()

from accounts.models import User

def create_super_admin():
    email = "admin@drpharma.com"
    password = "adminpassword"
    
    if not User.objects.filter(email=email).exists():
        User.objects.create_superuser(
            email=email,
            password=password,
            first_name="Super",
            last_name="Admin",
            phone="9801234567"
        )
        print(f"Super Admin user '{email}' created successfully.")
    else:
        print(f"User '{email}' already exists.")

if __name__ == "__main__":
    create_super_admin()
