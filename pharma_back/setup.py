#!/usr/bin/env python
"""
MediPro Pharmacy System - Django Backend Setup Script
=====================================================

This script helps you set up the Django backend for the MediPro Pharmacy System.

Usage:
    python setup.py

Requirements:
    - Python 3.8+
    - PostgreSQL (recommended) or SQLite
    - Virtual environment (recommended)

Author: Kilo Code
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path


def run_command(command, cwd=None, check=True):
    """Run a shell command and return the result."""
    try:
        result = subprocess.run(
            command,
            shell=True,
            cwd=cwd,
            capture_output=True,
            text=True,
            check=check
        )
        return result.stdout.strip(), result.stderr.strip()
    except subprocess.CalledProcessError as e:
        print(f"❌ Command failed: {command}")
        print(f"Error: {e.stderr}")
        return None, str(e)


def check_python_version():
    """Check if Python version is compatible."""
    print("🐍 Checking Python version...")
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8+ is required")
        sys.exit(1)
    print(f"✅ Python {version.major}.{version.minor}.{version.micro}")


def check_virtual_environment():
    """Check if running in virtual environment."""
    print("🔧 Checking virtual environment...")
    in_venv = hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix)
    if not in_venv:
        print("⚠️  Warning: Not running in virtual environment")
        print("   Consider creating one: python -m venv venv && venv\\Scripts\\activate")
    else:
        print("✅ Running in virtual environment")


def install_dependencies():
    """Install Python dependencies."""
    print("📦 Installing dependencies...")
    stdout, stderr = run_command("pip install -r requirements.txt")
    if stdout:
        print("✅ Dependencies installed successfully")
    else:
        print("❌ Failed to install dependencies")
        return False
    return True


def setup_database():
    """Set up database and run migrations."""
    print("🗄️  Setting up database...")

    # Create database migrations
    print("   Creating migrations...")
    stdout, stderr = run_command("python manage.py makemigrations")
    if not stdout and stderr:
        print(f"❌ Migration creation failed: {stderr}")
        return False

    # Run migrations
    print("   Running migrations...")
    stdout, stderr = run_command("python manage.py migrate")
    if not stdout and stderr:
        print(f"❌ Migration failed: {stderr}")
        return False

    print("✅ Database setup complete")
    return True


def create_superuser():
    """Create superuser account."""
    print("👤 Creating superuser account...")

    # Check if superuser already exists
    from pharmacy_system.settings import AUTH_USER_MODEL
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        if User.objects.filter(is_superuser=True).exists():
            print("⚠️  Superuser already exists")
            return True
    except:
        pass

    print("   Please create a superuser account:")
    print("   Email: admin@medipro.com")
    print("   Password: admin123")

    # Create superuser programmatically
    try:
        from django.core.management import execute_from_command_line
        execute_from_command_line(['manage.py', 'createsuperuser',
                                 '--email=admin@medipro.com',
                                 '--noinput'])
        # Set password
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = User.objects.get(email='admin@medipro.com')
        user.set_password('admin123')
        user.save()
        print("✅ Superuser created successfully")
        return True
    except Exception as e:
        print(f"❌ Failed to create superuser: {e}")
        print("   You can create one manually: python manage.py createsuperuser")
        return False


def create_sample_data():
    """Create sample data for testing."""
    print("📊 Creating sample data...")

    try:
        # Run the custom management command to create sample data
        stdout, stderr = run_command("python manage.py create_sample_data")
        if stdout or (not stderr):
            print("✅ Sample data created successfully")
            return True
        else:
            print("⚠️  Sample data creation failed (this is optional)")
            return True
    except:
        print("⚠️  Sample data creation failed (this is optional)")
        return True


def main():
    """Main setup function."""
    print("🚀 MediPro Pharmacy System - Django Backend Setup")
    print("=" * 55)

    # Change to backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)

    # Pre-flight checks
    check_python_version()
    check_virtual_environment()

    # Install dependencies
    if not install_dependencies():
        sys.exit(1)

    # Database setup
    if not setup_database():
        sys.exit(1)

    # Create superuser
    create_superuser()

    # Create sample data
    create_sample_data()

    print("\n🎉 Setup complete!")
    print("\nNext steps:")
    print("1. Configure your .env file (copy from .env.example)")
    print("2. Set up your database (PostgreSQL recommended)")
    print("3. Run: python manage.py runserver")
    print("4. Access admin at: http://localhost:8000/admin/")
    print("5. API documentation at: http://localhost:8000/api/")

    print("\n📝 Default superuser credentials:")
    print("   Email: admin@medipro.com")
    print("   Password: admin123")

    print("\n🔗 API Endpoints:")
    print("   Authentication: /api/auth/")
    print("   Users: /api/auth/users/")
    print("   Organizations: /api/organizations/")
    print("   Inventory: /api/inventory/")
    print("   POS: /api/pos/")


if __name__ == "__main__":
    main()