import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
import json
import traceback

def run_tests():
    client = Client()
    User = get_user_model()
    
    user, created = User.objects.get_or_create(username='testadmin', is_superuser=True, is_staff=True)
    if created:
        user.set_password('testpass123')
        user.save()

    print("--- Testing Unauthenticated Access ---")
    endpoints_get = [
        '/api/general-information/',
        '/api/services/',
        '/api/project-categories/',
        '/api/projects/',
        '/api/news/',
        '/api/contact-us/'
    ]
    for ep in endpoints_get:
        try:
            resp = client.get(ep)
            print(f"GET {ep} (unauth): {resp.status_code}")
            if resp.status_code == 500:
                print(f"500 ERROR CONTENT: {resp.content[:500]}")
        except Exception as e:
            print(f"Exception on GET {ep}: {e}")

    print("\n--- Testing Authenticated Access (POST/PUT/DELETE) ---")
    client.login(username='testadmin', password='testpass123')
    
    def test_post(url, data):
        try:
            resp = client.post(url, data, content_type='application/json')
            print(f"POST {url}: {resp.status_code}")
            if resp.status_code >= 400:
                print(f"ERROR: {resp.content[:500]}")
            return resp
        except Exception as e:
            print(f"Exception on POST {url}: {e}")
            traceback.print_exc()
            return None

    resp = test_post('/api/services/', {'title_en': 'Test Service EN', 'title_ar': 'Test Service AR', 'description_en': 'desc', 'description_ar': 'desc'})
    if resp and resp.status_code == 201:
        s_id = resp.json().get('id')
        if s_id:
            resp_del = client.delete(f'/api/services/{s_id}/')
            print(f"DELETE /api/services/{s_id}/: {resp_del.status_code}")

    resp = test_post('/api/general-information/', {
        'company_name_en': 'Test Co EN',
        'company_name_ar': 'Test Co AR',
        'address_en': '123 Test St EN',
        'address_ar': '123 Test St AR',
        'phone_number': '123456',
        'email': 'test@test.com',
        'facebook': 'https://fb.com',
        'instagram': 'https://ig.com',
        'linkedin': 'https://li.com'
    })
    
    resp_get = client.get('/api/general-information/')
    print(f"GET /api/general-information/: {resp_get.status_code}")

    resp = test_post('/api/project-categories/', {'name_en': 'Test Cat EN', 'name_ar': 'Test Cat AR'})
    c_id = None
    if resp and resp.status_code == 201:
        c_id = resp.json().get('id')

    if c_id:
        test_post('/api/projects/', {
            'title_en': 'Test Proj EN', 'title_ar': 'Test Proj AR',
            'description_en': 'desc', 'description_ar': 'desc',
            'category': c_id,
            'client_en': 'client', 'client_ar': 'client',
            'location_en': 'loc', 'location_ar': 'loc'
        })
        
    test_post('/api/news/', {
        'title_en': 'Test News EN', 'title_ar': 'Test News AR',
        'content_en': 'content', 'content_ar': 'content'
    })

    test_post('/api/contact-us/', {
        'address_en': '123 Test St', 'address_ar': '123 Test St',
        'email': 'a@b.com', 'phone_number': '123456789'
    })

if __name__ == '__main__':
    run_tests()
