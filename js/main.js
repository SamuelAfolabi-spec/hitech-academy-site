// ---------- SPLASH SEQUENCE ----------
(function(){
  const splash=document.getElementById('splash');
  const mark=document.getElementById('logoMark');
  const caption=document.getElementById('splashCaption');
  const header=document.getElementById('siteHeader');

  setTimeout(()=>mark.classList.add('show'), 200);        // baby forms first (small clip circle)
  setTimeout(()=>mark.classList.add('reveal'), 800);       // adult embraces — clip expands to full mark
  setTimeout(()=>caption.classList.add('show'), 1700);
  setTimeout(()=>mark.classList.add('breathe','blink'), 2000);
  setTimeout(()=>{
    splash.classList.add('hide');
    header.classList.add('reveal');
  }, 3100);
  setTimeout(()=>{ splash.style.display='none'; }, 4200);
})();

// ---------- HEADER SCROLL STATE ----------
const header=document.getElementById('siteHeader');
window.addEventListener('scroll',()=>{
  header.classList.toggle('scrolled', window.scrollY>30);
});

// ---------- SCROLL REVEAL ----------
const revealEls=document.querySelectorAll('.reveal-el');
revealEls.forEach(el=>el.classList.add('js-armed'));
const io=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add('in-view'); io.unobserve(e.target); }
  });
},{threshold:0.14});
revealEls.forEach(el=>io.observe(el));

