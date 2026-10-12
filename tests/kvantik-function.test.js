/* Kvantik Netlify Function: RU/UA answers, lesson context, safety on bad input. */
const { handler, replyFor } = require("../netlify/functions/kvantik.js");

let fails = 0;
const assert = (cond, msg) => { if (!cond) { fails++; console.log("FAIL: " + msg); } else console.log("ok: " + msg); };

async function main() {
  const call = async (body) => handler({ httpMethod: "POST", body: JSON.stringify(body) });
  const parse = (res) => JSON.parse(res.body);

  let res = await call({ message: "Привет", lessonId: "l1", lang: "ru" });
  assert(res.statusCode === 200, "greeting ru returns 200");
  assert(/Квантик/.test(parse(res).reply), "greeting ru mentions Kvantik");

  res = await call({ message: "привіт", lessonId: "l1", lang: "ua" });
  assert(/Квантик/.test(parse(res).reply), "greeting ua works with lowercase")

  res = await call({ message: "помоги мне", lessonId: "l3", lang: "ru" });
  assert(/шаг за шагом/.test(parse(res).reply), "help ru returns step-by-step offer");

  res = await call({ message: "не розумію", lessonId: "l3", lang: "ua" });
  assert(/крок за кроком/.test(parse(res).reply), "help ua works");

  res = await call({ message: "ну тут ничего", lessonId: "seq2", lang: "ru" });
  const ctxReply = parse(res).reply;
  assert(ctxReply.indexOf("seq2") >= 0, "generic reply keeps lesson id (got: " + ctxReply + ")");
  res = await call({ message: "?", lessonId: null, lang: "ua" });
  assert(/зв'язку/.test(parse(res).reply), "no-lesson ua fallback generic phrase");

  res = await call({ message: "что это", lang: "uk" });
  const langRes = parse(res);
  assert(langRes.lang === "ru", "lang falls back to ru for unknown code");

  res = await handler({ httpMethod: "POST", body: "not-json{" });
  assert(res.statusCode === 200 && typeof parse(res).reply === "string", "invalid JSON body still answers");

  res = await handler({ httpMethod: "OPTIONS", body: "" });
  assert(res.statusCode === 204, "CORS preflight answered 204");

  res = await handler({ httpMethod: "PUT", body: "{}" });
  assert(res.statusCode === 405, "unsupported method rejected 405");

  res = await handler({ httpMethod: "GET", body: "" });
  assert(res.statusCode === 405, "GET rejected 405 (POST only)");

  assert(typeof replyFor("Привет", "l1", "ru") === "string", "replyFor helper exported");
  assert(typeof replyFor("", "l1", "ua") === "string", "replyFor helper bilingual ru/ua");

  console.log(fails === 0 ? "\nALL KVANTIK-FUNCTION TESTS PASSED" : "\n" + fails + " TEST(S) FAILED");
  process.exit(fails ? 1 : 0);
}

main();