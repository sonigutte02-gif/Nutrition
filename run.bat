@echo off
echo ════════════════════════════════════════════
echo   MindBridge AI — IBM Granite Powered
echo   Mental Health Awareness Chatbot
echo ════════════════════════════════════════════
echo.
echo Installing dependencies...
pip install -r requirements.txt
echo.
echo Starting MindBridge AI on http://localhost:5001
echo Press Ctrl+C to stop.
echo.
python app.py
