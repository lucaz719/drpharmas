from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from ..models import Rack, RackSection, RackSectionAssignment, Product, InventoryItem
from ..serializers import RackSerializer, RackSectionSerializer, RackSectionAssignmentSerializer
from organizations.models import Organization, Branch


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def rack_list_create(request):
    """List all racks for the user's organization/branch or create a new rack."""
    user = request.user
    organization = user.organization_id
    branch = user.branch_id

    if request.method == 'GET':
        racks = Rack.objects.filter(organization_id=organization, branch_id=branch, is_active=True)
        serializer = RackSerializer(racks, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        data = request.data.copy()
        data['organization'] = organization
        data['branch'] = branch
        data['created_by'] = user.id

        serializer = RackSerializer(data=data)
        if serializer.is_valid():
            with transaction.atomic():
                rack = serializer.save()

                # Create rack sections
                sections_data = []
                for row in range(1, rack.rows + 1):
                    for col in range(1, rack.columns + 1):
                        section_name = f"{chr(64 + row)}{col}"  # A1, A2, B1, etc.
                        sections_data.append({
                            'rack': rack.id,
                            'section_name': section_name,
                            'row_number': row,
                            'column_number': col,
                            'is_occupied': False,
                            'quantity': 0
                        })

                # Bulk create sections
                from ..models import RackSection
                sections = []
                for section_data in sections_data:
                    section_data['rack'] = rack  # Use the rack instance, not ID
                    sections.append(RackSection(**section_data))
                RackSection.objects.bulk_create(sections)

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def rack_detail(request, rack_id):
    """Retrieve, update, or delete a specific rack."""
    user = request.user
    rack = get_object_or_404(
        Rack,
        id=rack_id,
        organization_id=user.organization_id,
        branch_id=user.branch_id
    )

    if request.method == 'GET':
        serializer = RackSerializer(rack)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = RackSerializer(rack, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        rack.is_active = False
        rack.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def rack_sections(request, rack_id):
    """Get all sections for a specific rack."""
    user = request.user
    rack = get_object_or_404(
        Rack,
        id=rack_id,
        organization_id=user.organization_id,
        branch_id=user.branch_id
    )

    sections = RackSection.objects.filter(rack=rack).order_by('row_number', 'column_number')
    serializer = RackSectionSerializer(sections, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_medicine_to_section(request, section_id):
    """Assign medicine to a rack section."""
    print(f"DEBUG: assign_medicine_to_section called with section_id={section_id}")
    print(f"DEBUG: Request data: {request.data}")
    print(f"DEBUG: User: {request.user}, org_id: {request.user.organization_id}, branch_id: {request.user.branch_id}")

    user = request.user
    section = get_object_or_404(
        RackSection,
        id=section_id,
        rack__organization_id=user.organization_id,
        rack__branch_id=user.branch_id
    )
    print(f"DEBUG: Found section: {section}, rack: {section.rack}")

    medicine_id = request.data.get('medicine_id')
    quantity = request.data.get('quantity', 0)
    batch_number = request.data.get('batch_number', '')
    expiry_date = request.data.get('expiry_date')

    print(f"DEBUG: medicine_id={medicine_id}, quantity={quantity}")

    if not medicine_id:
        print("DEBUG: Medicine ID is required")
        return Response(
            {'error': 'Medicine ID is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        medicine = Product.objects.get(id=medicine_id)
        print(f"DEBUG: Found medicine: {medicine} (org_id: {medicine.organization_id})")
    except Product.DoesNotExist:
        print(f"DEBUG: Medicine not found with id={medicine_id}")
        return Response(
            {'error': 'Medicine not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Allow multiple medicines in the same section - don't check if occupied
    # Users can add as many medicines as they want to a section

    # Check if medicine is available in inventory
    inventory_items = InventoryItem.objects.filter(
        product=medicine,
        branch_id=user.branch_id,
        quantity__gt=0
    )
    print(f"DEBUG: Found {inventory_items.count()} inventory items")

    if not inventory_items.exists():
        print(f"DEBUG: No inventory items found for medicine {medicine_id} in branch {user.branch_id}")
        return Response(
            {'error': 'Medicine not available in inventory'},
            status=status.HTTP_400_BAD_REQUEST
        )

    total_available = sum(item.quantity for item in inventory_items)
    print(f"DEBUG: Total available quantity: {total_available}, requested: {quantity}")

    if quantity > total_available:
        print(f"DEBUG: Requested quantity {quantity} > available {total_available}")
        return Response(
            {'error': f'Only {total_available} units available in inventory'},
            status=status.HTTP_400_BAD_REQUEST
        )

    with transaction.atomic():
        print("DEBUG: Starting transaction")
        # Update section
        section.medicine = medicine
        section.quantity = quantity
        section.batch_number = batch_number
        if expiry_date:
            section.expiry_date = expiry_date
        section.is_occupied = True
        section.save()
        print("DEBUG: Section updated")

        # Create assignment record
        assignment = RackSectionAssignment.objects.create(
            rack_section=section,
            medicine=medicine,
            quantity_assigned=quantity,
            batch_number=batch_number,
            expiry_date=expiry_date if expiry_date else None,
            assigned_by=user
        )
        print("DEBUG: Assignment record created")

        serializer = RackSectionSerializer(section)
        print("DEBUG: Returning success response")
        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_medicine_from_section(request, section_id):
    """Remove medicine from a rack section."""
    user = request.user
    section = get_object_or_404(
        RackSection,
        id=section_id,
        rack__organization_id=user.organization_id,
        rack__branch_id=user.branch_id
    )

    reason = request.data.get('reason', '')

    if not section.is_occupied:
        return Response(
            {'error': 'Section is already empty'},
            status=status.HTTP_400_BAD_REQUEST
        )

    with transaction.atomic():
        # Update assignment record
        assignment = RackSectionAssignment.objects.filter(
            rack_section=section,
            removed_at__isnull=True
        ).first()

        if assignment:
            assignment.removed_at = request.data.get('removed_at') or None
            assignment.removed_by = user
            assignment.removal_reason = reason
            assignment.save()

        # Clear section
        section.medicine = None
        section.quantity = 0
        section.batch_number = ''
        section.expiry_date = None
        section.is_occupied = False
        section.notes = reason
        section.save()

        serializer = RackSectionSerializer(section)
        return Response(serializer.data, status=status.HTTP_200_OK)