// ---------- VALUE TABS ----------
const tabBtns=document.querySelectorAll('.value-tab');
const panels=document.querySelectorAll('.tab-panel');
tabBtns.forEach(btn=>{
  btn.addEventListener('click',()=>{
    tabBtns.forEach(b=>b.classList.remove('active'));
    panels.forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// ---------- CONTACT FORM ----------
const form=document.getElementById('contactForm');
const success=document.getElementById('formSuccess');
form.addEventListener('submit',(e)=>{
  e.preventDefault();
  form.style.display='none';
  success.classList.add('show');
});

// ---------- MOBILE NAV ----------
const menuBtn=document.getElementById('menuBtn');
const mobilePanel=document.getElementById('mobilePanel');
function closeMobileMenu(){
  mobilePanel.classList.remove('open');
  menuBtn.setAttribute('aria-expanded','false');
}
menuBtn.addEventListener('click',()=>{
  const isOpen=mobilePanel.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
});
mobilePanel.querySelectorAll('a').forEach(a=>{
  a.addEventListener('click', closeMobileMenu);
});
window.addEventListener('resize',()=>{
  if(window.innerWidth>899) closeMobileMenu();
});
// ============ LOCAL DATA-LAYER "BACKEND" ============
// A lightweight client-side persistence layer standing in for a real database.
// Swap DB.* calls for real API/Supabase calls later without touching the UI code below.
const DB = {
  read(key, seed){
    try{
      const raw = localStorage.getItem(key);
      if(raw) return JSON.parse(raw);
    }catch(e){}
    this.write(key, seed);
    return seed;
  },
  write(key, value){
    try{ localStorage.setItem(key, JSON.stringify(value)); }catch(e){}
  }
};

const ALUMNI_KEY='htc_alumni_directory';

const seedAlumni=[
  {name:"Adaeze O.", year:"2015", field:"Software Engineering"},
  {name:"Chidera N.", year:"2009", field:"Medicine"}
];

function renderAlumni(){
  const alumni = DB.read(ALUMNI_KEY, seedAlumni);
  const list = document.getElementById('alumniList');
  list.innerHTML = alumni.length ? alumni.map(a=>`
    <div class="mini-card">
      <span>Alumni Directory</span>
      <h4>${escapeHtml(a.name)}</h4>
      <p>Class of ${escapeHtml(a.year)} · ${escapeHtml(a.field)}</p>
    </div>`).join('') : '<div class="mini-empty">No alumni registered yet — be the first.</div>';
}

function escapeHtml(str){
  const div=document.createElement('div');
  div.textContent=str;
  return div.innerHTML;
}

renderAlumni();

document.getElementById('alumniForm').addEventListener('submit', e=>{
  e.preventDefault();
  const alumni = DB.read(ALUMNI_KEY, seedAlumni);
  alumni.unshift({
    name: document.getElementById('alumniName').value.trim(),
    year: document.getElementById('alumniYear').value.trim(),
    field: document.getElementById('alumniField').value.trim()
  });
  DB.write(ALUMNI_KEY, alumni);
  e.target.reset();
  renderAlumni();
});

// also persist contact form submissions locally
const CONTACT_KEY='htc_contact_submissions';
const contactFormEl=document.getElementById('contactForm');
if(contactFormEl){
  contactFormEl.addEventListener('submit', ()=>{
    const entries = DB.read(CONTACT_KEY, []);
    entries.unshift({
      name: document.getElementById('name').value.trim(),
      role: document.getElementById('role').value,
      email: document.getElementById('email').value.trim(),
      message: document.getElementById('msg').value.trim(),
      at: new Date().toISOString()
    });
    DB.write(CONTACT_KEY, entries);
  }, true);
}




document.getElementById('gateLogo').src = "assets/logo.png";


const CLASSES = ["JSS1","JSS2","JSS3","SS1","SS2","SS3"];
const IDENTITY_KEY = "htc_class_identity";
const roomKey = cls => "htc_class_room_" + cls;

const BAD_WORDS = ["stupid","idiot","fool","dumb"]; // lightweight demo-level filter
function filterText(text){
  let out = text;
  BAD_WORDS.forEach(w=>{
    const re = new RegExp("\\b"+w+"\\b","gi");
    out = out.replace(re, "*".repeat(w.length));
  });
  return out;
}
function initials(name){ return name.trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase(); }
function timeStr(iso){ return new Date(iso).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}); }

function seedRoom(cls){
  return [
    {id:'sys1', system:true, text:`Welcome to the ${cls} class room.`, at:new Date(Date.now()-1000*60*30).toISOString()},
    {id:'m1', author:"Demo Student", role:'student', text:"Good morning everyone!", at:new Date(Date.now()-1000*60*20).toISOString(), pinned:false, reported:false},
    {id:'m2', author:"Form Teacher", role:'teacher', text:"Good morning class. Reminder: assignment is due Friday.", at:new Date(Date.now()-1000*60*15).toISOString(), pinned:true, reported:false}
  ];
}

// Legacy per-class codes — used only as the seed value for each class's registered teacher below.
const TEACHER_CODES = {
  JSS1: "JSS1-4471",
  JSS2: "JSS2-8823",
  JSS3: "JSS3-5510",
  SS1:  "SS1-2290",
  SS2:  "SS2-7734",
  SS3:  "SS3-9061"
};

// Admin passcode for the "manage student codes" panel — change this before real use.
const ADMIN_PASSCODE = "ADMIN-2026";

const rosterKey = cls => "htc_roster_" + cls;
const teacherKey = cls => "htc_teacher_" + cls;
const mutedKey = cls => "htc_muted_" + cls;

function seedRoster(cls){
  return [
    { name: "Demo Student", code: cls + "-DS-0001" }
  ];
}

function seedTeacher(cls){
  return { name: "Form Teacher", code: TEACHER_CODES[cls] };
}

function genTeacherCode(name, cls){
  const initials = name.trim().split(/\s+/).map(w=>w[0]).join('').toUpperCase().slice(0,2) || "XX";
  const num = Math.floor(1000 + Math.random()*9000);
  return `${cls}-T${initials}-${num}`;
}

function genStudentCode(name, cls){
  const initials = name.trim().split(/\s+/).map(w=>w[0]).join('').toUpperCase().slice(0,2) || "XX";
  const num = Math.floor(1000 + Math.random()*9000);
  return `${cls}-${initials}-${num}`;
}

function normalizeName(n){ return n.trim().toLowerCase().replace(/\s+/g,' '); }

let identity = DB.read(IDENTITY_KEY, null);
let selectedRole = 'student';

const roleStudentBtn = document.getElementById('roleStudentBtn');
const roleTeacherBtn = document.getElementById('roleTeacherBtn');
const classLabel = document.getElementById('classLabel');
const studentCodeField = document.getElementById('studentCodeField');
const teacherCodeField = document.getElementById('teacherCodeField');
const gateForm = document.getElementById('gateForm');
const gateError = document.getElementById('gateError');
const gateView = document.getElementById('gateView');
const roomView = document.getElementById('roomView');

roleStudentBtn.addEventListener('click', ()=>{
  selectedRole='student';
  roleStudentBtn.classList.add('active'); roleTeacherBtn.classList.remove('active');
  classLabel.textContent = "Your class";
  teacherCodeField.style.display='none';
  studentCodeField.style.display='block';
});
roleTeacherBtn.addEventListener('click', ()=>{
  selectedRole='teacher';
  roleTeacherBtn.classList.add('active'); roleStudentBtn.classList.remove('active');
  classLabel.textContent = "Class you head (form teacher)";
  teacherCodeField.style.display='block';
  studentCodeField.style.display='none';
});

gateForm.addEventListener('submit', e=>{
  e.preventDefault();
  const name = document.getElementById('gateName').value.trim();
  const cls = document.getElementById('gateClass').value;
  if(!name || !cls){
    gateError.textContent = "Please enter your name and select a class.";
    gateError.style.display='block';
    return;
  }
  if(selectedRole === 'teacher'){
    const code = document.getElementById('teacherCode').value.trim();
    const teacherRec = DB.read(teacherKey(cls), seedTeacher(cls));
    if(!code || normalizeName(teacherRec.name) !== normalizeName(name) || teacherRec.code !== code){
      gateError.textContent = "That name and code don't match the registered teacher for " + cls + ". Check with your school admin.";
      gateError.style.display='block';
      return;
    }
  } else {
    const code = document.getElementById('studentCode').value.trim();
    const roster = DB.read(rosterKey(cls), seedRoster(cls));
    const match = roster.find(s => normalizeName(s.name) === normalizeName(name) && s.code === code);
    if(!code || !match){
      gateError.textContent = "That name and code don't match our records for " + cls + ". Check with your teacher.";
      gateError.style.display='block';
      return;
    }
  }
  identity = { name, role:selectedRole, class:cls };
  DB.write(IDENTITY_KEY, identity);
  enterRoom();
});

document.getElementById('switchBtn').addEventListener('click', ()=>{
  identity = null;
  DB.write(IDENTITY_KEY, null);
  roomView.style.display='none';
  gateView.style.display='flex';
  document.getElementById('gateName').value='';
  document.getElementById('gateClass').value='';
  document.getElementById('teacherCode').value='';
  document.getElementById('studentCode').value='';
  gateError.style.display='none';
  roleStudentBtn.click();
});

document.getElementById('resetLink').addEventListener('click', ()=>{
  if(confirm('Clear all demo messages and sign-in for this browser?')){
    CLASSES.forEach(c=> localStorage.removeItem(roomKey(c)));
    localStorage.removeItem(IDENTITY_KEY);
    location.reload();
  }
});

let activeMsgIdForReport = null;
const reportOverlay = document.getElementById('reportOverlay');

function renderRoom(){
  const cls = identity.class;
  const isTeacher = identity.role === 'teacher';
  document.getElementById('roomAvatar').textContent = initials(identity.name);
  document.getElementById('roomTitle').textContent = cls + ' Class Room';
  document.getElementById('roomSub').textContent = isTeacher ? `Signed in as ${identity.name} · Form Teacher` : `Signed in as ${identity.name} · Student`;

  const composerForm = document.getElementById('composerForm');
  const removedNotice = document.getElementById('removedNotice');
  const announceBtn = document.getElementById('announceBtn');
  announceBtn.style.display = isTeacher ? 'flex' : 'none';

  if(!isTeacher){
    const muted = DB.read(mutedKey(cls), []);
    if(muted.some(n => normalizeName(n) === normalizeName(identity.name))){
      composerForm.style.display = 'none';
      removedNotice.style.display = 'block';
    } else {
      composerForm.style.display = 'flex';
      removedNotice.style.display = 'none';
    }
  } else {
    composerForm.style.display = 'flex';
    removedNotice.style.display = 'none';
  }

  const msgs = DB.read(roomKey(cls), seedRoom(cls));
  const pinned = msgs.find(m=>m.pinned);
  const pinnedBar = document.getElementById('pinnedBar');
  if(pinned){ pinnedBar.classList.add('show'); document.getElementById('pinnedText').textContent = pinned.text; }
  else { pinnedBar.classList.remove('show'); }

  const container = document.getElementById('messages');
  container.innerHTML = msgs.map(m=>{
    if(m.system){
      return `<div class="system-msg">${escapeHtml(m.text)}</div>`;
    }
    const mine = m.author === identity.name;
    let tools = '';
    if(isTeacher){
      tools = `<div class="msg-tools">
        <button data-action="pin" data-id="${m.id}">${m.pinned ? 'Unpin' : 'Pin'}</button>
        <button data-action="delete" data-id="${m.id}">Delete</button>
        ${m.role==='student' ? `<button data-action="remove" data-id="${m.id}" data-author="${escapeHtml(m.author)}" class="remove-btn">Remove Student</button>` : ''}
      </div>`;
    } else if(!mine){
      tools = `<div class="msg-tools"><button data-action="report" data-id="${m.id}">Report</button></div>`;
    }
    return `<div class="msg ${mine?'mine':'other'} ${m.reported?'reported':''} ${m.announcement?'announcement':''}">
      <div class="meta">${escapeHtml(m.author)}${m.role==='teacher'?'<span class="teacher-tag">TEACHER</span>':''}</div>
      ${escapeHtml(m.text)}
      <time>${timeStr(m.at)}</time>
      ${m.reported && isTeacher ? '<div class="reported-flag">⚑ Reported by a student</div>' : ''}
      ${tools}
    </div>`;
  }).join('');
  container.scrollTop = container.scrollHeight;

  container.querySelectorAll('button[data-action]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      let list = DB.read(roomKey(cls), seedRoom(cls));
      if(action === 'pin'){
        list = list.map(m => m.id===id ? {...m, pinned: !m.pinned} : {...m, pinned:false});
      } else if(action === 'delete'){
        list = list.filter(m => m.id !== id);
      } else if(action === 'report'){
        activeMsgIdForReport = id;
        reportOverlay.classList.add('open');
        return;
      } else if(action === 'remove'){
        const author = btn.dataset.author;
        if(!confirm(`Remove ${author} from the ${cls} room? They will no longer be able to send messages.`)) return;
        const muted = DB.read(mutedKey(cls), []);
        if(!muted.some(n=>normalizeName(n)===normalizeName(author))){
          muted.push(author);
          DB.write(mutedKey(cls), muted);
        }
        list.push({
          id: 'sys' + Date.now(),
          system: true,
          text: `${author} has been removed from the room by the teacher.`,
          at: new Date().toISOString()
        });
      }
      DB.write(roomKey(cls), list);
      renderRoom();
    });
  });
}

