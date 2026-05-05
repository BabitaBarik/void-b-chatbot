/* ── VOID E-CHATBOT — script.js ─────────────────────────────────────── */

const GOOGLE_API_KEY   = "AIzaSyAcr6WDn7Mk8x-HRpCWdOsAWQpzPYMHvHQ";
const GOOGLE_BOOKS_URL = "https://www.googleapis.com/books/v1/volumes";

/* ══════════════════════════════════════════════════════════════════════
   GENRE MAPS
   ══════════════════════════════════════════════════════════════════════ */
const GENRE_ALIASES = {
  "sci-fi":        ["sci-fi","scifi","science fiction","sf","space","futuristic","cyberpunk","dystopian","space opera"],
  "fantasy":       ["fantasy","fantacy","fantasi","fantasie","magic","wizard","dragon","epic fantasy","sword","sorcery","fairy","fae","high fantasy","dark fantasy"],
  "mystery":       ["mystery","mystrey","detective","crime","whodunit","noir","investigation","murder mystery","cozy mystery"],
  "thriller":      ["thriller","suspense","spy","conspiracy","espionage","psychological thriller"],
  "horror":        ["horror","scary","ghost","paranormal","haunted","occult","supernatural","gothic horror","monster"],
  "romance":       ["romance","romanse","love story","romantic","love","chick lit","contemporary romance"],
  "historical":    ["historical fiction","period","medieval","ancient","war","world war","victorian","viking"],
  "non-fiction":   ["non-fiction","nonfiction","true story","educational"],
  "biography":     ["biography","autobiography","memoir","life story"],
  "self-help":     ["self-help","self help","personal development","motivation","productivity","mindset","habits","success"],
  "psychology":    ["psychology","mind","behaviour","cognitive","brain","psyche","neuroscience","psychiatry"],
  "philosophy":    ["philosophy","ethics","logic","existentialism","stoicism","metaphysics","moral"],
  "history":       ["history","world history","ancient history","civilization","empire","revolution"],
  "science":       ["science","physics","chemistry","biology","evolution","astronomy","cosmology","quantum","mathematics"],
  "travel":        ["travel","adventure","exploration","journey","backpacking","wanderlust"],
  "children":      ["children","kids","picture book","middle grade","young readers","bedtime story","juvenile"],
  "young adult":   ["young adult","ya","teen","teenager","coming of age","high school"],
  "graphic novel": ["graphic novel","manga","comic","comic book","illustrated","visual novel"],
  "poetry":        ["poetry","poems","verse","haiku","sonnet","lyric"],
  "drama":         ["drama","play","screenplay","stage","theatrical","shakespeare","tragedy"],
  "humor":         ["humor","comedy","funny","satire","parody","humour","jokes"],
  "cooking":       ["cooking","cookbook","recipes","food","baking","cuisine","chef","culinary"],
  "health":        ["health","fitness","nutrition","diet","exercise","body","wellbeing","yoga"],
  "business":      ["business","entrepreneurship","startup","marketing","finance","investing","leadership","economics"],
  "technology":    ["technology","tech","programming","coding","computer science","software","ai","artificial intelligence","machine learning"],
  "art":           ["art","design","painting","drawing","illustration","architecture","photography"],
  "music":         ["music","musician","band","rock","jazz","classical music","music theory","songwriting"],
  "sports":        ["sports","football","cricket","basketball","baseball","tennis","athletics","soccer"],
  "politics":      ["politics","political","government","democracy","policy","election","diplomacy"],
  "religion":      ["religion","spirituality","faith","buddhism","hinduism","christianity","islam"],
  "mythology":     ["mythology","myth","legend","folklore","greek mythology","norse mythology","celtic"],
  "crime":         ["crime fiction","heist","gangster","mafia","serial killer","forensic","true crime"],
  "adventure":     ["adventure","action adventure","quest","treasure hunt","survival","expedition"],
  "western":       ["western","cowboy","frontier","wild west","gunslinger"],
  "fiction":       ["fiction","novel","literary fiction","general fiction","contemporary","short stories"],
};

