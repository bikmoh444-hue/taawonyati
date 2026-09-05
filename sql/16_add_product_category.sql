-- Add product category and organic (bio) flag to support the redesigned
-- Products screen (dynamic category filter chips + Bio badge).
alter table products add column if not exists category text;
alter table products add column if not exists is_bio boolean default false;
