/* ═══════════════════════════════════════════════════════════════════════════
   MindBridge AI — Frontend JavaScript
   Agentic AI client: chat, breathing, resources, helplines
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

// ─── Tab Navigation ───────────────────────────────────────────────────────
function switchTab(btn, sectionId) {
  document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${sectionId}`).classList.add('active');
  if (btn) btn.classList.add('active');
  // Lazy-load section data
  if (sectionId === 'resources')  loadResources();
  if (sectionId === 'helplines')  loadHelplines();
  if (sectionId === 'breathe')    loadExercises();
}

function closeBanner() {
  const banner = document.getElementById('disclaimerBanner');
  if (banner) banner.style.display = 'none';
}

// ═══════════════════════════════════════════════════════════════════════════
// CHAT AGENT
// ═══════════════════════════════════════════════════════════════════════════
let isSending = false;

function handleKey(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function sendPrompt(btn) {
  document.getElementById('chatInput').value = btn.textContent.replace(/^[^\s]+\s/, '');
  // Hide quick prompts after first use
  document.getElementById('quickPrompts').style.display = 'none';
  sendMessage();
}

async function sendMessage() {
  if (isSending) return;
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  if (!message) return;

  isSending = true;
  input.value = '';
  input.style.height = 'auto';
  document.getElementById('sendBtn').disabled = true;

  // Hide quick prompts
  document.getElementById('quickPrompts').style.display = 'none';

  // Append user message
  appendMessage(message, 'user');

  // Show typing indicator
  const typingId = showTyping();

  try {
    const res  = await fetch('/api/chat', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ message })
    });
    const data = await res.json();

    removeTyping(typingId);

    if (data.error) {
      appendMessage(`⚠️ ${data.error}`, 'bot', 'error');
      return;
    }

    const isCrisis = data.crisis_level === 'crisis';
    appendMessage(data.reply, 'bot', isCrisis ? 'crisis' : 'normal');

    // If topics were found, show them subtly
    if (data.topics_found && data.topics_found.length > 0) {
      appendTopicPills(data.topics_found);
    }

  } catch (err) {
    removeTyping(typingId);
    appendMessage('❌ Network error. Please check your connection and try again.', 'bot', 'error');
  } finally {
    isSending = false;
    document.getElementById('sendBtn').disabled = false;
    input.focus();
  }
}

function appendMessage(text, role, type = 'normal') {
  const window_ = document.getElementById('chatWindow');
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-msg ${role === 'user' ? 'user-msg' : 'bot-msg'}`;
  if (type === 'crisis') msgDiv.classList.add('crisis-msg');

  const avatarDiv = document.createElement('div');
  avatarDiv.className = 'msg-avatar';
  avatarDiv.textContent = role === 'user' ? '👤' : '🧠';

  const bodyDiv = document.createElement('div');
  bodyDiv.className = 'msg-body';

  const bubbleDiv = document.createElement('div');
  bubbleDiv.className = 'msg-bubble';

  // Format message: convert markdown-like syntax to HTML
  const formatted = formatMessage(text);
  bubbleDiv.innerHTML = formatted;

  const timeDiv = document.createElement('div');
  timeDiv.className = 'msg-time';
  timeDiv.textContent = now;

  bodyDiv.appendChild(bubbleDiv);
  bodyDiv.appendChild(timeDiv);
  msgDiv.appendChild(avatarDiv);
  msgDiv.appendChild(bodyDiv);
  window_.appendChild(msgDiv);

  // Smooth scroll to bottom
  window_.scrollTo({ top: window_.scrollHeight, behavior: 'smooth' });
}

function formatMessage(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')    // **bold**
    .replace(/\*(.*?)\*/g, '<em>$1</em>')                 // *italic*
    .replace(/`(.*?)`/g, '<code>$1</code>')               // `code`
    .replace(/^#{1,3}\s(.+)$/gm, '<strong>$1</strong>')   // headers
    .replace(/^[\-\*]\s(.+)$/gm, '• $1')                  // bullets
    .replace(/\n\n+/g, '</p><p>')                         // paragraphs
    .replace(/\n/g, '<br/>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');
}

