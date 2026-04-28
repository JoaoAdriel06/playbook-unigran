-- Add gestor password (initial value: Adriel2406)
INSERT INTO settings (key, value) VALUES ('gestor_password', 'Adriel2406')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Reorder tabs: checklist-diario first, inicio second
-- Use a temp value to avoid any potential conflicts during swap
UPDATE sections SET order_index = 99 WHERE slug = 'inicio';
UPDATE sections SET order_index = 0  WHERE slug = 'checklist-diario';
UPDATE sections SET order_index = 1  WHERE slug = 'inicio';
