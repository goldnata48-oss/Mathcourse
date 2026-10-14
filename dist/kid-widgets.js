/* 2026 Наталия Кравченко. Все права защищены. Образовательный курс — «Маткурс» */
/* Детские интерактивные виджеты (1–4 класс): чистые билдеры, возвращают HTML-строку
   с inline SVG или разметкой. Без доступа к DOM — можно звать при генерации урока
   и в тестах. Анимацией/перетаскиванием занимается mount самого урока. */

var KID_WIDGETS = (function(){
  var NS = "http://www.w3.org/2000/svg";

  function esc(v){
    return String(v).replace(/[&<>"]/g, function(c){
      return ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" })[c];
    });
  }

  function wrap(inner, vb, cls){
    var box = vb || "0 0 260 260";
    var name = "kid-svg" + (cls ? " " + cls : "");
    return '<svg class="' + name + '" viewBox="' + box + '" role="img" aria-hidden="true">' + inner + "</svg>";
  }

  function polar(cx, cy, r, deg){
    var a = (deg - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }

  /* Часы: циферблат с часовой, минутной и секундной стрелками. */
  function clockFace(h, m, s){
    h = ((h % 12) + 12) % 12; m = m || 0; s = s || 0;
    var cx = 130, cy = 130;
    var parts = [];
    parts.push('<circle cx="' + cx + '" cy="' + cy + '" r="118" fill="var(--surface)" stroke="var(--ink)" stroke-width="4"/>');
    parts.push('<circle cx="' + cx + '" cy="' + cy + '" r="6" fill="var(--ink)"/>');
    for(var n = 1; n <= 12; n++){
      var p = polar(cx, cy, 96, n * 30);
      parts.push('<text x="' + p.x.toFixed(1) + '" y="' + (p.y + 7).toFixed(1) + '" text-anchor="middle" font-size="22" font-weight="700" fill="var(--ink)">' + n + "</text>");
    }
    var hourAng = (h + m / 60) * 30;
    var minAng = (m + s / 60) * 6;
    var secAng = s * 6;
    function hand(deg, len, width, color){
      var tip = polar(cx, cy, len, deg);
      return '<line x1="' + cx + '" y1="' + cy + '" x2="' + tip.x.toFixed(1) + '" y2="' + tip.y.toFixed(1) + '" stroke="' + color + '" stroke-width="' + width + '" stroke-linecap="round"/>';
    }
    parts.push(hand(hourAng, 58, 9, "var(--ink)"));
    parts.push(hand(minAng, 88, 6, "var(--accent)"));
    parts.push(hand(secAng, 100, 2.5, "var(--coral)"));
    return wrap(parts.join(""), "0 0 260 260", "kid-clock");
  }

  /* Круг долей: parts секторов, filled из них закрашены. */
  function fractionPie(filled, parts, opts){
    parts = Math.max(1, parts | 0);
    filled = Math.max(0, Math.min(parts, filled | 0));
    var cx = 130, cy = 130, r = 110;
    var out = ['<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="var(--surface)" stroke="var(--line)" stroke-width="2"/>'];
    var step = 360 / parts;
    for(var i = 0; i < parts; i++){
      if(parts === 1){
        out.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="var(--accent-soft)"/>');
        break;
      }
      var a0 = i * step, a1 = (i + 1) * step;
      var p0 = polar(cx, cy, r, a0), p1 = polar(cx, cy, r, a1);
      var large = step > 180 ? 1 : 0;
      var fill = i < filled ? "var(--accent)" : "var(--surface)";
      var opacity = i < filled ? "1" : "0.65";
      out.push('<path d="M' + cx + " " + cy + " L" + p0.x.toFixed(1) + " " + p0.y.toFixed(1) +
        " A" + r + " " + r + " 0 " + large + " 1 " + p1.x.toFixed(1) + " " + p1.y.toFixed(1) + " Z" +
        '" fill="' + fill + '" fill-opacity="' + opacity + '" stroke="var(--surface)" stroke-width="2"/>');
    }
    if(filled > 0 && filled < parts){
      out.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="var(--line)" stroke-width="2"/>');
    }
    if(opts && opts.caption){
      out.push('<text x="' + cx + '" y="' + (cy + 8) + '" text-anchor="middle" font-size="26" font-weight="800" fill="var(--ink)">' + esc(opts.caption) + "</text>");
    }
    return wrap(out.join(""), "0 0 260 260", "kid-pie");
  }

  /* Шкала-сравнение: две полосы разной длины (задачи «у кого больше»). */
  function numberBar(a, b, opts){
    a = Number(a) || 0; b = Number(b) || 0;
    var max = Math.max(a, b, 1);
    var unit = 300 / max;
    var wA = Math.max(10, a * unit), wB = Math.max(10, b * unit);
    var la = (opts && opts.labels) ? opts.labels : ["", ""];
    var out = [
      '<line x1="40" y1="20" x2="40" y2="150" stroke="var(--line)" stroke-width="2"/>',
      '<rect x="40" y="28" width="' + wA.toFixed(1) + '" height="34" rx="8" fill="var(--accent)"/>',
      '<text x="46" y="51" font-size="18" font-weight="700" fill="#fff">' + esc(la[0] || a) + "</text>",
      '<rect x="40" y="96" width="' + wB.toFixed(1) + '" height="34" rx="8" fill="var(--success)"/>',
      '<text x="46" y="119" font-size="18" font-weight="700" fill="#fff">' + esc(la[1] || b) + "</text>"
    ];
    return wrap(out.join(""), "0 0 360 170", "kid-bar");
  }

  /* Весы: сравнение двух величин (равно/больше/меньше). */
  function balanceScale(left, right){
    var diff = (Number(left) || 0) - (Number(right) || 0);
    var tilt = Math.max(-12, Math.min(12, diff * 3));
    var out = [
      '<line x1="130" y1="30" x2="' + (130 - 90) + '" y2="' + (60 + tilt).toFixed(1) + '" stroke="var(--ink)" stroke-width="3"/>',
      '<line x1="130" y1="30" x2="' + (130 + 90) + '" y2="' + (60 - tilt).toFixed(1) + '" stroke="var(--ink)" stroke-width="3"/>',
      '<line x1="130" y1="30" x2="130" y2="120" stroke="var(--ink)" stroke-width="4"/>',
      '<rect x="112" y="120" width="36" height="10" rx="4" fill="var(--ink)"/>',
      '<line x1="' + (130 - 90) + '" y1="' + (60 + tilt).toFixed(1) + '" x2="' + (130 - 90) + '" y2="' + (60 + tilt + 12).toFixed(1) + '" stroke="var(--ink)" stroke-width="2"/>',
      '<line x1="' + (130 + 90) + '" y1="' + (60 - tilt).toFixed(1) + '" x2="' + (130 + 90) + '" y2="' + (60 - tilt + 12).toFixed(1) + '" stroke="var(--ink)" stroke-width="2"/>',
      '<ellipse cx="' + (130 - 90) + '" cy="' + (72 + tilt).toFixed(1) + '" rx="42" ry="10" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>',
      '<ellipse cx="' + (130 + 90) + '" cy="' + (72 - tilt).toFixed(1) + '" rx="42" ry="10" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>',
      '<text x="' + (130 - 90) + '" y="' + (76 + tilt).toFixed(1) + '" text-anchor="middle" font-size="18" font-weight="800" fill="var(--ink)">' + esc(left) + "</text>",
      '<text x="' + (130 + 90) + '" y="' + (76 - tilt).toFixed(1) + '" text-anchor="middle" font-size="18" font-weight="800" fill="var(--ink)">' + esc(right) + "</text>"
    ];
    return wrap(out.join(""), "0 0 260 150", "kid-balance");
  }

  /* Рамка «десять»: 2 ряда по 5, заполнено count клеток. */
  function tenFrame(count){
    count = Math.max(0, Math.min(10, count | 0));
    var cells = [], size = 44, gap = 6, ox = 8, oy = 8;
    for(var i = 0; i < 10; i++){
      var col = i % 5, row = (i / 5) | 0;
      var x = ox + col * (size + gap), y = oy + row * (size + gap);
      cells.push('<rect x="' + x + '" y="' + y + '" width="' + size + '" height="' + size + '" rx="8" fill="var(--surface)" stroke="var(--line)" stroke-width="2"/>');
      if(i < count) cells.push('<circle cx="' + (x + size / 2) + '" cy="' + (y + size / 2) + '" r="14" fill="var(--accent)"/>');
    }
    return wrap(cells.join(""), "0 0 258 116", "kid-tenframe");
  }

  /* Блоки разрядов: сотни, десятки, единицы. */
  function baseTen(hundreds, tens, ones){
    hundreds = Math.max(0, hundreds | 0); tens = Math.max(0, tens | 0); ones = Math.max(0, ones | 0);
    var out = [];
    for(var h = 0; h < hundreds; h++){
      var hx = 8 + h * 62;
      out.push('<rect x="' + hx + '" y="30" width="54" height="54" rx="4" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>');
      for(var i = 1; i < 10; i++) out.push('<line x1="' + (hx + i * 5.4).toFixed(1) + '" y1="30" x2="' + (hx + i * 5.4).toFixed(1) + '" y2="84" stroke="var(--accent)" stroke-width="0.6" opacity="0.5"/>');
      for(var j = 1; j < 10; j++) out.push('<line x1="' + hx + '" y1="' + (30 + j * 5.4).toFixed(1) + '" x2="' + (hx + 54) + '" y2="' + (30 + j * 5.4).toFixed(1) + '" stroke="var(--accent)" stroke-width="0.6" opacity="0.5"/>');
    }
    var tx = 8 + hundreds * 62;
    for(var t = 0; t < tens; t++){
      out.push('<rect x="' + (tx + t * 16) + '" y="30" width="9" height="54" rx="3" fill="var(--success-soft)" stroke="var(--success)" stroke-width="2"/>');
      for(var k = 1; k < 10; k++) out.push('<line x1="' + (tx + t * 16) + '" y1="' + (30 + k * 5.4).toFixed(1) + '" x2="' + (tx + t * 16 + 9) + '" y2="' + (30 + k * 5.4).toFixed(1) + '" stroke="var(--success)" stroke-width="0.6" opacity="0.5"/>');
    }
    var ox = tx + tens * 16 + (tens ? 8 : 0);
    for(var o = 0; o < ones; o++){
      var c = o % 10, r = (o / 10) | 0;
      out.push('<circle cx="' + (ox + 5 + c * 13) + '" cy="' + (36 + r * 13) + '" r="5" fill="var(--coral)"/>');
    }
    return wrap(out.join(""), "0 0 360 100", "kid-baseten");
  }

  /* Таблица разрядов для числа. */
  function placeValueTable(value, lang){
    var v = Math.max(0, Number(value) || 0);
    var s = String(v);
    var labels = (lang === "ua")
      ? ["Сотні", "Десятки", "Одиниці"]
      : ["Сотни", "Десятки", "Единицы"];
    while(s.length < 3) s = "0" + s;
    var head = labels.map(function(l){ return "<th>" + esc(l) + "</th>"; }).join("");
    var cells = s.split("").map(function(d){ return "<td>" + esc(d) + "</td>"; }).join("");
    return '<table class="kid-table kid-place"><thead><tr>' + head + "</tr></thead><tbody><tr>" + cells + "</tr></tbody></table>";
  }

  function padTo(s, n){ while(s.length < n) s = " " + s; return s; }

  /* Сложение столбиком. */
  function columnAdd(a, b){
    var x = String(Math.max(0, Number(a) || 0)), y = String(Math.max(0, Number(b) || 0));
    var w = Math.max(x.length, y.length); x = padTo(x, w); y = padTo(y, w);
    var sum = String((Number(a) || 0) + (Number(b) || 0));
    return '<div class="kid-column" role="img" aria-hidden="true">' +
      '<div class="kid-col-row">' + splitCells(x, "sign-gap") + "</div>" +
      '<div class="kid-col-row">+' + splitCells(y, "") + "</div>" +
      '<div class="kid-col-line"></div>' +
      '<div class="kid-col-row kid-col-total">' + splitCells(resultPad(sum, w + 1, x, y, "+"), "") + "</div></div>";
  }

  /* Вычитание столбиком. */
  function columnSub(a, b){
    var x = String(Math.max(0, Number(a) || 0)), y = String(Math.max(0, Number(b) || 0));
    var w = Math.max(x.length, y.length); x = padTo(x, w); y = padTo(y, w);
    var diff = String((Number(a) || 0) - (Number(b) || 0));
    return '<div class="kid-column" role="img" aria-hidden="true">' +
      '<div class="kid-col-row">' + splitCells(x, "sign-gap") + "</div>" +
      '<div class="kid-col-row">−' + splitCells(y, "") + "</div>" +
      '<div class="kid-col-line"></div>' +
      '<div class="kid-col-row kid-col-total">' + splitCells(resultPad(diff, w, x, y, "−"), "") + "</div></div>";
  }

  function resultPad(res, w, x, y, op){
    var need = Math.max(String(x).length, String(y).length) + (op === "+" && res.length > w ? 1 : 0);
    return padTo(res, need);
  }

  function splitCells(s, extra){
    return s.split("").map(function(ch){
      var cls = "kid-col-cell" + (ch === " " ? " kid-col-blank" : "");
      return '<span class="' + cls + '">' + (ch === " " ? "&nbsp;" : esc(ch)) + "</span>";
    }).join("");
  }

  /* Таблица умножения n×n. */
  function mulTable(n){
    n = Math.max(1, Math.min(12, n | 0));
    var head = '<tr><th>×</th>';
    for(var c = 1; c <= n; c++) head += "<th>" + c + "</th>";
    head += "</tr>";
    var body = "";
    for(var r = 1; r <= n; r++){
      body += "<tr><th>" + r + "</th>";
      for(var c2 = 1; c2 <= n; c2++) body += "<td>" + (r * c2) + "</td>";
      body += "</tr>";
    }
    return '<table class="kid-table kid-mul">' + head + body + "</table>";
  }

  /* Числовая прямая с делениями from..to. */
  function numberLine(from, to){
    from = Number(from) || 0; to = Number(to) || 10;
    if(to < from){ var t = from; from = to; to = t; }
    var count = to - from, w = 320, ox = 20, y = 40;
    var out = ['<line x1="' + ox + '" y1="' + y + '" x2="' + (ox + w) + '" y2="' + y + '" stroke="var(--ink)" stroke-width="3"/>'];
    for(var i = 0; i <= count; i++){
      var x = ox + (w * i / count);
      out.push('<line x1="' + x.toFixed(1) + '" y1="' + (y - 7) + '" x2="' + x.toFixed(1) + '" y2="' + (y + 7) + '" stroke="var(--ink)" stroke-width="2"/>');
      if(count <= 12) out.push('<text x="' + x.toFixed(1) + '" y="' + (y + 26) + '" text-anchor="middle" font-size="15" fill="var(--ink)">' + (from + i) + "</text>");
    }
    return wrap(out.join(""), "0 0 360 80", "kid-numberline");
  }

  /* Базовая фигура: triangle | square | rect | circle | segment. */
  function shape(kind, opts){
    opts = opts || {};
    var label = opts.label ? '<text x="130" y="200" text-anchor="middle" font-size="18" font-weight="700" fill="var(--ink)">' + esc(opts.label) + "</text>" : "";
    var body;
    if(kind === "triangle") body = '<polygon points="130,40 210,180 50,180" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="3"/>';
    else if(kind === "square") body = '<rect x="70" y="60" width="120" height="120" rx="4" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="3"/>';
    else if(kind === "rect") body = '<rect x="50" y="80" width="160" height="90" rx="4" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="3"/>';
    else if(kind === "circle") body = '<circle cx="130" cy="120" r="80" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="3"/>';
    else body = '<line x1="50" y1="120" x2="210" y2="120" stroke="var(--accent)" stroke-width="4" stroke-linecap="round"/>';
    return wrap(body + label, "0 0 260 220", "kid-shape");
  }

  /* Деление на группы: total предметов в parts ящиков поровну. */
  function groups(total, parts){
    total = Math.max(0, Math.min(60, total | 0));
    parts = Math.max(1, Math.min(10, parts | 0));
    var per = Math.floor(total / parts), rem = total % parts;
    var out = [];
    for(var g = 0; g < parts; g++){
      var gx = 10 + (g % 5) * 70;
      var gy = 16 + Math.floor(g / 5) * 96;
      out.push('<rect x="' + gx + '" y="' + gy + '" width="58" height="72" rx="10" fill="var(--surface)" stroke="var(--accent)" stroke-width="2"/>');
      var count = per + (g < rem ? 1 : 0);
      for(var i = 0; i < count && i < 20; i++){
        var cx = gx + 12 + (i % 4) * 11;
        var cy = gy + 16 + Math.floor(i / 4) * 13;
        out.push('<circle cx="' + cx + '" cy="' + cy + '" r="4.5" fill="var(--accent)"/>');
      }
    }
    return wrap(out.join(""), "0 0 360 208", "kid-groups");
  }

  /* Полоска бумаги с разрезами (задачи-загадки). */
  function cutStrip(parts){
    parts = Math.max(2, Math.min(10, parts | 0));
    var x = 20, y = 50, w = 320, h = 44, out = [];
    out.push('<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="6" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>');
    for(var i = 1; i < parts; i++){
      var cx = x + w * i / parts;
      out.push('<line x1="' + cx.toFixed(1) + '" y1="' + (y - 8) + '" x2="' + cx.toFixed(1) + '" y2="' + (y + h + 8) + '" stroke="var(--coral)" stroke-width="3" stroke-dasharray="5 4"/>');
    }
    return wrap(out.join(""), "0 0 360 150", "kid-strip");
  }

  /* Линейка: 0..maxCm с делениями; seg — подсвеченный отрезок от нуля. */
  function ruler(maxCm, seg){
    maxCm = Math.max(1, Math.min(30, maxCm | 0));
    seg = Math.max(0, Math.min(maxCm, (seg || 0) | 0));
    var x0 = 20, y = 64, w = 320, h = 28, sx = w / maxCm, out = [];
    out.push('<rect x="' + x0 + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="4" fill="var(--surface)" stroke="var(--line)" stroke-width="2"/>');
    for(var i = 0; i <= maxCm; i++){
      var tx = x0 + i * sx;
      var tall = (i % 5 === 0) || maxCm <= 10;
      out.push('<line x1="' + tx.toFixed(1) + '" y1="' + y + '" x2="' + tx.toFixed(1) + '" y2="' + (y + (tall ? h * 0.6 : h * 0.35)).toFixed(1) + '" stroke="var(--ink)" stroke-width="' + (tall ? 2 : 1) + '"/>');
      if(tall && i > 0) out.push('<text x="' + tx.toFixed(1) + '" y="' + (y + h + 18) + '" text-anchor="middle" font-size="13" fill="var(--ink-soft)">' + i + "</text>");
    }
    if(seg > 0){
      out.push('<rect x="' + x0 + '" y="26" width="' + (seg * sx).toFixed(1) + '" height="24" rx="6" fill="var(--accent)"/>');
      out.push('<text x="' + (x0 + seg * sx / 2).toFixed(1) + '" y="43" text-anchor="middle" font-size="16" font-weight="700" fill="#fff">' + seg + " см</text>");
    }
    return wrap(out.join(""), "0 0 360 112", "kid-ruler");
  }

  /* Монеты: список номиналов в гривнах. */
  function coins(list){
    list = (list || []).slice(0, 10);
    var out = [], r = 30, y = 70;
    for(var i = 0; i < list.length; i++){
      var cx = 34 + i * (2 * r + 12);
      out.push('<circle cx="' + cx + '" cy="' + y + '" r="' + r + '" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="3"/>');
      out.push('<text x="' + cx + '" y="' + (y + 9) + '" text-anchor="middle" font-size="24" font-weight="800" fill="var(--accent)">' + esc(list[i]) + "</text>");
    }
    return wrap(out.join(""), "0 0 " + Math.max(220, list.length * 72 + 40) + " 140", "kid-coins");
  }

  /* Сетка площади: w на h единичных квадратов. */
  function rectGrid(w, h){
    w = Math.max(1, Math.min(12, w | 0)); h = Math.max(1, Math.min(12, h | 0));
    var cell = 28, x0 = 20, y0 = 20, out = [];
    out.push('<rect x="' + x0 + '" y="' + y0 + '" width="' + (w * cell) + '" height="' + (h * cell) + '" fill="var(--surface)" stroke="var(--ink)" stroke-width="3"/>');
    for(var i = 1; i < w; i++) out.push('<line x1="' + (x0 + i * cell) + '" y1="' + y0 + '" x2="' + (x0 + i * cell) + '" y2="' + (y0 + h * cell) + '" stroke="var(--line)" stroke-width="1"/>');
    for(var j = 1; j < h; j++) out.push('<line x1="' + x0 + '" y1="' + (y0 + j * cell) + '" x2="' + (x0 + w * cell) + '" y2="' + (y0 + j * cell) + '" stroke="var(--line)" stroke-width="1"/>');
    for(var a = 0; a < w; a++) for(var b = 0; b < h; b++){
      out.push('<circle cx="' + (x0 + a * cell + cell / 2) + '" cy="' + (y0 + b * cell + cell / 2) + '" r="3" fill="var(--accent)"/>');
    }
    return wrap(out.join(""), "0 0 " + (w * cell + 40) + " " + (h * cell + 40), "kid-grid");
  }

  /* Симметрия: фигура слева и её отражение справа от пунктирной оси. */
  function symmetry(){
    var shape = '<rect x="60" y="92" width="60" height="70" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="3"/>' +
      '<polygon points="60,92 90,52 120,92" fill="var(--accent)" fill-opacity="0.8"/>';
    var out = [];
    out.push('<line x1="140" y1="30" x2="140" y2="182" stroke="var(--line)" stroke-width="3" stroke-dasharray="6 5"/>');
    out.push("<g>" + shape + "</g>");
    out.push('<g transform="translate(280,0) scale(-1,1)" opacity="0.65">' + shape + "</g>");
    return wrap(out.join(""), "0 0 280 200", "kid-sym");
  }

  /* Таблица классов: число разбито по три разряда (классы единиц, тысяч, …). */
  function classTable(value, lang){
    var v = String(Math.max(0, Math.floor(Number(value) || 0)));
    var groups = [];
    for(var end = v.length; end > 0; end -= 3) groups.unshift(v.slice(Math.max(0, end - 3), end));
    var names = (lang === "ua")
      ? ["Мільярдів", "Мільйонів", "Тисяч", "Одиниць"]
      : ["Миллиардов", "Миллионов", "Тысяч", "Единиц"];
    var places = (lang === "ua") ? ["Сотні", "Десятки", "Одиниці"] : ["Сотни", "Десятки", "Единицы"];
    var head1 = "", head2 = "", body = "";
    for(var gi = 0; gi < groups.length; gi++){
      var name = names[names.length - groups.length + gi];
      if(!name) name = (lang === "ua") ? "Старших" : "Старших";
      head1 += '<th colspan="3">' + esc(name) + "</th>";
      for(var p = 0; p < places.length; p++) head2 += "<th>" + esc(places[p]) + "</th>";
      var s = groups[gi];
      while(s.length < 3) s = "0" + s;
      for(var d = 0; d < s.length; d++) body += "<td>" + esc(s[d]) + "</td>";
    }
    return '<table class="kid-table kid-classes"><thead><tr>' + head1 + '</tr><tr>' + head2 +
      "</tr></thead><tbody><tr>" + body + "</tr></tbody></table>";
  }

  /* Таблица единиц длины (км…мм) с соотношениями. */
  function unitLadder(lang){
    var words = (lang === "ua")
      ? ["кілометр", "метр", "дециметр", "сантиметр", "міліметр"]
      : ["километр", "метр", "дециметр", "сантиметр", "миллиметр"];
    var abbr = ["км", "м", "дм", "см", "мм"];
    var head = "", body = "";
    for(var i = 0; i < abbr.length; i++){
      head += "<th>" + esc(abbr[i]) + "</th>";
      body += "<td>" + esc(words[i]) + "</td>";
    }
    var conv = (lang === "ua")
      ? "1 км = 1000 м · 1 м = 10 дм = 100 см = 1000 мм · 1 дм = 10 см · 1 см = 10 мм"
      : "1 км = 1000 м · 1 м = 10 дм = 100 см = 1000 мм · 1 дм = 10 см · 1 см = 10 мм";
    return '<table class="kid-table kid-units"><thead><tr>' + head + "</tr></thead><tbody><tr>" +
      body + '</tr><tr><td class="kid-units-note" colspan="5">' + esc(conv) + "</td></tr></tbody></table>";
  }

  /* Диаграмма движения: kind = toward | apart | chase. */
  function motionDiagram(kind, lang){
    var y = 66, x0 = 40, x1 = 320, out = [];
    function arrow(x1a, x2a, yy, color){
      var size = 10, ang = Math.atan2(0, x2a - x1a);
      var p2x = x2a - size * Math.cos(ang - Math.PI / 6), p2y = yy - size * Math.sin(ang - Math.PI / 6);
      var p3x = x2a - size * Math.cos(ang + Math.PI / 6), p3y = yy - size * Math.sin(ang + Math.PI / 6);
      return '<line x1="' + x1a + '" y1="' + yy + '" x2="' + x2a + '" y2="' + yy + '" stroke="' + color + '" stroke-width="3"/>' +
        '<polygon points="' + x2a + "," + yy + " " + p2x.toFixed(1) + "," + p2y.toFixed(1) + " " + p3x.toFixed(1) + "," + p3y.toFixed(1) + '" fill="' + color + '"/>';
    }
    out.push('<line x1="20" y1="' + y + '" x2="340" y2="' + y + '" stroke="var(--line)" stroke-width="4"/>');
    out.push('<circle cx="' + x0 + '" cy="' + y + '" r="13" fill="var(--accent)"/>');
    out.push('<circle cx="' + x1 + '" cy="' + y + '" r="13" fill="var(--coral)"/>');
    if(kind === "toward"){
      out.push(arrow(x0 + 20, 168, y - 30, "var(--accent)"));
      out.push(arrow(x1 - 20, 192, y - 30, "var(--coral)"));
    } else if(kind === "apart"){
      out.push(arrow(x0 - 20, 12, y - 30, "var(--accent)"));
      out.push(arrow(x1 + 20, 348, y - 30, "var(--coral)"));
    } else {
      out.push(arrow(x0 + 20, 150, y - 30, "var(--accent)"));
      out.push(arrow(190, 320 + 20 - 20, y - 30, "var(--coral)"));
    }
    var caps = {
      toward: { ru: "навстречу", ua: "назустріч" },
      apart: { ru: "в противоположных направлениях", ua: "у протилежних напрямках" },
      chase: { ru: "вдогонку", ua: "навздогін" }
    };
    var cap = caps[kind] || caps.toward;
    out.push('<text x="180" y="106" text-anchor="middle" font-size="15" fill="var(--ink-soft)">' + esc(cap[lang] || cap.ru) + "</text>");
    return wrap(out.join(""), "0 0 360 120", "kid-motion");
  }

  /* Детерминированный генератор для меняющихся чисел: rng(seed) -> () => [0,1). */
  function rng(seed){
    var a = (seed >>> 0) || 1;
    return function(){
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function rngInt(next, lo, hi){ return lo + Math.floor(next() * (hi - lo + 1)); }

  return {
    clockFace: clockFace,
    fractionPie: fractionPie,
    numberBar: numberBar,
    balanceScale: balanceScale,
    tenFrame: tenFrame,
    baseTen: baseTen,
    placeValueTable: placeValueTable,
    columnAdd: columnAdd,
    columnSub: columnSub,
    mulTable: mulTable,
    numberLine: numberLine,
    shape: shape,
    groups: groups,
    cutStrip: cutStrip,
    ruler: ruler,
    coins: coins,
    rectGrid: rectGrid,
    symmetry: symmetry,
    classTable: classTable,
    unitLadder: unitLadder,
    motionDiagram: motionDiagram,
    rng: rng,
    rngInt: rngInt,
    esc: esc
  };
})();
