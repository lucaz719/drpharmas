from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.utils import timezone
from ..models import CustomSupplier, PurchaseTransaction, BulkOrder
from accounts.models import User


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def debug_suppliers(request):
    """Debug view to see all suppliers in database"""
    try:
        organization_id = getattr(request.user, 'organization_id', None)
        supplier_name = request.GET.get('supplier_name')
        
        if supplier_name:
            # Debug specific supplier
            from .supplier_ledger_views import get_custom_supplier_data
            
            # Get all transactions for this supplier
            transactions = PurchaseTransaction.objects.filter(
                organization_id=organization_id,
                supplier_name__icontains=supplier_name
            ).prefetch_related('payments')
            
            transaction_details = []
            for t in transactions:
                payments = list(t.payments.all())
                transaction_details.append({
                    'id': t.id,
                    'transaction_number': t.transaction_number,
                    'supplier_name': t.supplier_name,
                    'total_amount': float(t.total_amount),
                    'created_at': t.created_at,
                    'payments': [{
                        'id': p.id,
                        'payment_number': p.payment_number,
                        'paid_amount': float(p.paid_amount),
                        'credit_amount': float(p.credit_amount),
                        'payment_method': p.payment_method,
                        'created_at': p.created_at
                    } for p in payments]
                })
            
            # Get ledger calculation
            ledger_data = get_custom_supplier_data(supplier_name, organization_id)
            
            return Response({
                'supplier_name': supplier_name,
                'organization_id': organization_id,
                'raw_transactions': transaction_details,
                'ledger_calculation': ledger_data,
                'total_transactions': len(transaction_details)
            })
        
        # Get all purchase transactions
        transactions = PurchaseTransaction.objects.filter(organization_id=organization_id)
        supplier_names = list(transactions.values_list('supplier_name', flat=True).distinct())
        
        # Get all custom suppliers
        custom_suppliers = CustomSupplier.objects.filter(organization_id=organization_id)
        custom_names = [s.name for s in custom_suppliers]
        
        # Get all user suppliers
        user_suppliers = User.objects.filter(role='supplier_admin')
        user_names = [u.get_full_name() or u.email for u in user_suppliers]
        
        return Response({
            'organization_id': organization_id,
            'transaction_suppliers': supplier_names,
            'custom_suppliers': custom_names,
            'user_suppliers': user_names,
            'total_transactions': transactions.count(),
            'debug_help': 'Add ?supplier_name=<name> to debug specific supplier'
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_customer_details(request, customer_id):
    """Get detailed customer information including order history and status."""
    try:
        user = request.user
        organization_id = getattr(user, 'organization_id', None)
        
        if not organization_id:
            return Response({'error': 'User not associated with organization'}, status=400)
        
        # Get all orders for this customer (organization-branch combination)
        # Parse customer_id to get organization name
        org_name = customer_id.split('-')[0] if '-' in customer_id else customer_id
        
        orders = BulkOrder.objects.filter(
            supplier_organization_id=organization_id,
            buyer_organization__name__icontains=org_name
        ).select_related('buyer_organization').prefetch_related('items__product', 'payments')
        
        if not orders.exists():
            return Response({'error': 'Customer not found'}, status=404)
        
        # Get customer summary from orders
        first_order = orders.order_by('created_at').first()
        latest_order = orders.order_by('-created_at').first()
        
        customer_info = {
            'id': customer_id,
            'name': first_order.buyer_organization.name if first_order.buyer_organization else customer_id.split('-')[0],
            'organization_name': first_order.buyer_organization.name if first_order.buyer_organization else customer_id.split('-')[0],
            'branch_name': customer_id.split('-')[1] if '-' in customer_id else 'Main Branch',
            'customer_since': first_order.created_at.date(),
            'last_order_date': latest_order.created_at.date(),
            'total_orders': orders.count(),
            'total_spent': sum(order.total_amount for order in orders),
            'total_paid': sum(order.total_paid_amount for order in orders),
            'total_credit': sum(order.remaining_amount for order in orders),
            'status': 'active' if orders.filter(created_at__gte=timezone.now() - timezone.timedelta(days=90)).exists() else 'inactive'
        }
        
        # Get order history with details
        order_history = []
        for order in orders.order_by('-created_at')[:10]:  # Last 10 orders
            order_data = {
                'id': order.id,
                'order_number': order.order_number,
                'order_date': order.created_at.date(),
                'status': order.status,
                'total_amount': float(order.total_amount),
                'paid_amount': float(order.total_paid_amount),
                'remaining_amount': float(order.remaining_amount),
                'items_count': order.items.count(),
                'expected_delivery': order.expected_delivery_date,
                'delivered_date': order.delivered_date.date() if order.delivered_date else None,
                'is_released': order.status in [BulkOrder.RELEASED, BulkOrder.IMPORTED, BulkOrder.COMPLETED],
                'payment_status': order.payment_status
            }
            order_history.append(order_data)
        
        # Get recent items purchased
        recent_items = []
        for order in orders.order_by('-created_at')[:3]:
            for item in order.items.all()[:5]:  # Top 5 items per recent order
                recent_items.append({
                    'product_name': item.product.name,
                    'quantity': item.quantity_confirmed or item.quantity_requested,
                    'unit_price': float(item.unit_price) if item.unit_price else 0,
                    'order_date': order.created_at.date(),
                    'order_number': order.order_number
                })
        
        # Calculate loyalty metrics
        loyalty_metrics = {
            'tier': 'Gold' if customer_info['total_spent'] > 100000 else 'Silver' if customer_info['total_spent'] > 50000 else 'Bronze',
            'points': int(customer_info['total_spent'] / 100),  # 1 point per 100 spent
            'avg_order_value': customer_info['total_spent'] / customer_info['total_orders'] if customer_info['total_orders'] > 0 else 0,
            'order_frequency': 'Regular' if customer_info['total_orders'] > 10 else 'Occasional'
        }
        
        return Response({
            'customer': customer_info,
            'order_history': order_history,
            'recent_items': recent_items,
            'loyalty_metrics': loyalty_metrics,
            'summary': {
                'total_orders': customer_info['total_orders'],
                'total_amount': customer_info['total_spent'],
                'paid_amount': customer_info['total_paid'],
                'credit_amount': customer_info['total_credit'],
                'status': customer_info['status']
            }
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def supplier_detail(request, supplier_id):
    """Get supplier detail information - returns same format as supplier_ledger_detail"""
    try:
        organization_id = getattr(request.user, 'organization_id', None)
        if not organization_id:
            return Response({'error': 'User not associated with organization'}, status=400)
        
        # Get supplier info
        supplier_info = None
        user_supplier = None
        custom_supplier = None
        
        try:
            user_supplier = User.objects.get(id=supplier_id, role='supplier_admin')
            supplier_info = {
                'id': supplier_id,
                'name': user_supplier.get_full_name() or user_supplier.email,
                'type': 'user',
                'user_id': supplier_id,
                'contact': user_supplier.email
            }
        except User.DoesNotExist:
            try:
                custom_supplier = CustomSupplier.objects.get(id=supplier_id, organization_id=organization_id)
                supplier_info = {
                    'id': supplier_id,
                    'name': custom_supplier.name,
                    'type': 'custom',
                    'user_id': None,
                    'contact': custom_supplier.phone or custom_supplier.email
                }
            except CustomSupplier.DoesNotExist:
                return Response({'error': 'Supplier not found'}, status=404)
        
        # Get transaction data using supplier user ID and branch filtering
        branch_id = getattr(request.user, 'branch_id', None)
        
        from .supplier_ledger_views import get_stock_management_data, get_bulk_order_data
        
        if supplier_info['type'] == 'user':
            stock_data = get_stock_management_data(supplier_info['user_id'], organization_id, branch_id)
            bulk_data = get_bulk_order_data(supplier_info['user_id'], organization_id, branch_id)
        else:
            stock_data = {'total_purchases': 0, 'total_paid': 0, 'total_credit': 0, 'transaction_count': 0, 'transactions': []}
            bulk_data = {'total_purchases': 0, 'total_paid': 0, 'total_credit': 0, 'order_count': 0, 'orders': []}
        
        # Return data in format expected by UI
        total_purchases = stock_data['total_purchases'] + bulk_data['total_purchases']
        total_paid = stock_data['total_paid'] + bulk_data['total_paid']
        total_credit = stock_data['total_credit'] + bulk_data['total_credit']
        
        response_data = {
            'supplier_info': supplier_info,
            'summary': {
                'total_purchases': total_purchases,
                'total_paid': total_paid,
                'total_credit': total_credit,
                'pending_credit': total_credit,
                'cleared_credit': total_paid
            },
            'transactions': sorted(
                stock_data['transactions'] + bulk_data['orders'],
                key=lambda x: x['date'],
                reverse=True
            ),
            'stock_management': stock_data,
            'bulk_orders': bulk_data
        }
        
        return Response(response_data)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def test_payment_calculation(request):
    """Test endpoint to verify payment calculations"""
    try:
        organization_id = getattr(request.user, 'organization_id', None)
        supplier_name = request.GET.get('supplier_name', 'Test Supplier')
        
        if not organization_id:
            return Response({'error': 'User not associated with organization'}, status=400)
        
        from .supplier_ledger_views import get_custom_supplier_data
        
        # Get current ledger data
        ledger_data = get_custom_supplier_data(supplier_name, organization_id)
        
        # Get raw transaction data for comparison
        transactions = PurchaseTransaction.objects.filter(
            organization_id=organization_id,
            supplier_name__icontains=supplier_name
        ).prefetch_related('payments')
        
        raw_data = {
            'purchase_transactions': [],
            'payment_transactions': []
        }
        
        total_purchases_raw = 0
        total_payments_raw = 0
        
        for t in transactions:
            if t.total_amount > 0:
                # Purchase transaction
                payments = list(t.payments.all())
                total_purchases_raw += float(t.total_amount)
                
                for p in payments:
                    total_payments_raw += float(p.paid_amount)
                
                raw_data['purchase_transactions'].append({
                    'transaction_number': t.transaction_number,
                    'total_amount': float(t.total_amount),
                    'payments': [{
                        'paid_amount': float(p.paid_amount),
                        'credit_amount': float(p.credit_amount)
                    } for p in payments]
                })
            else:
                # Payment-only transaction
                payments = list(t.payments.all())
                for p in payments:
                    total_payments_raw += float(p.paid_amount)
                
                raw_data['payment_transactions'].append({
                    'transaction_number': t.transaction_number,
                    'payment_amount': float(payments[0].paid_amount) if payments else 0
                })
        
        return Response({
            'supplier_name': supplier_name,
            'ledger_calculation': ledger_data,
            'raw_calculation': {
                'total_purchases': total_purchases_raw,
                'total_payments': total_payments_raw,
                'calculated_credit': total_purchases_raw - total_payments_raw
            },
            'raw_data': raw_data,
            'matches': {
                'purchases_match': ledger_data['total_purchases'] == total_purchases_raw,
                'payments_match': ledger_data['total_paid'] == total_payments_raw,
                'credit_match': ledger_data['total_credit'] == (total_purchases_raw - total_payments_raw)
            }
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)