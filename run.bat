@echo off
echo ════════════════════════════════════════════
echo   NutriGuide AI — IBM Granite Powered
echo ════════════════════════════════════════════
echo.
echo Installing dependencies...
pip install -r requirements.txt
echo.
echo Starting NutriGuide AI on http://localhost:5000
echo Press Ctrl+C to stop.
echo.
python app.py
