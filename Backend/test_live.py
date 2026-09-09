import urllib.request
import urllib.error
import json
import http.cookiejar

def run_live_tests():
    base_url = 'http://127.0.0.1:8000'
    cj = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
    
    def req(method, path, data=None, headers=None):
        if headers is None: headers = {}
        url = base_url + path
        csrf = None
        for cookie in cj:
            if cookie.name == 'csrftoken':
                csrf = cookie.value
        if csrf:
            headers['X-CSRFToken'] = csrf
            
        req_obj = urllib.request.Request(url, method=method, headers=headers)
        if data:
            req_obj.data = json.dumps(data).encode('utf-8')
            req_obj.add_header('Content-Type', 'application/json')
            
        try:
            resp = opener.open(req_obj)
            return resp.getcode(), resp.read()
        except urllib.error.HTTPError as e:
            return e.code, e.read()
        except Exception as e:
            return 0, str(e).encode('utf-8')

    req('GET', '/api/auth/csrf/')
    code, content = req('POST', '/api/auth/login/', data={'username': 'admin', 'password': 'admin123'})
    
    code, content = req('POST', '/api/services/', {
        'service_name': 'Test Service', 'service_name_ar': 'Test Service AR',
        'service_description': 'desc', 'service_description_ar': 'desc',
        'service_icon': 'icon-class'
    })
    print(f"POST /api/services/: {code} {content[:200]}")
    s_id = None
    if code == 201:
        s_id = json.loads(content).get('id')
        code2, content2 = req('DELETE', f'/api/services/{s_id}/')
        print(f"DELETE /api/services/{s_id}/: {code2}")

    code, content = req('POST', '/api/general-information/', {
        'main_title': 'Title', 'main_title_ar': 'Title AR',
        'second_title': 'Sub', 'second_title_ar': 'Sub AR',
        'description': 'desc', 'description_ar': 'desc',
        'image': None, 'about_image': None, 'about_video': None
    })
    print(f"POST /api/general-information/: {code} {content[:200]}")
    if code == 409:
        code, content = req('PUT', '/api/general-information/', {
            'main_title': 'Title PUT', 'main_title_ar': 'Title AR',
            'second_title': 'Sub', 'second_title_ar': 'Sub AR',
            'description': 'desc', 'description_ar': 'desc',
        })
        print(f"PUT /api/general-information/: {code} {content[:200]}")
        
    code, content = req('GET', '/api/general-information/')
    print(f"GET /api/general-information/: {code} {content[:200]}")

    code, content = req('POST', '/api/project-categories/', {'category_name': 'Test Cat', 'category_name_ar': 'Test Cat AR'})
    print(f"POST /api/project-categories/: {code} {content[:200]}")
    c_id = None
    if code == 201:
        c_id = json.loads(content).get('id')

    if c_id:
        code, content = req('POST', '/api/projects/', {
            'project_title': 'Test Proj', 'project_title_ar': 'Test Proj AR',
            'project_description': 'desc', 'project_description_ar': 'desc',
            'project_category': c_id,
            'client_name': 'client', 'client_name_ar': 'client',
            'project_location': 'loc', 'project_location_ar': 'loc'
        })
        print(f"POST /api/projects/: {code} {content[:200]}")
        if code == 201:
            p_id = json.loads(content).get('id')
            code2, content2 = req('DELETE', f'/api/projects/{p_id}/')
            print(f"DELETE /api/projects/{p_id}/: {code2}")
        code3, content3 = req('DELETE', f'/api/project-categories/{c_id}/')
        print(f"DELETE /api/project-categories/{c_id}/: {code3}")

    code, content = req('POST', '/api/news/', {
        'news_title': 'Test News', 'news_title_ar': 'Test News AR',
        'news_description': 'desc', 'news_description_ar': 'desc',
        'news_content': 'content', 'news_content_ar': 'content'
    })
    print(f"POST /api/news/: {code} {content[:200]}")
    if code == 201:
        n_id = json.loads(content).get('id')
        code2, content2 = req('DELETE', f'/api/news/{n_id}/')
        print(f"DELETE /api/news/{n_id}/: {code2}")

    code, content = req('POST', '/api/contact-us/', {
        'email_1': 'a@b.com', 'email_2': 'c@d.com', 'phone_number_1': '123',
        'address': '123', 'address_ar': '123'
    })
    print(f"POST /api/contact-us/: {code} {content[:200]}")
    if code == 409:
        code, content = req('PUT', '/api/contact-us/', {
            'email_1': 'a@b.com', 'email_2': 'c@d.com', 'phone_number_1': '123',
            'address': '123', 'address_ar': '123'
        })
        print(f"PUT /api/contact-us/: {code} {content[:200]}")

if __name__ == '__main__':
    run_live_tests()