const GENRE_TO_SUBJECT = {
  "sci-fi":"science+fiction","fantasy":"fantasy+fiction","mystery":"mystery+fiction",
  "thriller":"thriller+fiction","horror":"horror+fiction","romance":"romance+fiction",
  "historical":"historical+fiction","non-fiction":"nonfiction","biography":"biography+autobiography",
  "self-help":"self+help","psychology":"psychology","philosophy":"philosophy",
  "history":"world+history","science":"science+popular","travel":"travel+adventure",
  "children":"children+picture+books","young adult":"young+adult+fiction",
  "graphic novel":"graphic+novels+comics","poetry":"poetry+verse","drama":"drama+plays",
  "humor":"humor+comedy","cooking":"cooking+recipes","health":"health+fitness",
  "business":"business+entrepreneurship","technology":"technology+computing",
  "art":"art+design","music":"music+musicians","sports":"sports+athletics",
  "politics":"politics+government","religion":"religion+spirituality",
  "mythology":"mythology+folklore","crime":"crime+fiction","adventure":"adventure+fiction",
  "western":"western+fiction","fiction":"literary+fiction",
};

const GENRE_EMOJI = {
  "sci-fi":"🚀","fantasy":"🧙","mystery":"🔍","thriller":"🔫","horror":"👻",
  "romance":"💕","historical":"🏛️","non-fiction":"📖","biography":"👤",
  "self-help":"🌱","psychology":"🧠","philosophy":"🤔","history":"📜",
  "science":"🔬","travel":"✈️","children":"🎨","young adult":"⚡",
  "graphic novel":"🎭","poetry":"✍️","drama":"🎭","humor":"😂",
  "cooking":"🍳","health":"💪","business":"💼","technology":"💻",
  "art":"🎨","music":"🎵","sports":"⚽","politics":"🏛️","religion":"🕊️",
  "mythology":"⚡","crime":"🚔","adventure":"🗺️","western":"🤠","fiction":"📗",
};

const ALL_GENRES = Object.keys(GENRE_TO_SUBJECT);

/* ══════════════════════════════════════════════════════════════════════
   INTENT DETECTION  (all synchronous — zero delay)
   ══════════════════════════════════════════════════════════════════════ */
function detectGenre(msg) {
  const lower = msg.toLowerCase();
  for (const [genre, aliases] of Object.entries(GENRE_ALIASES)) {
    for (const alias of aliases) {
      if (lower.includes(alias)) return genre;
    }
  }
  return null;
}

const ALL_BOOKS_TRIGGERS = ["all books","all genres","every genre","everything","all types","recommend all","show all","all categories","show everything","full list","complete list"];
const GREETING_TRIGGERS  = ["hello","hi","hey","howdy","greetings","good morning","good evening","good afternoon"];
const HELP_TRIGGERS      = ["help","what can you do","genres","list genres","show genres","what genres"];
const THANKS_TRIGGERS    = ["thanks","thank you","ty","cheers"];

function detectIntent(msg) {
  const lower = msg.toLowerCase().trim();
  if (ALL_BOOKS_TRIGGERS.some(t => lower.includes(t)))  return "all_books";
  if (detectGenre(lower))                                return "recommend";
  if (GREETING_TRIGGERS.some(t => lower === t || lower.startsWith(t + " ") || lower.endsWith(" " + t))) return "greeting";
  if (HELP_TRIGGERS.some(t => lower.includes(t)))       return "help";
  if (THANKS_TRIGGERS.some(t => lower.includes(t)))     return "thanks";
  return "search"; // free-text title / author search
}

/* ══════════════════════════════════════════════════════════════════════
   GOOGLE BOOKS  API
   ══════════════════════════════════════════════════════════════════════ */
