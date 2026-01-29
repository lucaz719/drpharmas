# Enhanced Purchase Order Workflow

This document describes the enhanced purchase order workflow implemented for the pharmacy system.

## Workflow Overview

The enhanced workflow supports the complete purchase order lifecycle from initial order to final delivery and payment settlement.

### Status Flow

1. **DRAFT** → **SUBMITTED** (Buyer creates and submits order)
2. **SUBMITTED** → **SUPPLIER_CONFIRMED** (Supplier confirms with pricing)
3. **SUPPLIER_CONFIRMED** → **BUYER_RECONFIRMING** (Buyer reviews and can modify)
4. **BUYER_RECONFIRMING** → **PAYMENT_PENDING/PARTIAL/COMPLETED** (Buyer proceeds with payment)
5. **PAYMENT_COMPLETED** → **READY_TO_SHIP** (Ready for shipping)
6. **READY_TO_SHIP** → **SHIPPED** (Supplier ships order)
7. **SHIPPED** → **DELIVERED** (Order delivered)
8. **DELIVERED** → **COMPLETED** (Final settlement)

## Key Features

### 1. Supplier Confirmation
- Supplier can confirm quantities and set prices
- Supplier can mark items as unavailable
- Supplier adds notes for each item

### 2. Buyer Reconfirmation
- Buyer can review supplier's quote
- Buyer can reduce quantities (cannot increase)
- Buyer can cancel specific items
- Buyer can add reconfirmation notes

### 3. Payment Management
- Support for installment payments
- Mixed payment methods (cash + online + credit)
- Payment tracking with remaining amounts
- Final payment settlement on delivery

### 4. Shipping & Delivery
- Supplier updates shipping details
- Tracking number support
- Delivery confirmation by both parties
- Final account adjustment

## API Endpoints

### Purchase Order Management
- `GET /inventory/purchase-orders/manage/` - List orders with enhanced details
- `POST /inventory/purchase-orders/<id>/reconfirm/` - Buyer reconfirms order
- `POST /inventory/purchase-orders/<id>/proceed/` - Buyer proceeds with payment
- `POST /inventory/purchase-orders/<id>/payment/` - Record installment payment
- `POST /inventory/purchase-orders/<id>/ship/` - Supplier ships order
- `POST /inventory/purchase-orders/<id>/deliver/` - Mark as delivered

### Existing Endpoints (Enhanced)
- `GET /inventory/purchase-orders/` - List purchase orders
- `GET /inventory/bulk-orders/<id>/` - Get order details
- `POST /inventory/supplier/orders/<id>/update/` - Supplier confirms order

## Usage Examples

### 1. Supplier Confirms Order
```json
POST /inventory/supplier/orders/123/update/
{
  "action": "confirm",
  "supplier_notes": "All items available, prices updated",
  "items": [
    {
      "id": 1,
      "quantity_confirmed": 100,
      "unit_price": 25.50,
      "is_available": true,
      "supplier_notes": "Fresh stock available"
    }
  ]
}
```

### 2. Buyer Reconfirms with Modifications
```json
POST /inventory/purchase-orders/123/reconfirm/
{
  "action": "reconfirm",
  "buyer_reconfirm_notes": "Reducing quantity due to budget constraints",
  "items": [
    {
      "id": 1,
      "quantity_final": 80,
      "is_cancelled": false,
      "buyer_reconfirm_notes": "Reduced from 100 to 80"
    }
  ]
}
```

### 3. Record Installment Payment
```json
POST /inventory/purchase-orders/123/payment/
{
  "amount": 1000.00,
  "payment_method": "mixed",
  "cash_amount": 500.00,
  "online_amount": 500.00,
  "credit_amount": 0.00,
  "notes": "First installment payment"
}
```

### 4. Ship Order
```json
POST /inventory/purchase-orders/123/ship/
{
  "shipping_method": "Express Delivery",
  "tracking_number": "TRK123456789",
  "shipping_notes": "Fragile items packed separately"
}
```

### 5. Final Delivery with Settlement
```json
POST /inventory/purchase-orders/123/deliver/
{
  "action": "delivered",
  "delivery_notes": "All items delivered in good condition",
  "final_payment": {
    "amount": 500.00,
    "payment_method": "cash",
    "cash_amount": 500.00,
    "notes": "Final settlement payment"
  }
}
```

## Database Changes

### New Fields in BulkOrder
- `total_paid_amount` - Track total payments made
- `remaining_amount` - Remaining amount to be paid
- `payment_status` - Payment status (pending/partial/completed)
- `buyer_reconfirm_notes` - Buyer's reconfirmation notes
- `delivery_notes` - Final delivery notes
- `can_modify_items` - Whether buyer can still modify items
- `supplier_locked` - Whether supplier has locked their response

### New Fields in BulkOrderItem
- `quantity_final` - Final quantity after buyer reconfirmation
- `is_cancelled` - Whether item was cancelled by buyer
- `buyer_reconfirm_notes` - Buyer's notes for this item

### Enhanced BulkOrderPayment
- `installment_number` - Payment installment number
- `is_final_payment` - Whether this is the final payment
- `cash_amount` - Cash portion of payment
- `online_amount` - Online portion of payment
- `credit_amount` - Credit portion of payment

## Frontend Integration

The frontend should handle the workflow states and provide appropriate UI for each stage:

1. **Supplier Dashboard**: Show pending orders for confirmation
2. **Buyer Dashboard**: Show orders at different stages
3. **Payment Interface**: Support installment payments
4. **Shipping Tracker**: Track order progress
5. **Settlement Interface**: Handle final payments

## Security & Permissions

- Only suppliers can confirm orders and ship
- Only buyers can reconfirm, make payments, and confirm receipt
- Status transitions are validated
- All actions are logged in BulkOrderStatusLog