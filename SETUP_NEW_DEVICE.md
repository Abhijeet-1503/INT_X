# 🚀 SmartProctor-X - New Device Setup Guide

## 📋 Prerequisites

Before starting, ensure you have:
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download here](https://python.org/)
- **Git** - [Download here](https://git-scm.com/)

## 🔧 Quick Setup (5 Minutes)

### Step 1: Clone the Repository
```bash
git clone https://github.com/Abhijeet-1503/INT_X.git
cd INT_X
```

### Step 2: Install Frontend Dependencies
```bash
# Make sure you're in the main project directory
npm install
```

**If you get "package.json not found":**
```bash
# Check current directory
pwd
# Should show: .../INT_X or .../proctor-ai-layers

# If not, navigate to the correct directory:
cd proctor-ai-layers  # or wherever package.json is located
npm install
```

### Step 3: Install Python Backend Dependencies
```bash
# Navigate to Python backend
cd ../diya.py  # or wherever the Python files are

# Install Python dependencies
pip install fastapi uvicorn python-multipart pillow numpy opencv-python mediapipe
```

### Step 4: Start the Application
```bash
# Terminal 1: Start Frontend (from main directory)
cd proctor-ai-layers
npm run dev

# Terminal 2: Start Backend (from Python directory)
cd ../diya.py
python simple_api.py
```

## 🐛 Common Issues & Solutions

### Issue 1: "package.json not found"
**Solution:**
```bash
# Check if you're in the right directory
dir  # Windows
ls   # Mac/Linux

# Look for package.json file
# If not found, navigate to the correct subdirectory:
cd proctor-ai-layers
```

### Issue 2: "Node modules not found"
**Solution:**
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json  # Mac/Linux
rmdir /s node_modules & del package-lock.json  # Windows
npm install
```

### Issue 3: "Python module not found"
**Solution:**
```bash
# Install Python dependencies
pip install --upgrade pip
pip install fastapi uvicorn python-multipart pillow numpy opencv-python mediapipe

# If still failing, try:
pip install -r requirements.txt
```

### Issue 4: "Port already in use"
**Solution:**
- Frontend will auto-detect available ports (8080, 8081, 8082, etc.)
- Backend uses port 8000 by default
- If needed, kill existing processes:
  ```bash
  # Windows
  netstat -ano | findstr :8000
  taskkill /PID <PID_NUMBER> /F
  
  # Mac/Linux
  lsof -ti:8000 | xargs kill -9
  ```

## 📁 Project Structure

```
INT_X/
├── proctor-ai-layers/          # Main React frontend
│   ├── src/                    # Source code
│   ├── package.json           # Frontend dependencies
│   └── node_modules/          # Installed packages
├── diya.py/                   # Python backend
│   ├── api_server.py          # FastAPI server
│   ├── simple_api.py          # MVP API server
│   ├── camera_detector.py     # Camera detection
│   └── requirements.txt       # Python dependencies
└── README.md                  # Documentation
```

## 🌐 Access URLs

After successful setup:
- **Frontend**: http://localhost:8081 (or auto-detected port)
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (if using FastAPI)

## 🔑 API Configuration

1. Go to: http://localhost:8081
2. Navigate to **API Configuration**
3. Configure your API keys:
   - **Gemini API**: Get from [Google AI Studio](https://aistudio.google.com/app/apikey)
   - **OpenAI API**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
   - **Firebase**: Configure in Firebase Console
   - **Supabase**: Use provided credentials or set up your own

## 📱 Phone Camera Setup

1. Install **"IP Webcam"** app on your phone
2. Start the server in the app
3. Note the IP address (e.g., 192.168.1.100:8080)
4. In the app, go to **Camera Detection Config**
5. Enter URL: `http://[YOUR_PHONE_IP]:8080/shot.jpg`
6. Test connection and save settings

## 🆘 Getting Help

If you encounter issues:
1. Check this guide first
2. Ensure all prerequisites are installed
3. Verify you're in the correct directory
4. Check that ports 8000 and 8081 are available
5. Review the console for specific error messages

## 🎯 Quick Test

To verify everything is working:
1. Frontend should load at http://localhost:8081
2. Backend health check: http://localhost:8000/health
3. Try Level 1 proctoring to test camera access
4. Check API Configuration page for service status

**Happy proctoring!** 🎉
