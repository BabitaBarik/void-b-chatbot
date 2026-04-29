/* ── VOID E-CHATBOT — script.js ──────────────────────────────────────────
   30+ genres · all-books mode · recommender.py logic (expanded)
   ────────────────────────────────────────────────────────────────────── */

const GOOGLE_API_KEY   = "AIzaSyCGKijD-yoZCGlmAq7Ymul3MLcEa8Cb_NY";
const GOOGLE_BOOKS_URL = "https://www.googleapis.com/books/v1/volumes";

/* ══════════════════════════════════════════════════════════════════════
   GENRE MAPS  — 30+ genres
   ══════════════════════════════════════════════════════════════════════ */
const GENRE_ALIASES = {
  "sci-fi":          ["sci-fi","scifi","science fiction","sf","space","futuristic","cyberpunk","dystopian","space opera","hard sci-fi","soft sci-fi"],
  "fantasy":         ["fantasy","magic","wizard","dragon","epic fantasy","sword","sorcery","fairy","fae","mythic","high fantasy","low fantasy","dark fantasy"],
  "mystery":         ["mystery","detective","crime","whodunit","noir","investigation","murder mystery","cozy mystery","hard-boiled"],
  "thriller":        ["thriller","suspense","spy","conspiracy","espionage","psychological thriller","legal thriller","medical thriller"],
  "horror":          ["horror","scary","ghost","paranormal","dark","haunted","occult","supernatural","gothic horror","creature","monster","slasher"],
  "romance":         ["romance","love story","romantic","love","chick lit","contemporary romance","paranormal romance","historical romance"],
  "historical":      ["historical fiction","period","medieval","ancient","war","world war","victorian","renaissance","napoleonic","viking","samurai"],
  "non-fiction":     ["non-fiction","nonfiction","true story","educational"],
  "biography":       ["biography","autobiography","memoir","life story","true events","based on true"],
  "self-help":       ["self-help","self help","personal development","motivation","productivity","mindset","habits","success","wellness","mental health"],
  "psychology":      ["psychology","mind","behaviour","cognitive","brain","mental","psyche","neuroscience","psychiatry"],
  "philosophy":      ["philosophy","ethics","logic","existentialism","stoicism","metaphysics","epistemology","moral","meaning of life"],
  "history":         ["history","world history","ancient history","civilization","empire","revolution","medieval history","military history"],
  "science":         ["science","physics","chemistry","biology","evolution","astronomy","cosmology","quantum","mathematics","maths"],
  "travel":          ["travel","adventure","exploration","journey","backpacking","wanderlust","travel memoir","geography"],
  "children":        ["children","kids","picture book","middle grade","young readers","bedtime story","fairy tale","fable","juvenile"],
  "young adult":     ["young adult","ya","teen","teenager","coming of age","high school","dystopia ya","ya fantasy","ya romance"],
  "graphic novel":   ["graphic novel","manga","comic","comic book","illustrated","visual novel","sequential art"],
  "poetry":          ["poetry","poems","verse","haiku","sonnet","lyric","spoken word","prose poetry"],
  "drama":           ["drama","play","screenplay","stage","theatrical","shakespeare","tragedy","comedy drama"],
  "humor":           ["humor","comedy","funny","satire","parody","wit","humour","jokes","comic fiction"],
  "cooking":         ["cooking","cookbook","recipes","food","baking","cuisine","chef","culinary","gastronomy"],
  "health":          ["health","fitness","nutrition","diet","exercise","body","medical","wellbeing","yoga"],
  "business":        ["business","entrepreneurship","startup","marketing","finance","investing","leadership","management","economics"],
  "technology":      ["technology","tech","programming","coding","computer science","software","ai","artificial intelligence","machine learning"],
  "art":             ["art","design","painting","drawing","illustration","architecture","photography","visual art","art history"],
  "music":           ["music","musician","band","rock","jazz","classical music","music theory","biography music","songwriting"],
  "sports":          ["sports","football","cricket","basketball","baseball","tennis","athletics","soccer","sport biography"],
  "politics":        ["politics","political","government","democracy","policy","election","diplomacy","international relations"],
  "religion":        ["religion","spirituality","faith","buddhism","hinduism","christianity","islam","mythology","sacred"],
  "mythology":       ["mythology","myth","legend","folklore","greek mythology","norse mythology","celtic","egyptian myth","fairy tale"],
  "crime":           ["crime fiction","heist","gangster","mafia","serial killer","forensic","true crime","police procedural"],
  "adventure":       ["adventure","action adventure","quest","treasure hunt","survival","exploration fiction","expedition"],
  "western":         ["western","cowboy","frontier","wild west","gunslinger"],
  "fiction":         ["fiction","novel","literary fiction","general fiction","contemporary","short stories","anthology"],
};

