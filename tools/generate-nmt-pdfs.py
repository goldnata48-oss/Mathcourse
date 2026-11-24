from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak


ROOT = r"C:\Users\beata\Chimera\Roza\Mathcourse"
pdfmetrics.registerFont(TTFont("NMT", r"C:\Windows\Fonts\arial.ttf"))
pdfmetrics.registerFont(TTFont("NMT-Bold", r"C:\Windows\Fonts\arialbd.ttf"))

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="NMTTitle", fontName="NMT-Bold", fontSize=14, leading=17, textColor=colors.HexColor("#172033"), alignment=TA_CENTER, spaceAfter=5))
styles.add(ParagraphStyle(name="NMTHead", fontName="NMT-Bold", fontSize=9, leading=11, textColor=colors.HexColor("#1f5f8b"), spaceBefore=2, spaceAfter=2))
styles.add(ParagraphStyle(name="NMTText", fontName="NMT", fontSize=7.2, leading=9.2, textColor=colors.HexColor("#172033")))
styles.add(ParagraphStyle(name="NMTSmall", fontName="NMT", fontSize=6.3, leading=7.8, textColor=colors.HexColor("#172033")))


def p(text, small=False):
    return Paragraph(text, styles["NMTSmall" if small else "NMTText"])


def section(title, cards):
    elements = [Paragraph(title, styles["NMTHead"]), Spacer(1, 1)]
    rows = []
    for i in range(0, len(cards), 2):
        left = cards[i]
        right = cards[i + 1] if i + 1 < len(cards) else ("", [])
        row = [
            [Paragraph(left[0], styles["NMTHead"])] + [p(x, True) for x in left[1]],
            [Paragraph(right[0], styles["NMTHead"])] + [p(x, True) for x in right[1]] if right[0] else "",
        ]
        rows.append(row)
    table = Table(rows, colWidths=[86*mm, 86*mm], hAlign="LEFT")
    table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#cbd7e6")),
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    elements.append(table)
    return elements


