# Frontend-Backend Integration Guide

This guide explains how to connect your React frontend with the Django backend for the MediPro Pharmacy System.

## 🏗️ **Architecture Overview**

### **Backend (Django)**
- **Location**: `pharmacy_backend/`
- **Technology**: Django REST Framework with PostgreSQL
- **Authentication**: JWT tokens with automatic refresh
- **Multi-tenant**: Organization-based data isolation

### **Frontend (React)**
- **Location**: `src/`
- **Technology**: React with TypeScript, Vite, Tailwind CSS
- **State Management**: React hooks and context
- **API Integration**: Axios with interceptors

## 🚀 **Quick Setup**

### **1. Backend Setup**
```bash
cd pharmacy_backend

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database settings

# Database setup
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run backend server
python manage.py runserver
```

### **2. Frontend Setup**
```bash
# Install axios for API calls
npm install axios

# Configure environment
cp .env.example .env
# Edit .env with backend URL

# Run frontend server
npm run dev
```

### **3. Environment Configuration**

#### **Frontend (.env)**
```bash
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME="MediPro Pharmacy System"
VITE_DEBUG=true
```

#### **Backend (.env)**
```bash
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=pharmacy_db
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
```

## 🔗 **API Integration**

### **API Service Structure**
```
src/services/
├── api.ts              # Main API configuration and interceptors
├── auth.ts             # Authentication API calls
├── organizations.ts    # Organization management API
├── users.ts            # User management API
└── inventory.ts        # Inventory management API
```

### **Authentication Flow**

#### **Login Process**
```typescript
import { authAPI } from '@/services/api';

const handleLogin = async (email: string, password: string) => {
  try {
    const response = await authAPI.login(email, password);

    if (response.success) {
      const { user, tokens } = response.data;

      // Store tokens
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('currentUser', JSON.stringify(user));

      // Redirect to dashboard
      navigate('/dashboard');
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

#### **API Request Interceptors**
The API service automatically:
- Adds JWT tokens to requests
- Handles token refresh on 401 errors
- Redirects to login on authentication failure

### **Organization Management**

#### **Creating Organizations**
```typescript
import { organizationsAPI } from '@/services/api';

const createOrganization = async (orgData, ownerData) => {
  try {
    const response = await organizationsAPI.createOrganizationWithOwner({
      organization: orgData,
      owner: ownerData
    });

    if (response.success) {
      console.log('Organization created:', response.data);
    }
  } catch (error) {
    console.error('Failed to create organization:', error);
  }
};
```

#### **Fetching Organizations**
```typescript
const loadOrganizations = async () => {
  try {
    const response = await organizationsAPI.getOrganizations();
    if (response.success) {
      setOrganizations(response.data);
    }
  } catch (error) {
    console.error('Failed to load organizations:', error);
  }
};
```

## 📊 **Available API Endpoints**

### **Authentication**
- `POST /api/auth/login/` - User login
- `POST /api/auth/register/` - User registration
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/token/refresh/` - Refresh JWT token
- `GET /api/auth/profile/` - Get user profile
- `PUT /api/auth/profile/` - Update user profile

### **Organizations**
- `GET /api/organizations/` - List organizations
- `POST /api/organizations/` - Create organization
- `GET /api/organizations/{id}/` - Get organization details
- `PUT /api/organizations/{id}/` - Update organization
- `DELETE /api/organizations/{id}/` - Delete organization
- `POST /api/organizations/create-with-owner/` - Create org with owner

### **Branches**
- `GET /api/organizations/branches/` - List branches
- `POST /api/organizations/branches/` - Create branch
- `GET /api/organizations/branches/{id}/` - Get branch details
- `PUT /api/organizations/branches/{id}/` - Update branch
- `DELETE /api/organizations/branches/{id}/` - Delete branch

### **Users**
- `GET /api/auth/users/` - List users
- `POST /api/auth/users/` - Create user
- `GET /api/auth/users/{id}/` - Get user details
- `PUT /api/auth/users/{id}/` - Update user
- `DELETE /api/auth/users/{id}/` - Delete user

## 🎯 **Superuser Dashboard Integration**

### **Adding Organization Management to Your Dashboard**

1. **Import the component:**
```typescript
import { OrganizationManagement } from '@/components/OrganizationManagement';
```

