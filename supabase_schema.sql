-- SUPABASE POSTGRESQL SCHEMA FOR TAILORING MANAGEMENT SYSTEM (TMS)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clean existing structures if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS place_order_transaction(UUID, TIMESTAMP WITH TIME ZONE, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, TEXT, TEXT, UUID, JSONB);
DROP TABLE IF EXISTS staff_payouts;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS inventory_fabrics;
DROP TABLE IF EXISTS customer_measurements;
DROP TABLE IF EXISTS measurement_templates;
DROP TABLE IF EXISTS customer_activity_logs CASCADE;
DROP TABLE IF EXISTS customer_images CASCADE;
DROP TABLE IF EXISTS customer_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS customer_notes CASCADE;
DROP TABLE IF EXISTS customer_preferences CASCADE;
DROP TABLE IF EXISTS customer_addresses CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS profiles;
DROP TYPE IF EXISTS payout_status;
DROP TYPE IF EXISTS task_type;
DROP TYPE IF EXISTS payment_method_type;
DROP TYPE IF EXISTS item_status;
DROP TYPE IF EXISTS fabric_source_type;
DROP TYPE IF EXISTS order_status;
DROP TYPE IF EXISTS action_type;
DROP TYPE IF EXISTS image_type;
DROP TYPE IF EXISTS note_priority;
DROP TYPE IF EXISTS customer_status_enum;
DROP TYPE IF EXISTS customer_category;
DROP TYPE IF EXISTS customer_gender;
DROP TYPE IF EXISTS user_role;

-- 1. Create Enums
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'receptionist', 'tailor', 'sales', 'cutter', 'stitcher', 'customer');
CREATE TYPE customer_gender AS ENUM ('male', 'female', 'other');
CREATE TYPE customer_category AS ENUM ('regular', 'vip', 'corporate');
CREATE TYPE customer_status_enum AS ENUM ('active', 'inactive', 'vip', 'new');
CREATE TYPE note_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE image_type AS ENUM ('clothing', 'design');
CREATE TYPE action_type AS ENUM ('created', 'updated', 'deleted', 'measurement_updated', 'order_placed', 'payment_received', 'design_uploaded', 'clothes_uploaded', 'note_added', 'order_delivered');
CREATE TYPE order_status AS ENUM ('draft', 'booked', 'in_cutting', 'in_stitching', 'ready_for_trial', 'ready_for_pickup', 'completed', 'cancelled');
CREATE TYPE item_status AS ENUM ('pending', 'cutting', 'stitching', 'ready_for_trial', 'ready_for_pickup', 'completed');
CREATE TYPE fabric_source_type AS ENUM ('in_store', 'customer_provided');
CREATE TYPE payment_method_type AS ENUM ('cash', 'card', 'bank_transfer', 'mobile_wallet');
CREATE TYPE task_type AS ENUM ('cutting', 'stitching');
CREATE TYPE payout_status AS ENUM ('pending', 'paid');

-- 2. Create Profiles Table (extends Supabase Auth)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'sales',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create Customers Table and Related Normalized Tables
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id TEXT UNIQUE, -- e.g. "CUST-1001"
    full_name TEXT NOT NULL,
    father_or_husband_name TEXT,
    phone TEXT NOT NULL,
    alt_phone TEXT,
    whatsapp TEXT,
    email TEXT,
    gender customer_gender DEFAULT 'male',
    dob DATE,
    cnic TEXT,
    category customer_category DEFAULT 'regular',
    occupation TEXT,
    language TEXT,
    nationality TEXT,
    status customer_status_enum DEFAULT 'new',
    is_vip BOOLEAN DEFAULT false,
    photo_url TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE customer_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    country TEXT DEFAULT 'Pakistan',
    province TEXT,
    city TEXT,
    area TEXT,
    street_address TEXT NOT NULL,
    postal_code TEXT,
    google_maps_url TEXT,
    lat NUMERIC(10, 8),
    lng NUMERIC(11, 8),
    is_primary BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE customer_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL UNIQUE,
    contact_method TEXT DEFAULT 'phone',
    delivery_preference TEXT DEFAULT 'pickup',
    payment_preference TEXT DEFAULT 'cash',
    special_preferences TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE customer_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    priority note_priority DEFAULT 'medium',
    is_pinned BOOLEAN DEFAULT false,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    color TEXT
);

CREATE TABLE customer_tags (
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (customer_id, tag_id)
);

