from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Sum
from django.utils import timezone
from decimal import Decimal
from ..models import (
    CustomSupplier, PurchaseTransaction, PaymentRecord, 
    BulkOrder, BulkOrderPayment
)
from accounts.models import User


def get_custom_supplier_data(supplier_name, buyer_organization_id, buyer_branch_id=None):
    """Get stock management data for custom suppliers using name matching"""
    print(f"DEBUG: get_custom_supplier_data called with supplier_name='{supplier_name}', org={buyer_organization_id}, branch={buyer_branch_id}")
    filters = {
        'organization_id': buyer_organization_id,
        'total_amount__gt': 0
    }
    if buyer_branch_id:
        filters['branch_id'] = buyer_branch_id
    
    transactions = PurchaseTransaction.objects.filter(**filters).prefetch_related('payments').order_by('created_at')
    
    filtered_transactions = []
    for t in transactions:
        print(f"DEBUG: Checking purchase transaction {t.id} with supplier_name: '{t.supplier_name}' against '{supplier_name}'")
        if t.supplier_name and (
            supplier_name.lower() in t.supplier_name.lower() or 
            t.supplier_name.lower() in supplier_name.lower() or
            t.supplier_name.lower() == supplier_name.lower()
        ):
            filtered_transactions.append(t)
            print(f"DEBUG: Added purchase transaction {t.id}")
    
    transactions = filtered_transactions
    
    total_purchases = 0
    all_entries = []
    
    for t in transactions:
        payment = t.payments.first()
        transaction_amount = float(t.total_amount)
        paid_amount = float(payment.paid_amount) if payment else 0
        
        total_purchases += transaction_amount
        
        all_entries.append({
            'id': t.id,
            'date': t.created_at,
            'description': f'Purchase - {t.transaction_number}',
            'reference': t.transaction_number,
            'purchase': transaction_amount,
            'payment': 0,
            'balance': 0,
            'status': 'Pending',
            'transaction_type': 'purchase',
            'source': 'Stock Management',
            'sort_date': t.created_at,
            'reference_id': t.transaction_number,
            'source_type': 'stock_management'
        })
        
        if paid_amount > 0:
            all_entries.append({
                'id': f'initial_pay_{t.id}',
                'date': t.created_at,
                'description': 'Payment Received',
                'reference': payment.payment_number if payment else f'PAY-{t.transaction_number}',
                'purchase': 0,
                'payment': paid_amount,
                'balance': 0,
                'status': 'Cleared',
                'transaction_type': 'payment',
                'source': 'Stock Management',
                'payment_method': payment.payment_method if payment else 'cash',
                'sort_date': t.created_at.replace(second=t.created_at.second + 1),
                'reference_id': payment.payment_number if payment else f'PAY-{t.transaction_number}',
                'source_type': 'stock_management'
            })
    
    # Add individual payments (transactions with total_amount = 0)
    payment_filters = {
        'organization_id': buyer_organization_id,
        'total_amount': 0
    }
    if buyer_branch_id:
        payment_filters['branch_id'] = buyer_branch_id
    
    all_payment_transactions = PurchaseTransaction.objects.filter(**payment_filters)
    
    # Debug: Print all payment transactions
    print(f"DEBUG: Found {all_payment_transactions.count()} payment transactions for org {buyer_organization_id}")
    
    payment_transactions = []
    for pt in all_payment_transactions:
        print(f"DEBUG: Checking transaction {pt.id} with supplier_name: '{pt.supplier_name}' against '{supplier_name}'")
        # Check if supplier_name matches exactly or if it's a custom supplier ID
        name_match = pt.supplier_name and (
            supplier_name.lower() in pt.supplier_name.lower() or 
            pt.supplier_name.lower() in supplier_name.lower() or
            pt.supplier_name.lower() == supplier_name.lower()
        )
        # Also check if the payment transaction supplier_name is the ID part of custom supplier
        id_match = pt.supplier_name and pt.supplier_name.isdigit() and supplier_name == f"custom_{pt.supplier_name}"
        
        if name_match or id_match:
            payment_transactions.append(pt)
            print(f"DEBUG: Added payment transaction {pt.id}")
    
    print(f"DEBUG: Filtered to {len(payment_transactions)} matching payment transactions")
    
    individual_payments = PaymentRecord.objects.filter(
        transaction__in=payment_transactions,
        paid_amount__gt=0
    ).order_by('created_at')
    
    print(f"DEBUG: Found {individual_payments.count()} individual payment records")
    for payment in individual_payments:
        print(f"DEBUG: Individual payment: {payment.payment_number}, amount: {payment.paid_amount}, transaction: {payment.transaction.supplier_name}")
    
    actual_total_paid = 0  # Initialize here
    
    for payment in individual_payments:
        payment_amount = float(payment.paid_amount)
        actual_total_paid += payment_amount  # Add to total paid here
        print(f"DEBUG: Adding individual payment {payment.payment_number} amount {payment_amount}")
            
        all_entries.append({
            'id': f'individual_pay_{payment.id}',
            'date': payment.created_at,
            'description': 'Payment Received',
            'reference': payment.payment_number,
            'purchase': 0,
            'payment': payment_amount,
            'balance': 0,
            'status': 'Cleared',
            'transaction_type': 'payment',
            'source': 'Stock Management',
            'payment_method': payment.payment_method,
            'sort_date': payment.created_at,
            'reference_id': payment.payment_number,
            'source_type': 'stock_management'
        })
    
    # Sort and calculate balances
    all_entries.sort(key=lambda x: x['sort_date'])
    running_balance = 0
    # actual_total_paid already initialized above
    
    for entry in all_entries:
        if entry['transaction_type'] == 'purchase':
            running_balance += entry['purchase']
            entry['balance'] = running_balance
            entry['status'] = 'Pending' if running_balance > 0 else 'Cleared'
        else:
            # Only add to actual_total_paid for initial payments (not individual payments)
            if entry['id'].startswith('initial_pay_'):
                actual_total_paid += entry['payment']
            running_balance -= entry['payment']
            entry['balance'] = max(0, running_balance)
            entry['status'] = 'Cleared'
    
    final_credit = max(0, total_purchases - actual_total_paid)
    
    return {
        'total_purchases': total_purchases,
        'total_paid': actual_total_paid,
        'total_credit': final_credit,
        'transaction_count': len(transactions),
        'transactions': sorted(all_entries, key=lambda x: x['sort_date'], reverse=True)
    }