function appendTopicPills(topics) {
  const window_ = document.getElementById('chatWindow');
  const pillsDiv = document.createElement('div');
  pillsDiv.style.cssText = 'display:flex;gap:.4rem;flex-wrap:wrap;padding:0 .5rem;margin-top:-.5rem;';
  topics.forEach(t => {
    const pill = document.createElement('span');
    pill.style.cssText = 'background:#e8eefa;border:1px solid #c5d3f0;border-radius:999px;padding:.2rem .65rem;font-size:.7rem;color:#3d5fa5;';
    pill.textContent = `📚 ${t}`;
    pillsDiv.appendChild(pill);
  });
  window_.appendChild(pillsDiv);
  window_.scrollTo({ top: window_.scrollHeight, behavior: 'smooth' });
}

function showTyping() {
  const window_ = document.getElementById('chatWindow');
  const id = 'typing-' + Date.now();
  const div = document.createElement('div');
  div.id = id;
  div.className = 'chat-msg bot-msg';
  div.innerHTML = `
    <div class="msg-avatar">🧠</div>
    <div class="msg-body">
      <div class="typing-bubble">
        <span class="t-dot"></span>
        <span class="t-dot"></span>
        <span class="t-dot"></span>
      </div>
    </div>`;
  window_.appendChild(div);
  window_.scrollTo({ top: window_.scrollHeight, behavior: 'smooth' });
  return id;
}