async function fetchBooks(query, useSubject) {
  const q = useSubject
    ? "subject:" + (GENRE_TO_SUBJECT[query] || query)
    : query;

  const params = new URLSearchParams({
    q, key: GOOGLE_API_KEY, maxResults: 6, startIndex: 0,
    printType: "books", orderBy: "relevance", langRestrict: "en",
  });

  const ctrl = new AbortController();
  const tid  = setTimeout(() => ctrl.abort(), 7000);

  try {
    const res  = await fetch(GOOGLE_BOOKS_URL + "?" + params, { signal: ctrl.signal });
    clearTimeout(tid);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    return (data.items || []).map(parseBook).filter(Boolean);
  } catch {
    clearTimeout(tid);
    return [];
  }
}

function parseBook(item) {
  const info  = item.volumeInfo || {};
  const title = (info.title || "").trim();
  if (!title) return null;
  const desc  = info.description || info.subtitle || "No description available.";
  const thumb = (info.imageLinks && info.imageLinks.thumbnail || "")
    .replace("http://", "https://")
    .replace("&zoom=1", "&zoom=2");
  const year  = String(info.publishedDate || "").slice(0, 4);
  return {
    title,
    author:       (info.authors || []).join(", ") || "Unknown",
    description:  desc.slice(0, 220) + (desc.length > 220 ? "…" : ""),
    year:         /^\d{4}$/.test(year) ? year : null,
    thumbnail:    thumb,
    rating:       info.averageRating  || null,
    rating_count: info.ratingsCount   || 0,
    preview_link: info.previewLink    || info.infoLink || "#",
  };
}