document.getElementById('reportCancel').addEventListener('click', ()=>{
  reportOverlay.classList.remove('open');
  activeMsgIdForReport = null;
});
document.getElementById('reportConfirm').addEventListener('click', ()=>{
  if(activeMsgIdForReport){
    const cls = identity.class;
    let list = DB.read(roomKey(cls), seedRoom(cls));
    list = list.map(m => m.id===activeMsgIdForReport ? {...m, reported:true} : m);
    DB.write(roomKey(cls), list);
  }
  reportOverlay.classList.remove('open');
  document.getElementById('reportReason').value='';
  activeMsgIdForReport = null;
  renderRoom();
});

function postMessage(announcement){
  const input = document.getElementById('composerInput');
  const text = filterText(input.value.trim());
  if(!text) return;
  const cls = identity.class;

  if(identity.role === 'student'){
    const muted = DB.read(mutedKey(cls), []);
    if(muted.some(n => normalizeName(n) === normalizeName(identity.name))){
      renderRoom();
      return;
    }
  }

  let list = DB.read(roomKey(cls), seedRoom(cls));
  const newMsg = {
    id: 'm' + Date.now(),
    author: identity.name,
    role: identity.role,
    text,
    at: new Date().toISOString(),
    pinned: !!announcement,
    reported: false,
    announcement: !!announcement
  };
  if(announcement){
    list = list.map(m => ({...m, pinned:false}));
  }
  list.push(newMsg);
  DB.write(roomKey(cls), list);
  input.value='';
  renderRoom();
}

