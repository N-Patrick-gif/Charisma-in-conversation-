const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const scenarios = [
 {id:"coffee",title:"Café / lieu public",tag:"Small talk",coach:"Bonjour ! Tu viens souvent ici ?",goal:"Répondre + ajouter un détail + poser une question ouverte."},
 {id:"work",title:"Collègue / réseau",tag:"Professionnel",coach:"Salut, je crois qu'on ne s'est jamais vraiment parlé. Tu travailles sur quoi en ce moment ?",goal:"Présenter son activité en 30 secondes sans jargon."},
 {id:"party",title:"Soirée / événement",tag:"Social",coach:"Comment tu connais les gens ici ?",goal:"Trouver un point commun et rebondir."},
 {id:"date",title:"Rencontre / flirt respectueux",tag:"Rencontre",coach:"Qu'est-ce qui t'a donné envie de venir ici ce soir ?",goal:"Être curieux, léger, authentique. Aucun forcing."},
 {id:"assert",title:"Désaccord professionnel",tag:"Affirmation",coach:"Je ne suis pas d'accord avec ta proposition.",goal:"Dire son point de vue calmement et proposer une alternative."},
 {id:"public",title:"Prise de parole",tag:"Oratoire",coach:"En 60 secondes, explique pourquoi ton sujet compte.",goal:"Structure : idée → exemple → conclusion."},
 {id:"awkward",title:"Silence gênant",tag:"Spontanéité",coach:"…",goal:"Tolérer le silence puis relancer naturellement."},
 {id:"exit",title:"Terminer une conversation",tag:"Aisance",coach:"Bon, je vais rejoindre mes amis.",goal:"Répondre chaleureusement et savoir laisser partir l'autre."}
];

const challenges = [
 "Dire bonjour à une personne que tu croises habituellement sans lui parler.",
 "Poser une question ouverte à un collègue et écouter sa réponse sans préparer la suivante.",
 "Faire un compliment factuel et non intrusif sur quelque chose de visible (travail, idée, choix).",
 "Demander un avis à quelqu'un : « Tu en penses quoi ? » puis rebondir sur sa réponse.",
 "Prendre la parole une fois de plus que d'habitude dans un échange professionnel.",
 "Faire une demande simple avec une voix posée, sans t'excuser avant de demander.",
 "Tenir 60 secondes de conversation sans chercher à impressionner.",
 "Quand tu ne sais pas quoi dire, utiliser : « Et toi, comment tu vois ça ? »"
];

const exercises = {
 breath:{title:"Respiration + débit",text:"« Je prends le temps de répondre. Je n'ai pas besoin de me dépêcher. Je peux faire une pause et continuer. »"},
 articulation:{title:"Articulation",text:"« Trois très grands trains traversent trente-six tunnels. Je parle lentement, j'articule, puis j'accélère légèrement. »"},
 smalltalk:{title:"Small talk",text:"« Qu'est-ce qui t'occupe en ce moment ? Qu'est-ce que tu apprécies le plus là-dedans ? »"},
 assert:{title:"Affirmation",text:"« Je comprends ton point de vue. De mon côté, je préfère cette option pour trois raisons : … »"}
};

const roleStates = {idx:0, history:[]};

let state = JSON.parse(localStorage.getItem("presenceState") || "null") || {
 score:0, streak:0, sessions:0, lastDay:null,
 confidence:0, eloquence:0, conversation:0, assertiveness:0,
 challengeDone:0, journal:""
};

function save(){ localStorage.setItem("presenceState", JSON.stringify(state)); renderStats(); }

function todayKey(){ return new Date().toISOString().slice(0,10); }
function updateStreak(){
 const t=todayKey();
 if(state.lastDay===t) return;
 if(state.lastDay){
   const d1=new Date(state.lastDay+"T00:00:00"), d2=new Date(t+"T00:00:00");
   const diff=Math.round((d2-d1)/86400000);
   if(diff===1) state.streak++;
   else if(diff>1) state.streak=1;
 } else state.streak=1;
 state.lastDay=t;
}
function renderStats(){
 $("#score").textContent = state.score;
 $("#streak").textContent = state.streak;
 $("#sessions").textContent = state.sessions;
 $("#pConfidence").textContent = `${state.confidence}/100`;
 $("#pEloquence").textContent = `${state.eloquence}/100`;
 $("#pConversation").textContent = `${state.conversation}/100`;
 $("#pAssert").textContent = `${state.assertiveness}/100`;
 const overall=Math.round((state.confidence+state.eloquence+state.conversation+state.assertiveness)/4);
 $("#overallBar").style.width=overall+"%";
}
function go(id){
 $$("main > section").forEach(s=>s.classList.toggle("hidden",s.id!==id));
 window.scrollTo({top:0,behavior:"smooth"});
}
$$("[data-go]").forEach(b=>b.onclick=()=>go(b.dataset.go));