function removeTyping(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

async function clearConversation() {
  if (!confirm('Clear this conversation? Your privacy is protected — this removes session history.')) return;
  try {
    await fetch('/api/clear-session', { method: 'POST' });
  } catch (_) {}

  const window_ = document.getElementById('chatWindow');
  window_.innerHTML = `
    <div class="chat-msg bot-msg welcome-msg">
      <div class="msg-avatar">🧠</div>
      <div class="msg-body">
        <div class="msg-bubble">
          <p>Hi again! Conversation cleared. Your privacy is protected. 🔒</p>
          <p>I'm here whenever you're ready to talk. What's on your mind?</p>
        </div>
        <div class="msg-time">Now</div>
      </div>
    </div>`;

  document.getElementById('quickPrompts').style.display = 'flex';
}

// ═══════════════════════════════════════════════════════════════════════════
// AFFIRMATION
// ═══════════════════════════════════════════════════════════════════════════
async function loadAffirmation() {
  try {
    const res  = await fetch('/api/affirmation');
    const data = await res.json();
    const el   = document.getElementById('affirmationText');
    if (el && data.affirmation) {
      el.style.opacity = '0';
      setTimeout(() => {
        el.textContent = data.affirmation;
        el.style.transition = 'opacity .4s';
        el.style.opacity = '1';
      }, 200);
    }
  } catch (_) {}
}

// ═══════════════════════════════════════════════════════════════════════════
// TOPICS SIDEBAR
// ═══════════════════════════════════════════════════════════════════════════
async function loadTopics() {
  try {
    const res  = await fetch('/api/topics');
    const data = await res.json();
    const list = document.getElementById('topicsList');
    if (!list) return;
    list.innerHTML = '';
    (data.topics || []).forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'topic-chip';
      btn.textContent = t.title;
      btn.onclick = () => {
        // Pre-fill chat with topic question and switch to chat tab
        const input = document.getElementById('chatInput');
        input.value = `Tell me about ${t.title}`;
        switchTab(document.querySelector('[data-section="chat"]'), 'chat');
        sendMessage();
      };
      list.appendChild(btn);
    });
  } catch (_) {
    const list = document.getElementById('topicsList');
    if (list) list.innerHTML = '<span style="font-size:.78rem;color:#aaa">Could not load topics.</span>';
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// BREATHING EXERCISE ENGINE
// ═══════════════════════════════════════════════════════════════════════════
const BREATHE_MODES = {
  box: {
    phases:  [
      { label: 'Inhale',  cls: 'inhale', duration: 4 },
      { label: 'Hold',    cls: 'hold',   duration: 4 },
      { label: 'Exhale',  cls: 'exhale', duration: 4 },
      { label: 'Hold',    cls: 'hold2',  duration: 4 },
    ],
    tip: 'Box breathing is used by Navy SEALs and elite athletes to instantly calm the nervous system.'
  },
  '478': {
    phases: [
      { label: 'Inhale',  cls: 'inhale', duration: 4 },
      { label: 'Hold',    cls: 'hold',   duration: 7 },
      { label: 'Exhale',  cls: 'exhale', duration: 8 },
    ],
    tip: '4-7-8 breathing activates the parasympathetic nervous system, promoting deep relaxation and sleep.'
  },
  diaphragm: {
    phases: [
      { label: 'Breathe In',  cls: 'inhale', duration: 5 },
      { label: 'Breathe Out', cls: 'exhale', duration: 7 },
    ],
    tip: 'Diaphragmatic breathing engages the belly, maximizing oxygen exchange and reducing cortisol.'
  }
};

let breatheInterval  = null;
let breatheRunning   = false;
let breathePhaseIdx  = 0;
let breatheCountdown = 0;
let breatheCountTimer = null;

function toggleBreath() {
  if (breatheRunning) {
    stopBreath();
  } else {
    startBreath();
  }
}

function startBreath() {
  breatheRunning = true;
  breathePhaseIdx = 0;
  document.getElementById('breatheStartBtn').textContent = '⏹ Stop';
  runBreathPhase();
}

function stopBreath() {
  breatheRunning = false;
  clearTimeout(breatheInterval);
  clearInterval(breatheCountTimer);
  document.getElementById('breatheStartBtn').textContent = '▶ Start';
  document.getElementById('breatheInstruction').textContent = 'Paused';
  document.getElementById('breatheCount').textContent = '';
  const circle = document.getElementById('breatheCircle');
  circle.className = 'breathe-circle';
}

function resetBreath() {
  stopBreath();
  const mode = document.getElementById('breatheMode').value;
  document.getElementById('breatheInstruction').textContent = 'Press Start';
  document.getElementById('breatheCount').textContent = '';
  document.getElementById('breatheTip').textContent = BREATHE_MODES[mode]?.tip || '';
}

function runBreathPhase() {
  if (!breatheRunning) return;
  const mode   = document.getElementById('breatheMode').value;
  const phases = BREATHE_MODES[mode]?.phases || BREATHE_MODES.box.phases;
  const phase  = phases[breathePhaseIdx % phases.length];

  // Update UI
  document.getElementById('breatheInstruction').textContent = phase.label;
  const circle = document.getElementById('breatheCircle');
  circle.className = `breathe-circle ${phase.cls}`;

  // Countdown
  breatheCountdown = phase.duration;
  document.getElementById('breatheCount').textContent = breatheCountdown;

  clearInterval(breatheCountTimer);
  breatheCountTimer = setInterval(() => {
    breatheCountdown--;
    if (breatheCountdown <= 0) {
      clearInterval(breatheCountTimer);
    } else {
      document.getElementById('breatheCount').textContent = breatheCountdown;
    }
  }, 1000);

  breatheInterval = setTimeout(() => {
    breathePhaseIdx++;
    runBreathPhase();
  }, phase.duration * 1000);
}

async function loadExercises() {
  const grid = document.getElementById('exercisesGrid');
  if (!grid || grid.dataset.loaded) return;
  try {
    const res  = await fetch('/api/breathing-exercise');
    const data = await res.json();
    grid.innerHTML = '';
    (data.exercises || []).forEach(ex => {
      const card = document.createElement('div');
      card.className = 'exercise-card';
      const stepsHTML = ex.steps.map(s => `<li>${s}</li>`).join('');
      card.innerHTML = `
        <h4>${ex.name}</h4>
        <div class="exercise-use">Best for: ${ex.use_for}</div>
        <ol class="exercise-steps">${stepsHTML}</ol>`;
      grid.appendChild(card);
    });
    grid.dataset.loaded = 'true';
  } catch (_) {
    grid.innerHTML = '<div class="loading-sm">Could not load exercises.</div>';
  }
}

function highlightStep(el) {
  document.querySelectorAll('.grounding-step').forEach(s => s.classList.remove('active'));
  el.classList.add('active');
}

// ═══════════════════════════════════════════════════════════════════════════
// RESOURCES TAB
// ═══════════════════════════════════════════════════════════════════════════
let resourcesLoaded = false;

async function loadResources() {
  if (resourcesLoaded) return;
  const grid = document.getElementById('resourcesGrid');
  if (!grid) return;

  const TOPIC_IDS = ['anxiety','depression','stress','mindfulness','sleep','self_care','relationships'];

  try {
    const results = await Promise.all(
      TOPIC_IDS.map(id => fetch(`/api/topic/${id}`).then(r => r.json()))
    );

    grid.innerHTML = '';
    results.forEach(data => {
      if (data.error) return;
      const card = document.createElement('div');
      card.className = 'resource-card';
      const tipsHTML = (data.tips || []).slice(0, 3)
        .map(t => `<li>${t}</li>`).join('');
      card.innerHTML = `
        <div class="resource-title">${data.title}</div>
        <div class="resource-content">${data.content.slice(0, 240)}…</div>
        ${tipsHTML ? `<ul class="resource-tips">${tipsHTML}</ul>` : ''}
        <div class="resource-source">Source: ${data.source}</div>`;
      grid.appendChild(card);
    });
    resourcesLoaded = true;
  } catch (_) {
    grid.innerHTML = '<div class="loading-sm">Could not load resources.</div>';
  }
}

// ─── Self-care tracker ────────────────────────────────────────────────────
let selfCareCount = 0;
function trackSelfCare(cb) {
  selfCareCount = document.querySelectorAll('#selfcareChecklist input:checked').length;
  const total   = document.querySelectorAll('#selfcareChecklist input').length;
  const score   = document.getElementById('selfcareScore');
  score.textContent = `${selfCareCount} / ${total} today`;
  score.style.background = selfCareCount >= 7 ? '#dcfce7' : selfCareCount >= 4 ? '#e8f5ef' : '#f0f4f8';
  score.style.color = selfCareCount >= 7 ? '#166534' : selfCareCount >= 4 ? '#4a7a5e' : '#5b7fcc';
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPLINES TAB
// ═══════════════════════════════════════════════════════════════════════════
let helplinesLoaded = false;

async function loadHelplines() {
  if (helplinesLoaded) return;
  const grid = document.getElementById('helplinesGrid');
  if (!grid) return;

  try {
    const res  = await fetch('/api/helplines');
    const data = await res.json();
    grid.innerHTML = '';
    (data.helplines || []).forEach(hl => {
      const card = document.createElement('div');
      card.className = 'helpline-card';
      card.innerHTML = `
        <div class="hl-country">${hl.country}</div>
        <div class="hl-name">${hl.name}</div>
        <div class="hl-contact">${hl.contact}</div>`;
      grid.appendChild(card);
    });
    helplinesLoaded = true;
  } catch (_) {
    grid.innerHTML = '<div class="loading-sm">Could not load helplines.</div>';
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  loadAffirmation();
  loadTopics();
  // Update breathe tip on mode change
  document.getElementById('breatheMode')?.addEventListener('change', resetBreath);
  // Set active nav btn
  document.querySelector('.nav-btn[data-section="chat"]')?.classList.add('active');
});
