from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.contrib.auth.models import update_last_login
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q
from .models import User
from organizations.models import Organization, Branch
from django.contrib.auth.hashers import check_password


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Login endpoint"""
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response({'error': 'Email and password are required'}, status=400)
    
    user = authenticate(request, username=email, password=password)
    
    if user:
        if user.is_active:
            refresh = RefreshToken.for_user(user)
            update_last_login(None, user)
            
            # Get organization and branch details
            organization_name = None
            branch_name = None
            
            if user.organization_id:
                try:
                    organization = Organization.objects.get(id=user.organization_id)
                    organization_name = organization.name
                except Organization.DoesNotExist:
                    pass
            
            if user.branch_id:
                try:
                    branch = Branch.objects.get(id=user.branch_id)
                    branch_name = branch.name
                except Branch.DoesNotExist:
                    pass
            
            # Format response to match frontend expectations
            return Response({
                'success': True,
                'data': {
                    'user': {
                        'id': str(user.id),
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'name': user.get_full_name(),
                        'role': user.role,
                        'role_display': user.get_role_display_name(),
                        'organization_id': user.organization_id,
                        'organization_name': organization_name,
                        'branch_id': user.branch_id,
                        'branch_name': branch_name,
                        'phone': user.phone,
                        'is_active': user.is_active,
                        'status': user.status
                    },
                    'tokens': {
                        'access': str(refresh.access_token),
                        'refresh': str(refresh)
                    }
                },
                'message': 'Login successful'
            })
        else:
            return Response({'success': False, 'error': 'Account is disabled'}, status=401)
    else:
        return Response({'success': False, 'error': 'Invalid credentials'}, status=401)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """Get current user profile with organization and branch details"""
    user = request.user
    
    # Get organization details
    organization_name = None
    organization_type = None
    if user.organization_id:
        try:
            organization = Organization.objects.get(id=user.organization_id)
            organization_name = organization.name
            organization_type = organization.get_type_display()
        except Organization.DoesNotExist:
            pass
    
    # Get branch details
    branch_name = None
    branch_type = None
    if user.branch_id:
        try:
            branch = Branch.objects.get(id=user.branch_id)
            branch_name = branch.name
            branch_type = branch.get_type_display()
        except Branch.DoesNotExist:
            pass
    
    return Response({
        'id': user.id,
        'email': user.email,
        'name': user.get_full_name(),
        'first_name': user.first_name,
        'last_name': user.last_name,
        'phone': user.phone,
        'role': user.role,
        'role_display': user.get_role_display_name(),
        'organization_id': user.organization_id,
        'organization_name': organization_name,
        'organization_type': organization_type,
        'branch_id': user.branch_id,
        'branch_name': branch_name,
        'branch_type': branch_type,
        'employee_id': user.employee_id,
        'is_active': user.is_active,
        'status': user.status,
        'date_joined': user.date_joined,
        'last_login': user.last_login
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """Logout endpoint"""
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({'message': 'Successfully logged out'})
    except Exception as e:
        return Response({'error': str(e)}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_module_permissions(request, user_id):
    """Get user module permissions"""
    try:
        from .models import UserPermission
        user = User.objects.get(id=user_id)
        
        # Get user's custom permissions
        user_permissions = set(UserPermission.objects.filter(user=user).values_list('permission', flat=True))
        
        def has_permission(perm_key):
            # Check custom permissions first
            if perm_key in user_permissions:
                return True
            # Default to False if no custom permission is set
            return False
        
        modules = [
            {
                'id': 'patients',
                'name': 'Patients',
                'has_access': has_permission('patients'),
                'sub_modules': [
                    {'id': 'pat_directory', 'name': 'Directory', 'has_access': has_permission('pat_directory')},
                    {'id': 'pat_records', 'name': 'Medical Records', 'has_access': has_permission('pat_records')},
                    {'id': 'pat_prescriptions', 'name': 'Prescriptions', 'has_access': has_permission('pat_prescriptions')},
                    {'id': 'pat_history', 'name': 'Purchase History', 'has_access': has_permission('pat_history')},
                    {'id': 'pat_reports', 'name': 'Reports', 'has_access': has_permission('pat_reports')},
                    {'id': 'pat_settings', 'name': 'Settings', 'has_access': has_permission('pat_settings')},
                ]
            },
            {
                'id': 'pos',
                'name': 'Point of Sale',
                'has_access': has_permission('pos'),
                'sub_modules': [
                    {'id': 'pos_billing', 'name': 'Billing', 'has_access': has_permission('pos_billing')},
                    {'id': 'pos_reports', 'name': 'Reports', 'has_access': has_permission('pos_reports')},
                    {'id': 'pos_settings', 'name': 'Settings', 'has_access': has_permission('pos_settings')},
                ]
            },
            {
                'id': 'inventory',
                'name': 'Inventory',
                'has_access': has_permission('inventory'),
                'sub_modules': [
                    {'id': 'inv_stock_mgmt', 'name': 'Stock Entry', 'has_access': has_permission('inv_stock_mgmt')},
                    {'id': 'inv_manage_orders', 'name': 'Manage Orders', 'has_access': has_permission('inv_manage_orders')},
                    {'id': 'inv_purchase_orders', 'name': 'Purchase Orders', 'has_access': has_permission('inv_purchase_orders')},
                    {'id': 'inv_medication_list', 'name': 'Medication List', 'has_access': has_permission('inv_medication_list')},
                    {'id': 'inv_reports', 'name': 'Reports', 'has_access': has_permission('inv_reports')},
                    {'id': 'inv_settings', 'name': 'Settings', 'has_access': has_permission('inv_settings')},
                ]
            },
            {
                'id': 'expenses',
                'name': 'Expenses',
                'has_access': has_permission('expenses'),
                'sub_modules': [
                    {'id': 'exp_tracking', 'name': 'Tracking', 'has_access': has_permission('exp_tracking')},
                    {'id': 'exp_categories', 'name': 'Categories', 'has_access': has_permission('exp_categories')},
                    {'id': 'exp_approval', 'name': 'Approval', 'has_access': has_permission('exp_approval')},
                    {'id': 'exp_reports', 'name': 'Reports', 'has_access': has_permission('exp_reports')},
                    {'id': 'exp_settings', 'name': 'Settings', 'has_access': has_permission('exp_settings')},
                ]
            },
            {
                'id': 'suppliers',
                'name': 'Suppliers',
                'has_access': has_permission('suppliers'),
                'sub_modules': [
                    {'id': 'sup_dashboard', 'name': 'Dashboard', 'has_access': has_permission('sup_dashboard')},
                    {'id': 'sup_management', 'name': 'Supplier Management', 'has_access': has_permission('sup_management')},
                    {'id': 'sup_reports', 'name': 'Reports', 'has_access': has_permission('sup_reports')},
                ]
            },
            {
                'id': 'compliance',
                'name': 'Compliance',
                'has_access': has_permission('compliance'),
                'sub_modules': [
                    {'id': 'comp_dashboard', 'name': 'Dashboard', 'has_access': has_permission('comp_dashboard')},
                    {'id': 'comp_licenses', 'name': 'Licenses', 'has_access': has_permission('comp_licenses')},
                    {'id': 'comp_dda_reporting', 'name': 'DDA Reporting', 'has_access': has_permission('comp_dda_reporting')},
                    {'id': 'comp_inspections', 'name': 'Inspections', 'has_access': has_permission('comp_inspections')},
                    {'id': 'comp_drug_registers', 'name': 'Drug Registers', 'has_access': has_permission('comp_drug_registers')},
                    {'id': 'comp_tracking', 'name': 'Tracking', 'has_access': has_permission('comp_tracking')},
                ]
            },
            {
                'id': 'network',
                'name': 'Network',
                'has_access': has_permission('network'),
                'sub_modules': [
                    {'id': 'net_branches', 'name': 'Branches', 'has_access': has_permission('net_branches')},
                    {'id': 'net_users', 'name': 'Users', 'has_access': has_permission('net_users')},
                    {'id': 'net_reports', 'name': 'Reports', 'has_access': has_permission('net_reports')},
                    {'id': 'net_settings', 'name': 'Settings', 'has_access': has_permission('net_settings')},
                ]
            },
            {
                'id': 'customers',
                'name': 'Customers',
                'has_access': has_permission('customers'),
                'sub_modules': [
                    {'id': 'cust_directory', 'name': 'Directory', 'has_access': has_permission('cust_directory')},
                    {'id': 'cust_prescriptions', 'name': 'Prescriptions', 'has_access': has_permission('cust_prescriptions')},
                    {'id': 'cust_loyalty', 'name': 'Loyalty Program', 'has_access': has_permission('cust_loyalty')},
                    {'id': 'cust_reports', 'name': 'Reports', 'has_access': has_permission('cust_reports')},
                    {'id': 'cust_settings', 'name': 'Settings', 'has_access': has_permission('cust_settings')},
                ]
            },
            {
                'id': 'reports',
                'name': 'Reports',
                'has_access': has_permission('reports'),
                'sub_modules': [
                    {'id': 'rep_overview', 'name': 'Overview', 'has_access': has_permission('rep_overview')},
                    {'id': 'rep_sales', 'name': 'Sales', 'has_access': has_permission('rep_sales')},
                    {'id': 'rep_inventory', 'name': 'Inventory', 'has_access': has_permission('rep_inventory')},
                    {'id': 'rep_financial', 'name': 'Financial', 'has_access': has_permission('rep_financial')},
                    {'id': 'rep_compliance', 'name': 'Compliance', 'has_access': has_permission('rep_compliance')},
                    {'id': 'rep_custom', 'name': 'Custom Reports', 'has_access': has_permission('rep_custom')},
                ]
            }
        ]
        
        return Response({
            'success': True,
            'data': {
                'modules': modules
            }
        })
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_available_modules(request):
    """Get available modules"""
    modules = [
        {'id': 'inventory', 'name': 'Inventory Management'},
        {'id': 'pos', 'name': 'Point of Sale'},
        {'id': 'prescriptions', 'name': 'Prescriptions'},
        {'id': 'users', 'name': 'User Management'},
        {'id': 'reports', 'name': 'Reports'},
    ]
    return Response({
        'success': True,
        'data': {
            'modules': modules
        }
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_user_permissions(request, user_id):
    """Update user permissions"""
    try:
        from .models import UserPermission
        user = User.objects.get(id=user_id)
        permissions = request.data.get('permissions', {})
        
        # Clear existing permissions for this user
        UserPermission.objects.filter(user=user).delete()
        
        # Save new permissions
        for permission_key, has_access in permissions.items():
            if has_access:
                UserPermission.objects.create(
                    user=user,
                    permission=permission_key,
                    granted_by=request.user
                )
        
        return Response({
            'success': True,
            'message': 'Permissions updated successfully'
        })
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_detail(request, user_id):
    """Get or update user details"""
    try:
        user = User.objects.get(id=user_id)
        
        if request.method == 'GET':
            from .serializers import UserSerializer
            serializer = UserSerializer(user)
            return Response({
                'success': True,
                'data': serializer.data
            })
        
        elif request.method == 'PUT':
            from .serializers import UserSerializer
            serializer = UserSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'success': True,
                    'data': serializer.data,
                    'message': 'User updated successfully'
                })
            else:
                return Response({
                    'success': False,
                    'errors': serializer.errors
                }, status=400)
                
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_user_password(request, user_id):
    """Change user password"""
    try:
        from django.contrib.auth.hashers import make_password
        
        user = User.objects.get(id=user_id)
        new_password = request.data.get('new_password')
        
        if not new_password:
            return Response({
                'success': False,
                'error': 'New password is required'
            }, status=400)
        
        # Update password
        user.password = make_password(new_password)
        user.plain_text_password = new_password
        user.save()
        
        return Response({
            'success': True,
            'message': 'Password updated successfully',
            'user': {
                'id': user.id,
                'plain_text_password': user.plain_text_password
            }
        })
        
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def users_list(request):
    """Get users list or create new user"""
    if request.method == 'POST':
        # Create new user
        try:
            from .serializers import UserCreateSerializer, UserSerializer
            
            serializer = UserCreateSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                user = serializer.save()
                return Response({
                    'success': True,
                    'data': UserSerializer(user).data,
                    'message': 'User created successfully'
                })
            else:
                return Response({
                    'success': False,
                    'error': 'Validation failed',
                    'errors': serializer.errors
                }, status=400)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=500)
    
    # GET request - list users
    user = request.user
    role_filter = request.GET.get('role')
    branch_filter = request.GET.get('branch_id')
    organization_filter = request.GET.get('organization_id')
    external_only = request.GET.get('external_only', 'false').lower() == 'true'
    search = request.GET.get('search', '')
    
    if user.role == 'super_admin':
        users = User.objects.all()
        # For super admin, allow filtering by specific organization
        if organization_filter:
            users = users.filter(organization_id=organization_filter)
    elif external_only and role_filter == 'supplier_admin':
        # For purchase orders - get suppliers from OTHER organizations
        users = User.objects.filter(
            role='supplier_admin',
            is_active=True
        ).exclude(organization_id=user.organization_id)
    elif user.organization_id:
        users = User.objects.filter(organization_id=user.organization_id)
    else:
        users = User.objects.none()
    
    if role_filter and not external_only:
        users = users.filter(role=role_filter)
    
    # Add branch filter
    if branch_filter:
        users = users.filter(branch_id=branch_filter)
    
    if search:
        users = users.filter(
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search) |
            Q(email__icontains=search)
        )
    
    from .serializers import UserSerializer
    serializer = UserSerializer(users, many=True)
    
    return Response({
        'success': True,
        'results': serializer.data,
        'data': serializer.data,
        'count': users.count()
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_activities(request):
    """Get list of user activities (audit logs)"""
    from .models import UserActivity
    from .serializers import UserActivitySerializer
    
    user = request.user
    
    if user.role == 'super_admin':
        # Super admin can see everything
        activities = UserActivity.objects.all()
    elif user.organization_id:
        # Others can see logs within their organization
        # First find all users in the organization
        org_users = User.objects.filter(organization_id=user.organization_id)
        activities = UserActivity.objects.filter(user__in=org_users)
    else:
        activities = UserActivity.objects.none()
        
    # Optional filtering
    action = request.GET.get('action')
    if action:
        activities = activities.filter(action=action)
        
    activities = activities.order_by('-timestamp')[:100] # Limit to last 100 entries
    
    serializer = UserActivitySerializer(activities, many=True)
    return Response({
        'success': True,
        'data': serializer.data,
        'count': activities.count()
    })
