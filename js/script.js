/* =========================================================
   VASHE CONSTRUCTION — site behaviour
   Edit WHATSAPP_NUMBER below to change the destination number
   for every WhatsApp link, the survey form and the chatbot.
   Format: country code + number, no "+", no spaces, no leading 0.
   ========================================================= */
const WHATSAPP_NUMBER = "263773550006"; // +263 77 355 0006

function waLink(message){
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/* ---------- year ---------- */
document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- mobile nav ---------- */
const navToggle = document.getElementById("navToggle");
const header = document.querySelector(".site-header");
navToggle.addEventListener("click", () => {
  const isOpen = header.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
});
document.querySelectorAll(".main-nav a").forEach(a=>{
  a.addEventListener("click", ()=> header.classList.remove("is-open"));
});

/* ---------- generic whatsapp buttons ---------- */
document.getElementById("heroWhatsapp").addEventListener("click", (e)=>{
  e.preventDefault();
  window.open(waLink("Hi Vashe Construction, I'd like to discuss a project."), "_blank");
});
document.getElementById("footerWhatsapp").addEventListener("click", (e)=>{
  e.preventDefault();
  window.open(waLink("Hi Vashe Construction, I'd like to discuss a project."), "_blank");
});

/* ---------- service tabs ---------- */
const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");
tabButtons.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    tabButtons.forEach(b=>b.classList.remove("is-active"));
    tabPanels.forEach(p=>p.classList.remove("is-active"));
    btn.classList.add("is-active");
    document.querySelector(`.tab-panel[data-panel="${btn.dataset.tab}"]`).classList.add("is-active");
  });
});

/* =========================================================
   SURVEY / QUICK-ASSESSMENT FORM
   No backend is required to launch this on GitHub Pages:
   the form compiles answers into a WhatsApp message.
   To collect submissions in a database/spreadsheet instead,
   see the README section "Connecting a real backend".
   ========================================================= */
const surveyForm = document.getElementById("surveyForm");
surveyForm.addEventListener("submit", (e)=>{
  e.preventDefault();

  const fd = new FormData(surveyForm);
  const fullName = fd.get("fullName")?.trim();
  const phone = fd.get("phone")?.trim();
  const location = fd.get("location")?.trim();
  const jobTypes = fd.getAll("jobType");

  if(!fullName || !phone || !location){
    alert("Please fill in your name, phone number and project location.");
    return;
  }
  if(jobTypes.length === 0){
    alert("Please select at least one option for the nature of the job.");
    return;
  }

  const lines = [
    "New project enquiry from the website:",
    `Name: ${fullName}`,
    `Phone: ${phone}`,
    `Location: ${location}`,
    `Contact type: ${fd.get("clientType")}`,
    `Nature of job: ${jobTypes.join(", ")}`,
    `Approx. scale: ${fd.get("scale")}`,
    `Timeline: ${fd.get("timeline")}`,
  ];
  const details = fd.get("details")?.trim();
  if(details) lines.push(`Details: ${details}`);

  window.open(waLink(lines.join("\n")), "_blank");
});

/* =========================================================
   REVIEWS & FEEDBACK
   Seed reviews ship with the site. Visitor-submitted reviews
   are stored in this browser's localStorage so the demo works
   with zero backend. Because localStorage is per-browser, two
   visitors won't see each other's new reviews until you wire
   up a shared store — see README "Connecting a real backend".
   ========================================================= */
const SEED_REVIEWS = [
  { name: "Tendai M.", org: "Mashonaland dairy farm", rating: 5,
    text: "Vashe rebuilt our milking parlour and added a proper storage facility. They understood exactly what a working farm needs." },
  { name: "St. Anne's Primary", org: "School administration", rating: 5,
    text: "They widened our doorways and built ramps to both blocks. Our learners with mobility needs can now move around independently." },
  { name: "Rutendo C.", org: "Homeowner, Harare", rating: 4,
    text: "Solid renovation work on our kitchen and bathroom. Communication was clear throughout and they kept to the agreed budget." },
];

const STORAGE_KEY = "vashe_reviews_v1";

function loadReviews(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    const stored = raw ? JSON.parse(raw) : [];
    return [...SEED_REVIEWS, ...stored];
  }catch(err){
    console.error("Could not read stored reviews:", err);
    return [...SEED_REVIEWS];
  }
}