document.getElementById('composerForm').addEventListener('submit', e=>{
  e.preventDefault();
  postMessage(false);
});
document.getElementById('announceBtn').addEventListener('click', ()=>{
  postMessage(true);
});

function enterRoom(){
  gateView.style.display='none';
  roomView.style.display='flex';
  renderRoom();
}

if(identity && identity.name && identity.class){
  enterRoom();
}


// ============ VIEW SWITCH (site <-> class chat rooms) ============
const siteViewEl=document.getElementById('siteView');
const classChatViewEl=document.getElementById('classChatView');
function openClassChat(){
  siteViewEl.style.display='none';
  classChatViewEl.classList.add('open');
  window.scrollTo(0,0);
}
function closeClassChat(){
  classChatViewEl.classList.remove('open');
  siteViewEl.style.display='block';
  window.scrollTo(0,0);
}
document.querySelectorAll('[data-open-app]').forEach(el=>{
  el.addEventListener('click', e=>{ e.preventDefault(); openClassChat(); });
});
document.querySelectorAll('[data-back-to-site]').forEach(el=>{
  el.addEventListener('click', e=>{ e.preventDefault(); closeClassChat(); });
});
// ============ ADMIN: MANAGE STUDENT ROSTER ============
const adminOverlay = document.getElementById('adminOverlay');
const adminGateStep = document.getElementById('adminGateStep');
const adminPanelStep = document.getElementById('adminPanelStep');
const adminClassSelect = document.getElementById('adminClassSelect');

