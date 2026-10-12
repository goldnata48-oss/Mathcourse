/* 2026 Наталия Кравченко. Все права защищены. Образовательный курс — «Маткурс» */
const PY_TRIPLES = [ {a:3,b:4,c:5}, {a:5,b:12,c:13}, {a:7,b:24,c:25}, {a:8,b:15,c:17}, {a:9,b:40,c:41} ];

function fmtSignedTerm(coef, varName, isFirst){
  if(coef===0) return "";
  const absC = Math.abs(coef);
  const cStr = absC===1 ? "" : absC+"";
  if(isFirst) return (coef<0?"−":"")+cStr+varName;
  return (coef<0?" − ":" + ")+cStr+varName;
}

/* ---- Базовый уровень: тестовые задания с выбором ответа ---- */
function genIdentityBasicMC(){
  const k = rnd([1,2,3,4,5]);
  const argStr = k===1 ? "x" : k+"x";
  const doubleArg = k===1 ? "2x" : (2*k)+"x";
  const {opts,correctIdx} = buildMC("1", ["0","2","sin("+doubleArg+")"]);
  return {
    topic:{ru:"Основное тождество",ua:"Основна тотожність"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{ru:`Чему равен sin²(${argStr}) + cos²(${argStr})?`, ua:`Чому дорівнює sin²(${argStr}) + cos²(${argStr})?`},
    hint:{ru:"Это основное тригонометрическое тождество — не зависит от аргумента.",ua:"Це основна тригонометрична тотожність — не залежить від аргументу."},
    solution:{
      ru:`Основное тригонометрическое тождество: sin²α + cos²α = 1 при любом α, поэтому и sin²(${argStr}) + cos²(${argStr}) = 1.`,
      ua:`Основна тригонометрична тотожність: sin²α + cos²α = 1 за будь-якого α, тому й sin²(${argStr}) + cos²(${argStr}) = 1.`
    },
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}
function genRadConvertMC(){
  const row = rnd(DEG_TABLE.slice(1));
  const toRad = Math.random()<0.5;
  if(toRad){
    const correct = fmtRad(row.num,row.den);
    let pool = [...new Set(DEG_TABLE.filter(r=>r.deg!==row.deg).map(r=>fmtRad(r.num,r.den)))].filter(v=>v!==correct);
    const distractors = shuffleArr(pool).slice(0,3);
    const {opts,correctIdx} = buildMC(correct, distractors);
    return {
      topic:{ru:"Градусы ↔ радианы",ua:"Градуси ↔ радіани"},
      format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
      question:{ru:`Сколько радиан составляет угол ${row.deg}°?`, ua:`Скільки радіан становить кут ${row.deg}°?`},
      hint:{ru:"Используйте α(рад) = α(°)·π/180.",ua:"Використайте α(рад) = α(°)·π/180."},
      solution:{
        ru:`α(рад) = ${row.deg}·π/180 = ${correct}.`,
        ua:`α(рад) = ${row.deg}·π/180 = ${correct}.`
      },
      options:{ru:opts,ua:opts}, correct:correctIdx
    };
  } else {
    const correct = row.deg+"°";
    let pool = [...new Set(DEG_TABLE.filter(r=>r.deg!==row.deg).map(r=>r.deg+"°"))];
    const distractors = shuffleArr(pool).slice(0,3);
    const {opts,correctIdx} = buildMC(correct, distractors);
    return {
      topic:{ru:"Градусы ↔ радианы",ua:"Градуси ↔ радіани"},
      format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
      question:{ru:`Сколько градусов составляет угол ${fmtRad(row.num,row.den)} рад?`, ua:`Скільки градусів становить кут ${fmtRad(row.num,row.den)} рад?`},
      hint:{ru:"Используйте α(°) = α(рад)·180/π.",ua:"Використайте α(°) = α(рад)·180/π."},
      solution:{
        ru:`α(°) = (${fmtRad(row.num,row.den)})·180/π = ${row.deg}°.`,
        ua:`α(°) = (${fmtRad(row.num,row.den)})·180/π = ${row.deg}°.`
      },
      options:{ru:opts,ua:opts}, correct:correctIdx
    };
  }
}
const SIMPLEST_EQS = [
  {q:"sin x = 0", a:"x = πn"},
  {q:"sin x = 1", a:"x = π/2 + 2πn"},
  {q:"sin x = −1", a:"x = −π/2 + 2πn"},
  {q:"cos x = 0", a:"x = π/2 + πn"},
  {q:"cos x = 1", a:"x = 2πn"},
  {q:"cos x = −1", a:"x = π + 2πn"}
];
function genSimplestEqMC(){
  const item = rnd(SIMPLEST_EQS);
  const pool = shuffleArr(SIMPLEST_EQS.filter(e=>e!==item).map(e=>e.a));
  const distractors = pool.slice(0,3);
  const {opts,correctIdx} = buildMC(item.a, distractors);
  return {
    topic:{ru:"Простейшие уравнения",ua:"Найпростіші рівняння"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{ru:`Общее решение уравнения ${item.q}:`, ua:`Загальний розв'язок рівняння ${item.q}:`},
    hint:{ru:"Вспомните таблицу частных случаев из урока 4.",ua:"Згадайте таблицю окремих випадків з уроку 4."},
    solution:{
      ru:`Для уравнения ${item.q} по таблице частных случаев получаем: ${item.a}.`,
      ua:`Для рівняння ${item.q} за таблицею окремих випадків отримуємо: ${item.a}.`
    },
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}
const SIGN_TOKEN_TEXT = {
  pos:{ru:"положительный",ua:"додатний"},
  neg:{ru:"отрицательный",ua:"від'ємний"},
  zero:{ru:"равен нулю",ua:"дорівнює нулю"},
  undef:{ru:"не определён",ua:"не визначений"}
};
function genSignByQuadrant(){
  const fn = rnd(["sin","cos","tan"]);
  const quadrant = rnd(["I","II","III","IV"]);
  const SIGNS = {sin:{I:"+",II:"+",III:"−",IV:"−"}, cos:{I:"+",II:"−",III:"−",IV:"+"}, tan:{I:"+",II:"−",III:"+",IV:"−"}};
  const correctToken = SIGNS[fn][quadrant]==="+" ? "pos" : "neg";
  const tokens = shuffleArr(["pos","neg","zero","undef"]);
  const correctIdx = tokens.indexOf(correctToken);
  const optsRu = tokens.map(t=>SIGN_TOKEN_TEXT[t].ru);
  const optsUa = tokens.map(t=>SIGN_TOKEN_TEXT[t].ua);
  return {
    topic:{ru:"Знак функции по четверти",ua:"Знак функції за чвертю"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{ru:`Каким является ${fn} α, если α — угол ${quadrant} четверти?`, ua:`Яким є ${fn} α, якщо α — кут ${quadrant} чверті?`},
    hint:{ru:"Вспомните таблицу знаков по четвертям из урока 3.",ua:"Згадайте таблицю знаків за чвертями з уроку 3."},
    solution:{
      ru:`В ${quadrant} четверти функция ${fn} имеет знак «${SIGNS[fn][quadrant]}», то есть ${SIGN_TOKEN_TEXT[correctToken].ru}.`,
      ua:`У ${quadrant} чверті функція ${fn} має знак «${SIGNS[fn][quadrant]}», тобто ${SIGN_TOKEN_TEXT[correctToken].ua}.`
    },
    options:{ru:optsRu,ua:optsUa}, correct:correctIdx
  };
}

/* ---- Средний уровень: короткий ответ ---- */
const TAN_SET = [
  {val:1,label:"1"},{val:-1,label:"−1"},{val:2,label:"2"},{val:-2,label:"−2"},
  {val:3,label:"3"},{val:-3,label:"−3"},{val:0.5,label:"1/2"},{val:-0.5,label:"−1/2"},
  {val:1/3,label:"1/3"},{val:-1/3,label:"−1/3"}
];
function genTanExpr(){
  const tset = rnd(TAN_SET);
  const sgn = ()=> Math.random()<0.5 ? 1 : -1;
  let a=rnd([1,2,3])*sgn(), b=rnd([1,2,3])*sgn(), c=rnd([1,2,3])*sgn(), d=rnd([1,2,3])*sgn();
  let denom = c*tset.val + d, guard=0;
  while(Math.abs(denom)<0.05 && guard<25){ d = rnd([1,2,3])*sgn(); denom = c*tset.val+d; guard++; }
  const numer = a*tset.val + b;
  const value = numer/denom;
  const exprStr = `(${fmtSignedTerm(a,"sin α",true)}${fmtSignedTerm(b,"cos α",false)}) / (${fmtSignedTerm(c,"sin α",true)}${fmtSignedTerm(d,"cos α",false)})`;
  return {
    topic:{ru:"Выражение через tg α",ua:"Вираз через tg α"},
    format:{ru:"короткий ответ",ua:"коротка відповідь"},
    question:{
      ru:`Дано: tg α = ${tset.label}. Найдите значение выражения: ${exprStr}`,
      ua:`Дано: tg α = ${tset.label}. Знайдіть значення виразу: ${exprStr}`
    },
    hint:{
      ru:"Разделите числитель и знаменатель на cos α — выражение сведётся к tg α.",
      ua:"Поділіть чисельник і знаменник на cos α — вираз зведеться до tg α."
    },
    solution:{
      ru:`Делим числитель и знаменатель на cos α: (${a}·tg α ${b>=0?"+":"−"} ${Math.abs(b)}) / (${c}·tg α ${d>=0?"+":"−"} ${Math.abs(d)}) = (${a}·(${tset.label}) ${b>=0?"+":"−"} ${Math.abs(b)}) / (${c}·(${tset.label}) ${d>=0?"+":"−"} ${Math.abs(d)}) = ${fmtNum(value)}.`,
      ua:`Ділимо чисельник і знаменник на cos α: (${a}·tg α ${b>=0?"+":"−"} ${Math.abs(b)}) / (${c}·tg α ${d>=0?"+":"−"} ${Math.abs(d)}) = (${a}·(${tset.label}) ${b>=0?"+":"−"} ${Math.abs(b)}) / (${c}·(${tset.label}) ${d>=0?"+":"−"} ${Math.abs(d)}) = ${fmtNum(value)}.`
    },
    expected:value, correctLabel: fmtNum(value),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && near(v, value, 0.02); }
  };
}
function genSimplifyEval(){
  const tr = rnd(PY_TRIPLES);
  const tanPositive = Math.random()<0.5;
  const quadrant = tanPositive ? rnd(["I","III"]) : rnd(["II","IV"]);
  const signs = {
    I:{sin:1,cos:1}, II:{sin:1,cos:-1}, III:{sin:-1,cos:-1}, IV:{sin:-1,cos:1}
  }[quadrant];
  const cosVal = signs.cos*tr.b/tr.c;
  const sinVal = signs.sin*tr.a/tr.c;
  const sum = sinVal+cosVal;
  const tanSign = (signs.sin*signs.cos)<0 ? "−" : "";
  const tanLabel = tanSign+tr.a+"/"+tr.b;
  return {
    topic:{ru:"sin α + cos α по tg α",ua:"sin α + cos α за tg α"},
    format:{ru:"десятичная дробь, округлите до 0.01",ua:"десятковий дріб, округліть до 0.01"},
    question:{
      ru:`tg α = ${tanLabel}, α — угол ${quadrant} четверти. Найдите sin α + cos α (округлите до 0.01).`,
      ua:`tg α = ${tanLabel}, α — кут ${quadrant} чверті. Знайдіть sin α + cos α (округліть до 0.01).`
    },
    hint:{
      ru:"Найдите cos α из 1+tg²α=1/cos²α, определите знак по четверти, затем sin α = tg α · cos α.",
      ua:"Знайдіть cos α з 1+tg²α=1/cos²α, визначте знак за чвертю, потім sin α = tg α · cos α."
    },
    solution:{
      ru:`Из 1+tg²α=1/cos²α: cos α = ${fmtNum(cosVal)}, sin α = tg α·cos α = ${fmtNum(sinVal)}. Тогда sin α + cos α = ${fmtNum(sinVal)} + (${fmtNum(cosVal)}) = ${fmtNum(sum)}.`,
      ua:`З 1+tg²α=1/cos²α: cos α = ${fmtNum(cosVal)}, sin α = tg α·cos α = ${fmtNum(sinVal)}. Тоді sin α + cos α = ${fmtNum(sinVal)} + (${fmtNum(cosVal)}) = ${fmtNum(sum)}.`
    },
    expected:sum, correctLabel: fmtNum(sum),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && near(v, sum, 0.02); }
  };
}
function genDoubleAngleSimplify(){
  const tset = rnd(TAN_SET);
  const value = tset.val; // sin2α/(1+cos2α) ≡ tg α
  return {
    topic:{ru:"Формула двойного угла",ua:"Формула подвійного кута"},
    format:{ru:"короткий ответ",ua:"коротка відповідь"},
    question:{
      ru:`Упростите выражение sin2α / (1 + cos2α) и найдите его значение, если tg α = ${tset.label}.`,
      ua:`Спростіть вираз sin2α / (1 + cos2α) і знайдіть його значення, якщо tg α = ${tset.label}.`
    },
    hint:{
      ru:"Используйте sin2α=2sinαcosα и cos2α=2cos²α−1, затем сократите на cos α.",
      ua:"Використайте sin2α=2sinαcosα і cos2α=2cos²α−1, потім скоротіть на cos α."
    },
    solution:{
      ru:`sin2α/(1+cos2α) = 2sinαcosα/(1+2cos²α−1) = 2sinαcosα/(2cos²α) = sinα/cosα = tg α = ${tset.label}.`,
      ua:`sin2α/(1+cos2α) = 2sinαcosα/(1+2cos²α−1) = 2sinαcosα/(2cos²α) = sinα/cosα = tg α = ${tset.label}.`
    },
    expected:value, correctLabel: fmtNum(value),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && near(v, value, 0.02); }
  };
}

/* ---- Найсложнейший уровень: комбинированные и параметрические ---- */
const TAN_ROOTS = [1,2,3,4,-1,-2,-3,-4];
function genHomogen(){
  let t1,t2;
  do{ t1=rnd(TAN_ROOTS); t2=rnd(TAN_ROOTS); } while(t1===t2);
  const B = -(t1+t2), C = t1*t2;
  const eqStr = `sin²x${fmtSignedTerm(B,"·sinx·cosx",false)}${fmtSignedTerm(C,"cos²x",false)} = 0`;
  return {
    topic:{ru:"Однородные уравнения",ua:"Однорідні рівняння"},
    format:{ru:"короткий ответ (укажите одно значение)",ua:"коротка відповідь (вкажіть одне значення)"},
    question:{
      ru:`Решите однородное уравнение: ${eqStr}. Укажите одно из значений tg x.`,
      ua:`Розв'яжіть однорідне рівняння: ${eqStr}. Вкажіть одне зі значень tg x.`
    },
    hint:{
      ru:"Разделите обе части на cos²x (cos x ≠ 0) — получите квадратное уравнение относительно tg x.",
      ua:"Поділіть обидві частини на cos²x (cos x ≠ 0) — отримаєте квадратне рівняння відносно tg x."
    },
    solution:{
      ru:`Делим на cos²x: tg²x + (${B})·tg x + (${C}) = 0. Корни: tg x = ${t1} и tg x = ${t2} (подходит любое из них).`,
      ua:`Ділимо на cos²x: tg²x + (${B})·tg x + (${C}) = 0. Корені: tg x = ${t1} і tg x = ${t2} (підходить будь-яке з них).`
    },
    expected:[t1,t2], correctLabel: t1+" / "+t2,
    check(input){ const v=parseAnswer(input); if(isNaN(v)) return false; return near(v,t1,0.02)||near(v,t2,0.02); }
  };
}
const ROOT_EQ_SET = [
  {fn:"sin", a:0, label:"0"}, {fn:"sin", a:1, label:"1"}, {fn:"sin", a:-1, label:"−1"},
  {fn:"sin", a:0.5, label:"1/2"}, {fn:"sin", a:-0.5, label:"−1/2"},
  {fn:"sin", a:0.7071068, label:"√2/2"}, {fn:"sin", a:0.8660254, label:"√3/2"},
  {fn:"cos", a:0, label:"0"}, {fn:"cos", a:1, label:"1"}, {fn:"cos", a:-1, label:"−1"},
  {fn:"cos", a:0.5, label:"1/2"}, {fn:"cos", a:-0.5, label:"−1/2"},
  {fn:"cos", a:0.7071068, label:"√2/2"}, {fn:"cos", a:-0.8660254, label:"−√3/2"}
];
const ROOT_INTERVALS = [
  {lo:0,hi:2*Math.PI,label:"[0; 2π]"},
  {lo:0,hi:4*Math.PI,label:"[0; 4π]"},
  {lo:-Math.PI,hi:Math.PI,label:"[−π; π]"},
  {lo:0,hi:3*Math.PI,label:"[0; 3π]"},
  {lo:-2*Math.PI,hi:2*Math.PI,label:"[−2π; 2π]"}
];
function countRootsInInterval(fn,a,lo,hi){
  const eps = 1e-6;
  let gens;
  if(fn==="sin"){
    if(near(a,1,1e-6)) gens=[n=>Math.PI/2+2*Math.PI*n];
    else if(near(a,-1,1e-6)) gens=[n=>-Math.PI/2+2*Math.PI*n];
    else if(near(a,0,1e-6)) gens=[n=>Math.PI*n];
    else { const base=Math.asin(a); gens=[n=>base+2*Math.PI*n, n=>(Math.PI-base)+2*Math.PI*n]; }
  } else {
    if(near(a,1,1e-6)) gens=[n=>2*Math.PI*n];
    else if(near(a,-1,1e-6)) gens=[n=>Math.PI+2*Math.PI*n];
    else if(near(a,0,1e-6)) gens=[n=>Math.PI/2+Math.PI*n];
    else { const base=Math.acos(a); gens=[n=>base+2*Math.PI*n, n=>-base+2*Math.PI*n]; }
  }
  const found = new Set();
  gens.forEach(g=>{
    for(let n=-30;n<=30;n++){
      const x=g(n);
      if(x>=lo-eps && x<=hi+eps) found.add(Math.round(x*10000));
    }
  });
  return found.size;
}
function genRootsCount(){
  const eq = rnd(ROOT_EQ_SET);
  const interval = rnd(ROOT_INTERVALS);
  const count = countRootsInInterval(eq.fn, eq.a, interval.lo, interval.hi);
  return {
    topic:{ru:"Число корней на промежутке",ua:"Кількість коренів на проміжку"},
    format:{ru:"целое число",ua:"ціле число"},
    question:{
      ru:`Сколько корней имеет уравнение ${eq.fn} x = ${eq.label} на промежутке ${interval.label}?`,
      ua:`Скільки коренів має рівняння ${eq.fn} x = ${eq.label} на проміжку ${interval.label}?`
    },
    hint:{
      ru:"Запишите общее решение и подставьте границы промежутка вместо x, чтобы найти подходящие n.",
      ua:"Запишіть загальний розв'язок і підставте межі проміжку замість x, щоб знайти відповідні n."
    },
    solution:{
      ru:`Записываем общее решение уравнения ${eq.fn} x = ${eq.label} и отбираем те решения, что попадают в промежуток ${interval.label}: их ${count}.`,
      ua:`Записуємо загальний розв'язок рівняння ${eq.fn} x = ${eq.label} і відбираємо ті розв'язки, що потрапляють у проміжок ${interval.label}: їх ${count}.`
    },
    expected:count, correctLabel:String(count),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && Math.round(v)===count; }
  };
}
function genParamRange(){
  const fn = rnd(["sin","cos"]);
  const m = rnd([1,2]);
  const c = rnd([2,3,4,5]);
  const lo = (c-1)/m;
  const mStr = m===1 ? "" : m+"·";
  return {
    topic:{ru:"Параметр в уравнении",ua:"Параметр у рівнянні"},
    format:{ru:"короткий ответ",ua:"коротка відповідь"},
    question:{
      ru:`При каких значениях параметра a уравнение ${fn} x = ${mStr}a − ${c} имеет решения? Укажите наименьшее возможное значение a.`,
      ua:`При яких значеннях параметра a рівняння ${fn} x = ${mStr}a − ${c} має розв'язки? Вкажіть найменше можливе значення a.`
    },
    hint:{
      ru:"Правая часть должна лежать в пределах [−1;1] — составьте двойное неравенство и выразите a.",
      ua:"Права частина має лежати в межах [−1;1] — складіть подвійну нерівність і виразіть a."
    },
    solution:{
      ru:`Для существования решений нужно −1 ≤ ${mStr}a − ${c} ≤ 1, то есть ${c-1} ≤ ${mStr}a ≤ ${c+1}. Наименьшее значение: a = (${c}−1)/${m} = ${fmtNum(lo)}.`,
      ua:`Для існування розв'язків потрібно −1 ≤ ${mStr}a − ${c} ≤ 1, тобто ${c-1} ≤ ${mStr}a ≤ ${c+1}. Найменше значення: a = (${c}−1)/${m} = ${fmtNum(lo)}.`
    },
    expected:lo, correctLabel: fmtNum(lo),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && near(v, lo, 0.02); }
  };
}
function genMaxSum(){
  const A = rnd([1,2,3,4]) * (Math.random()<0.5?1:-1);
  const B = rnd([1,2,3,4]) * (Math.random()<0.5?1:-1);
  const maxVal = Math.sqrt(A*A+B*B);
  const fnStr = `${A}sin x ${B<0?'−':'+'} ${Math.abs(B)}cos x`;
  return {
    topic:{ru:"Максимум A sinx + B cosx",ua:"Максимум A sinx + B cosx"},
    format:{ru:"десятичная дробь, округлите до 0.01",ua:"десятковий дріб, округліть до 0.01"},
    question:{
      ru:`Найдите наибольшее значение функции f(x) = ${fnStr} (округлите до 0.01).`,
      ua:`Знайдіть найбільше значення функції f(x) = ${fnStr} (округліть до 0.01).`
    },
    hint:{
      ru:"Максимум выражения A sinx + B cosx равен √(A²+B²).",
      ua:"Максимум виразу A sinx + B cosx дорівнює √(A²+B²)."
    },
    solution:{
      ru:`Максимум A sinx + B cosx равен √(A²+B²) = √(${A}² + (${B})²) = √(${A*A + B*B}) = ${fmtNum(maxVal)}.`,
      ua:`Максимум A sinx + B cosx дорівнює √(A²+B²) = √(${A}² + (${B})²) = √(${A*A + B*B}) = ${fmtNum(maxVal)}.`
    },
    expected:maxVal, correctLabel: fmtNum(maxVal),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && near(v, maxVal, 0.02); }
  };
}

/* ---- Показательная и логарифмическая тематика (Модуль 2) ---- */
const SUP_MAP = {'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','-':'⁻'};
const SUB_MAP = {'0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉'};
function supNum(n){ return String(n).split('').map(ch=>SUP_MAP[ch]||ch).join(''); }
function subNum(n){ return String(n).split('').map(ch=>SUB_MAP[ch]||ch).join(''); }

