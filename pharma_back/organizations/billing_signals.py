from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from .models import OrganizationSubscription, BillingHistory

@receiver(pre_save, sender=OrganizationSubscription)
def track_plan_changes(sender, instance, **kwargs):
    """Track plan changes for billing."""
    if instance.pk:
        try:
            old_instance = OrganizationSubscription.objects.get(pk=instance.pk)
            instance._old_plan_id = old_instance.plan.id
        except OrganizationSubscription.DoesNotExist:
            instance._old_plan_id = None
    else:
        instance._old_plan_id = None

@receiver(post_save, sender=OrganizationSubscription)
def create_billing_record(sender, instance, created, **kwargs):
    """Auto-create billing records when subscription is created or updated."""
    try:
        if created:
            # New subscription - create invoice
            invoice_number = f"INV-{instance.organization.id}-{instance.id:04d}"
            BillingHistory.objects.create(
                organization=instance.organization,
                subscription=instance,
                transaction_type='invoice',
                status='pending',
                amount=Decimal(str(instance.plan.price)),
                currency='NPR',
                invoice_number=invoice_number,
                description=f'Subscription fee - {instance.plan.display_name}',
                billing_period_start=instance.start_date.date(),
                billing_period_end=instance.end_date.date(),
                due_date=instance.start_date.date() + timedelta(days=15)
            )
        else:
            # Check if plan changed
            old_plan_id = getattr(instance, '_old_plan_id', None)
            if old_plan_id and old_plan_id != instance.plan.id:
                # Plan changed - create billing record
                invoice_number = f"INV-{instance.organization.id}-{instance.id:04d}-UPG"
                BillingHistory.objects.create(
                    organization=instance.organization,
                    subscription=instance,
                    transaction_type='invoice',
                    status='pending',
                    amount=Decimal(str(instance.plan.price)),
                    currency='NPR',
                    invoice_number=invoice_number,
                    description=f'Plan change to {instance.plan.display_name}',
                    billing_period_start=timezone.now().date(),
                    billing_period_end=instance.end_date.date(),
                    due_date=timezone.now().date() + timedelta(days=15)
                )
    except Exception as e:
        print(f"Failed to create billing record: {e}")