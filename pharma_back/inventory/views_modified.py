# Modified bulk_orders_list function
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def bulk_orders_list(request):
    """List bulk orders or create new bulk order."""
    try:
        if request.method == 'GET':
            user = request.user
            organization_id = getattr(user, 'organization_id', None)
            branch_id = getattr(user, 'branch_id', None)
            
            if not organization_id:
                return Response({'error': 'User not associated with organization'}, status=400)
            
            # Show orders based on organization/branch - both sent and received
            sent_orders_filters = {'buyer_organization_id': organization_id}
            received_orders_filters = {'supplier_organization_id': organization_id}
            
            if branch_id:
                sent_orders_filters['buyer_branch_id'] = branch_id
                received_orders_filters['supplier_branch_id'] = branch_id
            
            # Get orders where user's org is buyer OR supplier
            sent_orders = BulkOrder.objects.filter(**sent_orders_filters)
            received_orders = BulkOrder.objects.filter(**received_orders_filters)
            
            # Combine both querysets
            orders = sent_orders.union(received_orders)
            
            # Apply status filter if provided
            status_filter = request.GET.get('status')
            if status_filter:
                orders = orders.filter(status=status_filter)
            
            orders = orders.order_by('-created_at')
            
            # Add available actions to each order
            orders_data = []
            for order in orders:
                order_data = BulkOrderSerializer(order).data
                
                # Debug logging
                print(f"\n=== ORDER DEBUG ===")
                print(f"Order ID: {order.id}")
                print(f"Order Number: {order.order_number}")
                print(f"Order Status: {order.status}")
                print(f"User Role: {user.role}")
                print(f"BulkOrder.COMPLETED constant: {BulkOrder.COMPLETED}")
                print(f"Status matches COMPLETED: {order.status == BulkOrder.COMPLETED}")
                print(f"User is not supplier: {user.role != 'supplier_admin'}")
                
                # Determine available actions based on status and user role
                available_actions = []
                if user.role == 'supplier_admin':
                    print(f"User is supplier - checking for DELIVERED status")
                    if order.status == BulkOrder.DELIVERED:
                        available_actions.append('release_stock')
                        print(f"Added release_stock action")
                else:
                    print(f"User is buyer - checking for COMPLETED status")
                    if order.status == BulkOrder.COMPLETED:
                        available_actions.append('import_stock')
                        print(f"Added import_stock action")
                
                print(f"Final available_actions: {available_actions}")
                
                order_data['available_actions'] = available_actions
                orders_data.append(order_data)
            
            return Response(orders_data)
        
        elif request.method == 'POST':
            serializer = BulkOrderCreateSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                bulk_order = serializer.save()
                return Response(BulkOrderSerializer(bulk_order).data, status=201)
            return Response(serializer.errors, status=400)
    
    except Exception as e:
        print(f"Error in bulk_orders_list: {str(e)}")
        return Response({'error': str(e)}, status=500)