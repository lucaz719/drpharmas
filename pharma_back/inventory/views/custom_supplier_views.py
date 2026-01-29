from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from ..models import CustomSupplier


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_custom_supplier(request):
    """Create a new custom supplier."""
    try:
        data = request.data
        name = data.get('name', '').strip()
        contact_person = data.get('contact_person', '').strip()
        phone = data.get('phone', '').strip()
        email = data.get('email', '').strip()
        address = data.get('address', '').strip()
        
        if not name:
            return Response({
                'error': 'Supplier name is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        organization_id = getattr(request.user, 'organization_id', None)
        if not organization_id:
            organization_id = 3
        
        # Check if supplier already exists
        if CustomSupplier.objects.filter(
            name=name, 
            organization_id=organization_id
        ).exists():
            return Response({
                'error': 'Supplier with this name already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create custom supplier
        supplier = CustomSupplier.objects.create(
            name=name,
            contact_person=contact_person,
            phone=phone,
            email=email,
            address=address,
            organization_id=organization_id,
            created_by=request.user
        )
        
        return Response({
            'message': 'Custom supplier created successfully',
            'supplier': {
                'id': supplier.id,
                'name': supplier.name,
                'contact_person': supplier.contact_person,
                'phone': supplier.phone,
                'email': supplier.email,
                'address': supplier.address,
                'is_active': supplier.is_active,
                'created_at': supplier.created_at.strftime('%Y-%m-%d %H:%M:%S')
            }
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_custom_suppliers(request):
    """List all custom suppliers for the organization."""
    try:
        organization_id = getattr(request.user, 'organization_id', None)
        if not organization_id:
            organization_id = 3
        
        suppliers = CustomSupplier.objects.filter(
            organization_id=organization_id,
            is_active=True
        ).select_related('created_by').order_by('name')
        
        results = []
        for supplier in suppliers:
            # Get branch info from created_by user
            branch_name = 'N/A'
            if supplier.created_by and hasattr(supplier.created_by, 'branch'):
                branch_name = supplier.created_by.branch.name if supplier.created_by.branch else 'N/A'
            elif supplier.created_by and hasattr(supplier.created_by, 'branch_id'):
                try:
                    from organizations.models import Branch
                    branch = Branch.objects.get(id=supplier.created_by.branch_id)
                    branch_name = branch.name
                except Branch.DoesNotExist:
                    branch_name = 'N/A'
            
            results.append({
                'id': supplier.id,
                'name': supplier.name,
                'contact_person': supplier.contact_person,
                'phone': supplier.phone,
                'email': supplier.email,
                'address': supplier.address,
                'is_active': supplier.is_active,
                'branch_name': branch_name,
                'created_at': supplier.created_at.strftime('%Y-%m-%d %H:%M:%S')
            })
        
        return Response(results)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_custom_supplier(request, supplier_id):
    """Update an existing custom supplier."""
    try:
        organization_id = getattr(request.user, 'organization_id', None)
        if not organization_id:
            organization_id = 3
        
        supplier = get_object_or_404(
            CustomSupplier, 
            id=supplier_id, 
            organization_id=organization_id
        )
        
        data = request.data
        supplier.name = data.get('name', supplier.name).strip()
        supplier.contact_person = data.get('contact_person', supplier.contact_person).strip()
        supplier.phone = data.get('phone', supplier.phone).strip()
        supplier.email = data.get('email', supplier.email).strip()
        supplier.address = data.get('address', supplier.address).strip()
        supplier.is_active = data.get('is_active', supplier.is_active)
        
        supplier.save()
        
        return Response({
            'message': 'Custom supplier updated successfully',
            'supplier': {
                'id': supplier.id,
                'name': supplier.name,
                'contact_person': supplier.contact_person,
                'phone': supplier.phone,
                'email': supplier.email,
                'address': supplier.address,
                'is_active': supplier.is_active,
                'updated_at': supplier.updated_at.strftime('%Y-%m-%d %H:%M:%S')
            }
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)