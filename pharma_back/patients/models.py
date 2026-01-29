from django.conf import settings
from django.core.validators import RegexValidator
from django.db import models
from django.utils.translation import gettext_lazy as _


class Patient(models.Model):
    """Patient model for managing patient information."""

    # Gender choices
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

    GENDER_CHOICES = [
        (MALE, "Male"),
        (FEMALE, "Female"),
        (OTHER, "Other"),
    ]

    # Status choices
    ACTIVE = "active"
    INACTIVE = "inactive"
    DECEASED = "deceased"

    STATUS_CHOICES = [
        (ACTIVE, "Active"),
        (INACTIVE, "Inactive"),
        (DECEASED, "Deceased"),
    ]

    # Basic Information
    patient_id = models.CharField(max_length=20, unique=True, help_text="Unique patient identifier")
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)

    # Contact Information
    phone = models.CharField(
        max_length=15,
        validators=[
            RegexValidator(
                regex=r"^(?:\+977[-]?\d{1,2}[-]?\d{6,8}|\d{10})$",
                message="Phone number must be entered in the format: '+977-1-234567' or '9801234567' (10 digits for local Nepali numbers).",
            )
        ],
    )
    email = models.EmailField(blank=True, null=True)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100, default="Nepal")
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, default="Nepal")

    # Emergency Contact
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_phone = models.CharField(max_length=15, blank=True)
    emergency_contact_relationship = models.CharField(max_length=50, blank=True)

    # Medical Information
    blood_group = models.CharField(max_length=5, blank=True)
    allergies = models.TextField(blank=True, help_text="Known allergies and reactions")
    chronic_conditions = models.TextField(blank=True, help_text="Chronic medical conditions")
    current_medications = models.TextField(blank=True, help_text="Current medications")

    # Insurance Information
    insurance_provider = models.CharField(max_length=100, blank=True)
    insurance_number = models.CharField(max_length=50, blank=True)
    insurance_expiry = models.DateField(null=True, blank=True)

    # Patient Type
    OUTPATIENT = "outpatient"
    INPATIENT = "inpatient"
    EMERGENCY = "emergency"
    REGULAR = "regular"

    PATIENT_TYPE_CHOICES = [
        (OUTPATIENT, "Outpatient"),
        (INPATIENT, "Inpatient"),
        (EMERGENCY, "Emergency"),
        (REGULAR, "Regular"),
    ]

    patient_type = models.CharField(max_length=15, choices=PATIENT_TYPE_CHOICES, default=OUTPATIENT)

    # Status and Organization
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=ACTIVE)
    organization_id = models.IntegerField(help_text="Organization this patient belongs to")
    branch_id = models.IntegerField(
        null=True, blank=True, help_text="Primary branch for this patient"
    )

    # Credit Information
    credit_allowed = models.BooleanField(default=False, help_text="Whether this patient is allowed to purchase on credit")
    credit_limit = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="Maximum credit limit for this patient")
    current_credit_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="Current outstanding credit balance")

    # Preferences
    preferred_language = models.CharField(max_length=20, default="en")
    marketing_consent = models.BooleanField(default=False)
    sms_notifications = models.BooleanField(default=True)
    email_notifications = models.BooleanField(default=True)

    # Audit Fields
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_patients",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["last_name", "first_name"]
        unique_together = ["organization_id", "patient_id"]
        verbose_name = "Patient"
        verbose_name_plural = "Patients"

    def __str__(self):
        return f"{self.get_full_name()} ({self.patient_id})"

    def get_full_name(self):
        """Return the first_name plus the last_name, with a space in between."""
        return f"{self.first_name} {self.last_name}".strip()

    @property
    def age(self):
        """Calculate age from date of birth."""
        from datetime import date

        today = date.today()
        return (
            today.year
            - self.date_of_birth.year
            - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))
        )

    @property
    def full_address(self):
        """Get full address string."""
        return f"{self.address}, {self.city}, {self.state} {self.postal_code}, {self.country}"


