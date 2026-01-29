from datetime import datetime, timedelta
from decimal import Decimal
from django.db.models import Sum, Count, Avg, Q, F
from django.db.models.functions import TruncDate, TruncHour, Extract
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse
import csv
import json

from .models import Sale, SaleItem, Payment, Customer, Prescription, Return
from inventory.models import Product
from accounts.models import User


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sales_summary(request):
    """Get sales summary for dashboard."""
    try:
        # Get date range
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        
        if not start_date:
            start_date = timezone.now().date()
        else:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            
        if not end_date:
            end_date = start_date
        else:
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        
        # Get organization
        organization_id = getattr(request.user, 'organization_id', None)
        if not organization_id:
            return Response({'error': 'User not associated with an organization'}, status=400)
        
        # Base queryset - include both completed and credit sales
        sales_qs = Sale.objects.filter(
            organization_id=organization_id,
            sale_date__date__gte=start_date,
            sale_date__date__lte=end_date,
            status__in=['completed', 'credit']
        )
        
        # Calculate summary metrics
        summary = sales_qs.aggregate(
            total_sales=Sum('total_amount'),
            total_transactions=Count('id'),
            total_items_sold=Sum('items__quantity'),
            avg_transaction_value=Avg('total_amount'),
            total_discount=Sum('discount_amount'),
            total_tax=Sum('tax_amount')
        )
        
        # Calculate returns separately
        returns_qs = Return.objects.filter(
            organization_id=organization_id,
            return_date__date__gte=start_date,
            return_date__date__lte=end_date,
            status='completed'
        )
        
        returns_summary = returns_qs.aggregate(
            total_returns=Sum('refund_amount'),
            total_return_transactions=Count('id')
        )
        
        # Handle None values for returns
        total_returns = returns_summary['total_returns'] or Decimal('0')
        total_return_transactions = returns_summary['total_return_transactions'] or 0
        
        # Handle None values
        summary['total_sales'] = summary['total_sales'] or Decimal('0')
        summary['total_items_sold'] = summary['total_items_sold'] or 0
        summary['avg_transaction_value'] = summary['avg_transaction_value'] or Decimal('0')
        summary['total_discount'] = summary['total_discount'] or Decimal('0')
        summary['total_tax'] = summary['total_tax'] or Decimal('0')
        
        # Get unique customers count (handle None values)
        unique_customers = sales_qs.exclude(
            Q(patient_name__isnull=True) & Q(patient_phone__isnull=True)
        ).values('patient_name', 'patient_phone').distinct().count()
        
        # Calculate profit (selling price - cost price)
        total_cost = Decimal('0')
        total_profit = Decimal('0')
        
        for sale in sales_qs.prefetch_related('items__product'):
            for item in sale.items.all():
                if item.product and hasattr(item.product, 'cost_price'):
                    cost_price = item.product.cost_price or Decimal('0')
                else:
                    cost_price = Decimal('0')
                selling_price = item.unit_price or Decimal('0')
                quantity = item.quantity or 0
                item_cost = cost_price * quantity
                item_profit = (selling_price - cost_price) * quantity
                total_cost += item_cost
                total_profit += item_profit
        
        # Previous period comparison
        prev_start = start_date - timedelta(days=(end_date - start_date).days + 1)
        prev_end = start_date - timedelta(days=1)
        
        prev_sales = Sale.objects.filter(
            organization_id=organization_id,
            sale_date__date__gte=prev_start,
            sale_date__date__lte=prev_end,
            status__in=['completed', 'credit']
        ).aggregate(
            total_sales=Sum('total_amount'),
            total_transactions=Count('id')
        )
        
        # Handle None values
        prev_sales['total_sales'] = prev_sales['total_sales'] or Decimal('0')
        prev_sales['total_transactions'] = prev_sales['total_transactions'] or 0
        
        # Calculate growth percentages
        sales_growth = 0
        transaction_growth = 0
        
        prev_total_sales = prev_sales['total_sales'] or Decimal('0')
        prev_total_transactions = prev_sales['total_transactions'] or 0
        current_total_sales = summary['total_sales'] or Decimal('0')
        current_total_transactions = summary['total_transactions'] or 0
        
        if prev_total_sales > 0:
            sales_growth = ((current_total_sales - prev_total_sales) / prev_total_sales) * 100
        
        if prev_total_transactions > 0:
            transaction_growth = ((current_total_transactions - prev_total_transactions) / prev_total_transactions) * 100
        
        # Calculate net sales (total sales - returns)
        net_sales = current_total_sales - total_returns
        
        return Response({
            'summary': {
                'total_sales': float(summary['total_sales']),
                'total_returns': float(total_returns),
                'net_sales': float(net_sales),
                'total_transactions': summary['total_transactions'],
                'total_return_transactions': total_return_transactions,
                'total_items_sold': summary['total_items_sold'],
                'avg_transaction_value': float(summary['avg_transaction_value']),
                'unique_customers': unique_customers,
                'total_discount': float(summary['total_discount']),
                'total_tax': float(summary['total_tax']),
                'total_cost': float(total_cost),
                'total_profit': float(total_profit),
                'profit_margin': float((total_profit / current_total_sales) * 100) if current_total_sales > 0 else 0,
                'sales_growth': float(sales_growth),
                'transaction_growth': float(transaction_growth)
            },
            'date_range': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            }
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def daily_sales_trend(request):
    """Get daily sales trend data."""
    try:
        # Get date range (default last 30 days)
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=30)
        
        if request.GET.get('start_date'):
            start_date = datetime.strptime(request.GET.get('start_date'), '%Y-%m-%d').date()
        if request.GET.get('end_date'):
            end_date = datetime.strptime(request.GET.get('end_date'), '%Y-%m-%d').date()
        
        organization_id = getattr(request.user, 'organization_id', None)
        
        # Get daily sales data
        daily_data = Sale.objects.filter(
            organization_id=organization_id,
            sale_date__date__gte=start_date,
            sale_date__date__lte=end_date,
            status__in=['completed', 'credit']
        ).annotate(
            date=TruncDate('sale_date')
        ).values('date').annotate(
            sales=Sum('total_amount'),
            transactions=Count('id'),
            customers=Count('patient_name', distinct=True),
            items_sold=Sum('items__quantity')
        ).order_by('date')
        
        return Response({
            'daily_sales': [
                {
                    'date': item['date'].isoformat(),
                    'sales': float(item['sales'] or 0),
                    'transactions': item['transactions'],
                    'customers': item['customers'],
                    'items_sold': item['items_sold'] or 0
                }
                for item in daily_data
            ]
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def hourly_sales_pattern(request):
    """Get hourly sales pattern for today or specified date."""
    try:
        target_date = request.GET.get('date')
        if target_date:
            target_date = datetime.strptime(target_date, '%Y-%m-%d').date()
        else:
            target_date = timezone.now().date()
        
        organization_id = getattr(request.user, 'organization_id', None)
        
        # Get hourly sales data
        hourly_data = Sale.objects.filter(
            organization_id=organization_id,
            sale_date__date=target_date,
            status__in=['completed', 'credit']
        ).annotate(
            hour=Extract('sale_date', 'hour')
        ).values('hour').annotate(
            sales=Sum('total_amount'),
            transactions=Count('id')
        ).order_by('hour')
        
        # Format for frontend
        formatted_data = []
        for hour in range(24):
            hour_data = next((item for item in hourly_data if item['hour'] == hour), None)
            formatted_data.append({
                'hour': f"{hour:02d}:00",
                'sales': float(hour_data['sales'] or 0) if hour_data else 0,
                'transactions': hour_data['transactions'] if hour_data else 0
            })
        
        return Response({
            'hourly_sales': formatted_data,
            'date': target_date.isoformat()
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def top_selling_products(request):
    """Get top selling products report."""
    try:
        # Get date range
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        limit = int(request.GET.get('limit', 20))
        
        if not start_date:
            start_date = timezone.now().date() - timedelta(days=30)
        else:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            
        if not end_date:
            end_date = timezone.now().date()
        else:
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        
        organization_id = getattr(request.user, 'organization_id', None)
        
        # Get top selling products
        top_products = SaleItem.objects.filter(
            sale__organization_id=organization_id,
            sale__sale_date__date__gte=start_date,
            sale__sale_date__date__lte=end_date,
            sale__status__in=['completed', 'credit']
        ).values(
            'product__id',
            'product__name',
            'product__generic_name',
            'product__strength',
            'product__dosage_form',
            'product__cost_price'
        ).annotate(
            total_quantity=Sum('quantity'),
            total_revenue=Sum(F('quantity') * F('unit_price')),
            total_transactions=Count('sale', distinct=True),
            avg_price=Avg('unit_price')
        ).order_by('-total_quantity')[:limit]
        
        # Calculate profit for each product
        products_data = []
        for product in top_products:
            cost_price = product['product__cost_price'] or Decimal('0')
            avg_selling_price = product['avg_price'] or Decimal('0')
            total_quantity = product['total_quantity'] or 0
            total_revenue = product['total_revenue'] or Decimal('0')
            
            profit_per_unit = avg_selling_price - cost_price
            total_profit = profit_per_unit * total_quantity
            profit_margin = (profit_per_unit / avg_selling_price * 100) if avg_selling_price > 0 else 0
            
            products_data.append({
                'product_id': product['product__id'],
                'name': product['product__name'],
                'generic_name': product['product__generic_name'],
                'strength': product['product__strength'],
                'dosage_form': product['product__dosage_form'],
                'quantity_sold': total_quantity,
                'total_revenue': float(total_revenue),
                'total_transactions': product['total_transactions'],
                'avg_selling_price': float(product['avg_price']),
                'cost_price': float(cost_price),
                'profit_per_unit': float(profit_per_unit),
                'total_profit': float(total_profit),
                'profit_margin': float(profit_margin)
            })
        
        return Response({
            'top_products': products_data,
            'date_range': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            }
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_methods_report(request):
    """Get payment methods distribution report."""
    try:
        # Get date range
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        
        if not start_date:
            start_date = timezone.now().date()
        else:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            
        if not end_date:
            end_date = start_date
        else:
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        
        organization_id = getattr(request.user, 'organization_id', None)
        
        # Get payment methods data
        payment_data = Payment.objects.filter(
            sale__organization_id=organization_id,
            payment_date__date__gte=start_date,
            payment_date__date__lte=end_date,
            sale__status__in=['completed', 'credit']
        ).values('payment_method').annotate(
            total_amount=Sum('amount'),
            transaction_count=Count('id')
        ).order_by('-total_amount')
        
        # Calculate total for percentages
        total_amount = sum(item['total_amount'] or Decimal('0') for item in payment_data)
        total_transactions = sum(item['transaction_count'] or 0 for item in payment_data)
        
        # Format data
        formatted_data = []
        for item in payment_data:
            item_amount = item['total_amount'] or Decimal('0')
            item_count = item['transaction_count'] or 0
            percentage = (item_amount / total_amount * 100) if total_amount > 0 else 0
            formatted_data.append({
                'payment_method': item['payment_method'] or 'unknown',
                'total_amount': float(item_amount),
                'transaction_count': item_count,
                'percentage': float(percentage)
            })
        
        return Response({
            'payment_methods': formatted_data,
            'summary': {
                'total_amount': float(total_amount),
                'total_transactions': total_transactions
            }
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def staff_performance_report(request):
    """Get staff performance report."""
    try:
        # Get date range
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        
        if not start_date:
            start_date = timezone.now().date() - timedelta(days=30)
        else:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            
        if not end_date:
            end_date = timezone.now().date()
        else:
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        
        organization_id = getattr(request.user, 'organization_id', None)
        
        # Get staff performance data
        staff_data = Sale.objects.filter(
            organization_id=organization_id,
            sale_date__date__gte=start_date,
            sale_date__date__lte=end_date,
            status__in=['completed', 'credit'],
            created_by__isnull=False
        ).values(
            'created_by__id',
            'created_by__first_name',
            'created_by__last_name'
        ).annotate(
            total_sales=Sum('total_amount'),
            transaction_count=Count('id'),
            avg_transaction_value=Avg('total_amount'),
            total_items_sold=Sum('items__quantity')
        ).order_by('-total_sales')
        
        # Format data
        formatted_data = []
        for staff in staff_data:
            formatted_data.append({
                'staff_id': staff['created_by__id'],
                'name': f"{staff['created_by__first_name']} {staff['created_by__last_name']}",
                'total_sales': float(staff['total_sales'] or 0),
                'transaction_count': staff['transaction_count'],
                'avg_transaction_value': float(staff['avg_transaction_value'] or 0),
                'total_items_sold': staff['total_items_sold'] or 0
            })
        
        return Response({
            'staff_performance': formatted_data,
            'date_range': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            }
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def customer_analytics(request):
    """Get customer analytics report."""
    try:
        # Get date range
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        
        if not start_date:
            start_date = timezone.now().date() - timedelta(days=30)
        else:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            
        if not end_date:
            end_date = timezone.now().date()
        else:
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        
        organization_id = getattr(request.user, 'organization_id', None)
        
        # Get customer data
        sales_qs = Sale.objects.filter(
            organization_id=organization_id,
            sale_date__date__gte=start_date,
            sale_date__date__lte=end_date,
            status__in=['completed', 'credit']
        )
        
        # New vs returning customers
        total_customers = sales_qs.values('patient_name', 'patient_phone').distinct().count()
        
        # Customer purchase frequency
        customer_frequency = sales_qs.values(
            'patient_name', 'patient_phone'
        ).annotate(
            visit_count=Count('id'),
            total_spent=Sum('total_amount'),
            avg_purchase=Avg('total_amount')
        ).order_by('-total_spent')
        
        # Categorize customers
        new_customers = 0
        returning_customers = 0
        high_value_customers = 0
        
        for customer in customer_frequency:
            if customer['visit_count'] == 1:
                new_customers += 1
            else:
                returning_customers += 1
            
            if customer['total_spent'] > 5000:  # High value threshold
                high_value_customers += 1
        
        # Top customers
        top_customers = list(customer_frequency[:10])
        
        return Response({
            'customer_analytics': {
                'total_customers': total_customers,
                'new_customers': new_customers,
                'returning_customers': returning_customers,
                'high_value_customers': high_value_customers,
                'retention_rate': (returning_customers / total_customers * 100) if total_customers > 0 else 0
            },
            'top_customers': [
                {
                    'name': customer['patient_name'] or 'Walk-in Customer',
                    'phone': customer['patient_phone'] or 'N/A',
                    'visit_count': customer['visit_count'],
                    'total_spent': float(customer['total_spent']),
                    'avg_purchase': float(customer['avg_purchase'])
                }
                for customer in top_customers
            ]
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_sales_report(request):
    """Export sales report as CSV."""
    try:
        # Get parameters
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        report_type = request.GET.get('type', 'sales')  # sales, products, payments, staff
        
        if not start_date:
            start_date = timezone.now().date()
        else:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            
        if not end_date:
            end_date = start_date
        else:
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        
        organization_id = getattr(request.user, 'organization_id', None)
        
        # Create CSV response
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{report_type}_report_{start_date}_{end_date}.csv"'
        
        writer = csv.writer(response)
        
        if report_type == 'sales':
            # Sales report
            writer.writerow(['Sale Number', 'Date', 'Patient Name', 'Total Amount', 'Payment Method', 'Status', 'Staff'])
            
            sales = Sale.objects.filter(
                organization_id=organization_id,
                sale_date__date__gte=start_date,
                sale_date__date__lte=end_date
            ).select_related('created_by').order_by('-sale_date')
            
            for sale in sales:
                writer.writerow([
                    sale.sale_number,
                    sale.sale_date.strftime('%Y-%m-%d %H:%M'),
                    sale.patient_name or 'Walk-in',
                    float(sale.total_amount),
                    sale.payment_method,
                    sale.status,
                    f"{sale.created_by.first_name} {sale.created_by.last_name}" if sale.created_by else 'N/A'
                ])
        
        elif report_type == 'products':
            # Products report
            writer.writerow(['Product Name', 'Quantity Sold', 'Revenue', 'Profit', 'Transactions'])
            
            # Get top products data (reuse logic from top_selling_products)
            top_products = SaleItem.objects.filter(
                sale__organization_id=organization_id,
                sale__sale_date__date__gte=start_date,
                sale__sale_date__date__lte=end_date,
                sale__status='completed'
            ).values(
                'product__name',
                'product__cost_price'
            ).annotate(
                total_quantity=Sum('quantity'),
                total_revenue=Sum(F('quantity') * F('unit_price')),
                total_transactions=Count('sale', distinct=True),
                avg_price=Avg('unit_price')
            ).order_by('-total_quantity')
            
            for product in top_products:
                cost_price = product['product__cost_price'] or Decimal('0')
                avg_selling_price = product['avg_price'] or Decimal('0')
                profit_per_unit = avg_selling_price - cost_price
                total_profit = profit_per_unit * product['total_quantity']
                
                writer.writerow([
                    product['product__name'],
                    product['total_quantity'],
                    float(product['total_revenue']),
                    float(total_profit),
                    product['total_transactions']
                ])
        
        return response
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)