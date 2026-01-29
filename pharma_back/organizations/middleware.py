from django.http import JsonResponse
from django.utils import timezone
from django.urls import resolve
from .models import OrganizationSubscription


class SubscriptionMiddleware:
    """Middleware to check subscription status for API requests."""
    
    def __init__(self, get_response):
        self.get_response = get_response
        
        # URLs that don't require subscription check
        self.exempt_urls = [
            'auth',  # Authentication endpoints
            'admin',  # Django admin
            'subscription-plans',  # Subscription plan endpoints
            'subscription-stats',  # Subscription stats for admin
            'create-subscription',  # Creating subscriptions
            'update-plan',  # Updating plans
        ]
    
    def __call__(self, request):
        # Check if this is an API request that needs subscription validation
        if self.should_check_subscription(request):
            subscription_valid, error_message = self.check_subscription(request)
            if not subscription_valid:
                return JsonResponse({
                    'error': 'Subscription expired',
                    'message': error_message or 'Your organization\'s subscription has expired. Please renew to continue using the system.',
                    'subscription_required': True
                }, status=402)
        
        response = self.get_response(request)
        return response
    
    def should_check_subscription(self, request):
        """Determine if subscription check is needed for this request."""
        # Skip non-API requests
        if not request.path.startswith('/organizations/') and not request.path.startswith('/inventory/') and not request.path.startswith('/patients/') and not request.path.startswith('/pos/'):
            return False
        
        # Skip if user is not authenticated
        if not hasattr(request, 'user') or not request.user.is_authenticated:
            return False
        
        # Skip for super admin
        if hasattr(request.user, 'role') and request.user.role == 'super_admin':
            return False
        
        # Skip exempt URLs
        for exempt_url in self.exempt_urls:
            if exempt_url in request.path:
                return False
        
        # Skip GET requests to subscription-related endpoints
        if request.method == 'GET' and ('subscription' in request.path.lower() or 'plan' in request.path.lower()):
            return False
        
        return True
    
    def check_subscription(self, request):
        """Check if user's organization has an active subscription."""
        user = request.user
        
        if not hasattr(user, 'organization_id') or not user.organization_id:
            return False, "No organization associated with user"
        
        try:
            active_subscription = OrganizationSubscription.objects.filter(
                organization_id=user.organization_id,
                status='active',
                end_date__gt=timezone.now()
            ).first()
            
            if not active_subscription:
                return False, "No active subscription found for organization"
            
            return True, None
        except Exception as e:
            # Log the error but don't block the request
            print(f"Subscription check error: {str(e)}")
            return True, None  # Allow request to proceed if check fails