/* ══════════════════════════════════════════════════════════════════════
   DOM — runs after page loads
   ══════════════════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", function () {

  /* ── AUTH FORMS ─────────────────────────────────────────────────── */
  var form = document.getElementById("form");
  if (form) {
    var userNameInput = document.getElementById("User_name-input");
    var emailInput    = document.getElementById("email-input");
    var passwordInput = document.getElementById("password");
    var errorMsg      = document.getElementById("error-message");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      document.querySelectorAll(".incorrect").forEach(function (el) { el.classList.remove("incorrect"); });
      errorMsg.innerText = "";

      var errors = userNameInput
        ? getSignupErrors(userNameInput.value.trim(), emailInput.value.trim(), passwordInput.value)
        : getLoginErrors(emailInput.value.trim(), passwordInput.value);
      if (errors.length) { errorMsg.innerText = errors.join(" · "); return; }

      if (userNameInput) {
        var users = JSON.parse(localStorage.getItem("void_users") || "[]");
        if (users.find(function (u) { return u.email === emailInput.value.trim(); })) {
          errorMsg.innerText = "Account already exists.";
          emailInput.parentElement.classList.add("incorrect");
          return;
        }
        users.push({ username: userNameInput.value.trim(), email: emailInput.value.trim(), password: btoa(passwordInput.value) });
        localStorage.setItem("void_users", JSON.stringify(users));
        localStorage.setItem("void_session", JSON.stringify({ username: userNameInput.value.trim() }));
      } else {
        var users = JSON.parse(localStorage.getItem("void_users") || "[]");
        var user  = users.find(function (u) { return u.email === emailInput.value.trim() && u.password === btoa(passwordInput.value); });
        if (!user) {
          errorMsg.innerText = "Invalid email or password.";
          emailInput.parentElement.classList.add("incorrect");
          passwordInput.parentElement.classList.add("incorrect");
          return;
        }
        localStorage.setItem("void_session", JSON.stringify({ username: user.username }));
      }
      window.location.href = "filter.html";
    });

    function getSignupErrors(u, e, p) {
      var err = [];
      if (!u) { err.push("Username required"); userNameInput.parentElement.classList.add("incorrect"); }
      if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { err.push("Valid email required"); emailInput.parentElement.classList.add("incorrect"); }
      if (!p) { err.push("Password required"); passwordInput.parentElement.classList.add("incorrect"); }
      else if (p.length < 8) { err.push("Password ≥ 8 chars"); passwordInput.parentElement.classList.add("incorrect"); }
      return err;
    }
    function getLoginErrors(e, p) {
      var err = [];
      if (!e) { err.push("Email required"); emailInput.parentElement.classList.add("incorrect"); }
      if (!p) { err.push("Password required"); passwordInput.parentElement.classList.add("incorrect"); }
      return err;
    }
    [userNameInput, emailInput, passwordInput].filter(Boolean).forEach(function (inp) {
      inp.addEventListener("input", function () { inp.parentElement.classList.remove("incorrect"); errorMsg.innerText = ""; });
    });
  }

  /* ── CHAT / UNIFIED SEARCH ──────────────────────────────────────── */
  var chatMessages = document.getElementById("chat-messages");
  var chatInput    = document.getElementById("chat-input");
  var chatSend     = document.getElementById("chat-send");
  if (!chatMessages || !chatInput || !chatSend) return;

  var session = JSON.parse(localStorage.getItem("void_session") || "{}");
  addMsg("bot",
    session.username
      ? "Hello, " + session.username + "! I'm VOID 📚 Search any book, author, or genre — or type \"all books\" to browse everything!"
      : "Hello! I'm VOID 📚 Search any book, author, or genre — or type \"all books\" to browse every category!"
  );

  chatSend.addEventListener("click", handleSend);
  chatInput.addEventListener("keydown", function (e) { if (e.key === "Enter") handleSend(); });

  /* ── Main handler ─────────────────────────────────────────────── */
  function handleSend() {
    var text = chatInput.value.trim();
    if (!text || chatSend.disabled) return;

    chatInput.value  = "";
    chatSend.disabled = true;
    addMsg("user", text);

    var intent = detectIntent(text);
    var genre  = detectGenre(text);

    /* BOOK PATH — skeletons appear BEFORE the async fetch */
    if (intent === "recommend" || intent === "search") {
      addLabel(genre ? ((GENRE_EMOJI[genre] || "📚") + " " + cap(genre) + " Books") : "📚 Search Results");
      var grid = addSkeletons(6);
      chatSend.disabled = false; // unblock immediately

      // start the fetch — grid reference is captured in closure
      (function (capturedGrid, capturedIntent, capturedGenre, capturedText) {
        var p = capturedIntent === "recommend"
          ? fetchBooks(capturedGenre, true).then(function (books) {
              return books.length ? books : fetchBooks(capturedGenre + " books", false);
            })
          : fetchBooks(capturedText, false);

        p.then(function (books) {
          if (!books.length) {
            capturedGrid.innerHTML = "<p class=\"search-status\">No results for \"" + esc(capturedText) + "\". Try a different search.</p>";
          } else {
            fillGrid(capturedGrid, books);
            addMsg("bot", "Found " + books.length + " result" + (books.length !== 1 ? "s" : "") + "! 📖");
          }
        });
      })(grid, intent, genre, text);

      return;
    }

    /* ALL BOOKS */
    if (intent === "all_books") {
      addMsg("bot", "Here are all genres I know! 📚 Click any to load books:");
      addGenrePanel();
      chatSend.disabled = false;
      return;
    }

    /* INSTANT TEXT RESPONSES */
    addMsg("bot", getInstantResponse(intent));
    chatSend.disabled = false;
  }

  function getInstantResponse(intent) {
    if (intent === "greeting") {
      var greets = [
        "Hey there, bookworm! 📚 Tell me a genre, book title, or author name!",
        "Hello, reader! 👋 I know 35+ genres. Try 'horror books' or search an author!",
        "Hi! Ready to explore? 🌟 Type a genre like 'sci-fi' or any book title!",
      ];
      return greets[Math.floor(Math.random() * greets.length)];
    }
    if (intent === "help") {
      return "I cover " + ALL_GENRES.length + " genres from Google Books!\n\nTry: \"fantasy\", \"mystery books\", \"cooking\", \"Stephen King\", \"Harry Potter\", or \"all books\" to see every genre.";
    }
    if (intent === "thanks") {
      return ["You're welcome! 😊 Happy reading!", "Glad I could help! 📖", "Enjoy your next read! ✨"][Math.floor(Math.random() * 3)];
    }
    return "Not sure what you mean 🤔 — try a genre name, book title, or author!";
  }

  /* ── Genre chip panel ────────────────────────────────────────────── */
  function addGenrePanel() {
    var wrap = document.createElement("div");
    wrap.className = "all-genres-panel";
    var chipGrid = document.createElement("div");
    chipGrid.className = "genre-chip-grid";

    ALL_GENRES.forEach(function (g) {
      var chip = document.createElement("button");
      chip.className = "genre-chip";
      chip.textContent = (GENRE_EMOJI[g] || "📚") + " " + cap(g);
      chip.addEventListener("click", function () {
        chip.classList.add("chip-loading");
        addLabel((GENRE_EMOJI[g] || "📚") + " " + cap(g) + " Books");
        var skGrid = addSkeletons(6);
        fetchBooks(g, true).then(function (books) {
          chip.classList.remove("chip-loading");
          if (books.length) {
            fillGrid(skGrid, books);
            addMsg("bot", "Loaded " + cap(g) + " picks for you! 📚");
          } else {
            skGrid.innerHTML = "<p class=\"search-status\">No results found. Try again.</p>";
          }
        });
      });
      chipGrid.appendChild(chip);
    });

    wrap.appendChild(chipGrid);
    chatMessages.appendChild(wrap);
    scrollBottom();
  }

  /* ── DOM helpers ─────────────────────────────────────────────────── */
  function addMsg(type, text) {
    var el = document.createElement("div");
    el.className = "msg msg--" + type;
    el.textContent = text;
    chatMessages.appendChild(el);
    scrollBottom();
    return el;
  }

  function addLabel(text) {
    var el = document.createElement("div");
    el.className = "book-section-label";
    el.textContent = text;
    chatMessages.appendChild(el);
    scrollBottom();
    return el;
  }

  function addSkeletons(count) {
    var grid = document.createElement("div");
    grid.className = "chat-book-grid";
    for (var i = 0; i < count; i++) {
      var card = document.createElement("div");
      card.className = "chat-book-card skeleton-card";
      card.innerHTML =
        "<div class=\"skeleton-thumb\"></div>" +
        "<div class=\"cbc-info\">" +
          "<div class=\"skeleton-line\" style=\"width:80%\"></div>" +
          "<div class=\"skeleton-line\" style=\"width:55%\"></div>" +
          "<div class=\"skeleton-line\" style=\"width:65%\"></div>" +
          "<div class=\"skeleton-line\" style=\"width:90%\"></div>" +
        "</div>";
      grid.appendChild(card);
    }
    chatMessages.appendChild(grid);
    scrollBottom();
    return grid;
  }

  function fillGrid(grid, books) {
    grid.innerHTML = "";
    books.forEach(function (b) {
      var card = document.createElement("div");
      card.className = "chat-book-card";
      card.innerHTML =
        (b.thumbnail ? "<img src=\"" + esc(b.thumbnail) + "\" alt=\"" + esc(b.title) + "\" loading=\"eager\" onerror=\"this.style.display='none';this.nextElementSibling.style.display='flex'\">" : "") +
        "<div class=\"cbc-no-thumb\"" + (b.thumbnail ? " style=\"display:none\"" : "") + ">📚</div>" +
        "<div class=\"cbc-info\">" +
          "<strong>" + esc(b.title) + "</strong>" +
          "<span>" + esc(b.author) + (b.year ? " · " + b.year : "") + "</span>" +
          (b.rating ? "<span class=\"cbc-rating\">★ " + b.rating + " (" + b.rating_count.toLocaleString() + ")</span>" : "") +
          "<p class=\"cbc-desc\">" + esc(b.description) + "</p>" +
          "<a href=\"" + esc(b.preview_link) + "\" target=\"_blank\" rel=\"noopener\">View on Google Books →</a>" +
        "</div>";
      grid.appendChild(card);
    });
    scrollBottom();
  }

  function scrollBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ""; }
});
