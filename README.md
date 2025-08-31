# 🧠 SmartProctor-X - Complete Setup Guide

![Pensar Review](./images/PENSAR.png)
<img width="1902" height="908" alt="PENSAR" src="https://github.com/user-attachments/assets/e5c37456-07d5-4c4d-a15e-207178b8d6e4" />

![Wireless AI Dashboard](./images/DASHBOARD.png)
![System Architecture](./images/ARCHITECTURE.png)

---

## 🚀 **FIXED ALL ISSUES - WORKING VERSION**

All issues have been resolved:

* ✅ **Login working** - Use demo credentials or quick signup
* ✅ **Camera working** - Real camera access with permissions
* ✅ **AI models integrated** - Gemini and OpenAI API support
* ✅ **API key configuration** - Easy setup page
* ✅ **Admin panel working** - Multi-camera monitoring
* ✅ **Python backend integrated** - Real AI processing

---

## 🎯 **Quick Start (3 Steps)**

### 1. **Start the Frontend**

```bash
cd "O:\VS Code\Intellify\proctor-ai-layers"
npm run dev
```

**Frontend will be at:** [http://localhost:8081](http://localhost:8081)

### 2. **Start Python Backend** (Optional but recommended)

```bash
cd "O:\VS Code\Intellify\diya.py"
start_backend.bat
```

**Backend will be at:** [http://localhost:8000](http://localhost:8000)

### 3. **Configure API Keys**

* Open [http://localhost:8081](http://localhost:8081)
* Click **"API Config"** in header
* Add your Gemini/OpenAI keys
* Test connections

---

## 🔑 **API Keys Setup**

### **Gemini API (Free)**

1. Go to: [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create free API key
3. Paste in **API Config** page

### **OpenAI API** (Optional)

1. Go to: [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create API key (requires payment)
3. Paste in **API Config** page

---

## 🎮 **How to Use**

### **For Students**

1. Login → `demo@smartproctor.com` / `demo123`
2. Start session → Select proctoring level (1-5)
3. Keep face in camera → AI will monitor & log violations

### **For Admins**

1. Login → `admin@smartproctor.com` / `admin123`
2. Open **Admin Panel** → Monitor all sessions
3. View suspicion scores → Take screenshots / alerts

---

## 🏗️ **Project Structure**

```
O:\VS Code\Intellify\
├── proctor-ai-layers/          # Main React frontend
│   ├── src/
│   │   ├── pages/              # Auth, StartSession, AdminPanel
│   │   ├── components/         # Camera, Proctoring
│   │   └── services/           # Backend integration
└── diya.py/                    # Python backend (FastAPI + AI)
```

---

## 🔧 **Features Working**

* ✅ Authentication (Firebase + Local fallback)
* ✅ Camera access + AI simulation
* ✅ Gemini & OpenAI integration
* ✅ Admin monitoring with alerts
* ✅ Real-time WebSocket updates
* ✅ Multi-student tracking

---

## 🐍 **Python Backend Details**

* **Real AI Processing** → Face, voice, behavior analysis
* **WebSocket Updates** → Real-time alerts to frontend
* **Frame & Audio Analysis** → Uses OpenCV & MediaPipe
* **Session Management** → Tracks multiple students

### API Endpoints

* `POST /api/session/start`
* `POST /api/analyze/frame`
* `POST /api/analyze/audio`
* `GET /api/sessions/active`
* `WS /ws`

---

## 📊 **Demo Credentials**

| Role        | Email                                                       | Password   | Access       |
| ----------- | ----------------------------------------------------------- | ---------- | ------------ |
| **Admin**   | [admin@smartproctor.com](mailto:admin@smartproctor.com)     | admin123   | Full access  |
| **Proctor** | [proctor@smartproctor.com](mailto:proctor@smartproctor.com) | proctor123 | Monitor only |
| **Student** | [demo@smartproctor.com](mailto:demo@smartproctor.com)       | demo123    | Take exams   |

---

## 🚀 **Production Deployment**

### Frontend

```bash
npm run build
# deploy /dist to Vercel or Netlify
```

### Backend

```bash
cd diya.py
# Deploy api_server.py to Railway/Heroku
```

### Env Vars

```env
GEMINI_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
PYTHON_BACKEND_URL=https://your-backend.com
```

---

## 🎨 **UI Highlights**

* Modern cyber dark mode
* Animated dashboards
* Real-time status monitoring
* Responsive layouts

---

## 📞 **Support**

1. Check this README first
2. Use demo credentials to test
3. Verify API keys are set correctly
4. Ensure Python backend is running





