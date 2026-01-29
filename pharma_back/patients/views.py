from django.shortcuts import render
from django.db.models import Q, Count, Avg
from django.utils.translation import gettext_lazy as _
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import models
from datetime import datetime, timedelta

from .models import Patient, MedicalRecord, PatientPrescription, PatientVisit
from .serializers import (
    PatientSerializer,
    PatientCreateSerializer,
    MedicalRecordSerializer,
    PatientPrescriptionSerializer,
    PatientVisitSerializer,
    PatientSummarySerializer,
    PatientStatsSerializer
)
from accounts.models import User


class PatientListCreateView(generics.ListCreateAPIView):
    """List and create patients."""
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter patients based on user's organization and permissions."""
        user = self.request.user
        
        if user.role == User.SUPER_ADMIN:
            queryset = Patient.objects.all()
        elif user.role == User.PHARMACY_OWNER:
            queryset = Patient.objects.filter(organization_id=user.organization_id)
        elif user.role in [User.BRANCH_MANAGER, User.SENIOR_PHARMACIST]:
            queryset = Patient.objects.filter(
                organization_id=user.organization_id,
                branch_id=user.branch_id
            )
        else:
            queryset = Patient.objects.filter(organization_id=user.organization_id)
        
        # Simple search
        search = self.request.query_params.get('search', '').strip()
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(phone__icontains=search) |
                Q(patient_id__icontains=search)
            )
        
        return queryset.order_by('-created_at')
    
    def get_serializer_class(self):
        """Use different serializer for creation."""
        if self.request.method == 'POST':
            return PatientCreateSerializer
        return PatientSerializer
    

    
    def perform_create(self, serializer):
        """Set organization and branch based on current user with auto-generated patient ID."""
        user = self.request.user
        
        # Set organization and branch
        org_id = user.organization_id
        branch_id = user.branch_id
        
        serializer.validated_data['organization_id'] = org_id
        if branch_id:
            serializer.validated_data['branch_id'] = branch_id
        
        # Auto-generate patient ID based on organization and branch
        org_prefix = f"ORG{org_id:03d}"
        branch_prefix = f"BR{branch_id:02d}" if branch_id else "BR00"
        
        # Get last patient number for this organization
        last_org_patient = Patient.objects.filter(
            organization_id=org_id,
            patient_id__startswith=org_prefix
        ).order_by('-patient_id').first()
        
        # Get last patient number for this branch
        last_branch_patient = Patient.objects.filter(
            organization_id=org_id,
            branch_id=branch_id,
            patient_id__startswith=f"{org_prefix}-{branch_prefix}"
        ).order_by('-patient_id').first() if branch_id else None
        
        # Generate organization patient number
        if last_org_patient:
            try:
                last_num = int(last_org_patient.patient_id.split('-P')[1])
                org_patient_num = last_num + 1
            except (ValueError, IndexError):
                org_patient_num = 1
        else:
            org_patient_num = 1
        
        # Generate branch patient number
        if last_branch_patient:
            try:
                last_num = int(last_branch_patient.patient_id.split('-P')[1])
                branch_patient_num = last_num + 1
            except (ValueError, IndexError):
                branch_patient_num = 1
        else:
            branch_patient_num = 1
        
        # Use branch-specific ID if branch exists, otherwise org-level ID
        if branch_id:
            patient_id = f"{org_prefix}-{branch_prefix}-P{branch_patient_num:03d}"
        else:
            patient_id = f"{org_prefix}-P{org_patient_num:03d}"
        
        serializer.validated_data['patient_id'] = patient_id
        return serializer.save(created_by=user)
    
    def create(self, request, *args, **kwargs):
        """Override create to return full patient data after creation."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        patient = self.perform_create(serializer)
        
        # Return full patient data using PatientSerializer
        response_serializer = PatientSerializer(patient)
        headers = self.get_success_headers(response_serializer.data)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class PatientDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a patient."""
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter patients based on user's permissions."""
        user = self.request.user

        if user.role == User.SUPER_ADMIN:
            return Patient.objects.all()
        elif user.role == User.PHARMACY_OWNER:
            return Patient.objects.filter(organization_id=user.organization_id)
        else:
            return Patient.objects.filter(organization_id=user.organization_id)

    def get_object(self):
        """Get patient by ID or patient_id."""
        queryset = self.get_queryset()
        lookup_value = self.kwargs.get(self.lookup_field)

        # Try to get by ID first
        try:
            return queryset.get(id=int(lookup_value))
        except (ValueError, Patient.DoesNotExist):
            # If not found by ID, try by patient_id
            try:
                return queryset.get(patient_id=lookup_value)
            except Patient.DoesNotExist:
                from django.http import Http404
                raise Http404("Patient not found")


