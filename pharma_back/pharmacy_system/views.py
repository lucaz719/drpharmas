from django.http import JsonResponse, HttpResponse

def api_status(request):
    return JsonResponse({
        "status": "success",
        "message": "Pharmacy API is running",
        "endpoints": [
            "GET /api/ - API Status",
            "POST /api/auth/login/ - User Login",
            "GET /api/auth/users/ - Users List",
            "GET /api/organizations/ - Organizations"
        ]
    })