const GENRE_TO_SUBJECT = {
  "sci-fi":          "science+fiction",
  "fantasy":         "fantasy+fiction",
  "mystery":         "mystery+fiction",
  "thriller":        "thriller+fiction",
  "horror":          "horror+fiction",
  "romance":         "romance+fiction",
  "historical":      "historical+fiction",
  "non-fiction":     "nonfiction",
  "biography":       "biography+autobiography",
  "self-help":       "self+help",
  "psychology":      "psychology",
  "philosophy":      "philosophy",
  "history":         "world+history",
  "science":         "science+popular",
  "travel":          "travel+adventure",
  "children":        "children+picture+books",
  "young adult":     "young+adult+fiction",
  "graphic novel":   "graphic+novels+comics",
  "poetry":          "poetry+verse",
  "drama":           "drama+plays",
  "humor":           "humor+comedy",
  "cooking":         "cooking+recipes",
  "health":          "health+fitness",
  "business":        "business+entrepreneurship",
  "technology":      "technology+computing",
  "art":             "art+design",
  "music":           "music+musicians",
  "sports":          "sports+athletics",
  "politics":        "politics+government",
  "religion":        "religion+spirituality",
  "mythology":       "mythology+folklore",
  "crime":           "crime+fiction",
  "adventure":       "adventure+fiction",
  "western":         "western+fiction",
  "fiction":         "literary+fiction",
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

// All genres for "show all" / "recommend all" mode
const ALL_GENRES = Object.keys(GENRE_TO_SUBJECT);

const GREETING_TRIGGERS = ["hello","hi","hey","good morning","good evening","good afternoon","howdy","sup","greetings"];
const HELP_TRIGGERS     = ["help","what can you do","commands","options","genres","what genres","show genres","list genres"];
const THANKS_TRIGGERS   = ["thanks","thank you","ty","cheers","great","awesome","perfect","wonderful"];
const ALL_BOOKS_TRIGGERS = [
  "all","all books","all genres","every genre","everything","all types",
  "all kind","all kinds","recommend all","show all","all categories",
  "every type","show everything","what do you have","full list","complete list",
];

/* ══════════════════════════════════════════════════════════════════════
   INTENT & GENRE DETECTION
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

function wordMatch(word, text) {
  return new RegExp(`\\b${word.replace(/[-+]/g,'\\$&')}\\b`,'i').test(text);
}

function isAllBooksRequest(msg) {
  const lower = msg.toLowerCase();
  return ALL_BOOKS_TRIGGERS.some(t => lower.includes(t));
}

function detectIntent(msg) {
  const lower = msg.toLowerCase();
  if (isAllBooksRequest(msg))                               return "all_books";
  if (detectGenre(msg))                                     return "recommend";
  if (GREETING_TRIGGERS.some(t => wordMatch(t, lower)))    return "greeting";
  if (HELP_TRIGGERS.some(t => lower.includes(t)))          return "help";
  if (THANKS_TRIGGERS.some(t => wordMatch(t, lower)))      return "thanks";
  return "unknown";
}

/* ══════════════════════════════════════════════════════════════════════
   GOOGLE BOOKS API
   ══════════════════════════════════════════════════════════════════════ */
async function fetchGoogleBooks(query, count=8, useSubject=false) {
  const offsets  = [0,0,0,5,10];
  const startIdx = offsets[Math.floor(Math.random()*offsets.length)];
  const q        = useSubject ? `subject:${GENRE_TO_SUBJECT[query]||query}` : query;

  const params = new URLSearchParams({
    q, key:GOOGLE_API_KEY, maxResults:count, startIndex:startIdx,
    printType:"books", orderBy:"relevance", langRestrict:"en",
  });

  try {
    const res  = await fetch(`${GOOGLE_BOOKS_URL}?${params}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    return (data.items||[]).map(item=>{
      const info  = item.volumeInfo||{};
      const title = (info.title||"").trim();
      if (!title) return null;
      const desc  = info.description||info.subtitle||"No description available.";
      const thumb = (info.imageLinks?.thumbnail||"")
        .replace("http://","https://").replace("&zoom=1","&zoom=2");
      const year  = String(info.publishedDate||"").slice(0,4);
      return {
        title,
        author:       (info.authors||[]).join(", ")||"Unknown",
        description:  desc.slice(0,240)+(desc.length>240?"…":""),
        year:         /^\d{4}$/.test(year)?year:null,
        thumbnail:    thumb,
        rating:       info.averageRating||null,
        rating_count: info.ratingsCount||0,
        preview_link: info.previewLink||info.infoLink||"#",
        pages:        info.pageCount||null,
        publisher:    info.publisher||"",
        source:       "google",
      };
    }).filter(Boolean);
  } catch { return []; }
}

/* ══════════════════════════════════════════════════════════════════════
   RESPONSE BUILDERS
   ══════════════════════════════════════════════════════════════════════ */
async function buildRecommendation(genre) {
  const emoji = GENRE_EMOJI[genre]||"📚";
  let books   = await fetchGoogleBooks(genre, 8, true);
  if (!books.length) books = await fetchGoogleBooks(`${genre} books`, 8, false);
  if (!books.length) return { type:"error", message:`Sorry, couldn't find **${genre}** books right now.` };
  return {
    type:"recommendation", genre, emoji,
    message:`Here are **${cap(genre)}** ${emoji} picks from Google Books 🌐:`,
    books,
  };
}

// Fetch one representative book per genre for the "all genres" panel
async function buildAllBooks() {
  return { type:"all_books" };
}

function buildGreeting() {
  const opts=[
    "Hey there, bookworm! 📚 I'm VOID. Tell me a genre — or type 'all books' to browse every category!",
    "Hello, reader! 👋 I know 35+ genres. Try 'recommend fantasy', 'show mystery books', or 'all books'.",
    "Hi! Ready to explore? 🌟 I cover sci-fi, romance, horror, cooking, technology and 30 more genres!",
  ];
  return { type:"greeting", message:opts[Math.floor(Math.random()*opts.length)] };
}

function buildHelp() {
  const rows = Object.keys(GENRE_EMOJI)
    .map(g=>`${GENRE_EMOJI[g]} **${cap(g)}**`).join("  ");
  return {
    type:"help",
    message:`I cover **${ALL_GENRES.length} genres** from Google Books 🌐!\n\n${rows}\n\nType a genre name, or **"all books"** to see every category at once!`,
  };
}

function buildThanks() {
  const opts=["You're welcome! 😊 Want more recommendations?","Happy to help! 📖","Glad I could help! Enjoy your read! ✨"];
  return { type:"thanks", message:opts[Math.floor(Math.random()*opts.length)] };
}

function buildUnknown() {
  return {
    type:"unknown",
    message:'Not sure what you mean 🤔\n\nTry:\n• "Recommend fantasy books"\n• "Show me thrillers"\n• "Self-help books"\n• "All books" — to browse every genre',
  };
}

async function getRecommenderResponse(userMessage) {
  if (!userMessage||!userMessage.trim()) return buildUnknown();
  const intent = detectIntent(userMessage);
  if (intent==="all_books")  return buildAllBooks();
  if (intent==="greeting")   return buildGreeting();
  if (intent==="help")       return buildHelp();
  if (intent==="thanks")     return buildThanks();
  if (intent==="recommend")  return buildRecommendation(detectGenre(userMessage));
  return buildUnknown();
}

/* ══════════════════════════════════════════════════════════════════════
   DOM LOGIC
   ══════════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  /* ── AUTH FORMS ─────────────────────────────────────────────────── */
  const form = document.getElementById('form');
  if (form) {
    const userNameInput = document.getElementById('User_name-input');
    const emailInput    = document.getElementById('email-input');
    const passwordInput = document.getElementById('password');
    const errorMsg      = document.getElementById('error-message');

    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      document.querySelectorAll('.incorrect').forEach(el=>el.classList.remove('incorrect'));
      errorMsg.innerText='';
      const errors = userNameInput
        ? getSignupErrors(userNameInput.value.trim(), emailInput.value.trim(), passwordInput.value)
        : getLoginErrors(emailInput.value.trim(), passwordInput.value);
      if (errors.length>0){ errorMsg.innerText=errors.join(' · '); return; }

      if (userNameInput) {
        const users=JSON.parse(localStorage.getItem('void_users')||'[]');
        if (users.find(u=>u.email===emailInput.value.trim())){
          errorMsg.innerText='Account already exists.'; emailInput.parentElement.classList.add('incorrect'); return;
        }
        users.push({ username:userNameInput.value.trim(), email:emailInput.value.trim(), password:btoa(passwordInput.value) });
        localStorage.setItem('void_users',JSON.stringify(users));
        localStorage.setItem('void_session',JSON.stringify({ username:userNameInput.value.trim() }));
      } else {
        const users=JSON.parse(localStorage.getItem('void_users')||'[]');
        const user=users.find(u=>u.email===emailInput.value.trim()&&u.password===btoa(passwordInput.value));
        if (!user){ errorMsg.innerText='Invalid email or password.'; emailInput.parentElement.classList.add('incorrect'); passwordInput.parentElement.classList.add('incorrect'); return; }
        localStorage.setItem('void_session',JSON.stringify({ username:user.username }));
      }
      window.location.href='filter.html';
    });

    function getSignupErrors(u,e,p){
      const err=[];
      if (!u){err.push('Username required');userNameInput.parentElement.classList.add('incorrect');}
      if (!e||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)){err.push('Valid email required');emailInput.parentElement.classList.add('incorrect');}
      if (!p){err.push('Password required');passwordInput.parentElement.classList.add('incorrect');}
      else if(p.length<8){err.push('Password ≥ 8 chars');passwordInput.parentElement.classList.add('incorrect');}
      return err;
    }
    function getLoginErrors(e,p){
      const err=[];
      if(!e){err.push('Email required');emailInput.parentElement.classList.add('incorrect');}
      if(!p){err.push('Password required');passwordInput.parentElement.classList.add('incorrect');}
      return err;
    }
    [userNameInput,emailInput,passwordInput].filter(Boolean).forEach(inp=>{
      inp.addEventListener('input',()=>{ inp.parentElement.classList.remove('incorrect'); errorMsg.innerText=''; });
    });
  }

  /* ── CHAT ────────────────────────────────────────────────────────── */
  const chatMessages = document.getElementById('chat-messages');
  const chatInput    = document.getElementById('chat-input');
  const chatSend     = document.getElementById('chat-send');

  if (chatMessages && chatInput && chatSend) {
    const session = JSON.parse(localStorage.getItem('void_session')||'{}');
    const greet   = session.username
      ? `Hello, ${session.username}! I'm VOID 📚 I know ${ALL_GENRES.length}+ genres. Try "recommend horror", "show cooking books", or type "all books" to browse everything!`
      : `Hello! I'm VOID 📚 I know ${ALL_GENRES.length}+ genres. Try "recommend thriller", "fantasy books", or type "all books" to browse every category!`;
    appendMsg('bot', greet);

    let history=[];

    async function sendChat() {
      const text=chatInput.value.trim();
      if (!text) return;
      chatInput.value='';
      chatSend.disabled=true;
      appendMsg('user', text);
      history.push({ role:'user', content:text });
      const typingEl=showTyping();

      const rec = await getRecommenderResponse(text);

      if (rec.type==='all_books') {
        typingEl.remove(); chatSend.disabled=false;
        appendMsg('bot','Here are all the book genres I can recommend! 📚 Fetching top picks for every category…');
        history.push({ role:'assistant', content:'Showing all genres panel.' });
        renderAllGenresPanel();
        return;
      }

      if (rec.type==='recommendation') {
        typingEl.remove(); chatSend.disabled=false;
        appendMsg('bot', rec.message);
        appendBookCards(rec.books, rec.genre);
        history.push({ role:'assistant', content:rec.message+' [book cards shown]' });
        return;
      }

      if (['greeting','help','thanks'].includes(rec.type)) {
        typingEl.remove(); chatSend.disabled=false;
        appendMsg('bot', rec.message);
        history.push({ role:'assistant', content:rec.message });
        return;
      }

      // Claude fallback
      try {
        const resp = await fetch('https://api.anthropic.com/v1/messages',{
          method:'POST', headers:{'Content-Type':'application/json'},
          body:JSON.stringify({
            model:'claude-sonnet-4-20250514', max_tokens:1000,
            system:`You are VOID, a sleek e-chatbot specialising in books and literature. You know ${ALL_GENRES.length}+ genres. Helpful, concise, slightly mysterious. Under 150 words.`,
            messages:history,
          }),
        });
        typingEl.remove();
        if (!resp.ok) throw new Error(`API ${resp.status}`);
        const data  = await resp.json();
        const reply = data.content.find(c=>c.type==='text')?.text||'...';
        history.push({ role:'assistant', content:reply });
        appendMsg('bot', reply);
      } catch(err) {
        typingEl.remove();
        appendMsg('bot',`Signal lost. [${err.message}]`);
      } finally { chatSend.disabled=false; }
    }

    chatSend.addEventListener('click', sendChat);
    chatInput.addEventListener('keydown', e=>{ if(e.key==='Enter') sendChat(); });

    // ── All Genres Panel ──────────────────────────────────────────────
    function renderAllGenresPanel() {
      const wrap = document.createElement('div');
      wrap.className = 'all-genres-panel';

      const grid = document.createElement('div');
      grid.className = 'genre-chip-grid';

      ALL_GENRES.forEach(genre=>{
        const chip = document.createElement('button');
        chip.className = 'genre-chip';
        chip.innerHTML = `${GENRE_EMOJI[genre]||'📚'} ${cap(genre)}`;
        chip.addEventListener('click', async ()=>{
          // Mark loading
          chip.classList.add('chip-loading');
          const result = await buildRecommendation(genre);
          chip.classList.remove('chip-loading');

          if (result.type==='recommendation') {
            appendMsg('bot', result.message);
            appendBookCards(result.books, result.genre);
          } else {
            appendMsg('bot', result.message);
          }
          chatMessages.scrollTop=chatMessages.scrollHeight;
        });
        grid.appendChild(chip);
      });

      wrap.appendChild(grid);
      chatMessages.appendChild(wrap);
      chatMessages.scrollTop=chatMessages.scrollHeight;
    }

    function appendMsg(type, text) {
      const el=document.createElement('div');
      el.className=`msg msg--${type}`;
      el.textContent=text;
      chatMessages.appendChild(el);
      chatMessages.scrollTop=chatMessages.scrollHeight;
    }

    function appendBookCards(books, genre) {
      const label = document.createElement('div');
      label.className='book-section-label';
      label.textContent=`${GENRE_EMOJI[genre]||'📚'} ${cap(genre||'')} Books`;
      chatMessages.appendChild(label);

      const wrap=document.createElement('div');
      wrap.className='chat-book-grid';
      books.slice(0,8).forEach(b=>{
        const card=document.createElement('div');
        card.className='chat-book-card';
        card.innerHTML=`
          ${b.thumbnail?`<img src="${esc(b.thumbnail)}" alt="${esc(b.title)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`:''}
          <div class="cbc-no-thumb"${b.thumbnail?' style="display:none"':''}>📚</div>
          <div class="cbc-info">
            <strong>${esc(b.title)}</strong>
            <span>${esc(b.author)}${b.year?` · ${b.year}`:''}</span>
            ${b.rating?`<span class="cbc-rating">★ ${b.rating} (${(b.rating_count||0).toLocaleString()})</span>`:''}
            <p class="cbc-desc">${esc(b.description)}</p>
            <a href="${esc(b.preview_link)}" target="_blank" rel="noopener">View on Google Books →</a>
          </div>`;
        wrap.appendChild(card);
      });
      chatMessages.appendChild(wrap);
      chatMessages.scrollTop=chatMessages.scrollHeight;
    }

    function showTyping() {
      const el=document.createElement('div');
      el.className='typing-indicator';
      el.innerHTML='<span></span><span></span><span></span>';
      chatMessages.appendChild(el);
      chatMessages.scrollTop=chatMessages.scrollHeight;
      return el;
    }
  }

  /* ── SEARCH BAR ──────────────────────────────────────────────────── */
  const searchInput = document.getElementById('book-search-input');
  const searchBtn   = document.getElementById('book-search-btn');
  const resultsDiv  = document.getElementById('search-results');

  if (searchInput && searchBtn && resultsDiv) {
    async function searchBooks() {
      const query=searchInput.value.trim();
      if (!query) return;
      resultsDiv.innerHTML='<p class="search-status">Searching the void…</p>';

      const genre=detectGenre(query);
      const books=genre
        ? await fetchGoogleBooks(genre, 10, true)
        : await fetchGoogleBooks(query, 10, false);

      if (!books.length){ resultsDiv.innerHTML='<p class="search-status">No books found. Try a different query.</p>'; return; }

      const grid=document.createElement('div');
      grid.className='results-grid';
      books.forEach(b=>{
        const card=document.createElement('div');
        card.className='book-card';
        card.innerHTML=`
          ${b.thumbnail?`<img class="book-thumb" src="${esc(b.thumbnail)}" alt="${esc(b.title)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`:``}
          <div class="book-thumb-placeholder"${b.thumbnail?' style="display:none"':''}>📚</div>
          <div class="book-card-body">
            <h4>${esc(b.title)}</h4>
            <p class="book-author">${esc(b.author)}${b.year?` · ${b.year}`:''}</p>
            ${b.rating?`<p class="book-rating">★ ${b.rating} <span>(${b.rating_count.toLocaleString()})</span></p>`:''}
            <p class="book-desc">${esc(b.description)}</p>
            <a href="${esc(b.preview_link)}" target="_blank" rel="noopener">View on Google Books →</a>
          </div>`;
        grid.appendChild(card);
      });
      resultsDiv.innerHTML='';
      resultsDiv.appendChild(grid);
    }
    searchBtn.addEventListener('click', searchBooks);
    searchInput.addEventListener('keydown', e=>{ if(e.key==='Enter') searchBooks(); });
  }

  /* ── HELPERS ──────────────────────────────────────────────────── */
  function esc(str){ return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function cap(s){ return s?s.charAt(0).toUpperCase()+s.slice(1):''; }
});