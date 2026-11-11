// Подстановка для проверки сайта: вставить в консоль открытого сайта (на ширине 360 и 1100 px), затем:
//   await __setup();                      // вход и подставные ответы сервера (вымышленные данные, ничего не отправляется)
//   tab = 'overview'; render(meName);     // нужный экран: overview, profiles, chat, settings, help, account, profilesmgr, log
//   __audit()                             // список нарушений (пустой массив: всё хорошо)
// Подразделы бота (BOT_SECTIONS) требуют настоящих данных сервера: подставные ответы их ломают, их проверять на настоящем аккаунте.
// Правила проверки те же, что в tools/ui-audit.js (здесь они вложены, чтобы вставлять один файл).
window.__errs = []; window.addEventListener("error", function (e) { window.__errs.push(String(e.message).slice(0, 120)); });
window.__audit = function () {
  var v = [], rect = function (e) { return e.getBoundingClientRect(); };
  var vis = function (e) { var b = rect(e), cs = getComputedStyle(e); return b.width > 0 && b.height > 0 && cs.visibility !== "hidden" && cs.display !== "none"; };
  var nm = function (e) { return e.tagName.toLowerCase() + (typeof e.className === "string" && e.className.trim() ? "." + e.className.trim().split(/\s+/).join(".") : "") + " «" + (e.textContent || "").trim().slice(0, 28) + "»"; };
  var lines = function (e) {
    var r = document.createRange(), worst = 0, w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT), n;
    while ((n = w.nextNode())) { if (!n.textContent.trim()) continue; r.selectNodeContents(n); var tops = []; Array.prototype.forEach.call(r.getClientRects(), function (q) { if (q.width > 0 && !tops.some(function (t) { return Math.abs(t - q.top) < 4; })) tops.push(q.top); }); if (tops.length > worst) worst = tops.length; }
    return worst;
  };
  document.querySelectorAll(".tag,.pill,.agcount,.streamstat,.dlnote,.chip,button,a.btnlink").forEach(function (e) { if (!vis(e) || !(e.textContent || "").trim()) return; if (lines(e) > 1 && !e.closest("textarea,pre,.ex,.desc,.sub,.help,.note,.cmd,.hint,p")) v.push("перенос: " + nm(e)); });
  document.querySelectorAll("label").forEach(function (l) {
    var f = l.querySelector("select,input:not([type=checkbox]):not([type=range]),textarea"), s = l.querySelector("span"); if (!f || !s || !vis(f) || !vis(s)) return;
    var a = rect(s), b = rect(f); if (a.bottom > b.top + 1) return;
    if (Math.abs((a.left + a.width / 2) - (b.left + b.width / 2)) > 2) v.push("подпись не по центру: " + nm(l)); else if (getComputedStyle(s).textAlign !== "center") v.push("подпись не центрирована: " + nm(l));
  });
  var rows = ".streamrow,.dlrow,.agside2,.agbtns,.mrow,.macts,.tk,.th,.u-row,.u-row-c,.form,.tools,.cardhead,.row,.acts";
  document.querySelectorAll(rows).forEach(function (row) {
    if (!vis(row)) return; var kids = Array.prototype.filter.call(row.children, function (c) { return vis(c) && getComputedStyle(c).position !== "absolute"; }); if (kids.length < 2) return;
    var side = kids.every(function (c, i) { return kids.every(function (d, j) { if (i === j) return true; var a = rect(c), b = rect(d); return a.top < b.bottom - .5 && b.top < a.bottom - .5; }); }); if (!side) return;
    var cs = getComputedStyle(row); if (cs.display !== "flex" && cs.display !== "grid" && cs.display !== "inline-flex") return;
    var cen = kids.map(function (c) { var b = rect(c); return b.top + b.height / 2; });
    if (Math.max.apply(null, cen) - Math.min.apply(null, cen) > 1.5 && cs.alignItems !== "stretch" && !/^(start|flex-start|baseline)$/.test(cs.alignItems)) v.push("центры: " + nm(row) + " " + cen.map(Math.round).join(","));
  });
  document.querySelectorAll(".sel3,.u-cols-3").forEach(function (g) { var k = [].filter.call(g.children, vis), w = k.map(function (c) { return rect(c).width; }); if (k.length > 1 && Math.max.apply(null, w) - Math.min.apply(null, w) > 1.5) v.push("колонки разной ширины"); });
  document.querySelectorAll("button,.pill,.tab,.tag,.chip,a.btnlink").forEach(function (e) { if (!vis(e)) return; var b = rect(e); if (e.closest(".scroll,.subseg,.chips,[style*='overflow']")) return; if (b.right > window.innerWidth + 1 || b.left < -1) v.push("за краем: " + nm(e)); });
  var de = document.documentElement; if (de.scrollWidth > de.clientWidth + 1) v.push("страница шире окна " + de.scrollWidth + ">" + de.clientWidth);
  return v;
};
window.__setup = async function () {
  try { await loadRegistry(); } catch (e) {}
  var TR = [{ id: "game", name: "Игра", on: true, bot: true, procs: ["valorant", "cs2"] }, { id: "discord", name: "Discord", on: true, bot: true, procs: [] }, { id: "t1", name: "Музыка", on: false, bot: true, procs: ["spotify"] }];
  var conns0 = [{ id: "c1", provider: "twitch", role: "streamer", account_id: "B1", account_login: "InsideX_O", display_name: "InsideX_O", avatar_url: null, scopes: ["channel:manage:broadcast", "channel:read:subscriptions"], status: "ok" }, { id: "c2", provider: "twitch", role: "bot", account_id: "B2", account_login: "Tvoj_Bratan4ik", display_name: "Tvoj_Bratan4ik", avatar_url: null, scopes: ["user:read:moderated_channels"], status: "ok" }, { id: "c3", provider: "spotify", role: "music", account_login: "insidex", display_name: "InsideX", avatar_url: null, scopes: [], status: "ok" }];
  var P = { streams: 3, hours: 12, avg_viewers: 44, peak_viewers: 120, messages: 900, followers: 5 };
  window.api = async function (path, body) {
    var p = path.split("?")[0];
    if (p === "/api/me") return { name: "Inside X", avatar: null, connections: conns0, account: { nickname: "Inside X", login: "insidex" }, settings: { commands: { enabled: true }, music_source: { type: "spotify" } }, bot_mod: { ok: true, is_mod: true }, channel: { id: "ch1", name: "Game" } };
    if (p === "/api/channels") return { ok: true, channels: [{ id: "ch1", name: "Game", active: true, live: false, twitch_login: "insidex_o", platform: "twitch" }], max: 1 };
    if (p === "/api/agents") return { max: 5, agents: [{ id: "a1", name: "INSIDEX-PC", platform: "windows", version: "0.8.0", online: true, capabilities: ["player.now_playing", "app.control"], now_playing: null, control: { cfg: { tracks: TR, mic: "", backend: "auto", model: "large-v3-turbo-q5_0", culture: "ru-RU", threshold: 21, silence_s: 1.2, record_on_start: true, autostart: false, player: true }, models: { "large-v3-turbo-q5_0": { mb: 574, installed: true } }, mics: ["HyperX QuadCast S"], backends: ["vulkan"], recording: true, ffmpeg: true, apps: [], version: "0.8.0", update: "" } }, { id: "a2", name: "Ноутбук", platform: "windows", version: "0.8.0", online: false, capabilities: [] }] };
    if (p === "/api/stream/info") return { ok: true, platforms: [{ id: "twitch", label: "Twitch", ok: true, title: "Тест", game: { id: "1", name: "Just Chatting" } }], soon: ["YouTube", "Kick", "VK Play"], limits: { title: 140 } };
    if (p === "/api/overview") return { ok: true, live: false, last: null, periods: { today: P, week: P, month: P, quarter: P, half: P, year: P, all: P }, week: P, month: P, all: P, today: P, daily: [], weekly: [], monthly: [], events: [], recent: [], bot: { ok: true }, commands: { own: 0 } };
    return { ok: true, items: [], commands: [], timers: [], counters: [], quotes: [], logs: [], events: [], sessions: [], viewers: [], messages: [] };
  };
  token = "fake"; meName = "Inside X"; meAvatar = null; await load();
  ovState = null; ovLoading = false; await loadOverview();
};

