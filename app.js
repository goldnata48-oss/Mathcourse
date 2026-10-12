/* 2026 Наталия Кравченко. Все права защищены. Образовательный курс — «Маткурс» */
let state = {
  lang: "ru",
  mode: "course",      // course | trainer | moduletest
  lessonId: "l1",
  trainerLevel: null,
  trainerTopic: null,
  testModuleId: null,
  grade: "senior",      // junior (1–4) | middle (5–7) | preSenior (8–9) | senior (10–11, НМТ)
  trainerScore: {correct:0, total:0},
  doneLessons: new Set(JSON.parse(localStorage.getItem("mc_done")||"[]")),
  searchQuery: "",
  favoriteFormulas: new Set(JSON.parse(localStorage.getItem("mc_favorites")||"[]")),
  miniChecks: JSON.parse(localStorage.getItem("mc_mini")||"{}"),
  trainerStats: JSON.parse(localStorage.getItem("mc_trainer")||"{}"),
  trainerReview: null
};

const MODULE_TEST_DURATION = 20 * 60;
const GRADE_LEVELS = ["junior", "middle", "preSenior", "senior"];
const GRADE_STORAGE_VERSION = "2";
let testTimerId = null;
const NMT_REVIEWS = [
  {year:"2024", title:{ru:"Тригонометрия: знак и четверть",ua:"Тригонометрія: знак і чверть"}, text:{ru:"Сначала определяем четверть по условию, затем восстанавливаем sin и cos через единичную окружность.",ua:"Спочатку визначаємо чверть за умовою, потім відновлюємо sin і cos через одиничне коло."}},
  {year:"2024", title:{ru:"Показательное уравнение",ua:"Показникове рівняння"}, text:{ru:"Приводим обе части к одному основанию, приравниваем показатели и проверяем область допустимых значений.",ua:"Зводимо обидві частини до однієї основи, прирівнюємо показники й перевіряємо ОДЗ."}},
  {year:"2025", title:{ru:"Производная и экстремум",ua:"Похідна й екстремум"}, text:{ru:"Находим критические точки из f′(x)=0, строим таблицу знаков производной и только потом выбираем точку минимума или максимума.",ua:"Знаходимо критичні точки з f′(x)=0, будуємо таблицю знаків похідної й лише потім обираємо точку мінімуму або максимуму."}}
];
const VIDEO_RESOURCES = [
  {title:{ru:"Производная: геометрический смысл",ua:"Похідна: геометричний зміст"}, src:"https://www.youtube-nocookie.com/embed/WUvTyaaNkzM"}
];

function saveDone(){ localStorage.setItem("mc_done", JSON.stringify([...state.doneLessons])); }
function saveFavoriteFormulas(){ localStorage.setItem("mc_favorites", JSON.stringify([...state.favoriteFormulas])); }
function saveMiniChecks(){ localStorage.setItem("mc_mini", JSON.stringify(state.miniChecks)); }
function miniStat(lessonId){
  const rec = state.miniChecks[lessonId];
  if(!rec || !Array.isArray(rec.choices)) return null;
  const answered = rec.choices.filter(c=>c!==null).length;
  if(!answered) return null;
  const correct = rec.choices.filter((c,i)=>c!==null && c===rec.correct[i]).length;
  return {answered, correct, total:rec.total, complete:answered===rec.total};
}
function refreshMiniIndicators(){
  document.querySelectorAll(".lesson-item[data-lesson]").forEach(btn=>{
    const stat = miniStat(btn.dataset.lesson);
    let ind = btn.querySelector(".mini-ind");
    if(!ind){ ind = document.createElement("span"); ind.className = "mini-ind"; btn.appendChild(ind); }
    if(!stat){ ind.textContent = ""; ind.className = "mini-ind"; ind.removeAttribute("title"); return; }
    ind.textContent = stat.complete ? "✓" : stat.correct+"/"+stat.total;
    ind.title = (state.grade === "junior" ? UI[state.lang].kidProgress : UI[state.lang].miniCheckProgress).replace("{c}",stat.correct).replace("{t}",stat.total);
    ind.className = "mini-ind visible" + (stat.complete ? " done" : "");
  });
}
function saveTrainerStats(){ localStorage.setItem("mc_trainer", JSON.stringify(state.trainerStats)); }
function trainerAcc(rec){ return rec && rec.total ? Math.round(rec.correct/rec.total*100) : 0; }
function recordTrainerResult(topicId, ok){
  if(!topicId) return;
  const rec = state.trainerStats[topicId] || (state.trainerStats[topicId] = {total:0, correct:0, wrong:0, lastWrong:0});
  rec.total++;
  if(ok){ rec.correct++; if(rec.wrong>0) rec.wrong--; }
  else { rec.wrong++; rec.lastWrong = Date.now(); }
  saveTrainerStats();
}
/* Заголовок приложения зависит от ступени классов: в режиме 5–9
   нельзя подписывать сайт «10–11». */
function gradeTitle(){
  return UI[state.lang].gradeTitles[state.grade] || UI[state.lang].appTitle;
}
/* Тема тренажёра попадает в блок классов, если ступень входит в её список.
   Пустой список означает «вне блоков» — тема скрыта во всех режимах. */
function topicInGrade(topicId){
  return topicGrades(topicId).indexOf(state.grade) >= 0;
}
function allTrainerTopics(){ return LEVEL_DEFS.flatMap(level=>level.topics.map(topic=>({level, topic}))); }
function findTrainerTopic(topicId){ return allTrainerTopics().find(x=>x.topic.id===topicId) || null; }
function trainerOverall(){
  let total = 0, correct = 0;
  Object.keys(state.trainerStats).forEach(id=>{ total += state.trainerStats[id].total; correct += state.trainerStats[id].correct; });
  return {total, correct, acc: total ? Math.round(correct/total*100) : 0};
}
function weakTrainerTopics(limit){
  return Object.keys(state.trainerStats)
    .filter(id=>state.trainerStats[id].wrong>0 && findTrainerTopic(id))
    .sort((a,b)=>{
      const ra = state.trainerStats[a], rb = state.trainerStats[b];
      return (rb.wrong-ra.wrong) || (rb.lastWrong-ra.lastWrong) || (trainerAcc(ra)-trainerAcc(rb));
    })
    .slice(0, limit||10);
}

function closeMobileMenu(){
  document.body.classList.remove("sidebar-open");
  const button = document.getElementById("mobile-menu-toggle");
  if(button){ button.setAttribute("aria-expanded","false"); button.querySelector(".sr-only").textContent=UI[state.lang].openMenu; }
}
let searchDebounceId = null;
let navFromUi = false;
function formulaKey(lessonId, index){ return lessonId+":"+index; }
function addFormulaBookmarks(root, lessonId){
  root.querySelectorAll(".formula-box").forEach((formula, index)=>{
    const key = formulaKey(lessonId,index);
    const button = document.createElement("button");
    const saved = state.favoriteFormulas.has(key);
    button.type = "button";
    button.className = "formula-bookmark" + (saved ? " active" : "");
    button.textContent = saved ? "★" : "☆";
    button.title = saved ? UI[state.lang].unfavorite : UI[state.lang].favorite;
    button.setAttribute("aria-label", button.title);
    button.addEventListener("click", ()=>{
      if(state.favoriteFormulas.has(key)) state.favoriteFormulas.delete(key);
      else state.favoriteFormulas.add(key);
      saveFavoriteFormulas();
      const active = state.favoriteFormulas.has(key);
      button.classList.toggle("active", active);
      button.textContent = active ? "★" : "☆";
      button.title = active ? UI[state.lang].unfavorite : UI[state.lang].favorite;
      button.setAttribute("aria-label", button.title);
    });
    formula.appendChild(button);
  });
}

const _searchCache = {};
function searchData(lesson){
  const key = lesson.id + ":" + state.lang;
  if(_searchCache[key]) return _searchCache[key];
  const root = document.createElement("div");
  root.innerHTML = lesson.html(state.lang);
  _searchCache[key] = {
    title: lesson.title[state.lang],
    text: (lesson.title[state.lang] + " " + root.textContent).toLowerCase(),
    formulas: [...root.querySelectorAll(".formula-box")].map(f=>f.textContent.trim().toLowerCase())
  };
  return _searchCache[key];
}
function searchResults(query){
  const normalized = query.trim().toLowerCase();
  if(!normalized) return [];
  const results = [];
  LESSONS.filter(lesson=>lessonInGrade(lesson.id, state.grade)).forEach(lesson=>{
    const data = searchData(lesson);
    if(data.text.includes(normalized)) results.push({lessonId:lesson.id,title:data.title,detail:UI[state.lang].course});
    data.formulas.forEach(text=>{
      if(text.includes(normalized)) results.push({lessonId:lesson.id,title:data.title,detail:text});
    });
  });
  return results.slice(0,20);
}
function renderSearchResults(){
  const input = document.getElementById("lesson-search");
  const resultsRoot = document.getElementById("search-results");
  if(!input || !resultsRoot) return;
  input.value = state.searchQuery;
  resultsRoot.innerHTML = "";
  if(!state.searchQuery.trim()){ resultsRoot.classList.remove("visible"); return; }
  const results = searchResults(state.searchQuery);
  resultsRoot.classList.add("visible");
  if(!results.length){ resultsRoot.innerHTML = `<div class="search-empty">${UI[state.lang].searchEmpty}</div>`; return; }
  results.forEach(result=>{
    const button = document.createElement("button");
    button.type = "button";
    button.className = "search-result";
    button.textContent = result.title;
    const detail = document.createElement("small");
    detail.textContent = result.detail;
    button.appendChild(detail);
    button.addEventListener("click", ()=>{
      state.mode="course";
      state.lessonId=result.lessonId;
      state.searchQuery="";
      closeMobileMenu();
      navFromUi=true;
      render();
    });
    resultsRoot.appendChild(button);
  });
}

function moduleLessons(moduleId){
  return ROADMAP[moduleId].lessons.filter(item=>typeof item === "string");
}
/* Урок попадает в выбранный блок классов, если его ступень совпадает.
   Пустой массив означает «вне всех блоков» — такой урок скрыт везде. */
function lessonInGrade(lessonId, grade){
  return lessonGrades(lessonId).indexOf(grade) >= 0;
}
function isFacultative(lessonId){
  return FACULTATIVE.lessons.indexOf(lessonId) >= 0;
}
function lessonGroup(lessonId){
  const all = isFacultative(lessonId)
    ? FACULTATIVE.lessons.filter(id=>typeof id === "string")
    : moduleLessons(LESSONS.find(item=>item.id===lessonId).module);
  return all.filter(id=>lessonInGrade(id, state.grade));
}
function groupProgress(ids){
  const done = ids.filter(id=>state.doneLessons.has(id)).length;
  return {done, total:ids.length, percent:ids.length ? Math.round(done/ids.length*100) : 0};
}
function moduleProgress(moduleId){
  return groupProgress(moduleLessons(moduleId).filter(id=>lessonInGrade(id, state.grade)));
}
/* Модуль целиком скрыт, если в выбранном блоке классов нет ни одного урока. */
function moduleInGrade(moduleId){
  return moduleLessons(moduleId).some(id=>lessonInGrade(id, state.grade));
}
/* Логический порядок модулей: алгебра 11–14 идут перед итоговым НМТ (10).
   Модули детского курса (16+) стоят первыми — в ступени 1–4 они видны как острова. */
