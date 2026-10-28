/* ═══════════════════════════════════════════════════════════════════════════
   NutriGuide AI — Frontend JavaScript (Agentic AI Client)
   ═══════════════════════════════════════════════════════════════════════════ */

// ─── Section Navigation ───────────────────────────────────────────────────
function showSection(name) {
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`section-${name}`).classList.add('active');
  event.currentTarget.classList.add('active');
  if (name === 'tips') loadTips();
}

// ─── Medical History Checkbox Handler ────────────────────────────────────
function updateMedical() {
  const boxes    = document.querySelectorAll('.checkbox-item input[type="checkbox"]');
  const noneBox  = document.querySelector('.checkbox-item input[value="none"]');
  const selected = [];

  boxes.forEach(cb => {
    if (cb.value === 'none') return;
    if (noneBox && noneBox.checked && cb.checked) cb.checked = false;
    if (cb.checked) selected.push(cb.value);
  });

  // If 'None' is checked and something else is also now checked, uncheck None
  if (noneBox && noneBox.checked && selected.length > 0) {
    noneBox.checked = false;
  }

  document.getElementById('medical').value =
    selected.length ? selected.join(', ') : 'None';
}

// ─── Collect Form Data ────────────────────────────────────────────────────
function collectFormData() {
  return {
    name:             document.getElementById('name').value.trim(),
    age:              document.getElementById('age').value,
    diet_preference:  document.getElementById('diet').value,
    medical_history:  document.getElementById('medical').value,
    goal:             document.getElementById('goal').value,
    activity_level:   document.getElementById('activity').value,
    city:             document.getElementById('city').value.trim(),
    country:          document.getElementById('country').value.trim()
  };
}

// ─── Generate Nutrition Plan ──────────────────────────────────────────────
async function generatePlan(event) {
  event.preventDefault();
  const data = collectFormData();

  // Client-side validation
  if (!data.name || !data.age || !data.diet_preference || !data.city || !data.country) {
    showPlanError('Please fill in all required fields marked with *.');
    return;
  }
  if (data.diet_preference === '') {
    showPlanError('Please select a diet preference.');
    return;
  }

  // Show loading state
  document.getElementById('planPlaceholder').classList.add('hidden');
  document.getElementById('planOutput').classList.add('hidden');
  document.getElementById('planLoading').classList.remove('hidden');

  const btn = document.getElementById('generateBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="btn-icon">⏳</span> Generating…';

  try {
    const res  = await fetch('/api/generate-plan', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data)
    });
    const json = await res.json();

    if (!res.ok || json.error) {
      showPlanError(json.error || 'An error occurred. Please try again.');
      return;
    }
    if (json.warning) {
      showPlanWarning(json.warning);
      return;
    }

    // Display plan
    document.getElementById('planLoading').classList.add('hidden');
    document.getElementById('planOutput').classList.remove('hidden');
    document.getElementById('planContent').textContent = json.plan;

  } catch (err) {
    showPlanError('Network error. Please check your connection and try again.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span class="btn-icon">🤖</span> Generate My Nutrition Plan';
  }
}

function showPlanError(msg) {
  document.getElementById('planLoading').classList.add('hidden');
  document.getElementById('planOutput').classList.add('hidden');
  document.getElementById('planPlaceholder').classList.remove('hidden');
  document.getElementById('planPlaceholder').innerHTML =
    `<div class="error-msg">❌ ${msg}</div>`;
}

function showPlanWarning(msg) {
  document.getElementById('planLoading').classList.add('hidden');
  document.getElementById('planOutput').classList.add('hidden');
  document.getElementById('planPlaceholder').classList.remove('hidden');
  document.getElementById('planPlaceholder').innerHTML =
    `<div class="warn-msg">⚠️ ${msg}</div>`;
}

// ─── Copy Plan ────────────────────────────────────────────────────────────
function copyPlan() {
  const text = document.getElementById('planContent').textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = event.currentTarget;
    btn.textContent = '✅ Copied!';
    setTimeout(() => { btn.textContent = '📋 Copy Plan'; }, 2000);
  });
}

