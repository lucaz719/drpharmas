# Branch Selection Implementation Test

## Summary of Changes

### Backend Changes:

1. **Updated `accounts/views.py`**:
   - Modified `UserListView.create()` method to handle branch assignment
   - Added validation to ensure branch belongs to user's organization
   - Auto-assigns to main branch if no branch specified for non-superusers

2. **Updated `organizations/views.py`**:
   - Added `create_default_branch()` function to create a default "Main Branch"
   - Function validates permissions and organization existence
   - Creates branch with organization's address details

3. **Updated `organizations/urls.py`**:
   - Added URL pattern for `create-default-branch/` endpoint

### Frontend Changes:

1. **Updated `UserManagement.tsx`**:
   - Added branch loading functionality
   - Added branch selection dropdown (hidden for superusers)
   - Added auto-creation of default branch when none exists
   - Added validation to ensure branch selection for non-superusers

2. **Updated `api.ts`**:
   - Added `createDefaultBranch()` method to organizations API

## Test Scenarios

### Scenario 1: First User Creation (No Branches Exist)
1. Login as pharmacy owner
2. Navigate to Network > Users
3. Click "Add User"
4. Fill user details
5. **Expected**: System automatically creates "Main Branch" and assigns user to it

### Scenario 2: User Creation with Existing Branches
1. Login as pharmacy owner (with existing branches)
2. Navigate to Network > Users
3. Click "Add User"
4. Fill user details
5. Select branch from dropdown
6. **Expected**: User is created and assigned to selected branch

### Scenario 3: Superuser Creation
1. Login as super admin
2. Navigate to Network > Users
3. Click "Add User"
4. Fill user details
5. **Expected**: No branch selection required, user created without branch assignment

### Scenario 4: Branch Validation
1. Login as pharmacy owner
2. Try to create user without selecting branch (when branches exist)
3. **Expected**: Validation error or auto-selection of main branch

## API Endpoints

- `POST /api/organizations/create-default-branch/` - Creates default main branch
- `POST /api/auth/users/` - Creates user with branch assignment

## Database Fields

- `User.branch_id` - Integer field linking user to branch
- `Branch.organization` - Links branch to organization
- `Branch.type` - Identifies main branch vs regular branch

## Security Considerations

- Only pharmacy owners and super admins can create default branches
- Branch assignment is validated against user's organization
- Non-superusers must have branch assignment (compulsory)
- Superusers are exempt from branch requirement

## Error Handling

- Graceful fallback if default branch creation fails
- Clear error messages for validation failures
- Auto-retry logic for branch loading
- State management for branch selection

## UI/UX Improvements

- Branch dropdown only shown for non-superusers
- Loading states for branch operations
- Informative messages about default branch creation
- Auto-selection of main branch when available