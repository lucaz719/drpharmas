# Supplier Admin Permissions Fix

## Issue Description

The supplier admin users were experiencing a permissions issue where:

1. **Permissions were being saved correctly** - The API call to update permissions returned success (200 OK) and showed the correct permissions being saved
2. **Permissions were reverting on page refresh** - After refreshing the page, the user's permissions would revert to their default role-based permissions instead of the custom saved permissions

## Root Cause Analysis

The issue was in the `get_user_module_permissions` function in `accounts/views.py`. The function had different logic paths for different user roles:

### For Supplier Admin Users (BEFORE FIX):
```python
elif target_user.role in [User.SUPPLIER_ADMIN, User.SALES_REPRESENTATIVE]:
    # This code was ONLY checking role-based permissions
    # It completely ignored any custom permissions saved in UserPermission table
    for module_id, module_data in MODULE_PERMISSIONS.items():
        if target_user.role.upper() in module_data['roles']:
            available_modules[module_id] = module_data
```

### For Other Users:
```python
else:
    # This code correctly checked for custom permissions first
    # Then fell back to role-based permissions if no custom permissions existed
```

## The Fix

Updated the supplier admin logic to match the pattern used for other users:

### For Supplier Admin Users (AFTER FIX):
```python
elif target_user.role in [User.SUPPLIER_ADMIN, User.SALES_REPRESENTATIVE]:
    # Check if user has custom permissions saved
    if user_permissions:
        # User has custom permissions, build modules based on those permissions
        for module_id, module_data in MODULE_PERMISSIONS.items():
            if target_user.role.upper() in module_data['roles']:
                # Create a filtered version of this module with only user's sub-modules
                filtered_sub_modules = {}
                for sub_module_id, sub_module_name in module_data['sub_modules'].items():
                    if sub_module_id in user_permissions:
                        filtered_sub_modules[sub_module_id] = sub_module_name

                # Only include module if user has at least one sub-module permission
                if filtered_sub_modules:
                    available_modules[module_id] = {
                        'name': module_data['name'],
                        'sub_modules': filtered_sub_modules,
                        'roles': module_data['roles']
                    }
    else:
        # No custom permissions, use role-based defaults
        for module_id, module_data in MODULE_PERMISSIONS.items():
            if target_user.role.upper() in module_data['roles']:
                available_modules[module_id] = module_data
```

## Files Modified

1. **`accounts/views.py`**:
   - Fixed `get_user_module_permissions` function to respect custom permissions for supplier admins
   - Fixed `get_available_modules` function to respect custom permissions for supplier admins
   - Removed debug print statements

2. **`test_permissions_fix.py`** (NEW):
   - Created test script to verify the fix works correctly

## Testing the Fix

### Manual Testing Steps:
1. Log in as a pharmacy owner
2. Go to Network > Users
3. Find a supplier admin user
4. Click the Settings (gear) icon to open permissions dialog
5. Grant some permissions (e.g., POS, Inventory modules)
6. Click "Save Permissions"
7. **Refresh the page**
8. Open the permissions dialog again
9. **Verify that the granted permissions are still there**

### Automated Testing:
Run the test script:
```bash
cd pharmacy_backend
python test_permissions_fix.py
```

## Expected Behavior After Fix

1. **Saving permissions**: Should work as before (already working)
2. **Retrieving permissions**: Should now return the saved custom permissions instead of reverting to role-based defaults
3. **Page refresh**: Permissions should persist across page refreshes
4. **API consistency**: Both save and retrieve operations should be consistent

## Impact

- **Supplier Admin users**: Can now have custom permissions that persist across sessions
- **Other user types**: No impact (they were already working correctly)
- **Pharmacy Owners**: Can now successfully manage supplier admin permissions
- **System integrity**: Permissions are now consistently saved and retrieved

## Verification

After applying this fix:
- Supplier admin permissions will be saved correctly ✅
- Supplier admin permissions will persist after page refresh ✅
- The permissions dialog will show the correct saved permissions ✅
- No impact on other user types ✅