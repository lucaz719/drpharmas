#!/usr/bin/env python
"""
Test script to verify that supplier_admin users can access module permissions.
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

from accounts.models import User
from accounts.views import MODULE_PERMISSIONS

def test_supplier_admin_permissions():
    """Test that supplier_admin users have access to relevant modules."""
    
    print("Testing SUPPLIER_ADMIN role permissions...")
    print("=" * 50)
    
    # Check which modules include SUPPLIER_ADMIN role
    supplier_modules = []
    for module_id, module_data in MODULE_PERMISSIONS.items():
        if 'SUPPLIER_ADMIN' in module_data['roles']:
            supplier_modules.append({
                'id': module_id,
                'name': module_data['name'],
                'sub_modules': list(module_data['sub_modules'].keys())
            })
    
    if supplier_modules:
        print(f"✅ SUPPLIER_ADMIN role has access to {len(supplier_modules)} modules:")
        for module in supplier_modules:
            print(f"  - {module['name']} ({module['id']})")
            print(f"    Sub-modules: {', '.join(module['sub_modules'])}")
            print()
    else:
        print("❌ SUPPLIER_ADMIN role has no module access!")
        return False
    
    # Check SALES_REPRESENTATIVE as well
    print("Testing SALES_REPRESENTATIVE role permissions...")
    print("=" * 50)
    
    sales_modules = []
    for module_id, module_data in MODULE_PERMISSIONS.items():
        if 'SALES_REPRESENTATIVE' in module_data['roles']:
            sales_modules.append({
                'id': module_id,
                'name': module_data['name'],
                'sub_modules': list(module_data['sub_modules'].keys())
            })
    
    if sales_modules:
        print(f"✅ SALES_REPRESENTATIVE role has access to {len(sales_modules)} modules:")
        for module in sales_modules:
            print(f"  - {module['name']} ({module['id']})")
            print(f"    Sub-modules: {', '.join(module['sub_modules'])}")
            print()
    else:
        print("❌ SALES_REPRESENTATIVE role has no module access!")
        return False
    
    print("✅ All supplier-related roles now have proper module access!")
    return True

if __name__ == "__main__":
    success = test_supplier_admin_permissions()
    if success:
        print("\n🎉 Test passed! Supplier admin users should now see module permissions.")
    else:
        print("\n❌ Test failed! There are still issues with supplier permissions.")
        sys.exit(1)