from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal
from ..models import BulkOrder, BulkOrderItem, BulkOrderPayment
from accounts.models import User
from organizations.models import Organization


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def supplier_dashboard_stats(request):
    """Get supplier dashboard statistics."""
    try:
        user = request.user
        organization_id = getattr(user, 'organization_id', None)
        
        if not organization_id:
            return Response({'error': 'User not associated with organization'}, status=400)
        
        # Filter orders for this supplier organization
        orders = BulkOrder.objects.filter(supplier_organization_id=organization_id)
        
        # If user is supplier_admin, filter by their specific orders
        if user.role == 'supplier_admin':
            orders = orders.filter(supplier_user=user)
        
        # Summary statistics
        total_orders = orders.count()
        completed_orders = orders.filter(status=BulkOrder.COMPLETED).count()
        pending_orders = orders.filter(
            status__in=[BulkOrder.SUBMITTED, BulkOrder.SUPPLIER_REVIEWING, BulkOrder.SUPPLIER_CONFIRMED]
        ).count()
        
        # Calculate total sales (completed orders)
        total_sales = orders.filter(status=BulkOrder.COMPLETED).aggregate(
            total=Sum('total_amount')
        )['total'] or Decimal('0')
        
        # Count unique customers (buyer organizations)
        total_customers = orders.values('buyer_organization_id').distinct().count()
        
        # Calculate credit to receive (orders with remaining payments)
        credit_to_receive = orders.filter(
            status__in=[BulkOrder.PAYMENT_PENDING, BulkOrder.PAYMENT_PARTIAL, BulkOrder.COMPLETED],
            remaining_amount__gt=0
        ).aggregate(total=Sum('remaining_amount'))['total'] or Decimal('0')
        
        return Response({
            'total_orders': total_orders,
            'completed_orders': completed_orders,
            'pending_orders': pending_orders,
            'total_sales': float(total_sales),
            'total_customers': total_customers,
            'credit_to_receive': float(credit_to_receive)
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def supplier_recent_orders(request):
    """Get recent orders for supplier dashboard."""
    try:
        user = request.user
        organization_id = getattr(user, 'organization_id', None)
        
        if not organization_id:
            return Response({'error': 'User not associated with organization'}, status=400)
        
        # Filter orders for this supplier organization
        orders = BulkOrder.objects.filter(supplier_organization_id=organization_id)
        
        # If user is supplier_admin, filter by their specific orders
        if user.role == 'supplier_admin':
            orders = orders.filter(supplier_user=user)
        
        # Get recent orders (last 10)
        recent_orders = orders.select_related(
            'buyer_organization', 'buyer_branch'
        ).order_by('-created_at')[:10]
        
        orders_data = []
        for order in recent_orders:
            orders_data.append({
                'id': order.id,
                'order_number': order.order_number,
                'buyer_name': order.buyer_organization.name,
                'branch_name': order.buyer_branch.name if order.buyer_branch else '',
                'total_amount': float(order.total_amount),
                'status': order.status,
                'order_date': order.order_date.strftime('%Y-%m-%d'),
                'items_count': order.items.count()
            })
        
        return Response(orders_data)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def supplier_orders_over_time(request):
    """Get orders over time data for chart."""
    try:
        user = request.user
        organization_id = getattr(user, 'organization_id', None)
        
        if not organization_id:
            return Response({'error': 'User not associated with organization'}, status=400)
        
        # Get last 30 days
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=29)
        
        # Filter orders for this supplier organization
        orders = BulkOrder.objects.filter(supplier_organization_id=organization_id)
        
        # If user is supplier_admin, filter by their specific orders
        if user.role == 'supplier_admin':
            orders = orders.filter(supplier_user=user)
        
        # Get orders in date range
        orders = orders.filter(
            order_date__date__gte=start_date,
            order_date__date__lte=end_date
        )
        
        # Group by date
        daily_data = {}
        current_date = start_date
        while current_date <= end_date:
            daily_data[current_date.strftime('%Y-%m-%d')] = 0
            current_date += timedelta(days=1)
        
        # Count orders per day
        for order in orders:
            date_str = order.order_date.date().strftime('%Y-%m-%d')
            if date_str in daily_data:
                daily_data[date_str] += 1
        
        # Convert to chart format
        chart_data = [
            {'date': date, 'orders': count}
            for date, count in daily_data.items()
        ]
        
        return Response(chart_data)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def supplier_customers_chart(request):
    """Get customer distribution pie chart data."""
    try:
        user = request.user
        organization_id = getattr(user, 'organization_id', None)
        
        if not organization_id:
            return Response({'error': 'User not associated with organization'}, status=400)
        
        # Filter orders for this supplier organization
        orders = BulkOrder.objects.filter(supplier_organization_id=organization_id)
        
        # If user is supplier_admin, filter by their specific orders
        if user.role == 'supplier_admin':
            orders = orders.filter(supplier_user=user)
        
        # Group by buyer organization and count orders
        customer_data = orders.values(
            'buyer_organization__name'
        ).annotate(
            order_count=Count('id'),
            total_value=Sum('total_amount')
        ).order_by('-order_count')[:10]  # Top 10 customers
        
        chart_data = []
        for item in customer_data:
            chart_data.append({
                'name': item['buyer_organization__name'],
                'orders': item['order_count'],
                'value': float(item['total_value'] or 0)
            })
        
        return Response(chart_data)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def supplier_top_products(request):
    """Get top selling products."""
    try:
        user = request.user
        organization_id = getattr(user, 'organization_id', None)
        
        if not organization_id:
            return Response({'error': 'User not associated with organization'}, status=400)
        
        # Filter orders for this supplier organization
        orders = BulkOrder.objects.filter(supplier_organization_id=organization_id)
        
        # If user is supplier_admin, filter by their specific orders
        if user.role == 'supplier_admin':
            orders = orders.filter(supplier_user=user)
        
        # Get order items from these orders
        order_items = BulkOrderItem.objects.filter(
            bulk_order__in=orders,
            is_cancelled=False
        ).select_related('product')
        
        # Group by product and sum quantities
        product_data = {}
        for item in order_items:
            product_name = item.product.name
            quantity = item.quantity_final or item.quantity_confirmed
            
            if product_name not in product_data:
                product_data[product_name] = {
                    'name': product_name,
                    'total_quantity': 0,
                    'total_orders': 0,
                    'total_value': 0
                }
            
            product_data[product_name]['total_quantity'] += quantity
            product_data[product_name]['total_orders'] += 1
            if item.unit_price:
                product_data[product_name]['total_value'] += float(item.unit_price * quantity)
        
        # Sort by total quantity and get top 10
        top_products = sorted(
            product_data.values(),
            key=lambda x: x['total_quantity'],
            reverse=True
        )[:10]
        
        return Response(top_products)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)