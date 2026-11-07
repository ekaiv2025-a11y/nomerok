import type { Locale } from "./i18n/config";

/*
 * Уточнения внутри широких направлений («Красота», «Спорт и тренеры»).
 * Определяются автоматически по тексту анкеты: услуги, «о себе», имя.
 * Так клиент сразу видит «Парикмахер» или «Маникюр», не заходя в профиль.
 */

type Sub = { id: string; label: Record<Locale, string>; re: RegExp };

export const SUBCATS: Record<string, Sub[]> = {
  // Работы по дому — подразделы для фильтра и отдельных страниц /services/<cat>/<sub>
  handyman: [
    { id: "furniture-assembly", label: { ru: "Сборка мебели", en: "Furniture assembly", ka: "ავეჯის აწყობა" }, re: /сборк[а-яёa-z]* мебел|собрать (шкаф|кухн|кроват|мебел)|сборк[а-яёa-z]* (шкаф|кухн|кроват)|икеа|ikea|furniture assembl|ავეჯის აწყობ/i },
    { id: "hang", label: { ru: "Повесить ТВ, полки, карнизы", en: "TV, shelves, curtains mounting", ka: "ტელევიზორის, თაროს დაკიდება" }, re: /повес|навес|телевизор|кронштейн|полк|карниз|картин|зеркал|mount|shel|curtain|დაკიდ|ტელევიზორ|თარო/i },
    { id: "doors", label: { ru: "Двери и замки", en: "Doors & locks", ka: "კარები და საკეტები" }, re: /двер|замк|замок|личинк|вскрыти|door|lock|კარ|საკეტ/i },
    { id: "small-repair", label: { ru: "Мелкий ремонт", en: "Small repairs", ka: "მცირე შეკეთება" }, re: /мелк[а-яёa-z]* ремонт|мастер на час|муж на час|по дому|мелочи|handyman|small repair|წვრილმან/i },
  ],
  plumber: [
    { id: "faucet", label: { ru: "Смесители и краны", en: "Taps & faucets", ka: "ონკანები" }, re: /смесител|кран|faucet|tap|ონკან/i },
    { id: "toilet", label: { ru: "Унитазы и инсталляции", en: "Toilets", ka: "უნიტაზი" }, re: /унитаз|инсталляц|бачок|toilet|უნიტაზ/i },
    { id: "clog", label: { ru: "Засоры", en: "Clogs", ka: "დაცობა" }, re: /засор|прочистк|канализац|clog|drain|დაცობ|კანალიზაც/i },
    { id: "boiler", label: { ru: "Бойлеры и водонагреватели", en: "Water heaters", ka: "ბოილერები" }, re: /бойлер|водонагрев|колонк|boiler|water heater|ბოილერ/i },
    { id: "pipes", label: { ru: "Трубы и разводка", en: "Pipes", ka: "მილები" }, re: /труб|разводк|протечк|течь|теч[её]т|pipe|leak|მილ|გაჟონ/i },
  ],
  electrician: [
    { id: "sockets", label: { ru: "Розетки и выключатели", en: "Sockets & switches", ka: "როზეტები" }, re: /розетк|выключател|socket|switch|როზეტ|ჩამრთველ/i },
    { id: "lighting", label: { ru: "Люстры и свет", en: "Lighting", ka: "განათება" }, re: /люстр|светильник|освещен|свет|led|подсветк|light|chandelier|განათებ|ჭაღ/i },
    { id: "wiring", label: { ru: "Проводка", en: "Wiring", ka: "გაყვანილობა" }, re: /проводк|кабел|электромонтаж|wiring|cable|გაყვანილობ|კაბელ/i },
    { id: "panel", label: { ru: "Щитки и автоматы", en: "Panels & breakers", ka: "ფარები" }, re: /щит|автомат|узо|счётчик|счетчик|panel|breaker|ფარ|მრიცხველ/i },
  ],
  appliances: [
    { id: "washer", label: { ru: "Стиральные машины", en: "Washing machines", ka: "სარეცხი მანქანები" }, re: /стиральн|washing machine|washer|სარეცხ/i },
    { id: "fridge", label: { ru: "Холодильники", en: "Fridges", ka: "მაცივრები" }, re: /холодильн|морозил|fridge|refrigerat|freezer|მაცივ/i },
    { id: "dishwasher", label: { ru: "Посудомоечные машины", en: "Dishwashers", ka: "ჭურჭლის სარეცხი" }, re: /посудомо|dishwasher|ჭურჭლის/i },
    { id: "oven", label: { ru: "Плиты и духовки", en: "Ovens & hobs", ka: "ღუმელები" }, re: /плит|духовк|варочн|oven|hob|stove|ღუმელ|გაზქურ/i },
    { id: "coffee", label: { ru: "Кофемашины", en: "Coffee machines", ka: "ყავის აპარატები" }, re: /кофемаш|coffee|ყავის/i },
  ],
  repair: [
    { id: "turnkey", label: { ru: "Ремонт под ключ", en: "Full renovation", ka: "სრული რემონტი" }, re: /под ключ|капитальн|комплексн[а-яёa-z]* ремонт|turnkey|full renovation|სრული რემონტ/i },
    { id: "tiles", label: { ru: "Плитка", en: "Tiling", ka: "ფილა" }, re: /плитк|кафел|tile|ფილ|კაფელ/i },
    { id: "paint", label: { ru: "Покраска и обои", en: "Painting & wallpaper", ka: "შეღებვა" }, re: /покраск|маляр|обо[ия]|шпаклев|paint|wallpaper|შეღებ|შპალერ/i },
    { id: "drywall", label: { ru: "Гипсокартон и потолки", en: "Drywall & ceilings", ka: "თაბაშირმუყაო" }, re: /гипсокартон|потол|drywall|ceiling|თაბაშირ|ჭერ/i },
    { id: "floor", label: { ru: "Полы и ламинат", en: "Floors", ka: "იატაკი" }, re: /ламинат|паркет|стяжк|пол(?![а-яё])|полы|floor|laminate|იატაკ|ლამინატ/i },
  ],
  cleaning: [
    { id: "general", label: { ru: "Генеральная уборка", en: "Deep cleaning", ka: "გენერალური დალაგება" }, re: /генеральн|deep clean|გენერალურ/i },
    { id: "after-repair", label: { ru: "После ремонта", en: "After renovation", ka: "რემონტის შემდეგ" }, re: /после ремонт|после строит|after (renovation|repair|construction)|რემონტის შემდეგ/i },
    { id: "upholstery", label: { ru: "Химчистка мебели и ковров", en: "Upholstery & carpets", ka: "ავეჯის ქიმწმენდა" }, re: /химчистк|ковр|диван|матрас|upholster|carpet|sofa|ქიმწმენდ|ხალიჩ/i },
    { id: "windows", label: { ru: "Мойка окон", en: "Window cleaning", ka: "ფანჯრების წმენდა" }, re: /окн|window|ფანჯ/i },
    { id: "airbnb", label: { ru: "Уборка квартир посуточно", en: "Short-term rentals", ka: "დღიური ბინები" }, re: /посуточ|airbnb|апартамент|short.?term|booking|დღიურ/i },
  ],
  aircon: [
    { id: "install", label: { ru: "Установка кондиционеров", en: "Installation", ka: "მონტაჟი" }, re: /установк|монтаж|install|მონტაჟ/i },
    { id: "service", label: { ru: "Чистка и обслуживание", en: "Cleaning & service", ka: "წმენდა" }, re: /чистк|обслужив|дезинфекц|clean|service|წმენდ/i },
    { id: "refill", label: { ru: "Заправка фреоном и ремонт", en: "Refill & repair", ka: "ფრეონით შევსება" }, re: /заправк|фреон|ремонт|refill|freon|repair|ფრეონ|შეკეთ/i },
  ],
  tutor: [
    { id: "math", label: { ru: "Математика", en: "Maths", ka: "მათემატიკა" }, re: /математ|алгебр|геометр|math|მათემატ/i },
    { id: "primary", label: { ru: "Начальная школа", en: "Primary school", ka: "დაწყებითი კლასები" }, re: /начальн|младш|подготовк[а-яёa-z]* к школ|1-4 класс|primary|დაწყებით/i },
    { id: "exams", label: { ru: "Подготовка к экзаменам", en: "Exam prep", ka: "გამოცდებისთვის მზადება" }, re: /егэ|огэ|экзамен|ielts|toefl|sat\b|ნაციონალურ|exam|გამოცდ/i },
    { id: "science", label: { ru: "Физика, химия, биология", en: "Sciences", ka: "საბუნებისმეტყველო" }, re: /физик|хими|биолог|physics|chemistry|biology|ფიზიკ|ქიმი|ბიოლოგ/i },
    { id: "russian", label: { ru: "Русский язык и литература", en: "Russian", ka: "რუსული ენა" }, re: /русск[а-яёa-z]* язык|литератур|russian|რუსულ/i },
  ],
  // Специальности врачей — определяются по тексту анкеты (должность «Кардиолог, эхокардиолог» и т. п.)
  doctor: [
    { id: "therapist", label: { ru: "Терапевт, семейный врач", en: "GP", ka: "თერაპევტი" }, re: /(?<![а-яё])терапевт|семейн[а-яёa-z]* врач|врач общей практики|интернист|general practitioner|\bGP\b|(?<!ქიმიო)თერაპევტ|ოჯახის ექიმ/i },
    { id: "pediatrician", label: { ru: "Педиатр", en: "Pediatrician", ka: "პედიატრი" }, re: /педиатр|неонатолог|детск[а-яёa-z]* врач|pediatric|neonatolog|პედიატრ|ნეონატოლ/i },
    { id: "gynecologist", label: { ru: "Гинеколог", en: "Gynecologist", ka: "გინეკოლოგი" }, re: /гинеколог|акушер|репродуктолог|gynecolog|obstetric|გინეკოლოგ|მეან/i },
    { id: "cardiologist", label: { ru: "Кардиолог", en: "Cardiologist", ka: "კარდიოლოგი" }, re: /кардиолог|аритмолог|эхокардиограф|cardiolog|კარდიოლოგ/i },
    { id: "oncologist", label: { ru: "Онколог", en: "Oncologist", ka: "ონკოლოგი" }, re: /онколог|химиотерап|радиотерап|лучев[а-яё]* терап|маммолог|oncolog|chemotherap|radiotherap|ონკოლოგ|ქიმიოთერაპ/i },
    { id: "surgeon", label: { ru: "Хирург", en: "Surgeon", ka: "ქირურგი" }, re: /(?<!нейро|кардио|ангио|сосудист[а-яё]* )хирург|surgeon|(?<!ნეირო)ქირურგ/i },
    { id: "cardiosurgeon", label: { ru: "Кардиохирург", en: "Cardiac surgeon", ka: "კარდიოქირურგი" }, re: /кардиохирург|cardiac surg|კარდიოქირურგ/i },
    { id: "vascular", label: { ru: "Ангиолог, сосудистый хирург", en: "Vascular surgeon", ka: "ანგიოლოგი" }, re: /ангиолог|сосудист|эндоваскуляр|флеболог|vascular|angiolog|ანგიოლოგ|სისხლძარღვ/i },
    { id: "traumatologist", label: { ru: "Травматолог-ортопед", en: "Orthopedist", ka: "ტრავმატოლოგი" }, re: /травматолог|ортопед|orthop|traumatolog|ტრავმატოლ|ორთოპედ/i },
    { id: "urologist", label: { ru: "Уролог", en: "Urologist", ka: "უროლოგი" }, re: /уролог|андролог|urolog|უროლოგ/i },
    { id: "proctologist", label: { ru: "Проктолог", en: "Proctologist", ka: "პროქტოლოგი" }, re: /проктолог|колопроктолог|proctolog|პროქტოლოგ/i },
    { id: "neurologist", label: { ru: "Невролог, нейрохирург", en: "Neurologist", ka: "ნევროლოგი" }, re: /невролог|невропатолог|нейрохирург|neurolog|neurosurg|ნევროლოგ|ნეიროქირურგ/i },
    { id: "endo", label: { ru: "Эндокринолог", en: "Endocrinologist", ka: "ენდოკრინოლოგი" }, re: /эндокринолог|endocrinolog|ენდოკრინოლოგ/i },
    { id: "gastro", label: { ru: "Гастроэнтеролог", en: "Gastroenterologist", ka: "გასტროენტეროლოგი" }, re: /гастроэнтеролог|гепатолог|эндоскоп|gastroenterolog|hepatolog|გასტროენტეროლოგ|ჰეპატოლოგ/i },
    { id: "rheumatologist", label: { ru: "Ревматолог", en: "Rheumatologist", ka: "რევმატოლოგი" }, re: /ревматолог|rheumatolog|რევმატოლოგ/i },
    { id: "nephrologist", label: { ru: "Нефролог", en: "Nephrologist", ka: "ნეფროლოგი" }, re: /нефролог|диализ|nephrolog|ნეფროლოგ/i },
    { id: "pulmonologist", label: { ru: "Пульмонолог", en: "Pulmonologist", ka: "პულმონოლოგი" }, re: /пульмонолог|pulmonolog|პულმონოლოგ/i },
    { id: "hematologist", label: { ru: "Гематолог", en: "Hematologist", ka: "ჰემატოლოგი" }, re: /гематолог|трансфузиолог|hematolog|ჰემატოლოგ/i },
    { id: "ent", label: { ru: "ЛОР", en: "ENT", ka: "ოტორინოლარინგოლოგი" }, re: /лор(?![а-яё])|отоларинголог|оториноларинголог|\bent\b|otolaryng|ოტორინო/i },
    { id: "eye", label: { ru: "Офтальмолог", en: "Ophthalmologist", ka: "ოფთალმოლოგი" }, re: /офтальмолог|окулист|ophthalmolog|ოფთალმოლოგ/i },
    { id: "derma", label: { ru: "Дерматолог", en: "Dermatologist", ka: "დერმატოლოგი" }, re: /дерматолог|дерматовенеролог|dermatolog|დერმატოლოგ/i },
    { id: "radiologist", label: { ru: "УЗИ, рентген, МРТ", en: "Imaging", ka: "რადიოლოგი" }, re: /радиолог|рентген|узи(?![а-яё])|ультразвук|мрт|кт(?![а-яё])|сонолог|radiolog|ultrasound|mri|რადიოლოგ|ექოსკოპ/i },
    { id: "anesthesiologist", label: { ru: "Анестезиолог-реаниматолог", en: "Anesthesiologist", ka: "ანესთეზიოლოგი" }, re: /анестезиолог|реаниматолог|интенсивн[а-яё]* терап|неотложн|anesthesiolog|intensive care|emergency|ანესთეზიოლოგ|რეანიმატოლოგ/i },
    { id: "lab", label: { ru: "Анализы, лаборатория", en: "Lab", ka: "ლაბორატორია" }, re: /лаборант|лабораторн|патоморфолог|патологоанатом|анализ|laborator|patholog|ლაბორატ|პათოლოგ/i },
  ],
  beauty: [
    { id: "hair", label: { ru: "Парикмахер", en: "Hairdresser", ka: "პარიკმახერი" }, re: /парикмахер|стрижк|стригу|причес|окрашиван|колорист|волос|укладк|кератин|air ?touch|балаяж|шатуш|hair|თმ(ის|ა)/i },
    { id: "nails", label: { ru: "Маникюр и педикюр", en: "Nails", ka: "მანიკიური და პედიკიური" }, re: /маникюр|педикюр|ногт|гель[- ]?лак|nail|manicure|pedicure|მანიკ|პედიკ/i },
    { id: "brows", label: { ru: "Брови и ресницы", en: "Brows & lashes", ka: "წარბები და წამწამები" }, re: /бров|ресниц|лэшмейк|лешмейк|lash|brow|წარბ|წამწამ/i },
    { id: "cosmetology", label: { ru: "Косметолог", en: "Cosmetologist", ka: "კოსმეტოლოგი" }, re: /косметолог|чистк[а-яёa-z]* лица|пилинг|уход[а-яёa-z]* за лицом|биоревитал|мезотерап|cosmetolog|კოსმეტოლ/i },
    { id: "makeup", label: { ru: "Визажист", en: "Makeup", ka: "ვიზაჟისტი" }, re: /визаж|макияж|make-?up|ვიზაჟ/i },
    { id: "epilation", label: { ru: "Депиляция", en: "Hair removal", ka: "დეპილაცია" }, re: /депиляц|эпиляц|шугаринг|восков|waxing|epilat|დეპილაც|ეპილაც/i },
    { id: "barber", label: { ru: "Барбер", en: "Barber", ka: "ბარბერი" }, re: /барбер|бород|barber|ბარბერ/i },
  ],
  realtor: [
    { id: "rent", label: { ru: "Аренда", en: "Rentals", ka: "ქირავნობა" }, re: /аренд|снять|сдать|сда[её]м|посуточ|долгосроч|rent|lease|ქირა/i },
    { id: "sale", label: { ru: "Покупка и продажа", en: "Buying & selling", ka: "ყიდვა-გაყიდვა" }, re: /покуп|продаж|прода[тюё]|купит|buy|sell|purchase|sale|ყიდვ|გაყიდ/i },
    { id: "newbuild", label: { ru: "Новостройки", en: "New builds", ka: "ახალი მშენებლობა" }, re: /новостро|застройщик|котлован|new[- ]?build|off[- ]plan|developer|ახალ\S* მშენებ/i },
    { id: "commercial", label: { ru: "Коммерческая", en: "Commercial", ka: "კომერციული" }, re: /коммерч|офис|помещени|склад|commercial|office|retail|კომერც/i },
    { id: "deal", label: { ru: "Сопровождение сделок", en: "Deal support", ka: "გარიგების მხარდაჭერა" }, re: /сопровожд|сделк|юридическ\S* провер|оформлени|нотари|deal|closing|legal check|გარიგ/i },
  ],
  photo: [
    { id: "interior", label: { ru: "Интерьерная съёмка", en: "Interior photography", ka: "ინტერიერის ფოტოგრაფია" }, re: /интерьер|недвижимост|архитектур|airbnb|interior|real estate|architect|ინტერიერ|უძრავ/i },
    { id: "reportage", label: { ru: "Репортажная съёмка", en: "Reportage & events", ka: "რეპორტაჟული გადაღება" }, re: /репортаж|мероприят|корпоратив|конференц|праздник|event|reportage|კორპორატ|ღონისძიებ|რეპორტაჟ/i },
    { id: "wedding", label: { ru: "Свадебная съёмка", en: "Weddings", ka: "საქორწილო გადაღება" }, re: /свад|венчан|love ?story|wedding|ქორწილ/i },
    { id: "portrait", label: { ru: "Портретная съёмка", en: "Portraits", ka: "პორტრეტული გადაღება" }, re: /портрет|фотосесси|portrait|photoshoot|პორტრეტ|ფოტოსესი/i },
    { id: "family", label: { ru: "Семейная и детская", en: "Family & kids", ka: "საოჯახო და საბავშვო" }, re: /семейн|детск\S* (фото|съ[её]м)|новорожд|беременн|newborn|family|maternity|საოჯახო|ახალშობილ/i },
    { id: "product", label: { ru: "Предметная съёмка", en: "Product photography", ka: "საგნობრივი გადაღება" }, re: /предметн|каталог|товар|маркетплейс|product|ecommerce|პროდუქტ/i },
    { id: "food", label: { ru: "Фуд-съёмка", en: "Food photography", ka: "კერძების გადაღება" }, re: /фуд|food|блюд|ресторан\S* (меню|съ[её]м)|კერძ/i },
    { id: "fashion", label: { ru: "Fashion и лукбуки", en: "Fashion & lookbooks", ka: "ფეშენი" }, re: /fashion|лукбук|lookbook|модел\S* (съ[её]м|тест)|ფეშენ/i },
    { id: "drone", label: { ru: "Аэросъёмка (дрон)", en: "Drone / aerial", ka: "აეროგადაღება (დრონი)" }, re: /дрон|аэросъ[её]м|квадрокоптер|drone|aerial|დრონ/i },
    { id: "video", label: { ru: "Видеосъёмка", en: "Videography", ka: "ვიდეოგადაღება" }, re: /видеосъ[её]м|видеограф|reels|рилс|клип|videograph|video|ვიდეო/i },
    { id: "editing", label: { ru: "Монтаж и обработка", en: "Editing & retouch", ka: "მონტაჟი და დამუშავება" }, re: /монтаж|ретуш|обработк\S* фото|цветокоррекц|editing|retouch|color grading|მონტაჟ|რეტუშ/i },
  ],
  fitness: [
    { id: "gym", label: { ru: "Фитнес", en: "Fitness", ka: "ფიტნესი" }, re: /фитнес|тренаж?[её]рн|персональн[а-яёa-z]* тренир|похуд|набор[а-яёa-z]* масс|кроссфит|функционал|fitness|gym|workout|crossfit|ფიტნეს/i },
    { id: "yoga", label: { ru: "Йога и пилатес", en: "Yoga & pilates", ka: "იოგა და პილატესი" }, re: /йог|пилатес|стретчинг|растяжк|yoga|pilates|stretch|იოგ/i },
    { id: "martial", label: { ru: "Единоборства", en: "Martial arts", ka: "ორთაბრძოლა" }, re: /айкидо|карате|бокс|кикбокс|дзюдо|самбо|джиу|борьб|тхэквондо|ушу|мма(?![а-яё])|единоборств|самооборон|aikido|karate|boxing|judo|mma|martial|კარატე|კრივ|ჭიდაობ/i },
    { id: "swim", label: { ru: "Плавание", en: "Swimming", ka: "ცურვა" }, re: /плаван|бассейн|swim|ცურვ/i },
    { id: "dance", label: { ru: "Танцы", en: "Dance", ka: "ცეკვა" }, re: /танц|хореограф|dance|ცეკვ/i },
    { id: "games", label: { ru: "Теннис, футбол и др.", en: "Tennis, football etc.", ka: "ჩოგბურთი, ფეხბურთი" }, re: /теннис|футбол|баскетбол|волейбол|шахмат|сёрф|серф|сап(?![а-яё])|tennis|football|soccer|basketball|volleyball|chess|surf|ჩოგბურთ|ფეხბურთ/i },
  ],
};

