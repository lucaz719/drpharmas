from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count
from .models import ExpenseCategory, Expense, InventoryLoss
from .serializers import ExpenseCategorySerializer, ExpenseSerializer, InventoryLossSerializer

class ExpenseCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseCategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        from organizations.models import Organization
        try:
            organization = Organization.objects.get(id=self.request.user.organization_id)
            return ExpenseCategory.objects.filter(organization=organization)
        except (Organization.DoesNotExist, TypeError):
            return ExpenseCategory.objects.none()

    def perform_create(self, serializer):
        from organizations.models import Organization
        organization = Organization.objects.get(id=self.request.user.organization_id)
        serializer.save(
            organization=organization,
            created_by=self.request.user
        )

    @action(detail=False, methods=['get'])
    def stats(self, request):
        categories = self.get_queryset()
        total_budget = categories.aggregate(total=Sum('budget'))['total'] or 0
        total_spent = sum(cat.spent for cat in categories)
        avg_usage = (total_spent / total_budget * 100) if total_budget > 0 else 0
        
        return Response({
            'total_categories': categories.count(),
            'total_budget': total_budget,
            'total_spent': total_spent,
            'avg_usage': round(avg_usage, 2)
        })

class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        from organizations.models import Organization
        try:
            organization = Organization.objects.get(id=self.request.user.organization_id)
            return Expense.objects.filter(organization=organization)
        except (Organization.DoesNotExist, TypeError):
            return Expense.objects.none()

    def perform_create(self, serializer):
        from organizations.models import Organization
        organization = Organization.objects.get(id=self.request.user.organization_id)
        serializer.save(
            organization=organization,
            created_by=self.request.user
        )

class InventoryLossViewSet(viewsets.ModelViewSet):
    serializer_class = InventoryLossSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        from organizations.models import Organization
        try:
            organization = Organization.objects.get(id=self.request.user.organization_id)
            return InventoryLoss.objects.filter(organization=organization)
        except (Organization.DoesNotExist, TypeError):
            return InventoryLoss.objects.none()

    def perform_create(self, serializer):
        from organizations.models import Organization
        organization = Organization.objects.get(id=self.request.user.organization_id)
        
        # Save the inventory loss
        inventory_loss = serializer.save(
            organization=organization,
            created_by=self.request.user
        )
        
        # Reduce stock from inventory
        item_id = self.request.data.get('item_id')
        if item_id:
            try:
                from inventory.models import InventoryItem
                inventory_item = InventoryItem.objects.get(id=item_id)
                if inventory_item.quantity >= inventory_loss.quantity:
                    inventory_item.quantity -= inventory_loss.quantity
                    inventory_item.save()
                    print(f"Stock reduced: {inventory_loss.quantity} from item {item_id}")
                else:
                    print(f"Insufficient stock: available {inventory_item.quantity}, requested {inventory_loss.quantity}")
            except Exception as e:
                print(f"Error reducing stock: {e}")
        
        return inventory_loss