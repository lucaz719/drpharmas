# Quick fix for supplier ledger issue
# The problem: supplier name "Agro" doesn't match "Supplier Agro" in database

# Add this to supplier_ledger_detail_by_name function:

def improved_supplier_matching(supplier_name):
    """Improved supplier name matching"""
    # Try exact match first
    user_supplier = User.objects.filter(
        role='supplier_admin',
        is_active=True
    ).filter(
        Q(first_name__iexact=supplier_name) |
        Q(last_name__iexact=supplier_name) |
        Q(email__iexact=supplier_name)
    ).first()
    
    if user_supplier:
        return user_supplier
    
    # Try partial match
    user_supplier = User.objects.filter(
        role='supplier_admin',
        is_active=True
    ).filter(
        Q(first_name__icontains=supplier_name) |
        Q(last_name__icontains=supplier_name) |
        Q(email__icontains=supplier_name)
    ).first()
    
    if user_supplier:
        return user_supplier
    
    # Try full name match
    all_suppliers = User.objects.filter(role='supplier_admin', is_active=True)
    for s in all_suppliers:
        full_name = s.get_full_name()
        if supplier_name.lower() in full_name.lower() or full_name.lower() in supplier_name.lower():
            return s
    
    return None

# Replace the existing user_supplier lookup with:
# user_supplier = improved_supplier_matching(supplier_name)