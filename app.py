"""
MindBridge AI — Mental Health Awareness Chatbot
Powered by IBM Granite LLM via IBM WatsonX
Agentic AI with RAG pipeline, crisis detection, empathy engine
"""

import os
import json
import re
import random
from pathlib import Path
from flask import Flask, render_template, request, jsonify, session
from ibm_watsonx_ai import Credentials
from ibm_watsonx_ai.foundation_models import ModelInference
from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as GenParams

# ═══════════════════════════════════════════════════════════════════════════════
# App Configuration
# ═══════════════════════════════════════════════════════════════════════════════
app = Flask(__name__)
app.secret_key = os.urandom(32)

# ─── IBM WatsonX Credentials ──────────────────────────────────────────────────
IBM_API_KEY    = "QZ5lgS18ri16jWwPZZrsA7_B0QeSfoIjRUDw84ToC6Kz"
IBM_PROJECT_ID = "97e606c4-d17e-41dc-ab3e-68e2d396226d"
IBM_URL        = "https://eu-de.ml.cloud.ibm.com"
GRANITE_MODEL  = "ibm/granite-13b-instruct-v2"

# ─── Knowledge Base Path ──────────────────────────────────────────────────────
KB_PATH = Path(__file__).parent / "knowledge_base" / "mental_health_kb.json"

