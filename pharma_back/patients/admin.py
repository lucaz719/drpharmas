from django.contrib import admin
from .models import Patient, MedicalRecord, PatientPrescription, PatientVisit


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ['patient_id', 'get_full_name', 'age', 'gender', 'phone', 'status', 'created_at']
    list_filter = ['status', 'gender', 'organization_id', 'created_at']
    search_fields = ['patient_id', 'first_name', 'last_name', 'phone', 'email']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('patient_id', 'first_name', 'last_name', 'date_of_birth', 'gender')
        }),
        ('Contact Information', {
            'fields': ('phone', 'email', 'address', 'city', 'state', 'postal_code', 'country')
        }),
        ('Emergency Contact', {
            'fields': ('emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship')
        }),
        ('Medical Information', {
            'fields': ('blood_group', 'allergies', 'chronic_conditions', 'current_medications')
        }),
        ('Insurance', {
            'fields': ('insurance_provider', 'insurance_number', 'insurance_expiry')
        }),
        ('Organization', {
            'fields': ('organization_id', 'branch_id', 'status')
        }),
        ('Preferences', {
            'fields': ('preferred_language', 'marketing_consent', 'sms_notifications', 'email_notifications')
        }),
        ('Audit', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(MedicalRecord)
class MedicalRecordAdmin(admin.ModelAdmin):
    list_display = ['record_id', 'patient', 'record_type', 'title', 'doctor_name', 'record_date', 'status']
    list_filter = ['record_type', 'status', 'record_date', 'created_at']
    search_fields = ['record_id', 'patient__first_name', 'patient__last_name', 'title', 'doctor_name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('record_id', 'patient', 'record_type', 'title', 'description')
        }),
        ('Medical Details', {
            'fields': ('symptoms', 'diagnosis', 'treatment_plan', 'medications_prescribed', 'follow_up_date')
        }),
        ('Doctor Information', {
            'fields': ('doctor_name', 'doctor_license', 'doctor_signature')
        }),
        ('Status', {
            'fields': ('status', 'record_date')
        }),
        ('Audit', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(PatientPrescription)
class PatientPrescriptionAdmin(admin.ModelAdmin):
    list_display = ['prescription_id', 'patient', 'doctor_name', 'prescription_date', 'valid_until', 'status']
    list_filter = ['status', 'prescription_date', 'valid_until', 'created_at']
    search_fields = ['prescription_id', 'patient__first_name', 'patient__last_name', 'doctor_name']
    readonly_fields = ['created_at', 'updated_at', 'days_until_expiry']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('prescription_id', 'patient', 'medical_record')
        }),
        ('Doctor Information', {
            'fields': ('doctor_name', 'doctor_license')
        }),
        ('Prescription Details', {
            'fields': ('medications', 'notes')
        }),
        ('Dates', {
            'fields': ('prescription_date', 'valid_until', 'days_until_expiry')
        }),
        ('Status', {
            'fields': ('status',)
        }),
        ('Audit', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(PatientVisit)
class PatientVisitAdmin(admin.ModelAdmin):
    list_display = ['visit_id', 'patient', 'visit_type', 'visit_date', 'status']
    list_filter = ['visit_type', 'status', 'visit_date', 'created_at']
    search_fields = ['visit_id', 'patient__first_name', 'patient__last_name', 'chief_complaint']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('visit_id', 'patient', 'visit_type', 'visit_date')
        }),
        ('Visit Details', {
            'fields': ('duration_minutes', 'chief_complaint', 'notes')
        }),
        ('Status', {
            'fields': ('status',)
        }),
        ('Audit', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )