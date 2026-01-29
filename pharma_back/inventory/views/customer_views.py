from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Q, F, Count, Max, Min
from django.utils import timezone
from datetime import datetime, timedelta
from inventory.models import BulkOrder, BulkOrderPayment
from decimal import Decimal


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def customer_transactions(request, customer_id):
    """Get transaction history for a specific customer (buyer organization-branch)."""
    try:
        user = request.user
        organization_id = getattr(user, 'organization_id', None)
        branch_id = getattr(user, 'branch_id', None)
        
        # Decode customer_id (format: "OrganizationName-BranchName")
        try:
            organization_name, branch_name = customer_id.split('-', 1)
        except ValueError:
            return Response({'error': 'Invalid customer ID format'}, status=400)
        
        # Get all orders for this customer from this supplier
        orders = BulkOrder.objects.filter(
            supplier_organization_id=organization_id,
            buyer_organization__name=organization_name,
            buyer_branch__name=branch_name
        ).select_related('supplier_organization', 'buyer_organization', 'buyer_branch').prefetch_related('payments')
        
        # Filter by supplier user's branch if branch_id is available
        if branch_id:
            orders = orders.filter(supplier_user__branch_id=branch_id)
        
        # Use same transaction processing logic as supplier ledger
        all_transactions = []
        total_orders = Decimal('0')
        total_paid = Decimal('0')
        
        # Process each order and its payments
        for order in orders:
            order_amount = order.total_amount or Decimal('0')
            
            if order_amount > 0:
                total_orders += order_amount
                
                # Add order entry
                all_transactions.append({
                    'id': order.id,
                    'date': order.order_date,
                    'description': f'Bulk Order - {order.order_number}',
                    'reference': order.order_number,
                    'purchase': float(order_amount),
                    'payment': 0,
                    'balance': 0,  # Will be calculated later
                    'status': 'Pending',
                    'transaction_type': 'purchase',
                    'source': 'Bulk Order',
                    'order_status': order.status,
                    'reference_id': order.order_number,
                    'source_type': 'bulk_order',
                    'sort_date': order.order_date
                })
                
                # Add payment entries
                order_payments = order.payments.all().order_by('payment_date')
                for payment in order_payments:
                    payment_amount = payment.amount or Decimal('0')
                    total_paid += payment_amount
                    
                    all_transactions.append({
                        'id': f'pay_{payment.id}',
                        'date': payment.payment_date,
                        'description': f'Payment - {payment.payment_type}',
                        'reference': f'{order.order_number}-PAY-{payment.installment_number}',
                        'purchase': 0,
                        'payment': float(payment_amount),
                        'balance': 0,  # Will be calculated later
                        'status': 'Cleared',
                        'transaction_type': 'payment',
                        'source': 'Bulk Order',
                        'payment_method': payment.payment_method,
                        'reference_id': f'{order.order_number}-PAY-{payment.installment_number}',
                        'source_type': 'bulk_order',
                        'sort_date': payment.payment_date
                    })
        
        # Add stock management payments - CORRECTED: Look in customer's organization for payments TO current supplier
        from inventory.models import PaymentRecord, PurchaseTransaction
        
        # Get current supplier name for matching
        current_supplier = request.user
        supplier_name = current_supplier.get_full_name() or current_supplier.email
        supplier_org_name = getattr(current_supplier, 'organization_name', '') or supplier_name
        
        print(f"DEBUG: Current supplier: '{supplier_name}', org: '{supplier_org_name}', branch_id: {branch_id}")
        print(f"DEBUG: Looking for customer: {organization_name}-{branch_name}")
        
        # Get customer organization ID from orders
        if orders.exists():
            customer_org_id = orders.first().buyer_organization_id
            print(f"DEBUG: Customer org ID: {customer_org_id}")
            
            # Find individual payment records in CUSTOMER's organization TO current supplier
            individual_payments = PaymentRecord.objects.filter(
                organization_id=customer_org_id,  # Customer's organization
                total_amount=0,  # Individual payments have total_amount = 0
                paid_amount__gt=0
            ).select_related('transaction').order_by('created_at')
            
            print(f"DEBUG: Found {individual_payments.count()} individual payments")
            
            for payment in individual_payments:
                print(f"DEBUG: Payment {payment.id}: supplier='{payment.transaction.supplier_name}', amount={payment.paid_amount}")
                
                # Check if payment is to current supplier
                payment_supplier_name = payment.transaction.supplier_name or ''
                is_match = False
                
                # Direct name matching with current supplier
                if payment_supplier_name:
                    if (supplier_name.lower() == payment_supplier_name.lower() or
                        supplier_name.lower() in payment_supplier_name.lower() or
                        payment_supplier_name.lower() in supplier_name.lower()):
                        is_match = True
                        print(f"DEBUG: MATCHED payment {payment.id} - supplier name match")
                
                if is_match:
                    payment_amount = payment.paid_amount
                    total_paid += payment_amount
                    
                    all_transactions.append({
                        'id': f'individual_pay_{payment.id}',
                        'date': payment.created_at,
                        'description': 'Payment - installment',
                        'reference': payment.payment_number,
                        'purchase': 0,
                        'payment': float(payment_amount),
                        'balance': 0,
                        'status': 'Cleared',
                        'transaction_type': 'payment',
                        'source': 'Stock Management',
                        'payment_method': payment.payment_method,
                        'reference_id': payment.payment_number,
                        'source_type': 'stock_management',
                        'sort_date': payment.created_at
                    })
                else:
                    print(f"DEBUG: NO MATCH for payment {payment.id}")
        
            # Also find stock transactions with initial payments in customer's organization
            stock_transactions = PurchaseTransaction.objects.filter(
                organization_id=customer_org_id,  # Customer's organization
                total_amount__gt=0
            ).prefetch_related('payments').order_by('created_at')
            
            for transaction in stock_transactions:
                # Check if transaction is to current supplier
                transaction_supplier_name = transaction.supplier_name or ''
                is_match = False
                
                # Direct name matching with current supplier
                if transaction_supplier_name:
                    if (supplier_name.lower() == transaction_supplier_name.lower() or
                        supplier_name.lower() in transaction_supplier_name.lower() or
                        transaction_supplier_name.lower() in supplier_name.lower()):
                        is_match = True
                
                if is_match:
                    # Add initial payment if exists
                    initial_payment = transaction.payments.first()
                    if initial_payment and initial_payment.paid_amount > 0:
                        payment_amount = initial_payment.paid_amount
                        total_paid += payment_amount
                        
                        all_transactions.append({
                            'id': f'initial_pay_{transaction.id}',
                            'date': transaction.created_at,
                            'description': 'Payment Received',
                            'reference': initial_payment.payment_number,
                            'purchase': 0,
                            'payment': float(payment_amount),
                            'balance': 0,
                            'status': 'Cleared',
                            'transaction_type': 'payment',
                            'source': 'Stock Management',
                            'payment_method': initial_payment.payment_method,
                            'reference_id': initial_payment.payment_number,
                            'source_type': 'stock_management',
                            'sort_date': transaction.created_at
                        })
        
        # Sort by date and calculate running balance
        all_transactions.sort(key=lambda x: x['sort_date'])
        running_balance = Decimal('0')
        
        for entry in all_transactions:
            if entry['transaction_type'] == 'purchase':
                running_balance += Decimal(str(entry['purchase']))
            else:
                running_balance -= Decimal(str(entry['payment']))
            entry['balance'] = float(max(running_balance, Decimal('0')))
        
        # Calculate total credit
        total_credit = total_orders - total_paid
        print(f"DEBUG: FINAL - Orders: {total_orders}, Paid: {total_paid}, Credit: {total_credit}")
        print(f"DEBUG: Total transactions: {len(all_transactions)}")
        
        # Convert dates to ISO format and sort for response
        transactions = []
        for txn in all_transactions:
            txn_copy = txn.copy()
            txn_copy['date'] = txn['date'].isoformat()
            transactions.append(txn_copy)
        
        transactions.sort(key=lambda x: x['sort_date'], reverse=True)
        
        summary = {
            'total_orders': float(total_orders),
            'total_paid': float(total_paid),
            'total_credit': float(total_credit),
            'order_count': orders.count(),
            'payment_count': sum(order.payments.count() for order in orders)
        }
        
        return Response({
            'summary': summary,
            'transactions': transactions,
            'customer': {
                'organization_name': organization_name,
                'branch_name': branch_name,
                'customer_id': customer_id
            }
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def customer_list(request):
    """Get list of customers (buyer organizations) for the current supplier."""
    try:
        user = request.user
        organization_id = getattr(user, 'organization_id', None)
        branch_id = getattr(user, 'branch_id', None)
        
        # Get all unique buyer organizations that have placed orders
        orders_query = BulkOrder.objects.filter(
            supplier_organization_id=organization_id
        )
        
        # Filter by supplier user's branch if branch_id is available
        if branch_id:
            orders_query = orders_query.filter(supplier_user__branch_id=branch_id)
        
        # Group by buyer organization and branch
        customers = orders_query.values(
            'buyer_organization__name', 
            'buyer_branch__name'
        ).annotate(
            total_orders=Sum('total_amount'),
            order_count=Count('id'),
            last_order_date=Max('order_date'),
            first_order_date=Min('order_date')
        ).order_by('-last_order_date')
        
        # Calculate payments for each customer including stock management payments
        customer_list = []
        for customer in customers:
            customer_id = f"{customer['buyer_organization__name']}-{customer['buyer_branch__name']}"
            customer_org_name = customer['buyer_organization__name']
            customer_branch_name = customer['buyer_branch__name']
            
            # 1. Bulk Order payments
            bulk_orders = BulkOrder.objects.filter(
                supplier_organization_id=organization_id,
                buyer_organization__name=customer_org_name,
                buyer_branch__name=customer_branch_name
            ).prefetch_related('payments')
            
            bulk_total_amount = Decimal('0')
            bulk_total_paid = Decimal('0')
            
            for order in bulk_orders:
                if order.total_amount:
                    bulk_total_amount += Decimal(str(order.total_amount))
                    order_payments = order.payments.all()
                    bulk_total_paid += sum(Decimal(str(payment.amount)) for payment in order_payments)
            
            # 2. Stock Management payments - CORRECTED: Look in customer's organization
            from inventory.models import PaymentRecord, PurchaseTransaction
            
            # Get current supplier name for matching
            current_supplier = request.user
            supplier_name = current_supplier.get_full_name() or current_supplier.email
            supplier_org_name = getattr(current_supplier, 'organization_name', '') or supplier_name
            
            stock_total_paid = Decimal('0')
            
            # Get customer organization ID from bulk orders
            if bulk_orders.exists():
                customer_org_id = bulk_orders.first().buyer_organization_id
                
                # Find individual payments in customer's organization TO current supplier
                individual_payments = PaymentRecord.objects.filter(
                    organization_id=customer_org_id,
                    total_amount=0,
                    paid_amount__gt=0
                ).select_related('transaction')
                
                for payment in individual_payments:
                    payment_supplier_name = payment.transaction.supplier_name or ''
                    if payment_supplier_name and (
                        supplier_name.lower() == payment_supplier_name.lower() or
                        supplier_name.lower() in payment_supplier_name.lower() or
                        payment_supplier_name.lower() in supplier_name.lower()):
                        stock_total_paid += payment.paid_amount
                
                # Find initial payments in stock transactions
                stock_transactions = PurchaseTransaction.objects.filter(
                    organization_id=customer_org_id,
                    total_amount__gt=0
                ).prefetch_related('payments')
                
                for transaction in stock_transactions:
                    transaction_supplier_name = transaction.supplier_name or ''
                    if transaction_supplier_name and (
                        supplier_name.lower() == transaction_supplier_name.lower() or
                        supplier_name.lower() in transaction_supplier_name.lower() or
                        transaction_supplier_name.lower() in supplier_name.lower()):
                        initial_payment = transaction.payments.first()
                        if initial_payment and initial_payment.paid_amount > 0:
                            stock_total_paid += initial_payment.paid_amount
            
            total_orders = bulk_total_amount
            total_paid = bulk_total_paid + stock_total_paid
            total_credit = total_orders - total_paid
            
            customer_list.append({
                'id': customer_id,
                'organization_name': customer['buyer_organization__name'],
                'branch_name': customer['buyer_branch__name'],
                'total_orders': float(total_orders),
                'total_paid': float(total_paid),
                'total_credit': float(total_credit),
                'order_count': customer['order_count'],
                'last_order_date': customer['last_order_date'],
                'first_order_date': customer['first_order_date']
            })
        
        return Response(customer_list)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def collect_customer_payment(request, customer_id):
    """Collect payment from customer for outstanding credit."""
    try:
        user = request.user
        organization_id = getattr(user, 'organization_id', None)
        
        # Decode customer_id
        try:
            organization_name, branch_name = customer_id.split('-', 1)
        except ValueError:
            return Response({'error': 'Invalid customer ID format'}, status=400)
        
        data = request.data
        payment_amount = float(data.get('payment_amount', 0))
        payment_method = data.get('payment_method', 'cash')
        payment_reference = data.get('payment_reference', '')
        
        if payment_amount <= 0:
            return Response({'error': 'Invalid payment amount'}, status=400)
        
        # Get customer organization ID
        orders = BulkOrder.objects.filter(
            supplier_organization_id=organization_id,
            buyer_organization__name=organization_name,
            buyer_branch__name=branch_name
        ).first()
        
        if not orders:
            return Response({'error': 'Customer not found'}, status=404)
        
        customer_org_id = orders.buyer_organization_id
        
        # Create payment record in customer's organization
        from inventory.models import PurchaseTransaction, PaymentRecord
        
        supplier_name = user.get_full_name() or user.email
        
        payment_transaction = PurchaseTransaction.objects.create(
            supplier_name=supplier_name,
            supplier_contact='',
            total_amount=0,
            organization_id=customer_org_id,
            branch_id=orders.buyer_branch_id,
            created_by=user
        )
        
        payment_record = PaymentRecord.objects.create(
            transaction=payment_transaction,
            payment_method=payment_method,
            payment_date=timezone.now().date(),
            total_amount=0,
            paid_amount=Decimal(str(payment_amount)),
            credit_amount=Decimal(str(-payment_amount)),
            notes=f"Payment collected: {payment_reference}",
            organization_id=customer_org_id,
            created_by=user
        )
        
        return Response({
            'message': 'Payment collected successfully',
            'payment_number': payment_record.payment_number,
            'payment_amount': payment_amount
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)