document.getElementById('adminLink').addEventListener('click', e=>{
  e.preventDefault();
  adminOverlay.classList.add('open');
  adminGateStep.style.display='block';
  adminPanelStep.style.display='none';
  document.getElementById('adminPassInput').value='';
  document.getElementById('adminGateError').style.display='none';
});
document.getElementById('adminCancel').addEventListener('click', ()=> adminOverlay.classList.remove('open'));
document.getElementById('adminClose').addEventListener('click', ()=> adminOverlay.classList.remove('open'));

document.getElementById('adminUnlock').addEventListener('click', ()=>{
  const pass = document.getElementById('adminPassInput').value.trim();
  if(pass !== ADMIN_PASSCODE){
    const err = document.getElementById('adminGateError');
    err.textContent = "Incorrect admin passcode.";
    err.style.display='block';
    return;
  }
  adminGateStep.style.display='none';
  adminPanelStep.style.display='block';
  renderRosterAdmin();
  renderTeacherAdmin();
  renderMutedAdmin();
});

function renderRosterAdmin(){
  const cls = adminClassSelect.value;
  const roster = DB.read(rosterKey(cls), seedRoster(cls));
  const list = document.getElementById('adminRosterList');
  list.innerHTML = roster.length ? roster.map((s,i)=>`
    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(27,39,64,.08);">
      <span><strong>${escapeHtml(s.name)}</strong> — <code>${escapeHtml(s.code)}</code></span>
      <button data-idx="${i}" class="admin-remove-btn" style="border:none;background:none;color:#a33a3a;cursor:pointer;font-size:12px;">Remove</button>
    </div>
  `).join('') : '<div style="opacity:.55;padding:10px 0;">No students added for this class yet.</div>';

  list.querySelectorAll('.admin-remove-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const idx = Number(btn.dataset.idx);
      const roster2 = DB.read(rosterKey(cls), seedRoster(cls));
      roster2.splice(idx,1);
      DB.write(rosterKey(cls), roster2);
      renderRosterAdmin();
    });
  });
}

