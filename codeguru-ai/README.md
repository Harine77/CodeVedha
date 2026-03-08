# CodeGuru AI - AI Code Tutor for Indian Students

An intelligent code tutoring platform powered by Google Gemini AI, designed specifically for Indian students learning programming.

## 🚀 Tech Stack

- **Frontend**: React 18 + Vite
- **AI**: Google Gemini API (FREE tier)
- **Styling**: TailwindCSS + Framer Motion
- **Code Editor**: Monaco Editor
- **Charts**: Recharts
- **Icons**: React Icons
- **Deployment**: Vercel (FREE)

## 📦 Installation

All dependencies are already installed! Here's what was set up:

```bash
# Core dependencies
- @google/generative-ai
- @monaco-editor/react
- recharts
- react-icons
- framer-motion
- tailwindcss
```

## 🔧 Setup

### 1. Get your FREE Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Then edit `.env` and add your Groq API key:

```
VITE_GROQ_API_KEY=your_actual_api_key_here
# Optional model override
VITE_GROQ_MODEL=llama-3.3-70b-versatile
```

### 3. Start Development Server

```bash
npm run dev
```

Your app will be available at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/
│   ├── analysis/        # Code analysis components
│   ├── interview/       # Interview prep components
│   ├── visualization/   # Charts and data viz
│   └── shared/          # Reusable UI components
├── utils/               # Helper functions
├── hooks/               # Custom React hooks
└── App.jsx             # Main app component
```

## 🎯 Features to Build

- **Code Analysis**: AI-powered code review and suggestions
- **Interview Prep**: Practice coding problems with AI guidance
- **Progress Tracking**: Visualize learning progress with charts
- **Real-time Feedback**: Instant code evaluation
- **Indian Context**: Examples and explanations tailored for Indian students

## 🚀 Deployment

Deploy to Vercel for FREE:

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repo to Vercel dashboard for automatic deployments.

## 📝 Next Steps

1. Set up your Gemini API key
2. Start building components in the respective folders
3. Integrate Monaco Editor for code input
4. Connect Gemini AI for code analysis
5. Add Recharts for progress visualization
6. Deploy to Vercel

## 🤝 Contributing

Feel free to contribute and make this platform better for Indian students!

## 📄 License

MIT License - feel free to use this for your projects!