// Кнопки: на кнопке одно слово или только значок (DESIGN.md, раздел 6). Возвращает список видимых кнопок с несколькими словами.
window.__auditButtons = function () {
  return [].slice.call(document.querySelectorAll("button")).filter(function (b) {
    var t = (b.textContent || "").trim().replace(/^[+×✕]\s*/, "");
    return b.offsetParent !== null && !b.classList.contains("tab") && !b.closest(".tabs,.subseg,.dlg-acts,.chips") && t.split(/\s+/).filter(Boolean).length > 1;
  }).map(function (b) { return b.textContent.trim().slice(0, 40); });
};

// Тестовый стенд сайта: подставные ответы сервера для ВСЕХ экранов (вымышленные данные, ничего не отправляется и не сохраняется).
// Подключение: открыть сайт на локальном сервере (python -m http.server в web), вставить <script src=".../site-stub.js"> и этот файл, затем:
//   await __standUp();                 // вход и подставные данные
//   await __standScreens();            // прогон всех экранов: ошибки отрисовки, переполнение, обрезанные подписи, мелкие значки
//   await __standShow("bot","timers","list");   // открыть конкретный экран для просмотра/скриншота
// Для неописанных запросов возвращается «пустой всеядный ответ» (U): отрисовка не падает, списки пустые.
(function () {
  var U = (function make() {
    var f = function () { return U; };
    var arr = [];
    return new Proxy(f, {
      get: function (t, k) {
        if (k === Symbol.iterator) return function () { return arr[Symbol.iterator](); };
        if (k === Symbol.toPrimitive) return function (h) { return h === "number" ? 0 : ""; };
        if (k === "length") return 0;
        if (k === "then") return undefined;
        if (k === "ok") return true;
        if (typeof k === "string" && Array.prototype[k] && typeof Array.prototype[k] === "function") return function () { var r = Array.prototype[k].apply(arr, arguments); return r; };
        if (k === "toString" || k === "valueOf") return function () { return ""; };
        return U;
      },
      apply: function () { return U; }
    });
  })();
  var now = new Date().toISOString();
  var T = [
    { id: "a", name: "Donation", enabled: true, interval_min: 60, min_messages: 5, min_chatters: 2, priority: 5, messages: ["Если вы хотите поддержать меня копеечкой, закинуть можете сюда:", "b", "c"], mode: "all", only_live: true, fired_count: 3, last_at: now },
    { id: "b", name: "ExitLag", enabled: true, interval_min: 50, min_messages: 5, min_chatters: 2, priority: 0, messages: ["Хочешь меньше пинга и стабильный интернет в играх?"], mode: "all", only_live: true, fired_count: 0, last_at: null }
  ];
  var CMDS = [{ id: "c1", name: "дискорд", aliases: [], response: "Наш Discord: discord.gg/example", level: "everyone", enabled: true, cooldown_s: 10, user_cooldown_s: 30, used: 14 }, { id: "c2", name: "правила", aliases: ["rules"], response: "Правила чата: уважаем друг друга, без спама и ссылок.", level: "everyone", enabled: true, cooldown_s: 20, user_cooldown_s: 60, used: 5 }];
  var VIEWERS = [{ key: "viewer1", login: "viewer1", name: "Viewer1", messages: 410, last_at: now, streams: 9, hours: 14.5, avatar: null }, { key: "viewer2", login: "viewer2", name: "Viewer2", messages: 120, last_at: now, streams: 4, hours: 6, avatar: null }];
  var CHAT = [{ id: 3, login: "viewer1", name: "Viewer1", text: "Привет, чат! Как дела на стриме?", at: now, badges: [] }, { id: 2, login: "viewer2", name: "Viewer2", text: "Всем хорошего вечера", at: now, badges: [] }, { id: 1, login: "insidex_o", name: "InsideX_O", text: "Всем привет! Сегодня играем.", at: now, badges: ["broadcaster"] }];
  var PRED = { max: 10, min: 2, title: 45, outcome: 25, win_min: 30, win_max: 1800, win_def: 120 }, POLL = { title: 60, choice: 25, min: 2, max: 5, dur_min: 15, dur_max: 1800, dur_def: 120, per_vote_max: 1000000 };
  var specific = {
    "/api/moderation": function () { return { ok: true, banned: { enabled: false, words: ["слово"], match: "word", action: "delete", timeout_s: 60, exempt: "subscriber", announce: false }, spam: { exempt: "subscriber", announce: false, links: { enabled: false, allow: "" }, caps: { enabled: false, min_len: 12, percent: 70 }, symbols: { enabled: false, min_len: 12, percent: 60 }, repeat: { enabled: false, max_chars: 8, max_words: 4, same_msgs: 3 }, length: { enabled: false, max: 300 }, emotes: { enabled: false, max: 12 } }, warnings: { enabled: false, mode: "chat", reset_hours: 24, steps: [{ strikes: 3, action: "timeout", seconds: 600 }, { strikes: 5, action: "ban" }] }, strikes: [], limits: { steps: 6 } }; },
    "/api/timers": function () { return { ok: true, timers: T, rules: { enabled: true, gap_min: 5, min_user_between: 5, youtube: null }, limits: { max: 20 } }; },
    "/api/overlay/key": function () { return { ok: true, key: "k_test_0123456789abcdef" }; },
    "/api/votes": function () { return { ok: true, scopes_ok: true, limits: { prediction: PRED, poll: POLL }, prediction: null, poll: null }; },
    "/api/giveaways": function () { return { ok: true, open: null, limits: { title: 60, cost_def: 100, cost_max: 100000, draw_max: 10, tickets_max: 100, max_per_hour: 5 }, recent: [] }; },
    "/api/activities/templates": function () { return { ok: true, templates: [{ id: "t1", type: "poll", name: "Во что играем", data: { title: "Во что играем?", choices: ["Valorant", "CS2"], duration: 180, pointsOn: false, points: 100 } }], last: { poll: { title: "Какой режим?", choices: ["А", "Б"], duration: 120, pointsOn: false, points: 100 } } }; },
    "/api/stream/info": function () { return { ok: true, platforms: [{ id: "twitch", label: "Twitch", ok: true, title: "Играем в Valorant с подписчиками", game: { id: "1", name: "VALORANT" } }], soon: ["YouTube"], limits: { title: 140 } }; },
    "/api/chatlog": function () { return { ok: true, items: CHAT, more: false, latest: 3 }; },
    "/api/chatlog/groups": function () { return { ok: true, items: [] }; },
    "/api/chatlog/streams": function () { return { ok: true, items: [] }; },
    "/api/viewers/search": function () { return { ok: true, items: VIEWERS }; },
    "/api/profiles": function () { return { ok: true, items: VIEWERS, total: VIEWERS.length }; }
  };

  // ---- много данных: реальные таймеры и слова-команды канала плюс сгенерированные записи ----
  var NAMES = ["Valera_Kz", "NightOwl", "coyote_kz_coyote", "Sunny_Day", "Pixel_Wolf", "Mr_Banana", "ZeroCool", "LunaFox", "BigBoss77", "Tihiy_Omut", "AnnaStream", "DedInside", "Kot_Matroskin", "Sashka_Pro", "Ghost_Rider", "MilkyWay", "Ctrl_Alt_Del", "SmokeScreen", "ZloyTapok", "Vika_Play", "KrutoyPacan", "Mishka_Gummi", "Skuf_Gamer", "Ryzhiy_Lis", "Tony_Stark_RU", "Blin_Blinov", "Sergey_FPS", "Katyusha", "Vanya_Mid", "Oleg_Support"];
  var REAL_TIMERS = [
    { name: "Donation", interval_min: 60, priority: 5, messages: ["💖 Если вы хотите поддержать меня копеечкой, закинуть можете сюда:", "Донейшн: https://www.donationalerts.com/r/fkn_inside", "StreamElements: https://streamelements.com/insidex_o/tip", "Мемасики: https://memealerts.com/65f71944288f43c13c4ea109", "Большое спасибо за вашу поддержку!"] },
    { name: "ExitLag", interval_min: 50, priority: 0, messages: ["🚀 Хочешь меньше пинга и стабильный интернет в играх?", "Проверь ExitLag:", "🔗 https://www.exitlag.com/aff.php?aff=10102362"] },
    { name: "Follow", interval_min: 60, priority: 0, messages: ["💜 Если стрим нравится — не забудь нажать Follow.", "Это бесплатно, а стримеру приятно."] },
    { name: "Social", interval_min: 30, priority: 0, messages: ["📲 Все мои соцсети, музыка и проекты здесь:", "🔗 https://lnk.bio/InsideX"] }
  ];
  var EXTRA_TIMERS = ["Telegram", "YouTube", "Discord", "Правила", "Клан GameHub", "Мерч", "Музыка", "Розыгрыш"];
  T = REAL_TIMERS.map(function (t, i) { return { id: "r" + i, name: t.name, enabled: true, interval_min: t.interval_min, min_messages: 5, min_chatters: 2, priority: t.priority, messages: t.messages, mode: "all", only_live: true, fired_count: 2 + i * 3, last_at: now }; })
    .concat(EXTRA_TIMERS.map(function (n, i) { return { id: "e" + i, name: n, enabled: i % 3 !== 0, interval_min: 20 + i * 10, min_messages: 5 + i, min_chatters: 2, priority: i % 4 === 0 ? 3 : 0, messages: ["Сообщение таймера «" + n + "»: короткий текст для проверки, как строка выглядит в списке.", "Вторая строка со ссылкой https://example.com/" + i], mode: i % 2 ? "random" : "all", only_live: i % 2 === 0, fired_count: i * 2, last_at: i % 2 ? now : null }; }));
  var REAL_KW = [
    ["команды", ["команды"], ["Бот реагирует на такие слова-команды: dpi, sens, set, cpu, pc, gpu, vpn, tg, dis, clan, block, yt, ttv, name, nick, игнорь меня, игнорируй меня, замолчи, не отвечай."]],
    ["DPI", ["dpi"], ["DPI: 500, как у InsideX! 🔥 Да-да, все другие ставят 800, но мы на 500, потому что стиль важен!", "Играть с DPI 500 это искусство, а InsideX его мастер! 🚀"]],
    ["SENS", ["sens"], ["DPI: 500 Чувствительность 45. А у тебя какая чувствительность? 😜", "Сенса 45, всё как должно быть. 🎮"]],
    ["SET", ["set"], ["Настройки игры: очень низкое, и текстуры высокие, чувствительность 45! 😂"]],
    ["cpu", ["cpu"], ["Мой ПК: 7800x3d, 32 GB RAM, RX6950XT Nitro+. 💻🔥"]],
    ["pc", ["pc"], ["Мой ПК: 7800x3d, 32 GB RAM, RX6950XT Nitro+. Процессор как молот! 💪💻"]],
    ["gpu", ["gpu"], ["ПК: 7800x3d, 32 GB RAM, RX6950XT Nitro+. Мой комп создан для побед! 🏆"]],
    ["vpn", ["vpn"], ["Используй игровой VPN для низких задержек! 🌍 https://www.exitlag.com/aff.php?aff=10102362"]],
    ["dis", ["dis"], ["Вот ссылка на мой Discord: https://discord.com/invite/Ykczusb. Заходи! 😎🎮"]],
    ["tg", ["tg"], ["🔗 Присоединяйтесь к нашему Telegram каналу: https://t.me/InsideX69"]],
    ["yt", ["yt"], ["Подпишись на мой канал на YouTube. Будь частью этого хаоса! 😂🎮"]],
    ["ttv", ["ttv"], ["InsideX это мой канал на Twitch, где я занимаюсь игровыми стримами. 😉"]],
    ["clan", ["clan"], ["Наш клан Game Hub! Присоединяйся, если хочешь быть в топе!"]],
    ["nick", ["nick"], ["Мои ники в играх: THE FINALS: INSIDEX#1390, PUBG: InsideX_TwitchYT 😏"]],
    ["block", ["block"], ["Для обхода блокировок: https://t.me/InsideX69/113 🔓💥"]]
  ];
  var KW = REAL_KW.map(function (k, i) { return { id: i + 1, title: k[0], words: k[1], replies: k[2], enabled: i !== 5, match: "word", level: "everyone", addressed: false, user_cooldown_s: 600, cooldown_s: 0, uses: i % 4 }; });
  CMDS = ["дискорд", "правила", "телеграм", "ютуб", "донат", "железо", "сенса", "бинды", "ники", "клан", "мерч", "расписание", "фидбек", "ссылки"].map(function (n, i) { var txt = "Ответ команды «" + n + "»: достаточно длинный текст, чтобы было видно, как строка переносится в списке на разной ширине экрана. https://example.com/" + i; return { id: "c" + i, name: n, names: [n], aliases: [], response: txt, responses: [txt], level: i % 4 === 0 ? "moderator" : "everyone", enabled: i % 5 !== 0, cooldown: 10, user_cooldown: 30, cooldown_s: 10, user_cooldown_s: 30, uses: i * 7, used: i * 7, mode: "all" }; });
  var COUNTERS = ["Смерти", "Победы", "Фраги", "Донаты", "Подписки"].map(function (n, i) { return { id: "n" + i, name: n.toLowerCase(), title: n, value: i * 13 + 4, level: "moderator" }; });
  var QUOTES = []; for (var qi = 0; qi < 8; qi++) QUOTES.push({ id: qi + 1, num: qi + 1, text: "Цитата номер " + (qi + 1) + ": что-то смешное, сказанное в чате или на стриме.", author: NAMES[qi], game: qi % 2 ? "VALORANT" : "THE FINALS", created_at: now, added_by: "InsideX_O" });
  var PROFILES = NAMES.map(function (n, i) { return { key: n.toLowerCase(), name: n, data: { twitch_login: n.toLowerCase(), alias: i % 6 === 0 ? "Алиас " + (i + 1) : "", profile: { total_messages: 900 - i * 27, total_view_time: 4000 + i * 900, total_emotes: 40 + i, total_twitch_emotes: 20 + i, meta: { language: i % 5 ? "ru" : "en", activity_level: ["высокая", "средняя", "низкая"][i % 3], preferred_response_tone: "дружелюбный" }, subscription: i % 4 === 0 ? { active: true, tier: "1000", months: 1 + i } : null }, songs: { all: i % 3 ? {} : { "трек-1": { count: 2 + i } } } } }; });
  var PH = ["Привет, чат!", "Лол, это было красиво 😂", "Кто-нибудь знает, какой это билд?", "GG, отличная игра", "Скинь настройки пожалуйста", "Бот, ответь на вопрос: сколько у тебя DPI?", "Спасибо за стрим, всем хорошего вечера!", "Сегодня без доната, но с поддержкой в чате 💜", "А где музыка сегодня?", "Это очень длинное сообщение для проверки переноса строк в ленте чата: бла-бла-бла бла-бла-бла бла-бла-бла бла-бла-бла бла-бла-бла."];
  CHAT = []; for (var ci = 60; ci >= 1; ci--) CHAT.push({ id: ci, login: NAMES[ci % NAMES.length].toLowerCase(), name: NAMES[ci % NAMES.length], text: PH[ci % PH.length], at: new Date(Date.now() - ci * 40000).toISOString(), badges: ci % 7 === 0 ? ["subscriber"] : ci % 11 === 0 ? ["moderator"] : [] });
  VIEWERS = PROFILES.map(function (p) { return { key: p.key, login: p.key, name: p.name, messages: p.data.profile.total_messages, last_at: now, streams: 9, hours: 14, avatar: null }; });
  specific["/api/keywords"] = function () { return { ok: true, keywords: KW, limits: { keywords: 30, words: 20, replies: 10, title: 40, reply: 450, cooldown: 3600 } }; };
  specific["/api/counters"] = function () { return { ok: true, counters: COUNTERS, limits: { max: 20, name: 20 } }; };
  specific["/api/quotes"] = function () { return { ok: true, quotes: QUOTES, limits: { max: 200, text: 300 } }; };
  specific["/api/profiles"] = function () { return { ok: true, viewers: PROFILES, channel: null }; };
  specific["/api/chatlog"] = function () { return { ok: true, items: CHAT, more: true, latest: 60 }; };
  specific["/api/timers"] = function () { return { ok: true, timers: T, rules: { enabled: true, gap_min: 5, min_user_between: 5, youtube: null }, limits: { max: 20, messages: 10 } }; };
  // настоящие списки полей и ограничения из кода сервера (ИИ, голос, бот): сгенерировано из worker/src
  var FIX = {"ai":{"ok":true,"enabled":true,"preset":"neutral","persona":"Саркастичный, но добрый помощник стримера.","rules":"Не спорить о политике.","max_chars":180,"tolerance":40,"user_cooldown_s":20,"per_min":6,"per_day":300,"providers":["deepseek","openai"],"fallback":[],"reply_delay_s":0,"voice_answer":true,"mention_users":2,"mention_window_s":180,"style":"","length_rule":"Отвечай КОРОТКО: одна-две фразы, не длиннее {max} символов, как обычная реплика в чате. Если зритель спросил что-то по делу, сначала дай прямой ответ, потом шутку. Без списков, пояснений и морали, не пересказывай чужие слова. Чем короче реплика зрителя, тем короче твой ответ.","variety_rule":"Пользуйся контекстом (сводка чата, слова стримера, история общения, прошлые реплики) только если он ПРЯМО относится к последнему сообщению; старые темы не поднимай, пока человек сам к ним не вернулся. Если человек продолжает разговор с тобой, держи нить: учитывай, что вы только что обсуждали. Каждый ответ свежий: не повторяй зачины, шутки и обороты из своих прошлых ответов и не отвечай разным людям одной и той же шуткой.","extra":"Правила поведения: не выдумывай факты, особенно про стримера: говори только то, что он реально сказал вслух или что есть в сводке чата и в истории общения. Если не понял сообщение, ответь шуткой или переспроси одним коротким вопросом. Не здоровайся повторно с тем, с кем уже здоровался. Не обещай то, чего не умеешь (розыгрыши, заказ песен, команды). Не подкалывай по национальности, здоровью, семье и внешности: на Twitch за это банят канал.","temperature":0.8,"model_deepseek":"","model_openai":"","price_deepseek_in":0.27,"price_deepseek_out":1.1,"price_openai_in":0.15,"price_openai_out":0.6,"timezone":"Europe/Moscow","chat_window_min":15,"chat_lines":12,"dialog_window_min":10,"dialog_lines":10,"voice_window_min":10,"voice_phrases":10,"others_phrases":10,"voice_chars":300,"memory_mode":"asked","memory_hits":5,"memory_notes":true,"card_on":true,"card_chat_people":3,"card_chars":520,"bday_on":true,"bday_ask":true,"bday_greet":true,"arch_on":true,"arch_streams":10,"arch_messages":150,"arch_days":30,"forget_days":7,"gemini_on":false,"gemini_model":"gemini-2.5-flash-lite","gemini_interval_s":30,"gemini_min_new":3,"gemini_max_age_s":180,"gemini_messages":60,"gemini_max_per_hour":100,"gemini_in_reply":true,"gemini_decide":false,"chime_cooldown_s":600,"gemini_max_replies":2,"presets":{"neutral":{"title":"Нейтральный","persona":"Ты дружелюбный и спокойный помощник в чате стримера. Отвечаешь коротко, по делу и вежливо, без сарказма и без грубости.","style":"спокойно, вежливо и коротко, по делу"},"bro":{"title":"«Братанчик»","persona":"Ты Братанчик, чат-бот на Twitch-стриме: дерзкий, весёлый подколщик, свой парень в чате. Ты бот и не скрываешь этого, но с характером. Ты слышишь чат и то, что стример говорит голосом. Общаешься на «ты», по-русски, по-дружески, можешь подколоть по-доброму, но никогда не оскорбляешь и не грубишь всерьёз.","style":"по-дружески, с юмором и лёгким сарказмом: подколи ситуацию, игру или лаги, а не самого человека, коротко и в тему"}},"limits":{"persona":1200,"rules":800,"max_chars":[40,400],"tolerance":[0,100],"user_cooldown_s":[0,600],"per_min":[1,30],"per_day":[10,2000],"fallback":10,"fallback_len":200},"fields":[{"k":"reply_delay_s","g":"reply","t":"int","min":0,"max":12,"def":0,"label":"Склейка сообщений: ждать перед ответом, с","hint":"Человек пишет несколько сообщений подряд: бот подождёт столько секунд и ответит один раз на всё. 0 = отвечать сразу на каждое. Дольше 12 секунд ждать нельзя (ограничение сервера)."},{"k":"voice_answer","g":"reply","t":"bool","def":true,"label":"Отвечать на голосовые вопросы стримера","hint":"Вы говорите в микрофон «бот, …» (слово обращения из приложения XBot), а бот отвечает в чат. Если фраза не голосовая команда, её слышит ИИ. Работает при включённом приложении XBot."},{"k":"mention_users","g":"reply","t":"int","min":1,"max":20,"def":2,"label":"Когда обращаться через @ (активных людей)","hint":"Если в чате за окно ниже писали столько людей и больше, бот отвечает с @ником."},{"k":"mention_window_s","g":"reply","t":"int","min":30,"max":1800,"def":180,"label":"Окно активности для @, с","hint":""},{"k":"style","g":"style","t":"text","max":300,"def":"","label":"Стиль ответа","hint":"Одна фраза, как продолжение «ответь на сообщение, …». Пусто = стиль выбранного характера."},{"k":"length_rule","g":"style","t":"text","max":600,"def":"Отвечай КОРОТКО: одна-две фразы, не длиннее {max} символов, как обычная реплика в чате. Если зритель спросил что-то по делу, сначала дай прямой ответ, потом шутку. Без списков, пояснений и морали, не пересказывай чужие слова. Чем короче реплика зрителя, тем короче твой ответ.","label":"Правило о длине ответа","hint":"{max} заменяется на длину из «Длина ответа»."},{"k":"variety_rule","g":"style","t":"text","max":900,"def":"Пользуйся контекстом (сводка чата, слова стримера, история общения, прошлые реплики) только если он ПРЯМО относится к последнему сообщению; старые темы не поднимай, пока человек сам к ним не вернулся. Если человек продолжает разговор с тобой, держи нить: учитывай, что вы только что обсуждали. Каждый ответ свежий: не повторяй зачины, шутки и обороты из своих прошлых ответов и не отвечай разным людям одной и той же шуткой.","label":"Правило свежести ответа","hint":"Как пользоваться контекстом и не повторяться."},{"k":"extra","g":"style","t":"text","max":1200,"def":"Правила поведения: не выдумывай факты, особенно про стримера: говори только то, что он реально сказал вслух или что есть в сводке чата и в истории общения. Если не понял сообщение, ответь шуткой или переспроси одним коротким вопросом. Не здоровайся повторно с тем, с кем уже здоровался. Не обещай то, чего не умеешь (розыгрыши, заказ песен, команды). Не подкалывай по национальности, здоровью, семье и внешности: на Twitch за это банят канал.","label":"Дополнительные указания","hint":"Правила поведения: что нельзя, как себя вести."},{"k":"temperature","g":"models","t":"num","min":0,"max":2,"step":0.1,"def":0.8,"label":"Творчество (температура)","hint":"0 = строго, 2 = очень свободно."},{"k":"model_deepseek","g":"models","t":"str","max":60,"def":"","label":"Модель DeepSeek","hint":"Пусто = deepseek-chat (быстро и дёшево). deepseek-reasoner рассуждает дольше."},{"k":"model_openai","g":"models","t":"str","max":60,"def":"","label":"Модель OpenAI","hint":"Пусто = gpt-4o-mini. Чем новее и умнее модель, тем дороже."},{"k":"price_deepseek_in","g":"cost","t":"num","min":0,"max":100,"step":0.01,"def":0.27,"label":"Цена DeepSeek, вход: $ за 1 млн токенов","hint":"Нужна только для оценки на странице «Расход». Цены меняются: сверьтесь с сайтом провайдера."},{"k":"price_deepseek_out","g":"cost","t":"num","min":0,"max":100,"step":0.01,"def":1.1,"label":"Цена DeepSeek, выход: $ за 1 млн токенов","hint":""},{"k":"price_openai_in","g":"cost","t":"num","min":0,"max":100,"step":0.01,"def":0.15,"label":"Цена OpenAI, вход: $ за 1 млн токенов","hint":""},{"k":"price_openai_out","g":"cost","t":"num","min":0,"max":100,"step":0.01,"def":0.6,"label":"Цена OpenAI, выход: $ за 1 млн токенов","hint":""},{"k":"timezone","g":"context","t":"enum","def":"Europe/Moscow","label":"Часовой пояс канала","hint":"По нему чат, речь стримера и история каждого зрителя делятся по дням (а при стриме: день и номер стрима в этом дне).","opts":[["Europe/Moscow","Москва"],["Europe/Kyiv","Киев"],["Europe/Minsk","Минск"],["Asia/Almaty","Алма-Ата"],["Asia/Tashkent","Ташкент"],["Asia/Yekaterinburg","Екатеринбург"],["Asia/Omsk","Омск"],["Asia/Novosibirsk","Новосибирск"],["Asia/Krasnoyarsk","Красноярск"],["Asia/Vladivostok","Владивосток"],["Europe/Berlin","Берлин"],["Europe/London","Лондон"],["America/New_York","Нью-Йорк"],["America/Los_Angeles","Лос-Анджелес"],["UTC","UTC"]]},{"k":"chat_window_min","g":"context","t":"int","min":1,"max":120,"def":15,"label":"Окно общего чата, мин","hint":"За какое время бот видит сообщения чата."},{"k":"chat_lines","g":"context","t":"int","min":0,"max":50,"def":12,"label":"Сообщений общего чата в запросе","hint":""},{"k":"dialog_window_min","g":"context","t":"int","min":1,"max":120,"def":10,"label":"Окно диалога с человеком, мин","hint":"Свежий разговор именно с этим зрителем."},{"k":"dialog_lines","g":"context","t":"int","min":0,"max":50,"def":10,"label":"Реплик диалога в запросе","hint":""},{"k":"voice_window_min","g":"context","t":"int","min":1,"max":60,"def":10,"label":"Слова стримера за последние, мин","hint":"Что стример говорил вслух (из приложения XBot)."},{"k":"voice_phrases","g":"context","t":"int","min":0,"max":50,"def":10,"label":"Голосовых фраз в запросе","hint":""},{"k":"others_phrases","g":"context","t":"int","min":0,"max":40,"def":10,"label":"Фраз из Discord и игр в запросе","hint":"Сырой текст речи других людей (Discord, игры) без разбора, кто говорит; работает, если включено «Записывать речь других людей». 0: не передавать."},{"k":"voice_chars","g":"context","t":"int","min":50,"max":1000,"def":300,"label":"Длина одной голосовой фразы, символов","hint":""},{"k":"memory_mode","g":"memory","t":"enum","opts":[["asked","Когда просят вспомнить"],["always","Всегда искать в истории"],["off","Не искать"]],"def":"asked","label":"Поиск по прошлым разговорам","hint":"Чат хранится навсегда. «Когда просят вспомнить»: на «помнишь…», «мы же говорили…» бот ищет похожие сообщения человека за всё время и подставляет в запрос."},{"k":"memory_hits","g":"memory","t":"int","min":0,"max":10,"def":5,"label":"Сколько старых сообщений подставлять","hint":"0 = не подставлять."},{"k":"memory_notes","g":"memory","t":"bool","def":true,"label":"Помнить о человеке (заметки, первое и прошлое сообщение)","hint":"Бот видит заметки о зрителе (их пишет Gemini по сводкам), когда он впервые писал и когда писал в прошлый раз."},{"k":"card_on","g":"card","t":"bool","def":true,"label":"Давать ИИ карточку зрителя","hint":"Перед ответом ИИ получает карточку собеседника из его профиля (стаж, стримы, манера письма, смайлы, частые слова, настроение, просьбы) и краткие карточки адресата и других людей из разговора, чтобы подстраиваться под каждого."},{"k":"card_chat_people","g":"card","t":"int","min":0,"max":8,"def":3,"label":"Сколько других людей из чата описывать","hint":"Кроме собеседника и того, кому он пишет, бот видит краткие карточки последних активных зрителей. 0 = только собеседник и адресат."},{"k":"card_chars","g":"card","t":"int","min":200,"max":900,"def":520,"label":"Длина карточки собеседника, символов","hint":"Чем длиннее, тем больше данных видит ИИ и тем дороже запрос. Лишнее обрезается по важности."},{"k":"bday_on","g":"bday","t":"bool","def":true,"label":"Запоминать дни рождения","hint":"Команда !др 15.03 и ответ зрителя на вопрос бота сохраняются в профиль (только день и месяц, год не хранится)."},{"k":"bday_ask","g":"bday","t":"bool","def":true,"label":"Иногда спрашивать день рождения","hint":"Бот ненавязчиво, в конце ответа, спрашивает у знакомых зрителей, у кого дата не заполнена: не чаще раза в 30 дней, не больше трёх раз, отказавшихся больше не спрашивает."},{"k":"bday_greet","g":"bday","t":"bool","def":true,"label":"Поздравлять с днём рождения","hint":"При первом сообщении человека (не раньше 8 утра по часовому поясу канала): за 3 дня бот заводит разговор («скоро день рождения»), в сам день поздравляет, а если человека не было и день рождения прошёл не больше 30 дней назад, поздравляет с опозданием. Дольше месяца не поздравляет. Каждый раз один раз. Текст пишет ИИ по карточке человека."},{"k":"arch_on","g":"arch","t":"bool","def":true,"label":"Определять архетип зрителей (по Юнгу)","hint":"Ориентир по поведению в чате, формируется только при долгом общении и проверяется раз в неделю. Нужен Gemini. Это не психологический тест: ИИ использует его только для тона и не говорит человеку, кто он."},{"k":"arch_streams","g":"arch","t":"int","min":3,"max":100,"def":10,"label":"Минимум стримов с сообщениями","hint":"Пока зритель был на меньшем числе стримов, архетип не определяется."},{"k":"arch_messages","g":"arch","t":"int","min":30,"max":2000,"def":150,"label":"Минимум сообщений","hint":""},{"k":"arch_days","g":"arch","t":"int","min":7,"max":365,"def":30,"label":"Минимум дней с первого появления","hint":""},{"k":"forget_days","g":"forget","t":"int","min":1,"max":30,"def":7,"label":"Срок на удаление данных по заявке, дней","hint":"Зритель пишет «забудь меня»: создаётся заявка, бот сообщает срок. Данные стирает только стример в панели после подтверждения; пока заявка ждёт, новые сообщения человека не записываются."},{"k":"gemini_on","g":"gemini","t":"bool","def":false,"label":"Gemini включён","hint":"Раз в интервал Gemini читает новый чат целиком и делает ОДНУ сводку на всех: тема, настроение, заметки о людях, кому боту отвечать. Ответы пишет DeepSeek/OpenAI. Нужен ключ GEMINI_API_KEY на сервере."},{"k":"gemini_model","g":"gemini","t":"str","max":60,"def":"gemini-2.5-flash-lite","label":"Модель Gemini","hint":"Если такой модели нет, сервер сам выберет доступную flash-lite или flash."},{"k":"gemini_interval_s","g":"gemini","t":"int","min":10,"max":600,"def":30,"label":"Не чаще чем раз в, с","hint":"Новая сводка делается не раньше, чем через столько секунд после прошлой."},{"k":"gemini_min_new","g":"gemini","t":"int","min":1,"max":100,"def":3,"label":"Минимум новых сообщений для сводки","hint":"Если новых сообщений меньше, прошлая сводка используется повторно и запроса нет."},{"k":"gemini_max_age_s","g":"gemini","t":"int","min":30,"max":1800,"def":180,"label":"Сводка считается свежей, с","hint":"Старее этого сводка в ответ не подставляется."},{"k":"gemini_messages","g":"gemini","t":"int","min":10,"max":200,"def":60,"label":"Сообщений чата в одном запросе","hint":""},{"k":"gemini_max_per_hour","g":"gemini","t":"int","min":5,"max":1000,"def":100,"label":"Запросов в час не больше","hint":"Защита бесплатного лимита Google."},{"k":"gemini_in_reply","g":"gemini","t":"bool","def":true,"label":"Давать сводку в запрос на ответ","hint":"Выключено: сводка только считается и показывается в панели."},{"k":"gemini_decide","g":"gemini","t":"bool","def":false,"label":"Gemini решает, отвечать ли без обращения по имени","hint":"Если человек обращается к боту без слова «бот» (по смыслу), Gemini это замечает, и бот отвечает. Когда зрители говорят между собой, бот молчит."},{"k":"chime_cooldown_s","g":"gemini","t":"int","min":0,"max":7200,"def":600,"label":"Бот сам вклинивается в разговор не чаще, с","hint":"В удачный момент бот коротко вклинивается (шутка или встречный вопрос). 0 = никогда."},{"k":"gemini_max_replies","g":"gemini","t":"int","min":1,"max":5,"def":2,"label":"Ответов по одной сводке не больше","hint":""}],"gemini":{"ok":true,"connected":true,"model":"gemini-2.5-flash","digest_at":"2026-11-06T02:04:36.455Z","keys":1},"access":true,"providers_ready":["gemini"],"provider_titles":{"gemini":"Google Gemini","groq":"Groq"},"usage":[{"day":"2026-11-06","requests":40,"spent_in":12000,"spent_out":3000,"errors":0},{"day":"2026-11-05","requests":43,"spent_in":12900,"spent_out":3200,"errors":1},{"day":"2026-11-04","requests":46,"spent_in":13800,"spent_out":3400,"errors":2},{"day":"2026-11-03","requests":49,"spent_in":14700,"spent_out":3600,"errors":0},{"day":"2026-11-02","requests":52,"spent_in":15600,"spent_out":3800,"errors":1},{"day":"2026-11-01","requests":55,"spent_in":16500,"spent_out":4000,"errors":2},{"day":"2026-10-31","requests":58,"spent_in":17400,"spent_out":4200,"errors":0},{"day":"2026-10-30","requests":61,"spent_in":18300,"spent_out":4400,"errors":1}],"usage_by_provider":[{"day":"2026-11-06","provider":"gemini","requests":40,"tokens_in":12000,"tokens_out":3000,"errors":0},{"day":"2026-11-05","provider":"gemini","requests":43,"tokens_in":12900,"tokens_out":3200,"errors":1},{"day":"2026-11-04","provider":"gemini","requests":46,"tokens_in":13800,"tokens_out":3400,"errors":2},{"day":"2026-11-03","provider":"gemini","requests":49,"tokens_in":14700,"tokens_out":3600,"errors":0},{"day":"2026-11-02","provider":"gemini","requests":52,"tokens_in":15600,"tokens_out":3800,"errors":1},{"day":"2026-11-01","provider":"gemini","requests":55,"tokens_in":16500,"tokens_out":4000,"errors":2},{"day":"2026-10-31","provider":"gemini","requests":58,"tokens_in":17400,"tokens_out":4200,"errors":0},{"day":"2026-10-30","provider":"gemini","requests":61,"tokens_in":18300,"tokens_out":4400,"errors":1}],"reading":true,"quiet":false},"voice":{"ok":true,"settings":{"enabled":false,"wake":"бот","show_transcript":true,"others":false,"silence_minutes":0,"triggers":[],"history_days":30},"kinds":{"say":"Написать в чат","now":"Сказать, какой трек играет","next":"Следующий трек","previous":"Предыдущий трек","pause":"Пауза","play":"Продолжить"},"limits":{"triggers":20,"phrase":60,"text":300,"wake_min":2,"wake_max":20,"silence_max":120,"history_max":365,"history_def":30,"page":100,"import_batch":300,"export_max":5000},"agent":{"online":true,"name":"INSIDEX-PC","version":"0.8.3"},"agents_total":1},"botcfg":{"ok":true,"prefix":"!","only_live":false,"quiet":false,"nick_command":"называй меня","nick_max":16,"aliases":["бот"],"ignore_enabled":true,"ignore_phrases":["игнорь меня","замолчи","не отвечай","игнорируй меня","не пиши мне"],"unignore_phrases":["отвечай мне","говори со мной","можешь отвечать"],"ignore_confirm":"Хорошо, {username}, я больше не буду тебя беспокоить.","ignore_back":"Хорошо, {username}, снова отвечаю тебе.","autopause_enabled":false,"autopause_users":3,"autopause_window_s":60,"autopause_duration_s":180,"prefixes":["!","#","$","%","&","*","+","-","?","~","^","|"],"reading":true,"speaks_as":{"name":"Tvoj_Bratan4ik","single":false}}};
  specific["/api/ai"] = function () { return FIX.ai; };
  specific["/api/voice"] = function () { return FIX.voice; };
  specific["/api/botcfg"] = function () { return FIX.botcfg; };

  // ---- «живая» серверная часть в памяти: кнопки работают, списки меняются, ничего никуда не уходит ----
  var uid = 100, rnd = function (a, b) { return a + Math.floor(Math.random() * (b - a + 1)); };
  var VT = {
    prediction: { id: "p1", title: "Выиграю бой?", status: "RESOLVED", winning_outcome_id: "o1", window: 300, outcomes: [{ id: "o1", title: "Конечно", users: 12, points: 18400 }, { id: "o2", title: "Очко не спасти", users: 5, points: 6200 }] },
    poll: { id: "q1", title: "Во что играем дальше?", status: "COMPLETED", duration: 180, choices: [{ title: "Valorant", votes: 34 }, { title: "CS2", votes: 21 }, { title: "THE FINALS", votes: 17 }] }
  };
  var GW = { open: null, history: [{ mode: "join", title: "Ключ Steam", winners: ["Pixel_Wolf"], closed_at: new Date(Date.now() - 86400000 * 2).toISOString() }, { mode: "reward", title: "Мерч от канала", winners: ["LunaFox", "Valera_Kz"], closed_at: new Date(Date.now() - 86400000 * 9).toISOString() }] };
  var ACT = {
    templates: [
      { id: "tp1", type: "pred", name: "Выиграю бой?", data: { title: "Выиграю бой?", outcomes: ["Да", "Нет"], window: 300 } },
      { id: "tp2", type: "pred", name: "Топ-1 в раунде", data: { title: "Будет ли топ-1?", outcomes: ["Будет", "Не будет", "Близко"], window: 600 } },
      { id: "tp3", type: "poll", name: "Во что играем", data: { title: "Во что играем дальше?", choices: ["Valorant", "CS2", "THE FINALS"], duration: 180, pointsOn: false, points: 100 } },
      { id: "tp4", type: "poll", name: "Карта вечера", data: { title: "На какой карте играем?", choices: ["Ascent", "Haven", "Bind", "Lotus"], duration: 120, pointsOn: true, points: 50 } },
      { id: "tp5", type: "giveaway", name: "Ключ Steam", data: { title: "Ключ Steam", mode: "join", level: "everyone", cost: 100, max_tickets: 1 } },
      { id: "tp6", type: "giveaway", name: "За баллы", data: { title: "Мерч за баллы", mode: "reward", level: "everyone", cost: 500, max_tickets: 5 } }
    ],
    last: { pred: { title: "Выиграю бой?", outcomes: ["Да", "Нет"], window: 300 }, poll: { title: "Во что играем дальше?", choices: ["Valorant", "CS2", "THE FINALS"], duration: 180, pointsOn: false, points: 100 }, giveaway: { title: "Ключ Steam", mode: "join", level: "everyone", cost: 100, max_tickets: 1 } }
  };
  var MUSIC = { rewards: [{ id: "rw1", title: "Заказать песню", cost: 500, enabled: true, manageable: true }, { id: "rw2", title: "Следующий трек", cost: 1500, enabled: false, manageable: true }], commands: { enabled: true }, limits: { allow_explicit: false, cooldown_seconds: 60, max_minutes: 10, max_per_hour: 3, vote_skip_needed: 3 }, song: { enabled: true, title: "Заказать песню", cost: 500, reward_id: "rw1", manageable: true }, defaults: { title: "Заказать песню", cost: 500, max_per_hour: 3 }, ready: { twitch: true, rewards_scope: true, spotify: true } };
  var BLOCK = [{ id: 1, key: "t1", kind: "track", label: "Rickroll — Rick Astley", value: "t1" }, { id: 2, key: "a1", kind: "artist", label: "Исполнитель Икс", value: "a1" }, { id: 3, key: "v1", kind: "viewer", label: "TroLLer_99", value: "v1" }];
  var MPROF = [0, 1, 2, 3, 4].map(function (i) { return { name: NAMES[i], total: 12 - i * 2, top: [{ title: "Трек " + (i + 1), artist: "Артист " + (i + 1), count: 4 - (i % 3) }, { title: "Другой трек", artist: "Артист X", count: 2 }] }; });
  var by = function (arr, id) { for (var i = 0; i < arr.length; i++) if (String(arr[i].id) === String(id)) return i; return -1; };
  var ok = function (x) { x = x || {}; x.ok = true; return x; };
  var live = {
    "/api/votes": function () { return ok({ scopes_ok: true, limits: { prediction: PRED, poll: POLL }, prediction: VT.prediction, poll: VT.poll }); },
    "/api/votes/prediction/start": function (b) { var o = (b.outcomes || []).map(function (t, i) { return { id: "o" + (i + 1), title: t, users: rnd(2, 15), points: rnd(500, 9000) }; }); VT.prediction = { id: "p" + (++uid), title: b.title, status: "ACTIVE", window: b.window, outcomes: o }; return ok(); },
    "/api/votes/prediction/lock": function () { if (VT.prediction) VT.prediction.status = "LOCKED"; return ok(); },
    "/api/votes/prediction/resolve": function (b) { if (VT.prediction) { VT.prediction.status = "RESOLVED"; VT.prediction.winning_outcome_id = b.outcome_id; } return ok(); },
    "/api/votes/prediction/cancel": function () { if (VT.prediction) VT.prediction.status = "CANCELED"; return ok(); },
    "/api/votes/poll/start": function (b) { VT.poll = { id: "q" + (++uid), title: b.title, status: "ACTIVE", duration: b.duration, choices: (b.choices || []).map(function (t) { return { title: t, votes: rnd(0, 30) }; }) }; return ok(); },
    "/api/votes/poll/end": function () { if (VT.poll) VT.poll.status = "COMPLETED"; return ok(); },
    "/api/giveaways": function () { return ok({ open: GW.open, history: GW.history, rewards_scope: true, rewards: [], limits: { title: 60, cost_def: 100, cost_max: 100000, draw_max: 10, tickets_max: 100, max_per_hour: 5 } }); },
    "/api/giveaways/start": function (b) { GW.open = { id: "g" + (++uid), title: b.title, mode: b.mode, level: b.level, cost: b.cost, reward_cost: b.cost, max_tickets: b.max_tickets, participants: 9, tickets: 14, names: NAMES.slice(0, 9), winners: [] }; return ok(); },
    "/api/giveaways/draw": function (b) { var w = []; for (var i = 0; i < (b.count || 1); i++) w.push(NAMES[rnd(0, NAMES.length - 1)]); if (GW.open) GW.open.winners = (GW.open.winners || []).concat(w); return ok({ winners: w, announced: !!b.announce, note: "" }); },
    "/api/giveaways/close": function () { if (GW.open) { GW.history.unshift({ mode: GW.open.mode, title: GW.open.title, winners: GW.open.winners || [], closed_at: new Date().toISOString() }); GW.open = null; } return ok(); },
    "/api/activities/templates": function () { return ok({ templates: ACT.templates, last: ACT.last }); },
    "/api/activities/template": function (b) { var d = b.data || {}, i = ACT.templates.findIndex(function (t) { return t.type === b.type && t.name.toLowerCase() === String(b.name).toLowerCase(); }); var t = { id: i >= 0 ? ACT.templates[i].id : "tp" + (++uid), type: b.type, name: b.name, data: d }; if (i >= 0) ACT.templates[i] = t; else ACT.templates.push(t); return ok({ template: t, templates: ACT.templates }); },
    "/api/activities/template/delete": function (b) { var i = by(ACT.templates, b.id); if (i >= 0) ACT.templates.splice(i, 1); return ok({ templates: ACT.templates }); },
    "/api/activities/last": function (b) { ACT.last[b.type] = b.data; return ok({ last: ACT.last }); },
    "/api/timers/toggle": function (b) { var i = by(T, b.id); if (i >= 0) T[i].enabled = !!b.enabled; return ok(); },
    "/api/timers/delete": function (b) { var i = by(T, b.id); if (i >= 0) T.splice(i, 1); return ok(); },
    "/api/timers/save": function (b) { var m = Array.isArray(b.messages) ? b.messages : String(b.messages || "").split("\n").filter(Boolean); var rec = { id: b.id || "n" + (++uid), name: b.name || "Таймер", enabled: b.enabled !== false, interval_min: Number(b.interval_min) || 30, min_messages: Number(b.min_messages) || 5, min_chatters: Number(b.min_chatters) || 2, priority: Number(b.priority) || 0, messages: m.length ? m : ["Текст"], mode: b.mode || "all", only_live: b.only_live !== false, fired_count: 0, last_at: null }; var i = by(T, rec.id); if (i >= 0) { rec.fired_count = T[i].fired_count; T[i] = rec; } else T.push(rec); return ok(); },
    "/api/timers/rules": function () { return ok(); },
    "/api/timers/test": function () { return ok(); },
    "/api/chat/commands/toggle": function (b) { var i = by(CMDS, b.id); if (i >= 0) CMDS[i].enabled = !!b.enabled; return ok(); },
    "/api/chat/commands/delete": function (b) { var i = by(CMDS, b.id); if (i >= 0) CMDS.splice(i, 1); return ok(); },
    "/api/chat/commands/save": function (b) { var txt = Array.isArray(b.responses) ? b.responses[0] : (b.response || b.text || ""); var nm = b.name || (b.names && b.names[0]) || "новая"; var rec = { id: b.id || "c" + (++uid), name: nm, names: [nm], aliases: [], response: txt, responses: Array.isArray(b.responses) ? b.responses : [txt], level: b.level || "everyone", enabled: b.enabled !== false, cooldown: Number(b.cooldown) || 10, user_cooldown: Number(b.user_cooldown) || 30, cooldown_s: Number(b.cooldown) || 10, user_cooldown_s: Number(b.user_cooldown) || 30, uses: 0, used: 0, mode: b.mode || "all" }; var i = by(CMDS, rec.id); if (i >= 0) CMDS[i] = rec; else CMDS.push(rec); return ok(); },
    "/api/keywords/save": function (b) { var rec = { id: b.id || ++uid, title: b.title, words: b.words || [], replies: b.replies || [], enabled: b.enabled !== false, match: b.match || "word", level: b.level || "everyone", addressed: !!b.addressed, user_cooldown_s: b.user_cooldown_s, cooldown_s: b.cooldown_s, uses: 0 }; var i = by(KW, rec.id); if (i >= 0) KW[i] = rec; else KW.push(rec); return ok(); },
    "/api/keywords/delete": function (b) { var i = by(KW, b.id); if (i >= 0) KW.splice(i, 1); return ok(); },
    "/api/counters/save": function (b) { var rec = { id: b.id || "n" + (++uid), name: b.name, title: b.title || b.name, value: Number(b.value) || 0, level: b.level || "moderator" }; var i = by(COUNTERS, rec.id); if (i >= 0) COUNTERS[i] = rec; else COUNTERS.push(rec); return ok(); },
    "/api/counters/value": function (b) { var i = by(COUNTERS, b.id); if (i >= 0) COUNTERS[i].value = Number(b.value); return ok(); },
    "/api/counters/delete": function (b) { var i = by(COUNTERS, b.id); if (i >= 0) COUNTERS.splice(i, 1); return ok(); },
    "/api/quotes/save": function (b) { var rec = { id: b.id || ++uid, num: QUOTES.length + 1, text: b.text, author: b.author || "", game: "", created_at: new Date().toISOString(), added_by: "InsideX_O" }; var i = by(QUOTES, rec.id); if (i >= 0) QUOTES[i] = rec; else QUOTES.push(rec); return ok(); },
    "/api/quotes/delete": function (b) { var i = by(QUOTES, b.id); if (i >= 0) QUOTES.splice(i, 1); return ok(); },
    "/api/music": function () { return MUSIC; },
    "/api/music/commands": function (b) { MUSIC.commands.enabled = !!b.enabled; return ok(); },
    "/api/music/limits": function (b) { MUSIC.limits = Object.assign(MUSIC.limits, b || {}); return ok({ limits: MUSIC.limits }); },
    "/api/music/blocklist": function (b) { if (b && b.remove) { var i = by(BLOCK, b.remove); if (i >= 0) BLOCK.splice(i, 1); } if (b && b.add) BLOCK.push({ id: ++uid, key: "x" + uid, kind: b.kind || "track", label: b.add, value: b.add }); return ok({ items: BLOCK }); },
    "/api/music/profiles": function () { return ok({ viewers: MPROF }); }
  };
  var OVS = { spotify: { theme: "dark", bar: true, cover: true, anim: "left", spd: "0.6", round: false, marq: "pingpong", fade: true, ms: 50, mp: 1.5, frame: true, bw: 1.5, bd: 70, bg: null, accent: "1db954" } };
  OVS.agent = JSON.parse(JSON.stringify(OVS.spotify)); window.__ovSaves = [];
  live["/api/overlay/settings"] = function (b) { if (b && b.which) { OVS[b.which] = b.settings; window.__ovSaves.push(b.which); return ok({ settings: b.settings }); } return ok({ w: OVS }); };
  live["/api/viewer/card"] = function () { return ok({ card: "Зритель смотрит стримы про шутеры, пишет коротко и по делу, любит шутки про PUBG. Бывает на 9 из 12 последних стримов. Тон общения дружелюбный." }); };
  window.__modCalls = [];
  live["/api/chat/mod/state"] = function () { return ok({ can_ban: true, can_delete: true, streamer: "insidex_o" }); };
  live["/api/chat/mod"] = function (b) { window.__modCalls.push(b); return ok(); };
  CHAT.forEach(function (m) { m.mid = "msg-0000-" + m.id; });
  Object.keys(live).forEach(function (k) { specific[k] = live[k]; });
  window.__standUp = async function () {
    await __setup();
    var base = window.api;
    window.api = async function (p, b) {
      var q = p.split("?")[0];
      if (specific[q]) return specific[q](b || {});
      if (q === "/api/chat/commands") return { ok: true, prefix: "!", commands: CMDS, own: CMDS, custom: CMDS, variables: [["${user}", "ник того, кто написал"], ["${count}", "сколько раз вызвана команда"], ["${channel}", "название канала"]], builtin: [{ id: "help", names: ["команды"], description: "Список команд бота", enabled: true, level: "everyone", cooldown: 10 }, { id: "song", names: ["песня", "song"], description: "Какой трек играет сейчас", enabled: true, level: "everyone", cooldown: 15 }, { id: "uptime", names: ["аптайм"], description: "Сколько идёт стрим", enabled: false, level: "moderator", cooldown: 30 }], limits: { max: 100, name: 30, response: 450, cooldown: 3600, per_user: 3600 } };
      if (q === "/api/me" || q === "/api/channels" || q === "/api/agents" || q === "/api/overview") return base(p, b);
      return U;
    };
  };
  var SCREENS = [["overview"], ["profiles"], ["chat", "chat"], ["settings"], ["help"], ["account"]];
  window.__standSections = function () { var out = []; BOT_SECTIONS.forEach(function (s) { s.subs.forEach(function (x) { out.push([s.id, x.id]); }); }); return out; };
  window.__standShow = async function (sec, sub) {
    if (sec === "overview" || sec === "profiles" || sec === "chat" || sec === "settings" || sec === "help" || sec === "account") { tab = sec; }
    else { tab = "bot"; botSec = sec; botSub = sub || ""; }
    try { mdState = null; tmState = null; vtState = null; gwState = null; actTpl = null; chatState = null; spForm = null; wdForm = null; mdForm = null; } catch (e) {}
    render(meName); await new Promise(function (r) { setTimeout(r, 350); }); render(meName); await new Promise(function (r) { setTimeout(r, 150); });
  };
  var SKIP = /^(Команды|Модерация|Таймеры|Музыка|Активности|Голос|ИИ|Настройки|Заказ|Запрещ|Лимиты|Плеер|Спам|Предуп|Правила|Twitch|YouTube|Kick|VK|Общие|Игра|Обзор|Бот|Зрители|Чат|Встроенные|Мои|Счётчики|Цитаты|Слова|Основное|Стиль|Контекст|Gemini|Расход|Тишина|Приложение|Ставки|Опросы|Розыгрыши)/;
  // Текст по центру обводки: у плашек, кнопок и значков центр текста не должен отличаться от центра рамки больше чем на 2 px по вертикали
  window.__standCenter = function () {
    var bad = [];
    [].forEach.call(document.querySelectorAll("#app .tag, #app .pill, #app .chip, #app button, #app .help, #app .streamstat, #app select, #app input:not([type=checkbox]):not([type=range])"), function (e) {
      var b = e.getBoundingClientRect(); if (!b.width || !b.height) return;
      var t = e.tagName === "SELECT" || e.tagName === "INPUT" ? null : e;
      if (!t || !(t.textContent || "").trim() || t.querySelector("textarea")) return;
      var r = document.createRange(); r.selectNodeContents(t); var q = r.getBoundingClientRect(); if (!q.height) return;
      var d = (q.top + q.height / 2) - (b.top + b.height / 2);
      if (Math.abs(d) > 2.5 && b.height < 80) bad.push(Math.round(d) + "px " + (e.className || e.tagName) + " «" + (e.textContent || "").trim().slice(0, 18) + "»");
    });
    return bad;
  };
  window.__standScreens = async function (from, to) {
    var list = SCREENS.concat(__standSections()).slice(from || 0, to || 99), out = [];
    window.__errs.length = 0;
    for (var i = 0; i < list.length; i++) {
      var name = list[i].join("/"), err = "";
      try { await __standShow(list[i][0], list[i][1]); } catch (e) { err = "ОШИБКА " + String(e.message).slice(0, 70); }
      var de = document.documentElement, cut = [], small = 0;
      [].forEach.call(document.querySelectorAll("button,a.btnlink,select,input:not([type=checkbox]):not([type=range])"), function (e) {
        var b = e.getBoundingClientRect(); if (!b.width || !b.height) return;
        var t = (e.textContent || "").trim();
        if (e.tagName === "BUTTON" && e.scrollWidth > e.clientWidth + 1 && t) cut.push(t.slice(0, 20));
        if ((b.right > innerWidth + 1 || b.left < -1) && !SKIP.test(t)) cut.push("за краем: " + (t || e.className).slice(0, 20));
        if (e.tagName === "BUTTON" && e.classList.contains("icon") && (b.width < 34 || b.height < 34)) small++;
      });
      var ov = de.scrollWidth > de.clientWidth + 1 ? de.scrollWidth + ">" + de.clientWidth : "";
      var aud = []; try { aud = __audit().filter(function (x) { return !/за краем/.test(x); }).concat(__standCenter().map(function (x) { return "не по центру " + x; })); } catch (e) {}
      var empty = !(document.querySelector("#app .card, #app .tile, #app .chatfull"));
      if (err || ov || cut.length || small || aud.length || empty) out.push(name + ": " + [err, ov && "переполн. " + ov, cut.length && "обрез. " + cut.slice(0, 3).join("|"), small && "мелких " + small, aud.length && "аудит " + aud.slice(0, 2).join("|"), empty && "пусто"].filter(Boolean).join("; "));
    }
    return innerWidth + "px: " + (out.length ? "\n" + out.join("\n") : "всё чисто") + (window.__errs.length ? "\nJS: " + window.__errs.slice(0, 3).join(" | ") : "");
  };
})();


// ---- запуск стенда: вход пропускается, сразу открывается панель; предпросмотр плеера идёт на страницу стенда с примером песни ----
(function () {
  var base = window.overlayUrl;
  window.overlayUrl = function (which, preview) { return base(which, preview).replace(location.origin + "/overlay?", location.origin + "/stand/overlay.html?"); };
  function start() {
    if (typeof __standUp !== "function" || typeof render !== "function") { setTimeout(start, 100); return; }
    __standUp().then(function () {
      var tag = document.createElement("div");
      tag.textContent = "Тестовый стенд: данные подставные, ничего не сохраняется";
      tag.style.cssText = "position:fixed;left:8px;bottom:8px;z-index:99999;font:11px system-ui;color:#fff;background:rgba(255,45,120,.85);padding:3px 9px;border-radius:99px;pointer-events:none";
      document.body.appendChild(tag);
      render(meName);
    });
  }
  start();
})();
