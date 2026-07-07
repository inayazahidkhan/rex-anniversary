/* ==========================================================
   PREFERS REDUCED MOTION
   ========================================================== */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ==========================================================
   OPENING STARFIELD (DOM based, cheap & pretty)
   ========================================================== */
(function openingStars(){
  const container = document.getElementById('openingStars');
  const count = 90;
  for(let i=0;i<count;i++){
    const s = document.createElement('span');
    const x = Math.random()*100;
    const y = Math.random()*100;
    const size = Math.random()*1.6 + 0.6;
    const delay = Math.random()*2.5;
    const opacity = Math.random()*0.5 + 0.3;
    s.style.left = x+'%';
    s.style.top = y+'%';
    s.style.width = size+'px';
    s.style.height = size+'px';
    s.style.animationDelay = delay+'s, ' + (delay+2.5)+'s';
    s.style.setProperty('--o', opacity);
    container.appendChild(s);
  }
})();

/* ==========================================================
   OPENING SEQUENCE TIMING
   ========================================================== */
const opLines = document.querySelectorAll('.op-line');
const beginBtn = document.getElementById('beginBtn');
const opening = document.getElementById('opening');
const mainEl = document.getElementById('main');

const LINE_DURATION = 3200; // ms, matches CSS animation
const LINE_GAP = 3400;

function runOpeningSequence(){
  opLines.forEach((line, i)=>{
    setTimeout(()=>{
      line.classList.add('show');
    }, i * LINE_GAP);
  });
  const totalTime = opLines.length * LINE_GAP;
  setTimeout(()=>{
    beginBtn.classList.add('show');
  }, totalTime - 800);
}

if(prefersReducedMotion){
  opLines.forEach(l => l.style.opacity = 0);
  beginBtn.classList.add('show');
} else {
  runOpeningSequence();
}

beginBtn.addEventListener('click', ()=>{
  opening.classList.add('hide');
  document.body.style.overflow = 'auto';
  setTimeout(()=>{
    mainEl.classList.add('reveal-main');
    window.scrollTo({top:0, behavior:'instant'});
  }, 200);
});

// lock scroll until begin is clicked
document.body.style.overflow = 'hidden';

/* ==========================================================
   SCROLL REVEAL
   ========================================================== */
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('in-view');
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

revealEls.forEach(el => io.observe(el));

/* ==========================================================
   SCROLL PROGRESS BAR + TIMELINE SPINE FILL
   ========================================================== */
const progressFill = document.getElementById('progressFill');
const spineFill = document.getElementById('spineFill');
const timelineEl = document.getElementById('timeline');

function onScroll(){
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop/docHeight)*100 : 0;
  progressFill.style.width = pct + '%';

  if(timelineEl){
    const rect = timelineEl.getBoundingClientRect();
    const vh = window.innerHeight;
    const start = vh * 0.85;
    const total = rect.height + vh*0.3;
    const progressed = start - rect.top;
    const fillPct = Math.max(0, Math.min(100, (progressed/total)*100));
    spineFill.style.height = fillPct + '%';
  }
}
window.addEventListener('scroll', onScroll, { passive:true });
onScroll();

/* ==========================================================
   LETTER PARALLAX TILT ON SCROLL
   ========================================================== */
const letterPaper = document.querySelector('.letter-paper');
if(letterPaper && !prefersReducedMotion){
  window.addEventListener('scroll', ()=>{
    const rect = letterPaper.getBoundingClientRect();
    const center = window.innerHeight/2;
    const dist = (rect.top + rect.height/2) - center;
    const rotate = Math.max(-4, Math.min(4, dist * 0.01));
    const translate = Math.max(-14, Math.min(14, dist * 0.03));
    letterPaper.style.transform = `rotate(${rotate}deg) translateY(${translate}px)`;
  }, { passive:true });
}

/* ==========================================================
   CURSOR GLOW
   ========================================================== */
const cursorGlow = document.getElementById('cursorGlow');
if(!('ontouchstart' in window) && !prefersReducedMotion){
  window.addEventListener('mousemove', (e)=>{
    cursorGlow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
  });
}

/* ==========================================================
   CURSOR SPARKLE TRAIL
   ========================================================== */
if(!('ontouchstart' in window) && !prefersReducedMotion){
  let lastSpark = 0;
  window.addEventListener('mousemove', (e)=>{
    const now = Date.now();
    if(now - lastSpark < 60) return;
    lastSpark = now;
    const spark = document.createElement('div');
    spark.style.position = 'fixed';
    spark.style.left = e.clientX + 'px';
    spark.style.top = e.clientY + 'px';
    spark.style.width = '4px';
    spark.style.height = '4px';
    spark.style.borderRadius = '50%';
    spark.style.background = 'rgba(217,165,160,0.8)';
    spark.style.pointerEvents = 'none';
    spark.style.zIndex = 9999;
    spark.style.transform = 'translate(-50%,-50%)';
    spark.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    document.body.appendChild(spark);
    requestAnimationFrame(()=>{
      spark.style.opacity = '0';
      spark.style.transform = 'translate(-50%,-50%) translateY(-16px) scale(0.4)';
    });
    setTimeout(()=> spark.remove(), 850);
  });
}

/* ==========================================================
   AMBIENT BACKGROUND CANVAS — soft floating particles
   ========================================================== */
(function backgroundCanvas(){
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let w, h, particles;

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const COUNT = prefersReducedMotion ? 0 : Math.min(70, Math.floor((w*h)/22000));

  function makeParticle(){
    return {
      x: Math.random()*w,
      y: Math.random()*h,
      r: Math.random()*1.6 + 0.4,
      vy: -(Math.random()*0.18 + 0.05),
      vx: (Math.random()-0.5)*0.06,
      alpha: Math.random()*0.5 + 0.15,
      hue: Math.random() > 0.5 ? '217,165,160' : '203,170,107'
    };
  }

  particles = Array.from({length: COUNT}, makeParticle);

  function tick(){
    ctx.clearRect(0,0,w,h);
    particles.forEach(p=>{
      p.x += p.vx;
      p.y += p.vy;
      if(p.y < -10){ p.y = h+10; p.x = Math.random()*w; }
      if(p.x < -10) p.x = w+10;
      if(p.x > w+10) p.x = -10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(${p.hue},${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(tick);
  }
  if(COUNT > 0) tick();
})();

/* ==========================================================
   EASTER EGG — "Don't Click"
   ========================================================== */
const secretBtn = document.getElementById('secretBtn');
const secretResponse = document.getElementById('secretResponse');
const secretMessages = [
  "I knew you'd click.",
  "I love you.",
  "More than yesterday.",
  "But less than tomorrow."
];
let secretIndex = 0;

secretBtn.addEventListener('click', ()=>{
  secretResponse.style.opacity = 0;
  setTimeout(()=>{
    secretResponse.textContent = secretMessages[secretIndex % secretMessages.length];
    secretResponse.style.transition = 'opacity .6s ease';
    secretResponse.style.opacity = 1;
    secretIndex++;
  }, 150);
});