class MedicalRecord(models.Model):
    """Medical records for patients."""

    # Record types
    CONSULTATION = "consultation"
    PRESCRIPTION = "prescription"
    TEST_RESULT = "test_result"
    DIAGNOSIS = "diagnosis"
    TREATMENT = "treatment"

    RECORD_TYPE_CHOICES = [
        (CONSULTATION, "Consultation"),
        (PRESCRIPTION, "Prescription"),
        (TEST_RESULT, "Test Result"),
        (DIAGNOSIS, "Diagnosis"),
        (TREATMENT, "Treatment"),
    ]

    # Status choices
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

    STATUS_CHOICES = [
        (ACTIVE, "Active"),
        (COMPLETED, "Completed"),
        (CANCELLED, "Cancelled"),
    ]

    # Basic Information
    record_id = models.CharField(max_length=20, unique=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="medical_records")
    record_type = models.CharField(max_length=20, choices=RECORD_TYPE_CHOICES)
    title = models.CharField(max_length=200)
    description = models.TextField()

    # Medical Details
    symptoms = models.TextField(blank=True)
    diagnosis = models.TextField(blank=True)
    treatment_plan = models.TextField(blank=True)
    medications_prescribed = models.JSONField(default=list, blank=True)
    follow_up_date = models.DateField(null=True, blank=True)

    # Doctor Information
    doctor_name = models.CharField(max_length=100)
    doctor_license = models.CharField(max_length=50, blank=True)
    doctor_signature = models.TextField(blank=True, help_text="Digital signature or notes")

    # Status and Dates
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=ACTIVE)
    record_date = models.DateTimeField()

    # Audit Fields
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_medical_records",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-record_date"]
        verbose_name = "Medical Record"
        verbose_name_plural = "Medical Records"

    def __str__(self):
        return f"{self.title} - {self.patient.get_full_name()} ({self.record_date.date()})"


class PatientPrescription(models.Model):
    """Prescription records for patients."""

    # Status choices
    PENDING = "pending"
    PARTIAL = "partial"
    COMPLETED = "completed"
    EXPIRED = "expired"
    CANCELLED = "cancelled"

    STATUS_CHOICES = [
        (PENDING, "Pending"),
        (PARTIAL, "Partial"),
        (COMPLETED, "Completed"),
        (EXPIRED, "Expired"),
        (CANCELLED, "Cancelled"),
    ]

    # Basic Information
    prescription_id = models.CharField(max_length=20, unique=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="prescriptions")
    medical_record = models.ForeignKey(
        MedicalRecord, on_delete=models.SET_NULL, null=True, blank=True
    )

    # Doctor Information
    doctor_name = models.CharField(max_length=100)
    doctor_license = models.CharField(max_length=50, blank=True)

    # Prescription Details
    medications = models.JSONField(
        default=list, help_text="List of prescribed medications with dosage, frequency, etc."
    )
    notes = models.TextField(blank=True, help_text="Special instructions or notes")

    # Dates
    prescription_date = models.DateTimeField()
    valid_until = models.DateField()

    # Status
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=PENDING)

    # Audit Fields
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_patient_prescriptions",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-prescription_date"]
        verbose_name = "Patient Prescription"
        verbose_name_plural = "Patient Prescriptions"

    def __str__(self):
        return f"Prescription {self.prescription_id} - {self.patient.get_full_name()}"

    @property
    def days_until_expiry(self):
        """Calculate days until prescription expires."""
        from datetime import date

        today = date.today()
        if self.valid_until < today:
            return 0
        return (self.valid_until - today).days


class PatientVisit(models.Model):
    """Patient visit records."""

    # Visit types
    CONSULTATION = "consultation"
    FOLLOW_UP = "follow_up"
    EMERGENCY = "emergency"
    ROUTINE_CHECK = "routine_check"

    VISIT_TYPE_CHOICES = [
        (CONSULTATION, "Consultation"),
        (FOLLOW_UP, "Follow-up"),
        (EMERGENCY, "Emergency"),
        (ROUTINE_CHECK, "Routine Check"),
    ]

    # Status choices
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"

    STATUS_CHOICES = [
        (SCHEDULED, "Scheduled"),
        (IN_PROGRESS, "In Progress"),
        (COMPLETED, "Completed"),
        (CANCELLED, "Cancelled"),
        (NO_SHOW, "No Show"),
    ]

    # Basic Information
    visit_id = models.CharField(max_length=20, unique=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="visits")
    visit_type = models.CharField(max_length=20, choices=VISIT_TYPE_CHOICES)

    # Visit Details
    visit_date = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(default=30)
    chief_complaint = models.TextField(blank=True)
    notes = models.TextField(blank=True)

    # Status
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default=SCHEDULED)

    # Audit Fields
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_patient_visits",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-visit_date"]
        verbose_name = "Patient Visit"
        verbose_name_plural = "Patient Visits"

    def __str__(self):
        return f"{self.patient.get_full_name()} - {self.visit_type} ({self.visit_date.date()})"