# ═══════════════════════════════════════════════════════════════════════════════
# Load RAG Knowledge Base
# ═══════════════════════════════════════════════════════════════════════════════
def load_knowledge_base() -> dict:
    with open(KB_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

KB = load_knowledge_base()


# ═══════════════════════════════════════════════════════════════════════════════
# Agent 1: Crisis Detection Agent
# ═══════════════════════════════════════════════════════════════════════════════
CRISIS_KEYWORDS = [
    "suicidal", "suicide", "kill myself", "end my life", "don't want to live",
    "want to die", "no reason to live", "better off dead", "hurt myself",
    "self-harm", "cutting myself", "overdose on purpose", "end it all",
    "can't go on", "not worth living", "take my own life"
]

DISTRESS_KEYWORDS = [
    "hopeless", "worthless", "can't cope", "breaking down", "falling apart",
    "nobody cares", "no one cares", "completely alone", "give up", "no point",
    "so done", "done with everything", "exhausted with life"
]

def detect_crisis_level(text: str) -> str:
    """Returns 'crisis', 'distress', or 'normal'."""
    text_lower = text.lower()
    if any(kw in text_lower for kw in CRISIS_KEYWORDS):
        return "crisis"
    if any(kw in text_lower for kw in DISTRESS_KEYWORDS):
        return "distress"
    return "normal"


# ═══════════════════════════════════════════════════════════════════════════════
# Agent 2: RAG Retrieval Agent
# ═══════════════════════════════════════════════════════════════════════════════
def retrieve_context(query: str) -> list[dict]:
    """Semantic keyword matching over the knowledge base topics."""
    query_lower = query.lower()
    matched = []
    for topic in KB["topics"]:
        score = sum(1 for kw in topic["keywords"] if kw in query_lower)
        if score > 0:
            matched.append((score, topic))
    matched.sort(key=lambda x: x[0], reverse=True)
    return [t for _, t in matched[:3]]  # top-3 relevant topics


def format_rag_context(topics: list[dict]) -> str:
    """Format retrieved topics into a concise context string for the prompt."""
    if not topics:
        return ""
    parts = []
    for t in topics:
        content = t.get("content", "")[:600]
        tips = t.get("tips", [])[:3]
        tips_text = "\n".join(f"  • {tip}" for tip in tips)
        parts.append(
            f"[Knowledge: {t['title']}]\n{content}\n"
            + (f"Evidence-based tips:\n{tips_text}" if tips else "")
        )
    return "\n\n".join(parts)


# ═══════════════════════════════════════════════════════════════════════════════
# Agent 3: Empathy Classification Agent
# ═══════════════════════════════════════════════════════════════════════════════
EMOTIONAL_INDICATORS = {
    "grief":       ["grief", "loss", "died", "death", "mourning", "passed away", "bereavement"],
    "anger":       ["angry", "furious", "rage", "frustrated", "mad", "irritated"],
    "fear":        ["scared", "terrified", "afraid", "frightened", "phobia"],
    "shame":       ["ashamed", "embarrassed", "humiliated", "guilty", "shame"],
    "loneliness":  ["lonely", "alone", "isolated", "no friends", "no one"],
    "joy_seeking": ["happy", "better", "improve", "grow", "positive", "hopeful"],
}

def classify_emotion(text: str) -> str:
    text_lower = text.lower()
    for emotion, indicators in EMOTIONAL_INDICATORS.items():
        if any(ind in text_lower for ind in indicators):
            return emotion
    return "general"


# ═══════════════════════════════════════════════════════════════════════════════
# Agent 4: Intent Router Agent
# ═══════════════════════════════════════════════════════════════════════════════
def classify_intent(text: str) -> str:
    """Routes query to the right agent/flow."""
    text_lower = text.lower()
    if any(w in text_lower for w in ["breathe", "breathing exercise", "calm me", "panic", "ground me", "grounding"]):
        return "exercise"
    if any(w in text_lower for w in ["meditate", "meditation", "mindful", "mindfulness"]):
        return "mindfulness"
    if any(w in text_lower for w in ["tip", "advice", "help me", "what should", "how do i", "how can i"]):
        return "advice"
    if any(w in text_lower for w in ["helpline", "hotline", "emergency", "call", "crisis number", "number to call"]):
        return "helpline"
    if any(w in text_lower for w in ["affirmation", "motivat", "positive", "inspire", "encourage"]):
        return "affirmation"
    return "conversation"


# ═══════════════════════════════════════════════════════════════════════════════
# IBM Granite Model Initialization
# ═══════════════════════════════════════════════════════════════════════════════
def get_granite_model() -> ModelInference:
    credentials = Credentials(url=IBM_URL, api_key=IBM_API_KEY)
    params = {
        GenParams.MAX_NEW_TOKENS:      900,
        GenParams.MIN_NEW_TOKENS:      40,
        GenParams.TEMPERATURE:         0.65,
        GenParams.TOP_P:               0.92,
        GenParams.REPETITION_PENALTY:  1.15,
    }
    return ModelInference(
        model_id=GRANITE_MODEL,
        credentials=credentials,
        project_id=IBM_PROJECT_ID,
        params=params
    )


# ═══════════════════════════════════════════════════════════════════════════════
# Prompt Builder — System Persona
# ═══════════════════════════════════════════════════════════════════════════════
SYSTEM_PERSONA = """You are MindBridge, a compassionate, trauma-informed AI mental health awareness assistant powered by IBM Granite.

Your core principles:
1. EMPATHY FIRST — Always validate the user's feelings before offering information or advice.
2. NON-JUDGMENTAL — Accept all feelings without judgment or criticism.
3. SAFETY — Never provide advice that could cause harm. Always recommend professional help for serious issues.
4. EVIDENCE-BASED — Ground all guidance in recognized psychological research and clinical evidence.
5. BOUNDARIES — Clearly remind users you are an AI, not a therapist or medical professional.
6. CULTURAL SENSITIVITY — Respect diverse cultural perspectives on mental health.
7. EMPOWERMENT — Help users build their own coping skills and self-awareness.

Communication style:
- Warm, gentle, and supportive tone
- Use "I" statements to connect authentically (e.g., "I hear how hard that is.")
- Avoid clinical jargon unless explaining a concept
- Keep responses concise but thorough (3-5 paragraphs max)
- End with a gentle follow-up question or invitation to continue"""


def build_main_prompt(
    user_message: str,
    rag_context: str,
    emotion: str,
    intent: str,
    conversation_history: list,
    crisis_level: str
) -> str:

    history_text = ""
    if conversation_history:
        recent = conversation_history[-6:]  # last 3 exchanges
        history_text = "\n".join(
            f"{'User' if m['role'] == 'user' else 'MindBridge'}: {m['content']}"
            for m in recent
        )

    crisis_instruction = ""
    if crisis_level == "crisis":
        crisis_instruction = (
            "\n⚠️ CRITICAL: The user may be in crisis. "
            "Respond with immediate compassion, do NOT provide coping advice yet. "
            "Express care, ask if they are safe, and gently provide crisis helpline information. "
            "Do NOT dismiss or minimize their pain."
        )
    elif crisis_level == "distress":
        crisis_instruction = (
            "\n⚠️ NOTE: The user is showing signs of significant distress. "
            "Lead with validation and warmth. Gently offer professional resources."
        )

    emotion_instruction = {
        "grief":       "The user is grieving. Acknowledge their loss with deep compassion before anything else.",
        "anger":       "The user is angry. Validate their anger — it is a valid emotion. Help them feel heard.",
        "fear":        "The user is experiencing fear. Create safety first. Reassure them they are not alone.",
        "shame":       "The user is experiencing shame. Counter shame with unconditional acceptance.",
        "loneliness":  "The user feels lonely. Acknowledge the pain of isolation and affirm their worth.",
        "joy_seeking": "The user is seeking growth. Encourage and support their positive momentum.",
        "general":     ""
    }.get(emotion, "")

    prompt = f"""{SYSTEM_PERSONA}
{crisis_instruction}
{emotion_instruction}

--- Evidence-Based Context (from trusted mental health resources) ---
{rag_context if rag_context else "No specific topic match — provide general compassionate support."}
--- End Context ---

Conversation History:
{history_text if history_text else "This is the start of the conversation."}

User: {user_message}

Intent detected: {intent}

MindBridge response (warm, empathetic, evidence-based, with disclaimer if giving clinical information):"""

    return prompt


def build_exercise_prompt(exercise_type: str) -> str:
    return f"""{SYSTEM_PERSONA}

The user wants a guided {exercise_type} exercise right now.

Provide a step-by-step guided {exercise_type} exercise:
- Use numbered steps
- Include timing/counts where appropriate
- Use a calm, encouraging voice
- Keep it practical and doable in 3-5 minutes
- End with a gentle affirmation

Guided {exercise_type}:"""


# ═══════════════════════════════════════════════════════════════════════════════
# Output Sanitizer
# ═══════════════════════════════════════════════════════════════════════════════
def sanitize(text: str) -> str:
    text = re.sub(r"<\|.*?\|>|\[INST\]|\[/INST\]|<<SYS>>|<</SYS>>", "", text)
    return text.strip()


# ═══════════════════════════════════════════════════════════════════════════════
# Crisis Response Builder (no LLM needed — immediate & safe)
# ═══════════════════════════════════════════════════════════════════════════════
CRISIS_RESPONSE = """I hear you, and I'm truly glad you reached out right now. What you're feeling matters deeply, and you don't have to face this alone.

Your safety is the most important thing. **Please reach out to a crisis helpline immediately** — they are free, confidential, and available 24/7 with people who truly care:

🆘 **Immediate Help:**
• **USA:** Call or text **988** (Suicide & Crisis Lifeline)
• **UK:** Call **116 123** (Samaritans — free, 24/7)
• **India:** Call **9152987821** (iCall) or **1860-2662-345**
• **Canada:** Call **1-833-456-4566**
• **Australia:** Call **13 11 14** (Lifeline)
• **Worldwide:** Text **HOME** to **741741** (Crisis Text Line)
• **All countries:** Visit [IASP Crisis Centres](https://www.iasp.info/resources/Crisis_Centres/)

💙 The pain you're feeling right now is real, and it is temporary. Crises do pass with the right support. You deserve care and support.

If you're in immediate danger, please call your local emergency services (911, 999, 112, or equivalent).

I'm here with you. Can you tell me more about what's happening right now?"""


# ═══════════════════════════════════════════════════════════════════════════════
# ROUTES
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/")
def index():
    session.clear()
    return render_template("index.html")


@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json()
    if not data or not data.get("message", "").strip():
        return jsonify({"error": "No message provided"}), 400

    user_message = data["message"].strip()[:1000]  # limit input length

    # Init session conversation history
    if "history" not in session:
        session["history"] = []

    # ── Agent 1: Crisis Detection ──────────────────────────────────────────
    crisis_level = detect_crisis_level(user_message)

    if crisis_level == "crisis":
        # Immediate safe response — no LLM needed
        session["history"].append({"role": "user",      "content": user_message})
        session["history"].append({"role": "assistant", "content": CRISIS_RESPONSE})
        session.modified = True
        return jsonify({
            "reply":       CRISIS_RESPONSE,
            "crisis_level": "crisis",
            "show_helplines": True,
            "status":      "success"
        })

    # ── Agent 2: RAG Retrieval ─────────────────────────────────────────────
    retrieved_topics = retrieve_context(user_message)
    rag_context      = format_rag_context(retrieved_topics)

    # ── Agent 3: Emotion Classification ───────────────────────────────────
    emotion = classify_emotion(user_message)

    # ── Agent 4: Intent Routing ────────────────────────────────────────────
    intent = classify_intent(user_message)

    # ── Handle helpline intent directly ───────────────────────────────────
    if intent == "helpline":
        helplines = KB.get("global_helplines", [])
        response  = "Here are verified crisis helplines available globally:\n\n"
        for hl in helplines:
            response += f"🌍 **{hl['country']}** — {hl['name']}: `{hl['contact']}`\n"
        response += "\nAll helplines are free and confidential. Please don't hesitate to reach out — you deserve support. 💙"
        return jsonify({"reply": response, "status": "success", "intent": "helpline"})

    # ── Handle affirmation intent directly ────────────────────────────────
    if intent == "affirmation":
        affirmation = random.choice(KB.get("affirmations", ["You are enough."]))
        reply = (
            f"💙 Here's something I'd like you to sit with for a moment:\n\n"
            f"*\"{affirmation}\"*\n\n"
            f"Take a slow, deep breath as you let those words settle in. "
            f"You are seen, heard, and valued. Would you like to talk about what prompted you to seek this today?"
        )
        return jsonify({"reply": reply, "status": "success", "intent": "affirmation"})

    # ── Call IBM Granite for main conversation ─────────────────────────────
    try:
        model  = get_granite_model()

        # Choose prompt based on intent
        if intent in ("exercise", "mindfulness"):
            label  = "breathing and grounding" if intent == "exercise" else "mindfulness meditation"
            prompt = build_exercise_prompt(label)
        else:
            prompt = build_main_prompt(
                user_message=user_message,
                rag_context=rag_context,
                emotion=emotion,
                intent=intent,
                conversation_history=session["history"],
                crisis_level=crisis_level
            )

        raw_reply = model.generate_text(prompt=prompt)
        reply     = sanitize(raw_reply)

        # Append medical disclaimer when giving clinical/advice content
        if intent in ("advice", "conversation") and retrieved_topics:
            reply += (
                "\n\n---\n*🔒 Privacy: This conversation is not stored or shared. "
                "⚠️ Disclaimer: MindBridge is an AI for awareness and education only — "
                "not a substitute for professional mental health care. "
                "If you're struggling, please consult a licensed therapist or counselor.*"
            )

        # Update session history (keep last 20 messages)
        session["history"].append({"role": "user",      "content": user_message})
        session["history"].append({"role": "assistant", "content": reply})
        session["history"] = session["history"][-20:]
        session.modified   = True

        return jsonify({
            "reply":         reply,
            "crisis_level":  crisis_level,
            "emotion":       emotion,
            "intent":        intent,
            "topics_found":  [t["title"] for t in retrieved_topics],
            "status":        "success"
        })

    except Exception as e:
        return jsonify({"error": f"AI service error: {str(e)}"}), 500


@app.route("/api/breathing-exercise", methods=["GET"])
def breathing_exercise():
    """Return a guided breathing exercise directly from knowledge base."""
    exercises = next(
        (t for t in KB["topics"] if t["id"] == "breathing_exercises"), None
    )
    if exercises:
        return jsonify({"exercises": exercises.get("exercises", []), "status": "success"})
    return jsonify({"exercises": [], "status": "not_found"})


@app.route("/api/helplines", methods=["GET"])
def helplines():
    """Return verified global helplines."""
    return jsonify({
        "helplines": KB.get("global_helplines", []),
        "status":    "success"
    })


@app.route("/api/affirmation", methods=["GET"])
def affirmation():
    """Return a random mental health affirmation."""
    return jsonify({
        "affirmation": random.choice(KB.get("affirmations", ["You are enough."])),
        "status":      "success"
    })


@app.route("/api/topics", methods=["GET"])
def topics():
    """Return available mental health topics."""
    topic_list = [
        {"id": t["id"], "title": t["title"]}
        for t in KB["topics"]
        if t["id"] != "crisis"
    ]
    return jsonify({"topics": topic_list, "status": "success"})


@app.route("/api/topic/<topic_id>", methods=["GET"])
def get_topic(topic_id: str):
    """Return tips for a specific topic."""
    topic = next((t for t in KB["topics"] if t["id"] == topic_id), None)
    if topic:
        return jsonify({
            "title":   topic["title"],
            "content": topic.get("content", ""),
            "tips":    topic.get("tips", []),
            "source":  topic.get("source", ""),
            "status":  "success"
        })
    return jsonify({"error": "Topic not found"}), 404


@app.route("/api/clear-session", methods=["POST"])
def clear_session():
    """Clear conversation history for privacy."""
    session.clear()
    return jsonify({"status": "cleared", "message": "Conversation history cleared."})


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status":  "ok",
        "model":   GRANITE_MODEL,
        "service": "MindBridge AI",
        "version": "1.0.0"
    })


# ═══════════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
