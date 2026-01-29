from django.db import models
from django.conf import settings
from organizations.models import Organization

class ExpenseCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    budget = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    color = models.CharField(max_length=20, default='blue')
    is_active = models.BooleanField(default=True)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['name', 'organization']
        ordering = ['name']

    def __str__(self):
        return f"{self.name} - {self.organization.name}"

    @property
    def spent(self):
        return self.expenses.aggregate(total=models.Sum('amount'))['total'] or 0

    @property
    def transactions(self):
        return self.expenses.count()

    @property
    def remaining(self):
        return self.budget - self.spent

class Expense(models.Model):
    category = models.ForeignKey(ExpenseCategory, on_delete=models.CASCADE, related_name='expenses')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    receipt = models.FileField(upload_to='expenses/receipts/', blank=True, null=True)
    pharmacy = models.CharField(max_length=100)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.category.name} - NPR {self.amount}"

class InventoryLoss(models.Model):
    LOSS_REASONS = [
        ('expired', 'Expired'),
        ('damaged', 'Damaged'),
        ('theft', 'Theft'),
        ('breakage', 'Breakage'),
        ('quality_issue', 'Quality Issue'),
        ('other', 'Other'),
    ]

    item_name = models.CharField(max_length=200)
    batch_no = models.CharField(max_length=100, blank=True, null=True)
    quantity = models.IntegerField()
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2)
    total_loss = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.CharField(max_length=20, choices=LOSS_REASONS)
    pharmacy = models.CharField(max_length=100)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        self.total_loss = self.quantity * self.unit_cost
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.item_name} - NPR {self.total_loss}"