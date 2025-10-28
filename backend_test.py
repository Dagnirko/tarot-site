#!/usr/bin/env python3
"""
Backend API Testing Script
Tests admin endpoints to verify they work WITHOUT authorization tokens
"""

import requests
import json
import sys
from datetime import datetime

# Get backend URL from frontend env
EXTERNAL_BACKEND_URL = "https://tarot.dagnir.ru/api"
LOCAL_BACKEND_URL = "http://localhost:8001/api"

def test_admin_endpoints_without_auth():
    """Test that admin endpoints work WITHOUT authorization headers"""
    print("=== Testing Admin Endpoints WITHOUT Authorization ===")
    
    results = {
        "admin_pages": False,
        "admin_contacts": False, 
        "admin_settings_put": False,
        "settings_get": False
    }
    
    # Test GET /api/admin/pages
    print("\n1. Testing GET /api/admin/pages")
    try:
        response = requests.get(f"{BACKEND_URL}/admin/pages", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: Got {len(data)} pages")
            results["admin_pages"] = True
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {str(e)}")
    
    # Test GET /api/admin/contacts  
    print("\n2. Testing GET /api/admin/contacts")
    try:
        response = requests.get(f"{BACKEND_URL}/admin/contacts", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: Got {len(data)} contacts")
            results["admin_contacts"] = True
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {str(e)}")
    
    # Test GET /api/settings
    print("\n3. Testing GET /api/settings")
    try:
        response = requests.get(f"{BACKEND_URL}/settings", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: Theme = {data.get('theme', 'not found')}")
            results["settings_get"] = True
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {str(e)}")
    
    # Test PUT /api/admin/settings
    print("\n4. Testing PUT /api/admin/settings")
    try:
        test_data = {"theme": "winter"}
        response = requests.put(
            f"{BACKEND_URL}/admin/settings", 
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: Theme updated to {data.get('theme', 'not found')}")
            results["admin_settings_put"] = True
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {str(e)}")
    
    return results

def test_public_endpoints():
    """Test public endpoints"""
    print("\n=== Testing Public Endpoints ===")
    
    results = {
        "public_pages": False,
        "public_menu": False,
        "public_settings": False
    }
    
    # Test GET /api/pages
    print("\n1. Testing GET /api/pages")
    try:
        response = requests.get(f"{BACKEND_URL}/pages", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: Got {len(data)} published pages")
            results["public_pages"] = True
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {str(e)}")
    
    # Test GET /api/menu
    print("\n2. Testing GET /api/menu")
    try:
        response = requests.get(f"{BACKEND_URL}/menu", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: Got {len(data)} menu items")
            results["public_menu"] = True
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {str(e)}")
    
    # Test GET /api/settings (public access)
    print("\n3. Testing GET /api/settings (public)")
    try:
        response = requests.get(f"{BACKEND_URL}/settings", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: Theme = {data.get('theme', 'not found')}")
            results["public_settings"] = True
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {str(e)}")
    
    return results

def test_with_auth_header_should_still_work():
    """Test that endpoints still work if auth header is provided (but not required)"""
    print("\n=== Testing Admin Endpoints WITH Authorization (should still work) ===")
    
    # Create a fake token to test
    fake_token = "Bearer fake_token_123"
    headers = {"Authorization": fake_token}
    
    print("\n1. Testing GET /api/admin/pages with fake auth header")
    try:
        response = requests.get(f"{BACKEND_URL}/admin/pages", headers=headers, timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print("   ✓ Works with auth header (auth not required)")
        elif response.status_code == 401:
            print("   ✗ Returns 401 - this means auth is still required!")
            return False
        else:
            print(f"   ? Unexpected status: {response.text}")
    except Exception as e:
        print(f"   Exception: {str(e)}")
        return False
    
    return True

def main():
    print(f"Testing Backend API at: {BACKEND_URL}")
    print(f"Test started at: {datetime.now()}")
    
    # Test admin endpoints without auth
    admin_results = test_admin_endpoints_without_auth()
    
    # Test public endpoints  
    public_results = test_public_endpoints()
    
    # Test that auth headers don't break anything
    auth_test = test_with_auth_header_should_still_work()
    
    # Summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    
    print("\nAdmin Endpoints (should work WITHOUT auth):")
    print(f"  GET /api/admin/pages: {'✓ PASS' if admin_results['admin_pages'] else '✗ FAIL'}")
    print(f"  GET /api/admin/contacts: {'✓ PASS' if admin_results['admin_contacts'] else '✗ FAIL'}")
    print(f"  GET /api/settings: {'✓ PASS' if admin_results['settings_get'] else '✗ FAIL'}")
    print(f"  PUT /api/admin/settings: {'✓ PASS' if admin_results['admin_settings_put'] else '✗ FAIL'}")
    
    print("\nPublic Endpoints:")
    print(f"  GET /api/pages: {'✓ PASS' if public_results['public_pages'] else '✗ FAIL'}")
    print(f"  GET /api/menu: {'✓ PASS' if public_results['public_menu'] else '✗ FAIL'}")
    print(f"  GET /api/settings: {'✓ PASS' if public_results['public_settings'] else '✗ FAIL'}")
    
    print(f"\nAuth Header Test: {'✓ PASS' if auth_test else '✗ FAIL'}")
    
    # Overall result
    all_admin_pass = all(admin_results.values())
    all_public_pass = all(public_results.values())
    
    if all_admin_pass and all_public_pass and auth_test:
        print("\n🎉 ALL TESTS PASSED - Authorization removed successfully!")
        return 0
    else:
        print("\n❌ SOME TESTS FAILED - Check results above")
        return 1

if __name__ == "__main__":
    sys.exit(main())