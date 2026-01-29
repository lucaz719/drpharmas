from rest_framework import generics, status
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination
from rest_framework.viewsets import ModelViewSet
from django.db.models import Q, Count, Sum
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from decimal import Decimal
from ..models import Product, Category, Manufacturer
from ..serializers import (
    ProductSerializer, ProductCreateSerializer, ProductUpdateSerializer,
    CategorySerializer, ManufacturerSerializer, MedicationListSerializer,
    BulkMedicationUploadSerializer, MedicationStatsSerializer
)
from accounts.models import User


class StandardResultsSetPagination(PageNumberPagination):
    """Custom pagination for medication list."""
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class ProductViewSet(ModelViewSet):
    """ViewSet for product/medication management."""
    queryset = Product.objects.all()
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_serializer_class(self):
        if self.action == 'create':
            return ProductCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ProductUpdateSerializer
        return ProductSerializer

    def get_queryset(self):
        """Filter products by user's organization."""
        organization_id = getattr(self.request.user, 'organization_id', None)
        if not organization_id:
            return Product.objects.none()

        queryset = Product.objects.filter(organization_id=organization_id)

        # Apply filters
        search = self.request.query_params.get('search', '')
        category = self.request.query_params.get('category', '')
        status_filter = self.request.query_params.get('status', '')
        prescription_required = self.request.query_params.get('prescription_required', '')

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(generic_name__icontains=search) |
                Q(brand_name__icontains=search) |
                Q(product_code__icontains=search)
            )

        if category and category != 'all':
            queryset = queryset.filter(category__name__icontains=category)

        if status_filter and status_filter != 'all':
            queryset = queryset.filter(status=status_filter)

        if prescription_required:
            queryset = queryset.filter(requires_prescription=prescription_required.lower() == 'true')

        return queryset.select_related('category', 'manufacturer')

    def perform_create(self, serializer):
        """Set organization_id from authenticated user when creating products."""
        organization_id = getattr(self.request.user, 'organization_id', None)
        if not organization_id:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'organization_id': 'User must be associated with an organization'})
        
        serializer.save(
            organization_id=organization_id,
            created_by=self.request.user
        )

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get medication statistics."""
        organization_id = getattr(request.user, 'organization_id', None)
        if not organization_id:
            return Response({'error': 'User not associated with an organization'}, status=status.HTTP_400_BAD_REQUEST)

        products = Product.objects.filter(organization_id=organization_id)

        stats = {
            'total_medications': products.count(),
            'active_medications': products.filter(status='active').count(),
            'prescription_medications': products.filter(requires_prescription=True).count(),
            'controlled_medications': products.filter(is_controlled=True).count(),
            'insured_medications': 0,
            'categories_count': Category.objects.filter(organization_id=organization_id).count(),
            'manufacturers_count': Manufacturer.objects.filter(organization_id=organization_id).count(),
        }

        serializer = MedicationStatsSerializer(stats)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def bulk_upload(self, request):
        """Bulk upload medications from Excel/CSV file."""
        serializer = BulkMedicationUploadSerializer(data=request.data)
        if serializer.is_valid():
            file = serializer.validated_data['file']
            
            try:
                import pandas as pd
                import io
                
                # Read file based on extension
                if file.name.endswith('.csv'):
                    df = pd.read_csv(io.StringIO(file.read().decode('utf-8')))
                elif file.name.endswith(('.xlsx', '.xls')):
                    if file.name.endswith('.xlsx'):
                        df = pd.read_excel(file, engine='openpyxl')
                    else:
                        df = pd.read_excel(file, engine='xlrd')
                else:
                    raise ValueError(f"Unsupported file format: {file.name}. Please use .csv, .xlsx, or .xls files.")
                
                org_id = getattr(request.user, 'organization_id', None)
                if not org_id:
                    return Response({'error': 'User not associated with an organization'}, status=400)
                
                created_count = 0
                errors = []
                
                for index, row in df.iterrows():
                    try:
                        # Handle category
                        category = None
                        if pd.notna(row.get('category_name')):
                            category, _ = Category.objects.get_or_create(
                                name=row['category_name'],
                                organization_id=org_id,
                                defaults={'created_by': request.user}
                            )
                        
                        # Handle manufacturer
                        manufacturer = None
                        if pd.notna(row.get('manufacturer_name')):
                            manufacturer, _ = Manufacturer.objects.get_or_create(
                                name=row['manufacturer_name'],
                                organization_id=org_id,
                                defaults={'created_by': request.user}
                            )
                        
                        # Create product
                        product_data = {
                            'name': row['name'],
                            'product_code': row['product_code'],
                            'generic_name': row.get('generic_name', ''),
                            'brand_name': row.get('brand_name', ''),
                            'category': category,
                            'manufacturer': manufacturer,
                            'dosage_form': row.get('dosage_form', 'tablet'),
                            'strength': row.get('strength', ''),
                            'pack_size': row.get('pack_size', ''),
                            'unit': row.get('unit', 'strip'),
                            'requires_prescription': str(row.get('requires_prescription', 'FALSE')).upper() == 'TRUE',
                            'is_controlled': str(row.get('is_controlled', 'FALSE')).upper() == 'TRUE',
                            'description': row.get('description', ''),
                            'cost_price': float(row.get('cost_price', 0)),
                            'selling_price': float(row.get('selling_price', 0)),
                            'min_stock_level': 10,
                            'max_stock_level': 1000,
                            'reorder_point': 20,
                            'organization_id': org_id,
                            'created_by': request.user
                        }
                        
                        product = Product.objects.create(**product_data)
                        
                        # Handle alternatives
                        alternatives = row.get('alternatives', '')
                        if alternatives and pd.notna(alternatives):
                            import json
                            alt_list = [alt.strip() for alt in str(alternatives).split(',')]
                            alternatives_json = json.dumps(alt_list)
                            current_desc = product.description or ""
                            if current_desc:
                                product.description = f"{current_desc}\n[ALTERNATIVES]{alternatives_json}[/ALTERNATIVES]"
                            else:
                                product.description = f"[ALTERNATIVES]{alternatives_json}[/ALTERNATIVES]"
                            product.save()
                        
                        created_count += 1
                        
                    except Exception as e:
                        errors.append(f"Row {index + 2}: {str(e)}")
                
                return Response({
                    'message': f'Successfully created {created_count} medications',
                    'created_count': created_count,
                    'errors': errors[:10] if errors else []
                })
                
            except Exception as e:
                return Response({
                    'error': f'Failed to process file: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def medicine_search(request):
    """Search for medicines in the product list (global search)."""
    try:
        query = request.GET.get('q', '').strip()

        if not query:
            return Response([])

        # Get user's organization and branch
        organization_id = getattr(request.user, 'organization_id', None)
        branch_id = getattr(request.user, 'branch_id', None)
        user_role = getattr(request.user, 'role', None)

        print(f"DEBUG: medicine_search - org_id={organization_id}, branch_id={branch_id}, role={user_role}, query='{query}'")

        if not organization_id:
            return Response({'error': 'User not associated with an organization'}, status=400)

        # Always filter by user's branch - even pharmacy_owner should only see medicines in their assigned branch
        if not branch_id:
            return Response({'error': 'User not associated with a branch'}, status=400)
        branch_filter = branch_id

        # For stock management form, we want to search from all medicines in the organization
        # Not just those with inventory, so users can add new stock
        medicines = Product.objects.filter(
            is_active=True,
            organization_id=organization_id
        ).filter(
            Q(name__icontains=query) |
            Q(generic_name__icontains=query) |
            Q(brand_name__icontains=query)
        )[:20]

        results = []
        for medicine in medicines:
            results.append({
                'id': medicine.id,
                'name': medicine.name,
                'generic_name': medicine.generic_name,
                'brand_name': medicine.brand_name,
                'strength': medicine.strength,
                'dosage_form': medicine.dosage_form,
                'unit': medicine.unit,
                'cost_price': float(medicine.cost_price) if medicine.cost_price else 0,
                'selling_price': float(medicine.selling_price) if medicine.selling_price else 0,
                'pack_size': medicine.pack_size
            })

        return Response(results)

    except Exception as e:
        print(f"Medicine search error: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return Response({'error': str(e)}, status=500)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def categories_list(request):
    """Get list of categories or create new category."""
    try:
        organization_id = getattr(request.user, 'organization_id', None)
        if not organization_id:
            return Response({'error': 'User not associated with an organization'}, status=400)
        
        if request.method == 'GET':
            categories = Category.objects.filter(organization_id=organization_id)
            serializer = CategorySerializer(categories, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            data = request.data.copy()
            data['organization'] = organization_id
            serializer = CategorySerializer(data=data)
            if serializer.is_valid():
                serializer.save(created_by=request.user)
                return Response({
                    'success': True,
                    'data': serializer.data,
                    'message': 'Category created successfully'
                })
            else:
                return Response({
                    'success': False,
                    'errors': serializer.errors
                }, status=400)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def manufacturers_list(request):
    """Get list of manufacturers or create new manufacturer."""
    try:
        organization_id = getattr(request.user, 'organization_id', None)
        if not organization_id:
            return Response({'error': 'User not associated with an organization'}, status=400)
        
        if request.method == 'GET':
            manufacturers = Manufacturer.objects.filter(organization_id=organization_id)
            serializer = ManufacturerSerializer(manufacturers, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            data = request.data.copy()
            data['organization'] = organization_id
            serializer = ManufacturerSerializer(data=data)
            if serializer.is_valid():
                serializer.save(created_by=request.user)
                return Response({
                    'success': True,
                    'data': serializer.data,
                    'message': 'Manufacturer created successfully'
                })
            else:
                return Response({
                    'success': False,
                    'errors': serializer.errors
                }, status=400)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)