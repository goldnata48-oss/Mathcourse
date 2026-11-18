(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.KVANTIK_MATH = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function formatNumber(value, lang) {
    const rounded = Number(value.toPrecision(10));
    return String(rounded).replace(".", lang === "ua" ? "," : ".");
  }

  function tokenize(expression) {
    if (/\d\s+\d/.test(expression)) return null;
    const input = expression
      .replace(/[−–—]/g, "-")
      .replace(/[xXхХ]/g, "x")
      .replace(/[×·⋅]/g, "*")
      .replace(/÷/g, "/")
      .replace(/:/g, "/")
      .replace(/,/g, ".")
      .replace(/\s/g, "");
    const tokens = input.match(/(?:\d+(?:\.\d*)?|\.\d+|[x+\-*/^()√])/g) || [];
    if (tokens.join("") !== input || tokens.length > 100) return null;

    const expanded = [];
    const endsValue = token => /^\d/.test(token) || token === "x" || token === ")";
    const startsValue = token => /^\d/.test(token) || token === "x" || token === "(" || token === "√";
    for (const token of tokens) {
      if (expanded.length && endsValue(expanded[expanded.length - 1]) && startsValue(token)) {
        expanded.push("*");
      }
      expanded.push(token);
    }
    return expanded;
  }

  function parseAffine(expression) {
    const tokens = tokenize(expression);
    if (!tokens || !tokens.length) return null;
    let position = 0;
    const peek = () => tokens[position];
    const take = () => tokens[position++];
    const finite = value => Number.isFinite(value) && Math.abs(value) <= 1e12;
    const add = (left, right, sign) => ({ a: left.a + sign * right.a, b: left.b + sign * right.b });

    function primary() {
      const token = take();
      if (token === "x") return { a: 1, b: 0 };
      if (token === "(") {
        const value = sum();
        if (take() !== ")") throw new Error("Missing closing parenthesis");
        return value;
      }
      if (token === "√") {
        const value = factor();
        if (value.a !== 0 || value.b < 0) throw new Error("Invalid square root");
        return { a: 0, b: Math.sqrt(value.b) };
      }
      if (token && /^\d/.test(token)) return { a: 0, b: Number(token) };
      throw new Error("Expected a number or x");
    }

    function factor() {
      let value;
      if (peek() === "+" || peek() === "-") {
        const sign = take() === "-" ? -1 : 1;
        const next = factor();
        value = { a: sign * next.a, b: sign * next.b };
      } else {
        value = primary();
      }
      if (peek() === "^") {
        take();
        const exponent = factor();
        if (exponent.a !== 0 || !Number.isInteger(exponent.b)) throw new Error("Invalid exponent");
        if (value.a !== 0) {
          if (exponent.b !== 1) throw new Error("Nonlinear expression");
        } else {
          value = { a: 0, b: Math.pow(value.b, exponent.b) };
        }
      }
      if (!finite(value.a) || !finite(value.b)) throw new Error("Value out of range");
      return value;
    }

    function product() {
      let value = factor();
      while (peek() === "*" || peek() === "/") {
        const operator = take();
        const right = factor();
        if (operator === "*") {
          if (value.a && right.a) throw new Error("Nonlinear expression");
          value = {
            a: value.a * right.b + right.a * value.b,
            b: value.b * right.b,
          };
        } else {
          if (right.a || right.b === 0) throw new Error("Invalid divisor");
          value = { a: value.a / right.b, b: value.b / right.b };
        }
        if (!finite(value.a) || !finite(value.b)) throw new Error("Value out of range");
      }
      return value;
    }

    function sum() {
      let value = product();
      while (peek() === "+" || peek() === "-") {
        const sign = take() === "+" ? 1 : -1;
        value = add(value, product(), sign);
      }
      return value;
    }

    try {
      const value = sum();
      return position === tokens.length && finite(value.a) && finite(value.b) ? value : null;
    } catch (_) {
      return null;
    }
  }

  function solveEquation(message, lang) {
    if ((message.match(/=/g) || []).length !== 1) return null;
    const normalized = message
      .replace(/[−–—]/g, "-")
      .replace(/[xXхХ]/g, "x")
      .replace(/[×·⋅]/g, "*")
      .replace(/÷|:/g, "/");
    const [leftText, rightText] = normalized.split("=");
    const allowed = value => value.replace(/[^0-9.,xX+\-*/^()√\s]/g, "");
    const left = parseAffine(allowed(leftText));
    const right = parseAffine(allowed(rightText));
    if (!left || !right || (!left.a && !right.a)) return null;

    const coefficient = left.a - right.a;
    const constant = right.b - left.b;
    const fmt = value => formatNumber(value, lang);
    if (coefficient === 0) {
      return constant === 0
        ? (lang === "ua" ? "Рівність правильна за будь-якого x: обидві частини однакові." : "Равенство верно при любом x: обе части одинаковы.")
        : (lang === "ua" ? "Розв'язків немає: після спрощення отримуємо хибну рівність." : "Решений нет: после упрощения получается неверное равенство.");
    }

    const result = constant / coefficient;
    const xTerm = coefficient === 1 ? "x" : coefficient === -1 ? "-x" : fmt(coefficient) + "x";
    const rightStep = fmt(right.b) + " - (" + fmt(left.b) + ") = " + fmt(constant);
    const division = fmt(constant) + " / " + fmt(coefficient) + " = " + fmt(result);
    const check = fmt(left.a * result + left.b);
    const rhsCheck = fmt(right.a * result + right.b);
    return lang === "ua"
      ? "Розберімо рівняння по кроках:\n\n1) Переносимо доданки з x вліво, числа — вправо:\n" + xTerm + " = " + rightStep + "\n\n2) Ділимо на коефіцієнт при x:\nx = " + division + "\n\n3) Перевірка: ліва частина = " + check + ", права частина = " + rhsCheck + ".\n\nВідповідь: x = " + fmt(result) + "."
      : "Разберём уравнение по шагам:\n\n1) Переносим слагаемые с x влево, числа — вправо:\n" + xTerm + " = " + rightStep + "\n\n2) Делим на коэффициент при x:\nx = " + division + "\n\n3) Проверка: левая часть = " + check + ", правая часть = " + rhsCheck + ".\n\nОтвет: x = " + fmt(result) + ".";
  }

  function solveArithmetic(message, lang) {
    if (message.includes("=")) return null;
    const expression = message
      .replace(/[−–—]/g, "-")
      .replace(/×/g, "*")
      .replace(/[·⋅]/g, "*")
      .replace(/÷|:/g, "/")
      .replace(/[^0-9.,+\-*/^()√\s]/g, "");
    if (!/[+\-*/^√]/.test(expression)) return null;
    const value = parseAffine(expression);
    if (!value || value.a !== 0) return null;
    const fmt = number => formatNumber(number, lang);
    return lang === "ua"
      ? "Розв'язання:\n\n1) Спочатку виконуємо дії в дужках, потім множення й ділення, після цього — додавання й віднімання.\n2) Обчислюємо: " + expression.trim() + " = " + fmt(value.b) + ".\n\nВідповідь: " + fmt(value.b) + "."
      : "Решение:\n\n1) Сначала выполняем действия в скобках, затем умножение и деление, после этого — сложение и вычитание.\n2) Вычисляем: " + expression.trim() + " = " + fmt(value.b) + ".\n\nОтвет: " + fmt(value.b) + ".";
  }

  function solvePercent(message, lang) {
    const match = message.match(/(-?\d+(?:[.,]\d+)?)\s*%\s*(?:от|від)\s*(-?\d+(?:[.,]\d+)?)/i);
    if (!match) return null;
    const percent = Number(match[1].replace(",", "."));
    const number = Number(match[2].replace(",", "."));
    const result = percent * number / 100;
    if (!Number.isFinite(result) || Math.abs(result) > 1e12) return null;
    const fmt = value => formatNumber(value, lang);
    return lang === "ua"
      ? "Знайдемо відсоток від числа:\n\n1) Переводимо відсоток у дріб: " + fmt(percent) + "% = " + fmt(percent) + "/100.\n2) Множимо: " + fmt(number) + " · " + fmt(percent) + " / 100 = " + fmt(result) + ".\n\nВідповідь: " + fmt(result) + "."
      : "Найдём процент от числа:\n\n1) Переводим процент в дробь: " + fmt(percent) + "% = " + fmt(percent) + "/100.\n2) Умножаем: " + fmt(number) + " · " + fmt(percent) + " / 100 = " + fmt(result) + ".\n\nОтвет: " + fmt(result) + ".";
  }

  function solvePythagorean(message, lang) {
    const match = message.match(/катет[ыі]?\s*(?:равны|дорівнюють|=|:)?\s*(-?\d+(?:[.,]\d+)?)\D{1,30}(-?\d+(?:[.,]\d+)?)/i);
    if (!match || /гипотенуз|гіпотенуз/i.test(match[0])) return null;
    const a = Number(match[1].replace(",", "."));
    const b = Number(match[2].replace(",", "."));
    if (a <= 0 || b <= 0) return null;
    const c = Math.sqrt(a * a + b * b);
    if (!Number.isFinite(c) || c > 1e12) return null;
    const fmt = value => formatNumber(value, lang);
    return lang === "ua"
      ? "Знайдемо гіпотенузу за теоремою Піфагора:\n\n1) Записуємо формулу: c² = a² + b².\n2) Підставляємо катети: c = √(" + fmt(a) + "² + " + fmt(b) + "²) = √" + fmt(a * a + b * b) + " = " + fmt(c) + ".\n3) Перевірка: " + fmt(c) + "² = " + fmt(a * a + b * b) + ".\n\nВідповідь: гіпотенуза дорівнює " + fmt(c) + "."
      : "Найдём гипотенузу по теореме Пифагора:\n\n1) Записываем формулу: c² = a² + b².\n2) Подставляем катеты: c = √(" + fmt(a) + "² + " + fmt(b) + "²) = √" + fmt(a * a + b * b) + " = " + fmt(c) + ".\n3) Проверка: " + fmt(c) + "² = " + fmt(a * a + b * b) + ".\n\nОтвет: гипотенуза равна " + fmt(c) + ".";
  }

  function solve(message, lang) {
    const text = String(message || "").slice(0, 1000);
    const language = lang === "ua" ? "ua" : "ru";
    return solvePercent(text, language) || solveEquation(text, language) ||
      solvePythagorean(text, language) || solveArithmetic(text, language);
  }

  return { solve };
});
