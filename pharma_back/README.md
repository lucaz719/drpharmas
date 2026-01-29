# MediPro Pharmacy Management System - Django Backend

A comprehensive Django REST API backend for a multi-tenant pharmacy management system supporting complex user roles, inventory management, POS operations, and supplier relationships.

## System Architecture

### Multi-Tenant Design

- **Organizations**: Pharmacy chains or individual pharmacies
- **Branches**: Multiple locations under organizations
- **Users**: Role-based access with organization/branch restrictions
- **Suppliers**: Can also be pharmacy owners (dual role capability)

### User Roles & Permissions

1. **Super Admin** - System-wide administrator
2. **Pharmacy Owner** - Multi-tenant owner (can own multiple pharmacies)
3. **Branch Manager** - Manages specific pharmacy branches
4. **Senior Pharmacist** - Pharmacist with prescription management
5. **Pharmacist** - Pharmacist role
6. **Pharmacy Technician** - Technical staff for inventory
7. **Cashier** - Sales and POS staff
8. **Supplier Admin** - Supplier company administrator
9. **Sales Representative** - Supplier sales staff

## Quick Start

### Installation

1. **Clone and setup:**

```bash
cd pharmacy_backend
python -m venv .venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac
```

2. **Install dependencies:**

```bash
pip install -r requirements.txt
```

3. **Environment configuration:**

```bash
cp .env.example .env
# Edit .env with your database and email settings
```

4. **Database setup:**

```bash
python manage.py makemigrations
python manage.py migrate
```

5. **Create superuser:**

```bash
python manage.py createsuperuser
```

6. **Run server:**

```bash
python manage.py runserver
```

### Alternative: Automated Setup

```bash
python setup.py
```

## API Endpoints

### **Authentication**

- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/token/refresh/` - Refresh JWT token

### User Management

- `GET /api/auth/profile/` - Get user profile
- `PUT /api/auth/profile/` - Update user profile
- `POST /api/auth/change-password/` - Change password
- `GET /api/auth/users/` - List users
- `POST /api/auth/users/` - Create user
- `GET /api/auth/users/{id}/` - Get user details
- `PUT /api/auth/users/{id}/` - Update user
- `DELETE /api/auth/users/{id}/` - Delete user

### Organizations

- `GET /api/organizations/` - List organizations
- `POST /api/organizations/` - Create organization
- `GET /api/organizations/{id}/` - Get organization details
- `PUT /api/organizations/{id}/` - Update organization
- `DELETE /api/organizations/{id}/` - Delete organization

### Inventory

- `GET /api/inventory/products/` - List products
- `POST /api/inventory/products/` - Create product
- `GET /api/inventory/products/{id}/` - Get product details
- `PUT /api/inventory/products/{id}/` - Update product
- `DELETE /api/inventory/products/{id}/` - Delete product

### **POS (Point of Sale)**

- `GET /api/pos/sales/` - List sales
- `POST /api/pos/sales/` - Create sale
- `GET /api/pos/sales/{id}/` - Get sale details
- `GET /api/pos/customers/` - List customers
- `POST /api/pos/customers/` - Create customer

## Authentication & Authorization

### JWT Authentication

The system uses JWT (JSON Web Tokens) for authentication:

- Access tokens expire in 60 minutes
- Refresh tokens expire in 7 days
- Tokens are automatically refreshed

### Role-Based Permissions

Each user role has specific permissions:

| Role                | Permissions                                  |
| ------------------- | -------------------------------------------- |
| Super Admin         | All system permissions                       |
| Pharmacy Owner      | Organization management, multi-branch access |
| Branch Manager      | Branch management, user management           |
| Senior Pharmacist   | Prescription management, inventory control   |
| Pharmacist          | Prescription dispensing, patient care        |
| Pharmacy Technician | Inventory management, order processing       |
| Cashier             | POS operations, basic sales                  |
| Supplier Admin      | Supplier operations, client management       |
| Sales Rep           | Sales activities, client relations           |

## Database Models

### Core Models

- **User**: Custom user model with roles and permissions
- **Organization**: Multi-tenant organization entity
- **Branch**: Branch/location under organization
- **Product**: Pharmacy products and medications
- **Category**: Product categorization
- **Supplier**: Supplier/vendor management
- **Customer**: Customer/patient management
- **Sale**: POS sales transactions
- **Prescription**: Medical prescriptions
- **PurchaseOrder**: Supplier purchase orders

### Key Relationships

```
Organization (1) ──── (M) Branch
    │                       │
    ├── (M) User            ├── (M) User
    ├── (M) Product         ├── (M) StockEntry
    ├── (M) Customer        ├── (M) Sale
    ├── (M) Supplier        └── (M) Prescription
    └── (M) PurchaseOrder
```

## Configuration

### Environment Variables

```bash
# Django
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=pharmacy_db
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-password
```

### Database Setup

The system supports PostgreSQL (recommended) and SQLite:

**PostgreSQL Setup:**

```sql
CREATE DATABASE pharmacy_db;
CREATE USER pharmacy_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE pharmacy_db TO pharmacy_user;
```

## Development

### Running Tests

```bash
python manage.py test
```

### Code Formatting

```bash
black .
isort .
```

### Linting

```bash
flake8 .
```

### Creating Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

## Features

### Multi-Tenant Architecture

- Organization-based data isolation
- Branch-level operations
- User role hierarchies
- Permission-based access control

### Inventory Management

- Product catalog management
- Stock tracking by branch
- Low stock alerts
- Batch and expiry management
- Supplier integration

### POS System

- Real-time sales processing
- Customer management
- Prescription integration
- Payment processing
- Receipt generation

### Supplier Management

- Supplier directory
- Purchase order management
- Supplier performance tracking
- Dual role capability (supplier + pharmacy owner)

### User Management

- Role-based access control
- Organization/branch restrictions
- User activity tracking
- Permission management

## Security Features

- JWT authentication with refresh tokens
- Role-based permissions
- Organization-level data isolation
- CSRF protection
- SQL injection prevention
- XSS protection

## API Documentation

### **Authentication Headers**

```bash
Authorization: Bearer <access_token>
```

### **Response Format**

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### **Error Format**

```json
{
  "success": false,
  "error": "Error message",
  "details": { ... }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:

- Email: support@medipro.com
- Documentation: [API Docs](./docs/api.md)
- Issues: [GitHub Issues](https://github.com/medipro/backend/issues)