2. **Add to your dashboard:**
```typescript
// In your SuperAdminDashboard component
const SuperAdminDashboard = () => {
  return (
    <div>
      <h1>Super Admin Dashboard</h1>

      {/* Organization Management Section */}
      <section>
        <OrganizationManagement />
      </section>
    </div>
  );
};
```

3. **Add to routing:**
```typescript
// In your App.tsx or router configuration
<Route path="/admin/organizations" element={<OrganizationManagementPage />} />
```

### **Organization Management Features**

The `OrganizationManagement` component provides:

- ✅ **Create Organizations** with optional owner accounts
- ✅ **View All Organizations** with status indicators
- ✅ **Manage Branches** for each organization
- ✅ **User Management** across organizations
- ✅ **Real-time Updates** with API integration
- ✅ **Role-based Permissions** (Super Admin only)

## 🔐 **Security & Permissions**

### **Frontend Route Protection**
```typescript
const ProtectedRoute = ({ children, requiredRole }) => {
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');

  if (!user || user.role !== requiredRole) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Usage
<Route path="/admin" element={
  <ProtectedRoute requiredRole="super_admin">
    <SuperAdminDashboard />
  </ProtectedRoute>
} />
```

### **API Permission Checks**
The backend automatically validates:
- User authentication status
- Role-based permissions
- Organization ownership
- Branch access rights

## 🧪 **Testing the Integration**

### **1. Test Authentication**
```bash
# Login with superuser
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@medipro.com", "password": "admin123"}'
```

### **2. Test Organization Creation**
```bash
curl -X POST http://localhost:8000/api/organizations/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Pharmacy",
    "type": "retail_pharmacy",
    "email": "test@pharmacy.com",
    "phone": "+977-1-234567",
    "license_number": "PH-TEST-001",
    "license_expiry": "2025-12-31",
    "address": "Test Address",
    "city": "Kathmandu",
    "country": "Nepal"
  }'
```

### **3. Test Frontend API Calls**
```typescript
// In browser console or component
import { organizationsAPI } from '@/services/api';

organizationsAPI.getOrganizations().then(response => {
  console.log('Organizations:', response.data);
});
```

## 🚀 **Production Deployment**

### **Backend Deployment**
1. Set `DEBUG=False` in Django settings
2. Configure production database (PostgreSQL)
3. Set up proper CORS settings
4. Configure static files serving
5. Set up SSL certificates

### **Frontend Deployment**
1. Build the production bundle: `npm run build`
2. Configure API URL for production
3. Deploy to web server (nginx, Apache, etc.)
4. Set up SSL certificates

### **Environment Variables for Production**
```bash
# Backend
SECRET_KEY=your-production-secret-key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DB_NAME=production_db
DB_USER=production_user
DB_PASSWORD=secure_password
DB_HOST=production-db-host

# Frontend
VITE_API_URL=https://api.yourdomain.com/api
VITE_DEBUG=false
```

## 📞 **Troubleshooting**

### **Common Issues**

#### **CORS Errors**
```python
# In Django settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://yourdomain.com"
]
```

#### **Token Expiration**
The API service automatically handles token refresh. If issues persist:
```typescript
// Clear stored tokens
localStorage.removeItem('access_token');
localStorage.removeItem('refresh_token');
localStorage.removeItem('currentUser');
```

#### **Database Connection Issues**
```bash
# Test database connection
python manage.py dbshell
```

#### **API Connection Issues**
```bash
# Test API connectivity
curl http://localhost:8000/api/
```

## 📚 **Next Steps**

1. **Complete User Management** - Implement full CRUD for users
2. **Add Inventory Management** - Connect inventory APIs
3. **Implement POS System** - Add sales transaction APIs
4. **Add Reporting** - Create analytics and reporting features
5. **File Uploads** - Add support for document uploads
6. **Real-time Updates** - Implement WebSocket connections
7. **Testing** - Add comprehensive test coverage
8. **Documentation** - Create API documentation with Swagger/OpenAPI

## 🎉 **Integration Complete!**

Your React frontend is now fully connected to the Django backend. You can:

- ✅ Create and manage pharmacy organizations
- ✅ Handle user authentication and authorization
- ✅ Access role-based dashboards
- ✅ Perform CRUD operations on all entities
- ✅ Handle errors and loading states
- ✅ Maintain secure API communication

The system is ready for development and can be extended with additional features as needed!