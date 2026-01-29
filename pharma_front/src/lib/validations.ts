import { z } from "zod";

// User Management Schemas
export const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  role: z.enum(["super_admin", "owner", "manager", "pharmacist", "technician", "cashier", "supplier"]),
  branchId: z.string().optional(),
  permissions: z.array(z.string()).default([]),
  status: z.enum(["active", "inactive", "pending"]).default("active"),
});

// Customer Schemas
export const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  insurance: z.string().optional(),
  allergies: z.array(z.string()).default([]),
  preferredContact: z.enum(["email", "phone", "sms"]).default("email"),
});

// Prescription Schema
export const prescriptionSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  medication: z.string().min(2, "Medication name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  prescriber: z.string().min(2, "Prescriber name is required"),
  instructions: z.string().optional(),
  refills: z.number().min(0, "Refills cannot be negative").max(12, "Maximum 12 refills allowed"),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
});

// Inventory Schemas
export const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  genericName: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  manufacturer: z.string().min(1, "Manufacturer is required"),
  strength: z.string().optional(),
  dosageForm: z.string().min(1, "Dosage form is required"),
  barcode: z.string().optional(),
  cost: z.number().min(0, "Cost cannot be negative"),
  sellingPrice: z.number().min(0, "Selling price cannot be negative"),
  minStockLevel: z.number().min(0, "Minimum stock level cannot be negative"),
  maxStockLevel: z.number().min(0, "Maximum stock level cannot be negative"),
  isControlled: z.boolean().default(false),
  requiresPrescription: z.boolean().default(false),
});

// Order Schemas
export const orderSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  orderDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  expectedDelivery: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().min(1, "Product is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    unitCost: z.number().min(0, "Unit cost cannot be negative"),
  })).min(1, "At least one item is required"),
});

// Settings Schemas
export const pharmacySettingsSchema = z.object({
  name: z.string().min(2, "Pharmacy name must be at least 2 characters"),
  licenseNumber: z.string().min(1, "License number is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Invalid email address"),
  operatingHours: z.string().min(1, "Operating hours are required"),
  taxRate: z.number().min(0, "Tax rate cannot be negative").max(100, "Tax rate cannot exceed 100%"),
  currency: z.string().min(1, "Currency is required"),
  lowStockThreshold: z.number().min(1, "Low stock threshold must be at least 1"),
});

export const securitySettingsSchema = z.object({
  twoFactorAuth: z.boolean().default(false),
  sessionTimeout: z.boolean().default(true),
  passwordMinLength: z.number().min(6, "Password must be at least 6 characters").max(50, "Password cannot exceed 50 characters"),
  requirePasswordChange: z.boolean().default(false),
  allowRememberMe: z.boolean().default(true),
});

export const notificationSettingsSchema = z.object({
  lowStockAlerts: z.boolean().default(true),
  expiryWarnings: z.boolean().default(true),
  orderUpdates: z.boolean().default(true),
  emailNotifications: z.boolean().default(false),
  smsAlerts: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
});

// Return Schemas
export const returnSchema = z.object({
  originalSaleId: z.string().min(1, "Original sale ID is required"),
  customerId: z.string().min(1, "Customer is required"),
  reason: z.string().min(5, "Return reason must be at least 5 characters"),
  refundAmount: z.number().min(0, "Refund amount cannot be negative"),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().min(1, "Product is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    reason: z.string().min(1, "Item return reason is required"),
  })).min(1, "At least one item is required"),
});

// Search and Filter Schemas
export const searchSchema = z.object({
  query: z.string().max(100, "Search query too long"),
  filters: z.record(z.string(), z.any()).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  page: z.number().min(1, "Page must be at least 1").default(1),
  limit: z.number().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").default(20),
});

export type UserFormData = z.infer<typeof userSchema>;
export type CustomerFormData = z.infer<typeof customerSchema>;
export type PrescriptionFormData = z.infer<typeof prescriptionSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type OrderFormData = z.infer<typeof orderSchema>;
export type PharmacySettingsData = z.infer<typeof pharmacySettingsSchema>;
export type SecuritySettingsData = z.infer<typeof securitySettingsSchema>;
export type NotificationSettingsData = z.infer<typeof notificationSettingsSchema>;
export type ReturnFormData = z.infer<typeof returnSchema>;
export type SearchParams = z.infer<typeof searchSchema>;