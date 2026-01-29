from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Q
from .models import User

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_stats(request):
    """Get user statistics."""
    if request.user.role != 'super_admin':
        return Response({'error': 'Insufficient permissions'}, status=403)
    
    total_users = User.objects.count()
    active_users = User.objects.filter(status='active', is_active=True).count()
    
    return Response({
        'total_users': total_users,
        'active_users': active_users
    })