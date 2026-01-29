from django.urls import path
from . import views

urlpatterns = [
    # Patient management
    path('', views.PatientListCreateView.as_view(), name='patient-list-create'),
    path('<str:pk>/', views.PatientDetailView.as_view(), name='patient-detail'),
    path('search/', views.search_patients, name='patient-search'),
    path('<str:patient_id>/summary/', views.get_patient_summary, name='patient-summary'),
    
    # Medical records
    path('medical-records/', views.MedicalRecordListCreateView.as_view(), name='medical-record-list-create'),
    
    # Prescriptions
    path('prescriptions/', views.PatientPrescriptionListCreateView.as_view(), name='prescription-list-create'),
    
    # Visits
    path('visits/', views.PatientVisitListCreateView.as_view(), name='visit-list-create'),
    
    # Statistics
    path('stats/', views.get_patient_stats, name='patient-stats'),
    
    # Next patient numbers
    path('next-numbers/', views.get_next_patient_numbers, name='next-patient-numbers'),

    # Credit management
    path('<str:patient_id>/credit-status/', views.update_patient_credit_status, name='update-patient-credit-status'),
]