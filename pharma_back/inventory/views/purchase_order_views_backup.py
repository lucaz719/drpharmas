from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Sum
from django.utils import timezone
from decimal import Decimal
from ..models import (
    Product, InventoryItem, BulkOrder, BulkOrderItem, 
    BulkOrderStatusLog, BulkOrderPayment, PurchaseTransaction, PaymentRecord
)
from ..serializers import (
    BulkOrderSerializer, BulkOrderCreateSerializer, BulkOrderSupplierUpdateSerializer,
    BulkOrderBuyerUpdateSerializer, BulkOrderShippingUpdateSerializer
)
from accounts.models import User


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def bulk_orders_list(request):
    """List bulk orders or create new bulk order."""
    try:
        if request.method == 'GET':
            user = request.user
            organization_id = getattr(user, 'organization_id', None)
            branch_id = getattr(user, 'branch_id', None)
            
            print(f"DEBUG: User {user.email}, org_id={organization_id}, branch_id={branch_id}")
            print(f"DEBUG: Total BulkOrders: {BulkOrder.objects.count()}")
            
            if not organization_id:
                return Response({'error': 'User not associated with organization'}, status=400)
            
            # Check if this is supplier view or buyer view based on URL
            is_supplier_view = 'supplier/orders' in request.path
            
            if is_supplier_view:
                # Supplier side - show orders TO this branch
                filters = {'supplier_organization_id': organization_id}
                if branch_id:
                    filters['supplier_user__branch_id'] = branch_id
                orders = BulkOrder.objects.filter(**filters)
            else:
                # Buyer side - show orders FROM this branch
                filters = {'buyer_organization_id': organization_id}
                if branch_id:
                    filters['buyer_branch_id'] = branch_id
                orders = BulkOrder.objects.filter(**filters)
            
            print(f"DEBUG: Filters: {filters}")
            print(f"DEBUG: Orders found: {orders.count()}")
            
            status_filter = request.GET.get('status')
            if status_filter:
                orders = orders.filter(status=status_filter)
            
            orders = orders.order_by('-created_at')
            
            orders_data = []
            for order in orders:
                order_data = BulkOrderSerializer(order).data
                
                available_actions = []
                if user.role in ['supplier_admin', 'pharmacy_owner'] and 'supplier_organization_id' in filters:
                    if order.status == BulkOrder.DELIVERED:
                        available_actions.append('release_stock')
                else:
                    if order.status == BulkOrder.COMPLETED:
                        available_actions.append('import_stock')
                
                order_data['available_actions'] = available_actions
                orders_data.append(order_data)
            
            print(f"DEBUG: Final result: {len(orders_data)}")
            return Response(orders_data)
        
        elif request.method == 'POST':
            serializer = BulkOrderCreateSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                bulk_order = serializer.save()
                return Response(BulkOrderSerializer(bulk_order).data, status=201)
            return Response(serializer.errors, status=400)
    
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def bulk_order_detail(request, order_id):
    """Get or update bulk order details."""
    try:
        user = request.user
        organization_id = getattr(user, 'organization_id', None)
        branch_id = getattr(user, 'branch_id', None)
        
        try:
            # For supplier side
            if user.role == 'pharmacy_owner':
                bulk_order = BulkOrder.objects.get(id=order_id, supplier_organization_id=organization_id)
            elif user.role == 'supplier_admin':
                # Allow supplier_admin to access orders assigned to them or their branch
                from django.db.models import Q
                if branch_id:
                    branch_filter = Q(supplier_user=user) | Q(supplier_user__branch_id=branch_id)
                    bulk_order = BulkOrder.objects.filter(id=order_id, supplier_organization_id=organization_id).filter(branch_filter).first()
                    if not bulk_order:
                        raise BulkOrder.DoesNotExist
                else:
                    bulk_order = BulkOrder.objects.get(id=order_id, supplier_organization_id=organization_id, supplier_user=user)
            else:
                # For buyer side
                if user.role == 'pharmacy_owner':
                    bulk_order = BulkOrder.objects.get(id=order_id, buyer_organization_id=organization_id)
                else:
                    filters = {'id': order_id, 'buyer_organization_id': organization_id}
                    if branch_id:
                        filters['buyer_branch_id'] = branch_id
                    bulk_order = BulkOrder.objects.get(**filters)
        except BulkOrder.DoesNotExist:
            return Response({'error': 'Order not found'}, status=404)
        
        if request.method == 'GET':
            serializer = BulkOrderSerializer(bulk_order)
            data = serializer.data
            for item in data.get('items', []):
                if 'product' in item and item['product']:
                    product = item['product']
                    item['product_id'] = product.get('id')
                    item['product_name'] = product.get('name', '')
                    item['product_strength'] = product.get('strength', '')
                    item['product_dosage_form'] = product.get('dosage_form', '')
                    item['product_generic_name'] = product.get('generic_name', '')
                    item['product_brand_name'] = product.get('brand_name', '')
                else:
                    item['product_name'] = 'Product not found'
                    item['product_strength'] = ''
                    item['product_dosage_form'] = ''
            return Response(data)
        
        elif request.method == 'PUT':
            if user.role == 'supplier_admin' and bulk_order.status in [BulkOrder.SUBMITTED, BulkOrder.SUPPLIER_REVIEWING]:
                serializer = BulkOrderSupplierUpdateSerializer(
                    bulk_order, data=request.data, context={'request': request}
                )
            elif user.role != 'supplier_admin' and bulk_order.status == BulkOrder.SUPPLIER_CONFIRMED:
                serializer = BulkOrderBuyerUpdateSerializer(
                    bulk_order, data=request.data, context={'request': request}
                )
            elif user.role == 'supplier_admin' and bulk_order.status == BulkOrder.BUYER_CONFIRMED:
                serializer = BulkOrderShippingUpdateSerializer(
                    bulk_order, data=request.data, context={'request': request}
                )
            else:
                return Response({'error': 'Invalid operation for current status'}, status=400)
            
            if serializer.is_valid():
                updated_order = serializer.save()
                return Response(BulkOrderSerializer(updated_order).data)
            return Response(serializer.errors, status=400)
    
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_order_status_update(request, order_id):
    """Update bulk order status with specific actions."""
    try:
        user = request.user
        organization_id = getattr(user, 'organization_id', None)
        branch_id = getattr(user, 'branch_id', None)
        action = request.data.get('action')
        notes = request.data.get('notes', '')
        
        try:
            # For supplier side
            if user.role == 'pharmacy_owner':
                bulk_order = BulkOrder.objects.get(id=order_id, supplier_organization_id=organization_id)
            elif user.role == 'supplier_admin':
                # Allow supplier_admin to access orders assigned to them or their branch
                from django.db.models import Q
                if branch_id:
                    branch_filter = Q(supplier_user=user) | Q(supplier_user__branch_id=branch_id)
                    bulk_order = BulkOrder.objects.filter(id=order_id, supplier_organization_id=organization_id).filter(branch_filter).first()
                    if not bulk_order:
                        raise BulkOrder.DoesNotExist
                else:
                    bulk_order = BulkOrder.objects.get(id=order_id, supplier_organization_id=organization_id, supplier_user=user)
            else:
                # For buyer side
                if user.role == 'pharmacy_owner':
                    bulk_order = BulkOrder.objects.get(id=order_id, buyer_organization_id=organization_id)
                else:
                    filters = {'id': order_id, 'buyer_organization_id': organization_id}
                    if branch_id:
                        filters['buyer_branch_id'] = branch_id
                    bulk_order = BulkOrder.objects.get(**filters)
        except BulkOrder.DoesNotExist:
            return Response({'error': 'Order not found'}, status=404)
        
        old_status = bulk_order.status
        
        if action == 'reject' and user.role == 'supplier_admin':
            bulk_order.status = BulkOrder.SUPPLIER_REJECTED
        elif action == 'cancel' and user.role != 'supplier_admin':
            bulk_order.status = BulkOrder.BUYER_CANCELLED
        elif action == 'buyer_confirm' and user.role != 'supplier_admin':
            bulk_order.status = BulkOrder.BUYER_CONFIRMED
        elif action == 'payment_pending' and user.role != 'supplier_admin':
            bulk_order.status = BulkOrder.PAYMENT_PENDING
            bulk_order.payment_status = 'pending'
        elif action == 'mark_delivered':
            if user.role == 'supplier_admin':
                bulk_order.status = BulkOrder.DELIVERED
                bulk_order.delivered_date = timezone.now()
            elif user.role != 'supplier_admin':
                bulk_order.status = BulkOrder.DELIVERED
                bulk_order.delivered_date = timezone.now()
        elif action == 'complete' and user.role != 'supplier_admin':
            bulk_order.status = BulkOrder.COMPLETED
        elif action == 'release_stock' and user.role == 'supplier_admin':
            bulk_order.status = BulkOrder.RELEASED
            bulk_order.released_date = timezone.now()
            bulk_order.released_by = user
        elif action == 'import_stock' and user.role != 'supplier_admin':
            bulk_order.status = BulkOrder.IMPORTED
            bulk_order.imported_date = timezone.now()
            bulk_order.imported_by = user
        else:
            return Response({'error': 'Invalid action'}, status=400)
        
        bulk_order.save()
        
        BulkOrderStatusLog.objects.create(
            bulk_order=bulk_order,
            from_status=old_status,
            to_status=bulk_order.status,
            notes=notes,
            changed_by=user
        )
        
        return Response(BulkOrderSerializer(bulk_order).data)
    
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_order_payment(request, order_id):
    """Record payment for bulk order."""
    try:
        user = request.user
        organization_id = getattr(user, 'organization_id', None)
        branch_id = getattr(user, 'branch_id', None)
        
        try:
            filters = {'id': order_id, 'buyer_organization_id': organization_id}
            if branch_id:
                filters['buyer_branch_id'] = branch_id
            bulk_order = BulkOrder.objects.get(**filters)
        except BulkOrder.DoesNotExist:
            return Response({'error': 'Order not found'}, status=404)
        
        payment_data = request.data.copy()
        payment_data['bulk_order'] = bulk_order.id
        
        from ..serializers import BulkOrderPaymentSerializer
        serializer = BulkOrderPaymentSerializer(data=payment_data)
        if serializer.is_valid():
            payment = serializer.save(created_by=user)
            
            if payment.payment_type == BulkOrderPayment.ADVANCE:
                bulk_order.advance_paid = True
                bulk_order.advance_payment_date = payment.payment_date
                bulk_order.save()
            
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def bulk_order_stats(request):
    """Get bulk order statistics for dashboard."""
    try:
        user = request.user
        organization_id = getattr(user, 'organization_id', None)
        branch_id = getattr(user, 'branch_id', None)
        
        if user.role in ['supplier_admin', 'pharmacy_owner']:
            filters = {'supplier_organization_id': organization_id}
            if user.role == 'supplier_admin':
                filters['supplier_user'] = user
            orders = BulkOrder.objects.filter(**filters)
            stats = {
                'total_orders': orders.count(),
                'pending_orders': orders.filter(status__in=[BulkOrder.SUBMITTED, BulkOrder.SUPPLIER_REVIEWING]).count(),
                'confirmed_orders': orders.filter(status=BulkOrder.SUPPLIER_CONFIRMED).count(),
                'shipped_orders': orders.filter(status=BulkOrder.SHIPPED).count(),
                'completed_orders': orders.filter(status=BulkOrder.COMPLETED).count(),
                'total_revenue': float(sum(order.total_amount for order in orders.filter(status=BulkOrder.COMPLETED))),
            }
        else:
            filters = {'buyer_organization_id': organization_id}
            if branch_id:
                filters['buyer_branch_id'] = branch_id
            orders = BulkOrder.objects.filter(**filters)
            stats = {
                'total_orders': orders.count(),
                'pending_orders': orders.filter(status__in=[BulkOrder.SUBMITTED, BulkOrder.SUPPLIER_REVIEWING]).count(),
                'awaiting_review': orders.filter(status=BulkOrder.SUPPLIER_CONFIRMED).count(),
                'confirmed_orders': orders.filter(status=BulkOrder.BUYER_CONFIRMED).count(),
                'shipped_orders': orders.filter(status=BulkOrder.SHIPPED).count(),
                'delivered_orders': orders.filter(status=BulkOrder.DELIVERED).count(),
                'total_spent': float(sum(order.total_amount for order in orders.filter(status=BulkOrder.COMPLETED))),
            }
        
        return Response(stats)
    
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_supplier_order(request, order_id):
    """Update supplier order - confirm quantities, set prices, update status."""
    try:
        user = request.user
        organization_id = getattr(user, 'organization_id', None)
        
        try:
            if user.role == 'supplier_admin':
                order = BulkOrder.objects.get(id=order_id, supplier_user=user)
            else:
                order = BulkOrder.objects.get(id=order_id, supplier_organization_id=organization_id)
        except BulkOrder.DoesNotExist:
            return Response({'error': 'Order not found'}, status=404)
        
        if order.status not in [BulkOrder.SUBMITTED, BulkOrder.SUPPLIER_REVIEWING]:
            return Response({'error': 'Order cannot be updated in current status'}, status=400)
        
        data = request.data
        action = data.get('action')
        items_data = data.get('items', [])
        supplier_notes = data.get('supplier_notes', '')
        
        if action == 'confirm':
            total_amount = 0
            
            for item_data in items_data:
                try:
                    order_item = order.items.get(id=item_data['id'])
                    order_item.quantity_confirmed = item_data.get('quantity_confirmed', 0)
                    order_item.unit_price = float(item_data.get('unit_price', 0))
                    order_item.is_available = item_data.get('is_available', True)
                    order_item.supplier_notes = item_data.get('supplier_notes', '')
                    order_item.save()
                    
                    total_amount += order_item.total_price
                except BulkOrderItem.DoesNotExist:
                    continue
            
            order.subtotal = total_amount
            order.total_amount = total_amount
            order.supplier_notes = supplier_notes
            order.status = BulkOrder.SUPPLIER_CONFIRMED
            order.save()
            
            BulkOrderStatusLog.objects.create(
                bulk_order=order,
                from_status=BulkOrder.SUBMITTED,
                to_status=BulkOrder.SUPPLIER_CONFIRMED,
                notes=f"Order confirmed by supplier: {supplier_notes}",
                changed_by=user
            )
            
            message = 'Order confirmed successfully'
            
        elif action == 'reject':
            order.status = BulkOrder.SUPPLIER_REJECTED
            order.supplier_notes = supplier_notes
            order.save()
            
            BulkOrderStatusLog.objects.create(
                bulk_order=order,
                from_status=order.status,
                to_status=BulkOrder.SUPPLIER_REJECTED,
                notes=f"Order rejected by supplier: {supplier_notes}",
                changed_by=user
            )
            
            message = 'Order rejected successfully'
        else:
            return Response({'error': 'Invalid action'}, status=400)
        
        updated_order = BulkOrder.objects.get(id=order_id)
        serializer = BulkOrderSerializer(updated_order)
        
        return Response({
            'message': message,
            'order': serializer.data
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def products_for_purchase_order(request):
    """Get products that are in stock from supplier's organization."""
    try:
        query = request.GET.get('q', '').strip()
        supplier_id = request.GET.get('supplier_id')
        
        if not query or not supplier_id:
            return Response([])
        
        try:
            supplier_user = User.objects.get(id=supplier_id, role='supplier_admin')
            supplier_org_id = supplier_user.organization_id
        except User.DoesNotExist:
            return Response({'error': 'Supplier not found'}, status=400)
        
        product_ids = InventoryItem.objects.filter(
            organization_id=supplier_org_id,
            quantity__gt=0
        ).values_list('product_id', flat=True).distinct()
        
        products = Product.objects.filter(
            id__in=product_ids,
            is_active=True
        ).filter(
            Q(name__icontains=query) |
            Q(generic_name__icontains=query) |
            Q(brand_name__icontains=query)
        )[:20]
        
        results = []
        for product in products:
            current_stock = InventoryItem.objects.filter(
                product=product,
                organization_id=supplier_org_id,
                quantity__gt=0
            ).aggregate(total=Sum('quantity'))['total'] or 0
            
            results.append({
                'id': product.id,
                'name': product.name,
                'generic_name': product.generic_name,
                'brand_name': product.brand_name,
                'strength': product.strength,
                'dosage_form': product.dosage_form,
                'unit': product.unit,
                'current_stock': current_stock,
                'cost_price': float(product.cost_price) if product.cost_price else 0,
                'selling_price': float(product.selling_price) if product.selling_price else 0
            })
        
        return Response(results)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def purchase_orders_manage(request):
    """Get purchase orders for management - enhanced view with all workflow statuses."""
    try:
        user = request.user
        organization_id = getattr(user, 'organization_id', None)
        branch_id = getattr(user, 'branch_id', None)
        
        if not organization_id:
            return Response({'error': 'User not associated with organization'}, status=400)
        
        if user.role in ['supplier_admin', 'pharmacy_owner']:
            filters = {'supplier_organization_id': organization_id}
            if user.role == 'supplier_admin':
                filters['supplier_user'] = user
            orders = BulkOrder.objects.filter(**filters)
        else:
            filters = {'buyer_organization_id': organization_id}
            if branch_id:
                filters['buyer_branch_id'] = branch_id
            orders = BulkOrder.objects.filter(**filters)
        
        status_filter = request.GET.get('status')
        if status_filter:
            orders = orders.filter(status=status_filter)
        
        orders = orders.select_related(
            'buyer_organization', 'buyer_branch', 'supplier_organization', 'supplier_user'
        ).prefetch_related(
            'items__product', 'payments', 'status_logs'
        ).order_by('-created_at')
        
        results = []
        for order in orders:
            available_actions = []
            if user.role == 'supplier_admin':
                if order.status == BulkOrder.DELIVERED:
                    available_actions.append('release_stock')
            else:
                if order.status == BulkOrder.COMPLETED:
                    available_actions.append('import_stock')
            
            display_status = order.status
            if user.role == 'supplier_admin' and order.status == BulkOrder.COMPLETED:
                display_status = 'released'
            
            results.append({
                'id': order.id,
                'order_number': order.order_number,
                'buyer_organization_name': order.buyer_organization.name,
                'buyer_branch_name': order.buyer_branch.name,
                'supplier_organization_name': order.supplier_organization.name,
                'supplier_user_name': order.supplier_user.get_full_name(),
                'order_date': order.order_date.strftime('%Y-%m-%d %H:%M:%S'),
                'expected_delivery_date': order.expected_delivery_date.strftime('%Y-%m-%d'),
                'status': display_status,
                'total_amount': float(order.total_amount),
                'total_paid_amount': float(order.total_paid_amount),
                'remaining_amount': float(order.remaining_amount),
                'payment_status': order.payment_status,
                'can_modify_items': order.can_modify_items,
                'supplier_locked': order.supplier_locked,
                'shipped_date': order.shipped_date.strftime('%Y-%m-%d %H:%M:%S') if order.shipped_date else None,
                'delivered_date': order.delivered_date.strftime('%Y-%m-%d %H:%M:%S') if order.delivered_date else None,
                'buyer_notes': order.buyer_notes,
                'supplier_notes': order.supplier_notes,
                'buyer_reconfirm_notes': order.buyer_reconfirm_notes,
                'delivery_notes': order.delivery_notes,
                'total_items': order.total_items,
                'payment_count': order.payments.count(),
                'available_actions': available_actions,
                'items': [{
                    'id': item.id,
                    'product_id': item.product.id,
                    'product_name': item.product.name,
                    'product_strength': item.product.strength,
                    'product_dosage_form': item.product.dosage_form,
                    'quantity_requested': item.quantity_requested,
                    'quantity_confirmed': item.quantity_confirmed,
                    'quantity_final': item.quantity_final,
                    'unit_price': float(item.unit_price) if item.unit_price else 0,
                    'total_price': float(item.total_price) if hasattr(item, 'total_price') and item.total_price else (float(item.unit_price) * item.quantity_confirmed if item.unit_price and item.quantity_confirmed else 0),
                    'is_cancelled': item.is_cancelled,
                    'is_available': item.is_available,
                    'supplier_notes': item.supplier_notes or '',
                    'buyer_reconfirm_notes': item.buyer_reconfirm_notes or ''
                } for item in order.items.select_related('product').all()],
                'recent_payments': [{
                    'id': payment.id,
                    'amount': float(payment.amount),
                    'payment_method': payment.payment_method,
                    'payment_date': payment.payment_date.strftime('%Y-%m-%d %H:%M:%S'),
                    'installment_number': payment.installment_number,
                    'is_final_payment': payment.is_final_payment
                } for payment in order.payments.all()[:3]]
            })
        
        return Response(results)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def purchase_order_release_stock(request, order_id):
    """Supplier releases stock after delivery - reduces supplier inventory and creates buyer inventory."""
    try:
        user = request.user
        organization_id = getattr(user, 'organization_id', None)
        
        if user.role != 'supplier_admin':
            return Response({'error': 'Only suppliers can release stock'}, status=403)
        
        try:
            bulk_order = BulkOrder.objects.get(
                id=order_id, 
                supplier_organization_id=organization_id,
                status=BulkOrder.DELIVERED
            )
        except BulkOrder.DoesNotExist:
            return Response({'error': 'Order not found or not delivered'}, status=404)
        
        insufficient_stock = []
        
        for order_item in bulk_order.items.filter(is_cancelled=False):
            required_qty = order_item.quantity_final or order_item.quantity_confirmed
            if required_qty <= 0:
                continue
                
            available_stock = InventoryItem.objects.filter(
                product=order_item.product,
                organization_id=organization_id,
                quantity__gt=0
            ).aggregate(total=Sum('quantity'))['total'] or 0
            
            if available_stock < required_qty:
                insufficient_stock.append({
                    'product_name': order_item.product.name,
                    'required': required_qty,
                    'available': available_stock
                })
        
        if insufficient_stock:
            return Response({
                'error': 'Insufficient stock for some items',
                'insufficient_items': insufficient_stock
            }, status=400)
        
        # Deduct stock from supplier inventory (FIFO)
        for order_item in bulk_order.items.filter(is_cancelled=False):
            required_qty = order_item.quantity_final or order_item.quantity_confirmed
            if required_qty <= 0:
                continue
                
            inventory_items = InventoryItem.objects.filter(
                product=order_item.product,
                organization_id=organization_id,
                quantity__gt=0
            ).order_by('created_at')
            
            remaining_to_deduct = required_qty
            
            for inv_item in inventory_items:
                if remaining_to_deduct <= 0:
                    break
                    
                deduct_qty = min(inv_item.quantity, remaining_to_deduct)
                inv_item.quantity -= deduct_qty
                inv_item.save()
                
                remaining_to_deduct -= deduct_qty
        
        # Create inventory items for buyer
        buyer_branch_id = bulk_order.buyer_branch.id
        
        for order_item in bulk_order.items.filter(is_cancelled=False):
            required_qty = order_item.quantity_final or order_item.quantity_confirmed
            if required_qty <= 0:
                continue
                
            selling_price = Decimal(str(order_item.unit_price)) * Decimal('1.2')
                
            InventoryItem.objects.create(
                product=order_item.product,
                supplier_type='user',
                supplier_user=bulk_order.supplier_user,
                quantity=required_qty,
                unit=order_item.product.unit,
                cost_price=order_item.unit_price,
                selling_price=selling_price,
                batch_number=f"BO-{bulk_order.order_number}-{order_item.id}",
                manufacturing_date=timezone.now().date(),
                expiry_date=timezone.now().date().replace(year=timezone.now().year + 2),
                organization_id=bulk_order.buyer_organization_id,
                branch_id=buyer_branch_id,
                created_by=user
            )
        
        # Update order status
        bulk_order.status = BulkOrder.COMPLETED
        bulk_order.save()
        
        BulkOrderStatusLog.objects.create(
            bulk_order=bulk_order,
            from_status=BulkOrder.DELIVERED,
            to_status=BulkOrder.COMPLETED,
            notes="Stock released and transferred to buyer inventory",
            changed_by=user
        )
        
        return Response({
            'message': 'Stock released successfully',
            'order': BulkOrderSerializer(bulk_order).data
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def purchase_order_import_stock(request, order_id):
    """Buyer imports delivered stock to their inventory with custom selling prices."""
    try:
        user = request.user
        organization_id = getattr(user, 'organization_id', None)
        branch_id = getattr(user, 'branch_id', None)
        
        if user.role == 'supplier_admin':
            return Response({'error': 'Only buyers can import stock'}, status=403)
        
        try:
            filters = {
                'id': order_id, 
                'buyer_organization_id': organization_id,
                'status': BulkOrder.COMPLETED
            }
            if branch_id:
                filters['buyer_branch_id'] = branch_id
            bulk_order = BulkOrder.objects.get(**filters)
        except BulkOrder.DoesNotExist:
            return Response({'error': 'Order not found or not completed'}, status=404)
        
        data = request.data
        items_data = data.get('items', [])
        
        if not branch_id:
            branch_id = 1
        
        created_items = []
        total_amount = 0
        
        for item_data in items_data:
            try:
                order_item = bulk_order.items.get(id=item_data['order_item_id'])
                if order_item.is_cancelled:
                    continue
                    
                quantity = order_item.quantity_final or order_item.quantity_confirmed
                if quantity <= 0:
                    continue
                
                selling_price = float(item_data.get('selling_price', order_item.unit_price * Decimal('1.2')))
                
                inventory_item = InventoryItem.objects.create(
                    product=order_item.product,
                    supplier_type='user',
                    supplier_user=bulk_order.supplier_user,
                    quantity=quantity,
                    unit=order_item.product.unit,
                    cost_price=order_item.unit_price,
                    selling_price=selling_price,
                    batch_number=f"BO-{bulk_order.order_number}-{order_item.id}",
                    manufacturing_date=timezone.now().date(),
                    expiry_date=timezone.now().date().replace(year=timezone.now().year + 2),
                    organization_id=organization_id,
                    branch_id=branch_id,
                    created_by=user
                )
                
                created_items.append({
                    'product_name': order_item.product.name,
                    'quantity': quantity,
                    'cost_price': float(order_item.unit_price),
                    'selling_price': selling_price,
                    'batch_number': inventory_item.batch_number
                })
                
                total_amount += float(order_item.unit_price) * quantity
                
            except BulkOrderItem.DoesNotExist:
                continue
        
        # Transaction history is already handled by BulkOrderPayment records
        # No need to create duplicate PurchaseTransaction/PaymentRecord
        
        # Update order status
        bulk_order.status = BulkOrder.IMPORTED
        bulk_order.imported_date = timezone.now()
        bulk_order.imported_by = user
        bulk_order.save()
        
        BulkOrderStatusLog.objects.create(
            bulk_order=bulk_order,
            from_status=BulkOrder.COMPLETED,
            to_status=BulkOrder.IMPORTED,
            notes="Stock imported to buyer inventory",
            changed_by=user
        )
        
        return Response({
            'message': f'Successfully imported {len(created_items)} items to inventory',
            'total_amount': total_amount,
            'created_items': created_items
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def purchase_order_import_preview(request, order_id):
    """Get preview of items to import with cost prices for buyer to set selling prices."""
    try:
        user = request.user
        organization_id = getattr(user, 'organization_id', None)
        branch_id = getattr(user, 'branch_id', None)
        
        try:
            filters = {
                'id': order_id, 
                'buyer_organization_id': organization_id,
                'status': BulkOrder.COMPLETED
            }
            if branch_id:
                filters['buyer_branch_id'] = branch_id
            bulk_order = BulkOrder.objects.get(**filters)
        except BulkOrder.DoesNotExist:
            return Response({'error': 'Order not found or not completed'}, status=404)
        
        items = []
        for order_item in bulk_order.items.filter(is_cancelled=False):
            quantity = order_item.quantity_final or order_item.quantity_confirmed
            if quantity <= 0:
                continue
                
            items.append({
                'order_item_id': order_item.id,
                'product_name': order_item.product.name,
                'product_strength': order_item.product.strength,
                'product_dosage_form': order_item.product.dosage_form,
                'quantity': quantity,
                'unit': order_item.product.unit,
                'cost_price': float(order_item.unit_price),
                'suggested_selling_price': float(order_item.unit_price * Decimal('1.2')),
                'total_cost': float(order_item.unit_price * Decimal(str(quantity)))
            })
        
        return Response({
            'order_number': bulk_order.order_number,
            'supplier_name': bulk_order.supplier_organization.name,
            'items': items,
            'total_order_cost': sum(item['total_cost'] for item in items)
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def purchase_order_ship(request, order_id):
    """Supplier updates order to shipped status."""
    try:
        user = request.user
        organization_id = getattr(user, 'organization_id', None)
        
        if user.role != 'supplier_admin':
            return Response({'error': 'Only suppliers can ship orders'}, status=403)
        
        try:
            bulk_order = BulkOrder.objects.get(
                id=order_id, 
                supplier_organization_id=organization_id,
                status__in=[BulkOrder.READY_TO_SHIP, BulkOrder.PAYMENT_COMPLETED]
            )
        except BulkOrder.DoesNotExist:
            return Response({'error': 'Order not found or not ready to ship'}, status=404)
        
        data = request.data
        
        bulk_order.shipping_method = data.get('shipping_method', '')
        bulk_order.tracking_number = data.get('tracking_number', '')
        bulk_order.shipping_notes = data.get('shipping_notes', '')
        bulk_order.status = BulkOrder.SHIPPED
        bulk_order.shipped_date = timezone.now()
        bulk_order.supplier_locked = True
        bulk_order.save()
        
        BulkOrderStatusLog.objects.create(
            bulk_order=bulk_order,
            from_status=BulkOrder.READY_TO_SHIP,
            to_status=BulkOrder.SHIPPED,
            notes=f"Order shipped via {bulk_order.shipping_method}. Tracking: {bulk_order.tracking_number}",
            changed_by=user
        )
        
        return Response({
            'message': 'Order shipped successfully',
            'order': BulkOrderSerializer(bulk_order).data
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)