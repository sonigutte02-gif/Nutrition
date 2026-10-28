# 🧠 MindBridge AI — Mental Health Awareness Chatbot

> **Powered by IBM Granite LLM · IBM WatsonX AI · IBM Bob**

A compassionate, agentic AI-powered **Mental Health Awareness Chatbot** built with IBM Granite. MindBridge provides empathetic conversations, mental health education, mindfulness guidance, self-care recommendations, and crisis support — all grounded in a RAG pipeline using trusted mental health knowledge sources.

---

## 💙 What MindBridge Offers

| Feature | Description |
|---|---|
| 💬 **Empathetic Chat** | IBM Granite-powered conversations with trauma-informed, non-judgmental responses |
| 🔍 **RAG Pipeline** | Retrieval-Augmented Generation from a curated mental health knowledge base (WHO, NIMH, APA) |
| 🆘 **Crisis Detection** | Automatic detection of crisis language → immediate safe response + helplines |
| 🌬️ **Breathing Exercises** | Interactive animated guides: Box Breathing, 4-7-8, Diaphragmatic |
| 🌿 **5-4-3-2-1 Grounding** | Interactive anxiety grounding technique |
| 📚 **Mental Health Education** | Topics: anxiety, depression, stress, sleep, trauma, relationships, self-care |
| ✅ **Self-Care Checklist** | Daily trackable wellness habits |
| 🆘 **Verified Helplines** | 15+ verified crisis helplines across 12+ countries |
| 🔒 **Privacy First** | Session-only conversations — nothing stored or shared |
| ⚠️ **Clear Disclaimers** | AI is not a therapist — every response includes appropriate boundaries |

---

## 🏗️ Architecture

```
mental_health_ai/
├── app.py                          # Flask backend + 4 AI agents
├── requirements.txt                # Python dependencies
├── run.bat                         # Windows one-click launcher
├── README.md                       # This file
├── knowledge_base/
│   └── mental_health_kb.json       # Curated RAG knowledge base
├── templates/
│   └── index.html                  # 4-tab SPA frontend
└── static/
    ├── css/style.css               # Calming, accessible design
    └── js/app.js                   # Frontend agentic client
```

### Agentic AI Pipeline

```
User Input
    │
    ▼
[Agent 1: Crisis Detection]    ← Keyword-based safety gate
    │ crisis? → Immediate safe response + helplines (no LLM)
    │ safe? ↓
    ▼
[Agent 2: RAG Retrieval]       ← Semantic search over KB
    │ top-3 relevant topics retrieved
    ▼
[Agent 3: Emotion Classifier]  ← Detects grief, anger, fear, shame…
    │
    ▼
[Agent 4: Intent Router]       ← Routes to exercise/mindfulness/advice/chat
    │
    ▼
[IBM Granite 13B]              ← Generates empathetic, evidence-based response
    │
    ▼
Sanitized + Disclaimed Response → User
```

---

## ⚙️ Prerequisites

- **Python** 3.9+
- **pip** package manager
- IBM WatsonX account with Granite model access
- Internet connection

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/sonigutte02-gif/MindBridge.git
cd MindBridge
```

### 2. Create a Virtual Environment (Recommended)

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure IBM WatsonX Credentials

Credentials are pre-configured in `app.py`. For production, use environment variables:

```python
IBM_API_KEY    = "your-ibm-api-key"
IBM_PROJECT_ID = "your-project-id"
IBM_URL        = "https://eu-de.ml.cloud.ibm.com"
GRANITE_MODEL  = "ibm/granite-13b-instruct-v2"
```

### 5. Run

```bash
python app.py
# Open http://localhost:5001
```

Or double-click **`run.bat`** on Windows.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Web application |
| `POST` | `/api/chat` | Main chat with IBM Granite + RAG |
| `GET` | `/api/helplines` | Verified global crisis helplines |
| `GET` | `/api/affirmation` | Random mental health affirmation |
| `GET` | `/api/topics` | Available mental health topics |
| `GET` | `/api/topic/<id>` | Detailed topic content + tips |
| `GET` | `/api/breathing-exercise` | Guided breathing exercises |
| `POST` | `/api/clear-session` | Clear session for privacy |
| `GET` | `/api/health` | Health check |

### Chat Request Example

```json
POST /api/chat
{
  "message": "I've been feeling really anxious and can't stop overthinking"
}
```

### Chat Response Example

```json
{
  "reply": "I hear you, and what you're feeling is real and valid...",
  "crisis_level": "normal",
  "emotion": "general",
  "intent": "conversation",
  "topics_found": ["Anxiety & Anxiety Disorders"],
  "status": "success"
}
```

---

## 🛡️ AI Ethics, Safety & Privacy

### IBM Ethical AI Principles

- ✅ **Helpful** — Evidence-based, actionable mental health guidance
- ✅ **Accurate** — RAG-grounded responses from WHO, NIMH, APA, SAMHSA
- ✅ **Respectful (HAM Tone)** — Trauma-informed, non-judgmental, empathetic
- ✅ **Safe Guardrails** — 4-layer agentic safety system
- ✅ **Transparent** — All AI content labelled; limitations clearly stated
- ✅ **Privacy-Preserving** — No persistent storage of conversations
- ✅ **Culturally Sensitive** — Diverse helplines, culturally aware responses

### Safety Layers

1. **Crisis Detection Agent** — Immediate response for suicidal/self-harm language (bypasses LLM)
2. **Distress Detection** — Elevated empathy mode for high-distress signals
3. **Medical Redirect** — Deflects medication/clinical dosage queries to professionals
4. **Consistent Disclaimers** — Every clinical response includes the AI limitation notice

---

## 📚 Knowledge Base Sources

| Source | Domain |
|---|---|
| World Health Organization (WHO) | Global mental health |
| National Institute of Mental Health (NIMH) | Clinical research |
| American Psychological Association (APA) | Evidence-based practice |
| SAMHSA | Substance use & mental health |
| Jon Kabat-Zinn MBSR Program | Mindfulness |
| International Association for Suicide Prevention | Crisis support |
| Cleveland Clinic / Harvard Medical School | Breathing techniques |
| National Sleep Foundation | Sleep & mental health |

---

## ⚠️ Medical Disclaimer

> MindBridge AI is a **mental health awareness and education tool only**. It is **NOT** a licensed therapist, psychologist, psychiatrist, or medical professional. Information provided does not constitute medical advice, diagnosis, or treatment. Always consult a qualified mental health professional for personalized care. In a crisis, contact emergency services or a crisis helpline immediately.

---

## 🆘 Key Crisis Helplines

| Country | Name | Contact |
|---|---|---|
| USA | 988 Suicide & Crisis Lifeline | **988** |
| USA/Global | Crisis Text Line | Text **HOME** to **741741** |
| UK | Samaritans | **116 123** |
| India | iCall (TISS) | **9152987821** |
| Canada | Crisis Services Canada | **1-833-456-4566** |
| Australia | Lifeline | **13 11 14** |

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **AI / LLM** | IBM Granite 13B Instruct v2 |
| **AI Platform** | IBM WatsonX AI |
| **RAG** | Custom JSON knowledge base + keyword semantic matching |
| **Backend** | Python 3.x, Flask 3.x |
| **Frontend** | HTML5, CSS3, Vanilla JS (SPA) |
| **Fonts** | Inter + Merriweather (Google Fonts) |

---

## 👤 Author

**sonigutte02-gif** · [GitHub](https://github.com/sonigutte02-gif)

*Built with compassion using IBM Granite LLM, IBM WatsonX AI & IBM Bob* 💙
