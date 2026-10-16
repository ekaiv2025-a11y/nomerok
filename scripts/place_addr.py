import re
KA={'ა':'а','ბ':'б','გ':'г','დ':'д','ე':'е','ვ':'в','ზ':'з','თ':'т','ი':'и','კ':'к','ლ':'л','მ':'м','ნ':'н','ო':'о','პ':'п','ჟ':'ж','რ':'р','ს':'с','ტ':'т','უ':'у','ფ':'п','ქ':'к','ღ':'г','ყ':'к','შ':'ш','ჩ':'ч','ც':'ц','ძ':'дз','წ':'ц','ჭ':'ч','ხ':'х','ჯ':'дж','ჰ':'х'}
KA_TYPES={'ქუჩა':'ул.','ქ.':'ул.','გამზირი':'просп.','შესახვევი':'пер.','ჩიხი':'тупик','ხეივანი':'аллея','დასახლება':'посёлок','მოედანი':'пл.','სანაპირო':'наб.','ბულვარი':'бульвар','გზატკეცილი':'шоссе','კვარტალი':'квартал','უბანი':'район','მიკრორაიონი':'мкр.'}
def ka_word(w):
    # родительный падеж → именительный (Гамсахурдиას → Гамсахурдиа, Шанидзის → Шанидзе, Руставелის → Руставели)
    if w.endswith('ძის'): w=w[:-3]+'ძე'
    elif w.endswith('შვილის'): w=w[:-1]
    elif w.endswith('ის') and len(w)>4: w=w[:-2]+'ი'
    elif re.search('[აოუე]ს$',w) and len(w)>3: w=w[:-1]
    r=''.join(KA.get(c,c) for c in w)
    r=re.sub('иа$','ия',r)
    r=FIRST.get(r,r)
    return r[:1].upper()+r[1:]
FIRST={'илиа':'Илья','илия':'Илья','Илиа':'Илья','Илия':'Илья','гиорги':'Георгий','Гиорги':'Георгий','давит':'Давид','Давит':'Давид','тамар':'Тамар'}
def ka_plain(s):
    o=' '.join((lambda r: r[:1].upper()+r[1:])(''.join(KA.get(c,c) for c in w)) for w in s.split())
    return o
def from_ka(a):
    parts=[p.strip() for p in a.split(',')]
    out=[]
    for p in parts:
        words=p.split()
        typ=None; rest=[]
        for w in words:
            if w in KA_TYPES: typ=KA_TYPES[w]
            elif re.search('[Ⴀ-ჿ]',w): rest.append(ka_word(w) if typ is None or True else w)
            else: rest.append(w)
        nums=[w for w in rest if re.match(r'^\d',w)]; rest=[w for w in rest if not re.match(r'^\d',w)]
        s=' '.join(rest)
        if typ and s: s=f"{typ} {s}"
        if nums: s=f"{s}, {' '.join(nums)}" if s else ' '.join(nums)
        if s: out.append(s)
    return ', '.join(out)
LAT=[('shch','щ'),('kh','х'),('gh','г'),('ch','ч'),('sh','ш'),('zh','ж'),('ts','ц'),('dz','дз'),('ya','я'),('yu','ю'),('ia','иа'),('a','а'),('b','б'),('c','ц'),('d','д'),('e','е'),('f','ф'),('g','г'),('h','х'),('i','и'),('j','дж'),('k','к'),('l','л'),('m','м'),('n','н'),('o','о'),('p','п'),('q','к'),('r','р'),('s','с'),('t','т'),('u','у'),('v','в'),('w','в'),('x','кс'),('y','й'),('z','з')]
def lat_word(w):
    s=w.lower().replace("'",'').replace('’','')
    o=''; i=0
    while i<len(s):
        for a,b in LAT:
            if s.startswith(a,i): o+=b; i+=len(a); break
        else: o+=s[i]; i+=1
    o=re.sub('иа$','ия',o); o=re.sub('ии$','ии',o)
    return o[:1].upper()+o[1:]
EN_TYPES={'st':'ул.','st.':'ул.','street':'ул.','str':'ул.','str.':'ул.','ave':'просп.','ave.':'просп.','avenue':'просп.','av':'просп.','lane':'пер.','ln':'пер.','blvd':'бульвар','boulevard':'бульвар','highway':'шоссе','hwy':'шоссе','sq':'пл.','square':'пл.','turn':'поворот','dead-end':'тупик','deadend':'тупик','embankment':'наб.','district':'район','settlement':'посёлок'}
SKIP={'batumi','georgia','adjara','ajara','city','n','no','#','of','the'}
def from_lat(a):
    a=re.sub(r'[\U0001F1E6-\U0001F1FF]','',a)
    a=re.sub(r'\b(Batumi|Georgia|Adjara|Ajara)\b,?','',a,flags=re.I)
    a=re.sub(r'\b\d{4}\b(?=\s*,|\s*$)','',a)  # почтовый индекс
    out=[]
    for part in [p.strip() for p in a.split(',') if p.strip()]:
        words=part.split(); typ=None; nums=[]; names=[]
        for w in words:
            lw=w.lower().strip('.,')
            if lw in EN_TYPES: typ=EN_TYPES[lw]
            elif lw in SKIP: continue
            elif re.match(r'^(\d+[a-zA-Zა-ჰ]?(/\d+[a-zA-Z]?)?|[a-zA-Z])$',w) and (re.search(r'\d',w) or (nums and len(w)==1)): nums.append(w)
            elif re.match(r"^[A-Za-z'’\-]+$",w): names.append(lat_word(w) if not re.match(r'^\d',w) else w)
            else: names.append(w)
        s=' '.join(names)
        if typ: s=f'{typ} {s}'.strip()
        if nums: s=f"{s}, {' '.join(nums)}" if s else ' '.join(nums)
        if s: out.append(s)
    return ', '.join(out)