const MODULE_ORDER = [16,17,18,19,20,21,22,1,2,3,4,5,6,7,8,9,11,12,13,14,15,10];
/* В маршрутах 1–4 (острова), 5–7 и 8–9 номера идут по позиции видимого списка. */
function moduleTitle(moduleId, lang){
  if(!ROADMAP[moduleId] || !lang) return "";
  const title = ROADMAP[moduleId][lang];
  if(state.grade !== "middle" && state.grade !== "preSenior" && state.grade !== "junior") return title;
  const pos = visibleSections().map(section=>section.modId).indexOf(moduleId);
  if(pos < 0) return title;
  const number = pos + 1;
  if(state.grade === "junior"){
    const island = lang === "ua" ? "Острів" : "Остров";
    return `${island} ${number}. ${title}`;
  }
  return title
    .replace(/^Модуль \d+\./, `Модуль ${number}.`)
    .replace(/^(Вводный|Вступний) модуль\./, `Модуль ${number}.`);
}
/* Номера ступеней для надписи заблокированного модуля. */
const GRADE_RANGES = {junior:"1–4", middle:"5–7", preSenior:"8–9", senior:"10–11"};
function moduleForGrades(moduleId){
  return (ROADMAP[moduleId].lessons||[])
    .filter(item=>typeof item==="string")
    .reduce((acc, id)=>{ const gs=(LESSON_GRADES[id]||[]); if(!acc.some(x=>gs.includes(x))){ for(const g of gs){ if(!acc.includes(g)) acc.push(g); } } return acc; }, [])
    .map(g=>GRADE_RANGES[g]||g).join(", ");
}
function visibleSections(){
  return MODULE_ORDER.filter(modId=>ROADMAP[modId])
    .map(modId=>({modId, mod:ROADMAP[modId], locked:!moduleInGrade(modId)}))
    .filter(section=>!section.locked);
}
/* Сквозной поток видимых в текущей ступени уроков: по порядку модулей, без скрытых. */
function visibleLessonFlow(){
  const flow = [];
  for(const {modId, mod} of visibleSections()){
    if(modId === null) continue;
    for(const item of mod.lessons){
      if(typeof item === "string" && lessonInGrade(item, state.grade)) flow.push(item);
    }
  }
  return flow;
}
function courseNavigation(lessonId){
  const flow = visibleLessonFlow();
  const index = flow.indexOf(lessonId);
  if(index < 0) return {previous:null,next:null};
  return {previous:index>0 ? flow[index-1] : null, next:index>=0 && index<flow.length-1 ? flow[index+1] : null};
}
/* Номер урока по позиции среди видимых уроков его модуля (без скрытых пропусков). */
function lessonNumberInModule(lessonId){
  const lesson = LESSONS.find(item=>item.id===lessonId);
  if(!lesson) return 1;
  const ids = (ROADMAP[lesson.module]?.lessons||[])
    .filter(item=>typeof item==="string" && lessonInGrade(item, state.grade));
  return ids.indexOf(lessonId)+1;
}

/* ============================================================
   МАСКОТ КВАНТИК — репліки, підказки, показ бульбашки
   ============================================================ */
