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
    question:{ru:`Чему равен sin²(${argStr}) + cos²(${argStr})?`, ua:`Чому дорівнює sin²(${argStr}) + cos²(${argStr})?`},
    hint:{ru:"Это основное тригонометрическое тождество — не зависит от аргумента.",ua:"Це основна тригонометрична тотожність — не залежить від аргументу."},
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
      question:{ru:`Сколько радиан составляет угол ${row.deg}°?`, ua:`Скільки радіан становить кут ${row.deg}°?`},
      hint:{ru:"Используйте α(рад) = α(°)·π/180.",ua:"Використайте α(рад) = α(°)·π/180."},
      options:{ru:opts,ua:opts}, correct:correctIdx
    };
  } else {
    const correct = row.deg+"°";
    let pool = [...new Set(DEG_TABLE.filter(r=>r.deg!==row.deg).map(r=>r.deg+"°"))];
    const distractors = shuffleArr(pool).slice(0,3);
    const {opts,correctIdx} = buildMC(correct, distractors);
    return {
      question:{ru:`Сколько градусов составляет угол ${fmtRad(row.num,row.den)} рад?`, ua:`Скільки градусів становить кут ${fmtRad(row.num,row.den)} рад?`},
      hint:{ru:"Используйте α(°) = α(рад)·180/π.",ua:"Використайте α(°) = α(рад)·180/π."},
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
    question:{ru:`Общее решение уравнения ${item.q}:`, ua:`Загальний розв'язок рівняння ${item.q}:`},
    hint:{ru:"Вспомните таблицу частных случаев из урока 4.",ua:"Згадайте таблицю окремих випадків з уроку 4."},
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
    question:{ru:`Каким является ${fn} α, если α — угол ${quadrant} четверти?`, ua:`Яким є ${fn} α, якщо α — кут ${quadrant} чверті?`},
    hint:{ru:"Вспомните таблицу знаков по четвертям из урока 3.",ua:"Згадайте таблицю знаків за чвертями з уроку 3."},
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
    question:{
      ru:`Дано: tg α = ${tset.label}. Найдите значение выражения: ${exprStr}`,
      ua:`Дано: tg α = ${tset.label}. Знайдіть значення виразу: ${exprStr}`
    },
    hint:{
      ru:"Разделите числитель и знаменатель на cos α — выражение сведётся к tg α.",
      ua:"Поділіть чисельник і знаменник на cos α — вираз зведеться до tg α."
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
    question:{
      ru:`tg α = ${tanLabel}, α — угол ${quadrant} четверти. Найдите sin α + cos α (округлите до 0.01).`,
      ua:`tg α = ${tanLabel}, α — кут ${quadrant} чверті. Знайдіть sin α + cos α (округліть до 0.01).`
    },
    hint:{
      ru:"Найдите cos α из 1+tg²α=1/cos²α, определите знак по четверти, затем sin α = tg α · cos α.",
      ua:"Знайдіть cos α з 1+tg²α=1/cos²α, визначте знак за чвертю, потім sin α = tg α · cos α."
    },
    expected:sum, correctLabel: fmtNum(sum),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && near(v, sum, 0.02); }
  };
}
function genDoubleAngleSimplify(){
  const tset = rnd(TAN_SET);
  const value = tset.val; // sin2α/(1+cos2α) ≡ tg α
  return {
    question:{
      ru:`Упростите выражение sin2α / (1 + cos2α) и найдите его значение, если tg α = ${tset.label}.`,
      ua:`Спростіть вираз sin2α / (1 + cos2α) і знайдіть його значення, якщо tg α = ${tset.label}.`
    },
    hint:{
      ru:"Используйте sin2α=2sinαcosα и cos2α=2cos²α−1, затем сократите на cos α.",
      ua:"Використайте sin2α=2sinαcosα і cos2α=2cos²α−1, потім скоротіть на cos α."
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
    question:{
      ru:`Решите однородное уравнение: ${eqStr}. Укажите одно из значений tg x.`,
      ua:`Розв'яжіть однорідне рівняння: ${eqStr}. Вкажіть одне зі значень tg x.`
    },
    hint:{
      ru:"Разделите обе части на cos²x (cos x ≠ 0) — получите квадратное уравнение относительно tg x.",
      ua:"Поділіть обидві частини на cos²x (cos x ≠ 0) — отримаєте квадратне рівняння відносно tg x."
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
    question:{
      ru:`Сколько корней имеет уравнение ${eq.fn} x = ${eq.label} на промежутке ${interval.label}?`,
      ua:`Скільки коренів має рівняння ${eq.fn} x = ${eq.label} на проміжку ${interval.label}?`
    },
    hint:{
      ru:"Запишите общее решение и подставьте границы промежутка вместо x, чтобы найти подходящие n.",
      ua:"Запишіть загальний розв'язок і підставте межі проміжку замість x, щоб знайти відповідні n."
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
    question:{
      ru:`При каких значениях параметра a уравнение ${fn} x = ${mStr}a − ${c} имеет решения? Укажите наименьшее возможное значение a.`,
      ua:`При яких значеннях параметра a рівняння ${fn} x = ${mStr}a − ${c} має розв'язки? Вкажіть найменше можливе значення a.`
    },
    hint:{
      ru:"Правая часть должна лежать в пределах [−1;1] — составьте двойное неравенство и выразите a.",
      ua:"Права частина має лежати в межах [−1;1] — складіть подвійну нерівність і виразіть a."
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
    question:{
      ru:`Найдите наибольшее значение функции f(x) = ${fnStr} (округлите до 0.01).`,
      ua:`Знайдіть найбільше значення функції f(x) = ${fnStr} (округліть до 0.01).`
    },
    hint:{
      ru:"Максимум выражения A sinx + B cosx равен √(A²+B²).",
      ua:"Максимум виразу A sinx + B cosx дорівнює √(A²+B²)."
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
    question:{ru:`Решите: ${a}ˣ = ${a}${supNum(n)}`, ua:`Розв'яжіть: ${a}ˣ = ${a}${supNum(n)}`},
    hint:{ru:"Основания одинаковые — значит показатели равны.",ua:"Основи однакові — отже показники рівні."},
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}
function genLogBasicMC(){
  const a = rnd([2,3,5,10]);
  const n = rnd([1,2,3,4,-1,-2]);
  const correct = String(n);
  let pool = shuffleArr([n+1,n-1,a,n*2].map(String).filter(v=>v!==correct));
  pool = [...new Set(pool)];
  const distractors = pool.slice(0,3);
  const {opts,correctIdx} = buildMC(correct, distractors);
  return {
    question:{ru:`Чему равен log${subNum(a)}(${a}${supNum(n)})?`, ua:`Чому дорівнює log${subNum(a)}(${a}${supNum(n)})?`},
    hint:{ru:"Используй основное логарифмическое тождество: logₐ(aⁿ)=n.",ua:"Використай основну логарифмічну тотожність: logₐ(aⁿ)=n."},
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
    question:{
      ru:`Решите: ${a}^(x${sStr}) = ${rhsStr}. Найдите x.`,
      ua:`Розв'яжіть: ${a}^(x${sStr}) = ${rhsStr}. Знайдіть x.`
    },
    hint:{
      ru:`Представьте ${rhsStr} как степень числа ${a}, затем приравняйте показатели.`,
      ua:`Подайте ${rhsStr} як степінь числа ${a}, потім прирівняйте показники.`
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
    question:{
      ru:`Решите: log${subNum(a)}(x${sStr}) = ${n}. Найдите x.`,
      ua:`Розв'яжіть: log${subNum(a)}(x${sStr}) = ${n}. Знайдіть x.`
    },
    hint:{
      ru:`Потенцируйте: x${sStr} = ${a}${supNum(n)}.`,
      ua:`Потенціюйте: x${sStr} = ${a}${supNum(n)}.`
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
    question:{
      ru:`Решите: 4ˣ − ${B}·2ˣ + ${C} = 0. Укажите одно из значений x.`,
      ua:`Розв'яжіть: 4ˣ − ${B}·2ˣ + ${C} = 0. Вкажіть одне зі значень x.`
    },
    hint:{
      ru:"Замена t=2ˣ (t>0) сводит уравнение к квадратному: t²−"+B+"t+"+C+"=0.",
      ua:"Заміна t=2ˣ (t>0) зводить рівняння до квадратного: t²−"+B+"t+"+C+"=0."
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
    question:{
      ru:`Решите: log${subNum(a)}(x) > ${n}. Укажите наименьшее целое число, удовлетворяющее неравенству.`,
      ua:`Розв'яжіть: log${subNum(a)}(x) > ${n}. Вкажіть найменше ціле число, яке задовольняє нерівність.`
    },
    hint:{
      ru:`Основание ${a}>1 — знак сохраняется: x > ${a}${supNum(n)} = ${boundary}.`,
      ua:`Основа ${a}>1 — знак зберігається: x > ${a}${supNum(n)} = ${boundary}.`
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
    question:{ru:`lim(x→${c}) (${a}x${bStr}) равен:`, ua:`lim(x→${c}) (${a}x${bStr}) дорівнює:`},
    hint:{ru:"Функция непрерывна — подставь значение x прямо в выражение.",ua:"Функція неперервна — підстав значення x прямо у вираз."},
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
    question:{ru:`Чему равна производная (${item.f})′?`, ua:`Чому дорівнює похідна (${item.f})′?`},
    hint:{ru:"Вспомни таблицу производных из урока.",ua:"Згадай таблицю похідних з уроку."},
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
    question:{
      ru:`Найдите lim(x→${a}) (x²${CStr}x${DStr}) / (x−${a})`,
      ua:`Знайдіть lim(x→${a}) (x²${CStr}x${DStr}) / (x−${a})`
    },
    hint:{ru:"Разложи числитель на множители (x−"+a+")(x−"+b+") и сократи.",ua:"Розклади чисельник на множники (x−"+a+")(x−"+b+") і скороти."},
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
    question:{
      ru:`f(x) = x³${bStr}${cStr}. Найдите f′(${a}).`,
      ua:`f(x) = x³${bStr}${cStr}. Знайдіть f′(${a}).`
    },
    hint:{ru:"f′(x)=3x²+"+b+". Подставь x="+a+".",ua:"f′(x)=3x²+"+b+". Підстав x="+a+"."},
    expected:answer, correctLabel:String(answer),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && near(v, answer, 0.02); }
  };
}
function genSecondRemarkableGeneral(){
  const k = rnd([1,2,3,-1,-2]);
  const answer = Math.exp(k);
  return {
    question:{
      ru:`Найдите lim(x→∞) (1 + ${k}/x)ˣ (округлите до 0.01)`,
      ua:`Знайдіть lim(x→∞) (1 + ${k}/x)ˣ (округліть до 0.01)`
    },
    hint:{ru:"lim(x→∞)(1+k/x)ˣ = eᵏ. Вычисли e^"+k+".",ua:"lim(x→∞)(1+k/x)ˣ = eᵏ. Обчисли e^"+k+"."},
    expected:answer, correctLabel: fmtNum(answer)+" (e"+supNum(k)+")",
    check(input){ const v=parseAnswer(input); return !isNaN(v) && near(v, answer, 0.02); }
  };
}
function genExtremumPoint(){
  const a = rnd([1,2,3]);
  const coef = 3*a*a;
  return {
    question:{
      ru:`f(x) = x³ − ${coef}x. Найдите точку минимума функции.`,
      ua:`f(x) = x³ − ${coef}x. Знайдіть точку мінімуму функції.`
    },
    hint:{ru:"f′(x)=3x²−"+coef+"=0 → x²="+a*a+" → x=±"+a+". Определи знак f′ вокруг каждой точки.",ua:"f′(x)=3x²−"+coef+"=0 → x²="+a*a+" → x=±"+a+". Визнач знак f′ навколо кожної точки."},
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
    question:{ru:`∫x${supNum(n)}dx равен:`, ua:`∫x${supNum(n)}dx дорівнює:`},
    hint:{ru:"Используй ∫xⁿdx=xⁿ⁺¹/(n+1)+C.",ua:"Використай ∫xⁿdx=xⁿ⁺¹/(n+1)+C."},
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}
function genDefiniteIntegralPolyMC(){
  const b = rnd([1,2,3,4,5]);
  const correct = String(b*b);
  const distractors = shuffleArr([String(b),String(2*b),String(b*b*b)]);
  const {opts,correctIdx} = buildMC(correct, distractors);
  return {
    question:{ru:`∫[0;${b}] 2x dx равен:`, ua:`∫[0;${b}] 2x dx дорівнює:`},
    hint:{ru:"Первообразная 2x — это x². Подставь границы: b²−0².",ua:"Первісна 2x — це x². Підстав межі: b²−0²."},
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
    question:{
      ru:`Вычислите ∫[${p};${q}] (${a}x${bStr}) dx`,
      ua:`Обчисліть ∫[${p};${q}] (${a}x${bStr}) dx`
    },
    hint:{ru:"Найди первообразную F(x), затем вычисли F("+q+")−F("+p+").",ua:"Знайди первісну F(x), потім обчисли F("+q+")−F("+p+")."},
    expected:answer, correctLabel:fmtNum(answer),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && near(v, answer, 0.02); }
  };
}
function genAreaUnderCubicShort(){
  const k = rnd([1,2,3]);
  const b = rnd([1,2,3]);
  const answer = k*Math.pow(b,3);
  return {
    question:{
      ru:`Найдите площадь фигуры, ограниченной y=${3*k}x² и осью Ox на [0;${b}].`,
      ua:`Знайдіть площу фігури, обмеженої y=${3*k}x² і віссю Ox на [0;${b}].`
    },
    hint:{ru:"Первообразная "+(3*k)+"x² — это "+k+"x³. Подставь границы.",ua:"Первісна "+(3*k)+"x² — це "+k+"x³. Підстав межі."},
    expected:answer, correctLabel:String(answer),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && near(v, answer, 0.02); }
  };
}
function genAreaBetweenCurvesHigh(){
  const k = rnd([1,2,3,4]);
  const answer = Math.pow(k,3)/6;
  return {
    question:{
      ru:`Найдите площадь фигуры между y=${k}x и y=x² (при x≥0).`,
      ua:`Знайдіть площу фігури між y=${k}x і y=x² (при x≥0).`
    },
    hint:{ru:"Точки пересечения: 0 и "+k+". S=∫[0;"+k+"]("+k+"x−x²)dx.",ua:"Точки перетину: 0 і "+k+". S=∫[0;"+k+"]("+k+"x−x²)dx."},
    expected:answer, correctLabel:fmtNum(answer),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && near(v, answer, 0.02); }
  };
}
function genAbsAreaHigh(){
  const n = rnd([1,2,3,4]);
  const answer = 2*n;
  return {
    question:{
      ru:`Найдите площадь фигуры между y=sin x и осью Ox на [0;${n}π].`,
      ua:`Знайдіть площу фігури між y=sin x і віссю Ox на [0;${n}π].`
    },
    hint:{ru:"Каждая «арка» синуса даёт площадь 2. Сколько таких арок на [0;"+n+"π]?",ua:"Кожна «арка» синуса дає площу 2. Скільки таких арок на [0;"+n+"π]?"},
    expected:answer, correctLabel:String(answer),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && near(v, answer, 0.02); }
  };
}

/* ---- Стереометрия (Модуль 5) ---- */
function genPrismVolumeMC(){
  const S = rnd([6,8,9,10,12,14,15,18,20]);
  const h = rnd([2,3,4,5,6,7,8]);
  const correct = S*h;
  const pool = shuffleArr([S+h, Math.round(S*h/2), 2*S*h].map(String).filter(v=>v!==String(correct)));
  const distractors = [...new Set(pool)].slice(0,3);
  const {opts,correctIdx} = buildMC(String(correct), distractors);
  return {
    question:{ru:`Призма: Sосн=${S}, h=${h}. Объём равен:`, ua:`Призма: Sосн=${S}, h=${h}. Об'єм дорівнює:`},
    hint:{ru:"V=Sосн·h.",ua:"V=Sосн·h."},
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}
function genSphereSurfaceMC(){
  const R = rnd([1,2,4,5]);
  const correct = 4*Math.PI*R*R;
  const distractors = [2*Math.PI*R*R, Math.PI*R*R, 8*Math.PI*R*R].map(v=>fmtNum(v));
  const {opts,correctIdx} = buildMC(fmtNum(correct), distractors);
  return {
    question:{ru:`Площадь поверхности сферы радиуса R=${R} равна (в единицах π):`, ua:`Площа поверхні сфери радіуса R=${R} дорівнює (в одиницях π):`},
    hint:{ru:"S=4πR².",ua:"S=4πR²."},
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
  const {opts,correctIdx} = buildMC(item.opts.ru[0], item.opts.ru);
  return {
    question:{ru:item.qa.ru,ua:item.qa.ua},
    hint:{ru:`Ключевое свойство: ${item.ru}.`,ua:`Ключова властивість: ${item.ua}.`},
    options:{ru:opts,ua:item.opts.ua}, correct:correctIdx
  };
}
function genRegularPolygonMC(){
  const n = rnd([3,4,5,6,8,10]);
  const central = 360 / n;
  const internal = 180 - central;
  const correct = `${internal}°`;
  const distractors = [
    `${central}°`,
    `${180 / n}°`,
    `${(n - 2) * 180}°`
  ].filter((value, idx, arr) => arr.indexOf(value) === idx);
  const {opts,correctIdx} = buildMC(correct, distractors);
  return {
    question:{
      ru:`В правильном ${n}-угольнике внутренний угол равен:`,
      ua:`У правильному ${n}-кутнику внутрішній кут дорівнює:`
    },
    hint:{
      ru:"Внутренний угол = 180° − 360°/n. Центр. угол = 360°/n.",
      ua:"Внутрішній кут = 180° − 360°/n. Центр. кут = 360°/n."
    },
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}
function genAngleBisectorMC(){
  const correct = "Биссектриса";
  const distractors = ["Медиана","Высота","Середняя линия"];
  const {opts,correctIdx} = buildMC(correct, distractors);
  return {
    question:{
      ru:"Отрезок, который делит угол треугольника пополам, называется:",
      ua:"Відрізок, який ділить кут трикутника навпіл, називається:"
    },
    hint:{
      ru:"Это линия из вершины угла, которая делит угол на два равных угла.",
      ua:"Це лінія з вершини кута, яка ділить кут на два рівні кути."
    },
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}
function genMedianMC(){
  const correct = "Медиана";
  const distractors = ["Биссектриса","Высота","Середняя линия"];
  const {opts,correctIdx} = buildMC(correct, distractors);
  return {
    question:{
      ru:"Отрезок, соединяющий вершину треугольника с серединой противоположной стороны, называется:",
      ua:"Відрізок, який з'єднує вершину трикутника з серединою протилежної сторони, називається:"
    },
    hint:{
      ru:"Медиана идет из вершины к середине противоположной стороны.",
      ua:"Медіана йде з вершини до середини протилежної сторони."
    },
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}
function genHeightMC(){
  const correct = "Высота";
  const distractors = ["Медиана","Биссектриса","Середняя линия"];
  const {opts,correctIdx} = buildMC(correct, distractors);
  return {
    question:{
      ru:"Перпендикуляр, проведённый из вершины треугольника к противоположной стороне, называется:",
      ua:"Перпендикуляр, проведений з вершини трикутника до протилежної сторони, називається:"
    },
    hint:{
      ru:"Высота перпендикулярна противоположной стороне.",
      ua:"Висота перпендикулярна до протилежної сторони."
    },
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}
function genMidlineMC(){
  const correct = "Средняя линия";
  const distractors = ["Медиана","Биссектриса","Высота"];
  const {opts,correctIdx} = buildMC(correct, distractors);
  return {
    question:{
      ru:"Отрезок, соединяющий середины двух сторон треугольника, называется:",
      ua:"Відрізок, що сполучає середини двох сторін трикутника, називається:"
    },
    hint:{
      ru:"Средняя линия параллельна третьей стороне и равна её половине.",
      ua:"Середня лінія паралельна третій стороні та дорівнює її половині."
    },
    options:{ru:opts,ua:opts}, correct:correctIdx
  };
}
function genPyramidVolumeShort(){
  const S = rnd([9,12,15,18,21,24,30]);
  const h = rnd([2,3,4,5,6]);
  const answer = (1/3)*S*h;
  return {
    question:{ru:`Пирамида: Sосн=${S}, h=${h}. Найдите объём.`, ua:`Піраміда: Sосн=${S}, h=${h}. Знайдіть об'єм.`},
    hint:{ru:"V=⅓Sосн·h.",ua:"V=⅓Sосн·h."},
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
    question:{ru:`Конус: R=${tr.r}, h=${tr.h}. Найдите Sполн (округлите до 0.01).`, ua:`Конус: R=${tr.r}, h=${tr.h}. Знайдіть Sповн (округліть до 0.01).`},
    hint:{ru:"l=√(R²+h²). Sполн=πR(R+l).",ua:"l=√(R²+h²). Sповн=πR(R+l)."},
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
    question:{ru:`Через интеграл V=π∫[f(x)]²dx найдите объём конуса с R=${R}, h=${h} (округлите до 0.01).`, ua:`Через інтеграл V=π∫[f(x)]²dx знайдіть об'єм конуса з R=${R}, h=${h} (округліть до 0.01).`},
    hint:{ru:"f(x)=(R/h)x. V=π∫[0;h](Rx/h)²dx=⅓πR²h.",ua:"f(x)=(R/h)x. V=π∫[0;h](Rx/h)²dx=⅓πR²h."},
    expected:answer, correctLabel: fmtNum(coeff)+"π ≈ "+fmtNum(answer),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && near(v, answer, 0.05); }
  };
}
function genCubeSectionAreaShort(){
  const d = rnd([1,2,3,4]);
  const coeff = (d*d)/2;
  const answer = coeff*Math.sqrt(3);
  return {
    question:{ru:`Плоскость отсекает от вершины куба равносторонний треугольник со стороной ${d}√2. Найдите его площадь (округлите до 0.01).`, ua:`Площина відтинає від вершини куба рівносторонній трикутник зі стороною ${d}√2. Знайдіть його площу (округліть до 0.01).`},
    hint:{ru:"S=(√3/4)·сторона². Сторона="+d+"√2, сторона²="+(2*d*d)+".",ua:"S=(√3/4)·сторона². Сторона="+d+"√2, сторона²="+(2*d*d)+"."},
    expected:answer, correctLabel: fmtNum(coeff)+"√3 ≈ "+fmtNum(answer),
    check(input){ const v=parseAnswer(input); return !isNaN(v) && near(v, answer, 0.02); }
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
    question:{ru:`В НМТ-формате: tg α = −${triple.a}/${triple.b}, α ∈ II четверти. Найдите sin α.`,ua:`У форматі НМТ: tg α = −${triple.a}/${triple.b}, α ∈ II чверті. Знайдіть sin α.`},
    hint:{ru:"Воспользуйтесь 1+tg²α=1/cos²α и знаком функций во II четверти.",ua:"Скористайтеся 1+tg²α=1/cos²α і знаком функцій у II чверті."},
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
    question:{ru:`В НМТ-формате решите ${a}^(x${shiftText}) = ${a}^${exponent}. Введите x.`,ua:`У форматі НМТ розв'яжіть ${a}^(x${shiftText}) = ${a}^${exponent}. Введіть x.`},
    hint:{ru:"При одинаковых основаниях приравняйте показатели степеней.",ua:"За однакових основ прирівняйте показники степенів."},
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
    question:{ru:`В НМТ-формате найдите наименьшее целое a, при котором уравнение sin x = a − ${boundary} имеет решения.`,ua:`У форматі НМТ знайдіть найменше ціле a, за якого рівняння sin x = a − ${boundary} має розв'язки.`},
    hint:{ru:"Правая часть должна принадлежать отрезку [−1;1], значит a − c ≥ −1.",ua:"Права частина має належати відрізку [−1;1], отже a − c ≥ −1."},
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
      { id:"identity", module:1, title:{ru:"Основное тождество",ua:"Основна тотожність"}, desc:{ru:"sin²+cos²=1 и родственные формы",ua:"sin²+cos²=1 і споріднені форми"}, generate: genIdentityBasicMC },
      { id:"radconv", module:1, title:{ru:"Градусы ↔ радианы",ua:"Градуси ↔ радіани"}, desc:{ru:"Перевод угловых мер",ua:"Переведення кутових мір"}, generate: genRadConvertMC },
      { id:"simplesteq", module:1, title:{ru:"Простейшие уравнения",ua:"Найпростіші рівняння"}, desc:{ru:"Общие решения sin x=a, cos x=a",ua:"Загальні розв'язки sin x=a, cos x=a"}, generate: genSimplestEqMC },
      { id:"signquad", module:1, title:{ru:"Знак функции по четверти",ua:"Знак функції за чвертю"}, desc:{ru:"Таблица знаков sin, cos, tg",ua:"Таблиця знаків sin, cos, tg"}, generate: genSignByQuadrant },
      { id:"expBasic", module:2, title:{ru:"Показательное уравнение (основа)",ua:"Показникове рівняння (основа)"}, desc:{ru:"Одинаковые основания",ua:"Однакові основи"}, generate: genExpBasicMC },
      { id:"logBasic", module:2, title:{ru:"Логарифмическое тождество",ua:"Логарифмічна тотожність"}, desc:{ru:"logₐ(aⁿ)=n",ua:"logₐ(aⁿ)=n"}, generate: genLogBasicMC },
      { id:"limitDirect", module:3, title:{ru:"Предел подстановкой",ua:"Границя підстановкою"}, desc:{ru:"Прямая подстановка в непрерывную функцию",ua:"Пряма підстановка в неперервну функцію"}, generate: genLimitDirectMC },
      { id:"derivTable", module:3, title:{ru:"Таблица производных",ua:"Таблиця похідних"}, desc:{ru:"Базовые формулы дифференцирования",ua:"Базові формули диференціювання"}, generate: genDerivTableMC },
      { id:"antiderivBasic", module:4, title:{ru:"Первообразная степени",ua:"Первісна степеня"}, desc:{ru:"∫xⁿdx=xⁿ⁺¹/(n+1)+C",ua:"∫xⁿdx=xⁿ⁺¹/(n+1)+C"}, generate: genAntiderivativeBasicMC },
      { id:"defIntPoly", module:4, title:{ru:"Определённый интеграл (основа)",ua:"Визначений інтеграл (основа)"}, desc:{ru:"Формула Ньютона–Лейбница",ua:"Формула Ньютона–Лейбніца"}, generate: genDefiniteIntegralPolyMC },
      { id:"prismVolume", module:5, title:{ru:"Объём призмы",ua:"Об'єм призми"}, desc:{ru:"V=Sосн·h",ua:"V=Sосн·h"}, generate: genPrismVolumeMC },
      { id:"triangleFeatures", module:5, title:{ru:"Высота, медиана, биссектриса и средняя линия",ua:"Висота, медіана, бісектриса та середня лінія"}, desc:{ru:"Основные элементы треугольника",ua:"Основні елементи трикутника"}, generate: genTriangleFeaturesMC },
      { id:"height", module:5, title:{ru:"Высота треугольника",ua:"Висота трикутника"}, desc:{ru:"Перпендикуляр из вершины к стороне",ua:"Перпендикуляр із вершини до сторони"}, generate: genHeightMC },
      { id:"angleBisector", module:5, title:{ru:"Биссектрисса",ua:"Бісектриса"}, desc:{ru:"Делит угол пополам",ua:"Ділить кут навпіл"}, generate: genAngleBisectorMC },
      { id:"median", module:5, title:{ru:"Медиана",ua:"Медіана"}, desc:{ru:"Идёт к середине стороны",ua:"Йде до середини сторони"}, generate: genMedianMC },
      { id:"midline", module:5, title:{ru:"Средняя линия треугольника",ua:"Середня лінія трикутника"}, desc:{ru:"Соединяет середины двух сторон",ua:"Сполучає середини двох сторін"}, generate: genMidlineMC },
      { id:"regularPolygon", module:5, title:{ru:"Правильные многоугольники",ua:"Правильні многокутники"}, desc:{ru:"Внутренние углы и центральный угол",ua:"Внутрішні кути та центральний кут"}, generate: genRegularPolygonMC },
      { id:"sphereSurface", module:5, title:{ru:"Площадь сферы",ua:"Площа сфери"}, desc:{ru:"S=4πR²",ua:"S=4πR²"}, generate: genSphereSurfaceMC }
      ,{ id:"nmtTrig", module:1, title:{ru:"НМТ: тригонометрия",ua:"НМТ: тригонометрія"}, desc:{ru:"Комбинированная задача с четвертью угла",ua:"Комбінована задача з чвертю кута"}, generate: genNmtTrigMixedMC }
    ]
  },
  {
    id:"medium",
    title:{ru:"Средний",ua:"Середній"},
    desc:{ru:"Комбинация 2–3 понятий, короткий ответ",ua:"Комбінація 2–3 понять, коротка відповідь"},
    topics:[
      { id:"tanExpr", module:1, title:{ru:"Выражение через tg α",ua:"Вираз через tg α"}, desc:{ru:"Деление на cos α",ua:"Ділення на cos α"}, generate: genTanExpr },
      { id:"simplifyEval", module:1, title:{ru:"sin α + cos α по tg α",ua:"sin α + cos α за tg α"}, desc:{ru:"Знаки по четверти + тождество",ua:"Знаки за чвертю + тотожність"}, generate: genSimplifyEval },
      { id:"doubleAngle", module:1, title:{ru:"Формула двойного угла",ua:"Формула подвійного кута"}, desc:{ru:"Упрощение через sin2α, cos2α",ua:"Спрощення через sin2α, cos2α"}, generate: genDoubleAngleSimplify },
      { id:"expEquation", module:2, title:{ru:"Показательное уравнение",ua:"Показникове рівняння"}, desc:{ru:"Сведение к одинаковому основанию",ua:"Зведення до однакової основи"}, generate: genExpEquationShort },
      { id:"logEquation", module:2, title:{ru:"Логарифмическое уравнение",ua:"Логарифмічне рівняння"}, desc:{ru:"Потенцирование",ua:"Потенціювання"}, generate: genLogEquationShort },
      { id:"limitFactor", module:3, title:{ru:"Предел через разложение",ua:"Границя через розкладання"}, desc:{ru:"Устранение неопределённости 0/0",ua:"Усунення невизначеності 0/0"}, generate: genLimitFactorShort },
      { id:"derivAtPoint", module:3, title:{ru:"Значение производной в точке",ua:"Значення похідної в точці"}, desc:{ru:"Вычисление f′(a) для многочлена",ua:"Обчислення f′(a) для многочлена"}, generate: genDerivativeAtPoint },
      { id:"defIntLinear", module:4, title:{ru:"Определённый интеграл (линейная)",ua:"Визначений інтеграл (лінійна)"}, desc:{ru:"Вычисление F(b)−F(a)",ua:"Обчислення F(b)−F(a)"}, generate: genDefiniteIntegralLinearShort },
      { id:"areaCubic", module:4, title:{ru:"Площадь под параболой",ua:"Площа під параболою"}, desc:{ru:"S=∫f(x)dx на [0;b]",ua:"S=∫f(x)dx на [0;b]"}, generate: genAreaUnderCubicShort },
      { id:"pyramidVolume", module:5, title:{ru:"Объём пирамиды",ua:"Об'єм піраміди"}, desc:{ru:"V=⅓Sосн·h",ua:"V=⅓Sосн·h"}, generate: genPyramidVolumeShort },
      { id:"coneSurface", module:5, title:{ru:"Площадь поверхности конуса",ua:"Площа поверхні конуса"}, desc:{ru:"l=√(R²+h²), Sполн=πR(R+l)",ua:"l=√(R²+h²), Sповн=πR(R+l)"}, generate: genConeSurfaceShort }
      ,{ id:"nmtShort", module:2, title:{ru:"НМТ: короткий ответ",ua:"НМТ: коротка відповідь"}, desc:{ru:"Показательное уравнение в формате НМТ",ua:"Показникове рівняння у форматі НМТ"}, generate: genNmtShortAnswer }
    ]
  },
  {
    id:"high",
    title:{ru:"Наисложнейший",ua:"Найскладніший"},
    desc:{ru:"Комбинированные и параметрические задачи",ua:"Комбіновані та параметричні задачі"},
    topics:[
      { id:"homogen", module:1, title:{ru:"Однородные уравнения",ua:"Однорідні рівняння"}, desc:{ru:"Сведение к квадратному относительно tg x",ua:"Зведення до квадратного відносно tg x"}, generate: genHomogen },
      { id:"rootsCount", module:1, title:{ru:"Число корней на промежутке",ua:"Кількість коренів на проміжку"}, desc:{ru:"Периодичность решений",ua:"Періодичність розв'язків"}, generate: genRootsCount },
      { id:"paramRange", module:1, title:{ru:"Параметр в уравнении",ua:"Параметр у рівнянні"}, desc:{ru:"Условие существования решений",ua:"Умова існування розв'язків"}, generate: genParamRange },
      { id:"maxSum", module:1, title:{ru:"Максимум A sinx + B cosx",ua:"Максимум A sinx + B cosx"}, desc:{ru:"Амплитуда через √(A²+B²)",ua:"Амплітуда через √(A²+B²)"}, generate: genMaxSum },
      { id:"expSubst", module:2, title:{ru:"Показательное уравнение (замена)",ua:"Показникове рівняння (заміна)"}, desc:{ru:"Квадратное относительно t=aˣ",ua:"Квадратне відносно t=aˣ"}, generate: genExpSubstitution },
      { id:"logIneqBoundary", module:2, title:{ru:"Логарифмическое неравенство",ua:"Логарифмічна нерівність"}, desc:{ru:"Наименьшее целое решение",ua:"Найменше ціле рішення"}, generate: genLogInequalityBoundary },
      { id:"secondRemarkable", module:3, title:{ru:"Второй замечательный предел",ua:"Друга чудова границя"}, desc:{ru:"lim(1+k/x)ˣ=eᵏ",ua:"lim(1+k/x)ˣ=eᵏ"}, generate: genSecondRemarkableGeneral },
      { id:"extremum", module:3, title:{ru:"Точка экстремума",ua:"Точка екстремуму"}, desc:{ru:"Исследование кубической функции",ua:"Дослідження кубічної функції"}, generate: genExtremumPoint },
      { id:"areaBetween", module:4, title:{ru:"Площадь между кривыми",ua:"Площа між кривими"}, desc:{ru:"Точки пересечения + интеграл разности",ua:"Точки перетину + інтеграл різниці"}, generate: genAreaBetweenCurvesHigh },
      { id:"absArea", module:4, title:{ru:"Площадь с модулем",ua:"Площа з модулем"}, desc:{ru:"Фигура пересекает ось Ox",ua:"Фігура перетинає вісь Ox"}, generate: genAbsAreaHigh },
      { id:"coneVolIntegral", module:5, title:{ru:"Объём конуса через интеграл",ua:"Об'єм конуса через інтеграл"}, desc:{ru:"Метод дисков",ua:"Метод дисків"}, generate: genConeVolumeIntegralShort },
      { id:"cubeSection", module:5, title:{ru:"Площадь сечения куба",ua:"Площа перерізу куба"}, desc:{ru:"Равносторонний треугольник у вершины",ua:"Рівносторонній трикутник біля вершини"}, generate: genCubeSectionAreaShort }
      ,{ id:"nmtParameter", module:3, title:{ru:"НМТ: параметр",ua:"НМТ: параметр"}, desc:{ru:"Условие существования решений",ua:"Умова існування розв'язків"}, generate: genNmtParameterMC }
    ]
  }
];

let trainerCurrent = null;

/* ============================================================
   RENDER: SIDEBAR NAV
   ============================================================ */
