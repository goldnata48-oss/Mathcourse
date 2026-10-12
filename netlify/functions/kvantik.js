/* Квантик — Netlify Function (rule-based, RU/UA).
 * Замена n8n webhook (http://localhost:5678/webhook/kvantik) для продакшена.
 * URL: https://<site>.netlify.app/.netlify/functions/kvantik
 * Контракт совпадает с n8n-workflow n8n/kvantik-webhook.json:
 *   запрос:  { message, lessonId, lang }
 *   ответ:   { reply, lessonId, lang }
 */
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function respond(statusCode, body) {
  return {
    statusCode,
    headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  };
}

function replyFor(message, lessonId, lang) {
  const ua = lang === "ua";
  const msg = String(message || "").toLowerCase();
  const say = (ru, uaText) => (ua ? uaText : ru);
  if (/привет|привіт|hello|hi|здравств|здравствние/.test(msg)) {
    return say(
      "Привет! Я Квантик. Спроси что-нибудь по уроку.",
      "Привіт! Я Квантик. Питай щось по уроку."
    );
  }
  if (/не понимаю|не зрозуміло|не розумію|помоги|допоможи|help|не получается|не виходить|объясни|поясни/.test(msg)) {
    return say(
      "Хорошо, разберём шаг за шагом. Что именно непонятно?",
      "Добре, розберемо крок за кроком. Що саме незрозуміло?"
    );
  }
  if (lessonId) {
    return say(
      "Тема урока: " + lessonId + ". Попробуй сформулировать точнее, что спросить.",
      "Тема уроку: " + lessonId + ". Спробуй сформулювати точніше, що запитати."
    );
  }
  return say(
    "Я на связи. Задай вопрос по уроку — и я подскажу.",
    "Я на зв'язку. Постав питання про урок — і я підкажу."
  );
}

exports.handler = async function handler(event) {
  if (event.httpMethod === "OPTIONS") return respond(204, "");
  if (event.httpMethod !== "POST") {
    return respond(405, { reply: "Method not allowed", lessonId: null, lang: null });
  }
  let data = {};
  try {
    data = event.body ? JSON.parse(event.body) : {};
  } catch (_) {
    /* ignore invalid bodies, answer generic */
  }
  const message = data.message || "";
  const lessonId = data.lessonId || null;
  const lang = data.lang === "ua" ? "ua" : "ru";
  return respond(200, { reply: replyFor(message, lessonId, lang), lessonId, lang });
};

module.exports.replyFor = replyFor;