const MASCOT_PHRASES = {
  greet:{
    ru:["Привет! Я Квантик. Разберём этот урок вместе.","С возвращением! Готов помогать по ходу урока.","Начинаем! Если что-то непонятно — жми на меня."],
    ua:["Привіт! Я Квантик. Розберемо цей урок разом.","З поверненням! Готовий допомагати по ходу уроку.","Починаємо! Якщо щось незрозуміло — тисни на мене."]
  },
  correct:{
    ru:["Верно! Отличная работа.","Точно! Ты уверенно справляешься.","Есть! Продолжай в том же духе.","Именно так. Молодец!"],
    ua:["Правильно! Чудова робота.","Точно! Ти впевнено справляєшся.","Є! Так тримати.","Саме так. Молодець!"]
  },
  wrong:{
    ru:["Не страшно, бывает. Загляни в формулу выше и попробуй ещё раз.","Почти! Проверь знак или четверть угла.","Не сдавайся — ошибки это часть обучения. Ещё попытка!","Мимо, но ты близко. Попробуй снова."],
    ua:["Не страшно, буває. Поглянь на формулу вище і спробуй ще раз.","Майже! Перевір знак або чверть кута.","Не здавайся — помилки це частина навчання. Ще спроба!","Повз, але ти близько. Спробуй ще."]
  },
  hint:{
    ru:["Совет: выписывай формулу перед тем, как решать пример.","Подсказка: сверяйся с таблицей значений — она всегда под рукой.","Лайфхак: в тренажёре можно тренироваться сколько угодно раз.","Ты уже на верном пути — не торопись, читай внимательно условие.","Помни: единичная окружность — твой друг в тригонометрии."],
    ua:["Порада: випиши формулу перед тим, як розв'язувати приклад.","Підказка: звіряйся з таблицею значень — вона завжди під рукою.","Лайфхак: у тренажері можна тренуватись скільки завгодно разів.","Ти вже на правильному шляху — не поспішай, уважно читай умову.","Пам'ятай: одиничне коло — твій друг у тригонометрії."]
  },
  quizStart:{
    ru:["Квест завершён! Ты получил новый опыт, а Квантик уже зарядил следующий уровень. Каждый ответ приближает к рекорду!"],
    ua:["Квест завершено! Ти здобув новий досвід, а Квантик уже зарядив наступний рівень. Кожна відповідь наближає до рекорду!"]
  },
  quizBoost:{
    ru:["Отличный раунд! Твой навык набирает скорость, а серия достижений растёт. Ещё один квест — и новый рекорд близко!"],
    ua:["Чудовий раунд! Твоя майстерність набирає швидкість, а серія досягнень зростає. Ще один квест — і новий рекорд близько!"]
  },
  quizLegend:{
    ru:["Легендарный раунд! Квантик вручает значок «Мастер формул». Твой счёт достоин таблицы рекордов!"],
    ua:["Легендарний раунд! Квантик вручає значок «Майстер формул». Твій результат гідний таблиці рекордів!"]
  }
};
const LESSON_HINTS = {
  l1:{ru:"Тяни жёлтую точку по окружности — сразу увидишь угол и координаты.",ua:"Тягни жовту точку по колу — одразу побачиш кут і координати."},
  l2:{ru:"Сравни графики sin x и cos x — они сдвинуты друг относительно друга.",ua:"Порівняй графіки sin x і cos x — вони зсунуті одне відносно одного."},
  l3:{ru:"Перед решением определи четверть угла — от неё зависит знак.",ua:"Перед розв'язанням визнач чверть кута — від неї залежить знак."},
  l4:{ru:"Сначала подставь частные случаи (0, 1, −1), а уже потом общую формулу.",ua:"Спочатку підстав окремі випадки (0, 1, −1), а вже потім загальну формулу."},
  l5:{ru:"В таблице приведения: название функции меняй на кофункцию только при π/2 и 3π/2, знак — по четверти.",ua:"У таблиці зведення: назву функції міняй на кофункцію лише при π/2 і 3π/2, знак — за чвертю."},
  l6:{ru:"Проще всего запомнить: sec и csc — это просто «1 разделить на cos» и «1 разделить на sin».",ua:"Найпростіше запам'ятати: sec і csc — це просто «1 поділити на cos» і «1 поділити на sin»."},
  l7:{ru:"Обратные функции дают угол в ограниченном диапазоне — не любой, а именно из главной ветви.",ua:"Обернені функції дають кут в обмеженому діапазоні — не будь-який, а саме з головної гілки."},
  e1:{ru:"Подвигай ползунок влево и вправо от 1 — увидишь, где функция растёт, а где убывает.",ua:"Посунь повзунок вліво і вправо від 1 — побачиш, де функція зростає, а де спадає."},
  e2:{ru:"Всегда пробуй сначала свести обе части к одинаковому основанию — это самый быстрый путь.",ua:"Завжди спробуй спочатку звести обидві частини до однакової основи — це найшвидший шлях."},
  e3:{ru:"Первым делом посмотри на основание: больше или меньше единицы — от этого зависит, перевернётся знак или нет.",ua:"Насамперед подивись на основу: більша чи менша за одиницю — від цього залежить, чи перевернеться знак."},
  lg3:{ru:"Логарифм — это просто вопрос «в какую степень возвести основание?». А в графике подвигай ползунок — увидишь зеркальность с показательной функцией.",ua:"Логарифм — це просто питання «до якого степеня піднести основу?». А в графіку посунь повзунок — побачиш дзеркальність із показниковою функцією."},
  lg2:{ru:"lg — это log по основанию 10, ln — по основанию e. Запомни это раз и навсегда, и записи перестанут пугать.",ua:"lg — це log за основою 10, ln — за основою e. Запам'ятай це раз і назавжди, і записи перестануть лякати."},
  lg4:{ru:"Первым делом всегда находи ОДЗ — потом уже решай уравнение и проверяй корни по нему.",ua:"Насамперед завжди знаходь ОДЗ — потім уже розв'язуй рівняння і перевіряй корені за ним."},
  lg5:{ru:"Здесь два условия сразу: и монотонность основания, и положительность выражений под логарифмом. Не забывай про оба!",ua:"Тут дві умови одразу: і монотонність основи, і додатність виразів під логарифмом. Не забувай про обидві!"},
  gr1:{ru:"Помни: знак внутри скобки f(x+c) обратный интуитивному — «+c» сдвигает влево, а не вправо!",ua:"Пам'ятай: знак усередині дужки f(x+c) протилежний інтуїтивному — «+c» зсуває вліво, а не вправо!"},
  lim1:{ru:"Не бойся 0/0 — это сигнал разложить на множители и сократить, а не тупик.",ua:"Не бійся 0/0 — це сигнал розкласти на множники і скоротити, а не глухий кут."},
  lim2:{ru:"Увидел sin(что-то)/то-же-самое или (1+что-то)^(1/то-же-самое) — сразу вспоминай замечательные пределы.",ua:"Побачив sin(щось)/те-саме або (1+щось)^(1/те-саме) — одразу згадуй чудові границі."},
  der1:{ru:"Двигай Δx к нулю и смотри, как красная секущая превращается в касательную — это и есть суть производной.",ua:"Рухай Δx до нуля і дивись, як червона січна перетворюється на дотичну — це і є суть похідної."},
  der2:{ru:"Видишь произведение или сложную функцию (функция от функции) — сразу вспоминай нужное правило, не дифференцируй наугад.",ua:"Бачиш добуток або складену функцію (функція від функції) — одразу згадуй потрібне правило, не диференціюй навмання."},
  der3:{ru:"Не ищи экстремум глазами на графике — ищи, где производная равна нулю и меняет знак. Это и есть метод.",ua:"Не шукай екстремум очима на графіку — шукай, де похідна дорівнює нулю і змінює знак. Це і є метод."},
  int1:{ru:"Никогда не забывай +C — без неё ответ засчитают неполным. Первообразных всегда бесконечно много.",ua:"Ніколи не забувай +C — без неї відповідь зарахують неповною. Первісних завжди нескінченно багато."},
  int2:{ru:"Двигай ползунок n — чем больше прямоугольников, тем ближе сумма к точной площади 8/3. Так и работает интеграл.",ua:"Рухай повзунок n — що більше прямокутників, то ближче сума до точної площі 8/3. Так і працює інтеграл."},
  int3:{ru:"Всегда сначала находи точки пересечения кривых — без границ интегрировать нечего.",ua:"Завжди спочатку знаходь точки перетину кривих — без меж інтегрувати нічого."},
  stereo1:{ru:"Разверни фигуру мысленно на плоскость — боковая поверхность почти всегда считается через развёртку.",ua:"Розгорни фігуру подумки на площину — бічна поверхня майже завжди рахується через розгортку."},
  stereo2:{ru:"Запомни раз и навсегда: пирамида — ровно треть от призмы с той же основой и высотой.",ua:"Запам'ятай раз і назавжди: піраміда — рівно третина від призми з тією самою основою і висотою."},
  stereo3:{ru:"Диски складываются в объём точно так же, как полоски складывались в площадь — тот же метод, новое измерение.",ua:"Диски складаються в об'єм точнісінько так само, як смужки складались у площу — той самий метод, новий вимір."},
  stereo4:{ru:"Соединяй только точки, которые лежат в одной грани — иначе линия пройдёт сквозь тело, а не по его поверхности.",ua:"З'єднуй лише точки, що лежать в одній грані — інакше лінія пройде крізь тіло, а не по його поверхні."},
  stereo5:{ru:"Всё, что ты знаешь о векторах на плоскости, просто добавляет третью координату — ничего принципиально нового.",ua:"Усе, що ти знаєш про вектори на площині, просто додає третю координату — нічого принципово нового."},
  geo1:{ru:"Прежде чем решать задачу, всегда сначала определи тип треугольника — это часто подсказывает метод решения.",ua:"Перш ніж розв'язувати задачу, завжди спочатку визнач тип трикутника — це часто підказує метод розв'язання."},
  geoTriangles:{ru:"Держи под рукой три опоры: медиана к гипотенузе равна её половине, средняя линия — половине третьей стороны, а все медианы делятся точкой пересечения в отношении 2:1, считая от вершины.",ua:"Тримай напохваті три опори: медіана до гіпотенузи дорівнює її половині, середня лінія — половині третьої сторони, а всі медіани діляться точкою перетину у відношенні 2:1, рахуючи від вершини."},
  geoPolygons:{ru:"Не путай два угла: центральный = 360°/n, внутренний = 180° − 360°/n. А в правильном шестиугольнике сторона равна радиусу описанной окружности — это самый быстрый путь к ответу.",ua:"Не плутай два кути: центральний = 360°/n, внутрішній = 180° − 360°/n. А в правильному шестикутнику сторона дорівнює радіусу описаного кола — це найшвидший шлях до відповіді."},
  geo2:{ru:"Прямоугольник и ромб — это не отдельные фигуры, а параллелограммы с одним дополнительным условием. Запомни это, и свойства перестанут путаться.",ua:"Прямокутник і ромб — це не окремі фігури, а паралелограми з однією додатковою умовою. Запам'ятай це, і властивості перестануть плутатися."},
  geo3:{ru:"Двигай точку C по дуге — угол ACB не меняется, пока C остаётся на той же дуге. Это и есть теорема о вписанном угле в действии.",ua:"Рухай точку C по дузі — кут ACB не змінюється, поки C залишається на тій самій дузі. Це і є теорема про вписаний кут у дії."},
  geoSimilarity:{ru:"Сначала ищи равные углы — где углы равны, там подобие. И помни: площадь меняется как k², а не как k.",ua:"Спочатку шукай рівні кути — де кути рівні, там подібність. І пам'ятай: площа змінюється як k², а не як k."},
  geoPythagor:{ru:"Гипотенуза — это всегда сторона напротив прямого угла, то есть самая длинная. Сначала найди её, потом уже подставляй в равенство — и корень извлекай в самом конце.",ua:"Гіпотенуза — це завжди сторона напроти прямого кута, тобто найдовша. Спершу знайди її, потім вже підставляй у рівність — і корінь витягуй у самому кінці."},
  geoAreas:{ru:"Площадь не зависит от наклона — она зависит только от высоты. Если в условии есть диагонали ромба, сразу пиши ½·d₁·d₂, а если основание с высотой — ½·a·h.",ua:"Площа не залежить від нахилу — вона залежить лише від висоти. Якщо в умові є діагоналі ромба, одразу пиши ½·d₁·d₂, а якщо основа з висотою — ½·a·h."},
  geoVectors:{ru:"Векторы складывают покоординатно, а длины — только по теореме косинусов. Перпендикулярность проверяй через скалярное произведение: если a⃗ · b⃗ = 0, они перпендикулярны.",ua:"Вектори додають покоординатно, а довжини — лише за теоремою косинусів. Перпендикулярність перевіряй через скалярний добуток: якщо a⃗ · b⃗ = 0, вони перпендикулярні."},
  geoVectorTasks:{ru:"Дайте векторам имена: AB = b − a, а сторона BC — это разность AC − AB. Площадь треугольника всегда ½·|a₁b₂ − a₂b₁|, а центр тяжести делит медиану в отношении 2 : 1 от вершины.",ua:"Дайте векторам імена: AB = b − a, а сторона BC — це різниця AC − AB. Площа трикутника завжди ½·|a₁b₂ − a₂b₁|, а центр тяжіння ділить медіану у відношенні 2 : 1 від вершини."},
  geoSineCos:{ru:"Сначала посмотрите, что дано: две стороны и угол между ними — работает теорема косинусов, а угол напротив известной стороны — теорема синусов. И всегда проверяйте, не нашлось ли второго решения.",ua:"Спершу подивіться, що дано: дві сторони та кут між ними — працює теорема косинусів, а кут навпроти відомої сторони — теорема синусів. І завжди перевіряйте, чи не знайшлося другого розв'язку."},
  geoCircles:{ru:"Сначала найдите площадь: и r = S/s, и R = a·b·c/(4S) без неё не работают. А если треугольник прямоугольный — вообще не считайте площадь: R = c/2 и r = (a + b − c)/2.",ua:"Спершу знайдіть площу: і r = S/s, і R = a·b·c/(4S) без неї не працюють. А якщо трикутник прямокутний — взагалі не рахуйте площу: R = c/2 і r = (a + b − c)/2."},
  geoCurved:{ru:"Переводите угол в радианы до подстановки — формула S = ½·R²·(α − sin α) требует именно их. И если угол больше 180°, считайте меньший сегмент и вычитайте его из πR²: sin α там уже отрицательный.",ua:"Переводьте кут у радіани до підстановки — формула S = ½·R²·(α − sin α) потребує саме їх. І якщо кут більший за 180°, рахуйте менший сегмент і віднімайте його від πR²: sin α там уже від'ємний."},
  geoRose:{ru:"Число лепестков не равно k: при чётном k их 2k, при нечётном — k. А чтобы нарисовать розу, угол φ нужно провести на полном обороте от 0 до 360° — на половине оборота вы увидите только половину розы.",ua:"Кількість пелюстків не дорівнює k: за парного k їх 2k, за непарного — k. А щоб намалювати троянду, кут φ треба провести на повному оберті від 0 до 360° — на половині оберту ви побачите тільки половину троянди."},
  geoAxiom:{ru:"Аксиомы не доказывают — их принимают. Любая задача на существование точки в пространстве решается именно через них, поэтому стоит помнить их буквально.",ua:"Аксіоми не доводять — їх приймають. Будь-яка задача на існування точки в просторі розв'язується саме через них, тому варто пам'ятати їх буквально."},
  stereoIntro:{ru:"Пирамида и конус — это ровно треть призмы и цилиндра с теми же основанием и высотой, а шар с R своими S = 4πR² и V = (4/3)πR³ завершает набор. Формулы на один взгляд, а в 10–11 классе их выводят.",ua:"Піраміда і конус — це рівно третина призми та циліндра з тією самою основою і висотою, а куля з R своїми S = 4πR² та V = (4/3)πR³ завершує набір. Формули на один погляд, а в 10–11 класі їх виводять."},
  geoPerp:{ru:"Если прямая перпендикулярна двум пересекающимся прямым плоскости, она перпендикулярна всей плоскости. Проверяй всегда: пересекаются ли эти две прямые в одной точке.",ua:"Якщо пряма перпендикулярна двом прямым, що перетинаються, вона перпендикулярна всій площині. Перевіряй завжди: чи перетинаються ці дві прямі в одній точці."},
  geoPrism:{ru:"Пирамида всегда ровно треть от призмы с той же основой и высотой — и наклонная боковая грань здесь ни при чём, объём зависит только от основания и высоты.",ua:"Піраміда завжди рівно третина від призми з тією самою основою і висотою — і похила бічна грань тут ні до чого, об'єм залежить лише від основи та висоти."},
  geoRevolve:{ru:"Все линейные размеры при подобии умножаются на k, площади — на k², объёмы — на k³. Это самая частая проверка в задачах на тела вращения.",ua:"Усі лінійні розміри при подібності множаться на k, площі — на k², об'єми — на k³. Це найчастіша перевірка в задачах на тіла обертання."},
  comb1:{ru:"Сначала спроси: выборы идут последовательно или это две независимые группы? Последовательно — умножаем, группы — складываем.",ua:"Спершу спитай: вибори йдуть послідовно чи це дві незалежні групи? Послідовно — множимо, групи — додаємо."},
  comb2:{ru:"Один вопрос решает всё: важен ли порядок. Порядок важен — размещение, не важен — сочетание. При k больше половины n меняй k на n − k.",ua:"Одне запитання вирішує все: чи важливий порядок. Порядок важливий — розміщення, неважливий — сполучення. При k більше за половину n замінюй k на n − k."},
  prob1:{ru:"Перед делением всегда спроси, равновероятны ли исходы. Сумма 7 на двух кубиках — это 6 пар из 36, а не 1 из 11.",ua:"Перед діленням завжди спитай, чи рівноймовірні результати. Сума 7 на двох кубиках — це 6 пар із 36, а не 1 з 11."},
  prob2:{ru:"Условие меняет знаменатель, а не числитель-«счастье». Вытянута пиковая карта оставляет 9 исходов из 36 — поэтому туз становится 4/9.",ua:"Умова змінює знаменник, а не чисельник. Витягнута пікова карта залишає 9 результатів із 36 — тому туз стає 4/9."},
  stat1:{ru:"Всегда смотри среднее вместе с медианой: если они сильно расходятся, в данных есть выброс, и среднее уже никого ни о чём не говорит.",ua:"Завжди дивись на середнє разом із медіаною: якщо вони сильно розходзяться, у даних є викид, і середнє вже нікого ні про що не говорить."}
};

/* ============================================================
   КВАНТИК → NETLIFY FUNCTION (чат: питання → відповідь)
   Раніше ендпоінт був n8n webhook (localhost:5678); тепер
   serverless-функція на тому ж домені — працює на статику.
   ============================================================ */
const KVANTIK_ENDPOINT = "/.netlify/functions/kvantik";
const KVANTIK_TIMEOUT = 15000;
const KVANTIK_UI = {
  ru:{
    placeholder:"Твой вопрос…",
    send:"Спросить",
    thinking:"Квантик думает…",
    error:"Не получилось связаться с n8n. Вот подсказка:",
    offline:"Квантик сейчас без связи — отвечаю по памяти.",
    hello:"Спрашивай что угодно по уроку — я подскажу."
  },
  ua:{
    placeholder:"Твоє питання…",
    send:"Запитати",
    thinking:"Квантик думає…",
    error:"Не вдалося зв'язатися з n8n. Ось підказка:",
    offline:"Квантик зараз без зв'язку — відповідаю з пам'яті.",
    hello:"Питай будь-що про урок — я підкажу."
  }
};
let mascotChatOpen = false;

