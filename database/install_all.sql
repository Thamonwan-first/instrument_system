-- ============================================================
--  Install All - Instrument System (canonical location)
--  Run from project root:
--    mysql -u root -p < database/install_all.sql
--
--  Order:
--  1) Core schema
--  2) Admin migrations
--  3) Feature migrations
--  4) Seed data
-- ============================================================

SOURCE backend/database.sql;
SOURCE backend/admin_tables_migration.sql;
SOURCE backend/equipment_comments_migration.sql;
SOURCE backend/equipment_status_migration.sql;
SOURCE backend/mock_data_full.sql;
