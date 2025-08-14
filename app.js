// Register SW
if ('serviceWorker' in navigator) {
  window.addEventListener('load', ()=> navigator.serviceWorker.register('./sw.js'));
}

// Install prompt
let deferredPrompt;
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', (e)=>{
  e.preventDefault();
  deferredPrompt = e;
  installBtn.hidden = false;
});
installBtn?.addEventListener('click', async ()=>{
  if(!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  installBtn.hidden = true;
});

// Welcome Overlay
const welcome = document.getElementById('welcome');
const enterApp = document.getElementById('enterApp');
setTimeout(()=> welcome.style.display = 'grid', 400); // show after load
enterApp?.addEventListener('click', ()=> welcome.style.display = 'none');

// Year
document.getElementById('year').textContent = new Date().getFullYear();

// UI elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

// Chat
const chatbox = document.getElementById('chatbox');
const chatlog = document.getElementById('chatlog');
const chatInput = document.getElementById('chatInput');
document.getElementById('openChat').addEventListener('click', ()=>{
  chatbox.style.display = chatbox.style.display === 'flex' ? 'none' : 'flex';
  chatInput?.focus();
});
document.getElementById('sendMsg').addEventListener('click', sendMsg);
chatInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') sendMsg(); });
function sendMsg(){
  const text = chatInput.value.trim();
  if(!text) return;
  addMsg(text, 'user');
  chatInput.value = '';
  setTimeout(()=> addMsg(autoReply(text), 'bot'), 500);
}
function addMsg(text, who){
  const div = document.createElement('div');
  div.className = 'msg ' + who;
  div.textContent = text;
  chatlog.appendChild(div);
  chatlog.scrollTop = chatlog.scrollHeight;
}
function autoReply(q){
  const lower = q.toLowerCase();
  if(lower.includes('fee') || lower.includes('price') || lower.includes('charge')) return 'हमारी सेवा-शुल्क कार्य पर निर्भर करता है। कृपया कॉल करें: 7722915520';
  if(lower.includes('job') || lower.includes('form')) return 'जॉब/फॉर्म मदद: Apply लिंक देखें या WhatsApp करें: 7722915520';
  if(lower.includes('time')) return 'दुकान समय: 10am–7pm (सोम–शनि)';
  return 'धन्यवाद! हम जल्द आपसे संपर्क करेंगे। कॉल/व्हाट्सऐप: 7722915520';
}

// Data rendering
async function loadJSON(path){ const r = await fetch(path); return r.json(); }

const latestJobsEl = document.getElementById('latestJobs');
const jobListEl = document.getElementById('jobList');
const jobCountEl = document.getElementById('jobCount');
const admitCardsEl = document.getElementById('admitCards');
const officialLinksEl = document.getElementById('officialLinks');
const noResultsEl = document.getElementById('noResults');
const servicesGrid = document.getElementById('servicesGrid');

function jobCard(j){
  const el = document.createElement('div');
  el.className = 'job';
  el.innerHTML = `
    <div class="row">
      <strong>${j.title}</strong>
      <span class="pill">${j.status}</span>
    </div>
    <div class="meta">
      <span class="pill">${j.org}</span>
      <span class="pill">Start: ${j.start_date}</span>
      <span class="pill">Last: ${j.last_date}</span>
    </div>
    <div>सिलेबस: ${j.syllabus}</div>
    <div class="row">
      <a class="btn" href="${j.apply_link}" target="_blank" rel="noopener">Apply Direct</a>
      <a class="btn ghost" href="${j.apply_link}" target="_blank" rel="noopener">Official Notice</a>
    </div>
  `;
  return el;
}
function linkItem(item){
  const a = document.createElement('a');
  a.className = 'link';
  a.href = item.link; a.target = '_blank'; a.rel = 'noopener';
  a.textContent = item.title;
  return a;
}
function serviceItem(s){
  const d = document.createElement('div');
  d.className = 'service';
  d.innerHTML = `<div class="icon">${s.icon}</div><strong>${s.title}</strong><div>${s.desc}</div>`;
  return d;
}

let allJobs = [];
function renderJobs(list){
  jobListEl.innerHTML = '';
  list.forEach(j=> jobListEl.appendChild(jobCard(j)));
  jobCountEl.textContent = list.length + ' jobs';
  noResultsEl.style.display = list.length ? 'none' : 'block';
}

function doSearch(){
  const q = (searchInput.value||'').toLowerCase().trim();
  if(!q){ renderJobs(allJobs); return; }
  const filtered = allJobs.filter(j =>
    j.title.toLowerCase().includes(q) ||
    j.org.toLowerCase().includes(q) ||
    j.syllabus.toLowerCase().includes(q)
  );
  renderJobs(filtered);
}

let t;
searchBtn.addEventListener('click', doSearch);
searchInput.addEventListener('input', ()=>{
  clearTimeout(t);
  t = setTimeout(doSearch, 200);
});

(async function init(){
  const jobs = await loadJSON('./data/jobs.json');
  const admits = await loadJSON('./data/admit_cards.json');
  const links = await loadJSON('./data/official_links.json');
  const services = await loadJSON('./data/services.json');

  allJobs = jobs;
  // Latest
  latestJobsEl.innerHTML='';
  jobs.slice(0,4).forEach(j=> latestJobsEl.appendChild(linkItem({title:j.title + ' — ' + j.status, link:j.apply_link})));
  // Full
  renderJobs(jobs);
  // Admit cards
  admitCardsEl.innerHTML='';
  admits.forEach(x=> admitCardsEl.appendChild(linkItem(x)));
  // Official links & study
  officialLinksEl.innerHTML='';
  links.forEach(x=> officialLinksEl.appendChild(linkItem(x)));
  // Services
  servicesGrid.innerHTML='';
  services.forEach(s=> servicesGrid.appendChild(serviceItem(s)));
})();