function kvantikExtract(data){
  if(data == null) return "";
  if(typeof data === "string") return data;
  if(Array.isArray(data)) return data.length ? kvantikExtract(data[0]) : "";
  const keys = ["reply","text","answer","output","message","response","result","content"];
  for(const k of keys){
    if(typeof data[k] === "string" && data[k].trim()) return data[k];
  }
  if(data.json) return kvantikExtract(data.json);
  if(data.data) return kvantikExtract(data.data);
  return "";
}

function currentKvantikContext(){
  let moduleId = null;
  if(typeof LESSONS !== "undefined" && Array.isArray(LESSONS)){
    const l = LESSONS.find(x => x.id === state.lessonId);
    if(l) moduleId = l.module;
  }
  return {
    message: null,
    lessonId: state.lessonId || null,
    module: moduleId,
    grade: state.grade || null,
    lang: state.lang || "ru",
    page: "mathcourse"
  };
}

function appendKvantikMsg(role, text){
  const { bubble } = mascotEls();
  if(!bubble) return;
  const log = bubble.querySelector(".kvantik-log");
  if(!log) return;
  const el = document.createElement("div");
  el.className = "kvantik-msg " + (role === "user" ? "user" : "bot");
  el.textContent = text;
  log.appendChild(el);
  log.scrollTop = log.scrollHeight;
}

function openKvantikChat(){
  const { bubble } = mascotEls();
  if(!bubble) return;
  const T = KVANTIK_UI[state.lang] || KVANTIK_UI.ru;
  if(!mascotChatOpen){
    mascotChatOpen = true;
    bubble.innerHTML = "";
    bubble.classList.add("chat");
    const name = document.createElement("span");
    name.className = "mascot-name";
    name.textContent = "Квантик";
    bubble.appendChild(name);
    const log = document.createElement("div");
    log.className = "kvantik-log";
    bubble.appendChild(log);
    const form = document.createElement("form");
    form.className = "kvantik-form";
    const input = document.createElement("input");
    input.type = "text";
    input.className = "kvantik-input";
    input.placeholder = T.placeholder;
    input.autocomplete = "off";
    input.setAttribute("aria-label", T.placeholder);
    const send = document.createElement("button");
    send.type = "submit";
    send.className = "kvantik-send";
    send.textContent = T.send;
    form.appendChild(input);
    form.appendChild(send);
    form.addEventListener("click", e => e.stopPropagation());
    form.addEventListener("submit", e => {
      e.preventDefault();
      e.stopPropagation();
      const text = input.value.trim();
      if(!text) return;
      input.value = "";
      askKvantik(text);
    });
    bubble.appendChild(form);
    const hint = (LESSON_HINTS[state.lessonId] || {})[state.lang];
    appendKvantikMsg("bot", hint || T.hello);
  }
  clearTimeout(mascotHideTimer);
  mascotHideTimer = null;
  mascotRestart(bubble, "visible");
  mascotRestart(mascotEls().ping, "show");
  mascotSyncViewport();
  const input = bubble.querySelector(".kvantik-input");
  if(input) setTimeout(()=>{ try{ input.focus({preventScroll:true}); }catch(_){} }, 60);
}

function closeKvantikChat(){
  const { bubble } = mascotEls();
  mascotChatOpen = false;
  if(bubble){
    bubble.classList.remove("chat");
    bubble.innerHTML = "";
  }
  mascotHide();
}

async function askKvantik(text){
  const { bubble } = mascotEls();
  if(!bubble) return;
  const T = KVANTIK_UI[state.lang] || KVANTIK_UI.ru;
  appendKvantikMsg("user", text);
  const log = bubble.querySelector(".kvantik-log");
  const pending = document.createElement("div");
  pending.className = "kvantik-msg bot pending";
  pending.textContent = T.thinking;
  if(log){ log.appendChild(pending); log.scrollTop = log.scrollHeight; }
  let reply = "";
  try{
    const ctrl = new AbortController();
    const timer = setTimeout(()=>ctrl.abort(), KVANTIK_TIMEOUT);
    const payload = currentKvantikContext();
    payload.message = text;
    const res = await fetch(KVANTIK_ENDPOINT, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify(payload),
      signal: ctrl.signal
    });
    clearTimeout(timer);
    if(!res.ok) throw new Error("HTTP " + res.status);
    let data = null;
    try{ data = await res.json(); }
    catch(_){ data = await res.text().catch(()=>""); }
    reply = kvantikExtract(data);
  }catch(err){
    reply = null;
  }
  if(pending.remove) pending.remove();
  if(reply && reply.trim()){
    appendKvantikMsg("bot", reply.trim());
  }else{
    const hint = (LESSON_HINTS[state.lessonId] || {})[state.lang];
    appendKvantikMsg("bot", T.error + (hint ? " " + hint : ""));
  }
}

let mascotHideTimer = null;
let mascotKbInset = 0;
let mascotSyncRaf = 0;

function mascotEls(){
  return {
    wrap: document.getElementById("mascot-wrap"),
    bubble: document.getElementById("mascot-bubble"),
    avatar: document.getElementById("mascot-avatar"),
    ping: document.getElementById("mascot-ping")
  };
}

/* Синхронізація маскота з візуальним viewport'ом телефона:
   обрізає бульбашку під ширину екрана, піднімає маскота над клавіатурою. */
function mascotSyncViewport(){
  const { wrap, bubble } = mascotEls();
  if(!wrap) return;
  const vv = window.visualViewport;
  const vw = Math.round((vv ? vv.width : window.innerWidth) || document.documentElement.clientWidth || 0);
  const layoutH = window.innerHeight || document.documentElement.clientHeight || 0;
  const visualH = vv ? Math.round(vv.height + vv.offsetTop) : layoutH;
  const overlay = Math.max(0, layoutH - visualH);
  const keyboard = overlay > 120 ? overlay : 0;
  if(keyboard !== mascotKbInset){
    mascotKbInset = keyboard;
    wrap.style.setProperty("--kb-inset", keyboard+"px");
    document.body.classList.toggle("kb-open", keyboard > 0);
  }
  wrap.style.setProperty("--mascot-bubble-max", Math.max(150, vw - 40)+"px");
  if(bubble){
    const visibleH = keyboard ? layoutH - keyboard : visualH;
    bubble.style.maxHeight = Math.max(120, Math.round(visibleH * .42))+"px";
  }
}
function mascotScheduleSync(){
  if(mascotSyncRaf) return;
  mascotSyncRaf = requestAnimationFrame(()=>{ mascotSyncRaf = 0; mascotSyncViewport(); });
}
function mascotHide(){
  const { bubble, ping } = mascotEls();
  clearTimeout(mascotHideTimer);
  mascotHideTimer = null;
  if(bubble) bubble.classList.remove("visible");
  if(ping) ping.classList.remove("show");
}
function mascotRestart(elm, className){
  if(!elm) return;
  elm.classList.remove(className);
  void elm.offsetWidth;
  elm.classList.add(className);
}
function showMascot(text, autoHideMs){
  const { bubble, ping } = mascotEls();
  if(!bubble) return;
  if(mascotChatOpen){ appendKvantikMsg("bot", text); return; }
  bubble.textContent = "";
  const name = document.createElement("span");
  name.className = "mascot-name";
  name.textContent = "Квантик";
  bubble.appendChild(name);
  bubble.appendChild(document.createTextNode(text));
  mascotSyncViewport();
  mascotRestart(bubble, "visible");
  mascotRestart(ping, "show");
  clearTimeout(mascotHideTimer);
  mascotHideTimer = setTimeout(mascotHide, autoHideMs||5500);
}
function mascotSay(kind, extra){
  const phraseSet = (MASCOT_PHRASES[kind] || {})[state.lang];
  if(!phraseSet || !phraseSet.length) return;
  const phrase = rnd(phraseSet);
  showMascot(extra ? phrase+" "+extra : phrase);
}
function mascotGreetLesson(lessonId){
  const hint = LESSON_HINTS[lessonId];
  mascotSay("greet", hint ? hint[state.lang] : null);
}
function initMascot(){
  const { avatar, bubble } = mascotEls();
  if(avatar) avatar.addEventListener("click", ()=>{ mascotChatOpen ? closeKvantikChat() : openKvantikChat(); });
  if(bubble) bubble.addEventListener("click", ()=>{ if(mascotChatOpen) return; mascotHide(); });
  ["resize", "orientationchange", "scroll"].forEach(evt=>window.addEventListener(evt, mascotScheduleSync, {passive:true}));
  if(window.visualViewport){
    window.visualViewport.addEventListener("resize", mascotScheduleSync);
    window.visualViewport.addEventListener("scroll", mascotScheduleSync);
  }
  document.addEventListener("focusin", ()=>setTimeout(mascotSyncViewport, 120));
  document.addEventListener("focusout", ()=>setTimeout(mascotSyncViewport, 320));
  mascotSyncViewport();
}

/* ============================================================
   HELPERS
   ============================================================ */