class MedicalRecordListCreateView(generics.ListCreateAPIView):
    """List and create medical records."""
    serializer_class = MedicalRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter medical records based on user's organization."""
        user = self.request.user
        patient_id = self.request.query_params.get('patient_id')
        
        queryset = MedicalRecord.objects.select_related('patient')
        
        if user.role == User.SUPER_ADMIN:
            pass  # Can see all records
        else:
            queryset = queryset.filter(patient__organization_id=user.organization_id)
        
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        return queryset
    
    def perform_create(self, serializer):
        """Auto-generate record ID and set creator."""
        user = self.request.user
        
        # Auto-generate record ID
        last_record = MedicalRecord.objects.order_by('-id').first()
        if last_record and last_record.record_id.startswith('MR'):
            try:
                last_num = int(last_record.record_id[2:])
                new_num = last_num + 1
            except ValueError:
                new_num = 1
        else:
            new_num = 1
        
        serializer.validated_data['record_id'] = f"MR{new_num:03d}"
        serializer.save(created_by=user)


class PatientPrescriptionListCreateView(generics.ListCreateAPIView):
    """List and create patient prescriptions."""
    serializer_class = PatientPrescriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter prescriptions based on user's organization."""
        user = self.request.user
        patient_id = self.request.query_params.get('patient_id')
        status_filter = self.request.query_params.get('status')
        
        queryset = PatientPrescription.objects.select_related('patient')
        
        if user.role == User.SUPER_ADMIN:
            pass  # Can see all prescriptions
        else:
            queryset = queryset.filter(patient__organization_id=user.organization_id)
        
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset
    
    def perform_create(self, serializer):
        """Auto-generate prescription ID and set creator."""
        user = self.request.user
        
        # Auto-generate prescription ID
        last_prescription = PatientPrescription.objects.order_by('-id').first()
        if last_prescription and last_prescription.prescription_id.startswith('RX'):
            try:
                last_num = int(last_prescription.prescription_id[2:])
                new_num = last_num + 1
            except ValueError:
                new_num = 1
        else:
            new_num = 1
        
        serializer.validated_data['prescription_id'] = f"RX{new_num:03d}"
        serializer.save(created_by=user)