function renderTeacherAdmin(){
  const cls = adminClassSelect.value;
  const teacher = DB.read(teacherKey(cls), seedTeacher(cls));
  document.getElementById('adminTeacherCurrent').innerHTML =
    `Current: <strong>${escapeHtml(teacher.name)}</strong> — <code>${escapeHtml(teacher.code)}</code>`;
}

function renderMutedAdmin(){
  const cls = adminClassSelect.value;
  const muted = DB.read(mutedKey(cls), []);
  const list = document.getElementById('adminMutedList');
  list.innerHTML = muted.length ? muted.map((name,i)=>`
    <div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid rgba(27,39,64,.08);">
      <span>${escapeHtml(name)}</span>
      <button data-idx="${i}" class="admin-restore-btn" style="border:none;background:none;color:var(--brown);cursor:pointer;font-size:12px;text-decoration:underline;">Restore</button>
    </div>
  `).join('') : '<div style="opacity:.55;padding:8px 0;">No students removed from this class.</div>';

  list.querySelectorAll('.admin-restore-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const idx = Number(btn.dataset.idx);
      const muted2 = DB.read(mutedKey(cls), []);
      muted2.splice(idx,1);
      DB.write(mutedKey(cls), muted2);
      renderMutedAdmin();
    });
  });
}

adminClassSelect.addEventListener('change', ()=>{
  renderRosterAdmin();
  renderTeacherAdmin();
  renderMutedAdmin();
});

document.getElementById('adminSetTeacher').addEventListener('click', ()=>{
  const cls = adminClassSelect.value;
  const nameInput = document.getElementById('adminTeacherName');
  const name = nameInput.value.trim();
  if(!name) return;
  const code = genTeacherCode(name, cls);
  DB.write(teacherKey(cls), { name, code });
  nameInput.value='';
  renderTeacherAdmin();
  alert(`${name} is now registered as the form teacher for ${cls}.\nTheir sign-in code: ${code}`);
});

document.getElementById('adminAddStudent').addEventListener('click', ()=>{
  const cls = adminClassSelect.value;
  const nameInput = document.getElementById('adminNewStudentName');
  const name = nameInput.value.trim();
  if(!name) return;
  const roster = DB.read(rosterKey(cls), seedRoster(cls));
  const code = genStudentCode(name, cls);
  roster.push({ name, code });
  DB.write(rosterKey(cls), roster);
  nameInput.value='';
  renderRosterAdmin();
});

// ============ CLASS ROSTER MODAL (viewable from inside a room) ============
const rosterOverlay = document.getElementById('rosterOverlay');
document.getElementById('rosterBtn').addEventListener('click', ()=>{
  const cls = identity.class;
  const teacher = DB.read(teacherKey(cls), seedTeacher(cls));
  const roster = DB.read(rosterKey(cls), seedRoster(cls));
  const muted = DB.read(mutedKey(cls), []);
  const list = document.getElementById('rosterModalList');
  const teacherRow = `<div style="padding:8px 0;border-bottom:1px solid rgba(27,39,64,.1);"><strong>${escapeHtml(teacher.name)}</strong> <span class="teacher-tag" style="margin-left:6px;">TEACHER</span></div>`;
  const studentRows = roster.map(s=>{
    const isMuted = muted.some(n=>normalizeName(n)===normalizeName(s.name));
    return `<div style="padding:8px 0;border-bottom:1px solid rgba(27,39,64,.08);${isMuted?'opacity:.5;text-decoration:line-through;':''}">${escapeHtml(s.name)}${isMuted?' (removed)':''}</div>`;
  }).join('');
  list.innerHTML = teacherRow + studentRows;
  rosterOverlay.classList.add('open');
});
document.getElementById('rosterModalClose').addEventListener('click', ()=> rosterOverlay.classList.remove('open'));
