from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from decimal import Decimal
from ..models import BulkOrder, BulkOrderItem, BulkOrderStatusLog, BulkOrderPayment
from ..serializers import BulkOrderSerializer
from accounts.models import User


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def purchase_order_reconfirm(request, order_id):
    """Buyer reconfirms order after supplier confirmation - can modify quantities/cancel items."""
    try:
        user = request.user
        organization_id = getattr(user, 'organization_id', None)
        
        try:
            filters = {
                'id': order_id, 
                'buyer_organization_id': organization_id,
                'status': BulkOrder.SUPPLIER_CONFIRMED
            }
            branch_id = getattr(user, 'branch_id', None)
            if branch_id:
                filters['buyer_branch_id'] = branch_id
            bulk_order = BulkOrder.objects.get(**filters)
        except BulkOrder.DoesNotExist:
            return Response({'error': 'Order not found or not in correct status'}, status=404)
        
        data = request.data
        items_data = data.get('items', [])
        buyer_reconfirm_notes = data.get('buyer_reconfirm_notes', '')
        action = data.get('action', 'reconfirm')
        
        if action == 'cancel':
            bulk_order.status = BulkOrder.BUYER_CANCELLED
            bulk_order.buyer_reconfirm_notes = buyer_reconfirm_notes
            bulk_order.save()
            
            BulkOrderStatusLog.objects.create(
                bulk_order=bulk_order,
                from_status=BulkOrder.SUPPLIER_CONFIRMED,
                to_status=BulkOrder.BUYER_CANCELLED,
                notes=f"Order cancelled by buyer: {buyer_reconfirm_notes}",
                changed_by=user
            )
            
            return Response({'message': 'Order cancelled successfully'})
        
        # Update items with buyer's final quantities
        total_amount = 0
        for item_data in items_data:
            try:
                order_item = bulk_order.items.get(id=item_data['id'])
                
                final_qty = item_data.get('quantity_final', order_item.quantity_confirmed)
                if final_qty > order_item.quantity_confirmed:
                    final_qty = order_item.quantity_confirmed
                
                order_item.quantity_final = final_qty
                order_item.is_cancelled = item_data.get('is_cancelled', False)
                order_item.buyer_reconfirm_notes = item_data.get('buyer_reconfirm_notes', '')
                order_item.save()
                
                if not order_item.is_cancelled and order_item.unit_price:
                    total_amount += order_item.unit_price * order_item.quantity_final
                    
            except BulkOrderItem.DoesNotExist:
                continue
        
        bulk_order.total_amount = total_amount
        bulk_order.buyer_reconfirm_notes = buyer_reconfirm_notes
        bulk_order.status = BulkOrder.BUYER_RECONFIRMING
        bulk_order.can_modify_items = False
        bulk_order.save()
        
        BulkOrderStatusLog.objects.create(
            bulk_order=bulk_order,
            from_status=BulkOrder.SUPPLIER_CONFIRMED,
            to_status=BulkOrder.BUYER_RECONFIRMING,
            notes=f"Order reconfirmed by buyer with modifications: {buyer_reconfirm_notes}",
            changed_by=user
        )
        
        return Response({
            'message': 'Order reconfirmed successfully',
            'order': BulkOrderSerializer(bulk_order).data
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def purchase_order_proceed(request, order_id):
    """Buyer proceeds with order after reconfirmation - handles payment and final confirmation."""
    try:
        user = request.user
        organization_id = getattr(user, 'organization_id', None)
        
        try:
            filters = {
                'id': order_id, 
                'buyer_organization_id': organization_id,
                'status': BulkOrder.BUYER_RECONFIRMING
            }
            branch_id = getattr(user, 'branch_id', None)
            if branch_id:
                filters['buyer_branch_id'] = branch_id
            bulk_order = BulkOrder.objects.get(**filters)
        except BulkOrder.DoesNotExist:
            return Response({'error': 'Order not found or not in correct status'}, status=404)
        
        data = request.data
        payment_data = data.get('payment', {})
        final_notes = data.get('final_notes', '')
        
        if payment_data.get('amount', 0) > 0:
            payment = BulkOrderPayment.objects.create(
                bulk_order=bulk_order,
                payment_type=payment_data.get('payment_type', BulkOrderPayment.INSTALLMENT),
                payment_method=payment_data.get('payment_method', BulkOrderPayment.CASH),
                amount=float(payment_data['amount']),
                payment_date=timezone.now(),
                reference_number=payment_data.get('reference_number', ''),
                notes=payment_data.get('notes', ''),
                cash_amount=float(payment_data.get('cash_amount', 0)),
                online_amount=float(payment_data.get('online_amount', 0)),
                credit_amount=float(payment_data.get('credit_amount', 0)),
                created_by=user
            )
            
            bulk_order.total_paid_amount += payment.amount
            bulk_order.remaining_amount = bulk_order.total_amount - bulk_order.total_paid_amount
            
            if bulk_order.remaining_amount <= 0:
                bulk_order.payment_status = 'completed'
                bulk_order.status = BulkOrder.PAYMENT_COMPLETED
            else:
                bulk_order.payment_status = 'partial'
                bulk_order.status = BulkOrder.PAYMENT_PARTIAL
        else:
            bulk_order.status = BulkOrder.PAYMENT_PENDING
            bulk_order.payment_status = 'pending'
        
        bulk_order.buyer_delivery_notes = final_notes
        bulk_order.save()
        
        BulkOrderStatusLog.objects.create(
            bulk_order=bulk_order,
            from_status=BulkOrder.BUYER_RECONFIRMING,
            to_status=bulk_order.status,
            notes=f"Order proceeded by buyer. Payment: {payment_data.get('amount', 0)}",
            changed_by=user
        )
        
        return Response({
            'message': 'Order proceeded successfully',
            'order': BulkOrderSerializer(bulk_order).data
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def purchase_order_payment(request, order_id):
    """Record installment payment for purchase order."""
    try:
        user = request.user
        organization_id = getattr(user, 'organization_id', None)
        
        try:
            filters = {'id': order_id, 'buyer_organization_id': organization_id}
            branch_id = getattr(user, 'branch_id', None)
            if branch_id:
                filters['buyer_branch_id'] = branch_id
            bulk_order = BulkOrder.objects.get(**filters)
        except BulkOrder.DoesNotExist:
            return Response({'error': 'Order not found'}, status=404)
        
        data = request.data
        payment_amount = float(data.get('amount', 0))
        
        if payment_amount <= 0:
            return Response({'error': 'Invalid payment amount'}, status=400)
        
        current_payments = bulk_order.payments.count()
        
        payment = BulkOrderPayment.objects.create(
            bulk_order=bulk_order,
            payment_type=data.get('payment_type', BulkOrderPayment.INSTALLMENT),
            payment_method=data.get('payment_method', BulkOrderPayment.CASH),
            amount=payment_amount,
            payment_date=timezone.now(),
            reference_number=data.get('reference_number', ''),
            notes=data.get('notes', ''),
            installment_number=current_payments + 1,
            cash_amount=float(data.get('cash_amount', 0)),
            online_amount=float(data.get('online_amount', 0)),
            credit_amount=float(data.get('credit_amount', 0)),
            created_by=user
        )
        
        bulk_order.total_paid_amount += payment_amount
        bulk_order.remaining_amount = bulk_order.total_amount - bulk_order.total_paid_amount
        
        if bulk_order.remaining_amount <= 0:
            bulk_order.payment_status = 'completed'
            payment.is_final_payment = True
            payment.save()
            
            if bulk_order.status in [BulkOrder.PAYMENT_PENDING, BulkOrder.PAYMENT_PARTIAL]:
                bulk_order.status = BulkOrder.READY_TO_SHIP
        else:
            bulk_order.payment_status = 'partial'
            if bulk_order.status == BulkOrder.PAYMENT_PENDING:
                bulk_order.status = BulkOrder.PAYMENT_PARTIAL
        
        bulk_order.save()
        
        BulkOrderStatusLog.objects.create(
            bulk_order=bulk_order,
            from_status=bulk_order.status,
            to_status=bulk_order.status,
            notes=f"Payment received: {payment_amount}. Remaining: {bulk_order.remaining_amount}",
            changed_by=user
        )
        
        return Response({
            'message': 'Payment recorded successfully',
            'payment_id': payment.id,
            'remaining_amount': float(bulk_order.remaining_amount),
            'payment_status': bulk_order.payment_status
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def purchase_order_ship(request, order_id):
    """Updates order to shipped status."""
    try:
        user = request.user
        organization_id = getattr(user, 'organization_id', None)
        branch_id = getattr(user, 'branch_id', None)
        
        try:
            # Check both supplier and buyer side for this branch
            from django.db.models import Q
            filters = Q(id=order_id) & (
                Q(supplier_organization_id=organization_id, supplier_user__branch_id=branch_id) |
                Q(buyer_organization_id=organization_id, buyer_branch_id=branch_id)
            )
            bulk_order = BulkOrder.objects.filter(filters).filter(
                status__in=[BulkOrder.BUYER_CONFIRMED, BulkOrder.BUYER_RECONFIRMING, BulkOrder.PAYMENT_PENDING, BulkOrder.PAYMENT_PARTIAL, BulkOrder.PAYMENT_COMPLETED, BulkOrder.READY_TO_SHIP]
            ).first()
            if not bulk_order:
                raise BulkOrder.DoesNotExist
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
            from_status=bulk_order.status,
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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def purchase_order_deliver(request, order_id):
    """Mark order as delivered and handle final payment settlement."""
    try:
        user = request.user
        organization_id = getattr(user, 'organization_id', None)
        
        try:
            branch_id = getattr(user, 'branch_id', None)
            if user.role == 'supplier_admin':
                filters = {
                    'id': order_id, 
                    'supplier_organization_id': organization_id,
                    'status': BulkOrder.SHIPPED
                }
                if user.role == 'supplier_admin':
                    filters['supplier_user'] = user
                bulk_order = BulkOrder.objects.get(**filters)
                is_supplier = True
            else:
                filters = {
                    'id': order_id, 
                    'buyer_organization_id': organization_id,
                    'status': BulkOrder.SHIPPED
                }
                if branch_id:
                    filters['buyer_branch_id'] = branch_id
                bulk_order = BulkOrder.objects.get(**filters)
                is_supplier = False
        except BulkOrder.DoesNotExist:
            return Response({'error': 'Order not found or not shipped'}, status=404)
        
        data = request.data
        action = data.get('action', 'delivered')
        
        if action == 'delivered' and is_supplier:
            bulk_order.status = BulkOrder.DELIVERED
            bulk_order.delivered_date = timezone.now()
            bulk_order.delivery_notes = data.get('delivery_notes', '')
            
            status_note = f"Order marked as delivered by supplier: {data.get('delivery_notes', '')}"
            
        elif action == 'received' and not is_supplier:
            bulk_order.status = BulkOrder.DELIVERED
            bulk_order.delivered_date = timezone.now()
            bulk_order.delivery_notes = data.get('delivery_notes', '')
            
            status_note = f"Order receipt confirmed by buyer: {data.get('delivery_notes', '')}"
            
        else:
            return Response({'error': 'Invalid action for user role'}, status=400)
        
        final_payment_data = data.get('final_payment')
        if final_payment_data and final_payment_data.get('amount', 0) > 0:
            payment = BulkOrderPayment.objects.create(
                bulk_order=bulk_order,
                payment_type=BulkOrderPayment.FINAL,
                payment_method=final_payment_data.get('payment_method', BulkOrderPayment.CASH),
                amount=float(final_payment_data['amount']),
                payment_date=timezone.now(),
                reference_number=final_payment_data.get('reference_number', ''),
                notes=final_payment_data.get('notes', ''),
                is_final_payment=True,
                cash_amount=float(final_payment_data.get('cash_amount', 0)),
                online_amount=float(final_payment_data.get('online_amount', 0)),
                credit_amount=float(final_payment_data.get('credit_amount', 0)),
                created_by=user
            )
            
            bulk_order.total_paid_amount += payment.amount
            bulk_order.remaining_amount = bulk_order.total_amount - bulk_order.total_paid_amount
            
            if bulk_order.remaining_amount <= 0:
                bulk_order.payment_status = 'completed'
                bulk_order.status = BulkOrder.COMPLETED
            
            status_note += f" Final payment: {payment.amount}"
        
        bulk_order.save()
        
        BulkOrderStatusLog.objects.create(
            bulk_order=bulk_order,
            from_status=BulkOrder.SHIPPED,
            to_status=bulk_order.status,
            notes=status_note,
            changed_by=user
        )
        
        return Response({
            'message': 'Order delivery status updated successfully',
            'order': BulkOrderSerializer(bulk_order).data
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def purchase_order_buyer_adjust(request, order_id):
    """Buyer adjusts confirmed order - modify quantities, delete items, add payment."""
    try:
        user = request.user
        organization_id = getattr(user, 'organization_id', None)
        
        try:
            filters = {
                'id': order_id, 
                'buyer_organization_id': organization_id,
                'status': BulkOrder.SUPPLIER_CONFIRMED
            }
            branch_id = getattr(user, 'branch_id', None)
            if branch_id:
                filters['buyer_branch_id'] = branch_id
            bulk_order = BulkOrder.objects.get(**filters)
        except BulkOrder.DoesNotExist:
            return Response({'error': 'Order not found or cannot be modified'}, status=404)
        
        data = request.data
        items_data = data.get('items', [])
        payment_data = data.get('payment', {})
        buyer_notes = data.get('buyer_notes', '')
        
        total_amount = 0
        for item_data in items_data:
            try:
                order_item = bulk_order.items.get(id=item_data['id'])
                
                if item_data.get('delete', False):
                    order_item.is_cancelled = True
                    order_item.quantity_final = 0
                else:
                    new_qty = min(item_data.get('quantity', order_item.quantity_confirmed), order_item.quantity_confirmed)
                    order_item.quantity_final = new_qty
                    order_item.is_cancelled = False
                    
                    if order_item.unit_price:
                        total_amount += order_item.unit_price * order_item.quantity_final
                
                order_item.buyer_reconfirm_notes = item_data.get('notes', '')
                order_item.save()
                
            except BulkOrderItem.DoesNotExist:
                continue
        
        bulk_order.total_amount = total_amount
        bulk_order.remaining_amount = total_amount
        bulk_order.buyer_reconfirm_notes = buyer_notes
        
        if payment_data.get('amount', 0) > 0:
            payment = BulkOrderPayment.objects.create(
                bulk_order=bulk_order,
                payment_type=payment_data.get('payment_type', BulkOrderPayment.INSTALLMENT),
                payment_method=payment_data.get('payment_method', BulkOrderPayment.CASH),
                amount=float(payment_data['amount']),
                payment_date=timezone.now(),
                cash_amount=float(payment_data.get('cash_amount', 0)),
                online_amount=float(payment_data.get('online_amount', 0)),
                credit_amount=float(payment_data.get('credit_amount', 0)),
                notes=payment_data.get('notes', ''),
                created_by=user
            )
            
            bulk_order.total_paid_amount = payment.amount
            bulk_order.remaining_amount = total_amount - Decimal(str(payment.amount))
            
            if bulk_order.remaining_amount <= 0:
                bulk_order.payment_status = 'completed'
                bulk_order.status = BulkOrder.READY_TO_SHIP
            else:
                bulk_order.payment_status = 'partial'
                bulk_order.status = BulkOrder.PAYMENT_PARTIAL
        else:
            bulk_order.status = BulkOrder.BUYER_CONFIRMED
            bulk_order.payment_status = 'pending'
        
        bulk_order.save()
        
        BulkOrderStatusLog.objects.create(
            bulk_order=bulk_order,
            from_status=BulkOrder.SUPPLIER_CONFIRMED,
            to_status=bulk_order.status,
            notes=f"Order adjusted by buyer: {buyer_notes}",
            changed_by=user
        )
        
        return Response({
            'message': 'Order adjusted successfully',
            'order': BulkOrderSerializer(bulk_order).data
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def purchase_order_actions(request, order_id):
    """Get available actions for a purchase order based on status and user role."""
    try:
        user = request.user
        organization_id = getattr(user, 'organization_id', None)
        
        try:
            branch_id = getattr(user, 'branch_id', None)
            if user.role == 'supplier_admin':
                filters = {'id': order_id, 'supplier_organization_id': organization_id}
                filters['supplier_user'] = user
                bulk_order = BulkOrder.objects.get(**filters)
                is_supplier = True
            else:
                filters = {'id': order_id, 'buyer_organization_id': organization_id}
                if branch_id:
                    filters['buyer_branch_id'] = branch_id
                bulk_order = BulkOrder.objects.get(**filters)
                is_supplier = False
        except BulkOrder.DoesNotExist:
            return Response({'error': 'Order not found'}, status=404)
        
        actions = []
        
        if is_supplier:
            if bulk_order.status == BulkOrder.DELIVERED:
                actions.append({
                    'action': 'release_stock',
                    'label': 'Release Stock',
                    'description': 'Release stock from supplier inventory'
                })
        else:
            if bulk_order.status == BulkOrder.COMPLETED:
                actions.append({
                    'action': 'import_stock',
                    'label': 'Import to Inventory',
                    'description': 'Import delivered items to your inventory'
                })
        
        return Response({
            'order_id': order_id,
            'order_number': bulk_order.order_number,
            'current_status': bulk_order.status,
            'user_role': user.role,
            'is_supplier': is_supplier,
            'available_actions': actions
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_supplier_inventory_prices(request):
    """Get supplier's selling prices by matching product codes and specifications."""
    try:
        user = request.user
        organization_id = getattr(user, 'organization_id', None)
        products_data = request.data.get('products', [])
        
        if not organization_id:
            return Response({})
        
        from ..models import InventoryItem
        
        all_inventory = InventoryItem.objects.filter(
            organization_id=organization_id,
            quantity__gt=0
        ).select_related('product')
        
        price_map = {}
        for product_data in products_data:
            order_item_id = str(product_data.get('order_item_id'))
            name = product_data.get('name', '').lower().strip()
            strength = product_data.get('strength', '').lower().strip()
            dosage_form = product_data.get('dosage_form', '').lower().strip()
            batch_number = product_data.get('batch_number', '').strip()
            
            matched_item = None
            for item in all_inventory:
                item_name = item.product.name.lower().strip()
                item_strength = item.product.strength.lower().strip()
                item_dosage = item.product.dosage_form.lower().strip()
                
                name_match = (name == item_name or name in item_name or item_name in name)
                spec_match = strength == item_strength and dosage_form == item_dosage
                
                if name_match and spec_match:
                    if batch_number and item.batch_number == batch_number:
                        matched_item = item
                        break
                    elif not batch_number:
                        matched_item = item
                        break
            
            if matched_item:
                price = float(matched_item.selling_price) if matched_item.selling_price else float(matched_item.cost_price)
                price_map[order_item_id] = price
        
        return Response(price_map)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)