CREATE TABLE customer_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    name TEXT NOT NULL,
    image_type image_type NOT NULL,
    category TEXT NOT NULL,
    size_bytes BIGINT,
    uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE customer_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action_type action_type NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Create Measurement Templates Table
CREATE TABLE measurement_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE, -- e.g., 'Shirt', 'Trouser', 'Suit'
    fields JSONB NOT NULL, -- Array of objects: { name: string, label: string, unit: 'in'|'cm', group: string }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Create Customer Measurements Table
CREATE TABLE customer_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    template_id UUID REFERENCES measurement_templates(id) ON DELETE RESTRICT NOT NULL,
    measurements JSONB NOT NULL, -- Key-value pairs matching fields (e.g. {"chest": 42.5, "waist": 36})
    version INT NOT NULL DEFAULT 1,
    notes TEXT,
    recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(customer_id, template_id, version)
);

-- 6. Create Inventory Fabrics Table
CREATE TABLE inventory_fabrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE, -- SKU code e.g. 'FAB-LINEN-001'
    name TEXT NOT NULL,
    brand TEXT,
    color TEXT,
    pattern TEXT, -- e.g. Solid, Checkered, Stripes
    quantity_meters NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    min_threshold_meters NUMERIC(10, 2) NOT NULL DEFAULT 5.00,
    price_per_meter NUMERIC(10, 2) NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. Create Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number SERIAL UNIQUE, -- Sequential user-friendly order number
    customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT NOT NULL,
    status order_status NOT NULL DEFAULT 'draft',
    order_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_delivery_date TIMESTAMP WITH TIME ZONE,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tax NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_by UUID REFERENCES profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. Create Order Items Table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    garment_type TEXT NOT NULL, -- e.g. 'Shirt', 'Trouser'
    measurement_snapshot JSONB NOT NULL, -- Snapshot of custom measurements at booking time
    fabric_source fabric_source_type NOT NULL DEFAULT 'customer_provided',
    fabric_id UUID REFERENCES inventory_fabrics(id) ON DELETE RESTRICT,
    fabric_qty_used NUMERIC(10, 2), -- fabric length consumed in meters
    style_details JSONB NOT NULL, -- Cuff, Collar, Pleats, Pockets details
    unit_price NUMERIC(10, 2) NOT NULL,
    status item_status NOT NULL DEFAULT 'pending',
    assigned_cutter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_stitcher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    cutting_completed_at TIMESTAMP WITH TIME ZONE,
    stitching_completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. Create Payments Table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    payment_method payment_method_type NOT NULL,
    recorded_by UUID REFERENCES profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 10. Create Staff Payouts Table
CREATE TABLE staff_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
    order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE NOT NULL,
    task_type task_type NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    status payout_status NOT NULL DEFAULT 'pending',
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 11. Create Indexes for Performance
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_cutter ON order_items(assigned_cutter_id) WHERE assigned_cutter_id IS NOT NULL;
CREATE INDEX idx_order_items_stitcher ON order_items(assigned_stitcher_id) WHERE assigned_stitcher_id IS NOT NULL;
CREATE INDEX idx_measurements_customer ON customer_measurements(customer_id);

-- 12. Create Auth sync triggers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone, role, is_active)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'New Staff'),
    new.phone,
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'sales'),
    true
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 13. Create Place Order Transaction Function (RPC)
CREATE OR REPLACE FUNCTION place_order_transaction(
    p_customer_id UUID,
    p_due_date TIMESTAMP WITH TIME ZONE,
    p_subtotal NUMERIC,
    p_discount NUMERIC,
    p_tax NUMERIC,
    p_total_amount NUMERIC,
    p_paid_amount NUMERIC,
    p_payment_method payment_method_type,
    p_notes TEXT,
    p_created_by UUID,
    p_items JSONB -- Array of items including fabric usage details
) RETURNS UUID AS $$
DECLARE
    v_order_id UUID;
    v_item JSONB;
    v_fabric_id UUID;
    v_qty NUMERIC;
