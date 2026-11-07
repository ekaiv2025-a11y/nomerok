-- Новые направления: тату, праздники и мероприятия, трансфер, печать — переносим анкеты из «Другого»
update public.masters set category = 'tattoo', updated_at = now() where slug = 'aveeva-tattoo-tbilisi-other-5c2q' and category = 'other';
update public.masters set category = 'events', updated_at = now() where slug = 'tetyana-yaroslavna-other-2jsw' and category = 'other';
update public.masters set category = 'transfer', updated_at = now() where slug = 'transfer-in-georgia-other-ikw3' and category = 'other';
update public.masters set category = 'print', updated_at = now() where slug = 'lada-photo-njbu' and category = 'other';
