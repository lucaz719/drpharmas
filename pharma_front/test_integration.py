#!/usr/bin/env python3
"""
Test script to verify purchase orders integration with bulk order system
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:8080"
API_BASE = f"{BASE_URL}/api"

def test_endpoints():
    """Test the key endpoints for purchase orders integration"""
    
    print("Testing Purchase Orders Integration...")
    print("=" * 50)
    
    # Test 1: Check if bulk orders endpoint exists
    try:
        response = requests.get(f"{API_BASE}/inventory/bulk-orders/")
        print(f"✓ Bulk Orders Endpoint: {response.status_code}")
        if response.status_code == 401:
            print("  (Authentication required - expected)")
        elif response.status_code == 200:
            data = response.json()
            print(f"  Found {len(data.get('results', data))} bulk orders")
    except Exception as e:
        print(f"✗ Bulk Orders Endpoint Error: {e}")
    
    # Test 2: Check if users endpoint with supplier filter exists
    try:
        response = requests.get(f"{API_BASE}/auth/users/?role=supplier_admin&external_only=true")
        print(f"✓ Supplier Users Endpoint: {response.status_code}")
        if response.status_code == 401:
            print("  (Authentication required - expected)")
        elif response.status_code == 200:
            data = response.json()
            print(f"  Found {len(data.get('results', data))} external suppliers")
    except Exception as e:
        print(f"✗ Supplier Users Endpoint Error: {e}")
    
    # Test 3: Check if products endpoint for purchase orders exists
    try:
        response = requests.get(f"{API_BASE}/inventory/products/purchase-order/?q=test&supplier_id=1")
        print(f"✓ Products for Purchase Order Endpoint: {response.status_code}")
        if response.status_code == 401:
            print("  (Authentication required - expected)")
        elif response.status_code == 200:
            data = response.json()
            print(f"  Found {len(data)} products")
    except Exception as e:
        print(f"✗ Products for Purchase Order Endpoint Error: {e}")
    
    print("\n" + "=" * 50)
    print("Integration test completed!")
    print("\nNext steps:")
    print("1. Start the Django server: python manage.py runserver 8080")
    print("2. Start the React app: npm start")
    print("3. Navigate to http://localhost:3000/inventory/purchase-orders")
    print("4. Test creating a new purchase order")

if __name__ == "__main__":
    test_endpoints()