BEGIN
    -- 1. Insert Order
    INSERT INTO orders (customer_id, status, due_date, subtotal, discount, tax, total_amount, paid_amount, notes, created_by)
    VALUES (p_customer_id, 'booked', p_due_date, p_subtotal, p_discount, p_tax, p_total_amount, p_paid_amount, p_notes, p_created_by)
    RETURNING id INTO v_order_id;

    -- 2. Insert Payment (if down payment is paid)
    IF p_paid_amount > 0 THEN
        INSERT INTO payments (order_id, amount, payment_method, recorded_by)
        VALUES (v_order_id, p_paid_amount, p_payment_method, p_created_by);
    END IF;

    -- 3. Loop through order items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
        -- Extract fabric information
        v_fabric_id := NULL;
        IF v_item->>'fabric_id' IS NOT NULL AND v_item->>'fabric_id' <> '' THEN
            v_fabric_id := (v_item->>'fabric_id')::UUID;
        END IF;

        v_qty := (v_item->>'fabric_qty_used')::NUMERIC;

        -- Check fabric stock if in-store and reduce it
        IF v_item->>'fabric_source' = 'in_store' AND v_fabric_id IS NOT NULL THEN
            -- Deduct stock
            UPDATE inventory_fabrics
            SET quantity_meters = quantity_meters - v_qty
            WHERE id = v_fabric_id;

            -- Check for negative stock
            IF NOT FOUND THEN
                RAISE EXCEPTION 'Fabric stock not found or insufficient inventory';
            END IF;
        END IF;

        -- Insert Order Item
        INSERT INTO order_items (
            order_id, garment_type, measurement_snapshot, fabric_source, fabric_id, fabric_qty_used, style_details, unit_price, status
        ) VALUES (
            v_order_id,
            v_item->>'garment_type',
            v_item->'measurement_snapshot',
            (v_item->>'fabric_source')::fabric_source_type,
            v_fabric_id,
            v_qty,
            v_item->'style_details',
            (v_item->>'unit_price')::NUMERIC,
            'pending'
        );
    END LOOP;

    RETURN v_order_id;
END;
$$ LANGUAGE plpgsql;

-- 14. Insert Seed/Default Measurement Templates
INSERT INTO measurement_templates (name, fields) VALUES
(
  'Shirt',
  '[
    {"name": "length", "label": "Length", "unit": "in", "group": "Primary"},
    {"name": "shoulder", "label": "Shoulder Width", "unit": "in", "group": "Primary"},
    {"name": "sleeves", "label": "Sleeve Length", "unit": "in", "group": "Primary"},
    {"name": "collar", "label": "Collar/Neck size", "unit": "in", "group": "Primary"},
    {"name": "chest", "label": "Chest circumference", "unit": "in", "group": "Primary"},
    {"name": "waist", "label": "Waist circumference", "unit": "in", "group": "Secondary"},
    {"name": "hip", "label": "Hip circumference", "unit": "in", "group": "Secondary"},
    {"name": "armhole", "label": "Armhole depth", "unit": "in", "group": "Secondary"},
    {"name": "cuff", "label": "Cuff width", "unit": "in", "group": "Secondary"}
  ]'::jsonb
),
(
  'Trouser',
  '[
    {"name": "length", "label": "Full Length", "unit": "in", "group": "Primary"},
    {"name": "waist", "label": "Waist size", "unit": "in", "group": "Primary"},
    {"name": "hip", "label": "Hips circumference", "unit": "in", "group": "Primary"},
    {"name": "thigh", "label": "Thigh width", "unit": "in", "group": "Primary"},
    {"name": "knee", "label": "Knee width", "unit": "in", "group": "Secondary"},
    {"name": "bottom", "label": "Bottom opening", "unit": "in", "group": "Primary"},
    {"name": "inseam", "label": "Inseam", "unit": "in", "group": "Secondary"}
  ]'::jsonb
),
(
  'Suit',
  '[
    {"name": "jacket_length", "label": "Jacket Length", "unit": "in", "group": "Primary"},
    {"name": "shoulder", "label": "Shoulder Width", "unit": "in", "group": "Primary"},
    {"name": "sleeves", "label": "Sleeve Length", "unit": "in", "group": "Primary"},
    {"name": "chest", "label": "Chest size", "unit": "in", "group": "Primary"},
    {"name": "waist", "label": "Waist size", "unit": "in", "group": "Primary"},
    {"name": "hip", "label": "Hips size", "unit": "in", "group": "Secondary"},
    {"name": "cross_back", "label": "Cross Back Width", "unit": "in", "group": "Secondary"}
  ]'::jsonb
)
ON CONFLICT (name) DO UPDATE SET fields = EXCLUDED.fields;

-- 15. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurement_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_fabrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_payouts ENABLE ROW LEVEL SECURITY;

-- 16. Create RLS Policies
-- Profiles: Users read all profiles, update their own. Admins update all.
CREATE POLICY "Enable read for authenticated users" ON profiles
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable update for users own profile" ON profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Enable admin updates on profiles" ON profiles
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );


