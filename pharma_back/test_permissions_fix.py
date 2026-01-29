#!/usr/bin/env python
"""
Test script to verify that supplier admin permissions are correctly saved and retrieved.
Run this script from the Django project root directory.
"""

import os
import sys
import django

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pharmacy_system.settings')
django.setup()

from accounts.models import User, UserPermission

def test_supplier_permissions():
    """Test supplier admin permissions save and retrieve functionality."""
    
    print("=== Testing Supplier Admin Permissions ===\n")
    
    # Find a supplier admin user
    supplier_admin = User.objects.filter(role='supplier_admin').first()
    
    if not supplier_admin:
        print("❌ No supplier admin user found. Please create one first.")
        return
    
    print(f"✅ Found supplier admin: {supplier_admin.get_full_name()} ({supplier_admin.email})")
    
    # Test 1: Check current permissions
    current_permissions = list(UserPermission.objects.filter(user=supplier_admin).values_list('permission', flat=True))
    print(f"📋 Current permissions: {current_permissions}")
    
    # Test 2: Save some test permissions
    test_permissions = [
        'pos', 'pos_billing', 'pos_reports', 'pos_settings',
        'inventory', 'inv_stock_mgmt', 'inv_manage_orders', 'inv_purchase_orders',
        'suppliers', 'sup_dashboard', 'sup_management', 'sup_reports'
    ]
    
    print(f"💾 Saving test permissions: {test_permissions}")
    
    # Clear existing permissions
    UserPermission.objects.filter(user=supplier_admin).delete()
    
    # Create new permissions
    for permission in test_permissions:
        UserPermission.objects.create(
            user=supplier_admin,
            permission=permission,
            granted_by=supplier_admin  # Self-granted for test
        )
    
    # Test 3: Verify permissions were saved
    saved_permissions = list(UserPermission.objects.filter(user=supplier_admin).values_list('permission', flat=True))
    print(f"✅ Saved permissions: {saved_permissions}")
    
    if set(saved_permissions) == set(test_permissions):
        print("✅ All permissions saved correctly!")
    else:
        print("❌ Permission save failed!")
        print(f"   Expected: {set(test_permissions)}")
        print(f"   Got: {set(saved_permissions)}")
    
    # Test 4: Test the view function logic
    from accounts.views import get_user_module_permissions
    from django.test import RequestFactory
    from django.contrib.auth.models import AnonymousUser
    
    # Create a mock request
    factory = RequestFactory()
    request = factory.get(f'/api/auth/users/{supplier_admin.id}/module-permissions/')
    request.user = supplier_admin  # Set the current user
    
    try:
        response = get_user_module_permissions(request, supplier_admin.id)
        response_data = response.data
        
        print(f"🔍 API Response status: {response.status_code}")
        
        if response.status_code == 200:
            modules = response_data.get('modules', [])
            print(f"📊 Returned {len(modules)} modules")
            
            # Check if modules have the correct permissions
            for module in modules:
                if module['has_access']:
                    print(f"   ✅ {module['name']}: {[sm['name'] for sm in module['sub_modules'] if sm['has_access']]}")
                else:
                    print(f"   ❌ {module['name']}: No access")
        else:
            print(f"❌ API call failed: {response_data}")
            
    except Exception as e:
        print(f"❌ API test failed: {str(e)}")
    
    print("\n=== Test Complete ===")

if __name__ == '__main__':
    test_supplier_permissions()