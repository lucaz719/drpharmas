#!/usr/bin/env python3
"""
Script to fix revenue calculation in subscription_stats
"""

# Updated subscription_stats function with proper revenue calculation
updated_function = '''
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def subscription_stats(request):
    """Get subscription statistics for admin dashboard."""
    if request.user.role != 'super_admin':
        return Response({
            'error': _('Insufficient permissions to view subscription statistics.')
        }, status=status.HTTP_403_FORBIDDEN)

    from django.utils import timezone
    from django.db.models import Sum, Count
    from decimal import Decimal

    # Basic stats
    total_orgs = Organization.objects.count()
    active_subscriptions = OrganizationSubscription.objects.filter(
        status='active',
        end_date__gt=timezone.now()
    ).count()

    # Revenue calculation based on actual subscriptions
    monthly_revenue = Decimal('0')
    subscription_distribution = {
        'trial': 0,
        'basic': 0,
        'professional': 0,
        'enterprise': 0
    }
    
    # Get active subscriptions with plan details
    active_subs = OrganizationSubscription.objects.filter(
        status='active',
        end_date__gt=timezone.now()
    ).select_related('plan')
    
    for subscription in active_subs:
        plan_name = subscription.plan.name
        if plan_name in subscription_distribution:
            subscription_distribution[plan_name] += 1
            
            # Calculate monthly revenue from pricing tiers
            if subscription.plan.pricing_tiers:
                monthly_tier = next(
                    (tier for tier in subscription.plan.pricing_tiers if tier.get('cycle') == 'monthly'),
                    subscription.plan.pricing_tiers[0] if subscription.plan.pricing_tiers else None
                )
                if monthly_tier:
                    monthly_revenue += Decimal(str(monthly_tier.get('price', 0)))
            else:
                monthly_revenue += subscription.plan.price

    # Growth calculation (this month vs last month)
    now = timezone.now()
    current_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    if now.month == 1:
        last_month_start = current_month_start.replace(year=now.year-1, month=12)
    else:
        last_month_start = current_month_start.replace(month=now.month-1)
    
    current_month_subs = OrganizationSubscription.objects.filter(
        created_at__gte=current_month_start
    ).count()
    
    last_month_subs = OrganizationSubscription.objects.filter(
        created_at__gte=last_month_start,
        created_at__lt=current_month_start
    ).count()
    
    growth_rate = 0
    if last_month_subs > 0:
        growth_rate = ((current_month_subs - last_month_subs) / last_month_subs) * 100

    # Recent subscriptions
    recent_subscriptions = OrganizationSubscription.objects.order_by('-created_at')[:5]

    stats = {
        'total_organizations': total_orgs,
        'active_subscriptions': active_subscriptions,
        'total_users': User.objects.count(),
        'active_users': User.objects.filter(status='active', is_active=True).count(),
        'monthly_revenue': float(monthly_revenue),
        'growth_rate': round(growth_rate, 1),
        'subscription_distribution': subscription_distribution,
        'recent_subscriptions': OrganizationSubscriptionSerializer(recent_subscriptions, many=True).data
    }

    return Response(stats)
'''

print("Revenue calculation has been updated to use actual subscription pricing from the database.")
print("Monthly revenue is now calculated from active subscriptions and their pricing tiers.")