def addr_ru(a):
    if not a: return None
    a=str(a).strip()
    if re.search('[А-Яа-яЁё]',a):
        return re.split(r'\s*/\s*(?=[A-Za-z])',a)[0]  # «ул. Казбеги, 13 / Kazbegi Avenue, 13» → русская часть
    if re.search('[Ⴀ-ჿ]',a): r=from_ka(a)
    elif re.search('[A-Za-z]',a): r=from_lat(a)
    else: return None
    r=re.sub(r'\s+',' ',r).strip(' ,')
    if not re.search('[А-Яа-я]{3}',r): return None
    return 'Батуми, '+r if not r.lower().startswith('батуми') else r
CUISINE=[
 ('грузинская кухня',r'khinkal|хинкал|ხინკალ|khachapur|хачапур|ხაჭაპურ|georgian|грузин|ქართულ|acharul|აჭარულ|аджарск|supra|супра|сациви|mtsvad|мцвад|მწვად|kubdar|qvevri'),
 ('шашлык',r'shashl|шашлык|mtsvad|мцвад|მწვად|mangal|мангал|bbq|grill|гриль'),
 ('азиатская кухня',r'asian|азиат|wok\b|вок\b|noodle|лапш|pho\b|ramen|рамен|chin(a|ese)|китай|thai|тай\b|korea|корей|vietnam|вьетнам|japan|япон|sushi|суши|სუში|panda|dim ?sum'),
 ('суши',r'sushi|суши|სუში|\broll|ролл|sashimi|сашими'),
 ('пицца',r'pizz|пицц|პიცა'),
 ('бургеры',r'burger|бургер|ბურგერ'),
 ('шаурма и донер',r'shawar|шаурм|шаверм|d[oö]ner|донер|დონერ|kebab|кебаб|kebap|ქაბაბ|gyro'),
 ('турецкая кухня',r'turk|türk|турец|ottoman|istanbul|стамбул|anatol|lahmac|pide\b|ankara'),
 ('узбекская кухня',r'uzbek|узбек|plov|плов|samarkand|самарканд|tashkent|ташкент'),
 ('индийская кухня',r'india|индий|curry|карри|tandoor|тандур|masala'),
 ('итальянская кухня',r'ital|итальян|pasta|паста|trattoria|osteria|остерия'),
 ('морепродукты',r'fish|рыб|seafood|морепрод|თევზ|oyster|устриц'),
 ('кофе',r'coffee|кофе|კაფე ?ყავ|ყავა|espresso|эспрессо|кофейн'),
 ('десерты',r'dessert|десерт|cake|торт|кондитер|gelato|ice ?cream|морожен|pancake|панкейк|donut|пончик|bakery|пекарн|ნაყინ|sweet'),
 ('вино',r'\bwine|вин(о|ный|ная)|ღვინ|\bvino|enoteca'),
 ('пиво',r'\bbeer|пив|brew|ლუდ|craft'),
 ('кальян',r'hookah|кальян|shisha|ჰუკა'),
 ('халяль',r'halal|халял'),
 ('вегетарианское',r'vegan|веган|vegetar|вегетар'),
 ('завтраки',r'breakfast|завтрак|brunch|бранч'),
]
SUBTAG={'Кофейня':['кофе'],'Выпечка и кондитерская':['десерты'],'Кондитерская':['десерты'],'Пекарня':['выпечка'],'Мороженое':['десерты']}
def guess_tags(text, sub=None):
    t=(text or '').lower()
    out=[k for k,rx in CUISINE if re.search(rx,t)]
    for x in SUBTAG.get(sub or '',[]):
        if x not in out: out.append(x)
    return out
if __name__=='__main__':
    for t in ['ზვიად გამსახურდიას ქუჩა, 49/4','აკაკი შანიძის ქუჩა, 42','ბაგრატიონის ქუჩა','დემეტრე თავდადებულის ქუჩა, 30','აკაკი წერეთლის შესახვევი, 1','3a Inasaridze St','13 b Agmashenebeli St','2-й поворот, 27 Khakhuli St','31 Zurab Gorgiladze St','zhiuli shartava 13','Rustaveli Ave','Kviparosi Street 15 Makhinjauri','7 Sherif Khimshiashvili St','khimshiashvili','ул. Казбеги, 13 / Kazbegi Avenue, 13','ს2','ვახტანგ გორგასალის ქუჩა, 51','ილია ჭავჭავაძის ქუჩა, 5','შოთა რუსთაველის გამზირი, 12','79 Gorgаsali St, 45 Melikishvili St','16 Nodar Dumbadze Street','28 Kutaisi St','ქუთაისის ქუჩა 16','კვიპაროსის ქუჩა, 15']:
        print(t,'→',addr_ru(t))
