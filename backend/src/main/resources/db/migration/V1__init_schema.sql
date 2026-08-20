CREATE TABLE app_user (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

CREATE TABLE transaction (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_user(id),
    merchant_name VARCHAR(255) NOT NULL,
    amount NUMERIC(19,4) NOT NULL,
    posted_date TIMESTAMP NOT NULL
);

CREATE TABLE dispute (
    id BIGSERIAL PRIMARY KEY,
    transaction_id BIGINT NOT NULL REFERENCES transaction(id),
    user_id BIGINT NOT NULL REFERENCES app_user(id),
    status VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    idempotency_key VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(255) NOT NULL,
    entity_id BIGINT NOT NULL,
    previous_state TEXT,
    new_state TEXT,
    changed_by BIGINT,
    timestamp TIMESTAMP NOT NULL
);