def get_stock_management_data(supplier_user_id, buyer_organization_id, buyer_branch_id=None):
    """Get stock management payment data filtered by supplier user and buyer branch"""
    try:
        supplier_user = User.objects.get(id=supplier_user_id, role='supplier_admin')
        supplier_org_id = supplier_user.organization_id
    except User.DoesNotExist:
        return {'total_purchases': 0, 'total_paid': 0, 'total_credit': 0, 'transaction_count': 0, 'transactions': []}
    
    filters = {
        'organization_id': buyer_organization_id,
        'total_amount__gt': 0
    }
    if buyer_branch_id:
        filters['branch_id'] = buyer_branch_id
    
    transactions = PurchaseTransaction.objects.filter(**filters).prefetch_related('payments').order_by('created_at')
    
    supplier_name = supplier_user.get_full_name() or supplier_user.email
    org_name = getattr(supplier_user, 'organization_name', '') or 'Atal pharmac'
    
    filtered_transactions = []
    for t in transactions:
        if t.supplier_name and (supplier_name.lower() in t.supplier_name.lower() or 
                               org_name.lower() in t.supplier_name.lower() or
                               t.supplier_name.lower() in supplier_name.lower()):
            filtered_transactions.append(t)
    
    transactions = filtered_transactions
    
    total_purchases = 0
    total_paid = 0
    all_entries = []
    running_balance = 0
    
    for t in transactions:
        payment = t.payments.first()
        transaction_amount = float(t.total_amount)
        paid_amount = float(payment.paid_amount) if payment else 0
        
        total_purchases += transaction_amount
        
        running_balance += transaction_amount
        all_entries.append({
            'id': t.id,
            'date': t.created_at,
            'description': f'Purchase - {t.transaction_number}',
            'reference': t.transaction_number,
            'purchase': transaction_amount,
            'payment': 0,
            'balance': running_balance,
            'status': 'Pending',
            'transaction_type': 'purchase',
            'source': 'Stock Management',
            'sort_date': t.created_at,
            'reference_id': t.transaction_number,
            'source_type': 'stock_management'
        })
        
        if paid_amount > 0:
            total_paid += paid_amount
            all_entries.append({
                'id': f'initial_pay_{t.id}',
                'date': t.created_at,
                'description': 'Payment Received',
                'reference': payment.payment_number if payment else f'PAY-{t.transaction_number}',
                'purchase': 0,
                'payment': paid_amount,
                'balance': 0,
                'status': 'Cleared',
                'transaction_type': 'payment',
                'source': 'Stock Management',
                'payment_method': payment.payment_method if payment else 'cash',
                'sort_date': t.created_at,
                'reference_id': payment.payment_number if payment else f'PAY-{t.transaction_number}',
                'source_type': 'stock_management'
            })
    
    # Add individual payment records (transactions with total_amount = 0)
    payment_filters = {
        'organization_id': buyer_organization_id,
        'total_amount': 0
    }
    if buyer_branch_id:
        payment_filters['branch_id'] = buyer_branch_id
    
    all_payment_transactions = PurchaseTransaction.objects.filter(**payment_filters)
    
    payment_transactions = []
    for pt in all_payment_transactions:
        if pt.supplier_name and (supplier_name.lower() in pt.supplier_name.lower() or 
                               org_name.lower() in pt.supplier_name.lower() or
                               pt.supplier_name.lower() in supplier_name.lower()):
            payment_transactions.append(pt)
    
    individual_payments = PaymentRecord.objects.filter(
        transaction__in=payment_transactions,
        paid_amount__gt=0
    ).order_by('created_at')
    
    for payment in individual_payments:
        payment_amount = float(payment.paid_amount)
        total_paid += payment_amount
            
        all_entries.append({
            'id': f'individual_pay_{payment.id}',
            'date': payment.created_at,
            'description': 'Payment Received',
            'reference': payment.payment_number,
            'purchase': 0,
            'payment': payment_amount,
            'balance': 0,
            'status': 'Cleared',
            'transaction_type': 'payment',
            'source': 'Stock Management',
            'payment_method': payment.payment_method,
            'sort_date': payment.created_at,
            'reference_id': payment.payment_number,
            'source_type': 'stock_management'
        })
    
    # Sort all entries by date and recalculate running balance
    all_entries.sort(key=lambda x: x['sort_date'])
    running_balance = 0
    
    for entry in all_entries:
        if entry['transaction_type'] == 'purchase':
            running_balance += entry['purchase']
            entry['balance'] = running_balance
            entry['status'] = 'Pending' if running_balance > 0 else 'Cleared'
        else:
            running_balance -= entry['payment']
            entry['balance'] = max(0, running_balance)
            entry['status'] = 'Cleared'
    
    final_credit = max(0, total_purchases - total_paid)
    
    return {
        'total_purchases': total_purchases,
        'total_paid': total_paid,
        'total_credit': final_credit,
        'transaction_count': len(transactions),
        'transactions': sorted(all_entries, key=lambda x: x['sort_date'], reverse=True)
    }