function saveReview(review){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    const stored = raw ? JSON.parse(raw) : [];
    stored.push(review);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }catch(err){
    console.error("Could not save review:", err);
  }
}

function starString(n){
  return "★".repeat(n) + "☆".repeat(5-n);
}

function renderReviews(){
  const reviews = loadReviews();
  const grid = document.getElementById("reviewsGrid");
  grid.innerHTML = reviews.slice(-9).reverse().map(r => `
    <article class="review-card">
      <span class="stars">${starString(r.rating)}</span>
      <p>"${escapeHTML(r.text)}"</p>
      <p class="who">${escapeHTML(r.name)}${r.org ? " — " + escapeHTML(r.org) : ""}</p>
    </article>
  `).join("");

  const avg = reviews.reduce((sum,r)=>sum+r.rating,0) / reviews.length;
  document.getElementById("avgScore").textContent = avg.toFixed(1);
  document.getElementById("avgStars").textContent = starString(Math.round(avg));
  document.getElementById("reviewCount").textContent = `Based on ${reviews.length} review${reviews.length===1?"":"s"}`;
}

function escapeHTML(str){
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

renderReviews();

/* star picker */
let selectedRating = 0;
const starButtons = document.querySelectorAll("#starPicker button");
starButtons.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    selectedRating = Number(btn.dataset.value);
    document.getElementById("revRating").value = selectedRating;
    starButtons.forEach(b=> b.classList.toggle("is-filled", Number(b.dataset.value) <= selectedRating));
  });
});

const reviewForm = document.getElementById("reviewForm");
reviewForm.addEventListener("submit", (e)=>{
  e.preventDefault();
  const fd = new FormData(reviewForm);
  const name = fd.get("revName")?.trim();
  const text = fd.get("revText")?.trim();
  const org = fd.get("revOrg")?.trim();

  if(!name || !text){
    alert("Please add your name and your feedback.");
    return;
  }
  if(selectedRating === 0){
    alert("Please select a star rating.");
    return;
  }

  saveReview({ name, org, rating: selectedRating, text });
  reviewForm.reset();
  selectedRating = 0;
  starButtons.forEach(b=>b.classList.remove("is-filled"));
  renderReviews();
  alert("Thank you — your feedback has been added.");
});

/* =========================================================
   CHATBOT WIDGET
   A lightweight in-page assistant that answers common
   questions and hands off to the real WhatsApp line for
   anything that needs a human. It does not call any AI API —
   see README "Upgrading the chatbot" to wire one in.
   ========================================================= */
const chatbot = document.getElementById("chatbot");
const chatbotToggle = document.getElementById("chatbotToggle");
const chatbotClose = document.getElementById("chatbotClose");
const chatbotBody = document.getElementById("chatbotBody");
const chatbotForm = document.getElementById("chatbotForm");
const chatbotText = document.getElementById("chatbotText");
const chatbotQuick = document.getElementById("chatbotQuick");

function addBubble(text, who){
  const div = document.createElement("div");
  div.className = `bubble bubble-${who}`;
  div.textContent = text;
  chatbotBody.appendChild(div);
  chatbotBody.scrollTop = chatbotBody.scrollHeight;
}

function addWhatsappHandoff(userMessage){
  const div = document.createElement("div");
  div.className = "bubble bubble-bot";
  div.innerHTML = `Tap below to continue this on WhatsApp with our team: <br><a href="${waLink(userMessage)}" target="_blank" style="color:var(--forest);font-weight:700;">Open WhatsApp chat →</a>`;
  chatbotBody.appendChild(div);
  chatbotBody.scrollTop = chatbotBody.scrollHeight;
}

chatbotToggle.addEventListener("click", ()=> chatbot.classList.toggle("is-open"));
chatbotClose.addEventListener("click", ()=> chatbot.classList.remove("is-open"));

chatbotQuick.addEventListener("click", (e)=>{
  const btn = e.target.closest("button");
  if(!btn) return;
  const msg = btn.dataset.msg;
  addBubble(msg, "user");
  setTimeout(()=> addWhatsappHandoff(msg), 300);
});

chatbotForm.addEventListener("submit", (e)=>{
  e.preventDefault();
  const val = chatbotText.value.trim();
  if(!val) return;
  addBubble(val, "user");
  chatbotText.value = "";
  setTimeout(()=> addWhatsappHandoff(val), 300);
});