def build(path, ua):
    title = "Довідник формул НМТ" if ua else "Справочник формул НМТ"
    doc = SimpleDocTemplate(path, pagesize=A4, rightMargin=10*mm, leftMargin=10*mm, topMargin=12*mm, bottomMargin=12*mm, title=title)
    story = [Paragraph(title, styles["NMTTitle"]), Spacer(1, 3)]

    if ua:
        story += section("1. Алгебра і початки аналізу", [
            ("Формули скороченого множення", [
                "(a ± b)² = a² ± 2ab + b²",
                "a² − b² = (a − b)(a + b)",
                "(a ± b)³ = a³ ± 3a²b + 3ab² ± b³",
                "a³ ± b³ = (a ± b)(a² ∓ ab + b²)",
            ]),
            ("Квадратне рівняння", [
                "ax² + bx + c = 0, D = b² − 4ac",
                "x₁,₂ = (−b ± √D)/(2a)",
                "D > 0: 2 корені; D = 0: 1 корінь; D < 0: дійсних коренів немає",
                "ax² + bx + c = a(x − x₁)(x − x₂)",
                "x₁ + x₂ = −b/a; x₁x₂ = c/a",
            ]),
            ("Степені й корені", [
                "aᵐaⁿ = aᵐ⁺ⁿ; aᵐ/aⁿ = aᵐ⁻ⁿ",
                "(aᵐ)ⁿ = aᵐⁿ; (ab)ⁿ = aⁿbⁿ",
                "a⁻ⁿ = 1/aⁿ; aᵐ⁄ⁿ = ⁿ√(aᵐ)",
                "ⁿ√(ab) = ⁿ√a·ⁿ√b; ⁿ√(a/b) = ⁿ√a/ⁿ√b",
                "√(a²) = |a|",
            ]),
            ("Логарифми й показникові вирази", [
                "logₐb = x ⇔ aˣ = b",
                "logₐ(bc)=logₐb+logₐc",
                "logₐ(b/c)=logₐb−logₐc",
                "logₐ(bᵏ)=k logₐb",
                "logₐb=logc b/logc a",
                "a^{logₐb}=b; logₐ(aˣ)=x",
            ]),
            ("Прогресії", [
                "Арифметична: aₙ=a₁+(n−1)d",
                "Sₙ=(a₁+aₙ)n/2=(2a₁+(n−1)d)n/2",
                "aₙ=(aₙ₋₁+aₙ₊₁)/2",
                "Геометрична: bₙ=b₁qⁿ⁻¹",
                "Sₙ=b₁(qⁿ−1)/(q−1)",
                "|q|<1: S=b₁/(1−q)",
            ]),
            ("Комбінаторика й ймовірність", [
                "Pₙ=n!; Aₙᵐ=n!/(n−m)!",
                "Cₙᵐ=n!/(m!(n−m)!); Cₙᵐ=Cₙⁿ⁻ᵐ",
                "P(A)=m/n; P(Ā)=1−P(A)",
                "P(A∪B)=P(A)+P(B)−P(A∩B)",
                "Несумісні: P(A∪B)=P(A)+P(B)",
                "Незалежні: P(A∩B)=P(A)P(B)",
            ]),
        ])
        story.append(PageBreak())
        story += section("1. Похідні й первісні", [
            ("Похідні", [
                "(C)′=0; (x)′=1; (xⁿ)′=nxⁿ⁻¹",
                "(eˣ)′=eˣ; (aˣ)′=aˣ ln a",
                "(ln x)′=1/x; (logₐx)′=1/(x ln a)",
                "(sin x)′=cos x; (cos x)′=−sin x",
                "(tg x)′=1/cos²x; (ctg x)′=−1/sin²x",
                "(arcsin x)′=1/√(1−x²); (arccos x)′=−1/√(1−x²)",
                "(arctg x)′=1/(1+x²); (arcctg x)′=−1/(1+x²)",
            ]),
            ("Правила диференціювання", [
                "(Cu)′=Cu′",
                "(u±v)′=u′±v′",
                "(uv)′=u′v+uv′",
                "(u/v)′=(u′v−uv′)/v²",
                "(u(v))′=u′(v)·v′",
            ]),
            ("Первісні", [
                "∫0dx=C; ∫dx=x+C",
                "∫xⁿdx=xⁿ⁺¹/(n+1)+C, n≠−1",
                "∫dx/x=ln|x|+C",
                "∫eˣdx=eˣ+C; ∫aˣdx=aˣ/ln a+C",
                "∫sin xdx=−cos x+C; ∫cos xdx=sin x+C",
                "∫dx/cos²x=tg x+C; ∫dx/sin²x=−ctg x+C",
            ]),
            ("Визначений інтеграл", [
                "∫ₐᵇf(x)dx=F(b)−F(a)",
                "∫ₐᵃf(x)dx=0",
                "∫ₐᵇf dx=−∫ᵇₐf dx",
                "∫ₐᵇf dx=∫ₐᶜf dx+∫ᶜᵇf dx",
                "S=∫ₐᵇf(x)dx, якщо f(x)≥0",
            ]),
        ])
        story.append(PageBreak())
        story += section("2. Тригонометрія", [
            ("Тотожності", [
                "sin²α+cos²α=1",
                "tgα=sinα/cosα; ctgα=cosα/sinα",
                "tgα·ctgα=1",
                "1+tg²α=1/cos²α",
                "1+ctg²α=1/sin²α",
            ]),
            ("Сума і різниця", [
                "sin(α±β)=sinαcosβ±cosαsinβ",
                "cos(α±β)=cosαcosβ∓sinαsinβ",
                "tg(α±β)=(tgα±tgβ)/(1∓tgαtgβ)",
                "sin2α=2sinαcosα",
                "cos2α=cos²α−sin²α=2cos²α−1=1−2sin²α",
                "tg2α=2tgα/(1−tg²α)",
            ]),
            ("Приведення", [
                "sin(π/2−α)=cosα; cos(π/2−α)=sinα",
                "tg(π/2−α)=ctgα; ctg(π/2−α)=tgα",
                "sin(π−α)=sinα; cos(π−α)=−cosα",
                "sin(π+α)=−sinα; cos(π+α)=−cosα",
            ]),
            ("Знаки за чвертями", [
                "I: sin+, cos+, tg+, ctg+",
                "II: sin+, cos−, tg−, ctg−",
                "III: sin−, cos−, tg+, ctg+",
                "IV: sin−, cos+, tg−, ctg−",
            ]),
            ("Обратні функції", [
                "arcsin 1/2=π/6; arcsin √2/2=π/4",
                "arcsin √3/2=π/3; arcsin1=π/2",
                "arccos √3/2=π/6; arccos √2/2=π/4",
                "arccos1/2=π/3; arccos0=π/2",
                "arctg √3/3=π/6; arctg1=π/4; arctg√3=π/3",
            ]),
            ("Таблиця кутів", [
                "0°: sin0/cos1/tg0/ctg—",
                "30°: 1/2/√3/2/√3/3/√3",
                "45°: √2/2/√2/2/1/1",
                "60°: √3/2/1/2/√3/√3/3",
                "90°: 1/0/—/0",
                "180°: 0/−1/0/—",
                "270°: −1/0/—/0",
            ]),
        ])
        story.append(PageBreak())
        story += section("2. Квадрати й корені", [
            ("Квадрати 1–25", [
                " 1→1  2→4  3→9  4→16  5→25",
                " 6→36  7→49  8→64  9→81 10→100",
                "11→121 12→144 13→169 14→196 15→225",
                "16→256 17→289 18→324 19→361 20→400",
                "21→441 22→484 23→529 24→576 25→625",
            ]),
            ("Основні корені", [
                "√2≈1,414; √3≈1,732; √5≈2,236",
                "√6≈2,449; √7≈2,646; √10≈3,162",
                "√11≈3,317; √13≈3,606; √15≈3,873",
                "√17≈4,123; √19≈4,359; √20≈4,472",
                "³√8=2; ³√27=3; ³√64=4; ³√125=5",
            ]),
        ])
        story.append(PageBreak())
        story += section("3. Геометрія — трикутники", [
            ("Довільний трикутник", [
                "S=ahₐ/2=½ab sin C=pr=abc/(4R)",
                "S=√[p(p−a)(p−b)(p−c)], p=(a+b+c)/2",
                "a/sin A=b/sin B=c/sin C=2R",
                "c²=a²+b²−2ab cos C",
            ]),
            ("Прямокутний трикутник", [
                "C=90°: c²=a²+b²",
                "sin A=a/c; cos A=b/c; tg A=a/b; ctg A=b/a",
                "h²=pq; a²=cp; b²=cq",
                "h=ab/c; r=(a+b−c)/2; R=c/2",
                "α+β=90°; m_c=c/2",
                "Катет проти 30° дорівнює c/2",
            ]),
            ("Рівносторонній трикутник", [
                "h=a√3/2; S=a²√3/4",
                "r=a√3/6; R=a√3/3",
                "R=2r",
            ]),
        ])
        story.append(PageBreak())
        story += section("3. Геометрія — чотирикутники й многокутники", [
            ("Паралелограм і прямокутник", [
                "P=2(a+b); S=ah=ab sin α",
                "S=½d₁d₂ sin φ",
                "Прямокутник: d=√(a²+b²); S=ab",
            ]),
            ("Ромб і квадрат", [
                "Ромб: P=4a; S=ah=½d₁d₂=a² sin α",
                "Квадрат: P=4a; S=a²=d²/2",
                "d=a√2; r=a/2; R=a√2/2",
            ]),
            ("Трапеція", [
                "P=a+b+c+d",
                "m=(a+b)/2; S=(a+b)h/2=mh",
            ]),
            ("Правильний n-кутник", [
                "αₙ=(n−2)·180°/n",
                "Rₙ=a/(2sin(π/n)); rₙ=a/(2tg(π/n))",
                "S=nRₙ²sin(2π/n)/2=narₙ/2",
                "n=3: R=a/√3, r=a√3/6",
                "n=4: R=a√2/2, r=a/2",
                "n=6: R=a, r=a√3/2",
            ]),
        ])
        story.append(PageBreak())
        story += section("3. Коло, стереометрія й вектори", [
            ("Коло й круг", [
                "C=2πR=πd; l=Rφ",
                "S=πR²=πd²/4",
                "S_сект=R²φ/2=πR²α/360°",
                "(x−x₀)²+(y−y₀)²=R²",
            ]),
            ("Пряма призма й паралелепіпед", [
                "Призма: Sб=Pоснl; Sп=Sб+2Sосн; V=Sоснh",
                "Куб: Sп=6a²; V=a³; d=a√3",
                "Паралелепіпед: Sп=2(ab+bc+ac)",
                "V=abc; d=√(a²+b²+c²)",
            ]),
            ("Піраміда, циліндр, конус", [
                "Піраміда: V=Sоснh/3",
                "Циліндр: Sб=2πRh; Sп=2πR(R+h); V=πR²h",
                "Конус: l²=R²+h²; Sб=πRl",
                "Sп=πR(R+l); V=πR²h/3",
            ]),
            ("Куля і сфера", [
                "S сфери=4πR²",
                "V кулі=4πR³/3",
            ]),
            ("Координати й вектори", [
                "AB⃗=(x₂−x₁;y₂−y₁;z₂−z₁)",
                "|AB|=√[(x₂−x₁)²+(y₂−y₁)²+(z₂−z₁)²]",
                "|a⃗|=√(a₁²+a₂²+a₃²)",
                "a⃗·b⃗=a₁b₁+a₂b₂+a₃b₃=|a⃗||b⃗|cosφ",
                "cosφ=a⃗·b⃗/(|a⃗||b⃗|)",
            ]),
            ("Середина й перпендикулярність", [
                "M=((x₁+x₂)/2;(y₁+y₂)/2;(z₁+z₂)/2)",
                "a⃗⊥b⃗ ⇔ a⃗·b⃗=0",
            ]),
        ])
    else:
        story += section("1. Алгебра и начала анализа", [
            ("Формулы сокращённого умножения", ["(a ± b)² = a² ± 2ab + b²", "a² − b² = (a − b)(a + b)", "(a ± b)³ = a³ ± 3a²b + 3ab² ± b³", "a³ ± b³ = (a ± b)(a² ∓ ab + b²)"]),
            ("Квадратное уравнение", ["ax² + bx + c = 0, D = b² − 4ac", "x₁,₂ = (−b ± √D)/(2a)", "ax² + bx + c = a(x − x₁)(x − x₂)", "x₁ + x₂ = −b/a; x₁x₂ = c/a"]),
            ("Степени и корни", ["aᵐaⁿ=aᵐ⁺ⁿ; aᵐ/aⁿ=aᵐ⁻ⁿ", "(aᵐ)ⁿ=aᵐⁿ; a⁻ⁿ=1/aⁿ", "aᵐ⁄ⁿ=ⁿ√(aᵐ)", "ⁿ√(ab)=ⁿ√a·ⁿ√b", "√(a²)=|a|"]),
            ("Логарифмы", ["logₐb=x ⇔ aˣ=b", "logₐ(bc)=logₐb+logₐc", "logₐ(b/c)=logₐb−logₐc", "logₐ(bᵏ)=klogₐb", "logₐb=logc b/logc a", "a^{logₐb}=b"]),
            ("Прогрессии", ["aₙ=a₁+(n−1)d", "Sₙ=(a₁+aₙ)n/2", "bₙ=b₁qⁿ⁻¹", "Sₙ=b₁(qⁿ−1)/(q−1)", "|q|<1: S=b₁/(1−q)"]),
            ("Комбинаторика и вероятность", ["Pₙ=n!; Aₙᵐ=n!/(n−m)!", "Cₙᵐ=n!/(m!(n−m)!); Cₙᵐ=Cₙⁿ⁻ᵐ", "P(A)=m/n; P(Ā)=1−P(A)", "P(A∪B)=P(A)+P(B)−P(A∩B)", "Независимые: P(A∩B)=P(A)P(B)"]),
        ])
        story.append(PageBreak())
        story += section("1. Производные и интегралы", [
            ("Производные", ["(xⁿ)′=nxⁿ⁻¹", "(eˣ)′=eˣ; (aˣ)′=aˣ ln a", "(ln x)′=1/x; (logₐx)′=1/(x ln a)", "(sin x)′=cos x; (cos x)′=−sin x", "(tg x)′=1/cos²x; (ctg x)′=−1/sin²x"]),
            ("Правила", ["(Cu)′=Cu′", "(u±v)′=u′±v′", "(uv)′=u′v+uv′", "(u/v)′=(u′v−uv′)/v²", "(u(v))′=u′(v)·v′"]),
            ("Первообразные", ["∫xⁿdx=xⁿ⁺¹/(n+1)+C", "∫dx/x=ln|x|+C", "∫eˣdx=eˣ+C", "∫sin xdx=−cos x+C", "∫cos xdx=sin x+C", "∫dx/cos²x=tg x+C"]),
            ("Определённый интеграл", ["∫ₐᵇf(x)dx=F(b)−F(a)", "S=∫ₐᵇf(x)dx при f(x)≥0"]),
        ])
        story.append(PageBreak())
        story += section("2. Тригонометрия", [
            ("Тождества", ["sin²α+cos²α=1", "tgα·ctgα=1", "1+tg²α=1/cos²α", "1+ctg²α=1/sin²α"]),
            ("Формулы углов", ["sin(α±β)=sinαcosβ±cosαsinβ", "cos(α±β)=cosαcosβ∓sinαsinβ", "sin2α=2sinαcosα", "cos2α=cos²α−sin²α", "tg2α=2tgα/(1−tg²α)"]),
            ("Приведение и знаки", ["sin(π−α)=sinα; cos(π−α)=−cosα", "I: все положительны", "II: sin+; III: tg+, ctg+; IV: cos+" ]),
            ("Значения", ["0°: 0,1,0,—", "30°: 1/2,√3/2,√3/3,√3", "45°: √2/2,√2/2,1,1", "60°: √3/2,1/2,√3,√3/3", "90°: 1,0,—,0"]),
            ("Обратные функции", ["arcsin1/2=π/6; arcsin√2/2=π/4", "arcsin√3/2=π/3; arcsin1=π/2", "arccos1/2=π/3; arccos0=π/2", "arctg1=π/4; arctg√3=π/3"]),
            ("Квадраты 1–25", ["1→1 2→4 3→9 4→16 5→25", "6→36 7→49 8→64 9→81 10→100", "11→121 12→144 13→169 14→196 15→225", "16→256 17→289 18→324 19→361 20→400", "21→441 22→484 23→529 24→576 25→625"]),
        ])
        story.append(PageBreak())
        story += section("3. Планиметрия", [
            ("Произвольный треугольник", ["S=ah/2=½ab sin C=pr=abc/(4R)", "S=√[p(p−a)(p−b)(p−c)]", "a/sin A=b/sin B=c/sin C=2R", "c²=a²+b²−2ab cos C"]),
            ("Прямоугольный треугольник", ["c²=a²+b²", "h²=pq; a²=cp; b²=cq", "r=(a+b−c)/2; R=c/2", "sin A=a/c; cos A=b/c; tg A=a/b"]),
            ("Равносторонний треугольник", ["h=a√3/2; S=a²√3/4", "r=a√3/6; R=a√3/3"]),
            ("Четырёхугольники", ["Параллелограмм: P=2(a+b); S=ah", "Прямоугольник: d=√(a²+b²); S=ab", "Ромб: P=4a; S=½d₁d₂", "Квадрат: P=4a; S=a²=d²/2", "Трапеция: S=(a+b)h/2"]),
            ("Правильные многоугольники", ["αₙ=(n−2)180°/n", "Rₙ=a/(2sin(π/n)); rₙ=a/(2tg(π/n))", "n=3: R=a/√3, r=a√3/6", "n=4: R=a√2/2, r=a/2", "n=6: R=a, r=a√3/2"]),
        ])
        story.append(PageBreak())
        story += section("3–4. Круг, стереометрия и векторы", [
            ("Окружность и круг", ["C=2πR=πd", "l=Rφ", "S=πR²", "Sсект=R²φ/2=πR²α/360°", "(x−x₀)²+(y−y₀)²=R²"]),
            ("Призма и параллелепипед", ["Призма: Sб=Pоснl; Sп=Sб+2Sосн; V=Sоснh", "Куб: Sп=6a²; V=a³; d=a√3", "Параллелепипед: Sп=2(ab+bc+ac); V=abc"]),
            ("Пирамида и цилиндр", ["Пирамида: V=Sоснh/3", "Цилиндр: Sб=2πRh; Sп=2πR(R+h); V=πR²h"]),
            ("Конус и шар", ["Конус: l²=R²+h²; Sб=πRl; Sп=πR(R+l); V=πR²h/3", "Сфера: S=4πR²", "Шар: V=4πR³/3"]),
            ("Векторы", ["AB⃗=(x₂−x₁;y₂−y₁;z₂−z₁)", "|AB|=√[(x₂−x₁)²+(y₂−y₁)²+(z₂−z₁)²]", "a⃗·b⃗=a₁b₁+a₂b₂+a₃b₃", "cosφ=(a⃗·b⃗)/(|a⃗||b⃗|)", "a⃗⊥b⃗ ⇔ a⃗·b⃗=0"]),
        ])

    def footer(canvas, document):
        canvas.saveState()
        canvas.setFont("NMT", 7)
        canvas.setFillColor(colors.HexColor("#64748b"))
        canvas.drawString(10*mm, 7*mm, "Маткурс · довідник формул НМТ")
        canvas.drawRightString(200*mm, 7*mm, str(document.page))
        canvas.restoreState()

    doc.build(story, onFirstPage=footer, onLaterPages=footer)


if __name__ == "__main__":
    ua = ROOT + r"\assets\nmt-reference-ua.pdf"
    ru = ROOT + r"\assets\nmt-reference-ru.pdf"
    build(ua, True)
    build(ru, False)
