# 🥗 NutriGuide AI — Nutrition Agentic AI Application

> **Powered by IBM Granite LLM via IBM WatsonX AI**

A full-stack, web-based **Agentic AI** application that generates personalized 7-day nutrition plans and answers dietary queries using IBM's Granite large language model. Built with Python (Flask) on the backend and a responsive single-page frontend (HTML/CSS/JS).

---

## 📸 Features

| Feature | Description |
|---|---|
| 📋 **Personalized Nutrition Planner** | Collects user profile (name, age, diet preference, medical history, location, goal) and generates a tailored 7-day meal plan |
| 💬 **Agentic AI Chat** | Conversational nutrition Q&A assistant with session-aware context |
| 💡 **Quick Tips** | Evidence-based nutrition tips rendered dynamically |
| 🛡️ **Guardrails & AI Ethics** | Harmful content detection, medical-topic redirection, HAM tone enforcement |
| ⚠️ **Medical Disclaimer** | Auto-appended to every generated plan |
| 📱 **Responsive UI** | Works on desktop, tablet, and mobile |

---

## 🏗️ Project Structure

```
nutrition_ai_app/
├── app.py                  # Flask backend + IBM Granite AI agent
├── requirements.txt        # Python dependencies
├── run.bat                 # Windows one-click launcher
├── README.md               # This file
├── .gitignore              # Git ignore rules
├── templates/
│   └── index.html          # Single-page application frontend
└── static/
    ├── css/
    │   └── style.css       # Responsive stylesheet
    └── js/
        └── app.js          # Frontend agentic AI client logic
```

---

## ⚙️ Prerequisites

- **Python** 3.9 or higher
- **pip** package manager
- An active **IBM WatsonX** account with access to Granite models
- Internet connection (to call IBM WatsonX API)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/sonigutte02-gif/Nutrition.git
cd Nutrition
```

### 2. (Optional) Create a Virtual Environment

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

The credentials are pre-configured in `app.py`. If you need to update them, open `app.py` and edit these constants near the top of the file:

```python
IBM_API_KEY    = "your-ibm-api-key"
IBM_PROJECT_ID = "your-project-id"
IBM_URL        = "https://eu-de.ml.cloud.ibm.com"
GRANITE_MODEL  = "ibm/granite-13b-instruct-v2"
```

> 💡 **Tip:** For production deployments, use environment variables or a `.env` file instead of hardcoding credentials.

### 5. Run the Application

**Windows (double-click or terminal):**
```bash
run.bat
```

**Or directly with Python:**
```bash
python app.py
```

### 6. Open in Browser

Navigate to **http://localhost:5000**

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Serves the main web application |
| `POST` | `/api/generate-plan` | Generate a personalized 7-day nutrition plan |
| `POST` | `/api/chat` | Agentic Q&A chat with IBM Granite |
| `GET` | `/api/quick-tips` | Returns 10 evidence-based nutrition tips |
| `GET` | `/api/health` | Health check / status |

### Example: Generate Plan Request

```json
POST /api/generate-plan
Content-Type: application/json

{
  "name": "Priya Sharma",
  "age": "32",
  "diet_preference": "vegetarian",
  "medical_history": "diabetes, hypertension",
  "goal": "manage chronic disease through diet",
  "activity_level": "moderate",
  "city": "Mumbai",
  "country": "India"
}
```

### Example: Chat Request

```json
POST /api/chat
Content-Type: application/json

{
  "message": "What foods are high in protein for a vegetarian?"
}
```

---

## 🛡️ AI Ethics & Safety

This application is built in accordance with **IBM's Ethical AI principles**:

- ✅ **Helpful** — Provides actionable, evidence-based nutrition guidance
- ✅ **Accurate & Respectful (HAM Tone)** — Empathetic, non-judgmental responses
- ✅ **Safe Guardrails** — Blocks harmful keywords; redirects sensitive medical queries
- ✅ **Transparent** — All AI-generated content is clearly labelled
- ✅ **Medical Disclaimer** — Every plan includes a professional disclaimer
- ✅ **No Dangerous Advice** — Never prescribes medication dosages or clinical treatments

---

## ⚠️ Medical Disclaimer

> This application provides general nutrition information for **educational purposes only**. It is **NOT** a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider, registered dietitian, or physician before making significant dietary changes — especially if you have existing medical conditions.

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **AI / LLM** | IBM Granite 13B Instruct v2 |
| **AI Platform** | IBM WatsonX AI (`ibm-watsonx-ai`) |
| **Backend** | Python 3.x, Flask 3.x |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Fonts** | Inter (Google Fonts) |
| **Deployment** | Any Python-capable host (local, cloud, Docker) |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**sonigutte02-gif**  
GitHub: [@sonigutte02-gif](https://github.com/sonigutte02-gif)

---

*Built with ❤️ using IBM Granite LLM & IBM WatsonX AI*