function genExpBasicMC(){
  const a = rnd([2,3,5]);
  const n = rnd([1,2,3,4,-1,-2]);
  const correct = String(n);
  let pool = shuffleArr([n+1,n-1,-n,n*2].map(String).filter(v=>v!==correct));
  pool = [...new Set(pool)];
  const distractors = pool.slice(0,3);
  const {opts,correctIdx} = buildMC(correct, distractors);
  return {
    topic:{ru:"Показательное уравнение (основа)",ua:"Показникове рівняння (основа)"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{ru:`Решите: ${a}ˣ = ${a}${supNum(n)}`, ua:`Розв'яжіть: ${a}ˣ = ${a}${supNum(n)}`},
    hint:{ru:"Основания одинаковые — значит показатели равны.",ua:"Основи однакові — отже показники рівні."},
    solution:{
      ru:`Основания одинаковы и равны ${a}, поэтому приравниваем показатели: x = ${n}.`,
      ua:`Основи однакові й дорівнюють ${a}, тому прирівнюємо показники: x = ${n}.`
    },
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}
function genLogBasicMC(){
  const a = rnd([2,3,5,10]);
  const n = rnd([1,2,3,4,-1,-2]);
  const correct = String(n);
  let pool = [...new Set([n+1,n-1,a,-n,a+n,a-n,n*2,a*n].map(String))].filter(v=>v!==correct);
  for(const e of ["0","1","-1","2","-2",String(a+1),String(a-1)]){ if(pool.length>=3) break; if(e!==correct && pool.indexOf(e)<0) pool.push(e); }
  const distractors = shuffleArr(pool).slice(0,3);
  const {opts,correctIdx} = buildMC(correct, distractors);
  return {
    topic:{ru:"Логарифмическое тождество",ua:"Логарифмічна тотожність"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{ru:`Чему равен log${subNum(a)}(${a}${supNum(n)})?`, ua:`Чому дорівнює log${subNum(a)}(${a}${supNum(n)})?`},
    hint:{ru:"Используй основное логарифмическое тождество: logₐ(aⁿ)=n.",ua:"Використай основну логарифмічну тотожність: logₐ(aⁿ)=n."},
    solution:{
      ru:`По основному логарифмическому тождеству logₐ(aⁿ)=n: log${subNum(a)}(${a}${supNum(n)}) = ${n}.`,
      ua:`За основною логарифмічною тотожністю logₐ(aⁿ)=n: log${subNum(a)}(${a}${supNum(n)}) = ${n}.`
    },
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}
function genExpEquationShort(){
  const a = rnd([2,3,5]);
  const s = rnd([-3,-2,-1,0,1,2,3]);
  const n = rnd([-2,-1,0,1,2,3,4]);
  const x = n - s;
  const rhsStr = n>=0 ? String(Math.pow(a,n)) : "1/"+Math.pow(a,-n);
  const sStr = s===0 ? "" : (s>0 ? " + "+s : " − "+Math.abs(s));
  return {
    topic:{ru:"Показательное уравнение",ua:"Показникове рівняння"},
    format:{ru:"целое число",ua:"ціле число"},
    question:{
      ru:`Решите: ${a}^(x${sStr}) = ${rhsStr}. Найдите x.`,
      ua:`Розв'яжіть: ${a}^(x${sStr}) = ${rhsStr}. Знайдіть x.`
    },
    hint:{
      ru:`Представьте ${rhsStr} как степень числа ${a}, затем приравняйте показатели.`,
      ua:`Подайте ${rhsStr} як степінь числа ${a}, потім прирівняйте показники.`
    },
    solution:{
      ru:`Представляем ${rhsStr} = ${a}${supNum(n)}. Приравниваем показатели: x${sStr} = ${n}, откуда x = ${x}.`,
      ua:`Подаємо ${rhsStr} = ${a}${supNum(n)}. Прирівнюємо показники: x${sStr} = ${n}, звідки x = ${x}.`
    },
    expected:x, correctLabel:String(x),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && near(v, x, 0.02); }
  };
}
function genLogEquationShort(){
  const a = rnd([2,3,5]);
  const s = rnd([-3,-2,-1,0,1,2,3]);
  const n = rnd([0,1,2,3]);
  const x = Math.pow(a,n) - s;
  const sStr = s===0 ? "" : (s>0 ? " + "+s : " − "+Math.abs(s));
  return {
    topic:{ru:"Логарифмическое уравнение",ua:"Логарифмічне рівняння"},
    format:{ru:"целое число",ua:"ціле число"},
    question:{
      ru:`Решите: log${subNum(a)}(x${sStr}) = ${n}. Найдите x.`,
      ua:`Розв'яжіть: log${subNum(a)}(x${sStr}) = ${n}. Знайдіть x.`
    },
    hint:{
      ru:`Потенцируйте: x${sStr} = ${a}${supNum(n)}.`,
      ua:`Потенціюйте: x${sStr} = ${a}${supNum(n)}.`
    },
    solution:{
      ru:`Потенцируем: x${sStr} = ${a}${supNum(n)} = ${Math.pow(a,n)}, значит x = ${x}.`,
      ua:`Потенціюємо: x${sStr} = ${a}${supNum(n)} = ${Math.pow(a,n)}, отже x = ${x}.`
    },
    expected:x, correctLabel:String(x),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && near(v, x, 0.02); }
  };
}
const EXP_T_SET = [1,2,4,8,16,0.5,0.25];
function genExpSubstitution(){
  let t1,t2;
  do{ t1=rnd(EXP_T_SET); t2=rnd(EXP_T_SET); } while(t1===t2);
  const B = t1+t2, C = t1*t2;
  const x1 = Math.log2(t1), x2 = Math.log2(t2);
  return {
    topic:{ru:"Показательное уравнение (замена)",ua:"Показникове рівняння (заміна)"},
    format:{ru:"короткий ответ (укажите одно значение)",ua:"коротка відповідь (вкажіть одне значення)"},
    question:{
      ru:`Решите: 4ˣ − ${B}·2ˣ + ${C} = 0. Укажите одно из значений x.`,
      ua:`Розв'яжіть: 4ˣ − ${B}·2ˣ + ${C} = 0. Вкажіть одне зі значень x.`
    },
    hint:{
      ru:"Замена t=2ˣ (t>0) сводит уравнение к квадратному: t²−"+B+"t+"+C+"=0.",
      ua:"Заміна t=2ˣ (t>0) зводить рівняння до квадратного: t²−"+B+"t+"+C+"=0."
    },
    solution:{
      ru:`Замена t=2ˣ (t>0): t² − ${B}t + ${C} = 0, корни t = ${t1} и t = ${t2}. Тогда 2ˣ = ${t1} ⇒ x = ${x1}, 2ˣ = ${t2} ⇒ x = ${x2}.`,
      ua:`Заміна t=2ˣ (t>0): t² − ${B}t + ${C} = 0, корені t = ${t1} і t = ${t2}. Тоді 2ˣ = ${t1} ⇒ x = ${x1}, 2ˣ = ${t2} ⇒ x = ${x2}.`
    },
    expected:[x1,x2], correctLabel: x1+" / "+x2,
    check(input){ const v=parseAnswer(input); if(isNaN(v)) return false; return near(v,x1,0.02)||near(v,x2,0.02); }
  };
}
function genLogInequalityBoundary(){
  const a = rnd([2,3,5]);
  const n = rnd([0,1,2,3]);
  const boundary = Math.pow(a,n);
  const answer = boundary+1;
  return {
    topic:{ru:"Логарифмическое неравенство",ua:"Логарифмічна нерівність"},
    format:{ru:"целое число",ua:"ціле число"},
    question:{
      ru:`Решите: log${subNum(a)}(x) > ${n}. Укажите наименьшее целое число, удовлетворяющее неравенству.`,
      ua:`Розв'яжіть: log${subNum(a)}(x) > ${n}. Вкажіть найменше ціле число, яке задовольняє нерівність.`
    },
    hint:{
      ru:`Основание ${a}>1 — знак сохраняется: x > ${a}${supNum(n)} = ${boundary}.`,
      ua:`Основа ${a}>1 — знак зберігається: x > ${a}${supNum(n)} = ${boundary}.`
    },
    solution:{
      ru:`Основание ${a}>1, знак неравенства сохраняется: x > ${a}${supNum(n)} = ${boundary}. Так как x строго больше ${boundary}, наименьшее целое — ${answer}.`,
      ua:`Основа ${a}>1, знак нерівності зберігається: x > ${a}${supNum(n)} = ${boundary}. Оскільки x строго більше ${boundary}, найменше ціле — ${answer}.`
    },
    expected:answer, correctLabel:String(answer),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && near(v, answer, 0.02); }
  };
}

/* ---- Начало анализа: пределы и производные (Модуль 3) ---- */
function genLimitDirectMC(){
  const a = rnd([2,3,4,5,-2,-3]);
  const b = rnd([1,2,3,-1,-2,-4]);
  const c = rnd([-3,-2,-1,0,1,2,3]);
  const correct = a*c+b;
  let pool = shuffleArr([correct+1,correct-1,a*c-b,a+c].map(String).filter(v=>v!==String(correct)));
  pool = [...new Set(pool)];
  const distractors = pool.slice(0,3);
  const {opts,correctIdx} = buildMC(String(correct), distractors);
  const bStr = b>=0 ? " + "+b : " − "+Math.abs(b);
  return {
    topic:{ru:"Предел подстановкой",ua:"Границя підстановкою"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{ru:`lim(x→${c}) (${a}x${bStr}) равен:`, ua:`lim(x→${c}) (${a}x${bStr}) дорівнює:`},
    hint:{ru:"Функция непрерывна — подставь значение x прямо в выражение.",ua:"Функція неперервна — підстав значення x прямо у вираз."},
    solution:{
      ru:`Функция непрерывна, поэтому подставляем x = ${c}: ${a}·(${c})${bStr} = ${correct}.`,
      ua:`Функція неперервна, тому підставляємо x = ${c}: ${a}·(${c})${bStr} = ${correct}.`
    },
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}
const DERIV_TABLE_MC = [
  {f:"xⁿ", fp:"n·xⁿ⁻¹"}, {f:"sin x", fp:"cos x"}, {f:"cos x", fp:"−sin x"},
  {f:"eˣ", fp:"eˣ"}, {f:"ln x", fp:"1/x"}, {f:"tan x", fp:"1/cos²x"}
];
function genDerivTableMC(){
  const item = rnd(DERIV_TABLE_MC);
  const pool = shuffleArr(DERIV_TABLE_MC.filter(d=>d!==item).map(d=>d.fp));
  const distractors = pool.slice(0,3);
  const {opts,correctIdx} = buildMC(item.fp, distractors);
  return {
    topic:{ru:"Таблица производных",ua:"Таблиця похідних"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{ru:`Чему равна производная (${item.f})′?`, ua:`Чому дорівнює похідна (${item.f})′?`},
    hint:{ru:"Вспомни таблицу производных из урока.",ua:"Згадай таблицю похідних з уроку."},
    solution:{
      ru:`По таблице производных: (${item.f})′ = ${item.fp}.`,
      ua:`За таблицею похідних: (${item.f})′ = ${item.fp}.`
    },
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}
function genLimitFactorShort(){
  const a = rnd([1,2,3,-1,-2]);
  const b = rnd([1,2,3,-1,-2,-3].filter(v=>v!==a));
  const answer = a-b;
  const C = a+b, D = a*b;
  const CStr = C>=0 ? " − "+C : " + "+Math.abs(C);
  const DStr = D>=0 ? " + "+D : " − "+Math.abs(D);
  return {
    topic:{ru:"Предел с сокращением",ua:"Границя зі скороченням"},
    format:{ru:"целое число",ua:"ціле число"},
    question:{
      ru:`Найдите lim(x→${a}) (x²${CStr}x${DStr}) / (x−${a})`,
      ua:`Знайдіть lim(x→${a}) (x²${CStr}x${DStr}) / (x−${a})`
    },
    hint:{ru:"Разложи числитель на множители (x−"+a+")(x−"+b+") и сократи.",ua:"Розклади чисельник на множники (x−"+a+")(x−"+b+") і скороти."},
    solution:{
      ru:`Числитель раскладывается как (x−${a})(x−${b}). После сокращения на (x−${a}) предел равен ${a}−(${b}) = ${answer}.`,
      ua:`Чисельник розкладається як (x−${a})(x−${b}). Після скорочення на (x−${a}) границя дорівнює ${a}−(${b}) = ${answer}.`
    },
    expected:answer, correctLabel:String(answer),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && near(v, answer, 0.02); }
  };
}
function genDerivativeAtPoint(){
  const b = rnd([-4,-3,-2,-1,1,2,3,4]);
  const c = rnd([-3,-2,-1,0,1,2,3]);
  const a = rnd([-2,-1,0,1,2,3]);
  const answer = 3*a*a+b;
  const bStr = b>=0 ? " + "+b+"x" : " − "+Math.abs(b)+"x";
  const cStr = c>0 ? " + "+c : (c<0 ? " − "+Math.abs(c) : "");
  return {
    topic:{ru:"Производная в точке",ua:"Похідна в точці"},
    format:{ru:"целое число",ua:"ціле число"},
    question:{
      ru:`f(x) = x³${bStr}${cStr}. Найдите f′(${a}).`,
      ua:`f(x) = x³${bStr}${cStr}. Знайдіть f′(${a}).`
    },
    hint:{ru:"f′(x)=3x²+"+b+". Подставь x="+a+".",ua:"f′(x)=3x²+"+b+". Підстав x="+a+"."},
    solution:{
      ru:`f′(x) = 3x²${b>=0?" + "+b:" − "+Math.abs(b)}. При x = ${a}: 3·(${a})²${b>=0?" + "+b:" − "+Math.abs(b)} = ${answer}.`,
      ua:`f′(x) = 3x²${b>=0?" + "+b:" − "+Math.abs(b)}. При x = ${a}: 3·(${a})²${b>=0?" + "+b:" − "+Math.abs(b)} = ${answer}.`
    },
    expected:answer, correctLabel:String(answer),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && near(v, answer, 0.02); }
  };
}
function genSecondRemarkableGeneral(){
  const k = rnd([1,2,3,-1,-2]);
  const answer = Math.exp(k);
  return {
    topic:{ru:"Второй замечательный предел",ua:"Друга чудова границя"},
    format:{ru:"десятичная дробь, округлите до 0.01",ua:"десятковий дріб, округліть до 0.01"},
    question:{
      ru:`Найдите lim(x→∞) (1 + ${k}/x)ˣ (округлите до 0.01)`,
      ua:`Знайдіть lim(x→∞) (1 + ${k}/x)ˣ (округліть до 0.01)`
    },
    hint:{ru:"lim(x→∞)(1+k/x)ˣ = eᵏ. Вычисли e^"+k+".",ua:"lim(x→∞)(1+k/x)ˣ = eᵏ. Обчисли e^"+k+"."},
    solution:{
      ru:`Второй замечательный предел: lim(x→∞)(1+k/x)ˣ = eᵏ. При k = ${k}: e${supNum(k)} ≈ ${fmtNum(answer)}.`,
      ua:`Друга чудова границя: lim(x→∞)(1+k/x)ˣ = eᵏ. При k = ${k}: e${supNum(k)} ≈ ${fmtNum(answer)}.`
    },
    expected:answer, correctLabel: fmtNum(answer)+" (e"+supNum(k)+")",
    check(input){ const v=parseAnswer(input); return !isNaN(v) && near(v, answer, 0.02); }
  };
}
function genExtremumPoint(){
  const a = rnd([1,2,3]);
  const coef = 3*a*a;
  return {
    topic:{ru:"Точка экстремума",ua:"Точка екстремуму"},
    format:{ru:"целое число",ua:"ціле число"},
    question:{
      ru:`f(x) = x³ − ${coef}x. Найдите точку минимума функции.`,
      ua:`f(x) = x³ − ${coef}x. Знайдіть точку мінімуму функції.`
    },
    hint:{ru:"f′(x)=3x²−"+coef+"=0 → x²="+a*a+" → x=±"+a+". Определи знак f′ вокруг каждой точки.",ua:"f′(x)=3x²−"+coef+"=0 → x²="+a*a+" → x=±"+a+". Визнач знак f′ навколо кожної точки."},
    solution:{
      ru:`f′(x) = 3x² − ${coef} = 0 ⇒ x = ±${a}. В точке x = ${a} производная меняет знак с «−» на «+», это точка минимума.`,
      ua:`f′(x) = 3x² − ${coef} = 0 ⇒ x = ±${a}. У точці x = ${a} похідна змінює знак з «−» на «+», це точка мінімуму.`
    },
    expected:a, correctLabel:String(a),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && near(v, a, 0.02); }
  };
}

/* ---- Интегралы (Модуль 4) ---- */
function genAntiderivativeBasicMC(){
  const n = rnd([1,2,3,4,5]);
  const correct = `x${supNum(n+1)}/${n+1}+C`;
  const distractors = shuffleArr([
    `x${supNum(n+1)}+C`,
    `${n}·x${supNum(n-1)}+C`,
    `x${supNum(n)}/${n}+C`
  ]);
  const {opts,correctIdx} = buildMC(correct, distractors);
  return {
    topic:{ru:"Первообразная (основа)",ua:"Первісна (основа)"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{ru:`∫x${supNum(n)}dx равен:`, ua:`∫x${supNum(n)}dx дорівнює:`},
    hint:{ru:"Используй ∫xⁿdx=xⁿ⁺¹/(n+1)+C.",ua:"Використай ∫xⁿdx=xⁿ⁺¹/(n+1)+C."},
    solution:{
      ru:`По формуле ∫xⁿdx = xⁿ⁺¹/(n+1) + C: ∫x${supNum(n)}dx = x${supNum(n+1)}/${n+1} + C.`,
      ua:`За формулою ∫xⁿdx = xⁿ⁺¹/(n+1) + C: ∫x${supNum(n)}dx = x${supNum(n+1)}/${n+1} + C.`
    },
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}
function genDefiniteIntegralPolyMC(){
  const b = rnd([1,2,3,4,5]);
  const correct = b*b;
  const correctStr = String(correct);
  const cand = [correct+1, correct-1, correct+b, correct-b, correct+2*b, correct-2*b].map(String).filter(v=>v!==correctStr);
  const distractors = [...new Set(cand)].slice(0,3);
  const {opts,correctIdx} = buildMC(correctStr, distractors);
  return {
    topic:{ru:"Определённый интеграл (основа)",ua:"Визначений інтеграл (основа)"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{ru:`∫[0;${b}] 2x dx равен:`, ua:`∫[0;${b}] 2x dx дорівнює:`},
    hint:{ru:"Первообразная 2x — это x². Подставь границы: b²−0².",ua:"Первісна 2x — це x². Підстав межі: b²−0²."},
    solution:{
      ru:`Первообразная 2x равна x². Подставляем границы: ${b}² − 0² = ${correct}.`,
      ua:`Первісна 2x дорівнює x². Підставляємо межі: ${b}² − 0² = ${correct}.`
    },
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}
function genDefiniteIntegralLinearShort(){
  const a = rnd([1,2,3,-1,-2]);
  const b = rnd([1,2,3,-1,-2,0]);
  const p = rnd([0,1,2]);
  const q = rnd([3,4,5].filter(v=>v>p));
  const F = x => a*x*x/2 + b*x;
  const answer = F(q)-F(p);
  const bStr = b===0 ? "" : (b>0?" + "+b+"x":" − "+Math.abs(b)+"x");
  return {
    topic:{ru:"Определённый интеграл (линейный)",ua:"Визначений інтеграл (лінійний)"},
    format:{ru:"десятичная дробь, округлите до 0.01",ua:"десятковий дріб, округліть до 0.01"},
    question:{
      ru:`Вычислите ∫[${p};${q}] (${a}x${bStr}) dx`,
      ua:`Обчисліть ∫[${p};${q}] (${a}x${bStr}) dx`
    },
    hint:{ru:"Найди первообразную F(x), затем вычисли F("+q+")−F("+p+").",ua:"Знайди первісну F(x), потім обчисли F("+q+")−F("+p+")."},
    solution:{
      ru:`F(x) = ${a}x²/2${b===0?"":(b>0?" + "+b+"x":" − "+Math.abs(b)+"x")}. Тогда F(${q}) − F(${p}) = ${fmtNum(answer)}.`,
      ua:`F(x) = ${a}x²/2${b===0?"":(b>0?" + "+b+"x":" − "+Math.abs(b)+"x")}. Тоді F(${q}) − F(${p}) = ${fmtNum(answer)}.`
    },
    expected:answer, correctLabel:fmtNum(answer),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && near(v, answer, 0.02); }
  };
}
function genAreaUnderCubicShort(){
  const k = rnd([1,2,3]);
  const b = rnd([1,2,3]);
  const answer = k*Math.pow(b,3);
  return {
    topic:{ru:"Площадь под параболой",ua:"Площа під параболою"},
    format:{ru:"целое число",ua:"ціле число"},
    question:{
      ru:`Найдите площадь фигуры, ограниченной y=${3*k}x² и осью Ox на [0;${b}].`,
      ua:`Знайдіть площу фігури, обмеженої y=${3*k}x² і віссю Ox на [0;${b}].`
    },
    hint:{ru:"Первообразная "+(3*k)+"x² — это "+k+"x³. Подставь границы.",ua:"Первісна "+(3*k)+"x² — це "+k+"x³. Підстав межі."},
    solution:{
      ru:`S = ∫[0;${b}] ${3*k}x² dx = ${k}x³ |[0;${b}] = ${k}·${b}³ = ${answer}.`,
      ua:`S = ∫[0;${b}] ${3*k}x² dx = ${k}x³ |[0;${b}] = ${k}·${b}³ = ${answer}.`
    },
    expected:answer, correctLabel:String(answer),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && near(v, answer, 0.02); }
  };
}
function genAreaBetweenCurvesHigh(){
  const k = rnd([1,2,3,4]);
  const answer = Math.pow(k,3)/6;
  return {
    topic:{ru:"Площадь между кривыми",ua:"Площа між кривими"},
    format:{ru:"десятичная дробь, округлите до 0.001",ua:"десятковий дріб, округліть до 0.001"},
    question:{
      ru:`Найдите площадь фигуры между y=${k}x и y=x² (при x≥0).`,
      ua:`Знайдіть площу фігури між y=${k}x і y=x² (при x≥0).`
    },
    hint:{ru:"Точки пересечения: 0 и "+k+". S=∫[0;"+k+"]("+k+"x−x²)dx.",ua:"Точки перетину: 0 і "+k+". S=∫[0;"+k+"]("+k+"x−x²)dx."},
    solution:{
      ru:`Точки пересечения ${k}x = x²: x = 0 и x = ${k}. S = ∫[0;${k}](${k}x − x²)dx = ${fmtNum(answer)}.`,
      ua:`Точки перетину ${k}x = x²: x = 0 і x = ${k}. S = ∫[0;${k}](${k}x − x²)dx = ${fmtNum(answer)}.`
    },
    expected:answer, correctLabel:fmtNum(answer),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && near(v, answer, 0.02); }
  };
}
function genAbsAreaHigh(){
  const n = rnd([1,2,3,4]);
  const answer = 2*n;
  return {
    topic:{ru:"Площадь под синусоидой",ua:"Площа під синусоїдою"},
    format:{ru:"целое число",ua:"ціле число"},
    question:{
      ru:`Найдите площадь фигуры между y=sin x и осью Ox на [0;${n}π].`,
      ua:`Знайдіть площу фігури між y=sin x і віссю Ox на [0;${n}π].`
    },
    hint:{ru:"Каждая «арка» синуса даёт площадь 2. Сколько таких арок на [0;"+n+"π]?",ua:"Кожна «арка» синуса дає площу 2. Скільки таких арок на [0;"+n+"π]?"},
    solution:{
      ru:`Каждая арка sin x даёт площадь 2. На [0;${n}π] таких арок ${n}, поэтому S = 2·${n} = ${answer}.`,
      ua:`Кожна арка sin x дає площу 2. На [0;${n}π] таких арок ${n}, тому S = 2·${n} = ${answer}.`
    },
    expected:answer, correctLabel:String(answer),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && near(v, answer, 0.02); }
  };
}

/* ---- Стереометрия (Модуль 5) ---- */
function genPrismVolumeMC(){
  const S = rnd([6,8,9,10,12,14,15,18,20]);
  const h = rnd([2,3,4,5,6,7,8]);
  const correct = S*h;
  let pool = [...new Set([S+h, Math.round(S*h/2), 2*S*h, S*h-h, S*h+h, S+h+1].map(String))].filter(v=>v!==String(correct));
  for(const e of [String(correct+1),String(correct-1),String(correct+2),String(correct*2)]){ if(pool.length>=3) break; if(e!==String(correct) && pool.indexOf(e)<0) pool.push(e); }
  const distractors = shuffleArr(pool).slice(0,3);
  const {opts,correctIdx} = buildMC(String(correct), distractors);
  return {
    topic:{ru:"Объём призмы",ua:"Об'єм призми"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{ru:`Призма: Sосн=${S}, h=${h}. Объём равен:`, ua:`Призма: Sосн=${S}, h=${h}. Об'єм дорівнює:`},
    hint:{ru:"V=Sосн·h.",ua:"V=Sосн·h."},
    solution:{
      ru:`V = Sосн·h = ${S}·${h} = ${correct}.`,
      ua:`V = Sосн·h = ${S}·${h} = ${correct}.`
    },
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}
function genSphereSurfaceMC(){
  const R = rnd([1,2,4,5]);
  const correct = 4*Math.PI*R*R;
  const distractors = [2*Math.PI*R*R, Math.PI*R*R, 8*Math.PI*R*R].map(v=>fmtNum(v));
  const {opts,correctIdx} = buildMC(fmtNum(correct), distractors);
  return {
    topic:{ru:"Площадь поверхности сферы",ua:"Площа поверхні сфери"},
    format:{ru:"десятичная дробь, округлите до 0.01",ua:"десятковий дріб, округліть до 0.01"},
    question:{ru:`Площадь поверхности сферы радиуса R=${R} равна (в единицах π):`, ua:`Площа поверхні сфери радіуса R=${R} дорівнює (в одиницях π):`},
    hint:{ru:"S=4πR².",ua:"S=4πR²."},
    solution:{
      ru:`S = 4πR² = 4π·${R}² = ${4*R*R}π ≈ ${fmtNum(correct)} (в числовом виде).`,
      ua:`S = 4πR² = 4π·${R}² = ${4*R*R}π ≈ ${fmtNum(correct)} (у числовому вигляді).`
    },
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}
function genTriangleFeaturesMC(){
  const concept = rnd([
    {key:"height", ru:"высота", ua:"висота", qa:{ru:"Высота треугольника — это:",ua:"Висота трикутника — це:"}, opts:{ru:["перпендикуляр из вершины к противоположной стороне","отрезок, соединяющий вершину с серединой стороны","луч, делящий угол пополам","отрезок, параллельный стороне и равный ей половине"],ua:["перпендикуляр із вершини до протилежної сторони","відрізок, що з'єднує вершину з серединою сторони","промінь, що ділить кут навпіл","відрізок, паралельний стороні і рівний їй половині"]}, correct:0},
    {key:"median", ru:"медиана", ua:"медіана", qa:{ru:"Медиана треугольника — это:",ua:"Медіана трикутника — це:"}, opts:{ru:["отрезок из вершины к середине противоположной стороны","перпендикуляр к стороне","луч, делящий угол пополам","отрезок, соединяющий середины двух сторон"],ua:["відрізок із вершини до середини протилежної сторони","перпендикуляр до сторони","промінь, що ділить кут навпіл","відрізок, що сполучає середини двох сторін"]}, correct:0},
    {key:"bisector", ru:"биссектриса", ua:"бісектриса", qa:{ru:"Биссектриса угла треугольника:",ua:"Бісектриса кута трикутника:"}, opts:{ru:["делит угол пополам","всегда перпендикулярна стороне","соединяет вершину с серединой противоположной стороны","параллельна основанию"],ua:["ділить кут навпіл","завжди перпендикулярна до сторони","сполучає вершину з серединою протилежної сторони","паралельна основі"]}, correct:0},
    {key:"midline", ru:"средняя линия", ua:"середня лінія", qa:{ru:"Средняя линия треугольника:",ua:"Середня лінія трикутника:"}, opts:{ru:["параллельна одной из сторон и равна её половине","всегда равна сумме двух сторон","перпендикулярна основанию","делит треугольник пополам"],ua:["паралельна одній зі сторін і дорівнює її половині","завжди дорівнює сумі двох сторін","перпендикулярна до основи","ділить трикутник навпіл"]}, correct:0}
  ]);
  const item = concept;
  const idx = shuffleArr([0,1,2,3]);
  const optsRu = idx.map(i=>item.opts.ru[i]);
  const optsUa = idx.map(i=>item.opts.ua[i]);
  const correctIdx = idx.indexOf(0);
  return {
    topic:{ru:"Элементы треугольника",ua:"Елементи трикутника"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{ru:item.qa.ru,ua:item.qa.ua},
    hint:{ru:`Ключевое свойство: ${item.ru}.`,ua:`Ключова властивість: ${item.ua}.`},
    solution:{
      ru:`Правильный ответ: ${item.opts.ru[0]}.`,
      ua:`Правильна відповідь: ${item.opts.ua[0]}.`
    },
    options:{ru:optsRu,ua:optsUa}, correct:correctIdx
  };
}
function genRegularPolygonMC(){
  const n = rnd([3,4,5,6,8,10]);
  const central = 360 / n;
  const internal = 180 - central;
  const correct = `${internal}°`;
  const cand = [
    `${central}°`,
    `${180 / n}°`,
    `${(n - 2) * 180}°`,
    `${internal + 10}°`,
    `${internal - 10}°`
  ].filter((value, idx, arr) => arr.indexOf(value) === idx && value !== correct);
  const distractors = cand.slice(0,3);
  const {opts,correctIdx} = buildMC(correct, distractors);
  return {
    topic:{ru:"Правильный многоугольник",ua:"Правильний многокутник"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{
      ru:`В правильном ${n}-угольнике внутренний угол равен:`,
      ua:`У правильному ${n}-кутнику внутрішній кут дорівнює:`
    },
    hint:{
      ru:"Внутренний угол = 180° − 360°/n. Центр. угол = 360°/n.",
      ua:"Внутрішній кут = 180° − 360°/n. Центр. кут = 360°/n."
    },
    solution:{
      ru:`Внутренний угол правильного ${n}-угольника: 180° − 360°/${n} = ${internal}°.`,
      ua:`Внутрішній кут правильного ${n}-кутника: 180° − 360°/${n} = ${internal}°.`
    },
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}
function genAngleBisectorMC(){
  const optsRu = ["Биссектриса","Медиана","Высота","Средняя линия"];
  const optsUa = ["Бісектриса","Медіана","Висота","Середня лінія"];
  const idx = shuffleArr([0,1,2,3]);
  return {
    topic:{ru:"Биссектриса",ua:"Бісектриса"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{
      ru:"Отрезок, который делит угол треугольника пополам, называется:",
      ua:"Відрізок, який ділить кут трикутника навпіл, називається:"
    },
    hint:{
      ru:"Это линия из вершины угла, которая делит угол на два равных угла.",
      ua:"Це лінія з вершини кута, яка ділить кут на два рівні кути."
    },
    solution:{
      ru:"Биссектриса делит угол пополам.",
      ua:"Бісектриса ділить кут навпіл."
    },
    options:{ru:idx.map(i=>optsRu[i]),ua:idx.map(i=>optsUa[i])}, correct:idx.indexOf(0)
  };
}
function genMedianMC(){
  const optsRu = ["Медиана","Биссектриса","Высота","Средняя линия"];
  const optsUa = ["Медіана","Бісектриса","Висота","Середня лінія"];
  const idx = shuffleArr([0,1,2,3]);
  return {
    topic:{ru:"Медиана",ua:"Медіана"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{
      ru:"Отрезок, соединяющий вершину треугольника с серединой противоположной стороны, называется:",
      ua:"Відрізок, який з'єднує вершину трикутника з серединою протилежної сторони, називається:"
    },
    hint:{
      ru:"Медиана идет из вершины к середине противоположной стороны.",
      ua:"Медіана йде з вершини до середини протилежної сторони."
    },
    solution:{
      ru:"Медиана соединяет вершину с серединой противоположной стороны.",
      ua:"Медіана сполучає вершину із серединою протилежної сторони."
    },
    options:{ru:idx.map(i=>optsRu[i]),ua:idx.map(i=>optsUa[i])}, correct:idx.indexOf(0)
  };
}
function genHeightMC(){
  const optsRu = ["Высота","Медиана","Биссектриса","Средняя линия"];
  const optsUa = ["Висота","Медіана","Бісектриса","Середня лінія"];
  const idx = shuffleArr([0,1,2,3]);
  return {
    topic:{ru:"Высота",ua:"Висота"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{
      ru:"Перпендикуляр, проведённый из вершины треугольника к противоположной стороне, называется:",
      ua:"Перпендикуляр, проведений з вершини трикутника до протилежної сторони, називається:"
    },
    hint:{
      ru:"Высота перпендикулярна противоположной стороне.",
      ua:"Висота перпендикулярна до протилежної сторони."
    },
    solution:{
      ru:"Высота — перпендикуляр из вершины к противоположной стороне.",
      ua:"Висота — перпендикуляр із вершини до протилежної сторони."
    },
    options:{ru:idx.map(i=>optsRu[i]),ua:idx.map(i=>optsUa[i])}, correct:idx.indexOf(0)
  };
}
function genMidlineMC(){
  const optsRu = ["Средняя линия","Медиана","Биссектриса","Высота"];
  const optsUa = ["Середня лінія","Медіана","Бісектриса","Висота"];
  const idx = shuffleArr([0,1,2,3]);
  return {
    topic:{ru:"Средняя линия",ua:"Середня лінія"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{
      ru:"Отрезок, соединяющий середины двух сторон треугольника, называется:",
      ua:"Відрізок, що сполучає середини двох сторін трикутника, називається:"
    },
    hint:{
      ru:"Средняя линия параллельна третьей стороне и равна её половине.",
      ua:"Середня лінія паралельна третій стороні та дорівнює її половині."
    },
    solution:{
      ru:"Средняя линия параллельна третьей стороне и равна её половине.",
      ua:"Середня лінія паралельна третій стороні та дорівнює її половині."
    },
    options:{ru:idx.map(i=>optsRu[i]),ua:idx.map(i=>optsUa[i])}, correct:idx.indexOf(0)
  };
}
function genPyramidVolumeShort(){
  const S = rnd([9,12,15,18,21,24,30]);
  const h = rnd([2,3,4,5,6]);
  const answer = (1/3)*S*h;
  return {
    topic:{ru:"Объём пирамиды",ua:"Об'єм піраміди"},
    format:{ru:"целое число",ua:"ціле число"},
    question:{ru:`Пирамида: Sосн=${S}, h=${h}. Найдите объём.`, ua:`Піраміда: Sосн=${S}, h=${h}. Знайдіть об'єм.`},
    hint:{ru:"V=⅓Sосн·h.",ua:"V=⅓Sосн·h."},
    solution:{
      ru:`V = ⅓·Sосн·h = ⅓·${S}·${h} = ${answer}.`,
      ua:`V = ⅓·Sосн·h = ⅓·${S}·${h} = ${answer}.`
    },
    expected:answer, correctLabel:fmtNum(answer),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && near(v, answer, 0.02); }
  };
}
const STEREO_TRIPLES = [{r:3,h:4,l:5},{r:5,h:12,l:13},{r:8,h:15,l:17},{r:7,h:24,l:25},{r:9,h:40,l:41}];
function genConeSurfaceShort(){
  const tr = rnd(STEREO_TRIPLES);
  const coeff = tr.r*(tr.r+tr.l);
  const answer = coeff*Math.PI;
  return {
    topic:{ru:"Площадь поверхности конуса",ua:"Площа поверхні конуса"},
    format:{ru:"десятичная дробь, округлите до 0.01",ua:"десятковий дріб, округліть до 0.01"},
    question:{ru:`Конус: R=${tr.r}, h=${tr.h}. Найдите Sполн (округлите до 0.01).`, ua:`Конус: R=${tr.r}, h=${tr.h}. Знайдіть Sповн (округліть до 0.01).`},
    hint:{ru:"l=√(R²+h²). Sполн=πR(R+l).",ua:"l=√(R²+h²). Sповн=πR(R+l)."},
    solution:{
      ru:`l = √(R²+h²) = √(${tr.r}²+${tr.h}²) = ${tr.l}. Sполн = πR(R+l) = π·${tr.r}·(${tr.r}+${tr.l}) = ${coeff}π ≈ ${fmtNum(answer)}.`,
      ua:`l = √(R²+h²) = √(${tr.r}²+${tr.h}²) = ${tr.l}. Sповн = πR(R+l) = π·${tr.r}·(${tr.r}+${tr.l}) = ${coeff}π ≈ ${fmtNum(answer)}.`
    },
    expected:answer, correctLabel: coeff+"π ≈ "+fmtNum(answer),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && near(v, answer, 0.05); }
  };
}
function genConeVolumeIntegralShort(){
  const R = rnd([1,2,3,4,5,6]);
  const h = rnd([1,2,3,4,5,6]);
  const coeff = (R*R*h)/3;
  const answer = coeff*Math.PI;
  return {
    topic:{ru:"Объём конуса (интеграл)",ua:"Об'єм конуса (інтеграл)"},
    format:{ru:"десятичная дробь, округлите до 0.01",ua:"десятковий дріб, округліть до 0.01"},
    question:{ru:`Через интеграл V=π∫[f(x)]²dx найдите объём конуса с R=${R}, h=${h} (округлите до 0.01).`, ua:`Через інтеграл V=π∫[f(x)]²dx знайдіть об'єм конуса з R=${R}, h=${h} (округліть до 0.01).`},
    hint:{ru:"f(x)=(R/h)x. V=π∫[0;h](Rx/h)²dx=⅓πR²h.",ua:"f(x)=(R/h)x. V=π∫[0;h](Rx/h)²dx=⅓πR²h."},
    solution:{
      ru:`Образующая по высоте: f(x) = (${R}/${h})x. V = π∫[0;${h}](${R}x/${h})²dx = ⅓πR²h = ${coeff}π ≈ ${fmtNum(answer)}.`,
      ua:`Твірна за висотою: f(x) = (${R}/${h})x. V = π∫[0;${h}](${R}x/${h})²dx = ⅓πR²h = ${coeff}π ≈ ${fmtNum(answer)}.`
    },
    expected:answer, correctLabel: fmtNum(coeff)+"π ≈ "+fmtNum(answer),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && near(v, answer, 0.05); }
  };
}
function genCubeSectionAreaShort(){
  const d = rnd([1,2,3,4]);
  const coeff = (d*d)/2;
  const answer = coeff*Math.sqrt(3);
  return {
    topic:{ru:"Сечение куба",ua:"Переріз куба"},
    format:{ru:"десятичная дробь, округлите до 0.01",ua:"десятковий дріб, округліть до 0.01"},
    question:{ru:`Плоскость отсекает от вершины куба равносторонний треугольник со стороной ${d}√2. Найдите его площадь (округлите до 0.01).`, ua:`Площина відтинає від вершини куба рівносторонній трикутник зі стороною ${d}√2. Знайдіть його площу (округліть до 0.01).`},
    hint:{ru:"S=(√3/4)·сторона². Сторона="+d+"√2, сторона²="+(2*d*d)+".",ua:"S=(√3/4)·сторона². Сторона="+d+"√2, сторона²="+(2*d*d)+"."},
    solution:{
      ru:`Сторона сечения ${d}√2, её квадрат = ${2*d*d}. S = (√3/4)·${2*d*d} = ${coeff}√3 ≈ ${fmtNum(answer)}.`,
      ua:`Сторона перерізу ${d}√2, її квадрат = ${2*d*d}. S = (√3/4)·${2*d*d} = ${coeff}√3 ≈ ${fmtNum(answer)}.`
    },
    expected:answer, correctLabel: fmtNum(coeff)+"√3 ≈ "+fmtNum(answer),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && near(v, answer, 0.02); }
  };
}

/* ---- Планиметрия: векторы, теоремы, окружности, площади (Модуль 5) ---- */
const GEO_VECS = [[1,2],[2,3],[3,1],[2,-1],[-1,3],[4,1],[1,-2],[3,4],[-2,5],[5,-3],[2,4],[1,5]];
function genVectorsDotMC(){
  const a = rnd(GEO_VECS);
  const b = rnd(GEO_VECS.filter(v => v[0]!==a[0] || v[1]!==a[1]));
  const correct = a[0]*b[0] + a[1]*b[1];
  const cand = [a[0]*b[1] + a[1]*b[0], a[0]*b[0] - a[1]*b[1], a[0]*b[1] - a[1]*b[0], correct + 1];
  const distractors = [...new Set(cand.map(v=>String(v)))].filter(v=>v!==String(correct)).slice(0,3);
  const {opts,correctIdx} = buildMC(String(correct), distractors);
  return {
    topic:{ru:"Скалярное произведение векторов",ua:"Скалярний добуток векторів"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{ru:`Найдите скалярное произведение векторов a=(${a[0]};${a[1]}) и b=(${b[0]};${b[1]}).`,ua:`Знайдіть скалярний добуток векторів a=(${a[0]};${a[1]}) і b=(${b[0]};${b[1]}).`},
    hint:{ru:"a·b = x₁x₂ + y₁y₂ — сумма произведений одноимённых координат.",ua:"a·b = x₁x₂ + y₁y₂ — сума добутків однойменних координат."},
    solution:{
      ru:`Перемножаем одноимённые координаты и складываем: a·b = ${a[0]}·${b[0]} + ${a[1]}·${b[1]} = ${a[0]*b[0]} + ${a[1]*b[1]} = ${correct}.`,
      ua:`Перемножуємо однойменні координати й додаємо: a·b = ${a[0]}·${b[0]} + ${a[1]}·${b[1]} = ${a[0]*b[0]} + ${a[1]*b[1]} = ${correct}.`
    },
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}
const LOC_CASES = [
  {b:5,c:8,A:60,a:7},
  {b:5,c:5,A:60,a:5},
  {b:3,c:5,A:120,a:7},
  {b:7,c:8,A:120,a:13},
  {b:3,c:4,A:90,a:5},
  {b:5,c:12,A:90,a:13},
  {b:8,c:15,A:90,a:17}
];
function genLawOfCosinesMC(){
  const k = rnd(LOC_CASES);
  const correct = k.a;
  const cand = [k.b + k.c, Math.abs(k.b - k.c), Math.round(Math.sqrt(k.b*k.b + k.c*k.c)), correct + 1, correct - 1];
  const distractors = [...new Set(cand.map(v=>String(v)))].filter(v=>v!==String(correct) && +v>0).slice(0,3);
  const {opts,correctIdx} = buildMC(String(correct), distractors);
  const cosTxt = k.A===60 ? "1/2" : k.A===120 ? "−1/2" : "0";
  return {
    topic:{ru:"Теорема косинусов",ua:"Теорема косинусів"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{ru:`Две стороны треугольника равны ${k.b} и ${k.c}, угол между ними ${k.A}°. Найдите третью сторону.`,ua:`Дві сторони трикутника дорівнюють ${k.b} і ${k.c}, кут між ними ${k.A}°. Знайдіть третю сторону.`},
    hint:{ru:"Теорема косинусов: a² = b² + c² − 2bc·cos A.",ua:"Теорема косинусів: a² = b² + c² − 2bc·cos A."},
    solution:{
      ru:`cos ${k.A}° = ${cosTxt}. Тогда a² = ${k.b}² + ${k.c}² − 2·${k.b}·${k.c}·(${cosTxt}) = ${k.b*k.b} + ${k.c*k.c} − ${2*k.b*k.c}·(${cosTxt}) = ${correct*correct}, значит a = ${correct}.`,
      ua:`cos ${k.A}° = ${cosTxt}. Тоді a² = ${k.b}² + ${k.c}² − 2·${k.b}·${k.c}·(${cosTxt}) = ${k.b*k.b} + ${k.c*k.c} − ${2*k.b*k.c}·(${cosTxt}) = ${correct*correct}, отже a = ${correct}.`
    },
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}
function genInscribedAngleMC(){
  const central = rnd([60,80,90,100,120,140,160,180]);
  const correct = central / 2;
  const correctTxt = correct + "°";
  const cand = [central, 2*central, 180-central, correct+10].filter(v=>v!==correct);
  const distractors = [...new Set(cand.map(v=>v+"°"))].slice(0,3);
  const {opts,correctIdx} = buildMC(correctTxt, distractors);
  return {
    topic:{ru:"Вписанный угол",ua:"Вписаний кут"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{ru:`Центральный угол равен ${central}°. Найдите вписанный угол, опирающийся на ту же дугу.`,ua:`Центральний кут дорівнює ${central}°. Знайдіть вписаний кут, що спирається на ту саму дугу.`},
    hint:{ru:"Вписанный угол равен половине центрального, если они опираются на одну дугу.",ua:"Вписаний кут дорівнює половині центрального, якщо вони спираються на ту саму дугу."},
    solution:{
      ru:`Оба угла опираются на одну дугу, поэтому вписанный вдвое меньше центрального: ${central}° : 2 = ${correct}°.`,
      ua:`Обидва кути спираються на ту саму дугу, тому вписаний удвічі менший за центральний: ${central}° : 2 = ${correct}°.`
    },
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}
const VANG_CASES = [
  {rs:"2", r:2, s:2, d:2, ang:60},
  {rs:"3", r:3, s:4, d:6, ang:60},
  {rs:"2", r:2, s:5, d:5, ang:60},
  {rs:"2", r:2, s:3, d:0, ang:90},
  {rs:"3", r:3, s:4, d:0, ang:90},
  {rs:"2", r:2, s:3, d:-3, ang:120},
  {rs:"3", r:3, s:4, d:-6, ang:120},
  {rs:"2", r:2, s:3, d:-6, ang:180},
  {rs:"2", r:2, s:3, d:6, ang:0},
  {rs:"√2", r:Math.SQRT2, s:3, d:3, ang:45},
  {rs:"√2", r:Math.SQRT2, s:3, d:-3, ang:135}
];
const VANG_ALL = [0,30,45,60,90,120,135,180];
function genVectorsAngleMC(){
  const k = rnd(VANG_CASES);
  const correct = k.ang + "°";
  const distractors = shuffleArr(VANG_ALL.filter(x=>x!==k.ang)).slice(0,3).map(x=>x+"°");
  const {opts,correctIdx} = buildMC(correct, distractors);
  const cosVal = k.d / (k.r * k.s);
  let cosTxt;
  if(Math.abs(cosVal-0.5)<1e-9) cosTxt = "1/2";
  else if(Math.abs(cosVal+0.5)<1e-9) cosTxt = "−1/2";
  else if(Math.abs(cosVal-1)<1e-9) cosTxt = "1";
  else if(Math.abs(cosVal+1)<1e-9) cosTxt = "−1";
  else if(Math.abs(cosVal)<1e-9) cosTxt = "0";
  else cosTxt = cosVal>0 ? "√2/2" : "−√2/2";
  return {
    topic:{ru:"Угол между векторами",ua:"Кут між векторами"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{ru:`|a| = ${k.rs}, |b| = ${k.s}, a·b = ${k.d}. Найдите угол между векторами.`,ua:`|a| = ${k.rs}, |b| = ${k.s}, a·b = ${k.d}. Знайдіть кут між векторами.`},
    hint:{ru:"cos ∠ = a·b / (|a|·|b|). Сначала найдите косинус, потом по нему — угол.",ua:"cos ∠ = a·b / (|a|·|b|). Спершу знайдіть косинус, потім за ним — кут."},
    solution:{
      ru:`cos ∠ = (${k.d}) / (${k.rs}·${k.s}) = ${cosTxt}. Этому косинусу соответствует угол ${k.ang}°.`,
      ua:`cos ∠ = (${k.d}) / (${k.rs}·${k.s}) = ${cosTxt}. Цьому косинусу відповідає кут ${k.ang}°.`
    },
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}
const LOS_CASES = [
  {a:6,A:30,R:6},
  {a:10,A:30,R:10},
  {a:8,A:90,R:4},
  {a:12,A:90,R:6},
  {a:8,A:150,R:8},
  {a:10,A:150,R:10}
];
function genLawOfSinesMC(){
  const k = rnd(LOS_CASES);
  const correct = k.R;
  const cand = [k.a, 2*k.a, Math.round(k.a/2), Math.round(k.a/3), 2*k.R, Math.round(k.R/2)];
  const distractors = [...new Set(cand.map(v=>String(v)))].filter(v=>v!==String(correct) && +v>0).slice(0,3);
  const {opts,correctIdx} = buildMC(String(correct), distractors);
  const sinTxt = k.A===90 ? "1" : "1/2";
  return {
    topic:{ru:"Теорема синусов",ua:"Теорема синусів"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{ru:`Сторона a = ${k.a} лежит против угла A = ${k.A}°. Найдите радиус описанной окружности R.`,ua:`Сторона a = ${k.a} лежить проти кута A = ${k.A}°. Знайдіть радіус описаного кола R.`},
    hint:{ru:"Теорема синусов: a / sin A = 2R, откуда R = a / (2 sin A).",ua:"Теорема синусів: a / sin A = 2R, звідки R = a / (2 sin A)."},
    solution:{
      ru:`sin ${k.A}° = ${sinTxt}. Тогда R = a / (2 sin A) = ${k.a} / (2·${sinTxt}) = ${correct}. Проверка: 2R = ${2*correct} = a / sin A ✓`,
      ua:`sin ${k.A}° = ${sinTxt}. Тоді R = a / (2 sin A) = ${k.a} / (2·${sinTxt}) = ${correct}. Перевірка: 2R = ${2*correct} = a / sin A ✓`
    },
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}
function genCircleRadiiMC(){
  const tr = rnd(PY_TRIPLES);
  const rIn = (tr.a + tr.b - tr.c) / 2;
  const rOut = tr.c / 2;
  const askIn = Math.random() < 0.5;
  const legs = `катетами ${tr.a} и ${tr.b}`;
  const legsUa = `катетами ${tr.a} і ${tr.b}`;
  if(askIn){
    const correct = fmtNum(rIn);
    const cand = [rOut, (tr.a+tr.b)/2, tr.c/2, rIn+1].map(fmtNum);
    const distractors = [...new Set(cand)].filter(v=>v!==correct).slice(0,3);
    const {opts,correctIdx} = buildMC(correct, distractors);
    return {
      topic:{ru:"Радиус вписанной окружности",ua:"Радіус вписаного кола"},
      format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
      question:{ru:`Прямоугольный треугольник с ${legs}. Найдите радиус вписанной окружности.`,ua:`Прямокутний трикутник з ${legsUa}. Знайдіть радіус вписаного кола.`},
      hint:{ru:"Для прямоугольного треугольника r = (a + b − c)/2, где c — гипотенуза.",ua:"Для прямокутного трикутника r = (a + b − c)/2, де c — гіпотенуза."},
      solution:{
        ru:`Гипотенуза c = ${tr.c} (египетский треугольник). Тогда r = (a + b − c)/2 = (${tr.a} + ${tr.b} − ${tr.c})/2 = ${fmtNum(rIn)}.`,
        ua:`Гіпотенуза c = ${tr.c} (єгипетський трикутник). Тоді r = (a + b − c)/2 = (${tr.a} + ${tr.b} − ${tr.c})/2 = ${fmtNum(rIn)}.`
      },
      options:{ru:opts,ua:opts}, correct:correctIdx
    };
  }
  const correct = fmtNum(rOut);
  const cand = [rIn, tr.c, (tr.a+tr.b)/2, rOut+1].map(fmtNum);
  const distractors = [...new Set(cand)].filter(v=>v!==correct).slice(0,3);
  const {opts,correctIdx} = buildMC(correct, distractors);
  return {
    topic:{ru:"Радиус описанной окружности",ua:"Радіус описаного кола"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{ru:`Прямоугольный треугольник с ${legs}. Найдите радиус описанной окружности.`,ua:`Прямокутний трикутник з ${legsUa}. Знайдіть радіус описаного кола.`},
    hint:{ru:"У прямоугольного треугольника гипотенуза — диаметр описанной окружности, поэтому R = c/2.",ua:"У прямокутного трикутника гіпотенуза — діаметр описаного кола, тому R = c/2."},
    solution:{
      ru:`Гипотенуза c = ${tr.c}. Прямой угол опирается на диаметр, значит R = c/2 = ${fmtNum(rOut)}.`,
      ua:`Гіпотенуза c = ${tr.c}. Прямий кут спирається на діаметр, отже R = c/2 = ${fmtNum(rOut)}.`
    },
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}
function genVectorsCrossMC(){
  const a = rnd(GEO_VECS);
  const b = rnd(GEO_VECS.filter(v => v[0]*a[1] - v[1]*a[0] !== 0));
  const det = a[0]*b[1] - a[1]*b[0];
  const correct = Math.abs(det);
  const cand = [Math.abs(a[0]*b[0] + a[1]*b[1]), Math.abs(a[0]*b[0] - a[1]*b[1]), Math.abs(a[0]*b[1] + a[1]*b[0]), correct + 1, correct * 2];
  const distractors = [...new Set(cand.map(v=>String(v)))].filter(v=>v!==String(correct)).slice(0,3);
  const {opts,correctIdx} = buildMC(String(correct), distractors);
  return {
    topic:{ru:"Площадь через векторное произведение",ua:"Площа через векторний добуток"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{ru:`Найдите площадь параллелограмма, построенного на векторах a=(${a[0]};${a[1]}) и b=(${b[0]};${b[1]}).`,ua:`Знайдіть площу паралелограма, побудованого на векторах a=(${a[0]};${a[1]}) і b=(${b[0]};${b[1]}).`},
    hint:{ru:"В координатах площадь параллелограмма S = |x₁y₂ − x₂y₁| (модуль определителя).",ua:"У координатах площа паралелограма S = |x₁y₂ − x₂y₁| (модуль визначника)."},
    solution:{
      ru:`S = |x₁y₂ − x₂y₁| = |${a[0]}·${b[1]} − ${b[0]}·${a[1]}| = |${a[0]*b[1]} − ${b[0]*a[1]}| = |${det}| = ${correct}.`,
      ua:`S = |x₁y₂ − x₂y₁| = |${a[0]}·${b[1]} − ${b[0]}·${a[1]}| = |${a[0]*b[1]} − ${b[0]*a[1]}| = |${det}| = ${correct}.`
    },
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}
const AREA_CASES = [
  {a:6,b:8,C:30,v:12},
  {a:6,b:10,C:30,v:15},
  {a:4,b:5,C:90,v:10},
  {a:5,b:8,C:90,v:20},
  {a:4,b:6,C:45,v:6*Math.SQRT2},
  {a:6,b:6,C:120,v:9*Math.sqrt(3)},
  {a:4,b:4,C:150,v:4}
];
function genAreaFiguresHigh(){
  const k = rnd(AREA_CASES);
  const val = Math.round(k.v * 100) / 100;
  const correct = fmtNum(val);
  const cand = [k.a*k.b, (k.a*k.b)/2, (k.a*k.b)/4, (k.a+k.b)*2, k.v*2, k.v/2].map(x=>fmtNum(Math.round(x*100)/100));
  const distractors = [...new Set(cand)].filter(x=>x!==correct).slice(0,3);
  const {opts,correctIdx} = buildMC(correct, distractors);
  const sinTxt = {30:"1/2",90:"1",45:"√2/2",120:"√3/2",150:"1/2"}[k.C];
  const eq = Math.abs(val - Math.round(val)) < 1e-9 ? "=" : "≈";
  return {
    topic:{ru:"Площадь треугольника по двум сторонам и углу",ua:"Площа трикутника за двома сторонами й кутом"},
    format:{ru:"десятичная дробь, округлите до 0.01",ua:"десятковий дріб, округліть до 0.01"},
    question:{ru:`В треугольнике стороны a = ${k.a}, b = ${k.b}, угол между ними C = ${k.C}°. Найдите площадь (округлите до 0.01).`,ua:`У трикутнику сторони a = ${k.a}, b = ${k.b}, кут між ними C = ${k.C}°. Знайдіть площу (округліть до 0.01).`},
    hint:{ru:"Площадь через две стороны и угол: S = ½·a·b·sin C.",ua:"Площа через дві сторони й кут: S = ½·a·b·sin C."},
    solution:{
      ru:`sin ${k.C}° = ${sinTxt}. Тогда S = ½·a·b·sin C = ½·${k.a}·${k.b}·(${sinTxt}) ${eq} ${correct}.`,
      ua:`sin ${k.C}° = ${sinTxt}. Тоді S = ½·a·b·sin C = ½·${k.a}·${k.b}·(${sinTxt}) ${eq} ${correct}.`
    },
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}

/* ============================================================
   МОДУЛЬ 6: комбинаторика, вероятности, статистика
   Генераторы возвращают topic / format / solution —
   они показываются в разборе после проверки ответа.
   ============================================================ */
function c6fact(n){ let r = 1; for(let i = 2; i <= n; i++) r *= i; return r; }
function c6C(n, k){ if(k < 0 || k > n) return 0; return c6fact(n) / (c6fact(k) * c6fact(n - k)); }
function c6A(n, k){ if(k < 0 || k > n) return 0; let r = 1; for(let i = 0; i < k; i++) r *= (n - i); return r; }
function c6gcd(a, b){ a = Math.abs(a); b = Math.abs(b); while(b){ const t = b; b = a % b; a = t; } return a || 1; }
function c6frac(n, d){ const g = c6gcd(n, d); const a = n / g, b = d / g; return b === 1 ? String(a) : a + "/" + b; }
/* число пар (a,b) из 1..n с суммой s */
function c6fav(n, s){ let c = 0; for(let a = 1; a <= n; a++){ const b = s - a; if(b >= 1 && b <= n) c++; } return c; }

/* ---------- Базовый уровень ---------- */
function genC6ProductRuleShort(){
  const m = rnd([3,4,5,6,7,8]);
  const n = rnd([2,3,4,5,6,7]);
  const answer = m * n;
  return {
    topic:{ru:"Правило умножения", ua:"Правило множення"},
    format:{ru:"целое число", ua:"ціле число"},
    question:{
      ru:`Первый выбор можно сделать ${m} способами, второй — ${n} способами, причём оба выбора обязательны. Сколько всего вариантов?`,
      ua:`Перший вибір можна зробити ${m} способами, другий — ${n} способами, причому обидва вибори обов'язкові. Скільки всього варіантів?`
    },
    hint:{ru:"Выборы идут последовательно — значит, варианты перемножаются.", ua:"Вибори йдуть послідовно — отже, варіанти множаться."},
    solution:{
      ru:`Оба этапа обязательны, поэтому по правилу умножения: ${m} · ${n} = ${answer}. Складывать нельзя: варианты не разбиты на непересекающиеся группы, а образуют произведение.`,
      ua:`Обидва етапи обов'язкові, отже за правилом множення: ${m} · ${n} = ${answer}. Додавати не можна: варіанти не розбиті на неперетинні групи, а утворюють добуток.`
    },
    expected:answer, correctLabel:String(answer),
    check(input){ const v = parseAnswer(input); return !isNaN(v) && v === answer; }
  };
}
function genC6SumRuleShort(){
  const a = rnd([4,5,6,7,8,9]);
  const b = rnd([3,4,5,6,7,8]);
  const answer = a + b;
  return {
    topic:{ru:"Правило сложения", ua:"Правило додавання"},
    format:{ru:"целое число", ua:"ціле число"},
    question:{
      ru:`Две непересекающиеся группы содержат ${a} и ${b} вариантов. Сколько вариантов в объединении?`,
      ua:`Дві неперетинні групи містять ${a} і ${b} варіантів. Скільки варіантів в об'єднанні?`
    },
    hint:{ru:"Непересекающиеся группы складываются.", ua:"Неперетинні групи додаються."},
    solution:{
      ru:`Группы не пересекаются, ни один вариант не попал в две группы сразу, поэтому по правилу сложения: ${a} + ${b} = ${answer}. Если бы группы пересекались, часть вариантов была бы посчитана дважды.`,
      ua:`Групи не перетинаються, жоден варіант не потрапив у дві групи одразу, отже за правилом додавання: ${a} + ${b} = ${answer}. Якби групи перетиналися, частину варіантів було б пораховано двічі.`
    },
    expected:answer, correctLabel:String(answer),
    check(input){ const v = parseAnswer(input); return !isNaN(v) && v === answer; }
  };
}
function genC6ProbSingleShort(){
  const n = rnd([6,8,10,12,20]);
  const m = rnd([1,2,3,4,5].filter(x => x < n));
  const answer = m / n;
  return {
    topic:{ru:"Классическая вероятность", ua:"Класична ймовірність"},
    format:{ru:"десятичная дробь, округлите до 0.001", ua:"десятковий дріб, округліть до 0.001"},
    question:{
      ru:`Все ${n} исходов равновероятны, благоприятных ${m}. Найдите вероятность (округлите до 0.001).`,
      ua:`Усі ${n} результатів рівноймовірні, сприятливих ${m}. Знайдіть ймовірність (округліть до 0.001).`
    },
    hint:{ru:"P = m / n — отношение благоприятных исходов к числу всех.", ua:"P = m / n — відношення сприятливих результатів до кількості всіх."},
    solution:{
      ru:`Так как исходы равновероятны, деление законно: P = ${m}/${n} = ${c6frac(m, n)} ≈ ${fmtNum(Math.round(answer * 1000) / 1000)}. Проверка: 0 ≤ ${fmtNum(answer)} ≤ 1.`,
      ua:`Оскільки результати рівноймовірні, ділення законне: P = ${m}/${n} = ${c6frac(m, n)} ≈ ${fmtNum(Math.round(answer * 1000) / 1000)}. Перевірка: 0 ≤ ${fmtNum(answer)} ≤ 1.`
    },
    expected:Math.round(answer * 1000) / 1000, correctLabel:fmtNum(Math.round(answer * 1000) / 1000),
    check(input){ const v = parseAnswer(input); return !isNaN(v) && near(v, answer, 0.0015); }
  };
}
function genC6ProbComplementMC(){
  const p = rnd([0.2,0.25,0.3,0.4,0.5,0.6,0.75]);
  const correct = Math.round((1 - p) * 100) / 100;
  const r2 = x => fmtNum(Math.round(x * 100) / 100);
  const correctText = r2(correct);
  const candidates = [r2(p), r2(p * 2), r2(1 + p), r2(correct / 2), r2(p * p), r2(1 - p / 2)];
  const distractors = [...new Set(candidates)].filter(v => v !== correctText).slice(0, 3);
  const {opts,correctIdx} = buildMC(correctText, distractors);
  return {
    topic:{ru:"Свойства вероятности", ua:"Властивості ймовірності"},
    format:{ru:"выбор одного ответа", ua:"вибір однієї відповіді"},
    question:{
      ru:`Известно, что P(A) = ${fmtNum(p)}. Чему равна P(Ā)?`,
      ua:`Відомо, що P(A) = ${fmtNum(p)}. Чому дорівнює P(Ā)?`
    },
    hint:{ru:"Событие и его противоположность вместе дают полную группу, то есть 1.", ua:"Подія та її протилежність разом дають повну групу, тобто 1."},
    solution:{
      ru:`По свойству противоположного события: P(Ā) = 1 − P(A) = 1 − ${fmtNum(p)} = ${fmtNum(correct)}. Сумма P(A) + P(Ā) = ${fmtNum(p)} + ${fmtNum(correct)} = 1 ✓`,
      ua:`За властивістю протилежної події: P(Ā) = 1 − P(A) = 1 − ${fmtNum(p)} = ${fmtNum(correct)}. Сума P(A) + P(Ā) = ${fmtNum(p)} + ${fmtNum(correct)} = 1 ✓`
    },
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}
function genC6StatMeanShort(){
  const n = rnd([4,5,6]);
  const base = rnd([3,4,5,6]);
  const data = [];
  for(let i = 0; i < n; i++) data.push(base + rnd([0,1,2,3]));
  const sum = data.reduce((p, c) => p + c, 0);
  const answer = sum / n;
  return {
    topic:{ru:"Среднее арифметическое", ua:"Середнє арифметичне"},
    format:{ru:"десятичная дробь, округлите до 0.001", ua:"десятковий дріб, округліть до 0.001"},
    question:{
      ru:`Данные: ${data.join(", ")}. Найдите среднее арифметическое (округлите до 0.001).`,
      ua:`Дані: ${data.join(", ")}. Знайдіть середнє арифметичне (округліть до 0.001).`
    },
    hint:{ru:"Сумма значений, делённая на их количество.", ua:"Сума значень, поділена на їхню кількість."},
    solution:{
      ru:`Сумма данных: ${data.join(" + ")} = ${sum}. Количество: ${n}. Значит x̄ = ${sum}/${n} = ${fmtNum(Math.round(answer * 1000) / 1000)}.`,
      ua:`Сума даних: ${data.join(" + ")} = ${sum}. Кількість: ${n}. Отже x̄ = ${sum}/${n} = ${fmtNum(Math.round(answer * 1000) / 1000)}.`
    },
    expected:Math.round(answer * 1000) / 1000, correctLabel:fmtNum(Math.round(answer * 1000) / 1000),
    check(input){ const v = parseAnswer(input); return !isNaN(v) && near(v, answer, 0.0015); }
  };
}

/* ---------- Средний уровень ---------- */
function genC6PermutationShort(){
  const n = rnd([4,5,6,7]);
  const answer = c6fact(n);
  const prod = [];
  for(let i = 2; i <= n; i++) prod.push(String(i));
  return {
    topic:{ru:"Перестановки и факториал", ua:"Розстановки та факторіал"},
    format:{ru:"целое число", ua:"ціле число"},
    question:{
      ru:`Сколькими способами можно расположить ${n} различных предметов в ряд?`,
      ua:`Скількома способами можна розташувати ${n} різних предметів у ряд?`
    },
    hint:{ru:"n! = 1 · 2 · … · n. Взять все элементы — частный случай размещения.", ua:"n! = 1 · 2 · … · n. Взяти всі елементи — частинний випадок розміщення."},
    solution:{
      ru:`Все ${n} элементов, порядок важен → перестановка P(${n}) = ${n}! = ${prod.join(" · ")} = <b>${answer}</b>. Проверка вручную: на первое место ${n} вариантов, на второе ${n - 1} и так далее.`,
      ua:`Усі ${n} елементів, порядок важливий → розстановка P(${n}) = ${n}! = ${prod.join(" · ")} = <b>${answer}</b>. Перевірка вручну: на перше місце ${n} варіантів, на друге ${n - 1} і так далі.`
    },
    expected:answer, correctLabel:String(answer),
    check(input){ const v = parseAnswer(input); return !isNaN(v) && v === answer; }
  };
}
function genC6CombinationShort(){
  const n = rnd([6,7,8,9,10]);
  const k = rnd([2,3,3,4].filter(x => x <= n - 2));
  const answer = c6C(n, k);
  const kk = Math.min(k, n - k);
  const num = [];
  for(let i = 0; i < kk; i++) num.push(String(n - i));
  const den = [];
  for(let i = 2; i <= kk; i++) den.push(String(i));
  return {
    topic:{ru:"Сочетания", ua:"Сполучення"},
    format:{ru:"целое число", ua:"ціле число"},
    question:{
      ru:`Из ${n} человек нужно выбрать комиссию из ${k} человек. Порядок не важен. Сколько способов?`,
      ua:`Із ${n} людей потрібно обрати комісію з ${k} осіб. Порядок неважливий. Скільки способів?`
    },
    hint:{ru:`Порядок не важен → сочетание C(${n}; ${k}) = n! / (k! · (n−k)!).`, ua:`Порядок неважливий → сполучення C(${n}; ${k}) = n! / (k! · (n−k)!).`},
    solution:{
      ru:`Порядок не важен, поэтому это сочетание: C(${n}; ${k}) = ${num.join("·")} / (${den.join("·")}) = ${num.length ? num.reduce((p, c) => p * Number(c), 1) : 1} / ${kk > 1 ? den.reduce((p, c) => p * Number(c), 1) : 1} = <b>${answer}</b>. Проверка симметрией: C(${n}; ${k}) = C(${n}; ${n - k}).`,
      ua:`Порядок неважливий, отож це сполучення: C(${n}; ${k}) = ${num.join("·")} / (${den.join("·")}) = ${num.length ? num.reduce((p, c) => p * Number(c), 1) : 1} / ${kk > 1 ? den.reduce((p, c) => p * Number(c), 1) : 1} = <b>${answer}</b>. Перевірка симетрією: C(${n}; ${k}) = C(${n}; ${n - k}).`
    },
    expected:answer, correctLabel:String(answer),
    check(input){ const v = parseAnswer(input); return !isNaN(v) && v === answer; }
  };
}
function genC6ProbUrnaShort(){
  const red = rnd([3,4,5,6,7]);
  const blue = rnd([2,3,4,5]);
  const total = red + blue;
  const answer = red / total;
  return {
    topic:{ru:"Вероятность в урне", ua:"Ймовірність в урні"},
    format:{ru:"десятичная дробь, округлите до 0.001", ua:"десятковий дріб, округліть до 0.001"},
    question:{
      ru:`В урне ${red} красных и ${blue} синих шаров. Из неё наугад вынимают один шар. Найдите вероятность, что он красный (округлите до 0.001).`,
      ua:`В урні ${red} червоних і ${blue} синіх кульок. З неї навмання витягують одну. Знайдіть ймовірність, що вона червона (округліть до 0.001).`
    },
    hint:{ru:"P = число благоприятных / число всех. Исходы равновероятны.", ua:"P = кількість сприятливих / кількість всіх. Результати рівноймовірні."},
    solution:{
      ru:`Всего шаров: ${red} + ${blue} = ${total}. Из них ${red} благоприятных, поэтому P = ${red}/${total} = ${c6frac(red, total)} ≈ ${fmtNum(Math.round(answer * 1000) / 1000)}.`,
      ua:`Усього кульок: ${red} + ${blue} = ${total}. З них ${red} сприятливих, отже P = ${red}/${total} = ${c6frac(red, total)} ≈ ${fmtNum(Math.round(answer * 1000) / 1000)}.`
    },
    expected:Math.round(answer * 1000) / 1000, correctLabel:fmtNum(Math.round(answer * 1000) / 1000),
    check(input){ const v = parseAnswer(input); return !isNaN(v) && near(v, answer, 0.0015); }
  };
}
function genC6ProbDiceSumMC(){
  const s = rnd([4,5,6,7,8,9]);
  const f = c6fav(6, s);
  const correct = c6frac(f, 36);
  const pool = [...new Set([2,3,4,5,6,7,8,9,10,11,12].map(v => c6frac(c6fav(6, v), 36)))].filter(v => v !== correct);
  const {opts,correctIdx} = buildMC(correct, shuffleArr(pool).slice(0, 3));
  return {
    topic:{ru:"Вероятность на костях", ua:"Ймовірність на кістках"},
    format:{ru:"выбор одного ответа", ua:"вибір однієї відповіді"},
    question:{
      ru:`Бросают два кубика. Какова вероятность, что сумма равна ${s}?`,
      ua:`Кидають два кубики. Яка ймовірність, що сума дорівнює ${s}?`
    },
    hint:{ru:"Всего 6 · 6 = 36 равновероятных пар, а не 11 значений суммы.", ua:"Усього 6 · 6 = 36 рівноймовірних пар, а не 11 значень суми."},
    solution:{
      ru:`Благоприятные пары со суммой ${s}: ${Array.from({length:f}, (_, i) => "(" + (i + 1) + ";" + (s - i - 1) + ")").join(", ")} — их ${f}. Всего равновероятных исходов 36, поэтому P = ${f}/36 = <b>${correct}</b> ≈ ${fmtNum(Math.round(f / 36 * 1000) / 1000)}.`,
      ua:`Сприятливі пари із сумою ${s}: ${Array.from({length:f}, (_, i) => "(" + (i + 1) + ";" + (s - i - 1) + ")").join(", ")} — їх ${f}. Усього рівноймовірних результатів 36, отже P = ${f}/36 = <b>${correct}</b> ≈ ${fmtNum(Math.round(f / 36 * 1000) / 1000)}.`
    },
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}
function genC6StatMedianModeShort(){
  const n = rnd([5,6,7]);
  const sorted = shuffleArr([1,2,3,4,5,6,7,8,9,10]).slice(0, n).sort((a, b) => a - b);
  const odd = n % 2 === 1;
  const med = odd ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  const answer = odd ? med : Math.round(med * 100) / 100;
  const center = odd ? String(sorted[(n - 1) / 2]) : (sorted[n / 2 - 1] + " и " + sorted[n / 2]);
  return {
    topic:{ru:"Медиана", ua:"Медіана"},
    format:{ru:"десятичная дробь, округлите до 0.01", ua:"десятковий дріб, округліть до 0.01"},
    question:{
      ru:`Данные в отсортированном виде: ${sorted.join(", ")}. Найдите медиану (округлите до 0.01).`,
      ua:`Дані у відсортованому вигляді: ${sorted.join(", ")}. Знайдіть медіану (округліть до 0.01).`
    },
    hint:{ru:"Медиана делит упорядоченный ряд пополам; при чётном числе элементов — среднее двух центральных.", ua:"Медіана ділить впорядкований ряд навпіл; при парній кількості елементів — середнє двох центральних."},
    solution:{
      ru:`Элементов ${n} — ${odd ? "нечётное" : "чётное"}, поэтому медиана — это ${odd ? "единственное центральное значение" : "среднее двух центральных значений"}. Центральные: ${center}. Медиана = <b>${fmtNum(answer)}</b>.`,
      ua:`Елементів ${n} — ${odd ? "непарне" : "парне"}, отже медіана — це ${odd ? "єдине центральне значення" : "середнє двох центральних значень"}. Центральні: ${center}. Медіана = <b>${fmtNum(answer)}</b>.`
    },
    expected:answer, correctLabel:fmtNum(answer),
    check(input){ const v = parseAnswer(input); return !isNaN(v) && near(v, med, 0.005); }
  };
}

/* ---------- Наисложнейший уровень ---------- */
function genC6ArrangementShort(){
  const n = rnd([5,6,7,8]);
  const k = rnd([2,3,4].filter(x => x <= n - 1));
  const answer = c6A(n, k);
  const factors = [];
  for(let i = 0; i < k; i++) factors.push(String(n - i));
  return {
    topic:{ru:"Размещения", ua:"Розміщення"},
    format:{ru:"целое число", ua:"ціле число"},
    question:{
      ru:`Из ${n} человек на первую и вторую (третью) позицию выбирают по одному человеку. Позиции различаются. Сколько способов?`,
      ua:`Із ${n} людей на першу та другу (третю) позицію обирають по одній людині. Позиції різняться. Скільки способів?`
    },
    hint:{ru:"Порядок важен (есть «первое место», «второе место») → размещения A(n; k) = n!/(n−k)!.", ua:"Порядок важливий (є «перше місце», «друге місце») → розміщення A(n; k) = n!/(n−k)!."},
    solution:{
      ru:`Позиции различаются, значит порядок важен и нужны размещения: A(${n}; ${k}) = ${factors.join(" · ")} = ${c6fact(n)}/${c6fact(n - k)} = <b>${answer}</b>. Сочетание дало бы на ${c6fact(k)} раз меньше.`,
      ua:`Позиції різняться, отже порядок важливий і потрібні розміщення: A(${n}; ${k}) = ${factors.join(" · ")} = ${c6fact(n)}/${c6fact(n - k)} = <b>${answer}</b>. Сполучення дало б у ${c6fact(k)} разів менше.`
    },
    expected:answer, correctLabel:String(answer),
    check(input){ const v = parseAnswer(input); return !isNaN(v) && v === answer; }
  };
}
function genC6SubsetsShort(){
  const n = rnd([5,6,7,8]);
  const answer = Math.pow(2, n);
  const rows = [];
  for(let k = 0; k <= n; k++) rows.push(c6C(n, k));
  return {
    topic:{ru:"Число подмножеств", ua:"Кількість підмножин"},
    format:{ru:"целое число", ua:"ціле число"},
    question:{
      ru:`Сколько всего подмножеств имеет множество из ${n} элементов?`,
      ua:`Скільки всього підмножин має множина з ${n} елементів?`
    },
    hint:{ru:"Каждый элемент либо входит в подмножество, либо нет — две возможности.", ua:"Кожен елемент або входить у підмножину, або ні — дві можливості."},
    solution:{
      ru:`Каждый из ${n} элементов независимо входит или не входит в подмножество, поэтому по правилу умножения 2 · 2 · … = <b>2^${n} = ${answer}</b>. Проверка через разбиение по размеру: ${rows.join(" + ")} = ${answer}.`,
      ua:`Кожен із ${n} елементів незалежно входить або ні у підмножину, отже за правилом множення 2 · 2 · … = <b>2^${n} = ${answer}</b>. Перевірка через розбиття за розміром: ${rows.join(" + ")} = ${answer}.`
    },
    expected:answer, correctLabel:String(answer),
    check(input){ const v = parseAnswer(input); return !isNaN(v) && v === answer; }
  };
}
function genC6ProbConditionalShort(){
  const suits = rnd([4, 9]);
  const total = 36;
  const answer = suits === 4 ? 4 / 9 : 4 / 36;
  const cond = suits === 4
    ? {ru:"Из колоды вытянута карта пиковой масти. Какова вероятность, что это туз?", ua:"З колоди витягнута карта пікової масті. Яка ймовірність, що це туз?"}
    : {ru:"Из колоды вытянута карта. Какова вероятность, что это туз?", ua:"З колоди витягнута карта. Яка ймовірність, що це туз?"};
  return {
    topic:{ru:"Условная вероятность", ua:"Умовна ймовірність"},
    format:{ru:"десятичная дробь, округлите до 0.001", ua:"десятковий дріб, округліть до 0.001"},
    question:{
      ru:`${cond.ru} Ответ дайте в виде десятичной дроби (округлите до 0.001).`,
      ua:`${cond.ua} Відповідь дайте у вигляді десяткового дробу (округліть до 0.001).`
    },
    hint:{ru:"Знаменатель меняется: считаем только среди исходов, совместимых с условием.", ua:"Знаменник змінюється: рахуємо лише серед результатів, сумісних з умовою."},
    solution:{
      ru: suits === 4
        ? `После условия остаются только 9 пиковых карт, из них 4 туза: P = 4/9 ≈ <b>${fmtNum(Math.round(answer * 1000) / 1000)}</b>. Без условия было бы 4/36 = 1/9 ≈ 0.111 — условие увеличило вероятность вчетверо.`
        : `Без условия подходят все 36 карт: P = 4/36 = 1/9 ≈ <b>${fmtNum(Math.round(answer * 1000) / 1000)}</b>. Знаменатель не меняется, потому что условие не ограничивает выбор.`,
      ua: suits === 4
        ? `Після умови залишаються лише 9 пікових карт, з них 4 тузи: P = 4/9 ≈ <b>${fmtNum(Math.round(answer * 1000) / 1000)}</b>. Без умови було б 4/36 = 1/9 ≈ 0.111 — умова збільшила ймовірність учетверо.`
        : `Без умови підходять усі 36 карт: P = 4/36 = 1/9 ≈ <b>${fmtNum(Math.round(answer * 1000) / 1000)}</b>. Знаменник не змінюється, бо умова не обмежує вибір.`
    },
    expected:Math.round(answer * 1000) / 1000, correctLabel:c6frac(4, suits === 4 ? 9 : 36),
    check(input){ const v = parseAnswer(input); return !isNaN(v) && near(v, answer, 0.0015); }
  };
}
function genC6ProbTotalShort(){
  const pA = rnd([0.2, 0.3, 0.4, 0.5, 0.6]);
  const pB = Math.round((1 - pA) * 100) / 100;
  const qA = rnd([0.05, 0.1, 0.2, 0.25]);
  const qB = rnd([0.02, 0.05, 0.1]);
  const answer = pA * qA + pB * qB;
  const p100 = Math.round(answer * 1000) / 10;
  return {
    topic:{ru:"Формула полной вероятности", ua:"Формула повної ймовірності"},
    format:{ru:"десятичная дробь, округлите до 0.001", ua:"десятковий дріб, округліть до 0.001"},
    question:{
      ru:`Завод A даёт ${Math.round(pA * 100)}% продукции, брак в его партии ${Math.round(qA * 100)}%. У завода B — ${Math.round(pB * 100)}% продукции и ${Math.round(qB * 100)}% брака. Найдите вероятность брака (округлите до 0.001).`,
      ua:`Завод A дає ${Math.round(pA * 100)}% продукції, брак у його партії ${Math.round(qA * 100)}%. У заводу B — ${Math.round(pB * 100)}% продукції та ${Math.round(qB * 100)}% браку. Знайдіть ймовірність браку (округліть до 0.001).`
    },
    hint:{ru:"P = Σ P(завод) · P(брак | завод) по всем заводам.", ua:"P = Σ P(завод) · P(брак | завод) за всіма заводами."},
    solution:{
      ru:`Разложим событие по заводам: P(брак) = ${fmtNum(pA)} · ${fmtNum(qA)} + ${fmtNum(pB)} · ${fmtNum(qB)} = ${fmtNum(Math.round(pA * qA * 1000) / 1000)} + ${fmtNum(Math.round(pB * qB * 1000) / 1000)} = <b>${fmtNum(p100 / 100)}</b>.`,
      ua:`Розкладемо подію за заводами: P(брак) = ${fmtNum(pA)} · ${fmtNum(qA)} + ${fmtNum(pB)} · ${fmtNum(qB)} = ${fmtNum(Math.round(pA * qA * 1000) / 1000)} + ${fmtNum(Math.round(pB * qB * 1000) / 1000)} = <b>${fmtNum(p100 / 100)}</b>.`
    },
    expected:p100 / 100, correctLabel:fmtNum(p100 / 100),
    check(input){ const v = parseAnswer(input); return !isNaN(v) && near(v, answer, 0.002); }
  };
}
function genC6StatDispersionShort(){
  const spread = rnd([0, 1, 2, 3]);
  const base = rnd([4, 5, 6, 8]);
  const data = spread === 0 ? [base, base, base] : [base - spread, base, base + spread];
  const mean = data.reduce((p, c) => p + c, 0) / data.length;
  const D = data.reduce((p, c) => p + (c - mean) * (c - mean), 0) / data.length;
  const R = spread * 2;
  const wantR = Math.random() < 0.5;
  const answer = wantR ? R : D;
  return {
    topic:{ru:"Размах и дисперсия", ua:"Розмах і дисперсія"},
    format:{ru:"десятичная дробь, округлите до 0.01", ua:"десятковий дріб, округліть до 0.01"},
    question:{
      ru:`Данные: ${data.join(", ")}. Найдите ${wantR ? "размах R" : "дисперсию D"} (округлите до 0.01).`,
      ua:`Дані: ${data.join(", ")}. Знайдіть ${wantR ? "розмах R" : "дисперсію D"} (округліть до 0.01).`
    },
    hint:{ru:"R = x_max − x_min. D — это среднее квадратов отклонений от среднего.", ua:"R = x_max − x_min. D — це середнє квадратів відхилень від середнього."},
    solution:{
      ru: wantR
        ? `Минимум ${Math.min(...data)}, максимум ${Math.max(...data)}, поэтому R = ${Math.max(...data)} − ${Math.min(...data)} = <b>${R}</b>.`
        : `Сначала среднее: x̄ = ${data.join(" + ")} / ${data.length} = ${fmtNum(mean)}. Отклонения: ${data.map(v => fmtNum(v - mean)).join(", ")}, их квадраты: ${data.map(v => fmtNum((v - mean) * (v - mean))).join(", ")}. D = ${data.map(v => fmtNum((v - mean) * (v - mean))).join(" + ")} / ${data.length} = <b>${fmtNum(Math.round(D * 100) / 100)}</b>.`,
      ua: wantR
        ? `Мінімум ${Math.min(...data)}, максимум ${Math.max(...data)}, отже R = ${Math.max(...data)} − ${Math.min(...data)} = <b>${R}</b>.`
        : `Спершу середнє: x̄ = ${data.join(" + ")} / ${data.length} = ${fmtNum(mean)}. Відхилення: ${data.map(v => fmtNum(v - mean)).join(", ")}, їхні квадрати: ${data.map(v => fmtNum((v - mean) * (v - mean))).join(", ")}. D = ${data.map(v => fmtNum((v - mean) * (v - mean))).join(" + ")} / ${data.length} = <b>${fmtNum(Math.round(D * 100) / 100)}</b>.`
    },
    expected:Math.round(answer * 100) / 100, correctLabel:fmtNum(Math.round(answer * 100) / 100),
    check(input){ const v = parseAnswer(input); return !isNaN(v) && near(v, answer, 0.005); }
  };
}
function genC6ProbFreqShort(){
  const n = rnd([50, 100, 200, 400]);
  const p = rnd([0.5, 1 / 6, 1 / 3, 0.25]);
  const expected = n * p;
  const observed = Math.round(expected + rnd([-2, -1, 1, 2]));
  const answer = observed / n;
  return {
    topic:{ru:"Относительная частота", ua:"Відносна частота"},
    format:{ru:"десятичная дробь, округлите до 0.001", ua:"десятковий дріб, округліть до 0.001"},
    question:{
      ru:`Монета брошена ${n} раз, выпало ${observed} орлов. Найдите относительную частоту события «орёл» (округлите до 0.001).`,
      ua:`Монета кинута ${n} разів, випало ${observed} орлів. Знайдіть відносну частоту події «орел» (округліть до 0.001).`
    },
    hint:{ru:"Относительная частота = благоприятных / всего испытаний.", ua:"Відносна частота = сприятливих / усього випробувань."},
    solution:{
      ru:`Относительная частота = ${observed}/${n} = <b>${fmtNum(Math.round(answer * 1000) / 1000)}</b>. Это статистическая оценка вероятности 1/2 = 0.5, а не точное значение: чем больше испытаний, тем ближе частота к вероятности.`,
      ua:`Відносна частота = ${observed}/${n} = <b>${fmtNum(Math.round(answer * 1000) / 1000)}</b>. Це статистична оцінка ймовірності 1/2 = 0.5, а не точне значення: чим більше випробувань, тим ближче частота до ймовірності.`
    },
    expected:Math.round(answer * 1000) / 1000, correctLabel:fmtNum(Math.round(answer * 1000) / 1000),
    check(input){ const v = parseAnswer(input); return !isNaN(v) && near(v, answer, 0.0015); }
  };
}

/* ---- НМТ-формат: комбинированные задания и короткий ответ ---- */
function genNmtTrigMixedMC(){
  const triple = rnd(PY_TRIPLES.slice(0,3));
  const sinLabel = `${triple.a}/${triple.c}`;
  const correct = sinLabel;
  const pool = shuffleArr([`${triple.b}/${triple.c}`,`−${triple.a}/${triple.c}`,`${triple.c}/${triple.a}`]).slice(0,3);
  const {opts,correctIdx} = buildMC(correct,pool);
  return {
    topic:{ru:"НМТ: тригонометрия",ua:"НМТ: тригонометрія"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{ru:`В НМТ-формате: tg α = −${triple.a}/${triple.b}, α ∈ II четверти. Найдите sin α.`,ua:`У форматі НМТ: tg α = −${triple.a}/${triple.b}, α ∈ II чверті. Знайдіть sin α.`},
    hint:{ru:"Воспользуйтесь 1+tg²α=1/cos²α и знаком функций во II четверти.",ua:"Скористайтеся 1+tg²α=1/cos²α і знаком функцій у II чверті."},
    solution:{
      ru:`tg α = −${triple.a}/${triple.b} ⇒ катеты ${triple.a} и ${triple.b}, гипотенуза √(${triple.a}²+${triple.b}²) = ${triple.c}. В II четверти sin α > 0, поэтому sin α = ${sinLabel}.`,
      ua:`tg α = −${triple.a}/${triple.b} ⇒ катети ${triple.a} і ${triple.b}, гіпотенуза √(${triple.a}²+${triple.b}²) = ${triple.c}. У II чверті sin α > 0, тому sin α = ${sinLabel}.`
    },
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}
function genNmtShortAnswer(){
  const a = rnd([2,3,5]);
  const exponent = rnd([2,3,4]);
  const shift = rnd([-2,-1,1,2]);
  const answer = exponent-shift;
  const shiftText = shift>0 ? ` + ${shift}` : ` − ${Math.abs(shift)}`;
  return {
    topic:{ru:"НМТ: показательное уравнение",ua:"НМТ: показникове рівняння"},
    format:{ru:"целое число",ua:"ціле число"},
    question:{ru:`В НМТ-формате решите ${a}^(x${shiftText}) = ${a}^${exponent}. Введите x.`,ua:`У форматі НМТ розв'яжіть ${a}^(x${shiftText}) = ${a}^${exponent}. Введіть x.`},
    hint:{ru:"При одинаковых основаниях приравняйте показатели степеней.",ua:"За однакових основ прирівняйте показники степенів."},
    solution:{
      ru:`Основания равны (${a}), приравниваем показатели: x${shiftText} = ${exponent}, откуда x = ${answer}.`,
      ua:`Основи рівні (${a}), прирівнюємо показники: x${shiftText} = ${exponent}, звідки x = ${answer}.`
    },
    expected:answer, correctLabel:String(answer),
    check(input){ const value=parseAnswer(input); return !isNaN(value) && near(value,answer,0.02); }
  };
}
function genNmtParameterMC(){
  const boundary = rnd([1,2,3]);
  const correct = String(boundary-1);
  const distractors = [String(boundary),String(boundary+1),String(-boundary)];
  const {opts,correctIdx} = buildMC(correct,distractors);
  return {
    topic:{ru:"НМТ: параметр",ua:"НМТ: параметр"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{ru:`В НМТ-формате найдите наименьшее целое a, при котором уравнение sin x = a − ${boundary} имеет решения.`,ua:`У форматі НМТ знайдіть найменше ціле a, за якого рівняння sin x = a − ${boundary} має розв'язки.`},
    hint:{ru:"Правая часть должна принадлежать отрезку [−1;1], значит a − c ≥ −1.",ua:"Права частина має належати відрізку [−1;1], отже a − c ≥ −1."},
    solution:{
      ru:`Нужно a − ${boundary} ≥ −1, то есть a ≥ ${boundary-1}. Наименьшее целое a = ${boundary-1}.`,
      ua:`Потрібно a − ${boundary} ≥ −1, тобто a ≥ ${boundary-1}. Найменше ціле a = ${boundary-1}.`
    },
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}

/* ============================================================
   МОДУЛЬ 11 — ПОСЛЕДОВАТЕЛЬНОСТИ И ПРОГРЕССИИ (8–9)
   ============================================================ */
function genArithTermShort(){
  const a1 = rnd([2,3,5,7]);
  const d = rnd([2,3,4,6]);
  const n = rnd([5,6,8,10]);
  const answer = a1 + (n-1)*d;
  return {
    topic:{ru:"Член арифметической прогрессии",ua:"Член арифметичної прогресії"},
    format:{ru:"целое число",ua:"ціле число"},
    question:{
      ru:`Дана арифметическая прогрессия: a₁ = ${a1}, d = ${d}. Чему равен a${["₁","₂","₃","₄","₅","₆","₇","₈","₉","₁₀"][n-1]}?`,
      ua:`Дана арифметична прогресія: a₁ = ${a1}, d = ${d}. Чому дорівнює a${["₁","₂","₃","₄","₅","₆","₇","₈","₉","₁₀"][n-1]}?`
    },
    hint:{ru:"Общий член: aₙ = a₁ + (n − 1)d.",ua:"Загальний член: aₙ = a₁ + (n − 1)d."},
    solution:{
      ru:`a${n} = a₁ + (${n} − 1)·${d} = ${a1} + ${(n-1)*d} = ${answer}.`,
      ua:`a${n} = a₁ + (${n} − 1)·${d} = ${a1} + ${(n-1)*d} = ${answer}.`
    },
    expected:answer, correctLabel:String(answer),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && v===answer; }
  };
}
function genArithSumShort(){
  const a1 = rnd([1,2,3,5]);
  const d = rnd([2,3,4]);
  const n = rnd([8,10,12,20]);
  const last = a1 + (n-1)*d;
  const answer = (a1 + last)*n/2;
  return {
    topic:{ru:"Сумма членов арифметической прогрессии",ua:"Сума членів арифметичної прогресії"},
    format:{ru:"целое число",ua:"ціле число"},
    question:{
      ru:`Найдите сумму первых ${n} членов прогрессии, у которой a₁ = ${a1} и d = ${d}.`,
      ua:`Знайдіть суму перших ${n} членів прогресії, у якої a₁ = ${a1} і d = ${d}.`
    },
    hint:{ru:"Сумма Sₙ = (a₁ + aₙ)·n / 2 — сначала найдите последний член.",ua:"Сума Sₙ = (a₁ + aₙ)·n / 2 — спочатку знайдіть останній член."},
    solution:{
      ru:`a${n} = ${a1} + (${n} − 1)·${d} = ${last}. S${n} = (${a1} + ${last})·${n} / 2 = ${answer}.`,
      ua:`a${n} = ${a1} + (${n} − 1)·${d} = ${last}. S${n} = (${a1} + ${last})·${n} / 2 = ${answer}.`
    },
    expected:answer, correctLabel:String(answer),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && v===answer; }
  };
}
function genGeoTermShort(){
  const q = rnd([2,3,5]);
  const n = rnd([4,5,6]);
  const answer = Math.pow(q, n-1);
  return {
    topic:{ru:"Член геометрической прогрессии",ua:"Член геометричної прогресії"},
    format:{ru:"целое число",ua:"ціле число"},
    question:{
      ru:`Геометрическая прогрессия задана первым членом a₁ = 1 и знаменателем q = ${q}. Чему равен a${n}?`,
      ua:`Геометрична прогресія задана першим членом a₁ = 1 і знаменником q = ${q}. Чому дорівнює a${n}?`
    },
    hint:{ru:"Общий член: aₙ = a₁ · qⁿ⁻¹, показатель на единицу меньше номера.",ua:"Загальний член: aₙ = a₁ · qⁿ⁻¹, показник на одиницю менший за номер."},
    solution:{
      ru:`a${n} = 1 · ${q}^${n-1} = ${answer}.`,
      ua:`a${n} = 1 · ${q}^${n-1} = ${answer}.`
    },
    expected:answer, correctLabel:String(answer),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && v===answer; }
  };
}
function genGeoInfiniteMC(){
  const d = rnd([3,5,7]);
  const r = 1/d;
  const sum = 1/(1-r);
  const correct = String(sum);
  /* отвлекающие варианты не должны совпадать с ответом: 1/(q−1), q и сама дробь 1/d */
  const {opts,correctIdx} = buildMC(correct,[String(1/(d-1)),String(d),String(r)]);
  return {
    topic:{ru:"Сумма бесконечного ряда",ua:"Сума нескінченного ряду"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{
      ru:`Найдите сумму ряда 1 + 1/${d} + 1/${d*d} + 1/${d*d*d} + ⋯`,
      ua:`Знайдіть суму ряду 1 + 1/${d} + 1/${d*d} + 1/${d*d*d} + ⋯`
    },
    hint:{ru:"Знаменатель прогрессии q = 1/" + d + " — дробь, значит |q| < 1 и сумма равна a₁ / (1 − q).",ua:"Знаменник прогресії q = 1/" + d + " — дріб, отже |q| < 1 і сума дорівнює a₁ / (1 − q)."},
    solution:{
      ru:`q = 1/${d}, поэтому |q| < 1. S = 1 / (1 − 1/${d}) = 1 / ${(d-1)}/${d} = ${d} / ${d-1} = ${sum}.`,
      ua:`q = 1/${d}, тому |q| < 1. S = 1 / (1 − 1/${d}) = 1 / ${(d-1)}/${d} = ${d} / ${d-1} = ${sum}.`
    },
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}

/* ============================================================
   МОДУЛЬ 12 — УРАВНЕНИЯ, НЕРАВЕНСТВА, СИСТЕМЫ (8–9)
   ============================================================ */
function genLinearInequalityShort(){
  const bound = rnd([12,16,20,24,30,36]);
  const k = rnd([2,3,4,6].filter(v=>bound % v === 0));
  const useNegative = rnd([true,false]);
  /* при −k x > b деление на отрицательное даёт x < −b/k, поэтому знак в ответе разный */
  const answer = useNegative ? -(bound/k) : bound/k;
  const fraction = bound + "/" + k;
  const text = useNegative
    ? {q:`Решите неравенство −${k}x > ${bound}.`, ua:`Розв’яжіть нерівність −${k}x > ${bound}.`,
       hint:`Делим обе части на −${k} и меняем знак.`, ua:`Ділимо обидві частини на −${k} і змінюємо знак.`,
       sol:`Делим на −${k}, знак меняется на противоположный: x < −${fraction} = ${answer}.`,
       solUa:`Ділимо на −${k}, знак змінюється на протилежний: x < −${fraction} = ${answer}.`}
    : {q:`Решите неравенство ${k}x < ${bound}.`, ua:`Розв’яжіть нерівність ${k}x < ${bound}.`,
       hint:`Делим обе части на положительное число ${k}, знак не меняется.`, ua:`Ділимо обидві частини на додатне число ${k}, знак не змінюється.`,
       sol:`Делим на ${k}: x < ${fraction} = ${answer}.`,
       solUa:`Ділимо на ${k}: x < ${fraction} = ${answer}.`};
  return {
    topic:{ru:"Линейное неравенство",ua:"Лінійна нерівність"},
    format:{ru:"целое число",ua:"ціле число"},
    question:{ru:text.q, ua:text.ua},
    hint:{ru:text.hint, ua:text.ua},
    solution:{ru:text.sol, ua:text.solUa},
    expected:answer, correctLabel:String(answer),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && v===answer; }
  };
}
function genParamNoSolutionMC(){
  const p = rnd([2,3,4,5]);
  const correct = String(p);
  const {opts,correctIdx} = buildMC(correct,[String(p+1),String(p-1),String(-p)]);
  return {
    topic:{ru:"Параметр: нет решений",ua:"Параметр: немає розв’язків"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{
      ru:`При каком значении p уравнение (p − ${p})x = ${p} не имеет решений?`,
      ua:`При якому значенні p рівняння (p − ${p})x = ${p} не має розв’язків?`
    },
    hint:{ru:"Если коэффициент при x обнулился, а правая часть не нулевая, решений нет.",ua:"Якщо коефіцієнт при x зник, а права частина ненульова, розв’язків немає."},
    solution:{
      ru:`При p = ${p} получаем 0·x = ${p}, где ${p} ≠ 0. Такое уравнение решений не имеет, значит p = ${p}.`,
      ua:`При p = ${p} отримуємо 0·x = ${p}, де ${p} ≠ 0. Таке рівняння розв’язків не має, отже p = ${p}.`
    },
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}
function genSystemTwoEqShort(){
  const x = rnd([2,3,4,5]);
  const y = rnd([1,2,3]);
  const a1 = 2, b1 = 1;
  const a2 = rnd([1,2]), b2 = rnd([3,4]);
  const c1 = a1*x + b1*y;
  const c2 = a2*x + b2*y;
  const answer = `${x};${y}`;
  return {
    topic:{ru:"Система линейных уравнений",ua:"Система лінійних рівнянь"},
    format:{ru:"пара через точку с запятой",ua:"пара через крапку з комою"},
    question:{
      ru:`Решите систему методом сложения и введите пару в формате x;y (без пробела): ${a1}x + ${b1}y = ${c1}, ${a2}x + ${b2}y = ${c2}.`,
      ua:`Розв’яжіть систему методом додавання та введіть пару у форматі x;y (без пробілу): ${a1}x + ${b1}y = ${c1}, ${a2}x + ${b2}y = ${c2}.`
    },
    hint:{ru:"Сложите уравнения так, чтобы одна переменная сократилась, затем подставьте.",ua:"Складіть рівняння так, щоб одна змінна скоротилася, потім підставте."},
    solution:{
      ru:`Решение системы: x = ${x}, y = ${y}. Проверка: ${a1}·${x} + ${b1}·${y} = ${c1}, ${a2}·${x} + ${b2}·${y} = ${c2}.`,
      ua:`Розв’язок системи: x = ${x}, y = ${y}. Перевірка: ${a1}·${x} + ${b1}·${y} = ${c1}, ${a2}·${x} + ${b2}·${y} = ${c2}.`
    },
    expected:answer, correctLabel:`x = ${x}; y = ${y}`,
    check(input){
      const parts = String(input).split(/[;,]/).map(s=>parseAnswer(s));
      return parts.length===2 && !isNaN(parts[0]) && !isNaN(parts[1]) && parts[0]===x && parts[1]===y;
    }
  };
}
function genQuadraticRootsShort(){
  const x1 = rnd([1,2,3,4,5]);
  const x2 = rnd([1,2,3,4,6].filter(v=>v!==x1));
  const b = -(x1+x2);
  const c = x1*x2;
  const answer = x1 < x2 ? x1 : x2;
  const bText = b>0 ? `+ ${b}` : `− ${Math.abs(b)}`;
  return {
    topic:{ru:"Меньший корень квадратного уравнения",ua:"Менший корінь квадратного рівняння"},
    format:{ru:"целое число",ua:"ціле число"},
    question:{
      ru:`Найдите меньший корень уравнения x² ${bText}x + ${c} = 0.`,
      ua:`Знайдіть менший корінь рівняння x² ${bText}x + ${c} = 0.`
    },
    hint:{ru:`По теореме Виета корни в сумме дают ${-b} и в произведении ${c}.`,ua:`За теоремою Вієта корені в сумі дають ${-b} і в добутку ${c}.`},
    solution:{
      ru:`Корни ${x1} и ${x2}: их сумма ${x1+x2} = ${-b} и произведение ${x1*x2} = ${c} совпадают с коэффициентами. Меньший корень = ${answer}.`,
      ua:`Корені ${x1} і ${x2}: їхня сума ${x1+x2} = ${-b} і добуток ${x1*x2} = ${c} збігаються з коефіцієнтами. Менший корінь = ${answer}.`
    },
    expected:answer, correctLabel:String(answer),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && v===answer; }
  };
}

/* ============================================================
   МОДУЛЬ 13 — ПРИКЛАДНЫЕ ЗАДАЧИ (8–9)
   ============================================================ */
function genPercentOfNumberShort(){
  const p = rnd([12,15,18,20,25]);
  /* подпись обещает целое число, поэтому берём только те n, при которых n·p кратно 100 */
  const n = rnd([40,50,60,80,120,200].filter(v=>(v*p)%100===0));
  const answer = n*p/100;
  return {
    topic:{ru:"Процент от числа",ua:"Відсоток від числа"},
    format:{ru:"целое число",ua:"ціле число"},
    question:{ru:`Сколько составляет ${p}% от ${n}?`, ua:`Скільки становить ${p}% від ${n}?`},
    hint:{ru:"Часть = число · процент / 100.",ua:"Частина = число · відсоток / 100."},
    solution:{
      ru:`${n} · ${p}/100 = ${n*p}/100 = ${answer}.`,
      ua:`${n} · ${p}/100 = ${n*p}/100 = ${answer}.`
    },
    expected:answer, correctLabel:String(answer),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && v===answer; }
  };
}
function genPercentGrowthMC(){
  const p = rnd([10,15,20,25]);
  const price = rnd([200,400,500,800]);
  const grown = price*(100+p)/100;
  const correct = `${grown} грн`;
  const {opts,correctIdx} = buildMC(correct,[`${price*(100-p)/100} грн`,`${price} грн`,`${price*(1+p)} грн`]);
  return {
    topic:{ru:"Рост и снижение на проценты",ua:"Зростання і зменшення на відсотки"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{
      ru:`Цена ${price} грн выросла на ${p}%. Сколько она стоит теперь?`,
      ua:`Ціна ${price} грн зросла на ${p}%. Скільки вона коштує тепер?`
    },
    hint:{ru:"Увеличение на p% — это умножение на (1 + p/100).",ua:"Збільшення на p% — це множення на (1 + p/100)."},
    solution:{
      ru:`${price} · (1 + ${p}/100) = ${price} · ${(100+p)/100} = ${grown} грн.`,
      ua:`${price} · (1 + ${p}/100) = ${price} · ${(100+p)/100} = ${grown} грн.`
    },
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}
function genMotionSpeedShort(){
  const t = rnd([2,3,4]);
  /* s кратно t, иначе ответ окажется дробным при подписи «целое число» */
  const s = rnd([60,90,120,180,240].filter(v=>v%t===0));
  const answer = s/t;
  return {
    topic:{ru:"Скорость по расстоянию и времени",ua:"Швидкість за відстанню та часом"},
    format:{ru:"целое число",ua:"ціле число"},
    question:{
      ru:`Тело прошло ${s} км за ${t} ч. Найдите скорость в км/ч.`,
      ua:`Тіло пройшло ${s} км за ${t} год. Знайдіть швидкість у км/год.`
    },
    hint:{ru:"v = s / t.",ua:"v = s / t."},
    solution:{ru:`v = ${s} / ${t} = ${answer} км/ч.`, ua:`v = ${s} / ${t} = ${answer} км/год.`},
    expected:answer, correctLabel:String(answer),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && v===answer; }
  };
}
function genMotionMeetingShort(){
  const v1 = rnd([40,50,60]);
  const v2 = rnd([30,40,50].filter(v=>v!==v1));
  const t = rnd([2,3,4]);
  const answer = (v1+v2)*t;
  return {
    topic:{ru:"Встречное движение",ua:"Зустрічний рух"},
    format:{ru:"целое число",ua:"ціле число"},
    question:{
      ru:`Два тела движутся навстречу друг другу со скоростями ${v1} и ${v2} км/ч. Через сколько часов расстояние между ними сократится до нуля, если сейчас между ними ${(v1+v2)*t} км?`,
      ua:`Два тіла рухаються назустріч одне одному зі швидкостями ${v1} і ${v2} км/год. Через скільки годин відстань між ними скоротиться до нуля, якщо зараз між ними ${(v1+v2)*t} км?`
    },
    hint:{ru:"При встречном движении расстояние сокращается со скоростью v₁ + v₂.",ua:"При зустрічному русі відстань скорочується зі швидкістю v₁ + v₂."},
    solution:{
      ru:`Общая скорость сближения: ${v1} + ${v2} = ${v1+v2} км/ч. t = ${(v1+v2)*t} / ${v1+v2} = ${t} ч.`,
      ua:`Загальна швидкість зближення: ${v1} + ${v2} = ${v1+v2} км/год. t = ${(v1+v2)*t} / ${v1+v2} = ${t} год.`
    },
    expected:t, correctLabel:String(t),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && v===t; }
  };
}
function genWorkRateShort(){
  /* ответ 2/3·t1 целый только при t1, кратном 3 */
  const t1 = rnd([3,6,9,12]);
  const t2 = t1*2;
  const answer = t1*t2/(t1+t2);
  const days = n => {
    const m10 = n%10, m100 = n%100;
    if (m10 === 1 && m100 !== 11) return "день";
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "дня";
    return "дней";
  };
  const daysUa = n => {
    const m10 = n%10, m100 = n%100;
    if (m10 === 1 && m100 !== 11) return "день";
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "дні";
    return "днів";
  };
  return {
    topic:{ru:"Совместная работа",ua:"Спільна робота"},
    format:{ru:"целое число",ua:"ціле число"},
    question:{
      ru:`Первый исполнитель делает работу за ${t1} ${days(t1)}, второй — за ${t2} ${days(t2)}. За сколько дней они сделают её вместе?`,
      ua:`Перший виконавець виконує роботу за ${t1} ${daysUa(t1)}, другий — за ${t2} ${daysUa(t2)}. За скільки днів вони виконають її разом?`
    },
    hint:{ru:"Скорость каждого в долях работы в день: 1/t₁ и 1/t₂. Складывайте скорости, не времена.",ua:"Швидкість кожного у частках роботи за день: 1/t₁ і 1/t₂. Додавайте швидкості, не часи."},
    solution:{
      ru:`1/${t1} + 1/${t2} = (${t2} + ${t1}) / ${t1*t2} = ${t1+t2} / ${t1*t2}. Обратная величина: ${t1*t2} / ${t1+t2} = ${answer} ${days(answer)}.`,
      ua:`1/${t1} + 1/${t2} = (${t2} + ${t1}) / ${t1*t2} = ${t1+t2} / ${t1*t2}. Обернена величина: ${t1*t2} / ${t1+t2} = ${answer} ${daysUa(answer)}.`
    },
    expected:answer, correctLabel:String(answer),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && near(v,answer,0.01); }
  };
}
function genMixtureConcentrationShort(){
  const c1 = rnd([10,15,20,25]);
  const c2 = rnd([30,40,50].filter(v=>v>c1));
  const m1 = rnd([100,200,300]);
  const m2 = rnd([100,200,300]);
  const answer = (c1*m1 + c2*m2)/(m1+m2);
  return {
    topic:{ru:"Концентрация смеси",ua:"Концентрація суміші"},
    format:{ru:"процент с одним знаком после запятой",ua:"відсоток з одним знаком після коми"},
    question:{
      ru:`Смешали ${m1} г раствора с концентрацией ${c1}% и ${m2} г раствора с концентрацией ${c2}%. Найдите концентрацию смеси в процентах.`,
      ua:`Змішали ${m1} г розчину з концентрацією ${c1}% і ${m2} г розчину з концентрацією ${c2}%. Знайдіть концентрацію суміші у відсотках.`
    },
    hint:{ru:"Вещества: C₁·m₁ и C₂·m₂. Разделите их сумму на общую массу раствора.",ua:"Речовини: C₁·m₁ і C₂·m₂. Поділіть їхню суму на загальну масу розчину."},
    solution:{
      ru:`Вещества: ${c1}/100·${m1} = ${c1*m1/100} г и ${c2}/100·${m2} = ${c2*m2/100} г, всего ${(c1*m1+c2*m2)/100} г. Масса смеси ${m1+m2} г. C = ${(c1*m1+c2*m2)/100} / ${m1+m2} = ${answer.toFixed(2)} ≈ ${answer.toFixed(1)}%.`,
      ua:`Речовини: ${c1}/100·${m1} = ${c1*m1/100} г і ${c2}/100·${m2} = ${c2*m2/100} г, разом ${(c1*m1+c2*m2)/100} г. Маса суміші ${m1+m2} г. C = ${(c1*m1+c2*m2)/100} / ${m1+m2} = ${answer.toFixed(2)} ≈ ${answer.toFixed(1)}%.`
    },
    expected:Math.round(answer*10)/10, correctLabel:answer.toFixed(1),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && near(v,answer,0.1); }
  };
}
function genProportionDirectShort(){
  const unit = rnd([15,20,25,40]);
  const n = rnd([4,5,6,8]);
  const total = unit*n;
  const askTotal = rnd([true,false]);
  return {
    topic:{ru:"Пропорция и прямые расчёты",ua:"Пропорція та прямі розрахунки"},
    format:{ru:"целое число",ua:"ціле число"},
    question: askTotal
      ? {ru:`Один предмет стоит ${unit} грн. Сколько стоят ${n} таких предметов?`, ua:`Один предмет коштує ${unit} грн. Скільки коштують ${n} таких предметів?`}
      : {ru:`${n} одинаковых предметов стоят ${total} грн. Сколько стоит один предмет?`, ua:`${n} однакових предметів коштують ${total} грн. Скільки коштує один предмет?`},
    hint:{ru:"Цена одного предмета постоянна: S₁/n₁ = S₂/n₂.",ua:"Ціна одного предмета стала: S₁/n₁ = S₂/n₂."},
    solution: askTotal
      ? {ru:`${unit} · ${n} = ${total} грн.`, ua:`${unit} · ${n} = ${total} грн.`}
      : {ru:`${total} / ${n} = ${unit} грн.`, ua:`${total} / ${n} = ${unit} грн.`},
    expected: askTotal ? total : unit,
    correctLabel:String(askTotal ? total : unit),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && v===(askTotal?total:unit); }
  };
}

/* ============================================================
   МОДУЛЬ 14 — КВАДРАТНАЯ ФУНКЦИЯ, УРАВНЕНИЯ, НЕРАВЕНСТВА, СИСТЕМЫ (8–9)
   ============================================================ */
function fmtQuadratic(a,b,c){
  const parts = [];
  const add = (coef, suffix) => {
    if(coef === 0) return;
    const abs = Math.abs(coef);
    const num = (abs === 1 && suffix !== "") ? "" : abs;
    const sign = coef < 0 ? "−" : "+";
    parts.push((parts.length ? " " + sign + " " : "") + num + suffix);
  };
  add(a,"x²"); add(b,"x"); add(c,"");
  return parts.join("");
}
function genDiscriminantMC(){
  let a = 1, b = 1, c = 1, D = -3, d1 = 5, d2 = 3, d3 = -1;
  for(let tries = 0; tries < 300; tries++){
    a = rnd([1,2,3]);
    b = Math.floor(Math.random()*13) - 6;
    c = Math.floor(Math.random()*13) - 6;
    if(b === 0 || c === 0) continue;
    D = b*b - 4*a*c;
    d1 = b*b + 4*a*c;
    d2 = 4*a*c - b*b;
    d3 = b*b - 2*a*c;
    if(new Set([D,d1,d2,d3]).size === 4) break;
  }
  const poly = fmtQuadratic(a,b,c);
  const bSqStr = b < 0 ? "(" + b + ")²" : b + "²";
  const cParen = c < 0 ? "(" + c + ")" : c;
  const fourAc = 4*a*c;
  const correct = String(D);
  const {opts,correctIdx} = buildMC(correct,[String(d1),String(d2),String(d3)]);
  return {
    topic:{ru:"Дискриминант квадратного уравнения",ua:"Дискримінант квадратного рівняння"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{
      ru:`Чему равен дискриминант уравнения ${poly} = 0?`,
      ua:`Чому дорівнює дискримінант рівняння ${poly} = 0?`
    },
    hint:{ru:"Дискриминант: D = b² − 4ac.",ua:"Дискримінант: D = b² − 4ac."},
    solution:{
      ru:`D = b² − 4ac = ${bSqStr} − 4·${a}·${cParen} = ${b*b} ${fourAc < 0 ? "+ " + (-fourAc) : "− " + fourAc} = ${D}.`,
      ua:`D = b² − 4ac = ${bSqStr} − 4·${a}·${cParen} = ${b*b} ${fourAc < 0 ? "+ " + (-fourAc) : "− " + fourAc} = ${D}.`
    },
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}
function genQuadraticVertexXShort(){
  const a = rnd([1,2,3]);
  const k = rnd([-5,-4,-3,-2,-1,1,2,3,4,5]);
  const b = 2*a*k;
  const c = Math.floor(Math.random()*13) - 6;
  const answer = -k;
  const poly = fmtQuadratic(a,b,c);
  return {
    topic:{ru:"Вершина параболы",ua:"Вершина параболи"},
    format:{ru:"целое число",ua:"ціле число"},
    question:{
      ru:`Найдите x-координату вершины параболы y = ${poly}.`,
      ua:`Знайдіть x-координату вершини параболи y = ${poly}.`
    },
    hint:{ru:"Абсцисса вершины: x_в = −b / (2a).",ua:"Абсциса вершини: x_в = −b / (2a)."},
    solution:{
      ru:`x_в = −b / (2a) = −(${b}) / (2·${a}) = ${-(b)/(2*a)}.`,
      ua:`x_в = −b / (2a) = −(${b}) / (2·${a}) = ${-(b)/(2*a)}.`
    },
    expected:answer, correctLabel:String(answer),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && v===answer; }
  };
}
function genQuadraticInequalityMC(){
  const R = [-6,-5,-4,-3,-2,-1,1,2,3,4,5,6];
  const r1 = rnd(R.slice(0,-1));
  const r2 = rnd(R.filter(v => v > r1));
  const b = -(r1 + r2);
  const c = r1 * r2;
  const sign = rnd([">","<","≥","≤"]);
  const poly = fmtQuadratic(1,b,c);
  const text = {
    ">":{ru:`x < ${r1} или x > ${r2}`, ua:`x < ${r1} або x > ${r2}`,
         mir:{ru:`x < ${r2} или x > ${r1}`, ua:`x < ${r2} або x > ${r1}`},
         flip:{ru:`x ≤ ${r1} или x ≥ ${r2}`, ua:`x ≤ ${r1} або x ≥ ${r2}`},
         ext:{ru:"все действительные числа", ua:"усі дійсні числа"}},
    "<":{ru:`${r1} < x < ${r2}`, ua:`${r1} < x < ${r2}`,
         mir:{ru:`${r2} < x < ${r1}`, ua:`${r2} < x < ${r1}`},
         flip:{ru:`${r1} ≤ x ≤ ${r2}`, ua:`${r1} ≤ x ≤ ${r2}`},
         ext:{ru:"решений нет", ua:"розв’язків немає"}},
    "≥":{ru:`x ≤ ${r1} или x ≥ ${r2}`, ua:`x ≤ ${r1} або x ≥ ${r2}`,
         mir:{ru:`x ≤ ${r2} или x ≥ ${r1}`, ua:`x ≤ ${r2} або x ≥ ${r1}`},
         flip:{ru:`x < ${r1} или x > ${r2}`, ua:`x < ${r1} або x > ${r2}`},
         ext:{ru:"все действительные числа", ua:"усі дійсні числа"}},
    "≤":{ru:`${r1} ≤ x ≤ ${r2}`, ua:`${r1} ≤ x ≤ ${r2}`,
         mir:{ru:`${r2} ≤ x ≤ ${r1}`, ua:`${r2} ≤ x ≤ ${r1}`},
         flip:{ru:`${r1} < x < ${r2}`, ua:`${r1} < x < ${r2}`},
         ext:{ru:"решений нет", ua:"розв’язків немає"}}
  }[sign];
  const correct = {ru:text.ru, ua:text.ua};
  const pool = [correct, {ru:text.mir.ru, ua:text.mir.ua}, {ru:text.flip.ru, ua:text.flip.ua}, {ru:text.ext.ru, ua:text.ext.ua}];
  const order = shuffleArr(pool);
  const optsRu = order.map(e => e.ru);
  const optsUa = order.map(e => e.ua);
  const correctIdx = order.indexOf(correct);
  return {
    topic:{ru:"Квадратное неравенство",ua:"Квадратна нерівність"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{
      ru:`Решите неравенство ${poly} ${sign} 0.`,
      ua:`Розв’яжіть нерівність ${poly} ${sign} 0.`
    },
    hint:{ru:`a = 1 > 0, ветви параболы направлены вверх. Метод интервалов по корням ${r1} и ${r2}: при знаке «<» решения между корнями, при «>» — снаружи.`,ua:`a = 1 > 0, гілки параболи напрямлені вгору. Метод інтервалів за коренями ${r1} і ${r2}: при знаку «<» розв’язки між коренями, при «>» — ззовні.`},
    solution:{
      ru:`Корни уравнения ${poly} = 0: x₁ = ${r1} и x₂ = ${r2}. У параболы y = ${poly} коэффициент a = 1 > 0, ветви вверх, поэтому решением неравенства ${poly} ${sign} 0 является ${text.ru}.`,
      ua:`Корені рівняння ${poly} = 0: x₁ = ${r1} і x₂ = ${r2}. У параболи y = ${poly} коефіцієнт a = 1 > 0, гілки вгору, тому розв’язком нерівності ${poly} ${sign} 0 є ${text.ua}.`
    },
    options:{ru:optsRu,ua:optsUa}, correct:correctIdx
  };
}
function genQuadraticYAtXShort(){
  const a = rnd([1,2,3]);
  const b = Math.floor(Math.random()*13) - 6;
  const c = Math.floor(Math.random()*13) - 6;
  const k = rnd([-3,-2,-1,0,1,2,3]);
  const ak2 = a*k*k, bk = b*k;
  const answer = ak2 + bk + c;
  const poly = fmtQuadratic(a,b,c);
  return {
    topic:{ru:"Значение квадратной функции",ua:"Значення квадратної функції"},
    format:{ru:"целое число",ua:"ціле число"},
    question:{
      ru:`Вычислите значение функции y = ${poly} при x = ${k}.`,
      ua:`Обчисліть значення функції y = ${poly} при x = ${k}.`
    },
    hint:{ru:`Подставьте ${k} вместо x в формулу и выполните действия.`,ua:`Підставте ${k} замість x у формулу і виконайте дії.`},
    solution:{
      ru:`y(${k}) = ${a}·(${k})² + (${b})·(${k}) + (${c}) = ${ak2} + (${bk}) + (${c}) = ${answer}.`,
      ua:`y(${k}) = ${a}·(${k})² + (${b})·(${k}) + (${c}) = ${ak2} + (${bk}) + (${c}) = ${answer}.`
    },
    expected:answer, correctLabel:String(answer),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && v===answer; }
  };
}
function genQuadraticAppliedShort(){
  const x = rnd([3,4,5,6,7,8,9,10]);
  const k = rnd([2,3,4,5,6,7]);
  const S = x*(x + k);
  const D = k*k + 4*S;
  const sqrtD = 2*x + k;
  return {
    topic:{ru:"Задача на квадратное уравнение",ua:"Задача на квадратне рівняння"},
    format:{ru:"целое число",ua:"ціле число"},
    question:{
      ru:`Одна сторона прямоугольника на ${k} см больше другой, а площадь равна ${S} см². Чему равна меньшая сторона (в см)?`,
      ua:`Одна сторона прямокутника на ${k} см більша за іншу, а площа дорівнює ${S} см². Чому дорівнює менша сторона (у см)?`
    },
    hint:{ru:`Пусть меньшая сторона x, тогда большая равна x + ${k}. Составьте уравнение из условия площади: x(x + ${k}) = ${S}.`,ua:`Нехай менша сторона x, тоді більша дорівнює x + ${k}. Складіть рівняння з умови про площу: x(x + ${k}) = ${S}.`},
    solution:{
      ru:`x(x + ${k}) = ${S} ⇒ x² + ${k}x − ${S} = 0. D = ${k}² + 4·${S} = ${D} — полный квадрат, √D = ${sqrtD}. x = (−${k} + ${sqrtD}) / 2 = ${(-k + sqrtD)} / 2 = ${x}.`,
      ua:`x(x + ${k}) = ${S} ⇒ x² + ${k}x − ${S} = 0. D = ${k}² + 4·${S} = ${D} — повний квадрат, √D = ${sqrtD}. x = (−${k} + ${sqrtD}) / 2 = ${(-k + sqrtD)} / 2 = ${x}.`
    },
    expected:x, correctLabel:String(x),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && v===x; }
  };
}
function genSystemWordShort(){
  const v1 = rnd([40,50,60,70,80,90]);
  const v2 = rnd([30,40,50,60,70,80].filter(v => v !== v1));
  const t = rnd([2,3,4,5,6]);
  const S = (v1 + v2)*t;
  return {
    topic:{ru:"Задача на встречное движение",ua:"Задача на зустрічний рух"},
    format:{ru:"целое число",ua:"ціле число"},
    question:{
      ru:`Два поезда одновременно выехали навстречу друг другу со скоростями ${v1} и ${v2} км/ч. Через сколько часов они встретятся, если расстояние между ними ${S} км?`,
      ua:`Два потяги одночасно виїхали назустріч один одному зі швидкостями ${v1} і ${v2} км/год. Через скільки годин вони зустрінуться, якщо відстань між ними ${S} км?`
    },
    hint:{ru:"Скорость сближения равна сумме скоростей: t = S / (v₁ + v₂).",ua:"Швидкість зближення дорівнює сумі швидкостей: t = S / (v₁ + v₂)."},
    solution:{
      ru:`Скорость сближения: ${v1} + ${v2} = ${v1+v2} км/ч. t = ${S} / ${v1+v2} = ${t} ч.`,
      ua:`Швидкість зближення: ${v1} + ${v2} = ${v1+v2} км/год. t = ${S} / ${v1+v2} = ${t} год.`
    },
    expected:t, correctLabel:String(t),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && v===t; }
  };
}
function genRatSimplifyMC(){
  const a = rnd([2,3,4,5,6,7]);
  const a2 = a*a;
  const correct = "x + " + a;
  const {opts, correctIdx} = buildMC(correct, ["x − " + a, "x² − " + a2, "x"]);
  return {
    topic:{ru:"Сокращение рациональной дроби",ua:"Скорочення раціонального дробу"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{
      ru:`Упростите выражение (x² − ${a2}) / (x − ${a}).`,
      ua:`Спростіть вираз (x² − ${a2}) / (x − ${a}).`
    },
    hint:{ru:`Разложите числитель как разность квадратов: (x − ${a})(x + ${a}), и сократите общий множитель x − ${a}.`,ua:`Розкладіть чисельник як різницю квадратів: (x − ${a})(x + ${a}), і скоротіть спільний множник x − ${a}.`},
    solution:{
      ru:`x² − ${a2} = (x − ${a})(x + ${a}). Делим числитель и знаменатель на x − ${a} (ОДЗ: x ≠ ${a}) и получаем x + ${a}.`,
      ua:`x² − ${a2} = (x − ${a})(x + ${a}). Ділимо чисельник і знаменник на x − ${a} (ОДЗ: x ≠ ${a}) і отримуємо x + ${a}.`
    },
    options:{ru:opts, ua:opts}, correct:correctIdx
  };
}
function genRatPowerMC(){
  let m = 2, n = 1, k = 1, pow = 0;
  for(let tries = 0; tries < 300; tries++){
    m = rnd([2,3,4,5]);
    n = rnd([1,2,3]);
    k = rnd([1,2,3].filter(v => v !== n));
    pow = m + n - k;
    if(pow >= 1 && pow <= 8) break;
  }
  const correct = "x^" + pow;
  const {opts, correctIdx} = buildMC(correct, ["x^" + (m+n), "x^" + m, "x^" + (m+n+k)]);
  return {
    topic:{ru:"Упрощение выражения со степенями",ua:"Спрощення виразу зі степенями"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{
      ru:`Упростите выражение (x^${m} · x^${n}) / x^${k}.`,
      ua:`Спростіть вираз (x^${m} · x^${n}) / x^${k}.`
    },
    hint:{ru:`Складывайте показатели при умножении и вычитайте при делении одинаковых оснований.`,ua:`Додавайте показники при множенні та віднімайте при діленні однакових основ.`},
    solution:{
      ru:`x^${m} · x^${n} = x^${m+n}. Затем x^${m+n} / x^${k} = x^${m+n-k} = x^${pow}.`,
      ua:`x^${m} · x^${n} = x^${m+n}. Далі x^${m+n} / x^${k} = x^${m+n-k} = x^${pow}.`
    },
    options:{ru:opts, ua:opts}, correct:correctIdx
  };
}
function genRatEquationMC(){
  let a = 1, b = 2, k = 2, x = 0;
  for(let tries = 0; tries < 300; tries++){
    a = rnd([1,2,3,4,5]);
    b = rnd([1,2,3,4,5].filter(v => v !== a));
    k = rnd([2,3,4,5]);
    const num = k*b + a;
    const den = k - 1;
    if(num % den) continue;
    x = num / den;
    if(new Set([x, a, b, x + k]).size === 4) break;
  }
  const correct = String(x);
  const {opts, correctIdx} = buildMC(correct, [String(b), String(a), String(x + k)]);
  return {
    topic:{ru:"Рациональное уравнение",ua:"Раціональне рівняння"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{
      ru:`Решите уравнение (x + ${a}) / (x − ${b}) = ${k}.`,
      ua:`Розв’яжіть рівняння (x + ${a}) / (x − ${b}) = ${k}.`
    },
    hint:{ru:`Умножьте обе части на x − ${b} и решите линейное уравнение; проверьте, что x ≠ ${b}.`,ua:`Помножте обидві частини на x − ${b} і розв’яжіть лінійне рівняння; перевірте, що x ≠ ${b}.`},
    solution:{
      ru:`ОДЗ: x ≠ ${b}. x + ${a} = ${k}·(x − ${b}) ⇒ x + ${a} = ${k}x − ${k*b} ⇒ ${k-1}x = ${k*b + a} ⇒ x = ${x}. Подходит к ОДЗ.`,
      ua:`ОДЗ: x ≠ ${b}. x + ${a} = ${k}·(x − ${b}) ⇒ x + ${a} = ${k}x − ${k*b} ⇒ ${k-1}x = ${k*b + a} ⇒ x = ${x}. Задовольняє ОДЗ.`
    },
    options:{ru:opts, ua:opts}, correct:correctIdx
  };
}
function genRatInequalityMC(){
  const range = [1,2,3,4,5,6];
  const a = rnd(range.slice(0, -1));
  const b = rnd(range.filter(v => v > a));
  const gt = rnd([true, false]);
  const sign = gt ? ">" : "<";
  const correct = gt
    ? {ru:`x < ${a} или x > ${b}`, ua:`x < ${a} або x > ${b}`}
    : {ru:`${a} < x < ${b}`, ua:`${a} < x < ${b}`};
  const mir = gt
    ? {ru:`x < ${b} или x > ${a}`, ua:`x < ${b} або x > ${a}`}
    : {ru:`${b} < x < ${a}`, ua:`${b} < x < ${a}`};
  const flip = gt
    ? {ru:`x ≤ ${a} или x ≥ ${b}`, ua:`x ≤ ${a} або x ≥ ${b}`}
    : {ru:`${a} ≤ x ≤ ${b}`, ua:`${a} ≤ x ≤ ${b}`};
  const ext = gt
    ? {ru:"все действительные числа", ua:"усі дійсні числа"}
    : {ru:"решений нет", ua:"розв’язків немає"};
  const pool = [correct, mir, flip, ext];
  const order = shuffleArr(pool);
  const optsRu = order.map(e => e.ru);
  const optsUa = order.map(e => e.ua);
  const correctIdx = order.indexOf(correct);
  return {
    topic:{ru:"Рациональное неравенство",ua:"Раціональна нерівність"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{
      ru:`Решите неравенство (x − ${a}) / (x − ${b}) ${sign} 0.`,
      ua:`Розв’яжіть нерівність (x − ${a}) / (x − ${b}) ${sign} 0.`
    },
    hint:{ru:`Нули числителя ${a}, знаменателя ${b}. Знак дроби (x − ${a})/(x − ${b}): плюс снаружи (${a}; ${b}), минус между ними.`,ua:`Нулі чисельника ${a}, знаменника ${b}. Знак дробу (x − ${a})/(x − ${b}): плюс зовні (${a}; ${b}), мінус між ними.`},
    solution:{
      ru:`Нули числителя и знаменателя: x = ${a}, x = ${b}. Метод интервалов даёт ${correct.ru}. Точки x = ${a} и x = ${b} не входят в ответ при строгом знаке.`,
      ua:`Нулі чисельника і знаменника: x = ${a}, x = ${b}. Метод інтервалів дає ${correct.ua}. Точки x = ${a} і x = ${b} не входять у відповідь при строгому знаку.`
    },
    options:{ru:optsRu, ua:optsUa}, correct:correctIdx
  };
}

/* ============================================================
   ГЕНЕРАТОРЫ 5–7 КЛАССА: углы, периметр/площадь, окружность,
   объём параллелепипеда, отношения и пропорции.
   ============================================================ */
function genAngleTypesMC(){
  const DEG = {
    acute:[15,30,45,60,80],
    right:[90],
    obtuse:[105,110,120,135,150,170],
    straight:[180]
  };
  const classOf = d => d < 90 ? "acute" : d === 90 ? "right" : d < 180 ? "obtuse" : "straight";
  const RU_MEASURE = {acute:"острым",right:"прямым",obtuse:"тупым",straight:"развёрнутым"};
  const UA_MEASURE = {acute:"гострим",right:"прямим",obtuse:"тупим",straight:"розгорнутим"};
  const RU_WORD = {acute:"острый",right:"прямой",obtuse:"тупой",straight:"развёрнутый"};
  const UA_WORD = {acute:"гострий",right:"прямий",obtuse:"тупий",straight:"розгорнутий"};

  if(Math.random() < 0.5){
    const deg = rnd([30,45,60,80,90,105,120,135,150,180]);
    const cls = classOf(deg);
    const RU_OPTS = ["острым","прямым","тупым","развёрнутым"];
    const UA_OPTS = ["гострим","прямим","тупим","розгорнутим"];
    const {opts,correctIdx} = buildMC(RU_MEASURE[cls], RU_OPTS.filter(o => o !== RU_MEASURE[cls]));
    const optsUa = opts.map(o => UA_OPTS[RU_OPTS.indexOf(o)]);
    const sol = cls === "acute" ? `${deg}° меньше 90° — угол острый.`
      : cls === "right" ? `${deg}° равно 90° — угол прямой.`
      : cls === "obtuse" ? `${deg}° больше 90° и меньше 180° — угол тупой.`
      : `${deg}° равно 180° — угол развёрнутый.`;
    const solUa = cls === "acute" ? `${deg}° менший за 90° — кут гострий.`
      : cls === "right" ? `${deg}° дорівнює 90° — кут прямий.`
      : cls === "obtuse" ? `${deg}° більший за 90° і менший за 180° — кут тупий.`
      : `${deg}° дорівнює 180° — кут розгорнутий.`;
    return {
      topic:{ru:"Виды углов",ua:"Види кутів"},
      format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
      question:{ru:`Угол α = ${deg}° является:`,ua:`Кут α = ${deg}° є:`},
      hint:{ru:"Сравните меру угла с 90° и 180°.",ua:"Порівняйте міру кута з 90° і 180°."},
      solution:{ru:sol,ua:solUa},
      options:{ru:opts,ua:optsUa},
      correct:correctIdx
    };
  }

  const cls = rnd(["acute","right","obtuse","straight"]);
  const correctDeg = rnd(DEG[cls]);
  const pool = shuffleArr(["acute","right","obtuse","straight"].filter(c => c !== cls).flatMap(c => DEG[c]));
  const wrongDegs = pool.slice(0,3);
  const {opts,correctIdx} = buildMC(correctDeg + "°", wrongDegs.map(d => d + "°"));
  const sol = cls === "acute" ? `Острый угол меньше 90°, поэтому подходит только ${correctDeg}°.`
    : cls === "right" ? `Прямой угол равен 90° — это ${correctDeg}°.`
    : cls === "obtuse" ? `Тупой угол больше 90° и меньше 180° — только ${correctDeg}° удовлетворяет условию.`
    : `Развёрнутый угол равен 180° — это ${correctDeg}°.`;
  const solUa = cls === "acute" ? `Гострий кут менший за 90°, тому підходить лише ${correctDeg}°.`
    : cls === "right" ? `Прямий кут дорівнює 90° — це ${correctDeg}°.`
    : cls === "obtuse" ? `Тупий кут більший за 90° і менший за 180° — лише ${correctDeg}° задовольняє умову.`
    : `Розгорнутий кут дорівнює 180° — це ${correctDeg}°.`;
  return {
    topic:{ru:"Виды углов",ua:"Види кутів"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{ru:`Какой из углов — ${RU_WORD[cls]}?`,ua:`Який із кутів — ${UA_WORD[cls]}?`},
    hint:{ru:"Вспомните границы видов углов: 90° и 180°.",ua:"Згадайте межі видів кутів: 90° і 180°."},
    solution:{ru:sol,ua:solUa},
    options:{ru:opts,ua:opts.slice()},
    correct:correctIdx
  };
}

function genPerimeterAreaShort(){
  const kind = rnd(["rectP","rectS","sqP","sqS"]);
  let a, b, expected, questionRu, questionUa;
  if(kind === "sqP" || kind === "sqS"){
    a = rnd([3,5,7,9,11,12,15,20]);
    expected = kind === "sqP" ? 4 * a : a * a;
    questionRu = kind === "sqP"
      ? `Найдите периметр квадрата со стороной ${a} см.`
      : `Найдите площадь квадрата со стороной ${a} см.`;
    questionUa = kind === "sqP"
      ? `Знайдіть периметр квадрата зі стороною ${a} см.`
      : `Знайдіть площу квадрата зі стороною ${a} см.`;
  }else{
    a = rnd([3,4,5,6,7,8,9,10,12,15]);
    b = rnd([3,4,5,6,7,8,9,10,12,15]);
    if(b === a) b = a === 15 ? a - 1 : a + 1;
    expected = kind === "rectP" ? 2 * (a + b) : a * b;
    questionRu = kind === "rectP"
      ? `Найдите периметр прямоугольника со сторонами ${a} см и ${b} см.`
      : `Найдите площадь прямоугольника со сторонами ${a} см и ${b} см.`;
    questionUa = kind === "rectP"
      ? `Знайдіть периметр прямокутника зі сторонами ${a} см і ${b} см.`
      : `Знайдіть площу прямокутника зі сторонами ${a} см і ${b} см.`;
  }
  const isP = kind === "rectP" || kind === "sqP";
  const unit = isP ? "см" : "см²";
  return {
    topic:{ru:"Периметр и площадь",ua:"Периметр і площа"},
    format:{ru:"целое число",ua:"ціле число"},
    question:{ru:questionRu,ua:questionUa},
    hint:isP
      ? {ru:"Просуммируйте все стороны фигуры.",ua:"Просумуйте всі сторони фігури."}
      : {ru:"Умножьте две соседние стороны.",ua:"Помножте дві сусідні сторони."},
    solution:{ru:`${isP ? "P" : "S"} = ${expected} ${unit}.`,ua:`${isP ? "P" : "S"} = ${expected} ${unit}.`},
    expected:expected,
    correctLabel:String(expected),
    check:input => parseAnswer(input) === expected
  };
}

function genCircleBasicsShort(){
  const kind = rnd(["C_from_r","C_from_d","S_from_r","S_from_d"]);
  let questionRu, questionUa, coef;
  if(kind === "C_from_r"){
    const r = rnd([2,3,4,5,6,7,8,9]);
    coef = 2 * r;
    questionRu = `Найдите длину окружности, если её радиус равен ${r}. Ответ выразите через π.`;
    questionUa = `Знайдіть довжину окружності, якщо її радіус дорівнює ${r}. Відповідь виразіть через π.`;
  }else if(kind === "C_from_d"){
    const d = rnd([4,6,8,10,12]);
    coef = d;
    questionRu = `Найдите длину окружности, если её диаметр равен ${d}. Ответ выразите через π.`;
    questionUa = `Знайдіть довжину окружності, якщо її діаметр дорівнює ${d}. Відповідь виразіть через π.`;
  }else if(kind === "S_from_r"){
    const r = rnd([2,3,4,5,6,7,8,9]);
    coef = r * r;
    questionRu = `Найдите площадь круга, если его радиус равен ${r}. Ответ выразите через π.`;
    questionUa = `Знайдіть площу кола, якщо його радіус дорівнює ${r}. Відповідь виразіть через π.`;
  }else{
    const d = rnd([4,6,8,10,12]);
    const r = d / 2;
    coef = r * r;
    questionRu = `Найдите площадь круга, если его диаметр равен ${d}. Ответ выразите через π.`;
    questionUa = `Знайдіть площу кола, якщо його діаметр дорівнює ${d}. Відповідь виразіть через π.`;
  }
  const expected = coef * Math.PI;
  const isC = kind === "C_from_r" || kind === "C_from_d";
  const letter = isC ? "C" : "S";
  const solutionRu = isC
    ? `По формуле C = 2πR (или C = πd): ${letter} = ${coef}π.`
    : `По формуле S = πR²: ${letter} = ${coef}π.`;
  const solutionUa = isC
    ? `За формулою C = 2πR (або C = πd): ${letter} = ${coef}π.`
    : `За формулою S = πR²: ${letter} = ${coef}π.`;
  return {
    topic:{ru:"Окружность и круг",ua:"Окружність і коло"},
    format:{ru:"выражение через π",ua:"вираз через π"},
    question:{ru:questionRu,ua:questionUa},
    hint:isC
      ? {ru:"Используйте формулу длины окружности C = 2πR = πd.",ua:"Скористайтеся формулою довжини окружності C = 2πR = πd."}
      : {ru:"Используйте формулу площади круга S = πR².",ua:"Скористайтеся формулою площі кола S = πR²."},
    solution:{ru:solutionRu,ua:solutionUa},
    expected:expected,
    correctLabel:coef + "π",
    check:input => {
      const s = String(input == null ? "" : input).trim().toLowerCase().replace(/\s+/g,"");
      if(s === coef + "π" || s === coef + "pi") return true;
      return near(parseAnswer(input), expected, 0.01);
    }
  };
}

function genBoxVolumeShort(){
  const isCube = rnd([true, false]);
  if(isCube){
    const a = rnd([2,3,4,5,6,7]);
    const answer = a*a*a;
    return {
      topic:{ru:"Куб и прямоугольный параллелепипед",ua:"Куб і прямокутний паралелепіпед"},
      format:{ru:"целое число",ua:"ціле число"},
      question:{ru:`Куб: ребро a = ${a} см. Найдите объём в см³ (целое число).`,ua:`Куб: ребро a = ${a} см. Знайдіть об’єм у см³ (ціле число).`},
      hint:{ru:"У куба все рёбра равны: V = a³.",ua:"У куба всі ребра рівні: V = a³."},
      solution:{
        ru:`V = a³ = ${a} · ${a} · ${a} = ${answer} см³.`,
        ua:`V = a³ = ${a} · ${a} · ${a} = ${answer} см³.`
      },
      expected:answer, correctLabel:String(answer),
      check(input){ const v=parseAnswer(input); return !isNaN(v) && v===answer; }
    };
  }
  const a = rnd([2,3,4,5,6]);
  const b = rnd([2,3,4,5]);
  const c = rnd([2,3,4]);
  const answer = a*b*c;
  return {
    topic:{ru:"Куб и прямоугольный параллелепипед",ua:"Куб і прямокутний паралелепіпед"},
    format:{ru:"целое число",ua:"ціле число"},
    question:{ru:`Прямоугольный параллелепипед: a = ${a}, b = ${b}, c = ${c} см. Найдите объём в см³ (целое число).`,ua:`Прямокутний паралелепіпед: a = ${a}, b = ${b}, c = ${c} см. Знайдіть об’єм у см³ (ціле число).`},
    hint:{ru:"Объём равен произведению трёх рёбер: V = a·b·c.",ua:"Об’єм дорівнює добутку трьох ребер: V = a·b·c."},
    solution:{
      ru:`V = a·b·c = ${a} · ${b} · ${c} = ${answer} см³.`,
      ua:`V = a·b·c = ${a} · ${b} · ${c} = ${answer} см³.`
    },
    expected:answer, correctLabel:String(answer),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && v===answer; }
  };
}

function genRatioProportionShort(){
  const findUnknown = rnd([true, false]);
  if(findUnknown){
    const fr = rnd([[1,2],[1,3],[1,4],[1,5],[2,3],[2,5],[2,7],[3,4],[3,5],[4,3],[4,5],[5,3],[5,4],[5,6],[5,7],[6,5],[7,6]]);
    const b = fr[0];
    const c = fr[1];
    const k = rnd([2,3,4,5,6]);
    const a = c*k;
    const answer = k*b;
    return {
      topic:{ru:"Отношения и пропорции",ua:"Відношення та пропорції"},
      format:{ru:"целое число",ua:"ціле число"},
      question:{ru:`Найдите неизвестный член пропорции: x / ${a} = ${b} / ${c}. Ответ — целое число.`,ua:`Знайдіть невідомий член пропорції: x / ${a} = ${b} / ${c}. Відповідь — ціле число.`},
      hint:{ru:"Основное свойство пропорции: произведения крайних и средних членов равны.",ua:"Основна властивість пропорції: добутки крайніх і середніх членів рівні."},
      solution:{
        ru:`Из x / ${a} = ${b} / ${c} следует x = ${a} · ${b} / ${c} = ${a*b} / ${c} = ${answer}.`,
        ua:`З x / ${a} = ${b} / ${c} випливає x = ${a} · ${b} / ${c} = ${a*b} / ${c} = ${answer}.`
      },
      expected:answer, correctLabel:String(answer),
      check(input){ const v=parseAnswer(input); return !isNaN(v) && v===answer; }
    };
  }
  const k = rnd([2,3,4,5,6,7]);
  const small = rnd([2,3,4,5,6,8,9,10]);
  const p = k*small;
  const answer = k;
  return {
    topic:{ru:"Отношения и пропорции",ua:"Відношення та пропорції"},
    format:{ru:"целое число",ua:"ціле число"},
    question:{ru:`Сократите отношение ${p} : ${small} и запишите его в виде числа (целое число).`,ua:`Скоротіть відношення ${p} : ${small} і запишіть його у вигляді числа (ціле число).`},
    hint:{ru:"Отношение равно частному: разделите первое число на второе.",ua:"Відношення дорівнює частці: поділіть перше число на друге."},
    solution:{
      ru:`${p} : ${small} = ${p} / ${small} = ${answer}.`,
      ua:`${p} : ${small} = ${p} / ${small} = ${answer}.`
    },
    expected:answer, correctLabel:String(answer),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && v===answer; }
  };
}

/* ============================================================
   МОДУЛЬ 1 — АЛГЕБРАИЧЕСКАЯ БАЗА (5–7).
   Генераторы для новой темы: делимость, дроби, десятичные дроби,
   остатки, степени, выражения, неравенства, одночлены, ФСУ,
   линейные уравнения и функции, системы уравнений и задачи.
   ============================================================ */
function genDivisibilityMC(){
  const ROWS = [
    {k:3, good:"123", bad:["124","125","127"]},
    {k:3, good:"147", bad:["146","148","149"]},
    {k:5, good:"125", bad:["122","123","127"]},
    {k:5, good:"230", bad:["231","232","233"]},
    {k:9, good:"117", bad:["118","119","121"]},
    {k:9, good:"243", bad:["244","245","247"]},
    {k:4, good:"128", bad:["121","123","125"]},
    {k:4, good:"332", bad:["334","335","337"]},
    {k:6, good:"126", bad:["122","128","130"]},
    {k:6, good:"222", bad:["214","215","218"]}
  ];
  const row = rnd(ROWS);
  const {opts,correctIdx} = buildMC(row.good, row.bad);
  return {
    topic:{ru:"Признаки делимости",ua:"Ознаки подільності"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{ru:`Какое из чисел делится на ${row.k} без остатка?`,ua:`Яке з чисел ділиться на ${row.k} без остачі?`},
    hint:{ru:`Используйте признак делимости на ${row.k}.`,ua:`Використайте ознаку подільності на ${row.k}.`},
    solution:{ru:`Число ${row.good} делится на ${row.k} без остатка.`,ua:`Число ${row.good} ділиться на ${row.k} без остачі.`},
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}

function genFractionMC(){
  const gcd = (a,b)=>{ a=Math.abs(a); b=Math.abs(b); while(b){ const t=a%b; a=b; b=t; } return a; };
  const reduced = (na,da)=>{ const g=gcd(na,da)||1; const n=na/g, d=da/g; return d===1? String(n) : n+"/"+d; };
  const POOL = ["1/2","1/3","2/3","3/4","2/5","3/5","5/6","1/4","3/7","1/6","4/5"];
  const SIMPLIFY = [[6,8],[8,12],[10,25],[12,16],[15,35],[18,24]];
  const SUMS = [[1,2,1,3],[1,4,1,4],[1,3,1,6],[1,2,1,4],[2,3,1,6],[1,3,1,2]];
  const MULS = [[2,3,3,4],[1,2,2,3],[3,4,4,5],[2,5,5,6]];
  const EQS = [[12,18],[9,12],[20,30]];
  const kind = rnd(["simplify","sum","mul","eq"]);
  let questionRu, questionUa, correct, solutionRu, solutionUa;
  if(kind === "simplify"){
    const r = rnd(SIMPLIFY);
    correct = reduced(r[0], r[1]);
    questionRu = `Сократите дробь ${r[0]}/${r[1]}.`;
    questionUa = `Скоротіть дріб ${r[0]}/${r[1]}.`;
    solutionRu = `Делим числитель и знаменатель на ${gcd(r[0],r[1])}: ${correct}.`;
    solutionUa = `Ділимо чисельник і знаменник на ${gcd(r[0],r[1])}: ${correct}.`;
  }else if(kind === "sum"){
    const r = rnd(SUMS);
    const num = r[0]*r[3] + r[2]*r[1];
    const den = r[1]*r[3];
    correct = reduced(num, den);
    questionRu = `Сложите дроби: ${r[0]}/${r[1]} + ${r[2]}/${r[3]}.`;
    questionUa = `Додайте дроби: ${r[0]}/${r[1]} + ${r[2]}/${r[3]}.`;
    solutionRu = `Общий знаменатель ${r[1]*r[3]}: числитель ${r[0]*r[3]} + ${r[2]*r[1]} = ${correct}.`;
    solutionUa = `Спільний знаменник ${r[1]*r[3]}: чисельник ${r[0]*r[3]} + ${r[2]*r[1]} = ${correct}.`;
  }else if(kind === "mul"){
    const r = rnd(MULS);
    correct = reduced(r[0]*r[2], r[1]*r[3]);
    questionRu = `Умножьте дроби: ${r[0]}/${r[1]} и ${r[2]}/${r[3]}.`;
    questionUa = `Помножте дроби: ${r[0]}/${r[1]} і ${r[2]}/${r[3]}.`;
    solutionRu = `${r[0]}/${r[1]} · ${r[2]}/${r[3]} = ${correct}.`;
    solutionUa = `${r[0]}/${r[1]} · ${r[2]}/${r[3]} = ${correct}.`;
  }else{
    const r = rnd(EQS);
    correct = reduced(r[0], r[1]);
    questionRu = `Какая из дробей равна ${r[0]}/${r[1]}?`;
    questionUa = `Який із дробів дорівнює ${r[0]}/${r[1]}?`;
    solutionRu = `Сокращая ${r[0]}/${r[1]} на ${gcd(r[0],r[1])}, получаем ${correct}.`;
    solutionUa = `Скорочуючи ${r[0]}/${r[1]} на ${gcd(r[0],r[1])}, отримуємо ${correct}.`;
  }
  const distractors = shuffleArr(POOL.filter(f => f !== correct)).slice(0, 3);
  const {opts,correctIdx} = buildMC(correct, distractors);
  return {
    topic:{ru:"Дроби: сложение и умножение",ua:"Дроби: додавання та множення"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{ru:questionRu,ua:questionUa},
    hint:{ru:"Приводите к общему знаменателю и сокращайте результат.",ua:"Зводьте до спільного знаменника та скорочуйте результат."},
    solution:{ru:solutionRu,ua:solutionUa},
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}

function genDecimalShort(){
  const fmtDec = x => String(x).replace(".", ",");
  const convRows = [
    {num:7,den:10,val:0.7},{num:1,den:2,val:0.5},{num:3,den:4,val:0.75},
    {num:1,den:5,val:0.2},{num:3,den:5,val:0.6},{num:7,den:20,val:0.35},
    {num:9,den:50,val:0.18}
  ];
  const addRows = [
    {a:0.25,b:0.45,val:0.7},{a:0.3,b:0.4,val:0.7},{a:0.05,b:0.1,val:0.05+0.1},
    {a:1.5,b:2.25,val:3.75},{a:0.25,b:0.5,val:0.75},{a:0.4,b:0.35,val:0.75}
  ];
  if(Math.random() < 0.55){
    const r = rnd(convRows);
    const label = fmtDec(r.val);
    return {
      topic:{ru:"Десятичные дроби",ua:"Десяткові дроби"},
      format:{ru:"десятичная дробь",ua:"десятковий дріб"},
      question:{ru:`Запишите дробь ${r.num}/${r.den} в виде десятичной дроби.`,ua:`Запишіть дріб ${r.num}/${r.den} у вигляді десяткового дробу.`},
      hint:{ru:"Сколько нулей в знаменателе, столько цифр после запятой.",ua:"Скільки нулів у знаменнику, стільки цифр після коми."},
      solution:{ru:`${r.num}/${r.den} = ${label}.`,ua:`${r.num}/${r.den} = ${label}.`},
      expected:r.val, correctLabel:label,
      check(input){ const v=parseAnswer(input); return !isNaN(v) && near(v, r.val, 1e-9); }
    };
  }
  const r = rnd(addRows);
  const label = fmtDec(r.val);
  const fa = String(r.a).replace(".",","), fb = String(r.b).replace(".",",");
  return {
    topic:{ru:"Десятичные дроби",ua:"Десяткові дроби"},
    format:{ru:"десятичная дробь",ua:"десятковий дріб"},
    question:{ru:`Найдите сумму: ${fa} + ${fb}.`,ua:`Знайдіть суму: ${fa} + ${fb}.`},
    hint:{ru:"Складывайте поразрядно, как целые числа.",ua:"Додавайте порозрядно, як цілі числа."},
    solution:{ru:`${fa} + ${fb} = ${label}.`,ua:`${fa} + ${fb} = ${label}.`},
    expected:r.val, correctLabel:label,
    check(input){ const v=parseAnswer(input); return !isNaN(v) && near(v, r.val, 1e-9); }
  };
}

function genRemainderShort(){
  const ROWS = [
    [17,5,2],[45,6,3],[29,7,1],[50,8,2],[38,5,3],
    [19,6,1],[32,7,4],[40,9,4],[26,8,2],[71,9,8]
  ];
  const r = rnd(ROWS);
  const q = Math.floor(r[0]/r[1]);
  return {
    topic:{ru:"Деление с остатком",ua:"Ділення з остачею"},
    format:{ru:"целое число",ua:"ціле число"},
    question:{ru:`Найдите остаток при делении ${r[0]} на ${r[1]}.`,ua:`Знайдіть остачу при діленні ${r[0]} на ${r[1]}.`},
    hint:{ru:`Самое близкое кратное делителя — ${q}·${r[1]} = ${q*r[1]}.`,ua:`Найближче кратне дільника — ${q}·${r[1]} = ${q*r[1]}.`},
    solution:{ru:`${r[0]} = ${q}·${r[1]} + ${r[2]}, значит остаток равен ${r[2]}.`,ua:`${r[0]} = ${q}·${r[1]} + ${r[2]}, отже остача дорівнює ${r[2]}.`},
    expected:r[2], correctLabel:String(r[2]),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && v===r[2]; }
  };
}

function genPowerIntShort(){
  const EXP = {"0":"⁰","1":"¹","2":"²","3":"³","4":"⁴","5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹","-":"⁻"};
  const sup = n => String(n).split("").map(d => EXP[d]).join("");
  const state = rnd(["mul","div","pow","zero","neg"]);
  let base, e1, e2, result, questionRu, questionUa, label, isFloat=false;
  if(state === "mul"){
    const rows = [[2,3,2],[3,2,3],[5,2,2]];
    const r = rnd(rows);
    base=r[0]; e1=r[1]; e2=r[2];
    result = Math.pow(base, e1+e2);
    questionRu = `Найдите значение: ${base}${sup(e1)} · ${base}${sup(e2)}.`;
    questionUa = `Знайдіть значення: ${base}${sup(e1)} · ${base}${sup(e2)}.`;
  }else if(state === "div"){
    const rows = [[3,6,4],[2,5,2],[5,3,2]];
    const r = rnd(rows);
    base=r[0]; e1=r[1]; e2=r[2];
    result = Math.pow(base, e1-e2);
    questionRu = `Найдите значение: ${base}${sup(e1)} : ${base}${sup(e2)}.`;
    questionUa = `Знайдіть значення: ${base}${sup(e1)} : ${base}${sup(e2)}.`;
  }else if(state === "pow"){
    const rows = [[2,2,3],[3,2,2],[2,3,2]];
    const r = rnd(rows);
    base=r[0]; e1=r[1]; e2=r[2];
    result = Math.pow(base, e1*e2);
    questionRu = `Найдите значение: (${base}${sup(e1)})${sup(e2)}.`;
    questionUa = `Знайдіть значення: (${base}${sup(e1)})${sup(e2)}.`;
  }else if(state === "zero"){
    base = rnd([7,9]);
    result = 1;
    questionRu = `Найдите значение: ${base}⁰.`;
    questionUa = `Знайдіть значення: ${base}⁰.`;
  }else{
    base = 10; e1 = 2;
    result = 0.01; isFloat = true;
    questionRu = `Найдите значение: 10⁻².`;
    questionUa = `Знайдіть значення: 10⁻².`;
  }
  label = isFloat ? "0,01" : String(result);
  return {
    topic:{ru:"Степень с натуральным показателем",ua:"Степінь із натуральним показником"},
    format:isFloat ? {ru:"десятичная дробь",ua:"десятковий дріб"} : {ru:"целое число",ua:"ціле число"},
    question:{ru:questionRu,ua:questionUa},
    hint:{ru:"Складывайте/вычитайте показатели при общем основании.",ua:"Додавайте/віднімайте показники при спільній основі."},
    solution:{ru:`Результат: ${label}.`,ua:`Результат: ${label}.`},
    expected:result, correctLabel:label,
    check(input){ const v=parseAnswer(input); return !isNaN(v) && (isFloat ? near(v, 0.01, 1e-9) : v===result); }
  };
}

function genExprValueShort(){
  const ROWS = [
    ["2x + 3",4,11],["3(x + 2)",1,9],["5x − 2",5,23],["x² + 1",3,10],
    ["2(x + 5)",10,30],["4x − 1",6,23],["x/2 + 1",8,5],["3x + 2",4,14]
  ];
  const r = rnd(ROWS);
  return {
    topic:{ru:"Буквенные выражения и формулы",ua:"Буквені вирази та формули"},
    format:{ru:"целое число",ua:"ціле число"},
    question:{ru:`Найдите значение выражения ${r[0]} при x = ${r[1]}.`,ua:`Знайдіть значення виразу ${r[0]} при x = ${r[1]}.`},
    hint:{ru:"Подставьте число вместо x и выполните действия.",ua:"Підставте число замість x і виконайте дії."},
    solution:{ru:`При x = ${r[1]}: ${r[0]} = ${r[2]}.`,ua:`При x = ${r[1]}: ${r[0]} = ${r[2]}.`},
    expected:r[2], correctLabel:String(r[2]),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && v===r[2]; }
  };
}

function genIneqCompareMC(){
  const kind = rnd(["smallest","compare","solve","numberline"]);
  if(kind === "smallest"){
    const sets = [["−4","−1","0","2"],["−7","−2","−3","6"],["−3","0","1","5"],["3","−9","5","7"]];
    const opts = rnd(sets);
    const values = opts.map(s => parseFloat(s.replace("−","-")));
    const min = Math.min(...values);
    const correct = String(min).replace("-","−");
    return {
      topic:{ru:"Неравенства и сравнение чисел",ua:"Нерівності та порівняння чисел"},
      format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
      question:{ru:"Какое из чисел наименьшее?",ua:"Яке з чисел найменше?"},
      hint:{ru:"Наименьшее — то, что на координатной прямой стоит левее всех.",ua:"Найменше — те, що на координатній прямій стоїть лівіше за всі."},
      solution:{ru:`Сравнивая числа, получаем ответ ${correct}.`,ua:`Порівнюючи числа, отримуємо відповідь ${correct}.`},
      options:{ru:opts,ua:opts}, correct:opts.indexOf(correct)
    };
  }
  if(kind === "compare"){
    const rows = [[-4,-1],[-7,-2],[0,-3]];
    const r = rnd(rows);
    const a=r[0], b=r[1];
    const rel = a>b ? ">" : a<b ? "<" : "=";
    const correct = `${a} ${rel} ${b}`;
    const others = [`${a} > ${b}`,`${a} = ${b}`,`${a} < ${b}`,`${b} < ${a}`].filter(s => s !== correct);
    const {opts,correctIdx} = buildMC(correct, others.slice(0,3));
    return {
      topic:{ru:"Неравенства и сравнение чисел",ua:"Нерівності та порівняння чисел"},
      format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
      question:{ru:`Сравните: ${a} и ${b}.`,ua:`Порівняйте: ${a} і ${b}.`},
      hint:{ru:"Из двух чисел больше то, которое правее на координатной прямой.",ua:"З двох чисел більше те, що правіше на координатній прямій."},
      solution:{ru:`${a} ${rel} ${b}: ${a} стоит ${a<b ? "левее" : "правее"} числа ${b}.`,ua:`${a} ${rel} ${b}: ${a} стоїть ${a<b ? "лівіше" : "правіше"} числа ${b}.`},
      options:{ru:opts,ua:opts}, correct:correctIdx
    };
  }
  if(kind === "solve"){
    const rows = [
      {t:"x + 2 < 7", c:"x < 5", bad:["x > 5","x < 9","x < 7"]},
      {t:"x − 3 > 4", c:"x > 7", bad:["x < 7","x > 1","x > 4"]},
      {t:"2x > 8", c:"x > 4", bad:["x < 4","x > 6","x > 16"]},
      {t:"−x < 5", c:"x > −5", bad:["x < −5","x > 5","x < 5"]},
      {t:"x/2 ≥ 6", c:"x ≥ 12", bad:["x ≥ 3","x ≥ 8","x ≤ 12"]}
    ];
    const r = rnd(rows);
    const {opts,correctIdx} = buildMC(r.c, r.bad);
    return {
      topic:{ru:"Неравенства и сравнение чисел",ua:"Нерівності та порівняння чисел"},
      format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
      question:{ru:`Решите неравенство ${r.t}.`,ua:`Розв’яжіть нерівність ${r.t}.`},
      hint:{ru:"Прибавляйте/делите обе части, не забывая менять знак при делении на минус.",ua:"Додавайте/діліть обидві частини, не забуваючи змінювати знак при діленні на мінус."},
      solution:{ru:`Неравенство ${r.t} сводится к ${r.c}.`,ua:`Нерівність ${r.t} зводиться до ${r.c}.`},
      options:{ru:opts,ua:opts}, correct:correctIdx
    };
  }
  const rows = [
    {a:"−7", b:"−2", c:"−7", opts:["−2","−7","−4","−9"]},
    {a:"−3", b:"1", c:"−3", opts:["1","−3","−1","0"]},
    {a:"2", b:"5", c:"2", opts:["5","2","3","7"]},
    {a:"−1", b:"−6", c:"−6", opts:["−1","−6","−3","−4"]}
  ];
  const r = rnd(rows);
  const others = r.opts.filter(s => s !== r.c);
  const {opts,correctIdx} = buildMC(r.c, others);
  return {
    topic:{ru:"Неравенства и сравнение чисел",ua:"Нерівності та порівняння чисел"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{ru:`На координатной прямой какое число расположено левее: ${r.a} или ${r.b}?`,ua:`На координатній прямій яке число розташоване лівіше: ${r.a} чи ${r.b}?`},
    hint:{ru:"Меньшее число стоит левее.",ua:"Менше число стоїть лівіше."},
    solution:{ru:`${r.a} и ${r.b}: меньшее — ${r.c}, оно лежит левее.`,ua:`${r.a} і ${r.b}: менше — ${r.c}, воно лежить лівіше.`},
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}

function genLikeTermsMC(){
  const kind = rnd(["sum","twogrp","mono","like"]);
  if(kind === "sum"){
    const rows = [
      {e:"5x + 3x", c:"8x", bad:["8x²","2x","15x"]},
      {e:"2a + 7a", c:"9a", bad:["9a²","5a","14a"]},
      {e:"4x − x", c:"3x", bad:["5x","4x","3x²"]},
      {e:"3b + 2b + 5b", c:"10b", bad:["10b²","15b","6b"]},
      {e:"6m − 2m + m", c:"5m", bad:["5m²","9m","3m"]}
    ];
    const r = rnd(rows);
    const {opts,correctIdx} = buildMC(r.c, r.bad);
    return {
      topic:{ru:"Одночлены и подобные слагаемые",ua:"Одночлени та подібні доданки"},
      format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
      question:{ru:`Приведите подобные слагаемые: ${r.e}.`,ua:`Зведіть подібні доданки: ${r.e}.`},
      hint:{ru:"Сложите коэффициенты при одинаковой буквенной части.",ua:"Додайте коефіцієнти при однаковій буквеній частині."},
      solution:{ru:`После приведения получаем ${r.c}.`,ua:`Після зведення отримуємо ${r.c}.`},
      options:{ru:opts,ua:opts}, correct:correctIdx
    };
  }
  if(kind === "twogrp"){
    const rows = [
      {e:"4x + 2y + 3x + y", c:"7x + 3y", bad:["10xy","7x + 3y + xy","7x + 2y"]},
      {e:"5a + 3b + a + 2b", c:"6a + 5b", bad:["11ab","6a + 5b + ab","6a + 3b"]}
    ];
    const r = rnd(rows);
    const {opts,correctIdx} = buildMC(r.c, r.bad);
    return {
      topic:{ru:"Одночлены и подобные слагаемые",ua:"Одночлени та подібні доданки"},
      format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
      question:{ru:`Приведите подобные слагаемые: ${r.e}.`,ua:`Зведіть подібні доданки: ${r.e}.`},
      hint:{ru:"Сгруппируйте слагаемые по одинаковой буквенной части.",ua:"Згрупуйте доданки за однаковою буквеною частиною."},
      solution:{ru:`После приведения получаем ${r.c}.`,ua:`Після зведення отримуємо ${r.c}.`},
      options:{ru:opts,ua:opts}, correct:correctIdx
    };
  }
  if(kind === "mono"){
    const rows = [
      {opts:["3x + 1","3/x","3x²","x + y"], c:2},
      {opts:["2x + 3","2/3","2x · 3y","x − y"], c:2}
    ];
    const r = rnd(rows);
    return {
      topic:{ru:"Одночлены и подобные слагаемые",ua:"Одночлени та подібні доданки"},
      format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
      question:{ru:"Какое из выражений является одночленом?",ua:"Який із виразів є одночленом?"},
      hint:{ru:"Одночлен — произведение числа и переменных без суммы и деления.",ua:"Одночлен — добуток числа та змінних без суми та ділення."},
      solution:{ru:"Одночлен — ${r.opts[r.c]}.",ua:"Одночлен — ${r.opts[r.c]}."},
      options:{ru:r.opts,ua:r.opts}, correct:r.c
    };
  }
  const rows = [
    {opts:["3x и 5x","3x и 3y","3x и 3x²","3 и 3x"], c:0},
    {opts:["2a и 2ab","2a и 2b","4a и 9a","a и a²"], c:2}
  ];
  const r = rnd(rows);
  return {
    topic:{ru:"Одночлены и подобные слагаемые",ua:"Одночлени та подібні доданки"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{ru:"Какие из выражений являются подобными?",ua:"Які з виразів є подібними?"},
    hint:{ru:"Подобные имеют одинаковую буквенную часть.",ua:"Подібні мають однакову буквену частину."},
    solution:{ru:"Подобные пары — ${r.opts[r.c]}.",ua:"Подібні пари — ${r.opts[r.c]}."},
    options:{ru:r.opts,ua:r.opts}, correct:r.c
  };
}

function genSqrDiffMC(){
  const kind = rnd(["sqsum","sqdiff","difsq","calc"]);
  if(kind === "sqsum"){
    const rows = [
      {v:"x", n:3, bad:["x² + 9","x² + 6x","x² − 9"]},
      {v:"y", n:4, bad:["y² + 16","y² + 8y","y² − 16"]},
      {v:"a", n:2, bad:["a² + 4","a² + 4a","a² − 4"]}
    ];
    const r = rnd(rows);
    const correct = `${r.v}² + ${2*r.n}${r.v} + ${r.n*r.n}`;
    const {opts,correctIdx} = buildMC(correct, r.bad);
    return {
      topic:{ru:"Формулы сокращённого умножения",ua:"Формули скороченого множення"},
      format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
      question:{ru:`Раскройте скобки: (${r.v} + ${r.n})².`,ua:`Розкрийте дужки: (${r.v} + ${r.n})².`},
      hint:{ru:"(a + b)² = a² + 2ab + b².",ua:"(a + b)² = a² + 2ab + b²."},
      solution:{ru:`(${r.v} + ${r.n})² = ${correct}.`,ua:`(${r.v} + ${r.n})² = ${correct}.`},
      options:{ru:opts,ua:opts}, correct:correctIdx
    };
  }
  if(kind === "sqdiff"){
    const rows = [
      {v:"y", n:4, bad:["y² − 16","y² + 8y + 16","y² − 8y − 16"]},
      {v:"x", n:3, bad:["x² − 9","x² + 6x + 9","x² − 6x − 9"]},
      {v:"a", n:5, bad:["a² − 25","a² + 10a + 25","a² − 10a − 25"]}
    ];
    const r = rnd(rows);
    const correct = `${r.v}² − ${2*r.n}${r.v} + ${r.n*r.n}`;
    const {opts,correctIdx} = buildMC(correct, r.bad);
    return {
      topic:{ru:"Формулы сокращённого умножения",ua:"Формули скороченого множення"},
      format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
      question:{ru:`Раскройте скобки: (${r.v} − ${r.n})².`,ua:`Розкрийте дужки: (${r.v} − ${r.n})².`},
      hint:{ru:"(a − b)² = a² − 2ab + b².",ua:"(a − b)² = a² − 2ab + b²."},
      solution:{ru:`(${r.v} − ${r.n})² = ${correct}.`,ua:`(${r.v} − ${r.n})² = ${correct}.`},
      options:{ru:opts,ua:opts}, correct:correctIdx
    };
  }
  if(kind === "difsq"){
    const rows = [
      {v:"x", n:5, bad:["x² − 10x + 25","x² + 25","x² + 10x − 25"]},
      {v:"b", n:6, bad:["b² − 12b + 36","b² + 36","b² + 12b − 36"]},
      {v:"m", n:4, bad:["m² − 8m + 16","m² + 16","m² + 8m − 16"]}
    ];
    const r = rnd(rows);
    const correct = `${r.v}² − ${r.n*r.n}`;
    const {opts,correctIdx} = buildMC(correct, r.bad);
    return {
      topic:{ru:"Формулы сокращённого умножения",ua:"Формули скороченого множення"},
      format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
      question:{ru:`Разложите: (${r.v} − ${r.n})(${r.v} + ${r.n}).`,ua:`Розкладіть: (${r.v} − ${r.n})(${r.v} + ${r.n}).`},
      hint:{ru:"(a − b)(a + b) = a² − b².",ua:"(a − b)(a + b) = a² − b²."},
      solution:{ru:`(${r.v} − ${r.n})(${r.v} + ${r.n}) = ${correct}.`,ua:`(${r.v} − ${r.n})(${r.v} + ${r.n}) = ${correct}.`},
      options:{ru:opts,ua:opts}, correct:correctIdx
    };
  }
  const rows = [
    {n:101, c:"10201", bad:["10001","10101","11001"]},
    {n:99, c:"9801", bad:["9601","9901","10801"]},
    {n:202, c:"40804", bad:["40004","40808","40408"]}
  ];
  const r = rnd(rows);
  const {opts,correctIdx} = buildMC(r.c, r.bad);
  return {
    topic:{ru:"Формулы сокращённого умножения",ua:"Формули скороченого множення"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{ru:`Вычислите: ${r.n}².`,ua:`Обчисліть: ${r.n}².`},
    hint:{ru:"101² = (100 + 1)² и т.п.",ua:"101² = (100 + 1)² тощо."},
    solution:{ru:`${r.n}² = ${r.c}.`,ua:`${r.n}² = ${r.c}.`},
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}

function genLinearEqShort(){
  const ROWS = [
    {e:"x + 5 = 12", a:7},{e:"x − 4 = 9", a:13},{e:"2x = 14", a:7},
    {e:"3x − 6 = 12", a:6},{e:"5x + 5 = 30", a:5},{e:"7 − x = 3", a:4},
    {e:"2x + 1 = 9", a:4},{e:"6 − x = 2", a:4},{e:"x / 4 = 8", a:32},
    {e:"x + 12 = 19", a:7},{e:"4x = 36", a:9},{e:"2(x + 3) = 16", a:5}
  ];
  const r = rnd(ROWS);
  return {
    topic:{ru:"Линейные уравнения",ua:"Лінійні рівняння"},
    format:{ru:"целое число",ua:"ціле число"},
    question:{ru:`Решите уравнение ${r.e}.`,ua:`Розв’яжіть рівняння ${r.e}.`},
    hint:{ru:"Перенесите слагаемые, затем разделите на коэффициент.",ua:"Перенесіть доданки, потім поділіть на коефіцієнт."},
    solution:{ru:`Из ${r.e} получаем x = ${r.a}.`,ua:`З ${r.e} отримуємо x = ${r.a}.`},
    expected:r.a, correctLabel:String(r.a),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && v===r.a; }
  };
}

function genLinearFuncShort(){
  const kind = rnd(["value","inter","linear"]);
  if(kind === "value"){
    const rows = [
      {f:"2x + 1",x:3,v:7},{f:"3x − 2",x:4,v:10},{f:"x + 5",x:7,v:12},
      {f:"2x + 3",x:4,v:11},{f:"−x + 8",x:3,v:5},{f:"5x − 5",x:2,v:5}
    ];
    const r = rnd(rows);
    return {
      topic:{ru:"Функции и линейная функция",ua:"Функції та лінійна функція"},
      format:{ru:"целое число",ua:"ціле число"},
      question:{ru:`Найдите значение функции y = ${r.f} при x = ${r.x}.`,ua:`Знайдіть значення функції y = ${r.f} при x = ${r.x}.`},
      hint:{ru:"Подставьте x и вычислите y.",ua:"Підставте x і обчисліть y."},
      solution:{ru:`y = ${r.f} при x = ${r.x}: y = ${r.v}.`,ua:`y = ${r.f} при x = ${r.x}: y = ${r.v}.`},
      expected:r.v, correctLabel:String(r.v),
      check(input){ const v=parseAnswer(input); return !isNaN(v) && v===r.v; }
    };
  }
  if(kind === "inter"){
    const rows = [
      {f:"2x + 1", b:"1"},{f:"3x − 2", b:"−2"},{f:"x + 5", b:"5"},{f:"−2x + 7", b:"7"}
    ];
    const r = rnd(rows);
    const correct = `(0; ${r.b})`;
    const {opts,correctIdx} = buildMC(correct, ["(0; 0)","(1; 0)","(1; 1)"]);
    return {
      topic:{ru:"Функции и линейная функция",ua:"Функції та лінійна функція"},
      format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
      question:{ru:`В какой точке график функции y = ${r.f} пересекает ось Oy?`,ua:`У якій точці графік функції y = ${r.f} перетинає вісь Oy?`},
      hint:{ru:"При x = 0 получаем y = b.",ua:"При x = 0 отримуємо y = b."},
      solution:{ru:`x = 0 → y = ${r.b}, точка ${correct}.`,ua:`x = 0 → y = ${r.b}, точка ${correct}.`},
      options:{ru:opts,ua:opts}, correct:correctIdx
    };
  }
  const rows = [
    {opts:["y = 2x − 1","y = x²","y = 2/x","y = √x"], c:0},
    {opts:["y = x/2","y = 3/x","y = x² + 1","y = √x"], c:0},
    {opts:["y = 0,5x + 3","y = x³","y = 2/x","y = x²"], c:0}
  ];
  const r = rnd(rows);
  return {
    topic:{ru:"Функции и линейная функция",ua:"Функції та лінійна функція"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{ru:"Какая из функций является линейной?",ua:"Яка з функцій є лінійною?"},
    hint:{ru:"Линейная функция имеет вид y = kx + b.",ua:"Лінійна функція має вигляд y = kx + b."},
    solution:{ru:"Линейная — ${r.opts[r.c]}.",ua:"Лінійна — ${r.opts[r.c]}."},
    options:{ru:r.opts,ua:r.opts}, correct:r.c
  };
}

function genSystemWordMC(){
  const rows = [
    {q:`Сумма двух чисел равна 12, а разность равна 4. Найдите большее из них.`,
     ua:`Сума двох чисел дорівнює 12, а різниця дорівнює 4. Знайдіть більше з них.`,
     c:"8", bad:["6","4","10"], sol:`(12 + 4)/2 = 8 — это большее число.`,
     solUa:`(12 + 4)/2 = 8 — це більше число.`},
    {q:`Сумма двух чисел равна 50, а разность равна 10. Найдите большее из них.`,
     ua:`Сума двох чисел дорівнює 50, а різниця дорівнює 10. Знайдіть більше з них.`,
     c:"30", bad:["20","25","40"], sol:`(50 + 10)/2 = 30.`,
     solUa:`(50 + 10)/2 = 30.`},
    {q:`У двух друзей вместе 45 грн, причём у первого на 5 грн больше. Сколько денег у первого?`,
     ua:`У двох друзів разом 45 грн, причому в першого на 5 грн більше. Скільки грошей у першого?`,
     c:"25", bad:["20","22","30"], sol:`(45 + 5)/2 = 25 грн у первого.`,
     solUa:`(45 + 5)/2 = 25 грн у першого.`},
    {q:`Отцу и сыну вместе 36 лет, отец старше сына на 24 года. Сколько лет сыну?`,
     ua:`Батькові й синові разом 36 років, батько старший за сина на 24 роки. Скільки років синові?`,
     c:"6", bad:["12","8","24"], sol:`(36 − 24)/2 = 6 лет.`,
     solUa:`(36 − 24)/2 = 6 років.`},
    {q:`Девочек и мальчиков вместе 40, девочек на 4 больше. Сколько мальчиков?`,
     ua:`Дівчаток і хлопчиків разом 40, дівчаток на 4 більше. Скільки хлопчиків?`,
     c:"18", bad:["22","20","16"], sol:`(40 − 4)/2 = 18 мальчиков.`,
     solUa:`(40 − 4)/2 = 18 хлопчиків.`},
    {q:`У двух братьев вместе 48 марок, у старшего на 16 больше. Сколько марок у старшего?`,
     ua:`У двох братів разом 48 марок, у старшого на 16 більше. Скільки марок у старшого?`,
     c:"32", bad:["16","24","28"], sol:`(48 + 16)/2 = 32 марки.`,
     solUa:`(48 + 16)/2 = 32 марки.`}
  ];
  const r = rnd(rows);
  const {opts,correctIdx} = buildMC(r.c, r.bad);
  return {
    topic:{ru:"Задачи на системы",ua:"Задачі на системи"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{ru:r.q,ua:r.ua},
    hint:{ru:"Обозначьте два неизвестных и составьте систему (сумму и разность).",ua:"Позначте два невідомих і складіть систему (суму й різницю)."},
    solution:{ru:r.sol,ua:r.solUa},
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}

/* ============================================================
   ПОВТОРЕНИЕ БАЗЫ 8–11 (модуль 1, уроки intro1–6)
   ============================================================ */
function revPick(correct, candidates){
  const out = [];
  for(const raw of candidates){
    const c = Number(raw);
    if(Number.isFinite(c) && c !== correct && !out.includes(c)) out.push(c);
    if(out.length === 3) break;
  }
  let bump = 1;
  while(out.length < 3){
    const c = correct + (bump % 2 ? bump : -bump);
    if(c !== correct && !out.includes(c)) out.push(c);
    bump++;
  }
  return out.map(String);
}
function genRevPowerRootMC(){
  const SUP = {"0":"⁰","1":"¹","2":"²","3":"³","4":"⁴","5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹"};
  const sup = n => String(n).split("").map(d => SUP[d]).join("");
  if(Math.random() < 0.5){
    const r = rnd([4,5,6,7,8,9,10,11,12,13,14,15]);
    const n = r*r;
    const {opts,correctIdx} = buildMC(String(r), revPick(r, [r+1, r-1, Math.round(n/2), r+2, r*2]));
    return {
      topic:{ru:"Степени и корни",ua:"Степені й корені"},
      format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
      question:{ru:`Вычислите √${n}.`,ua:`Обчисліть √${n}.`},
      hint:{ru:"Подберите число, квадрат которого равен подкоренному выражению.",ua:"Доберіть число, квадрат якого дорівнює підкореневому виразу."},
      solution:{ru:`√${n} = ${r}, потому что ${r}² = ${n}.`,ua:`√${n} = ${r}, бо ${r}² = ${n}.`},
      options:{ru:opts,ua:opts}, correct:correctIdx
    };
  }
  const base = rnd([2,3,5]);
  const exp = rnd([2,3]);
  const result = Math.pow(base,exp);
  const {opts,correctIdx} = buildMC(String(result), revPick(result, [base*exp, result+base, result-base, result+1]));
  return {
    topic:{ru:"Степени и корни",ua:"Степені й корені"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{ru:`Вычислите ${base}${sup(exp)}.`,ua:`Обчисліть ${base}${sup(exp)}.`},
    hint:{ru:"Степень — это произведение одинаковых множителей.",ua:"Степінь — це добуток однакових множників."},
    solution:{ru:`${base}${sup(exp)} = ${result}.`,ua:`${base}${sup(exp)} = ${result}.`},
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}
function genRevExprShort(){
  const a = rnd([2,3,4,5,6]);
  const b = rnd([1,2,3,4]);
  const c = rnd(Array.from({length:a+b-1},(_,i)=>i+1));
  const x0 = rnd([2,3,4,5]);
  const coef = a + b - c;
  const result = coef * x0;
  return {
    topic:{ru:"Преобразование выражений",ua:"Перетворення виразів"},
    format:{ru:"целое число",ua:"ціле число"},
    question:{ru:`Найдите значение выражения ${a}x + ${b}x − ${c}x при x = ${x0}.`,ua:`Знайдіть значення виразу ${a}x + ${b}x − ${c}x при x = ${x0}.`},
    hint:{ru:"Сначала приведите подобные слагаемые, затем подставьте значение x.",ua:"Спочатку зведіть подібні доданки, потім підставте значення x."},
    solution:{ru:`${a}x + ${b}x − ${c}x = ${coef}x. При x = ${x0}: ${coef}·${x0} = ${result}.`,ua:`${a}x + ${b}x − ${c}x = ${coef}x. При x = ${x0}: ${coef}·${x0} = ${result}.`},
    expected:result, correctLabel:String(result),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && v===result; }
  };
}
function genRevRatMC(){
  const a = rnd([2,3,4,5,6,7]);
  const a2 = a*a;
  const correct = "x − " + a;
  const {opts,correctIdx} = buildMC(correct, ["x + " + a, "x² − " + a2, "x"]);
  return {
    topic:{ru:"Дробно-рациональные выражения",ua:"Дробово-раціональні вирази"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{ru:`Упростите выражение (x² − ${a2}) / (x + ${a}).`,ua:`Спростіть вираз (x² − ${a2}) / (x + ${a}).`},
    hint:{ru:`Разложите числитель как разность квадратов: (x + ${a})(x − ${a}), и сократите общий множитель x + ${a}.`,ua:`Розкладіть чисельник як різницю квадратів: (x + ${a})(x − ${a}), і скоротіть спільний множник x + ${a}.`},
    solution:{ru:`x² − ${a2} = (x + ${a})(x − ${a}). Делим числитель и знаменатель на x + ${a} (ОДЗ: x ≠ −${a}) и получаем x − ${a}.`,ua:`x² − ${a2} = (x + ${a})(x − ${a}). Ділимо чисельник і знаменник на x + ${a} (ОДЗ: x ≠ −${a}) і отримуємо x − ${a}.`},
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}
function genRevSysShort(){
  const x = rnd([4,5,6,7,8]);
  const y = rnd([1,2,3].filter(v => v < x));
  const s = x + y;
  const d = x - y;
  const answer = `${x};${y}`;
  return {
    topic:{ru:"Системы уравнений",ua:"Системи рівнянь"},
    format:{ru:"пара через точку с запятой",ua:"пара через крапку з комою"},
    question:{ru:`Решите систему: x + y = ${s}, x − y = ${d}. Ответ введите в формате x;y (без пробела).`,ua:`Розв'яжіть систему: x + y = ${s}, x − y = ${d}. Відповідь введіть у форматі x;y (без пробілу).`},
    hint:{ru:"Сложите уравнения, чтобы найти x, затем вычтите, чтобы найти y.",ua:"Додайте рівняння, щоб знайти x, потім відніміть, щоб знайти y."},
    solution:{ru:`Сложение: 2x = ${s + d} ⇒ x = ${x}. Вычитание: 2y = ${s - d} ⇒ y = ${y}. Ответ (${x}; ${y}).`,ua:`Додавання: 2x = ${s + d} ⇒ x = ${x}. Віднімання: 2y = ${s - d} ⇒ y = ${y}. Відповідь (${x}; ${y}).`},
    expected:answer, correctLabel:`x = ${x}; y = ${y}`,
    check(input){
      const parts = String(input).split(/[;,]/).map(s=>parseAnswer(s));
      return parts.length===2 && !isNaN(parts[0]) && !isNaN(parts[1]) && parts[0]===x && parts[1]===y;
    }
  };
}
function genRevFuncMC(){
  const k = rnd([2,3,4,5]);
  const b = rnd([-3,-2,-1,1,2,3]);
  const x0 = rnd([1,2,3,4]);
  const result = k*x0 + b;
  const bstr = b > 0 ? ` + ${b}` : ` − ${-b}`;
  const {opts,correctIdx} = buildMC(String(result), revPick(result, [k*x0 - b, k*(x0+1), result + k, result - k, -result]));
  return {
    topic:{ru:"Функции и графики",ua:"Функції та графіки"},
    format:{ru:"выбор одного ответа",ua:"вибір однієї відповіді"},
    question:{ru:`Функция задана формулой y = ${k}x${bstr}. Найдите y при x = ${x0}.`,ua:`Функція задана формулою y = ${k}x${bstr}. Знайдіть y при x = ${x0}.`},
    hint:{ru:"Подставьте значение x в формулу и выполните действия.",ua:"Підставте значення x у формулу та виконайте дії."},
    solution:{ru:`y = ${k}·${x0}${bstr} = ${result}.`,ua:`y = ${k}·${x0}${bstr} = ${result}.`},
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}

/* ---- Уровни тренажёра (НМТ-стиль) ---- */
const LEVEL_DEFS = [
  {
    id:"base",
    title:{ru:"Базовый",ua:"Базовий"},
    desc:{ru:"Прямое применение формул, тестовый формат",ua:"Пряме застосування формул, тестовий формат"},
    topics:[
      { id:"identity", module:2, title:{ru:"Основное тождество",ua:"Основна тотожність"}, desc:{ru:"sin²+cos²=1 и родственные формы",ua:"sin²+cos²=1 і споріднені форми"}, generate: genIdentityBasicMC },
      { id:"radconv", module:2, title:{ru:"Градусы ↔ радианы",ua:"Градуси ↔ радіани"}, desc:{ru:"Перевод угловых мер",ua:"Переведення кутових мір"}, generate: genRadConvertMC },
      { id:"simplesteq", module:2, title:{ru:"Простейшие уравнения",ua:"Найпростіші рівняння"}, desc:{ru:"Общие решения sin x=a, cos x=a",ua:"Загальні розв'язки sin x=a, cos x=a"}, generate: genSimplestEqMC },
      { id:"signquad", module:2, title:{ru:"Знак функции по четверти",ua:"Знак функції за чвертю"}, desc:{ru:"Таблица знаков sin, cos, tg",ua:"Таблиця знаків sin, cos, tg"}, generate: genSignByQuadrant },
      { id:"expBasic", module:3, title:{ru:"Показательное уравнение (основа)",ua:"Показникове рівняння (основа)"}, desc:{ru:"Одинаковые основания",ua:"Однакові основи"}, generate: genExpBasicMC },
      { id:"logBasic", module:4, title:{ru:"Логарифмическое тождество",ua:"Логарифмічна тотожність"}, desc:{ru:"logₐ(aⁿ)=n",ua:"logₐ(aⁿ)=n"}, generate: genLogBasicMC },
      { id:"limitDirect", module:9, title:{ru:"Предел подстановкой",ua:"Границя підстановкою"}, desc:{ru:"Прямая подстановка в непрерывную функцию",ua:"Пряма підстановка в неперервну функцію"}, generate: genLimitDirectMC },
      { id:"derivTable", module:9, title:{ru:"Таблица производных",ua:"Таблиця похідних"}, desc:{ru:"Базовые формулы дифференцирования",ua:"Базові формули диференціювання"}, generate: genDerivTableMC },
      { id:"antiderivBasic", module:9, title:{ru:"Первообразная степени",ua:"Первісна степеня"}, desc:{ru:"∫xⁿdx=xⁿ⁺¹/(n+1)+C",ua:"∫xⁿdx=xⁿ⁺¹/(n+1)+C"}, generate: genAntiderivativeBasicMC },
      { id:"defIntPoly", module:9, title:{ru:"Определённый интеграл (основа)",ua:"Визначений інтеграл (основа)"}, desc:{ru:"Формула Ньютона–Лейбница",ua:"Формула Ньютона–Лейбніца"}, generate: genDefiniteIntegralPolyMC },
      { id:"prismVolume", module:6, title:{ru:"Объём призмы",ua:"Об'єм призми"}, desc:{ru:"V=Sосн·h",ua:"V=Sосн·h"}, generate: genPrismVolumeMC },
      { id:"triangleFeatures", module:5, title:{ru:"Высота, медиана, биссектриса и средняя линия",ua:"Висота, медіана, бісектриса та середня лінія"}, desc:{ru:"Основные элементы треугольника",ua:"Основні елементи трикутника"}, generate: genTriangleFeaturesMC },
      { id:"height", module:5, title:{ru:"Высота треугольника",ua:"Висота трикутника"}, desc:{ru:"Перпендикуляр из вершины к стороне",ua:"Перпендикуляр із вершини до сторони"}, generate: genHeightMC },
      { id:"angleBisector", module:5, title:{ru:"Биссектрисса",ua:"Бісектриса"}, desc:{ru:"Делит угол пополам",ua:"Ділить кут навпіл"}, generate: genAngleBisectorMC },
      { id:"median", module:5, title:{ru:"Медиана",ua:"Медіана"}, desc:{ru:"Идёт к середине стороны",ua:"Йде до середини сторони"}, generate: genMedianMC },
      { id:"midline", module:5, title:{ru:"Средняя линия треугольника",ua:"Середня лінія трикутника"}, desc:{ru:"Соединяет середины двух сторон",ua:"Сполучає середини двох сторін"}, generate: genMidlineMC },
      { id:"regularPolygon", module:5, title:{ru:"Правильные многоугольники",ua:"Правильні многокутники"}, desc:{ru:"Внутренние углы и центральный угол",ua:"Внутрішні кути та центральний кут"}, generate: genRegularPolygonMC },
      { id:"sphereSurface", module:6, title:{ru:"Площадь сферы",ua:"Площа сфери"}, desc:{ru:"S=4πR²",ua:"S=4πR²"}, generate: genSphereSurfaceMC }
      ,{ id:"vectorsDot", module:5, title:{ru:"Скалярное произведение векторов",ua:"Скалярний добуток векторів"}, desc:{ru:"a·b = x₁x₂ + y₁y₂",ua:"a·b = x₁x₂ + y₁y₂"}, generate: genVectorsDotMC }
      ,{ id:"lawOfCosines", module:5, title:{ru:"Теорема косинусов",ua:"Теорема косинусів"}, desc:{ru:"Сторона по двум сторонам и углу",ua:"Сторона за двома сторонами й кутом"}, generate: genLawOfCosinesMC }
      ,{ id:"inscribedAngle", module:5, title:{ru:"Вписанный угол",ua:"Вписаний кут"}, desc:{ru:"Половина центрального угла",ua:"Половина центрального кута"}, generate: genInscribedAngleMC }
      ,{ id:"c6Product", module:7, title:{ru:"Правило умножения",ua:"Правило множення"}, desc:{ru:"Последовательные обязательные выборы",ua:"Послідовні обов'язкові вибори"}, generate: genC6ProductRuleShort }
      ,{ id:"c6Sum", module:7, title:{ru:"Правило сложения",ua:"Правило додавання"}, desc:{ru:"Непересекающиеся группы вариантов",ua:"Неперетинні групи варіантів"}, generate: genC6SumRuleShort }
      ,{ id:"c6ProbSingle", module:7, title:{ru:"Классическая вероятность",ua:"Класична ймовірність"}, desc:{ru:"P = благоприятных / всех",ua:"P = сприятливих / усіх"}, generate: genC6ProbSingleShort }
      ,{ id:"c6Complement", module:7, title:{ru:"Противоположное событие",ua:"Протилежна подія"}, desc:{ru:"P(Ā) = 1 − P(A)",ua:"P(Ā) = 1 − P(A)"}, generate: genC6ProbComplementMC }
      ,{ id:"c6Mean", module:8, title:{ru:"Среднее арифметическое",ua:"Середнє арифметичне"}, desc:{ru:"Сумма данных, делённая на их количество",ua:"Сума даних, поділена на їхню кількість"}, generate: genC6StatMeanShort }
      ,{ id:"nmtTrig", module:2, title:{ru:"НМТ: тригонометрия",ua:"НМТ: тригонометрія"}, desc:{ru:"Комбинированная задача с четвертью угла",ua:"Комбінована задача з чвертю кута"}, generate: genNmtTrigMixedMC }
      ,{ id:"quadDiscriminant", module:14, title:{ru:"Дискриминант квадратного уравнения",ua:"Дискримінант квадратного рівняння"}, desc:{ru:"D = b² − 4ac",ua:"D = b² − 4ac"}, generate: genDiscriminantMC }
      ,{ id:"quadVertexX", module:14, title:{ru:"Вершина параболы",ua:"Вершина параболи"}, desc:{ru:"x_в = −b / (2a)",ua:"x_в = −b / (2a)"}, generate: genQuadraticVertexXShort }
      ,{ id:"ratSimplify", module:15, title:{ru:"Сокращение рациональной дроби",ua:"Скорочення раціонального дробу"}, desc:{ru:"(x² − a²)/(x − a) = x + a",ua:"(x² − a²)/(x − a) = x + a"}, generate: genRatSimplifyMC }
      ,{ id:"ratPowerExpr", module:15, title:{ru:"Выражение со степенями",ua:"Вираз зі степенями"}, desc:{ru:"(xᵐ · xⁿ) / xᵏ = xᵐ⁺ⁿ⁻ᵏ",ua:"(xᵐ · xⁿ) / xᵏ = xᵐ⁺ⁿ⁻ᵏ"}, generate: genRatPowerMC }
      ,{ id:"geoBasics", module:5, title:{ru:"Виды углов",ua:"Види кутів"}, desc:{ru:"Острый, прямой, тупой и развёрнутый углы",ua:"Гострий, прямий, тупий і розгорнутий кути"}, generate: genAngleTypesMC }
      ,{ id:"geoQuadArea", module:5, title:{ru:"Периметр и площадь",ua:"Периметр і площа"}, desc:{ru:"P и S квадрата и прямоугольника",ua:"P і S квадрата та прямокутника"}, generate: genPerimeterAreaShort }
      ,{ id:"geoCircleBasics", module:5, title:{ru:"Окружность и круг",ua:"Окружність і коло"}, desc:{ru:"Длина окружности и площадь круга через π",ua:"Довжина окружності та площа кола через π"}, generate: genCircleBasicsShort }
      ,{ id:"stereoBox", module:6, title:{ru:"Куб и прямоугольный параллелепипед",ua:"Куб і прямокутний паралелепіпед"}, desc:{ru:"V = a·b·c и V = a³",ua:"V = a·b·c і V = a³"}, generate: genBoxVolumeShort }
      ,{ id:"appRatio", module:13, title:{ru:"Отношения и пропорции",ua:"Відношення та пропорції"}, desc:{ru:"Сокращение отношений и a·d = b·c",ua:"Скорочення відношень і a·d = b·c"}, generate: genRatioProportionShort }
      ,{ id:"m1div", module:1, title:{ru:"Признаки делимости",ua:"Ознаки подільності"}, desc:{ru:"Признаки делимости на 2, 3, 4, 5, 6, 9, 10",ua:"Ознаки подільності на 2, 3, 4, 5, 6, 9, 10"}, generate: genDivisibilityMC }
      ,{ id:"m1frac", module:1, title:{ru:"Дроби: сложение и умножение",ua:"Дроби: додавання та множення"}, desc:{ru:"Сокращение, сложение и умножение дробей",ua:"Скорочення, додавання та множення дробів"}, generate: genFractionMC }
      ,{ id:"m1dec", module:1, title:{ru:"Десятичные дроби",ua:"Десяткові дроби"}, desc:{ru:"Перевод обыкновенных дробей и сложение десятичных",ua:"Переведення звичайних дробів і додавання десяткових"}, generate: genDecimalShort }
      ,{ id:"m1remain", module:1, title:{ru:"Деление с остатком",ua:"Ділення з остачею"}, desc:{ru:"Остаток от деления, a = b·q + r",ua:"Остача від ділення, a = b·q + r"}, generate: genRemainderShort }
      ,{ id:"m1power", module:1, title:{ru:"Степень с натуральным показателем",ua:"Степінь із натуральним показником"}, desc:{ru:"Произведение, частное и степень степеней",ua:"Добуток, частка та степінь степенів"}, generate: genPowerIntShort }
      ,{ id:"m1expr", module:1, title:{ru:"Буквенные выражения и формулы",ua:"Буквені вирази та формули"}, desc:{ru:"Значение выражения при заданном x",ua:"Значення виразу при заданому x"}, generate: genExprValueShort }
      ,{ id:"m1ineq", module:1, title:{ru:"Неравенства и сравнение чисел",ua:"Нерівності та порівняння чисел"}, desc:{ru:"Сравнение, координатная прямая и простейшие неравенства",ua:"Порівняння, координатна пряма та найпростіші нерівності"}, generate: genIneqCompareMC }
      ,{ id:"m1mono", module:1, title:{ru:"Одночлены и подобные слагаемые",ua:"Одночлени та подібні доданки"}, desc:{ru:"Приведение подобных и распознавание одночленов",ua:"Зведення подібних і розпізнавання одночленів"}, generate: genLikeTermsMC }
      ,{ id:"m1short", module:1, title:{ru:"Формулы сокращённого умножения",ua:"Формули скороченого множення"}, desc:{ru:"Квадрат суммы и разности, разность квадратов",ua:"Квадрат суми й різниці, різниця квадратів"}, generate: genSqrDiffMC }
      ,{ id:"m1lineq", module:1, title:{ru:"Линейные уравнения",ua:"Лінійні рівняння"}, desc:{ru:"Решение линейных уравнений с одной переменной",ua:"Розв’язання лінійних рівнянь з однією змінною"}, generate: genLinearEqShort }
      ,{ id:"m1func", module:1, title:{ru:"Функции и линейная функция",ua:"Функції та лінійна функція"}, desc:{ru:"Значение функции, пересечение с Oy, распознавание",ua:"Значення функції, перетин із Oy, розпізнавання"}, generate: genLinearFuncShort }
      ,{ id:"m1sys", module:1, title:{ru:"Системы линейных уравнений",ua:"Системи лінійних рівнянь"}, desc:{ru:"Решение системы в формате x;y",ua:"Розв’язування системи у форматі x;y"}, generate: genSystemTwoEqShort }
      ,{ id:"m1sysTask", module:1, title:{ru:"Задачи на системы",ua:"Задачі на системи"}, desc:{ru:"Сумма и разность двух величин",ua:"Сума та різниця двох величин"}, generate: genSystemWordMC }
      ,{ id:"revPower", module:1, title:{ru:"Степени и корни",ua:"Степені й корені"}, desc:{ru:"Значения степеней и квадратных корней",ua:"Значення степенів і квадратних коренів"}, generate: genRevPowerRootMC }
      ,{ id:"revExpr", module:1, title:{ru:"Преобразование выражений",ua:"Перетворення виразів"}, desc:{ru:"Приведение подобных и подстановка",ua:"Зведення подібних і підстановка"}, generate: genRevExprShort }
      ,{ id:"revFrac", module:1, title:{ru:"Дробно-рациональные выражения",ua:"Дробово-раціональні вирази"}, desc:{ru:"Сокращение разности квадратов",ua:"Скорочення різниці квадратів"}, generate: genRevRatMC }
      ,{ id:"revSys", module:1, title:{ru:"Системы уравнений",ua:"Системи рівнянь"}, desc:{ru:"Сумма и разность, ответ x;y",ua:"Сума й різниця, відповідь x;y"}, generate: genRevSysShort }
      ,{ id:"revFunc", module:1, title:{ru:"Функции и графики",ua:"Функції та графіки"}, desc:{ru:"Значение линейной функции",ua:"Значення лінійної функції"}, generate: genRevFuncMC }
    ]
  },
  {
    id:"medium",
    title:{ru:"Средний",ua:"Середній"},
    desc:{ru:"Комбинация 2–3 понятий, короткий ответ",ua:"Комбінація 2–3 понять, коротка відповідь"},
    topics:[
      { id:"tanExpr", module:2, title:{ru:"Выражение через tg α",ua:"Вираз через tg α"}, desc:{ru:"Деление на cos α",ua:"Ділення на cos α"}, generate: genTanExpr },
      { id:"simplifyEval", module:2, title:{ru:"sin α + cos α по tg α",ua:"sin α + cos α за tg α"}, desc:{ru:"Знаки по четверти + тождество",ua:"Знаки за чвертю + тотожність"}, generate: genSimplifyEval },
      { id:"doubleAngle", module:2, title:{ru:"Формула двойного угла",ua:"Формула подвійного кута"}, desc:{ru:"Упрощение через sin2α, cos2α",ua:"Спрощення через sin2α, cos2α"}, generate: genDoubleAngleSimplify },
      { id:"expEquation", module:3, title:{ru:"Показательное уравнение",ua:"Показникове рівняння"}, desc:{ru:"Сведение к одинаковому основанию",ua:"Зведення до однакової основи"}, generate: genExpEquationShort },
      { id:"logEquation", module:4, title:{ru:"Логарифмическое уравнение",ua:"Логарифмічне рівняння"}, desc:{ru:"Потенцирование",ua:"Потенціювання"}, generate: genLogEquationShort },
      { id:"limitFactor", module:9, title:{ru:"Предел через разложение",ua:"Границя через розкладання"}, desc:{ru:"Устранение неопределённости 0/0",ua:"Усунення невизначеності 0/0"}, generate: genLimitFactorShort },
      { id:"derivAtPoint", module:9, title:{ru:"Значение производной в точке",ua:"Значення похідної в точці"}, desc:{ru:"Вычисление f′(a) для многочлена",ua:"Обчислення f′(a) для многочлена"}, generate: genDerivativeAtPoint },
      { id:"defIntLinear", module:9, title:{ru:"Определённый интеграл (линейная)",ua:"Визначений інтеграл (лінійна)"}, desc:{ru:"Вычисление F(b)−F(a)",ua:"Обчислення F(b)−F(a)"}, generate: genDefiniteIntegralLinearShort },
      { id:"areaCubic", module:9, title:{ru:"Площадь под параболой",ua:"Площа під параболою"}, desc:{ru:"S=∫f(x)dx на [0;b]",ua:"S=∫f(x)dx на [0;b]"}, generate: genAreaUnderCubicShort },
      { id:"pyramidVolume", module:6, title:{ru:"Объём пирамиды",ua:"Об'єм піраміди"}, desc:{ru:"V=⅓Sосн·h",ua:"V=⅓Sосн·h"}, generate: genPyramidVolumeShort },
      { id:"coneSurface", module:6, title:{ru:"Площадь поверхности конуса",ua:"Площа поверхні конуса"}, desc:{ru:"l=√(R²+h²), Sполн=πR(R+l)",ua:"l=√(R²+h²), Sповн=πR(R+l)"}, generate: genConeSurfaceShort }
      ,{ id:"vectorsAngle", module:5, title:{ru:"Угол между векторами",ua:"Кут між векторами"}, desc:{ru:"cos ∠ через скалярное произведение",ua:"cos ∠ через скалярний добуток"}, generate: genVectorsAngleMC }
      ,{ id:"lawOfSines", module:5, title:{ru:"Теорема синусов",ua:"Теорема синусів"}, desc:{ru:"a/sin A = 2R",ua:"a/sin A = 2R"}, generate: genLawOfSinesMC }
      ,{ id:"circleRadii", module:5, title:{ru:"Радиусы вписанной и описанной окружностей",ua:"Радіуси вписаного й описаного кіл"}, desc:{ru:"r = (a+b−c)/2, R = c/2",ua:"r = (a+b−c)/2, R = c/2"}, generate: genCircleRadiiMC }
      ,{ id:"c6Permutation", module:7, title:{ru:"Перестановки и факториал",ua:"Розстановки та факторіал"}, desc:{ru:"n! — все элементы, порядок важен",ua:"n! — усі елементи, порядок важливий"}, generate: genC6PermutationShort }
      ,{ id:"c6Combination", module:7, title:{ru:"Сочетания",ua:"Сполучення"}, desc:{ru:"Порядок не важен",ua:"Порядок неважливий"}, generate: genC6CombinationShort }
      ,{ id:"c6Urn", module:7, title:{ru:"Вероятность в урне",ua:"Ймовірність в урні"}, desc:{ru:"Шары без возврата",ua:"Кульки без повернення"}, generate: genC6ProbUrnaShort }
      ,{ id:"c6DiceSum", module:7, title:{ru:"Сумма двух костей",ua:"Сума двох кісток"}, desc:{ru:"36 равновероятных пар",ua:"36 рівноймовірних пар"}, generate: genC6ProbDiceSumMC }
      ,{ id:"c6Median", module:8, title:{ru:"Медиана",ua:"Медіана"}, desc:{ru:"Центр упорядоченного ряда",ua:"Центр впорядкованого ряду"}, generate: genC6StatMedianModeShort }
      ,{ id:"nmtShort", module:3, title:{ru:"НМТ: короткий ответ",ua:"НМТ: коротка відповідь"}, desc:{ru:"Показательное уравнение в формате НМТ",ua:"Показникове рівняння у форматі НМТ"}, generate: genNmtShortAnswer }
      ,{ id:"quadIneqInterval", module:14, title:{ru:"Квадратное неравенство",ua:"Квадратна нерівність"}, desc:{ru:"Метод интервалов по корням",ua:"Метод інтервалів за коренями"}, generate: genQuadraticInequalityMC }
      ,{ id:"quadYAtX", module:14, title:{ru:"Значение квадратной функции",ua:"Значення квадратної функції"}, desc:{ru:"Подстановка x в ax² + bx + c",ua:"Підстановка x в ax² + bx + c"}, generate: genQuadraticYAtXShort }
    ]
  },
  {
    id:"high",
    title:{ru:"Наисложнейший",ua:"Найскладніший"},
    desc:{ru:"Комбинированные и параметрические задачи",ua:"Комбіновані та параметричні задачі"},
    topics:[
      { id:"homogen", module:2, title:{ru:"Однородные уравнения",ua:"Однорідні рівняння"}, desc:{ru:"Сведение к квадратному относительно tg x",ua:"Зведення до квадратного відносно tg x"}, generate: genHomogen },
      { id:"rootsCount", module:2, title:{ru:"Число корней на промежутке",ua:"Кількість коренів на проміжку"}, desc:{ru:"Периодичность решений",ua:"Періодичність розв'язків"}, generate: genRootsCount },
      { id:"paramRange", module:2, title:{ru:"Параметр в уравнении",ua:"Параметр у рівнянні"}, desc:{ru:"Условие существования решений",ua:"Умова існування розв'язків"}, generate: genParamRange },
      { id:"maxSum", module:2, title:{ru:"Максимум A sinx + B cosx",ua:"Максимум A sinx + B cosx"}, desc:{ru:"Амплитуда через √(A²+B²)",ua:"Амплітуда через √(A²+B²)"}, generate: genMaxSum },
      { id:"expSubst", module:3, title:{ru:"Показательное уравнение (замена)",ua:"Показникове рівняння (заміна)"}, desc:{ru:"Квадратное относительно t=aˣ",ua:"Квадратне відносно t=aˣ"}, generate: genExpSubstitution },
      { id:"logIneqBoundary", module:4, title:{ru:"Логарифмическое неравенство",ua:"Логарифмічна нерівність"}, desc:{ru:"Наименьшее целое решение",ua:"Найменше ціле рішення"}, generate: genLogInequalityBoundary },
      { id:"secondRemarkable", module:9, title:{ru:"Второй замечательный предел",ua:"Друга чудова границя"}, desc:{ru:"lim(1+k/x)ˣ=eᵏ",ua:"lim(1+k/x)ˣ=eᵏ"}, generate: genSecondRemarkableGeneral },
      { id:"extremum", module:9, title:{ru:"Точка экстремума",ua:"Точка екстремуму"}, desc:{ru:"Исследование кубической функции",ua:"Дослідження кубічної функції"}, generate: genExtremumPoint },
      { id:"areaBetween", module:9, title:{ru:"Площадь между кривыми",ua:"Площа між кривими"}, desc:{ru:"Точки пересечения + интеграл разности",ua:"Точки перетину + інтеграл різниці"}, generate: genAreaBetweenCurvesHigh },
      { id:"absArea", module:9, title:{ru:"Площадь с модулем",ua:"Площа з модулем"}, desc:{ru:"Фигура пересекает ось Ox",ua:"Фігура перетинає вісь Ox"}, generate: genAbsAreaHigh },
      { id:"coneVolIntegral", module:9, title:{ru:"Объём конуса через интеграл",ua:"Об'єм конуса через інтеграл"}, desc:{ru:"Метод дисков",ua:"Метод дисків"}, generate: genConeVolumeIntegralShort },
      { id:"cubeSection", module:6, title:{ru:"Площадь сечения куба",ua:"Площа перерізу куба"}, desc:{ru:"Равносторонний треугольник у вершины",ua:"Рівносторонній трикутник біля вершини"}, generate: genCubeSectionAreaShort }
      ,{ id:"vectorsCross", module:5, title:{ru:"Площадь через векторное произведение",ua:"Площа через векторний добуток"}, desc:{ru:"S = |x₁y₂ − x₂y₁|",ua:"S = |x₁y₂ − x₂y₁|"}, generate: genVectorsCrossMC }
      ,{ id:"arithTerm", module:11, title:{ru:"Член арифметической прогрессии",ua:"Член арифметичної прогресії"}, desc:{ru:"aₙ = a₁ + (n − 1)d",ua:"aₙ = a₁ + (n − 1)d"}, generate: genArithTermShort }
      ,{ id:"arithSum", module:11, title:{ru:"Сумма арифметической прогрессии",ua:"Сума арифметичної прогресії"}, desc:{ru:"Sₙ = (a₁ + aₙ)·n / 2",ua:"Sₙ = (a₁ + aₙ)·n / 2"}, generate: genArithSumShort }
      ,{ id:"geoTerm", module:11, title:{ru:"Член геометрической прогрессии",ua:"Член геометричної прогресії"}, desc:{ru:"aₙ = a₁ · qⁿ⁻¹",ua:"aₙ = a₁ · qⁿ⁻¹"}, generate: genGeoTermShort }
      ,{ id:"paramNoSolution", module:12, title:{ru:"Параметр: нет решений",ua:"Параметр: немає розв’язків"}, desc:{ru:"Коэффициент при x обнулился",ua:"Коефіцієнт при x зник"}, generate: genParamNoSolutionMC }
      ,{ id:"percentOfNumber", module:13, title:{ru:"Процент от числа",ua:"Відсоток від числа"}, desc:{ru:"Часть = число · p / 100",ua:"Частина = число · p / 100"}, generate: genPercentOfNumberShort }
      ,{ id:"motionSpeed", module:13, title:{ru:"Скорость по расстоянию и времени",ua:"Швидкість за відстанню та часом"}, desc:{ru:"v = s / t",ua:"v = s / t"}, generate: genMotionSpeedShort }
      ,{ id:"proportionDirect", module:13, title:{ru:"Прямая пропорция",ua:"Пряма пропорція"}, desc:{ru:"S₁/n₁ = S₂/n₂",ua:"S₁/n₁ = S₂/n₂"}, generate: genProportionDirectShort }
      ,{ id:"areaFigures", module:5, title:{ru:"Площадь по двум сторонам и углу",ua:"Площа за двома сторонами й кутом"}, desc:{ru:"S = ½·a·b·sin C",ua:"S = ½·a·b·sin C"}, generate: genAreaFiguresHigh }
      ,{ id:"c6Arrangement", module:7, title:{ru:"Размещения",ua:"Розміщення"}, desc:{ru:"A(n; k) — порядок важен",ua:"A(n; k) — порядок важливий"}, generate: genC6ArrangementShort }
      ,{ id:"c6Subsets", module:7, title:{ru:"Число подмножеств",ua:"Кількість підмножин"}, desc:{ru:"2ⁿ через биномиальную формулу",ua:"2ⁿ через біноміальну формулу"}, generate: genC6SubsetsShort }
      ,{ id:"c6Conditional", module:7, title:{ru:"Условная вероятность",ua:"Умовна ймовірність"}, desc:{ru:"Знаменатель ограничен условием",ua:"Знаменник обмежено умовою"}, generate: genC6ProbConditionalShort }
      ,{ id:"c6TotalProb", module:7, title:{ru:"Формула полной вероятности",ua:"Формула повної ймовірності"}, desc:{ru:"Сумма по гипотезам",ua:"Сума за гіпотезами"}, generate: genC6ProbTotalShort }
      ,{ id:"c6Dispersion", module:8, title:{ru:"Размах и дисперсия",ua:"Розмах і дисперсія"}, desc:{ru:"R и D для набора данных",ua:"R і D для набору даних"}, generate: genC6StatDispersionShort }
      ,{ id:"c6Freq", module:8, title:{ru:"Относительная частота",ua:"Відносна частота"}, desc:{ru:"Оценка вероятности по опытам",ua:"Оцінка ймовірності за дослідами"}, generate: genC6ProbFreqShort }
      ,{ id:"geoInfinite", module:11, title:{ru:"Сумма бесконечного ряда",ua:"Сума нескінченного ряду"}, desc:{ru:"S = a₁ / (1 − q) при |q| < 1",ua:"S = a₁ / (1 − q) при |q| < 1"}, generate: genGeoInfiniteMC }
      ,{ id:"linearIneq", module:12, title:{ru:"Линейное неравенство",ua:"Лінійна нерівність"}, desc:{ru:"Смена знака при делении на минус",ua:"Зміна знака при діленні на мінус"}, generate: genLinearInequalityShort }
      ,{ id:"quadraticRoots", module:12, title:{ru:"Квадратное уравнение по Виету",ua:"Квадратне рівняння за Вієтом"}, desc:{ru:"Меньший корень из суммы и произведения",ua:"Менший корінь із суми й добутку"}, generate: genQuadraticRootsShort }
      ,{ id:"percentGrowth", module:13, title:{ru:"Рост цены на проценты",ua:"Зростання ціни на відсотки"}, desc:{ru:"a · (1 + p/100)",ua:"a · (1 + p/100)"}, generate: genPercentGrowthMC }
      ,{ id:"motionMeeting", module:13, title:{ru:"Встречное движение",ua:"Зустрічний рух"}, desc:{ru:"t = S / (v₁ + v₂)",ua:"t = S / (v₁ + v₂)"}, generate: genMotionMeetingShort }
      ,{ id:"workRate", module:13, title:{ru:"Совместная работа",ua:"Спільна робота"}, desc:{ru:"1/t = 1/t₁ + 1/t₂",ua:"1/t = 1/t₁ + 1/t₂"}, generate: genWorkRateShort }
      ,{ id:"mixtureConc", module:13, title:{ru:"Концентрация смеси",ua:"Концентрація суміші"}, desc:{ru:"C = (C₁m₁ + C₂m₂) / (m₁ + m₂)",ua:"C = (C₁m₁ + C₂m₂) / (m₁ + m₂)"}, generate: genMixtureConcentrationShort }
      ,{ id:"systemTwoEq", module:12, title:{ru:"Система линейных уравнений",ua:"Система лінійних рівнянь"}, desc:{ru:"Метод сложения, ответ в формате x;y",ua:"Метод додавання, відповідь у форматі x;y"}, generate: genSystemTwoEqShort }
      ,{ id:"nmtParameter", module:2, title:{ru:"НМТ: параметр",ua:"НМТ: параметр"}, desc:{ru:"Условие существования решений",ua:"Умова існування розв'язків"}, generate: genNmtParameterMC }
      ,{ id:"quadApplied", module:14, title:{ru:"Задача на квадратное уравнение",ua:"Задача на квадратне рівняння"}, desc:{ru:"Площадь прямоугольника",ua:"Площа прямокутника"}, generate: genQuadraticAppliedShort }
      ,{ id:"systemWord", module:14, title:{ru:"Задача на встречное движение",ua:"Задача на зустрічний рух"}, desc:{ru:"t = S / (v₁ + v₂)",ua:"t = S / (v₁ + v₂)"}, generate: genSystemWordShort }
      ,{ id:"ratEquation", module:15, title:{ru:"Рациональное уравнение",ua:"Раціональне рівняння"}, desc:{ru:"(x + a) / (x − b) = k",ua:"(x + a) / (x − b) = k"}, generate: genRatEquationMC }
      ,{ id:"ratInequality", module:15, title:{ru:"Рациональное неравенство",ua:"Раціональна нерівність"}, desc:{ru:"Метод интервалов по дробям",ua:"Метод інтервалів за дробами"}, generate: genRatInequalityMC }
    ]
  }
];

let trainerCurrent = null;

/* ============================================================
   RENDER: SIDEBAR NAV
   ============================================================ */