let challengeIndex=Math.floor(Math.random()*challenges.length);
function renderChallenge(){ $("#realChallenge").textContent=challenges[challengeIndex]; }
$("#newChallenge").onclick=()=>{challengeIndex=(challengeIndex+1)%challenges.length;renderChallenge()};
$("#doneChallenge").onclick=()=>{
 if(!state.challengeDone){state.challengeDone=1;state.score+=5;state.confidence=Math.min(100,state.confidence+2);save();}
 $("#realChallenge").textContent="✓ Défi enregistré. Recommence demain avec une nouvelle micro-action.";
};

function speak(text){
 if(!("speechSynthesis" in window)){ alert("La synthèse vocale n'est pas disponible dans ce navigateur."); return; }
 speechSynthesis.cancel();
 const u=new SpeechSynthesisUtterance(text);
 u.lang="fr-FR"; u.rate=.92; u.pitch=1;
 const voices=speechSynthesis.getVoices();
 const v=voices.find(x=>x.lang?.toLowerCase().startsWith("fr"));
 if(v) u.voice=v;
 speechSynthesis.speak(u);
}
$("#speakBtn").onclick=()=>speak($("#exText").textContent.replace(/[«»]/g,""));

let recognition=null;
function startRecognition(target){
 const SR=window.SpeechRecognition || window.webkitSpeechRecognition;
 if(!SR){ $("#micStatus").textContent="Micro : reconnaissance non disponible ici. Écris ta réponse."; return; }
 recognition=new SR();
 recognition.lang="fr-FR"; recognition.interimResults=false; recognition.continuous=false;
 $("#micStatus").textContent="Micro : écoute…";
 recognition.onresult=e=>{
   const txt=e.results[0][0].transcript;
   target.value=target.value ? target.value+" "+txt : txt;
   $("#micStatus").textContent="Micro : terminé";
 };
 recognition.onerror=e=>$("#micStatus").textContent="Micro : "+e.error;
 recognition.onend=()=>{ if($("#micStatus").textContent.includes("écoute")) $("#micStatus").textContent="Micro : terminé"; };
 try{recognition.start()}catch(e){$("#micStatus").textContent="Micro : impossible à démarrer";}
}
$("#micBtn").onclick=()=>startRecognition($("#transcript"));
$("#roleMic").onclick=()=>startRecognition($("#roleInput"));

