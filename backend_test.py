#!/usr/bin/env python3
"""
Backend API Testing Script
Tests Services API, User Preferences API, and Blog API endpoints
"""

import requests
import json
import sys
from datetime import datetime

# Backend URL from frontend/.env
BACKEND_URL = "https://demobackend.emergentagent.com/api"

def create_test_user():
    """Create a test user and return auth token"""
    print("=== Creating Test User for Authentication ===")
    
    test_user = {
        "username": "testuser_tarot",
        "email": "test@tarot.com", 
        "password": "testpass123"
    }
    
    try:
        # Try to register
        response = requests.post(f"{BACKEND_URL}/auth/register", json=test_user, timeout=10)
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            print(f"   ✓ User created successfully, token: {token[:20]}...")
            return token
        elif response.status_code == 400 and "already exists" in response.text:
            # User exists, try to login
            print("   User already exists, trying to login...")
            login_data = {"username": test_user["username"], "password": test_user["password"]}
            response = requests.post(f"{BACKEND_URL}/auth/login", json=login_data, timeout=10)
            if response.status_code == 200:
                data = response.json()
                token = data.get("access_token")
                print(f"   ✓ Login successful, token: {token[:20]}...")
                return token
        
        print(f"   ✗ Failed to create/login user: {response.status_code} - {response.text}")
        return None
    except Exception as e:
        print(f"   Exception: {str(e)}")
        return None

def test_services_api():
    """Test Services API endpoints"""
    print("\n=== Testing Services API ===")
    
    results = {
        "get_public_services": False,
        "get_admin_services": False,
        "create_service": False,
        "update_service": False,
        "delete_service": False
    }
    
    created_service_id = None
    
    # Test GET /api/services (public)
    print("\n1. Testing GET /api/services (public)")
    try:
        response = requests.get(f"{BACKEND_URL}/services", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: Got {len(data)} visible services")
            results["get_public_services"] = True
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {str(e)}")
    
    # Test GET /api/admin/services
    print("\n2. Testing GET /api/admin/services")
    try:
        response = requests.get(f"{BACKEND_URL}/admin/services", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: Got {len(data)} total services")
            results["get_admin_services"] = True
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {str(e)}")
    
    # Test POST /api/admin/services
    print("\n3. Testing POST /api/admin/services")
    try:
        test_service = {
            "title": "Таро Расклады",
            "description": "Глубокий анализ жизненных ситуаций через карты Таро",
            "icon": "Star",
            "order": 1,
            "visible": True
        }
        response = requests.post(f"{BACKEND_URL}/admin/services", json=test_service, timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            created_service_id = data.get("id")
            print(f"   Response: Service created with ID {created_service_id}")
            results["create_service"] = True
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {str(e)}")
    
    # Test PUT /api/admin/services/{id}
    if created_service_id:
        print(f"\n4. Testing PUT /api/admin/services/{created_service_id}")
        try:
            update_data = {
                "title": "Таро Расклады - Обновлено",
                "description": "Обновленное описание услуги"
            }
            response = requests.put(f"{BACKEND_URL}/admin/services/{created_service_id}", json=update_data, timeout=10)
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"   Response: Service updated - {data.get('title')}")
                results["update_service"] = True
            else:
                print(f"   Error: {response.text}")
        except Exception as e:
            print(f"   Exception: {str(e)}")
    
    # Test DELETE /api/admin/services/{id}
    if created_service_id:
        print(f"\n5. Testing DELETE /api/admin/services/{created_service_id}")
        try:
            response = requests.delete(f"{BACKEND_URL}/admin/services/{created_service_id}", timeout=10)
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"   Response: {data.get('message', 'Service deleted')}")
                results["delete_service"] = True
            else:
                print(f"   Error: {response.text}")
        except Exception as e:
            print(f"   Exception: {str(e)}")
    
    return results

def test_user_preferences_api(auth_token):
    """Test User Preferences API endpoints (requires auth)"""
    print("\n=== Testing User Preferences API ===")
    
    results = {
        "get_preferences": False,
        "update_preferences": False
    }
    
    if not auth_token:
        print("   ✗ No auth token available, skipping preferences tests")
        return results
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Test GET /api/admin/preferences
    print("\n1. Testing GET /api/admin/preferences")
    try:
        response = requests.get(f"{BACKEND_URL}/admin/preferences", headers=headers, timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: Current theme = {data.get('admin_theme', 'not found')}")
            results["get_preferences"] = True
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {str(e)}")
    
    # Test PUT /api/admin/preferences
    print("\n2. Testing PUT /api/admin/preferences")
    try:
        test_prefs = {"admin_theme": "dark"}
        response = requests.put(f"{BACKEND_URL}/admin/preferences", json=test_prefs, headers=headers, timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: Theme updated to {data.get('admin_theme')}")
            results["update_preferences"] = True
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {str(e)}")
    
    return results

def test_blog_api():
    """Test Blog API endpoints"""
    print("\n=== Testing Blog API ===")
    
    results = {
        "get_blog_posts": False,
        "get_single_post": False,
        "create_test_post": False
    }
    
    # First, create a test blog post via admin API (no auth required based on backend code)
    print("\n1. Creating test blog post via admin API")
    try:
        test_post = {
            "title": "Тестовый пост блога",
            "content": "<p>Это тестовый контент для проверки API блога.</p>",
            "excerpt": "Краткое описание тестового поста",
            "published": True,
            "tags": ["тест", "api"]
        }
        response = requests.post(f"{BACKEND_URL}/admin/blog", json=test_post, timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            created_post_id = data.get("id")
            print(f"   Response: Test post created with ID {created_post_id}")
            results["create_test_post"] = True
        else:
            print(f"   Error: {response.text}")
            created_post_id = None
    except Exception as e:
        print(f"   Exception: {str(e)}")
        created_post_id = None
    
    # Test GET /api/blog
    print("\n2. Testing GET /api/blog")
    try:
        response = requests.get(f"{BACKEND_URL}/blog", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: Got {len(data)} published blog posts")
            results["get_blog_posts"] = True
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {str(e)}")
    
    # Test GET /api/blog/{id}
    if created_post_id:
        print(f"\n3. Testing GET /api/blog/{created_post_id}")
        try:
            response = requests.get(f"{BACKEND_URL}/blog/{created_post_id}", timeout=10)
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"   Response: Got post '{data.get('title')}'")
                results["get_single_post"] = True
            else:
                print(f"   Error: {response.text}")
        except Exception as e:
            print(f"   Exception: {str(e)}")
    
    return results

def test_backend_connectivity():
    """Test basic backend connectivity"""
    print("\n=== Testing Backend Connectivity ===")
    
    try:
        response = requests.get(f"{BACKEND_URL}/settings", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print("   ✓ Backend is accessible")
            return True
        else:
            print(f"   ✗ Backend returned error: {response.text}")
            return False
    except Exception as e:
        print(f"   ✗ Cannot connect to backend: {str(e)}")
        return False

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