from rest_framework import serializers
from .models import Patient, MedicalRecord, PatientPrescription, PatientVisit


class PatientSerializer(serializers.ModelSerializer):
    """Serializer for Patient model."""
    full_name = serializers.CharField(read_only=True)
    age = serializers.IntegerField(read_only=True)
    full_address = serializers.CharField(read_only=True)

    class Meta:
        model = Patient
        fields = [
            'id', 'patient_id', 'first_name', 'last_name', 'full_name',
            'date_of_birth', 'age', 'gender', 'phone', 'email',
            'address', 'city', 'state', 'postal_code', 'country', 'full_address',
            'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship',
            'blood_group', 'allergies', 'chronic_conditions', 'current_medications',
            'insurance_provider', 'insurance_number', 'insurance_expiry',
            'status', 'organization_id', 'branch_id',
            'credit_allowed', 'credit_limit', 'current_credit_balance',
            'preferred_language', 'marketing_consent', 'sms_notifications', 'email_notifications',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PatientCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new patients."""

    class Meta:
        model = Patient
        fields = [
            'first_name', 'last_name', 'date_of_birth', 'gender',
            'phone', 'email', 'address', 'city', 'state', 'postal_code', 'country',
            'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship',
            'blood_group', 'allergies', 'chronic_conditions', 'current_medications',
            'insurance_provider', 'insurance_number', 'insurance_expiry',
            'organization_id', 'branch_id',
            'preferred_language', 'marketing_consent', 'sms_notifications', 'email_notifications'
        ]
    
    def validate_patient_id(self, value):
        """Validate patient ID uniqueness within organization."""
        organization_id = self.initial_data.get('organization_id')
        if Patient.objects.filter(patient_id=value, organization_id=organization_id).exists():
            raise serializers.ValidationError("Patient ID already exists in this organization.")
        return value


class MedicalRecordSerializer(serializers.ModelSerializer):
    """Serializer for Medical Record model."""
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    patient_id = serializers.CharField(source='patient.patient_id', read_only=True)
    
    class Meta:
        model = MedicalRecord
        fields = [
            'id', 'record_id', 'patient', 'patient_name', 'patient_id',
            'record_type', 'title', 'description', 'symptoms', 'diagnosis',
            'treatment_plan', 'medications_prescribed', 'follow_up_date',
            'doctor_name', 'doctor_license', 'doctor_signature',
            'status', 'record_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PatientPrescriptionSerializer(serializers.ModelSerializer):
    """Serializer for Patient Prescription model."""
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    patient_id = serializers.CharField(source='patient.patient_id', read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    days_until_expiry = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = PatientPrescription
        fields = [
            'id', 'prescription_id', 'patient', 'patient_name', 'patient_id',
            'medical_record', 'doctor_name', 'doctor_license',
            'medications', 'notes', 'prescription_date', 'valid_until',
            'status', 'is_expired', 'days_until_expiry',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PatientVisitSerializer(serializers.ModelSerializer):
    """Serializer for Patient Visit model."""
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    patient_id = serializers.CharField(source='patient.patient_id', read_only=True)
    attended_by_name = serializers.CharField(source='attended_by.get_full_name', read_only=True)
    
    class Meta:
        model = PatientVisit
        fields = [
            'id', 'visit_id', 'patient', 'patient_name', 'patient_id',
            'visit_type', 'visit_date', 'purpose', 'notes',
            'total_amount', 'items_purchased',
            'attended_by', 'attended_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PatientSummarySerializer(serializers.ModelSerializer):
    """Simplified serializer for patient summaries."""
    full_name = serializers.CharField(read_only=True)
    age = serializers.IntegerField(read_only=True)
    last_visit = serializers.SerializerMethodField()
    total_visits = serializers.SerializerMethodField()
    active_prescriptions = serializers.SerializerMethodField()
    
    class Meta:
        model = Patient
        fields = [
            'id', 'patient_id', 'full_name', 'age', 'gender',
            'phone', 'email', 'status',
            'last_visit', 'total_visits', 'active_prescriptions'
        ]
    
    def get_last_visit(self, obj):
        """Get the date of the last visit."""
        last_visit = obj.visits.first()
        return last_visit.visit_date.date() if last_visit else None
    
    def get_total_visits(self, obj):
        """Get total number of visits."""
        return obj.visits.count()
    
    def get_active_prescriptions(self, obj):
        """Get number of active prescriptions."""
        return obj.prescriptions.filter(status__in=['pending', 'partial']).count()


class PatientStatsSerializer(serializers.Serializer):
    """Serializer for patient statistics."""
    total_patients = serializers.IntegerField()
    active_patients = serializers.IntegerField()
    new_patients_this_month = serializers.IntegerField()
    average_age = serializers.FloatField()
    gender_distribution = serializers.DictField()
    top_medications = serializers.ListField()
    monthly_visits = serializers.ListField()