function fmtRad(num, den){
  // formats a fraction of pi like 5/6 -> "5π/6", 1/1 -> "π", 2/1 -> "2π"
  if(num===0) return "0";
  let n = num, d = den;
  let pref = n===1 ? "" : n+"";
  let core = pref+"π";
  return d===1 ? core : core+"/"+d;
}
function parseAnswer(raw){
  if(raw==null) return NaN;
  let s = raw.trim().toLowerCase()
    .replace(/π/g,"pi")
    .replace(/√/g,"sqrt")
    .replace(/,/g,".");
  if(s==="" || s.length>100 || !/^(?:pi|sqrt|[0-9+\-*/().\s])+$/.test(s)) return NaN;
  let pos = 0;
  const skipSpaces = ()=>{ while(/\s/.test(s[pos]||"")) pos++; };
  const match = token=>{ skipSpaces(); if(s.slice(pos,pos+token.length)===token){ pos+=token.length; return true; } return false; };
  const expression = ()=>{
    let value = term();
    while(true){
      if(match("+")) value += term();
      else if(match("-")) value -= term();
      else return value;
    }
  };
  const term = ()=>{
    let value = unary();
    while(true){
      if(match("*")) value *= unary();
      else if(match("/")) value /= unary();
      else return value;
    }
  };
  const unary = ()=>{
    if(match("+")) return unary();
    if(match("-")) return -unary();
    return primary();
  };
  const primary = ()=>{
    skipSpaces();
    if(match("pi")) return Math.PI;
    if(match("sqrt")){
      if(!match("(")) throw new Error("Expected parenthesis");
      const value = expression();
      if(!match(")") || value<0) throw new Error("Invalid square root");
      return Math.sqrt(value);
    }
    if(match("(")){
      const value = expression();
      if(!match(")")) throw new Error("Expected parenthesis");
      return value;
    }
    skipSpaces();
    const number = s.slice(pos).match(/^(?:\d+(?:\.\d*)?|\.\d+)/);
    if(!number) throw new Error("Expected number");
    pos += number[0].length;
    return Number(number[0]);
  };
  try{
    const value = expression();
    skipSpaces();
    return pos===s.length && Number.isFinite(value) ? value : NaN;
  }catch(e){ return NaN; }
}
function near(a,b,eps){ eps = eps===undefined?0.02:eps; return Math.abs(a-b)<eps; }
function deg2rad(d){ return d*Math.PI/180; }
function rnd(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function fmtNum(x){ return (Math.round(x*1000)/1000).toString(); }
function cssVar(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
function shuffleArr(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}
function buildMC(correctText, distractors){
  const opts = [correctText, ...distractors];
  const shuffled = shuffleArr(opts);
  return {opts:shuffled, correctIdx: shuffled.indexOf(correctText)};
}

/* ============================================================
   СТЕРЕОМЕТРИЯ: кавальерская (фронтальная диметрическая) проекция
   x,y — плоскость чертежа как есть; z уходит "вглубь" под углом
   ============================================================ */
function project3D(x, y, z, originPx, originPy, scale){
  scale = scale || 40;
  const k = 0.5, ang = Math.PI/6; // коэффициент искажения и угол оси Oz (классические 0.5 и 30-45°)
  const px = originPx + (x + z*k*Math.cos(ang)) * scale;
  const py = originPy - (y + z*k*Math.sin(ang)) * scale;
  return {x:px, y:py};
}
function draw3DLine(ctx, p1, p2, color, width, dashed){
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = width || 2;
  if(dashed) ctx.setLineDash([5,4]);
  ctx.beginPath(); ctx.moveTo(p1.x,p1.y); ctx.lineTo(p2.x,p2.y); ctx.stroke();
  ctx.restore();
}
function draw3DPolygon(ctx, pts, fillColor, strokeColor){
  ctx.beginPath();
  pts.forEach((p,i)=>{ i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y); });
  ctx.closePath();
  if(fillColor){ ctx.fillStyle=fillColor; ctx.fill(); }
  if(strokeColor){ ctx.strokeStyle=strokeColor; ctx.lineWidth=2; ctx.stroke(); }
}

/* ============================================================
   LESSON DATA — Модуль 1 (уроки 1–4 готовы, 5 — soon)
   ============================================================ */

function renderSidebar(){
  const appTitle = document.getElementById("app-title");
  const appSubtitle = document.getElementById("app-subtitle");
  const btnRu = document.getElementById("btn-lang-ru");
  const btnUa = document.getElementById("btn-lang-ua");
  const btnCourse = document.getElementById("btn-mode-course");
  const btnTrainer = document.getElementById("btn-mode-trainer");
  if(appTitle) appTitle.textContent = gradeTitle();
  if(appSubtitle) appSubtitle.textContent = UI[state.lang].gradeSubtitles[state.grade] || UI[state.lang].appSubtitle;
  if(btnRu){ btnRu.classList.toggle("active", state.lang==="ru"); btnRu.setAttribute("aria-pressed", String(state.lang==="ru")); }
  if(btnUa){ btnUa.classList.toggle("active", state.lang==="ua"); btnUa.setAttribute("aria-pressed", String(state.lang==="ua")); }
  if(btnCourse){
    btnCourse.classList.toggle("active", state.mode==="course");
    btnCourse.setAttribute("aria-pressed", String(state.mode==="course"));
    btnCourse.textContent = UI[state.lang].course;
  }
  if(btnTrainer){
    btnTrainer.classList.toggle("active", state.mode==="trainer");
    btnTrainer.setAttribute("aria-pressed", String(state.mode==="trainer"));
    btnTrainer.textContent = UI[state.lang].trainer;
  }
  const searchInput = document.getElementById("lesson-search");
  if(searchInput){
    searchInput.placeholder = UI[state.lang].search;
    searchInput.oninput = ()=>{
      state.searchQuery = searchInput.value;
      clearTimeout(searchDebounceId);
      searchDebounceId = setTimeout(renderSearchResults, 120);
    };
    renderSearchResults();
  }

  const nav = document.getElementById("module-nav");
  nav.setAttribute("aria-label", UI[state.lang].lessonNav);
  nav.innerHTML = "";
  if(!visibleSections().some(section=>!section.locked)){
    const empty = document.createElement("div");
    empty.className = "grade-empty";
    empty.textContent = UI[state.lang].gradeEmpty;
    nav.appendChild(empty);
    return;
  }
  const sections = visibleSections();
  const facultyIds = FACULTATIVE.lessons.filter(id=>typeof id === "string" && lessonInGrade(id, state.grade));
  if(facultyIds.length) sections.push({modId:null, mod:FACULTATIVE, faculty:true});
  sections.forEach(({modId, mod, faculty, locked})=>{
    const block = document.createElement("div");
    block.className = "module-block" + (faculty ? " faculty" : locked ? " locked" : "");
    const title = document.createElement("div");
    title.className = "module-title";
    title.textContent = faculty ? mod[state.lang] : moduleTitle(modId, state.lang);
    if((state.grade !== "middle" && mod.exam_priority) || mod.advanced || faculty){
      const flag = document.createElement("span");
      flag.className = "module-flag" + (mod.advanced ? " advanced" : faculty ? " faculty" : "");
      flag.textContent = mod.advanced ? UI[state.lang].advancedLabel : faculty ? UI[state.lang].facultativeLabel : UI[state.lang].examPriority;
      title.appendChild(flag);
    }
    block.appendChild(title);
    if(mod.comment || mod.note){
      const noteText = (mod.comment || mod.note)[state.lang];
      const note = document.createElement("div");
      note.className = "module-note";
      note.textContent = noteText;
      block.appendChild(note);
    }
    if(locked){
      const scope = document.createElement("div");
      scope.className = "module-locked";
      scope.textContent = UI[state.lang].moduleLocked + ": " + moduleForGrades(modId);
      block.appendChild(scope);
    } else {
      const progress = faculty
        ? groupProgress(mod.lessons.filter(id=>typeof id === "string" && lessonInGrade(id, state.grade)))
        : moduleProgress(modId);
      const progressEl = document.createElement("div");
      progressEl.className = "module-progress";
      progressEl.setAttribute("role", "progressbar");
      progressEl.setAttribute("aria-valuemin", "0");
      progressEl.setAttribute("aria-valuemax", "100");
      progressEl.setAttribute("aria-valuenow", String(progress.percent));
      const sectionTitle = faculty ? mod[state.lang] : moduleTitle(modId, state.lang);
      progressEl.setAttribute("aria-label", `${sectionTitle} — ${UI[state.lang].progress} ${progress.percent}%`);
      progressEl.innerHTML = `<span>${UI[state.lang].progress}: ${progress.percent}% (${progress.done}/${progress.total})</span><div class="module-progress-track"><div class="module-progress-fill" style="width:${progress.percent}%"></div></div>`;
      block.appendChild(progressEl);
      let visibleNumber = 0;
      mod.lessons.forEach((item, idx)=>{
      const btn = document.createElement("button");
      const num = document.createElement("span");
      num.className = "lesson-num";
      if(typeof item === "string"){
        const lesson = LESSONS.find(l=>l.id===item);
        if(!lessonInGrade(item, state.grade)) return;
        visibleNumber += 1;
        num.textContent = visibleNumber;
        btn.type = "button";
        btn.dataset.lesson = item;
        btn.className = "lesson-item" + (state.mode==="course" && state.lessonId===item ? " active":"") + (state.doneLessons.has(item)?" done":"");
        num.setAttribute("aria-hidden", "true");
        btn.appendChild(num);
        const span = document.createElement("span");
        span.className = "lesson-title";
        span.textContent = lesson.title[state.lang];
        btn.appendChild(span);
        const readiness = state.grade === "middle" ? lessonReadiness(item) : null;
        if(readiness){
          const badge = document.createElement("span");
          badge.className = "lesson-readiness " + readiness;
          badge.textContent = UI[state.lang][readiness === "core" ? "readinessCore" : "readinessExtension"];
          badge.title = UI[state.lang][readiness === "core" ? "readinessCoreHint" : "readinessExtensionHint"];
          badge.setAttribute("aria-hidden", "true");
          btn.appendChild(badge);
        }
        const stat = miniStat(item);
        let miniLabel = "";
        if(stat){
          const ind = document.createElement("span");
          ind.className = "mini-ind visible" + (stat.complete ? " done":"");
          ind.textContent = stat.complete ? "✓" : stat.correct+"/"+stat.total;
          ind.title = (state.grade === "junior" ? UI[state.lang].kidProgress : UI[state.lang].miniCheckProgress).replace("{c}",stat.correct).replace("{t}",stat.total);
          ind.setAttribute("aria-hidden", "true");
          btn.appendChild(ind);
          miniLabel = ", " + ind.title;
        }
        const status = document.createElement("span");
        status.className = "lesson-status";
        status.textContent = state.doneLessons.has(item) ? "✓" : "○";
        status.title = state.doneLessons.has(item) ? UI[state.lang].completed : UI[state.lang].notCompleted;
        status.setAttribute("aria-hidden", "true");
        btn.appendChild(status);
        const readinessLabel = readiness
          ? " — " + UI[state.lang][readiness === "core" ? "readinessCoreHint" : "readinessExtensionHint"]
          : "";
        btn.setAttribute("aria-label", lesson.title[state.lang] + readinessLabel + " — " + status.title + miniLabel);
        btn.addEventListener("click", ()=>{ state.mode="course"; state.lessonId=item; navFromUi=true; render(); });
      } else if(item.test){
        if(!moduleTestAvailable(modId)) return;
        btn.type = "button";
        btn.className = "lesson-item" + (state.mode==="moduletest" && state.testModuleId===modId ? " active":"");
        num.textContent = "✓";
        num.setAttribute("aria-hidden", "true");
        btn.appendChild(num);
        const span = document.createElement("span");
        span.textContent = item.t[state.lang];
        btn.appendChild(span);
        const tag = document.createElement("span");
        tag.className = "test-tag";
        tag.textContent = "TEST";
        tag.setAttribute("aria-hidden", "true");
        btn.appendChild(tag);
        btn.setAttribute("aria-label", item.t[state.lang] + " — TEST");
        btn.addEventListener("click", ()=>{ state.mode="moduletest"; state.testModuleId=modId; currentTest=null; render(); });
      } else {
        btn.type = "button";
        btn.className = "lesson-item disabled";
        btn.disabled = true;
        num.textContent = "·";
        num.setAttribute("aria-hidden", "true");
        btn.appendChild(num);
        const span = document.createElement("span");
        span.textContent = item.t[state.lang];
        btn.appendChild(span);
        const tag = document.createElement("span");
        tag.className = "soon-tag";
        tag.textContent = UI[state.lang].soon;
        btn.appendChild(tag);
      }
      block.appendChild(btn);
    });
    }
    nav.appendChild(block);
  });
}

/* ============================================================
   RENDER: MAIN — COURSE VIEW
   ============================================================ */
/* Первый урок, доступный в текущем блоке классов, — фолбэк,
   когда открытый урок скрыт переключателем. */
function firstVisibleLesson(){
  for(const {modId, mod} of visibleSections()){
    for(const item of mod.lessons){
      if(typeof item === "string" && lessonInGrade(item, state.grade)) return item;
    }
    void modId;
  }
  return null;
}

function renderCourse(){
  const main = document.getElementById("main");
  const lesson = LESSONS.find(l=>l.id===state.lessonId && lessonInGrade(l.id, state.grade))
    || (()=>{ const id = firstVisibleLesson(); return id ? LESSONS.find(l=>l.id===id) : null; })();
  if(!lesson){
    main.innerHTML = `<div class="grade-empty">${UI[state.lang].gradeEmpty}</div>`;
    return;
  }
  state.lessonId = lesson.id;
  const navigation = courseNavigation(lesson.id);
  state.doneLessons.add(lesson.id); saveDone();
  const faculty = isFacultative(lesson.id);
  const modLabel = faculty ? FACULTATIVE[state.lang] : moduleTitle(lesson.module, state.lang).split(".")[0];
  const lessonNumber = faculty ? "" : lessonNumberInModule(lesson.id);
  main.innerHTML = `
    <div class="lesson-header">
      <div class="lesson-kicker">${modLabel} · ${UI[state.lang].lessonLabel} ${lessonNumber}</div>
      <h2 tabindex="-1">${lesson.title[state.lang]}</h2>
    </div>
    <nav class="lesson-navigation" aria-label="${UI[state.lang].lessonNav}">
      <button class="btn secondary" id="previous-lesson-btn" ${navigation.previous ? "" : "disabled"}>← ${UI[state.lang].previousLesson}</button>
      <button class="btn" id="next-lesson-btn" ${navigation.next ? "" : "disabled"}>${UI[state.lang].nextLesson} →</button>
    </nav>
    <div class="content">${lesson.html(state.lang)}</div>
  `;
  if(navigation.previous){
    main.querySelector("#previous-lesson-btn").addEventListener("click", ()=>{ state.lessonId=navigation.previous; navFromUi=true; render(); });
  }
  if(navigation.next){
    main.querySelector("#next-lesson-btn").addEventListener("click", ()=>{ state.lessonId=navigation.next; navFromUi=true; render(); });
  }
  lesson.mount(main, state.lang);
  addFormulaBookmarks(main, lesson.id);
  renderSidebar();
  mascotGreetLesson(lesson.id);
  if(navFromUi){
    const heading = main.querySelector(".lesson-header h2");
    if(heading) heading.focus();
    navFromUi = false;
  }
}

/* ============================================================
   RENDER: MAIN — TRAINER VIEW
   ============================================================ */
function renderTrainerLevelPicker(){
  const main = document.getElementById("main");
  const L = UI[state.lang];
  const overall = trainerOverall();
  const weak = weakTrainerTopics(10);
  main.innerHTML = `
    <div class="lesson-header">
      <div class="lesson-kicker">${L.trainer}</div>
      <h2>${L.trainerLevelPick}</h2>
    </div>
    <div class="trainer-stats-panel" id="trainer-stats-panel"></div>
    <div class="trainer-topic-grid" id="level-grid"></div>
  `;
  const panel = main.querySelector("#trainer-stats-panel");
  const title = document.createElement("div");
  title.className = "trainer-stats-title";
  title.textContent = L.trainerStatsTitle;
  panel.appendChild(title);
  const line = document.createElement("div");
  line.className = "trainer-stats-line";
  line.textContent = overall.total
    ? L.trainerStatsOverall.replace("{p}",overall.acc).replace("{c}",overall.correct).replace("{t}",overall.total)
    : L.trainerStatsNone;
  panel.appendChild(line);
  if(weak.length){
    const btn = document.createElement("button");
    btn.className = "btn trainer-review-btn";
    btn.id = "trainer-review-start";
    btn.textContent = L.trainerReviewStart.replace("{n}",weak.length);
    btn.addEventListener("click", startTrainerReview);
    panel.appendChild(btn);
  } else if(overall.total){
    const done = document.createElement("div");
    done.className = "trainer-stats-line trainer-stats-clear";
    done.textContent = L.trainerReviewClear;
    panel.appendChild(done);
  }
  const grid = main.querySelector("#level-grid");
  const levels = LEVEL_DEFS.map(level=>({
    level, topics: level.topics.filter(topic=>topicInGrade(topic.id))
  })).filter(entry=>entry.topics.length);
  levels.forEach(({level, topics})=>{
    const card = document.createElement("div");
    card.className = "topic-card";
    let levelTotal = 0, levelCorrect = 0;
    topics.forEach(t=>{ const r = state.trainerStats[t.id]; if(r){ levelTotal += r.total; levelCorrect += r.correct; } });
    const badge = levelTotal
      ? `<div class="topic-stat">${L.trainerAccuracy.replace("{p}",Math.round(levelCorrect/levelTotal*100)).replace("{n}",levelTotal)}</div>`
      : "";
    card.innerHTML = `<h4>${level.title[state.lang]}</h4><p>${level.desc[state.lang]}</p>${badge}`;
    card.addEventListener("click", ()=>{
      state.trainerLevel = level.id;
      state.trainerTopic = null;
      render();
    });
    grid.appendChild(card);
  });
  if(!levels.length){
    const empty = document.createElement("div");
    empty.className = "grade-empty";
    empty.textContent = UI[state.lang].gradeEmpty;
    grid.appendChild(empty);
  }
  renderStudyResources(main);
}

function createPdfBlob(){
  const lines = [
    "MATHCOURSE - FORMULA CHEAT SHEET",
    "",
    "Trigonometry: sin^2 x + cos^2 x = 1",
    "tan x = sin x / cos x",
    "sin 2x = 2 sin x cos x",
    "",
    "Exponents and logarithms: a^x = b => x = log_a(b)",
    "log_a(a^x) = x; log_a(xy) = log_a x + log_a y",
    "",
    "Calculus: (x^n)' = n x^(n-1)",
    "integral x^n dx = x^(n+1)/(n+1) + C",
    "",
    "Geometry: V_prism = S_base * h",
    "V_pyramid = S_base * h / 3",
    "S_sphere = 4 * pi * R^2"
  ];
  const escapePdf = line=>line.replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)");
  const stream = ["BT","/F1 14 Tf","50 760 Td",...lines.map((line,index)=>`(${escapePdf(line)}) Tj${index<lines.length-1 ? " 0 -24 Td" : ""}`),"ET"].join("\n");
  const objects = ["<< /Type /Catalog /Pages 2 0 R >>","<< /Type /Pages /Kids [3 0 R] /Count 1 >>","<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"];
  let pdf="%PDF-1.4\n";
  const offsets=[0];
  objects.forEach((object,index)=>{ offsets.push(pdf.length); pdf += `${index+1} 0 obj\n${object}\nendobj\n`; });
  const xref=pdf.length;
  pdf += `xref\n0 ${objects.length+1}\n0000000000 65535 f \n${offsets.slice(1).map(offset=>String(offset).padStart(10,"0")+" 00000 n ").join("\n")}\ntrailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([pdf],{type:"application/pdf"});
}
function renderStudyResources(main){
  const L = UI[state.lang];
  const section = document.createElement("section");
  section.className = "resources-section";
  section.innerHTML = `<h3>${L.nmtResources}</h3><div class="resource-grid"><article class="resource-card"><h4>${L.nmtReviews}</h4><div id="nmt-reviews"></div></article><article class="resource-card"><h4>${L.videos}</h4><p>${L.videoUnavailable}</p><iframe class="video-frame" loading="lazy" title="${VIDEO_RESOURCES[0].title[state.lang]}" src="${VIDEO_RESOURCES[0].src}" allowfullscreen></iframe></article><article class="resource-card"><h4>PDF</h4><p>${L.downloadCheatsheet}</p><button class="btn" id="download-cheatsheet">${L.downloadCheatsheet}</button></article></div>`;
  main.appendChild(section);
  const reviews = section.querySelector("#nmt-reviews");
  NMT_REVIEWS.forEach(review=>{
    const details = document.createElement("details");
    details.innerHTML = `<summary>${review.year} · ${review.title[state.lang]}</summary><p>${review.text[state.lang]}</p>`;
    reviews.appendChild(details);
  });
  section.querySelector("#download-cheatsheet").addEventListener("click", ()=>{
    const url = URL.createObjectURL(createPdfBlob());
    const link = document.createElement("a");
    link.href=url; link.download="mathcourse-formulas.pdf"; link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
}

function renderTrainerTopicPicker(){
  const main = document.getElementById("main");
  const L = UI[state.lang];
  const level = LEVEL_DEFS.find(l=>l.id===state.trainerLevel);
  const topics = level.topics.filter(topic=>topicInGrade(topic.id));
  main.innerHTML = `
    <div class="back-link" id="trainer-back-level">${L.trainerBackLevels}</div>
    <div class="lesson-header">
      <div class="lesson-kicker">${L.trainer} · ${level.title[state.lang]}</div>
      <h2>${L.trainerPick}</h2>
    </div>
    <div class="trainer-topic-grid" id="topic-grid"></div>
  `;
  main.querySelector("#trainer-back-level").addEventListener("click", ()=>{ state.trainerLevel=null; render(); });
  const grid = main.querySelector("#topic-grid");
  topics.forEach(topic=>{
    const card = document.createElement("div");
    card.className = "topic-card";
    const rec = state.trainerStats[topic.id];
    const badge = rec
      ? `<div class="topic-stat">${L.trainerAccuracy.replace("{p}",trainerAcc(rec)).replace("{n}",rec.total)}</div>`
      : "";
    card.innerHTML = `<h4>${topic.title[state.lang]}</h4><p>${topic.desc[state.lang]}</p>${badge}`;
    card.addEventListener("click", ()=>{
      state.trainerTopic = topic.id;
      state.trainerScore = {correct:0,total:0};
      trainerCurrent = null;
      render();
    });
    grid.appendChild(card);
  });
}

function renderTrainerQuestion(opts){
  const main = document.getElementById("main");
  const L = UI[state.lang];
  const topic = opts.topic;
  if(!trainerCurrent) trainerCurrent = topic.generate();
  const isMC = !!trainerCurrent.options;

  main.innerHTML = `
    <div class="back-link" id="trainer-back">${opts.backLabel}</div>
    <div class="lesson-header">
      <div class="lesson-kicker">${opts.kicker}</div>
      <h2>${topic.title[state.lang]}</h2>
    </div>
    <div class="trainer-run">
      ${opts.progress ? `<div class="trainer-review-progress">${opts.progress}</div>` : ""}
      <div class="trainer-score">${L.trainerScore.replace("{c}",state.trainerScore.correct).replace("{t}",state.trainerScore.total)}</div>
      <div id="feedback-slot"></div>
      <div class="trainer-q">${trainerCurrent.question[state.lang]}</div>
      <button class="hint-btn" id="hint-btn">💡 ${L.showHint}</button>
      <div class="hint-text" id="hint-text" style="display:none;"></div>
      ${isMC ? '<div class="q-options" id="trainer-mc"></div>' : `
      <div class="trainer-input-row">
        <input type="text" id="trainer-input" placeholder="${L.trainerPlaceholder}" autocomplete="off">
        <button class="btn" id="trainer-check-btn">${L.trainerCheck}</button>
      </div>`}
    </div>
  `;
  main.querySelector("#trainer-back").addEventListener("click", opts.onBack);
  main.querySelector("#hint-btn").addEventListener("click", ()=>{
    main.querySelector("#hint-text").textContent = trainerCurrent.hint[state.lang];
    main.querySelector("#hint-text").style.display = "block";
    main.querySelector("#hint-btn").style.display = "none";
  });

  function grade(ok, correctLabel){
    state.trainerScore.total++;
    if(ok) state.trainerScore.correct++;
    recordTrainerResult(topic.id, ok);
    if(opts.onGraded) opts.onGraded(ok);
    const slot = main.querySelector("#feedback-slot");
    slot.innerHTML = `<div class="feedback ${ok?'correct':'wrong'}">${ok ? L.trainerCorrect : L.trainerWrongPrefix+correctLabel}</div>`;
    renderTaskMeta();
    main.querySelector(".trainer-score").textContent = L.trainerScore.replace("{c}",state.trainerScore.correct).replace("{t}",state.trainerScore.total);
    mascotSay(ok?"correct":"wrong");
  }

  /* Разбор задания после проверки: тема, формат ответа, верный ответ, решение. */
  function renderTaskMeta(){
    const slot = main.querySelector("#feedback-slot");
    if(!slot) return;
    const cur = trainerCurrent || {};
    const rows = [];
    if(cur.topic) rows.push([L.trainerMetaTopic, cur.topic[state.lang]]);
    if(cur.format) rows.push([L.trainerMetaFormat, cur.format[state.lang]]);
    const answer = isMC && cur.options ? cur.options[state.lang][cur.correct]
                : (typeof cur.correctLabel === "string" ? cur.correctLabel : "");
    if(answer) rows.push([L.trainerMetaAnswer, answer]);
    if(cur.solution) rows.push([L.trainerMetaSolution, cur.solution[state.lang]]);
    if(!rows.length) return;
    const box = document.createElement("div");
    box.className = "task-meta";
    const title = document.createElement("div");
    title.className = "task-meta-title";
    title.textContent = L.trainerMetaTitle;
    box.appendChild(title);
    rows.forEach(([k, v])=>{
      const row = document.createElement("div");
      row.className = "task-meta-row";
      const key = document.createElement("span");
      key.className = "task-meta-key";
      key.textContent = k;
      const val = document.createElement("span");
      val.className = "task-meta-val";
      val.textContent = v;
      row.appendChild(key);
      row.appendChild(val);
      box.appendChild(row);
    });
    slot.appendChild(box);
  }

  if(isMC){
    const optsWrap = main.querySelector("#trainer-mc");
    trainerCurrent.options[state.lang].forEach((optText, oi)=>{
      const b = document.createElement("button");
      b.className = "q-opt";
      b.textContent = optText;
      b.addEventListener("click", ()=>{
        [...optsWrap.children].forEach(c=>c.disabled=true);
        const ok = oi===trainerCurrent.correct;
        if(ok){ b.classList.add("correct"); }
        else{ b.classList.add("wrong"); optsWrap.children[trainerCurrent.correct].classList.add("correct"); }
        grade(ok, trainerCurrent.options[state.lang][trainerCurrent.correct]);
        const nextBtn = document.createElement("button");
        nextBtn.className = "btn";
        nextBtn.style.marginTop = "14px";
        nextBtn.textContent = opts.nextLabel || L.trainerNext;
        nextBtn.addEventListener("click", opts.onNext);
        main.querySelector(".trainer-run").appendChild(nextBtn);
      });
      optsWrap.appendChild(b);
    });
  } else {
    const input = main.querySelector("#trainer-input");
    input.focus();
    function submit(){
      const ok = trainerCurrent.check(input.value);
      grade(ok, trainerCurrent.correctLabel);
      input.disabled = true;
      main.querySelector("#trainer-check-btn").textContent = opts.nextLabel || L.trainerNext;
      main.querySelector("#trainer-check-btn").onclick = opts.onNext;
    }
    main.querySelector("#trainer-check-btn").addEventListener("click", submit);
    input.addEventListener("keydown", e=>{ if(e.key==="Enter" && !input.disabled) submit(); });
  }
}

function renderTrainerRun(){
  const L = UI[state.lang];
  const level = LEVEL_DEFS.find(l=>l.id===state.trainerLevel);
  const topic = level.topics.find(t=>t.id===state.trainerTopic);
  renderTrainerQuestion({
    kicker: `${L.trainer} · ${level.title[state.lang]}`,
    topic,
    backLabel: L.trainerBack,
    onBack: ()=>{ state.trainerTopic=null; trainerCurrent=null; render(); },
    onNext: ()=>{ trainerCurrent=null; render(); }
  });
}

function startTrainerReview(){
  const ids = weakTrainerTopics(10);
  if(!ids.length) return;
  state.trainerReview = {ids, idx:0, correct:0, total:0};
  state.trainerScore = {correct:0,total:0};
  trainerCurrent = null;
  render();
}

function renderTrainerReview(){
  const main = document.getElementById("main");
  const L = UI[state.lang];
  const rev = state.trainerReview;
  if(!rev){ renderTrainerLevelPicker(); return; }
  if(rev.idx >= rev.ids.length){
    main.innerHTML = `
      <div class="lesson-header">
        <div class="lesson-kicker">${L.trainer} · ${L.trainerReview}</div>
        <h2>${L.trainerReviewDone}</h2>
      </div>
      <div class="trainer-review-summary">
        <p>${L.trainerReviewResult.replace("{c}",rev.correct).replace("{t}",rev.total)}</p>
        <button class="btn" id="review-again">${L.trainerReviewAgain}</button>
        <button class="btn secondary" id="review-topics">${L.trainerReviewToTopics}</button>
      </div>
    `;
    main.querySelector("#review-again").addEventListener("click", ()=>{
      state.trainerReview = null;
      if(weakTrainerTopics(10).length) startTrainerReview();
      else { state.trainerTopic=null; trainerCurrent=null; render(); }
    });
    main.querySelector("#review-topics").addEventListener("click", ()=>{
      state.trainerReview=null; state.trainerTopic=null; trainerCurrent=null; render();
    });
    return;
  }
  const entry = findTrainerTopic(rev.ids[rev.idx]);
  renderTrainerQuestion({
    kicker: `${L.trainer} · ${L.trainerReview}`,
    topic: entry.topic,
    backLabel: L.trainerReviewExit,
    progress: L.trainerReviewProgress.replace("{c}",rev.idx+1).replace("{t}",rev.ids.length),
    onBack: ()=>{ state.trainerReview=null; trainerCurrent=null; render(); },
    onGraded: (ok)=>{ rev.total++; if(ok) rev.correct++; },
    onNext: ()=>{ rev.idx++; trainerCurrent=null; render(); }
  });
}

/* ============================================================
   ИТОГОВЫЙ ТЕСТ МОДУЛЯ (по одному заданию с каждого топика)
   ============================================================ */
let currentTest = null;
let testGraded = false;
let testTimeLeft = MODULE_TEST_DURATION;

function buildModuleTest(moduleId){
  const items = [];
  LEVEL_DEFS.forEach(level=>{
    level.topics.filter(topic=>topic.module===moduleId && topicInGrade(topic.id)).forEach(topic=>{
      items.push({level: level.id, topicId: topic.id, topicTitle: topic.title, q: topic.generate()});
    });
  });
  return items;
}

function moduleTestTopicCount(moduleId){
  return LEVEL_DEFS.reduce((count, level)=>count +
    level.topics.filter(topic=>topic.module===moduleId && topicInGrade(topic.id)).length, 0);
}

function moduleTestAvailable(moduleId){
  const topicCount = moduleTestTopicCount(moduleId);
  return topicCount > 0 && (state.grade !== "middle" || topicCount >= 3);
}

function calculateQuizRating(correct, total){
  const questionCount = Math.max(0, Math.trunc(Number(total) || 0));
  const correctCount = Math.min(questionCount, Math.max(0, Math.trunc(Number(correct) || 0)));
  const points = questionCount ? Math.round(correctCount / questionCount * 100) : 0;
  const rating = Math.round(points / 20 * 10) / 10;
  const tier = points < 50 ? "quizStart" : points < 80 ? "quizBoost" : "quizLegend";
  return {correct:correctCount, total:questionCount, points, rating, tier};
}

function renderModuleTest(){
  const main = document.getElementById("main");
  const L = UI[state.lang];
  clearInterval(testTimerId);
  testTimerId = null;
  const levelTitle = id => LEVEL_DEFS.find(l=>l.id===id).title[state.lang];
  const modName = moduleTitle(state.testModuleId, state.lang).split(".").slice(1).join(".").trim()
    || moduleTitle(state.testModuleId, state.lang);
  const topicCount = moduleTestTopicCount(state.testModuleId);
  if(!moduleTestAvailable(state.testModuleId)){
    main.innerHTML = `
      <div class="lesson-header">
        <div class="lesson-kicker">${L.testKicker}</div>
        <h2>${modName}</h2>
      </div>
      <div class="grade-empty">${topicCount ? L.testNotEnoughTopics : L.testNoTopics}</div>
      <button class="btn" id="test-back-btn">${L.testBack}</button>
    `;
    main.querySelector("#test-back-btn").addEventListener("click", ()=>{
      state.mode = "course"; state.testModuleId = null; currentTest = null; render();
    });
    currentTest = null;
    return;
  }
  if(!currentTest){ currentTest = buildModuleTest(state.testModuleId); testGraded = false; testTimeLeft = MODULE_TEST_DURATION; }

  /* В ступени классов у модуля может не оказаться тем тренажёра —
     например, модуль 6 виден в 8–9 только уроком об аксиомах. Тогда
     вместо таймера без заданий показываем пустое состояние. */
  if(!currentTest.length){
    main.innerHTML = `
      <div class="lesson-header">
        <div class="lesson-kicker">${L.testKicker}</div>
        <h2>${modName}</h2>
      </div>
      <div class="grade-empty">${L.testNoTopics}</div>
      <button class="btn" id="test-back-btn">${L.testBack}</button>
    `;
    main.querySelector("#test-back-btn").addEventListener("click", ()=>{
      state.mode = "course"; state.testModuleId = null; currentTest = null; render();
    });
    return;
  }
  let html = `
    <div class="lesson-header">
      <div class="lesson-kicker">${L.testKicker}</div>
      <h2>${modName} — ${L.testKicker}</h2>
    </div>
    <div class="test-timer" id="test-timer"><span>${L.testTimer}</span><span class="test-timer-value" id="test-timer-value"></span></div>
    <div id="test-summary"></div>
  `;
  let lastLevel = null, qNum = 0;
  currentTest.forEach((item, idx)=>{
    if(item.level !== lastLevel){
      html += `<h3 class="test-level-heading">${levelTitle(item.level)}</h3>`;
      lastLevel = item.level;
    }
    qNum++;
    html += `<div class="test-q" data-idx="${idx}">`;
    html += `<div class="test-q-text">${qNum}. ${item.q.question[state.lang]}</div>`;
    if(item.q.options){
      html += `<div class="test-q-options">`;
      item.q.options[state.lang].forEach((optText, oi)=>{
        html += `<button type="button" class="q-opt test-opt" data-oi="${oi}">${optText}</button>`;
      });
      html += `</div>`;
    } else {
      html += `<input type="text" class="test-input" placeholder="${L.trainerPlaceholder}" autocomplete="off">`;
    }
    html += `<div class="test-feedback" style="display:none;"></div>`;
    html += `</div>`;
  });
  html += `<button class="btn" id="test-submit-btn">${L.testSubmit}</button>`;
  html += `<button class="btn secondary" id="test-restart-btn" style="display:none;margin-left:10px;">${L.testRestart}</button>`;
  main.innerHTML = html;

  main.querySelectorAll(".test-q").forEach(qEl=>{
    const idx = +qEl.dataset.idx;
    const item = currentTest[idx];
    if(item.q.options){
      qEl.querySelectorAll(".test-opt").forEach(btn=>{
        btn.addEventListener("click", ()=>{
          if(testGraded) return;
          qEl.querySelectorAll(".test-opt").forEach(b=>b.classList.remove("selected"));
          btn.classList.add("selected");
        });
      });
    }
  });

  function updateTestTimer(){
    const timer = main.querySelector("#test-timer");
    const value = main.querySelector("#test-timer-value");
    const minutes = Math.floor(testTimeLeft/60).toString().padStart(2,"0");
    const seconds = (testTimeLeft%60).toString().padStart(2,"0");
    value.textContent = `${minutes}:${seconds}`;
    timer.classList.toggle("warning", testTimeLeft<=60);
  }

  function submitTest(timedOut){
    if(testGraded) return;
    testGraded = true;
    clearInterval(testTimerId);
    testTimerId = null;
    const scoreByLevel = {base:{c:0,t:0}, medium:{c:0,t:0}, high:{c:0,t:0}};
    const reviewTopics = new Map();
    main.querySelectorAll(".test-q").forEach(qEl=>{
      const idx = +qEl.dataset.idx;
      const item = currentTest[idx];
      scoreByLevel[item.level].t++;
      let ok = false;
      if(item.q.options){
        const selected = qEl.querySelector(".test-opt.selected");
        const selIdx = selected ? +selected.dataset.oi : -1;
        ok = selIdx === item.q.correct;
        qEl.querySelectorAll(".test-opt").forEach(b=>{ b.disabled = true; });
        if(selected) selected.classList.add(ok ? "correct" : "wrong");
        if(!ok) qEl.querySelectorAll(".test-opt")[item.q.correct].classList.add("correct");
      } else {
        const inputEl = qEl.querySelector(".test-input");
        ok = item.q.check(inputEl.value);
        inputEl.disabled = true;
        const fbEl = qEl.querySelector(".test-feedback");
        fbEl.style.display = "block";
        fbEl.className = "test-feedback " + (ok ? "correct" : "wrong");
        fbEl.textContent = ok ? L.trainerCorrect : L.trainerWrongPrefix + item.q.correctLabel;
      }
      if(ok) scoreByLevel[item.level].c++;
      else reviewTopics.set(`${item.level}:${item.topicId}`, {level:item.level, id:item.topicId, title:item.topicTitle});
      qEl.classList.add(ok ? "test-q-correct" : "test-q-wrong");
    });
    const total = {
      c: scoreByLevel.base.c + scoreByLevel.medium.c + scoreByLevel.high.c,
      t: scoreByLevel.base.t + scoreByLevel.medium.t + scoreByLevel.high.t
    };
    const rating = calculateQuizRating(total.c, total.t);
    main.querySelector("#test-summary").innerHTML = `
      <div class="test-summary-box">
        ${timedOut ? `<div class="test-summary-row">${L.timeUp}</div>` : ""}
        <div class="test-summary-total">${L.testResult}: ${total.c} / ${total.t}</div>
        <div class="test-summary-row">${L.testRating}: ${rating.rating.toFixed(1)} / 5 · ${rating.points} XP</div>
        <div class="test-summary-row">${LEVEL_DEFS[0].title[state.lang]}: ${scoreByLevel.base.c}/${scoreByLevel.base.t}</div>
        <div class="test-summary-row">${LEVEL_DEFS[1].title[state.lang]}: ${scoreByLevel.medium.c}/${scoreByLevel.medium.t}</div>
        <div class="test-summary-row">${LEVEL_DEFS[2].title[state.lang]}: ${scoreByLevel.high.c}/${scoreByLevel.high.t}</div>
        <div class="test-review-topics" id="test-review-topics"></div>
      </div>`;
    const review = main.querySelector("#test-review-topics");
    if(reviewTopics.size){
      const heading = document.createElement("div");
      heading.className = "test-review-title";
      heading.textContent = L.testReviewTitle;
      review.appendChild(heading);
      const list = document.createElement("div");
      list.className = "test-review-list";
      reviewTopics.forEach(topic=>{
        const button = document.createElement("button");
        button.type = "button";
        button.className = "btn secondary test-review-topic";
        button.textContent = L.testReviewPractice.replace("{topic}", topic.title[state.lang]);
        button.addEventListener("click", ()=>{
          state.mode = "trainer";
          state.trainerLevel = topic.level;
          state.trainerTopic = topic.id;
          state.trainerReview = null;
          state.trainerScore = {correct:0,total:0};
          trainerCurrent = null;
          render();
        });
        list.appendChild(button);
      });
      review.appendChild(list);
    } else {
      review.classList.add("test-review-complete");
      review.textContent = L.testReviewAllDone;
    }
    main.querySelector("#test-submit-btn").style.display = "none";
    main.querySelector("#test-restart-btn").style.display = "inline-block";
    mascotSay(rating.tier, `${rating.points} XP · ${rating.rating.toFixed(1)}/5`);
  }
  main.querySelector("#test-submit-btn").addEventListener("click", ()=>submitTest(false));
  updateTestTimer();
  if(!testTimerId && !testGraded){
    testTimerId = setInterval(()=>{
      testTimeLeft = Math.max(0, testTimeLeft-1);
      updateTestTimer();
      if(testTimeLeft===0) submitTest(true);
    },1000);
  }
  main.querySelector("#test-restart-btn").addEventListener("click", ()=>{
    clearInterval(testTimerId);
    testTimerId = null;
    currentTest = null; testGraded = false; renderModuleTest();
  });
}

/* ============================================================
   MAIN RENDER DISPATCH
   ============================================================ */
function render(){
  closeMobileMenu();
  if(state.mode!=="moduletest"){
    clearInterval(testTimerId);
    testTimerId = null;
  }
  renderSidebar();
  if(state.mode==="course") renderCourse();
  else if(state.mode==="moduletest") renderModuleTest();
  else {
    if(state.trainerReview) renderTrainerReview();
    else if(!state.trainerLevel) renderTrainerLevelPicker();
    else if(!state.trainerTopic) renderTrainerTopicPicker();
    else renderTrainerRun();
  }
  const BASE_TITLE = gradeTitle();
  if(state.mode==="course"){
    const lesson = LESSONS.find(l=>l.id===state.lessonId);
    if(lesson) document.title = `${lesson.title[state.lang]} — ${BASE_TITLE}`;
  } else if(state.mode==="trainer"){
    document.title = `${UI[state.lang].trainer} — ${BASE_TITLE}`;
  } else if(state.mode==="moduletest"){
    document.title = `${UI[state.lang].testKicker} — ${BASE_TITLE}`;
  }
}

/* ============================================================
   EVENTS
   ============================================================ */
const btnLangRu = document.getElementById("btn-lang-ru");
const btnLangUa = document.getElementById("btn-lang-ua");
const btnModeCourse = document.getElementById("btn-mode-course");
const btnModeTrainer = document.getElementById("btn-mode-trainer");
const mobileMenuToggle = document.getElementById("mobile-menu-toggle");

if(btnLangRu){ btnLangRu.addEventListener("click", ()=>{ state.lang="ru"; document.documentElement.lang="ru"; trainerCurrent=null; render(); }); }
if(btnLangUa){ btnLangUa.addEventListener("click", ()=>{ state.lang="ua"; document.documentElement.lang="uk"; trainerCurrent=null; render(); }); }
if(btnModeCourse){ btnModeCourse.addEventListener("click", ()=>{ state.mode="course"; render(); }); }
if(btnModeTrainer){ btnModeTrainer.addEventListener("click", ()=>{ state.mode="trainer"; state.trainerLevel=null; state.trainerTopic=null; state.trainerReview=null; render(); }); }
if(mobileMenuToggle){ mobileMenuToggle.addEventListener("click", ()=>{
  const open = document.body.classList.toggle("sidebar-open");
  const button = document.getElementById("mobile-menu-toggle");
  if(button){
    button.setAttribute("aria-expanded", String(open));
    const srOnly = button.querySelector(".sr-only");
    if(srOnly) srOnly.textContent = open ? UI[state.lang].closeMenu : UI[state.lang].openMenu;
  }
});
}

function applyTheme(theme){
  document.documentElement.setAttribute("data-theme", theme);
  const toggle = document.getElementById("btn-theme-toggle");
  toggle.textContent = theme==="dark" ? "☾" : "☀";
  toggle.title = UI[state.lang].themeToggle;
  toggle.setAttribute("aria-label", UI[state.lang].themeToggle);
  toggle.setAttribute("aria-pressed", String(theme==="dark"));
  localStorage.setItem("mc_theme", theme);
}
document.getElementById("btn-theme-toggle").addEventListener("click", ()=>{
  const cur = document.documentElement.getAttribute("data-theme")==="dark" ? "dark" : "light";
  const next = cur==="dark" ? "light" : "dark";
  applyTheme(next);
  render();
});
applyTheme(localStorage.getItem("mc_theme") || "light");

function applyGrade(grade){
  if(!GRADE_LEVELS.includes(grade)) throw new Error("Unknown grade block: " + grade);
  const gradeChanged = state.grade !== grade;
  state.grade = grade;
  if(gradeChanged && state.mode === "moduletest"){
    currentTest = null;
    testGraded = false;
  }
  document.documentElement.setAttribute("data-grade", grade);
  document.querySelectorAll(".grade-switch button").forEach(b=>{
    const active = b.dataset.grade===grade;
    b.classList.toggle("active", active);
    b.setAttribute("aria-pressed", String(active));
  });
  localStorage.setItem("mc_grade", grade);
  localStorage.setItem("mc_grade_version", GRADE_STORAGE_VERSION);
  /* Открытый урок или тест может оказаться вне нового блока — тогда
     возвращаемся к первому уроку, который в блоке есть. */
  const visible = visibleSections();
  if(!visible.some(section=>!section.locked)) return;
  const mod = ROADMAP[state.testModuleId];
  if(state.mode === "moduletest" && mod && !moduleInGrade(state.testModuleId)){
    state.mode = "course";
    currentTest = null;
  }
  if(state.mode === "course" && !lessonInGrade(state.lessonId, grade)){
    state.lessonId = null;
    navFromUi = false;
  }
  if(state.mode === "trainer" && state.trainerTopic && !topicInGrade(state.trainerTopic)){
    state.trainerTopic = null;
    trainerCurrent = null;
    state.trainerLevel = null;
  }
}
function loadSavedGrade(){
  const savedGrade = localStorage.getItem("mc_grade");
  const storageVersion = localStorage.getItem("mc_grade_version");
  const grade = storageVersion !== GRADE_STORAGE_VERSION && savedGrade === "middle"
    ? "preSenior"
    : savedGrade;
  if(grade !== savedGrade) localStorage.setItem("mc_grade", grade);
  localStorage.setItem("mc_grade_version", GRADE_STORAGE_VERSION);
  return GRADE_LEVELS.includes(grade) ? grade : "senior";
}
document.querySelectorAll(".grade-switch button").forEach(b=>{
  b.addEventListener("click", ()=>{ applyGrade(b.dataset.grade); render(); });
});
applyGrade(loadSavedGrade());

initMascot();

if("serviceWorker" in navigator){
  window.addEventListener("load", ()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
}

render();