type M = { category: string; extra_categories?: string[]; services?: string; about?: string; name?: string; subcats?: string[]; price_list?: { name: string }[] };

/** Уточнения для направления cat у специалиста (по порядку списка). */
export function subcatsOf(m: M, cat: string = m.category): string[] {
  const list = SUBCATS[cat];
  if (!list) return [];
  if (m.category !== cat && !(m.extra_categories ?? []).includes(cat)) return [];
  // Специалист выбрал сам — берём его выбор; иначе угадываем по тексту анкеты
  const chosen = (m.subcats ?? []).map((x) => (x.includes(":") ? x : `${m.category}:${x}`)).filter((x) => x.startsWith(`${cat}:`)).map((x) => x.slice(cat.length + 1));
  if (chosen.length) return list.filter((s) => chosen.includes(s.id)).map((s) => s.id);
  // Врачи: специальность — в первой строке услуг (должность), в тексте «о себе» много лишнего
  if (cat === "doctor") {
    const head = (m.services ?? "").split("\n")[0] ?? "";
    const byHead = list.filter((s) => s.re.test(head)).map((s) => s.id);
    if (byHead.length) return byHead;
  }
  const text = `${m.name ?? ""}\n${m.services ?? ""}\n${m.about ?? ""}\n${(m.price_list ?? []).map((x) => x.name).join("\n")}`;
  return list.filter((s) => s.re.test(text)).map((s) => s.id);
}

export function subcatLabel(cat: string, id: string, lang: Locale): string {
  return SUBCATS[cat]?.find((s) => s.id === id)?.label[lang] ?? id;
}

/** Где уточнения сами по себе непонятны («Аренда») — перед ними пишем профессию. */
const PREFIX: Record<string, Record<Locale, string>> = {
  realtor: { ru: "Риелтор", en: "Agent", ka: "რიელტორი" },
};

/** Короткая подпись для карточки: «Парикмахер, Барбер» вместо «Красота». */
export function subcatLine(m: M, lang: Locale, max = 2): string | null {
  const ids = subcatsOf(m);
  if (!ids.length) return null;
  const list = ids.slice(0, max).map((id) => subcatLabel(m.category, id, lang)).join(", ") + (ids.length > max ? ` +${ids.length - max}` : "");
  const pre = PREFIX[m.category]?.[lang];
  return pre ? `${pre}: ${list.toLowerCase()}` : list;
}
