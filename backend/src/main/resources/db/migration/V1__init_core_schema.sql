CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(100) NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(40) NOT NULL UNIQUE,
    name VARCHAR(80) NOT NULL
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS taxa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES taxa(id) ON DELETE SET NULL,
    category_code VARCHAR(40) NOT NULL,
    rank_name VARCHAR(30),
    scientific_name VARCHAR(200) NOT NULL,
    korean_name VARCHAR(200),
    trade_name VARCHAR(200),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS taxon_aliases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    taxon_id UUID NOT NULL REFERENCES taxa(id) ON DELETE CASCADE,
    alias_name VARCHAR(200) NOT NULL,
    alias_type VARCHAR(30) NOT NULL DEFAULT 'COMMON',
    language_code VARCHAR(10) DEFAULT 'ko',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS taxon_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    taxon_id UUID NOT NULL REFERENCES taxa(id) ON DELETE CASCADE,
    source_name VARCHAR(150) NOT NULL,
    source_url TEXT,
    retrieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    seller_type VARCHAR(30) NOT NULL DEFAULT 'EXTERNAL_STORE',
    homepage_url TEXT,
    verification_status VARCHAR(30) NOT NULL DEFAULT 'UNVERIFIED',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    taxon_id UUID REFERENCES taxa(id) ON DELETE SET NULL,
    seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE RESTRICT,
    product_type VARCHAR(40) NOT NULL,
    title VARCHAR(300) NOT NULL,
    external_product_id VARCHAR(200),
    source_url TEXT,
    data_origin VARCHAR(30) NOT NULL DEFAULT 'MANUAL',
    last_checked_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_name VARCHAR(200),
    sex VARCHAR(20),
    life_stage VARCHAR(40),
    size_value NUMERIC(12, 3),
    size_unit VARCHAR(20),
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    quantity_unit VARCHAR(20) DEFAULT 'EA',
    grade VARCHAR(50),
    condition_type VARCHAR(40),
    price NUMERIC(14, 2) NOT NULL CHECK (price >= 0),
    shipping_fee NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'KRW',
    availability_status VARCHAR(30) NOT NULL DEFAULT 'UNKNOWN',
    variant_attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    price NUMERIC(14, 2) NOT NULL CHECK (price >= 0),
    shipping_fee NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'KRW',
    availability_status VARCHAR(30) NOT NULL,
    collection_method VARCHAR(30) NOT NULL DEFAULT 'MANUAL',
    source_label VARCHAR(200),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS enclosures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    domain_type VARCHAR(40) NOT NULL,
    dimensions_text VARCHAR(100),
    environment_meta JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS care_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enclosure_id UUID REFERENCES enclosures(id) ON DELETE SET NULL,
    taxon_id UUID REFERENCES taxa(id) ON DELETE SET NULL,
    log_type VARCHAR(40) NOT NULL,
    title VARCHAR(200),
    notes TEXT,
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aquariums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    water_type VARCHAR(20) NOT NULL DEFAULT 'FRESHWATER',
    volume_liters NUMERIC(10, 2) CHECK (volume_liters IS NULL OR volume_liters > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS specimen_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    taxon_id UUID REFERENCES taxa(id) ON DELETE SET NULL,
    specimen_code VARCHAR(100),
    condition_status VARCHAR(60),
    storage_location VARCHAR(200),
    label_meta JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS taxidermy_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    taxon_id UUID REFERENCES taxa(id) ON DELETE SET NULL,
    mount_type VARCHAR(80),
    condition_report TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS provenance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_type VARCHAR(40) NOT NULL,
    item_id UUID NOT NULL,
    origin_type VARCHAR(40),
    locality_text VARCHAR(255),
    locality_precision VARCHAR(40),
    permit_required BOOLEAN NOT NULL DEFAULT FALSE,
    permit_status VARCHAR(40) NOT NULL DEFAULT 'UNCHECKED',
    evidence_file_id UUID,
    review_status VARCHAR(40) NOT NULL DEFAULT 'PENDING',
    reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_taxa_scientific_name ON taxa (scientific_name);
CREATE INDEX IF NOT EXISTS idx_taxa_parent_id ON taxa (parent_id);
CREATE INDEX IF NOT EXISTS idx_taxa_category_code ON taxa (category_code);
CREATE INDEX IF NOT EXISTS idx_products_taxon_id ON products (taxon_id);
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products (seller_id);
CREATE INDEX IF NOT EXISTS idx_products_external_product_id ON products (external_product_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_products_seller_external_id
    ON products (seller_id, external_product_id)
    WHERE external_product_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_product_variants_price ON product_variants (price);
CREATE INDEX IF NOT EXISTS idx_product_variants_availability ON product_variants (availability_status);
CREATE INDEX IF NOT EXISTS idx_product_variants_attrs_gin ON product_variants USING GIN (variant_attributes);
CREATE INDEX IF NOT EXISTS idx_price_history_variant_recorded_desc
    ON price_history (product_variant_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_care_logs_owner_recorded_desc
    ON care_logs (owner_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_provenance_records_item
    ON provenance_records (item_type, item_id);