class PatientVisitListCreateView(generics.ListCreateAPIView):
    """List and create patient visits."""
    serializer_class = PatientVisitSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter visits based on user's organization."""
        user = self.request.user
        patient_id = self.request.query_params.get('patient_id')
        
        queryset = PatientVisit.objects.select_related('patient', 'attended_by')
        
        if user.role == User.SUPER_ADMIN:
            pass  # Can see all visits
        else:
            queryset = queryset.filter(patient__organization_id=user.organization_id)
        
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        return queryset
    
    def perform_create(self, serializer):
        """Auto-generate visit ID and set attended_by."""
        user = self.request.user
        
        # Auto-generate visit ID
        last_visit = PatientVisit.objects.order_by('-id').first()
        if last_visit and last_visit.visit_id.startswith('V'):
            try:
                last_num = int(last_visit.visit_id[1:])
                new_num = last_num + 1
            except ValueError:
                new_num = 1
        else:
            new_num = 1
        
        serializer.validated_data['visit_id'] = f"V{new_num:04d}"
        serializer.save(attended_by=user)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_patient_stats(request):
    """Get patient statistics."""
    user = request.user
    
    # Filter patients based on user's organization
    if user.role == User.SUPER_ADMIN:
        patients = Patient.objects.all()
    else:
        patients = Patient.objects.filter(organization_id=user.organization_id)
    
    # Calculate statistics
    total_patients = patients.count()
    active_patients = patients.filter(status='active').count()
    
    # New patients this month
    this_month = datetime.now().replace(day=1)
    new_patients_this_month = patients.filter(created_at__gte=this_month).count()
    
    # Average age
    average_age = patients.aggregate(avg_age=Avg('date_of_birth'))['avg_age']
    if average_age:
        from datetime import date
        today = date.today()
        average_age = today.year - average_age.year
    else:
        average_age = 0
    
    # Gender distribution
    gender_dist = patients.values('gender').annotate(count=Count('gender'))
    gender_distribution = {item['gender']: item['count'] for item in gender_dist}
    
    # Top medications (mock data for now)
    top_medications = [
        {'name': 'Metformin', 'prescriptions': 234, 'patients': 189},
        {'name': 'Amlodipine', 'prescriptions': 198, 'patients': 156},
        {'name': 'Losartan', 'prescriptions': 167, 'patients': 134},
    ]
    
    # Monthly visits (mock data for now)
    monthly_visits = [
        {'month': 'Jan', 'visits': 456, 'new_patients': 23},
        {'month': 'Feb', 'visits': 523, 'new_patients': 31},
        {'month': 'Mar', 'visits': 489, 'new_patients': 28},
    ]
    
    stats = {
        'total_patients': total_patients,
        'active_patients': active_patients,
        'new_patients_this_month': new_patients_this_month,
        'average_age': average_age,
        'gender_distribution': gender_distribution,
        'top_medications': top_medications,
        'monthly_visits': monthly_visits,
    }
    
    return Response(stats)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def search_patients(request):
    """Enhanced search patients by name, phone, patient ID, or billing information."""
    user = request.user
    query = request.GET.get('q', '').strip()
    search_type = request.GET.get('search_type', 'all')  # all, name, phone, bill_id, date
    
    if not query:
        return Response({'patients': []})
    
    # Filter patients based on user's organization
    if user.role == User.SUPER_ADMIN:
        patients = Patient.objects.all()
    else:
        patients = Patient.objects.filter(organization_id=user.organization_id)
    
    # Add billing information
    from pos.models import Sale
    patients = patients.prefetch_related('sales')
    
    # Enhanced search based on type
    if search_type == 'name':
        patients = patients.filter(
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query)
        )
    elif search_type == 'phone':
        patients = patients.filter(Q(phone__icontains=query))
    elif search_type == 'bill_id':
        patients = patients.filter(Q(sales__sale_number__icontains=query))
    elif search_type == 'date':
        try:
            from datetime import datetime
            search_date = datetime.strptime(query, '%Y-%m-%d').date()
            patients = patients.filter(Q(sales__created_at__date=search_date))
        except ValueError:
            patients = patients.none()
    else:  # search_type == 'all'
        patients = patients.filter(
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query) |
            Q(phone__icontains=query) |
            Q(patient_id__icontains=query) |
            Q(email__icontains=query) |
            Q(address__icontains=query) |
            Q(city__icontains=query) |
            # Search in billing information
            Q(sales__sale_number__icontains=query) |
            Q(sales__total_amount__icontains=query)
        ).distinct()
    
    # Limit results and add billing info
    patients = patients[:20]
    
    # Prepare response with billing information
    patients_data = []
    for patient in patients:
        # Get latest sale for last visit
        latest_sale = patient.sales.filter(status='completed').order_by('-created_at').first()
        
        # Get total visits and billing
        total_visits = patient.sales.filter(status='completed').count()
        total_billing = sum(sale.total_amount for sale in patient.sales.filter(status='completed'))
        
        patient_data = PatientSummarySerializer(patient).data
        patient_data.update({
            'last_visit_date': latest_sale.created_at.date() if latest_sale else None,
            'total_visits': total_visits,
            'total_billing': float(total_billing),
            'latest_bill_id': latest_sale.sale_number if latest_sale else None,
            'latest_bill_amount': float(latest_sale.total_amount) if latest_sale else 0,
            'matching_bills': [
                {
                    'bill_id': sale.sale_number,
                    'amount': float(sale.total_amount),
                    'date': sale.created_at.date(),
                    'status': sale.status
                } for sale in patient.sales.filter(
                    Q(sale_number__icontains=query) if search_type in ['bill_id', 'all'] else Q()
                )[:3]  # Show max 3 matching bills
            ] if search_type in ['bill_id', 'all'] else []
        })
        patients_data.append(patient_data)
    
    return Response({'patients': patients_data})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_patient_summary(request, patient_id):
    """Get patient summary with recent activity."""
    user = request.user
    
    try:
        # Filter patient based on user's organization
        if user.role == User.SUPER_ADMIN:
            patient = Patient.objects.get(id=patient_id)
        else:
            patient = Patient.objects.get(id=patient_id, organization_id=user.organization_id)
        
        # Get recent records, prescriptions, and visits
        recent_records = patient.medical_records.all()[:5]
        recent_prescriptions = patient.prescriptions.all()[:5]
        recent_visits = patient.visits.all()[:5]
        
        return Response({
            'patient': PatientSerializer(patient).data,
            'recent_records': MedicalRecordSerializer(recent_records, many=True).data,
            'recent_prescriptions': PatientPrescriptionSerializer(recent_prescriptions, many=True).data,
            'recent_visits': PatientVisitSerializer(recent_visits, many=True).data,
        })
    
    except Patient.DoesNotExist:
        return Response({
            'error': 'Patient not found.'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_patient_credit_status(request, patient_id):
    """Enable or disable credit for a patient."""
    try:
        user = request.user

        # Get patient based on user's permissions - support both ID and patient_id
        if user.role == User.SUPER_ADMIN:
            try:
                # Try by ID first
                patient = Patient.objects.get(id=int(patient_id))
            except (ValueError, Patient.DoesNotExist):
                # Try by patient_id
                patient = Patient.objects.get(patient_id=patient_id)
        else:
            try:
                # Try by ID first
                patient = Patient.objects.get(id=int(patient_id), organization_id=user.organization_id)
            except (ValueError, Patient.DoesNotExist):
                # Try by patient_id
                patient = Patient.objects.get(patient_id=patient_id, organization_id=user.organization_id)

        credit_allowed = request.data.get('credit_allowed', False)
        credit_limit = request.data.get('credit_limit', 0)

        # Validate required information before allowing credit
        if credit_allowed:
            # Check if phone and address are provided
            if not patient.phone or not patient.address:
                return Response({
                    'error': 'Phone number and address are required before enabling credit.',
                    'missing_fields': {
                        'phone': not bool(patient.phone),
                        'address': not bool(patient.address)
                    }
                }, status=status.HTTP_400_BAD_REQUEST)

            # Validate credit limit
            if credit_limit <= 0:
                return Response({
                    'error': 'Credit limit must be greater than 0.'
                }, status=status.HTTP_400_BAD_REQUEST)

        # Update credit status
        patient.credit_allowed = credit_allowed
        patient.credit_limit = credit_limit

        # If disabling credit, ensure no outstanding balance
        if not credit_allowed:
            # Check if patient has outstanding credit
            from pos.models import Sale
            outstanding_credit = Sale.objects.filter(
                patient=patient,
                credit_amount__gt=0,
                status='completed'
            ).aggregate(total=models.Sum('credit_amount'))['total'] or 0

            if outstanding_credit > 0:
                return Response({
                    'error': f'Cannot disable credit. Patient has outstanding balance of NPR {outstanding_credit}.'
                }, status=status.HTTP_400_BAD_REQUEST)

            patient.credit_limit = 0

        patient.save()

        return Response({
            'success': True,
            'message': f'Credit {"enabled" if credit_allowed else "disabled"} for patient.',
            'credit_allowed': patient.credit_allowed,
            'credit_limit': float(patient.credit_limit),
            'current_credit_balance': float(patient.current_credit_balance)
        })

    except Patient.DoesNotExist:
        return Response({
            'error': 'Patient not found.'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_next_patient_numbers(request):
    """Get next available patient numbers for organization and branch."""
    user = request.user
    org_id = user.organization_id
    branch_id = user.branch_id

    org_prefix = f"ORG{org_id:03d}"
    branch_prefix = f"BR{branch_id:02d}" if branch_id else "BR00"

    # Get next organization patient number
    last_org_patient = Patient.objects.filter(
        organization_id=org_id,
        patient_id__startswith=org_prefix
    ).order_by('-patient_id').first()

    if last_org_patient:
        try:
            last_num = int(last_org_patient.patient_id.split('-P')[1])
            next_org_num = last_num + 1
        except (ValueError, IndexError):
            next_org_num = 1
    else:
        next_org_num = 1

    # Get next branch patient number
    if branch_id:
        last_branch_patient = Patient.objects.filter(
            organization_id=org_id,
            branch_id=branch_id,
            patient_id__startswith=f"{org_prefix}-{branch_prefix}"
        ).order_by('-patient_id').first()

        if last_branch_patient:
            try:
                last_num = int(last_branch_patient.patient_id.split('-P')[1])
                next_branch_num = last_num + 1
            except (ValueError, IndexError):
                next_branch_num = 1
        else:
            next_branch_num = 1

        branch_number = f"{org_prefix}-{branch_prefix}-P{next_branch_num:03d}"
    else:
        branch_number = f"{org_prefix}-P{next_org_num:03d}"

    return Response({
        'org_number': f"{org_prefix}-P{next_org_num:03d}",
        'branch_number': branch_number,
        'organization_id': org_id,
        'branch_id': branch_id
    })