def get_bulk_order_data(supplier_user_id, buyer_organization_id, buyer_branch_id=None):
    """Get bulk order payment data with branch filtering"""
    filters = {
        'supplier_user_id': supplier_user_id,
        'buyer_organization_id': buyer_organization_id
    }
    if buyer_branch_id:
        filters['buyer_branch_id'] = buyer_branch_id
    
    orders = BulkOrder.objects.filter(**filters).prefetch_related('payments').order_by('created_at')
    
    total_purchases = 0
    total_paid = 0
    order_list = []
    
    for o in orders:
        order_amount = float(o.total_amount) if o.total_amount else 0
        
        if order_amount > 0:
            total_purchases += order_amount
            
            order_payments = o.payments.all().order_by('payment_date')
            order_paid_amount = sum(float(payment.amount) for payment in order_payments)
            total_paid += order_paid_amount
            
            # Add purchase entry
            order_list.append({
                'id': o.id,
                'date': o.created_at,
                'description': f'Bulk Order - {o.order_number}',
                'reference': o.order_number,
                'purchase': order_amount,
                'payment': 0,
                'balance': 0,  # Will be calculated later
                'status': 'Pending',
                'transaction_type': 'purchase',
                'source': 'Bulk Order',
                'order_status': o.status,
                'reference_id': o.order_number,
                'source_type': 'bulk_order',
                'sort_date': o.created_at
            })
            
            # Add payment entries
            for payment in order_payments:
                payment_amount = float(payment.amount)
                order_list.append({
                    'id': f'pay_{payment.id}',
                    'date': payment.payment_date,
                    'description': f'Payment - {payment.payment_type}',
                    'reference': f'{o.order_number}-PAY-{payment.installment_number}',
                    'purchase': 0,
                    'payment': payment_amount,
                    'balance': 0,  # Will be calculated later
                    'status': 'Cleared',
                    'transaction_type': 'payment',
                    'source': 'Bulk Order',
                    'payment_method': payment.payment_method,
                    'reference_id': f'{o.order_number}-PAY-{payment.installment_number}',
                    'source_type': 'bulk_order',
                    'sort_date': payment.payment_date
                })
    
    # Sort by date and calculate running balance
    order_list.sort(key=lambda x: x['sort_date'])
    running_balance = 0
    
    for entry in order_list:
        if entry['transaction_type'] == 'purchase':
            running_balance += entry['purchase']
        else:
            running_balance -= entry['payment']
        entry['balance'] = max(0, running_balance)
    
    final_credit = max(0, total_purchases - total_paid)
    
    return {
        'total_purchases': total_purchases,
        'total_paid': total_paid,
        'total_credit': final_credit,
        'order_count': len(orders),
        'orders': order_list
    }


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def supplier_ledger_detail(request, supplier_id):
    """Get unified supplier payment tracking"""
    try:
        organization_id = getattr(request.user, 'organization_id', None)
        branch_id = getattr(request.user, 'branch_id', None)
        
        if not organization_id:
            return Response({'error': 'User not associated with organization'}, status=400)
        
        # Handle both numeric IDs and custom supplier format (custom_14, custom_Supplier_Name)
        if str(supplier_id).startswith('custom_'):
            # Extract the actual supplier identifier
            supplier_id_part = str(supplier_id).replace('custom_', '')
            
            # Try to get supplier by numeric ID first
            supplier_info = None
            try:
                custom_supplier_id = int(supplier_id_part)
                custom_supplier = CustomSupplier.objects.get(id=custom_supplier_id, organization_id=organization_id)
                supplier_name = custom_supplier.name
                supplier_info = {
                    'id': supplier_id,
                    'name': custom_supplier.name,
                    'email': custom_supplier.email or 'N/A',
                    'phone': custom_supplier.phone or 'N/A',
                    'address': custom_supplier.address or 'N/A',
                    'organization_name': custom_supplier.name,
                    'contact_person': custom_supplier.contact_person or 'N/A',
                    'branch_name': getattr(custom_supplier, 'branch_name', 'Main Branch'),
                    'created_at': custom_supplier.created_at.isoformat() if custom_supplier.created_at else None,
                    'is_active': custom_supplier.is_active,
                    'supplier_type': 'custom'
                }
            except (ValueError, CustomSupplier.DoesNotExist):
                # If not numeric, treat as name
                supplier_name = supplier_id_part.replace('_', ' ')
                supplier_info = {
                    'id': supplier_id,
                    'name': supplier_name,
                    'email': 'N/A',
                    'phone': 'N/A',
                    'address': 'N/A',
                    'organization_name': supplier_name,
                    'contact_person': 'N/A',
                    'created_at': None,
                    'is_active': True,
                    'supplier_type': 'custom'
                }
            
            # Get stock management data for custom supplier
            stock_data = get_custom_supplier_data(supplier_name, organization_id, branch_id)
            
            # Return data in the format expected by frontend
            return Response({
                'supplier_info': supplier_info,
                'summary': {
                    'total_credit': stock_data['total_credit'],
                    'pending_credit': stock_data['total_credit'],
                    'cleared_credit': stock_data['total_paid'],
                    'total_purchases': stock_data['total_purchases'],
                    'total_paid': stock_data['total_paid']
                },
                'transactions': stock_data['transactions']
            })
        
        # Handle regular numeric supplier IDs
        supplier_info = None
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
        
        stock_data = get_custom_supplier_data(supplier_info['name'], organization_id, branch_id)
        
        bulk_data = {'total_purchases': 0, 'total_paid': 0, 'total_credit': 0, 'order_count': 0, 'orders': []}
        if supplier_info['type'] == 'user':
            bulk_data = get_bulk_order_data(supplier_info['user_id'], organization_id, branch_id)
        
        # Combine transactions and avoid duplicates
        all_transactions = []
        processed_refs = set()
        
        # Add stock transactions
        for txn in stock_data['transactions']:
            ref_key = f"stock_{txn['reference']}"
            if ref_key not in processed_refs:
                all_transactions.append(txn)
                processed_refs.add(ref_key)
        
        # Add bulk order transactions
        for order in bulk_data['orders']:
            ref_key = f"bulk_{order['reference']}"
            if ref_key not in processed_refs:
                all_transactions.append(order)
                processed_refs.add(ref_key)
        
        # Sort and recalculate balances
        all_transactions.sort(key=lambda x: x.get('sort_date', x['date']))
        running_balance = 0
        
        for txn in all_transactions:
            if txn['transaction_type'] == 'purchase':
                running_balance += txn['purchase']
            else:
                running_balance -= txn['payment']
            txn['balance'] = max(0, running_balance)
        
        # Calculate totals without double counting
        total_purchases = stock_data['total_purchases'] + bulk_data['total_purchases']
        total_paid = stock_data['total_paid'] + bulk_data['total_paid']
        total_credit = max(0, total_purchases - total_paid)
        
        # Return data in format expected by frontend
        return Response({
            'summary': {
                'total_credit': total_credit,
                'pending_credit': total_credit,
                'cleared_credit': total_paid,
                'total_purchases': total_purchases,
                'total_paid': total_paid
            },
            'transactions': sorted(all_transactions, key=lambda x: x.get('sort_date', x['date']), reverse=True)
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def supplier_ledger_summary(request):
    """Get summary of all suppliers with credit amounts"""
    try:
        organization_id = getattr(request.user, 'organization_id', None)
        branch_id = getattr(request.user, 'branch_id', None)
        
        if not organization_id:
            return Response({'error': 'User not associated with organization'}, status=400)
        
        suppliers = set()
        total_credit = 0
        
        transactions = PurchaseTransaction.objects.filter(organization_id=organization_id)
        if branch_id:
            transactions = transactions.filter(branch_id=branch_id)
            
        for transaction in transactions:
            suppliers.add(transaction.supplier_name)
            payments = transaction.payments.all()
            for payment in payments:
                total_credit += float(payment.credit_amount)
        
        bulk_orders = BulkOrder.objects.filter(buyer_organization_id=organization_id)
        if branch_id:
            bulk_orders = bulk_orders.filter(buyer_branch_id=branch_id)
            
        for order in bulk_orders:
            if order.supplier_user:
                supplier_name = order.supplier_user.get_full_name() or order.supplier_user.email
                suppliers.add(supplier_name)
                total_credit += float(order.remaining_amount)
        
        return Response({
            'totalSuppliers': len(suppliers),
            'totalCredit': total_credit
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def supplier_ledger_detail_by_name(request):
    """Get supplier ledger details by name with improved matching"""
    try:
        supplier_name = request.GET.get('supplier_name')
        organization_id = getattr(request.user, 'organization_id', None)
        branch_id = getattr(request.user, 'branch_id', None)
        
        if not supplier_name or not organization_id:
            return Response({'error': 'Missing supplier_name or organization'}, status=400)
        
        # Get stock management data
        stock_data = get_custom_supplier_data(supplier_name, organization_id, branch_id)
        
        # Try to find matching user supplier for bulk orders
        bulk_data = {'total_purchases': 0, 'total_paid': 0, 'total_credit': 0, 'order_count': 0, 'orders': []}
        try:
            # Try to find user supplier by checking if any user has this supplier name in their profile
            user_supplier = User.objects.filter(
                role='supplier_admin'
            ).filter(
                Q(first_name__icontains=supplier_name) |
                Q(last_name__icontains=supplier_name) |
                Q(email__icontains=supplier_name)
            ).first()
            
            if not user_supplier:
                name_parts = supplier_name.split()
                if len(name_parts) >= 2:
                    user_supplier = User.objects.filter(
                        role='supplier_admin',
                        first_name__iexact=name_parts[0],
                        last_name__iexact=' '.join(name_parts[1:])
                    ).first()
            
            if user_supplier:
                bulk_data = get_bulk_order_data(user_supplier.id, organization_id, branch_id)
        except Exception as e:
            print(f"Error finding user supplier: {str(e)}")
        
        # Combine and deduplicate transactions
        all_transactions = []
        processed_refs = set()
        
        # Add stock management transactions
        for txn in stock_data['transactions']:
            ref_key = f"stock_{txn['reference']}"
            if ref_key not in processed_refs:
                txn['source_type'] = 'stock_management'
                all_transactions.append(txn)
                processed_refs.add(ref_key)
        
        # Add bulk order transactions (avoid duplicates)
        for order in bulk_data['orders']:
            ref_key = f"bulk_{order['reference']}"
            if ref_key not in processed_refs:
                order['source_type'] = 'bulk_order'
                all_transactions.append(order)
                processed_refs.add(ref_key)
        
        # Sort chronologically and recalculate balances
        all_transactions.sort(key=lambda x: x.get('sort_date', x['date']))
        running_balance = 0
        
        for txn in all_transactions:
            if txn['transaction_type'] == 'purchase':
                running_balance += txn['purchase']
            else:
                running_balance -= txn['payment']
            txn['balance'] = max(0, running_balance)
        
        # Calculate totals (avoid double counting)
        total_purchases = stock_data['total_purchases'] + bulk_data['total_purchases']
        total_paid = stock_data['total_paid'] + bulk_data['total_paid']
        total_credit = max(0, total_purchases - total_paid)
        
        response_data = {
            'summary': {
                'total_credit': total_credit,
                'pending_credit': total_credit,
                'cleared_credit': total_paid,
                'total_purchases': total_purchases,
                'total_paid': total_paid
            },
            'transactions': sorted(all_transactions, key=lambda x: x.get('sort_date', x['date']), reverse=True)
        }
        
        return Response(response_data)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def supplier_ledger_suppliers(request):
    """Get all suppliers with transaction history for current user's branch"""
    try:
        organization_id = getattr(request.user, 'organization_id', None)
        branch_id = getattr(request.user, 'branch_id', None)
        
        if not organization_id:
            return Response({'error': 'User not associated with organization'}, status=400)
        
        suppliers_dict = {}
        
        transactions = PurchaseTransaction.objects.filter(
            organization_id=organization_id,
            branch_id=branch_id
        ) if branch_id else PurchaseTransaction.objects.filter(organization_id=organization_id)
        
        purchase_supplier_names = transactions.values_list('supplier_name', flat=True).distinct()
        
        for supplier_name in purchase_supplier_names:
            if supplier_name and supplier_name not in suppliers_dict:
                suppliers_dict[supplier_name] = {
                    'supplier_name': supplier_name,
                    'total_credit': 0,
                    'pending_credit': 0
                }
        
        bulk_orders = BulkOrder.objects.filter(
            buyer_organization_id=organization_id,
            buyer_branch_id=branch_id
        ) if branch_id else BulkOrder.objects.filter(buyer_organization_id=organization_id)
        
        for order in bulk_orders.exclude(supplier_user__isnull=True):
            supplier_name = order.supplier_user.get_full_name() or order.supplier_user.email
            if supplier_name and supplier_name not in suppliers_dict:
                suppliers_dict[supplier_name] = {
                    'supplier_name': supplier_name,
                    'total_credit': 0,
                    'pending_credit': 0
                }
        
        suppliers = list(suppliers_dict.values())
        
        return Response(suppliers)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def record_supplier_payment(request):
    """Record individual payment to supplier"""
    try:
        user = request.user
        organization_id = getattr(user, 'organization_id', None)
        
        if not organization_id:
            return Response({'error': 'User not associated with organization'}, status=400)
        
        data = request.data
        supplier_name = data.get('supplier_name')
        payment_amount = float(data.get('payment_amount', 0))
        payment_method = data.get('payment_method', 'cash')
        payment_reference = data.get('payment_reference', '')
        
        if not supplier_name or payment_amount <= 0:
            return Response({'error': 'Invalid supplier name or payment amount'}, status=400)
        
        print(f"DEBUG: Recording payment for supplier_name: '{supplier_name}'")
        
        # Use the actual supplier name for the payment transaction
        # Convert supplier ID to actual name if needed
        payment_supplier_name = supplier_name
        if supplier_name.isdigit():
            # If supplier_name is just a number, find the actual supplier name
            try:
                custom_supplier = CustomSupplier.objects.get(id=int(supplier_name), organization_id=organization_id)
                payment_supplier_name = custom_supplier.name
                print(f"DEBUG: Converted supplier ID '{supplier_name}' to name '{payment_supplier_name}'")
            except CustomSupplier.DoesNotExist:
                print(f"DEBUG: Custom supplier with ID '{supplier_name}' not found")
        elif supplier_name.startswith('custom_'):
            supplier_id_part = supplier_name.replace('custom_', '')
            try:
                if supplier_id_part.isdigit():
                    custom_supplier = CustomSupplier.objects.get(id=int(supplier_id_part), organization_id=organization_id)
                    payment_supplier_name = custom_supplier.name
                    print(f"DEBUG: Converted '{supplier_name}' to '{payment_supplier_name}'")
                else:
                    payment_supplier_name = supplier_id_part.replace('_', ' ')
            except CustomSupplier.DoesNotExist:
                payment_supplier_name = supplier_id_part.replace('_', ' ')
        
        # Create a payment transaction with zero total amount to represent individual payment
        payment_transaction = PurchaseTransaction.objects.create(
            supplier_name=payment_supplier_name,
            supplier_contact='',
            total_amount=0,  # Zero total amount indicates this is a payment-only transaction
            organization_id=organization_id,
            branch_id=getattr(user, 'branch_id', 1),
            created_by=user
        )
        
        print(f"DEBUG: Created payment transaction with supplier_name: '{payment_supplier_name}'")
        
        # Create payment record with positive paid_amount and zero credit_amount
        payment_record = PaymentRecord.objects.create(
            transaction=payment_transaction,
            payment_method=payment_method,
            payment_date=timezone.now().date(),
            total_amount=0,
            paid_amount=Decimal(str(payment_amount)),
            credit_amount=Decimal('0'),  # Set to zero for individual payments
            notes=f"Individual payment: {payment_reference}" if payment_reference else "Individual payment",
            organization_id=organization_id,
            created_by=user
        )
        
        # Don't apply payment to existing transactions - just record as individual payment
        # The ledger calculation will handle the credit reduction automatically
        payment_record.notes += f" | Individual payment recorded"
        payment_record.save()
        
        return Response({
            'message': 'Payment recorded successfully',
            'payment_number': payment_record.payment_number,
            'payment_amount': payment_amount
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def supplier_transactions_by_name(request, supplier_name):
    """Get supplier transactions by supplier name (including custom suppliers)"""
    try:
        organization_id = getattr(request.user, 'organization_id', None)
        branch_id = getattr(request.user, 'branch_id', None)
        
        if not organization_id:
            return Response({'error': 'User not associated with organization'}, status=400)
        
        # Handle custom supplier names (format: custom_Supplier_Name or custom_ID)
        if supplier_name.startswith('custom_'):
            # Try to get the actual supplier name from database first
            supplier_id_part = supplier_name.replace('custom_', '')
            actual_supplier_name = None
            
            # Check if it's a numeric ID
            try:
                custom_supplier_id = int(supplier_id_part)
                custom_supplier = CustomSupplier.objects.get(id=custom_supplier_id, organization_id=organization_id)
                actual_supplier_name = custom_supplier.name
            except (ValueError, CustomSupplier.DoesNotExist):
                # If not numeric or not found, treat as name
                actual_supplier_name = supplier_id_part.replace('_', ' ')
            
            # Get stock management data directly
            stock_data = get_custom_supplier_data(actual_supplier_name, organization_id, branch_id)
            
            response_data = {
                'summary': {
                    'total_credit': stock_data['total_credit'],
                    'pending_credit': stock_data['total_credit'],
                    'cleared_credit': stock_data['total_paid'],
                    'total_purchases': stock_data['total_purchases'],
                    'total_paid': stock_data['total_paid']
                },
                'transactions': stock_data['transactions']
            }
            
            return Response(response_data)
        
        # Handle regular supplier names - try to find by ID first
        try:
            supplier_id = int(supplier_name)
            # Handle numeric supplier ID by getting supplier info and processing data
            supplier_info = None
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
            
            if supplier_info:
                stock_data = get_custom_supplier_data(supplier_info['name'], organization_id, branch_id)
                
                bulk_data = {'total_purchases': 0, 'total_paid': 0, 'total_credit': 0, 'order_count': 0, 'orders': []}
                if supplier_info['type'] == 'user':
                    bulk_data = get_bulk_order_data(supplier_info['user_id'], organization_id, branch_id)
                
                # Combine transactions
                all_transactions = []
                processed_refs = set()
                
                for txn in stock_data['transactions']:
                    ref_key = f"stock_{txn['reference']}"
                    if ref_key not in processed_refs:
                        txn['source_type'] = 'stock_management'
                        all_transactions.append(txn)
                        processed_refs.add(ref_key)
                
                for order in bulk_data['orders']:
                    ref_key = f"bulk_{order['reference']}"
                    if ref_key not in processed_refs:
                        order['source_type'] = 'bulk_order'
                        all_transactions.append(order)
                        processed_refs.add(ref_key)
                
                # Sort and recalculate balances
                all_transactions.sort(key=lambda x: x.get('sort_date', x['date']))
                running_balance = 0
                
                for txn in all_transactions:
                    if txn['transaction_type'] == 'purchase':
                        running_balance += txn['purchase']
                    else:
                        running_balance -= txn['payment']
                    txn['balance'] = max(0, running_balance)
                
                # Calculate totals
                total_purchases = stock_data['total_purchases'] + bulk_data['total_purchases']
                total_paid = stock_data['total_paid'] + bulk_data['total_paid']
                total_credit = max(0, total_purchases - total_paid)
                
                response_data = {
                    'summary': {
                        'total_credit': total_credit,
                        'pending_credit': total_credit,
                        'cleared_credit': total_paid,
                        'total_purchases': total_purchases,
                        'total_paid': total_paid
                    },
                    'transactions': sorted(all_transactions, key=lambda x: x.get('sort_date', x['date']), reverse=True)
                }
                
                return Response(response_data)
        except ValueError:
            # If not a number, treat as name - get data directly
            stock_data = get_custom_supplier_data(supplier_name, organization_id, branch_id)
            
            # Try to find matching user supplier for bulk orders
            bulk_data = {'total_purchases': 0, 'total_paid': 0, 'total_credit': 0, 'order_count': 0, 'orders': []}
            try:
                user_supplier = User.objects.filter(
                    role='supplier_admin'
                ).filter(
                    Q(first_name__icontains=supplier_name) |
                    Q(last_name__icontains=supplier_name) |
                    Q(email__icontains=supplier_name)
                ).first()
                
                if not user_supplier:
                    name_parts = supplier_name.split()
                    if len(name_parts) >= 2:
                        user_supplier = User.objects.filter(
                            role='supplier_admin',
                            first_name__iexact=name_parts[0],
                            last_name__iexact=' '.join(name_parts[1:])
                        ).first()
                
                if user_supplier:
                    bulk_data = get_bulk_order_data(user_supplier.id, organization_id, branch_id)
            except Exception as e:
                print(f"Error finding user supplier: {str(e)}")
            
            # Combine transactions
            all_transactions = []
            processed_refs = set()
            
            for txn in stock_data['transactions']:
                ref_key = f"stock_{txn['reference']}"
                if ref_key not in processed_refs:
                    txn['source_type'] = 'stock_management'
                    all_transactions.append(txn)
                    processed_refs.add(ref_key)
            
            for order in bulk_data['orders']:
                ref_key = f"bulk_{order['reference']}"
                if ref_key not in processed_refs:
                    order['source_type'] = 'bulk_order'
                    all_transactions.append(order)
                    processed_refs.add(ref_key)
            
            # Sort and recalculate balances
            all_transactions.sort(key=lambda x: x.get('sort_date', x['date']))
            running_balance = 0
            
            for txn in all_transactions:
                if txn['transaction_type'] == 'purchase':
                    running_balance += txn['purchase']
                else:
                    running_balance -= txn['payment']
                txn['balance'] = max(0, running_balance)
            
            # Calculate totals
            total_purchases = stock_data['total_purchases'] + bulk_data['total_purchases']
            total_paid = stock_data['total_paid'] + bulk_data['total_paid']
            total_credit = max(0, total_purchases - total_paid)
            
            response_data = {
                'summary': {
                    'total_credit': total_credit,
                    'pending_credit': total_credit,
                    'cleared_credit': total_paid,
                    'total_purchases': total_purchases,
                    'total_paid': total_paid
                },
                'transactions': sorted(all_transactions, key=lambda x: x.get('sort_date', x['date']), reverse=True)
            }
            
            return Response(response_data)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_transaction_details(request):
    """Get detailed transaction items for a specific transaction"""
    try:
        user = request.user
        organization_id = getattr(user, 'organization_id', None)
        transaction_id = request.GET.get('transaction_id')
        source_type = request.GET.get('source_type')
        
        if not transaction_id or not source_type:
            return Response({'error': 'Missing transaction_id or source_type'}, status=400)
        
        items = []
        
        if source_type == 'stock_management':
            try:
                transaction = PurchaseTransaction.objects.get(
                    transaction_number=transaction_id,
                    organization_id=organization_id
                )
                from ..models import PurchaseItem
                purchase_items = PurchaseItem.objects.filter(
                    purchase_transaction=transaction
                ).select_related('product')
                
                for item in purchase_items:
                    items.append({
                        'id': item.id,
                        'name': item.product.name,
                        'generic_name': item.product.generic_name,
                        'strength': item.product.strength,
                        'dosage_form': item.product.dosage_form,
                        'quantity': item.quantity_purchased,
                        'unit': item.unit,
                        'cost_price': float(item.cost_price),
                        'selling_price': float(item.selling_price) if item.selling_price else None,
                        'batch_number': item.batch_number,
                        'expiry_date': item.expiry_date.isoformat() if item.expiry_date else None,
                        'total_cost': float(item.total_cost)
                    })
            except PurchaseTransaction.DoesNotExist:
                return Response({'error': 'Transaction not found'}, status=404)
                
        elif source_type == 'bulk_order':
            try:
                bulk_order = BulkOrder.objects.get(
                    order_number=transaction_id,
                    buyer_organization_id=organization_id
                )
                from ..models import BulkOrderItem
                bulk_items = BulkOrderItem.objects.filter(
                    bulk_order=bulk_order
                ).select_related('product')
                
                for item in bulk_items:
                    items.append({
                        'id': item.id,
                        'name': item.product.name,
                        'generic_name': item.product.generic_name,
                        'strength': item.product.strength,
                        'dosage_form': item.product.dosage_form,
                        'quantity_requested': item.quantity_requested,
                        'quantity_confirmed': item.quantity_confirmed,
                        'quantity_final': item.quantity_final,
                        'unit_price': float(item.unit_price) if item.unit_price else None,
                        'total_price': float(item.total_price),
                        'is_available': item.is_available,
                        'supplier_notes': item.supplier_notes
                    })
            except BulkOrder.DoesNotExist:
                return Response({'error': 'Order not found'}, status=404)
        
        total_amount = 0
        total_paid = 0
        total_credit = 0
        
        if source_type == 'stock_management':
            try:
                transaction = PurchaseTransaction.objects.get(
                    transaction_number=transaction_id,
                    organization_id=organization_id
                )
                total_amount = float(transaction.total_amount)
                payment = transaction.payments.first()
                if payment:
                    total_paid = float(payment.paid_amount)
                    total_credit = float(payment.credit_amount)
                else:
                    total_credit = total_amount
            except PurchaseTransaction.DoesNotExist:
                pass
                
        elif source_type == 'bulk_order':
            try:
                bulk_order = BulkOrder.objects.get(
                    order_number=transaction_id,
                    buyer_organization_id=organization_id
                )
                total_amount = float(bulk_order.total_amount) if bulk_order.total_amount else 0
                total_paid = float(bulk_order.total_paid_amount) if bulk_order.total_paid_amount else 0
                total_credit = float(bulk_order.remaining_amount) if bulk_order.remaining_amount else 0
            except BulkOrder.DoesNotExist:
                pass
        
        return Response({
            'transaction_id': transaction_id,
            'source_type': source_type,
            'items': items,
            'total_items': len(items),
            'total_amount': total_amount,
            'total_paid': total_paid,
            'total_credit': total_credit
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)