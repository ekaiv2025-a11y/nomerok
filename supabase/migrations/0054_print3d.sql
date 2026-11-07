-- Новое направление «3D-печать и моделирование»: переносим анкету из «Другого»
update public.masters set category = 'print3d', updated_at = now() where slug = 'blacknozzle-ge-other-suhq' and category = 'other';