-- Customers & Measurements: Read/write for authenticated staff (Admin, Manager, Receptionist, Tailor). Customers read own.
CREATE POLICY "Enable staff access to customers" ON customers
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'receptionist', 'tailor', 'sales', 'cutter', 'stitcher'))
    );
CREATE POLICY "Enable customers to view own profile" ON customers
    FOR SELECT TO authenticated USING (
        phone = (SELECT phone FROM profiles WHERE id = auth.uid())
    );

-- Addresses
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable staff access to addresses" ON customer_addresses
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'receptionist', 'sales'))
    );

-- Preferences
ALTER TABLE customer_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable staff access to preferences" ON customer_preferences
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'receptionist', 'sales'))
    );

-- Notes
ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable staff access to notes" ON customer_notes
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'receptionist', 'sales'))
    );

-- Tags
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable staff access to tags" ON tags
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'receptionist', 'sales'))
    );

-- Customer Tags
ALTER TABLE customer_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable staff access to customer_tags" ON customer_tags
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'receptionist', 'sales'))
    );

-- Images
ALTER TABLE customer_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable staff access to images" ON customer_images
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'receptionist', 'tailor', 'sales', 'cutter', 'stitcher'))
    );

-- Activity Logs
ALTER TABLE customer_activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read logs for staff" ON customer_activity_logs
    FOR SELECT TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'receptionist', 'tailor', 'sales', 'cutter', 'stitcher'))
    );
CREATE POLICY "Enable insert logs for staff" ON customer_activity_logs
    FOR INSERT TO authenticated WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'receptionist', 'tailor', 'sales', 'cutter', 'stitcher'))
    );


CREATE POLICY "Enable staff access to measurements" ON customer_measurements
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'receptionist', 'tailor', 'sales', 'cutter', 'stitcher'))
    );
CREATE POLICY "Enable customers to view own measurements" ON customer_measurements
    FOR SELECT TO authenticated USING (
        customer_id IN (
            SELECT id FROM customers WHERE phone = (SELECT phone FROM profiles WHERE id = auth.uid())
        )
    );

-- Measurement Templates: Read for all authenticated. All access for admin.
CREATE POLICY "Enable read templates for all authenticated" ON measurement_templates
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable write templates for admin" ON measurement_templates
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Inventory: Read for all authenticated. All access for admin and sales.
CREATE POLICY "Enable read inventory for authenticated" ON inventory_fabrics
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable write inventory for admin/sales" ON inventory_fabrics
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'sales'))
    );

-- Orders, Order Items & Payments: Read for staff, read own for customer. Write for admin/sales.
CREATE POLICY "Enable staff access to orders" ON orders
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'sales', 'cutter', 'stitcher'))
    );
CREATE POLICY "Enable customer to read own orders" ON orders
    FOR SELECT TO authenticated USING (
        customer_id IN (
            SELECT id FROM customers WHERE phone = (SELECT phone FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Enable staff access to order items" ON order_items
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'sales', 'cutter', 'stitcher'))
    );
CREATE POLICY "Enable customer to read own order items" ON order_items
    FOR SELECT TO authenticated USING (
        order_id IN (
            SELECT id FROM orders WHERE customer_id IN (
                SELECT id FROM customers WHERE phone = (SELECT phone FROM profiles WHERE id = auth.uid())
            )
        )
    );

CREATE POLICY "Enable staff access to payments" ON payments
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'sales'))
    );
CREATE POLICY "Enable customer access to own payments" ON payments
    FOR SELECT TO authenticated USING (
        order_id IN (
            SELECT id FROM orders WHERE customer_id IN (
                SELECT id FROM customers WHERE phone = (SELECT phone FROM profiles WHERE id = auth.uid())
            )
        )
    );

-- Payouts: View own for cutter/stitcher. All access for admin.
CREATE POLICY "Enable staff to view own payouts" ON staff_payouts
    FOR SELECT TO authenticated USING (
        staff_id = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
CREATE POLICY "Enable admin manage payouts" ON staff_payouts
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- 17. Supabase Storage Setup
-- Note: Storage buckets must be created. This script assumes 'customer_media' exists or will be created via dashboard/API.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('customer_media', 'customer_media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for customer_media
CREATE POLICY "Public Access" ON storage.objects
    FOR SELECT USING (bucket_id = 'customer_media');

CREATE POLICY "Authenticated users can upload media" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'customer_media');

CREATE POLICY "Authenticated users can update media" ON storage.objects
    FOR UPDATE TO authenticated USING (bucket_id = 'customer_media');

CREATE POLICY "Authenticated users can delete media" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'customer_media');
