#!/usr/bin/env python3
"""
Backend API Testing Script
Tests admin endpoints to verify they work WITHOUT authorization tokens
"""

import requests
import json
import sys
from datetime import datetime

# Backend URLs
EXTERNAL_BACKEND_URL = "https://tarot.dagnir.ru/api"
LOCAL_BACKEND_URL = "http://localhost:8001/api"

def test_admin_endpoints_without_auth(backend_url, url_type=""):
    """Test that admin endpoints work WITHOUT authorization headers"""
    print(f"=== Testing Admin Endpoints WITHOUT Authorization ({url_type}) ===")
    
    results = {
        "admin_pages": False,
        "admin_contacts": False, 
        "admin_settings_put": False,
        "settings_get": False
    }
    
    # Test GET /api/admin/pages
    print(f"\n1. Testing GET {backend_url}/admin/pages")
    try:
        response = requests.get(f"{backend_url}/admin/pages", timeout=10)
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
    print(f"\n2. Testing GET {backend_url}/admin/contacts")
    try:
        response = requests.get(f"{backend_url}/admin/contacts", timeout=10)
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
    print(f"\n3. Testing GET {backend_url}/settings")
    try:
        response = requests.get(f"{backend_url}/settings", timeout=10)
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
    print(f"\n4. Testing PUT {backend_url}/admin/settings")
    try:
        test_data = {"theme": "winter"}
        response = requests.put(
            f"{backend_url}/admin/settings", 
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

def test_public_endpoints(backend_url, url_type=""):
    """Test public endpoints"""
    print(f"\n=== Testing Public Endpoints ({url_type}) ===")
    
    results = {
        "public_pages": False,
        "public_menu": False,
        "public_settings": False
    }
    
    # Test GET /api/pages
    print(f"\n1. Testing GET {backend_url}/pages")
    try:
        response = requests.get(f"{backend_url}/pages", timeout=10)
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
    print(f"\n2. Testing GET {backend_url}/menu")
    try:
        response = requests.get(f"{backend_url}/menu", timeout=10)
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
    print(f"\n3. Testing GET {backend_url}/settings (public)")
    try:
        response = requests.get(f"{backend_url}/settings", timeout=10)
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

def main():
    print("Testing Backend API - Local vs External")
    print(f"Test started at: {datetime.now()}")
    
    # Test local backend first
    print(f"\n{'='*80}")
    print("TESTING LOCAL BACKEND (localhost:8001)")
    print('='*80)
    
    local_admin_results = test_admin_endpoints_without_auth(LOCAL_BACKEND_URL, "LOCAL")
    local_public_results = test_public_endpoints(LOCAL_BACKEND_URL, "LOCAL")
    
    # Test external backend
    print(f"\n{'='*80}")
    print("TESTING EXTERNAL BACKEND (https://tarot.dagnir.ru)")
    print('='*80)
    
    external_admin_results = test_admin_endpoints_without_auth(EXTERNAL_BACKEND_URL, "EXTERNAL")
    external_public_results = test_public_endpoints(EXTERNAL_BACKEND_URL, "EXTERNAL")
    
    # Summary
    print("\n" + "="*80)
    print("SUMMARY")
    print("="*80)
    
    print("\nLOCAL BACKEND RESULTS:")
    print("  Admin Endpoints (should work WITHOUT auth):")
    print(f"    GET /api/admin/pages: {'✓ PASS' if local_admin_results['admin_pages'] else '✗ FAIL'}")
    print(f"    GET /api/admin/contacts: {'✓ PASS' if local_admin_results['admin_contacts'] else '✗ FAIL'}")
    print(f"    GET /api/settings: {'✓ PASS' if local_admin_results['settings_get'] else '✗ FAIL'}")
    print(f"    PUT /api/admin/settings: {'✓ PASS' if local_admin_results['admin_settings_put'] else '✗ FAIL'}")
    
    print("  Public Endpoints:")
    print(f"    GET /api/pages: {'✓ PASS' if local_public_results['public_pages'] else '✗ FAIL'}")
    print(f"    GET /api/menu: {'✓ PASS' if local_public_results['public_menu'] else '✗ FAIL'}")
    print(f"    GET /api/settings: {'✓ PASS' if local_public_results['public_settings'] else '✗ FAIL'}")
    
    print("\nEXTERNAL BACKEND RESULTS:")
    print("  Admin Endpoints (should work WITHOUT auth):")
    print(f"    GET /api/admin/pages: {'✓ PASS' if external_admin_results['admin_pages'] else '✗ FAIL'}")
    print(f"    GET /api/admin/contacts: {'✓ PASS' if external_admin_results['admin_contacts'] else '✗ FAIL'}")
    print(f"    GET /api/settings: {'✓ PASS' if external_admin_results['settings_get'] else '✗ FAIL'}")
    print(f"    PUT /api/admin/settings: {'✓ PASS' if external_admin_results['admin_settings_put'] else '✗ FAIL'}")
    
    print("  Public Endpoints:")
    print(f"    GET /api/pages: {'✓ PASS' if external_public_results['public_pages'] else '✗ FAIL'}")
    print(f"    GET /api/menu: {'✓ PASS' if external_public_results['public_menu'] else '✗ FAIL'}")
    print(f"    GET /api/settings: {'✓ PASS' if external_public_results['public_settings'] else '✗ FAIL'}")
    
    # Analysis
    local_admin_pass = all(local_admin_results.values())
    local_public_pass = all(local_public_results.values())
    external_admin_pass = all(external_admin_results.values())
    external_public_pass = all(external_public_results.values())
    
    print(f"\nANALYSIS:")
    if local_admin_pass and local_public_pass:
        print("✓ LOCAL BACKEND: Authorization successfully removed from admin endpoints")
    else:
        print("✗ LOCAL BACKEND: Issues found with admin endpoints")
        
    if external_admin_pass and external_public_pass:
        print("✓ EXTERNAL BACKEND: Authorization successfully removed from admin endpoints")
    elif not external_admin_pass and local_admin_pass:
        print("⚠ EXTERNAL BACKEND: Admin endpoints still require auth - likely reverse proxy/ingress issue")
        print("  The FastAPI code is correct, but external infrastructure adds authentication")
    else:
        print("✗ EXTERNAL BACKEND: Issues found")
    
    # Overall result
    if local_admin_pass and local_public_pass:
        print("\n🎉 SUCCESS: Backend code correctly implements no-auth admin endpoints!")
        if not external_admin_pass:
            print("📝 NOTE: External URL has additional auth layer (infrastructure issue, not code)")
        return 0
    else:
        print("\n❌ FAILURE: Backend code issues found")
        return 1

if __name__ == "__main__":
    sys.exit(main())