// ─── Print Plan ───────────────────────────────────────────────────────────
function printPlan() {
  const content = document.getElementById('planContent').textContent;
  const win = window.open('', '_blank');
  win.document.write(`
    <html><head><title>NutriGuide AI — Nutrition Plan</title>
    <style>body{font-family:Arial,sans-serif;padding:2rem;line-height:1.7;font-size:14px;}
    h1{color:#0f62fe;}pre{white-space:pre-wrap;word-break:break-word;}</style>
    </head><body>
    <h1>🥗 NutriGuide AI — Your Personalized Nutrition Plan</h1>
    <p style="color:#64748b;font-size:12px;">Generated by IBM Granite LLM • ${new Date().toLocaleDateString()}</p>
    <pre>${content}</pre>
    </body></html>`);
  win.document.close();
  win.print();
}

// ─── CHAT ─────────────────────────────────────────────────────────────────
let chatLocked = false;

function handleChatKey(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendChatMessage();
  }
}

function sendSuggestion(btn) {
  const input = document.getElementById('chatInput');
  input.value = btn.textContent;
  sendChatMessage();
}

async function sendChatMessage() {
  if (chatLocked) return;
  const input   = document.getElementById('chatInput');
  const message = input.value.trim();
  if (!message) return;

  chatLocked = true;
  input.value = '';
  input.disabled = true;
  document.getElementById('chatSendBtn').disabled = true;

  appendChatMessage(message, 'user');
  const typingId = appendTypingIndicator();

  try {
    const res  = await fetch('/api/chat', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ message })
    });
    const json = await res.json();

    removeTypingIndicator(typingId);

    if (json.error) {
      appendChatMessage(`❌ ${json.error}`, 'bot');
    } else {
      appendChatMessage(json.reply || 'I could not process that. Please try again.', 'bot');
    }
  } catch (err) {
    removeTypingIndicator(typingId);
    appendChatMessage('❌ Network error. Please check your connection.', 'bot');
  } finally {
    chatLocked = false;
    input.disabled = false;
    document.getElementById('chatSendBtn').disabled = false;
    input.focus();
  }
}

function appendChatMessage(text, role) {
  const window_ = document.getElementById('chatWindow');
  const div = document.createElement('div');
  div.className = `chat-message ${role === 'user' ? 'user-message' : 'bot-message'}`;

  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = role === 'user' ? '👤' : '🤖';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';

  // Convert **bold** and newlines for display
  const formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
  bubble.innerHTML = formatted;

  div.appendChild(avatar);
  div.appendChild(bubble);
  window_.appendChild(div);
  window_.scrollTop = window_.scrollHeight;
}

function appendTypingIndicator() {
  const window_ = document.getElementById('chatWindow');
  const div = document.createElement('div');
  div.className = 'chat-message bot-message';
  div.id = 'typing-' + Date.now();

  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = '🤖';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.innerHTML = '<div class="msg-typing"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>';

  div.appendChild(avatar);
  div.appendChild(bubble);
  window_.appendChild(div);
  window_.scrollTop = window_.scrollHeight;
  return div.id;
}

function removeTypingIndicator(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// ─── QUICK TIPS ───────────────────────────────────────────────────────────
let tipsLoaded = false;

async function loadTips() {
  if (tipsLoaded) return;
  try {
    const res  = await fetch('/api/quick-tips');
    const json = await res.json();
    const grid = document.getElementById('tipsGrid');
    grid.innerHTML = '';

    json.tips.forEach(tip => {
      // Extract emoji prefix as icon
      const emojiMatch = tip.match(/^([\u{1F000}-\u{1FFFF}\u2700-\u27BF]|\p{Emoji_Presentation})/u);
      const icon  = emojiMatch ? emojiMatch[0] : '✅';
      const textContent = tip.replace(/^[\u{1F000}-\u{1FFFF}\u2700-\u27BF\p{Emoji_Presentation}]\s*/u, '');

      const card = document.createElement('div');
      card.className = 'tip-card';
      card.innerHTML = `<div class="tip-icon">${icon}</div><div class="tip-text">${textContent}</div>`;
      grid.appendChild(card);
    });

    tipsLoaded = true;
  } catch (err) {
    document.getElementById('tipsGrid').innerHTML =
      '<div class="error-msg">Failed to load tips. Please refresh.</div>';
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Ensure form nav button is active on load
  document.querySelector('.nav-btn').classList.add('active');
});
