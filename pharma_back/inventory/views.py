# Import all views from separate modules
from .views.medication_views import *
from .views.stock_entry_views import *
from .views.purchase_order_views import *
from .views.additional_purchase_views import *
from .views.supplier_ledger_views import *
from .views.missing_views import *
from .views.supplier_dashboard_views import *
from .views.custom_supplier_views import *

# Import rack views individually
from .views.rack_views import (
    rack_list_create, rack_detail, rack_sections,
    assign_medicine_to_section, remove_medicine_from_section
)

# All view functions are now imported from separate modules