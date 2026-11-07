-- «ул. Александре Пушкини» (транслит с грузинского) → «ул. Пушкина»; карточки «Медцентра» по сайту клиники (medcenter.ge)
update public.places set addr_ru = replace(addr_ru, 'ул. Александре Пушкини', 'ул. Пушкина'), updated_at = now() where addr_ru like '%Александре Пушкини%';
update public.masters set place_address = replace(place_address, 'ул. Александре Пушкини', 'ул. Пушкина'), updated_at = now() where place_address like '%Александре Пушкини%';

update public.places set
  addr_ru = 'Батуми, ул. Пушкина, 118–120',
  phones = array['+995596226060', '+995422226060'],
  hours = 'Пн–Пт 09:00–18:00; Сб 10:00–14:00; Вс выходной',
  photos = array['https://medcenter.ge/wp-content/uploads/2025/01/cover_about_us.jpg'],
  tags = array['онкология', 'химиотерапия', 'лучевая терапия', 'кардиология', 'хирургия', 'маммология', 'диагностика', 'узи'],
  desc_ru = 'Многопрофильная больница сети «Медцентр» в здании бывшего Онкологического центра Аджарии — онкологическое отделение работает здесь с 1965 года, в 2012 году больницу полностью реконструировали. Направления: онкология, химиотерапия и лучевая терапия, маммология, кардиология, хирургия, ангиология и сосудистая хирургия, урология, гинекология, эндокринология, неврология, офтальмология, ЛОР, дерматология, радиология и УЗИ, лабораторная диагностика. Записаться к врачу — по телефону регистратуры; круглосуточная линия: +995 596 22 60 60.',
  desc_en = 'Multi-specialty hospital of the MedCenter network in the former Adjara Oncology Center building (oncology since 1965, fully renovated in 2012): oncology, chemotherapy and radiotherapy, breast care, cardiology, surgery, urology, gynecology, neurology, imaging and lab tests. Appointments by phone.',
  edited = true,
  updated_at = now()
where id = 'BAT-FCE13922E9D4';

update public.places set
  phones = array['+995577652766', '+995422226060'],
  hours = 'Круглосуточно (приёмное отделение)',
  photos = array['https://medcenter.ge/wp-content/uploads/2025/01/referal_hospital.jpg'],
  tags = array['реферальный госпиталь', 'неотложная помощь', 'круглосуточно', 'трансплантация печени', 'хирургия', 'диагностика'],
  desc_ru = 'Реферальный госпиталь сети «Медцентр» (Батумская университетская клиника): многопрофильная больница с отделением неотложной помощи, которое работает круглосуточно. Здесь проводят диагностику, плановые и экстренные операции, трансплантацию печени — вместе с иностранными врачами. Записаться к врачу — по телефону регистратуры.',
  desc_en = 'Referral hospital of the MedCenter network (Batumi University Clinic): multi-specialty hospital with a 24/7 emergency department, diagnostics, planned and emergency surgery, liver transplantation. Appointments by phone.',
  edited = true,
  updated_at = now()
where id = 'BAT-FEC68F7F4D49';