function analyze(text){
 const words=(text.toLowerCase().match(/[a-zàâçéèêëîïôûùüÿñæœ'-]+/gi)||[]);
 const n=words.length;
 const questions=(text.match(/\?/g)||[]).length;
 const first=["je","j'","moi","mon","ma","mes"].filter(x=>words.includes(x.replace("'",""))).length;
 const fillers=["euh","heu","genre","du coup","en fait","voilà"].reduce((a,x)=>a+(text.toLowerCase().split(x).length-1),0);
 const long=n>=25, short=n<=90;
 const clarity=Math.max(20,Math.min(100,70+(n>=12?10:0)-(fillers*6)));
 const open=Math.max(20,Math.min(100,60+(questions?18:0)+(long?8:0)));
 const conc=Math.max(20,Math.min(100,95-(n>120?(n-120)*.5:0)-fillers*4));
 const quality=Math.round((clarity+open+conc)/3);
 return {n,questions,fillers,clarity:Math.round(clarity),open:Math.round(open),concise:Math.round(conc),quality};
}
function showAnalysis(text){
 if(!text.trim()){ $("#analysisBox").innerHTML='<p class="badge red">Parle ou écris une réponse avant l’analyse.</p>';return; }
 const a=analyze(text);
 let tips=[];
 if(a.n<12) tips.push("Développe une idée avec un exemple concret.");
 if(a.questions===0) tips.push("Ajoute une question ou un rebond pour ouvrir l'échange.");
 if(a.fillers>0) tips.push("Remplace les remplissages par une micro-pause.");
 if(a.n>120) tips.push("Cherche une version plus courte : idée → exemple → question.");
 if(!tips.length) tips.push("Bonne base : garde ce débit et ajoute de la spontanéité.");
 $("#analysisBox").innerHTML=`
 <div class="card" style="background:#0d172b">
 <div class="metric"><span>Longueur</span><b>${a.n} mots</b></div>
 <div class="metric"><span>Questions</span><b>${a.questions}</b></div>
 <div class="metric"><span>Remplissages détectés</span><b>${a.fillers}</b></div>
 <div class="metric"><span>Clarté</span><b>${a.clarity}/100</b></div>
 <div class="metric"><span>Ouverture</span><b>${a.open}/100</b></div>
 <div class="metric"><span>Concision</span><b>${a.concise}/100</b></div>
 <p><b>Prochaine action :</b> ${tips.join(" ")}</p></div>`;
 state.score+=Math.max(1,Math.round(a.quality/20));
 state.eloquence=Math.min(100,Math.round((state.eloquence+a.clarity)/2));
 state.conversation=Math.min(100,Math.round((state.conversation+a.open)/2));
 updateStreak(); save();
}
$("#analyzeBtn").onclick=()=>showAnalysis($("#transcript").value);

$$("[data-ex]").forEach(b=>b.onclick=()=>{
 const e=exercises[b.dataset.ex]; $("#exTitle").textContent=e.title; $("#exText").textContent=e.text; $("#transcript").value="";
});

function renderScenarios(){
 $("#scenarioGrid").innerHTML=scenarios.map((s,i)=>`
 <div class="scenario">
   <span class="badge">${s.tag}</span><h3>${s.title}</h3><p>${s.goal}</p>
   <button class="btn primary" onclick="startScenario(${i})">S'entraîner</button>
 </div>`).join("");
}
window.startScenario=(i)=>{
 roleStates.idx=i; roleStates.history=[];
 go("roleplay"); renderRole();
};
function renderRole(){
 const s=scenarios[roleStates.idx];
 $("#roleTitle").textContent=s.title;
 $("#chat").innerHTML=`<div class="msg coach"><b>Coach :</b> ${s.coach}</div>`;
 $("#roleInput").value="";
 $("#mClarity").textContent="—";$("#mOpen").textContent="—";$("#mQuestion").textContent="—";$("#mConcise").textContent="—";
}
function sendRole(){
 const txt=$("#roleInput").value.trim(); if(!txt)return;
 const a=analyze(txt);
 $("#chat").insertAdjacentHTML("beforeend",`<div class="msg user">${escapeHtml(txt)}</div>`);
 const s=scenarios[roleStates.idx];
 let reply;
 if(s.id==="exit") reply="Très bien. Le plus important ici est de laisser l'autre libre de partir.";
 else if(a.questions) reply="Bon réflexe : tu ouvres l'échange. Maintenant, rebondis sur un détail de sa réponse.";
 else reply="Bonne base. Ajoute une question ouverte ou une petite information personnelle pour créer un vrai aller-retour.";
 $("#chat").insertAdjacentHTML("beforeend",`<div class="msg coach"><b>Coach :</b> ${reply}</div>`);
 $("#mClarity").textContent=a.clarity+"/100";$("#mOpen").textContent=a.open+"/100";$("#mQuestion").textContent=(a.questions? "Oui":"À travailler");$("#mConcise").textContent=a.concise+"/100";
 state.score+=Math.max(2,Math.round(a.quality/15)); state.conversation=Math.min(100,Math.round((state.conversation+a.open)/2)); state.confidence=Math.min(100,state.confidence+1); updateStreak(); save();
 $("#roleInput").value="";
 $("#chat").scrollTop=$("#chat").scrollHeight;
}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
$("#sendRole").onclick=sendRole;
$("#roleSpeak").onclick=()=>speak(scenarios[roleStates.idx].coach);
$("#nextRole").onclick=()=>{roleStates.idx=(roleStates.idx+1)%scenarios.length;renderRole()};

$("#startDaily").onclick=()=>{
 go("practice");
 $("#exTitle").textContent="Départ : 60 secondes";
 $("#exText").textContent="« Bonjour. Je parle lentement. Je prends ma place. Je n'ai pas besoin d'être parfait pour être intéressant. »";
 $("#transcript").value="";
 updateStreak(); state.sessions+=1; state.score+=3; save();
};

$("#saveJournal").onclick=()=>{
 state.journal=$("#journal").value; state.score+=1; save(); $("#journalMsg").textContent="Enregistré localement.";
};

$("#resetBtn").onclick=()=>{
 if(confirm("Réinitialiser toute la progression locale ?")){localStorage.removeItem("presenceState");location.reload();}
};

let deferredPrompt=null;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;});
$("#installBtn").onclick=async()=>{
 if(deferredPrompt){deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt=null;}
 else alert("Sur mobile : menu du navigateur → Ajouter à l'écran d'accueil / Installer l'application. Une installation PWA nécessite une adresse HTTPS.");
};

if("serviceWorker" in navigator && (location.protocol==="https:" || location.hostname==="localhost")){
 navigator.serviceWorker.register("./sw.js").catch(()=>{});
}
if(state.journal) $("#journal").value=state.journal;
renderStats();renderChallenge();renderScenarios();renderRole();