# AI Agreement Analyzer

A full-stack application that analyzes legal agreements using AI, providing clear explanations in simple English without requiring external API keys.

## 🚀 Features

- **Multiple Input Methods**: Upload PDF/DOCX files, paste text, or scrape web pages
- **Local LLM Processing**: Uses Hugging Face Transformers (Mistral/Llama) - no external API required
- **Clear Explanations**: Translates legal jargon into simple English anyone can understand
- **Risk Assessment**: Automatically identifies risks and assigns risk levels (Low/Medium/High)
- **Pros & Cons Analysis**: Balanced assessment of agreement benefits and drawbacks
- **Key Clauses Extraction**: Identifies and explains the most important clauses
- **Recommendations**: Provides actionable recommendations based on the analysis
- **Analysis History**: Save and review past analyses
- **Private & Secure**: All processing done locally - documents never leave your machine

## 📋 Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **LLM**: Hugging Face Transformers (Mistral-7B or Llama2)
- **Document Processing**: PyPDF2, python-docx, BeautifulSoup4, requests
- **Database**: SQLite with SQLAlchemy ORM
- **Server**: Uvicorn

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: React Router v6

## 🛠️ Installation & Setup

### Prerequisites

- Python 3.9+ (for backend)
- Node.js 16+ (for frontend)
- 8+ GB RAM (for LLM model)
- 10+ GB disk space (for model cache)

### Backend Setup

1. **Clone and navigate to backend:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create .env file:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` to configure:
   - `LLM_MODEL_NAME`: Model to use (default: mistralai/Mistral-7B-Instruct-v0.1)
   - `LLM_DEVICE`: "cpu", "cuda", or "mps" (default: cpu)
   - `DATABASE_URL`: Database connection string

5. **Run backend:**
   ```bash
   python app.py
   ```
   
   Backend will start at `http://localhost:8000`
   - API docs: `http://localhost:8000/docs`
   - Health check: `http://localhost:8000/api/health`

### Frontend Setup

1. **Navigate to frontend:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```
   
   Frontend will start at `http://localhost:3000`

4. **Build for production:**
   ```bash
   npm run build
   npm run preview
   ```

## 📖 Usage

### Web Interface

1. Open `http://localhost:3000` in your browser
2. Choose input method:
   - **Upload File**: Drag & drop or click to upload PDF/DOCX
   - **Paste Text**: Copy & paste agreement text (100+ characters)
   - **URL**: Enter webpage URL to analyze

3. Click "Analyze Agreement"
4. Wait for analysis (typically 30-120 seconds depending on document size)
5. Review results with:
   - **Summary**: Quick explanation of the agreement
   - **Risk Level**: Overall risk assessment
   - **Pros**: Beneficial clauses and protections
   - **Cons**: Unfavorable terms and risks
   - **Key Clauses**: Important clauses explained
   - **Recommendations**: What to do next

## 🔐 Privacy & Security

- ✅ No data sent to external services (fully local)
- ✅ No AI API keys needed or stored
- ✅ Documents only stored locally in SQLite
- ✅ Analysis results stored only in local database

## 🐛 Troubleshooting

### Model Download Issues
```bash
# Set cache directory
export HF_HOME=./huggingface_cache
python app.py
```

### Out of Memory
- Use quantized models
- Reduce `CHUNK_SIZE` in .env
- Use GPU if available
- Close other applications

### Slow Analysis
- Use GPU: set `LLM_DEVICE=cuda` or `mps`
- Use quantized smaller models
- Check system resources

## 📚 Project Structure

```
legalisneww/
├── backend/
│   ├── app.py                    # FastAPI application
│   ├── config.py                 # Configuration
│   ├── database.py              # Database setup
│   ├── models.py                # SQLAlchemy models
│   ├── schemas.py               # Pydantic schemas
│   ├── requirements.txt
│   ├── documents/
│   │   ├── parser.py            # PDF/DOCX parsing
│   │   └── scraper.py           # URL scraping
│   ├── analysis/
│   │   ├── llm_handler.py       # LLM interface
│   │   ├── prompts.py           # Prompt templates
│   │   └── analyzer.py          # Analysis engine
│   └── routes/
│       ├── health.py            # Health check
│       └── agreements.py        # API endpoints
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.js
    ├── vite.config.ts
    ├── src/
    │   ├── App.tsx              # Main component
    │   ├── App.css
    │   ├── main.tsx             # Entry point
    │   ├── pages/
    │   │   ├── Home.tsx         # Upload page
    │   │   ├── Results.tsx      # Results page
    │   │   └── History.tsx      # History page
    │   ├── components/
    │   │   ├── FileUpload.tsx
    │   │   ├── TextInput.tsx
    │   │   ├── ResultsDisplay.tsx
    │   │   └── AnalysisCard.tsx
    │   └── services/
    │       └── api.ts           # API client
    └── public/
```

## 📝 Environment Configuration

Create `.env` file in backend directory:

```bash
# Application
DEBUG=True
HOST=127.0.0.1
PORT=8000

# Database
DATABASE_URL=sqlite:///./agreement_analyzer.db

# LLM Configuration
LLM_MODEL_NAME=mistralai/Mistral-7B-Instruct-v0.1
LLM_DEVICE=cpu  # Options: cpu, cuda, mps
LLM_CACHE_DIR=./models

# Document processing
MAX_TOKENS=512
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
```

## 🎯 Features Breakdown

### Analysis Output
- ✅ **Summary**: Plain English explanation of the agreement
- ✅ **Risk Level**: LOW, MEDIUM, or HIGH
- ✅ **Key Clauses**: 5-8 most important clauses extracted and explained
- ✅ **Pros**: 3-5 beneficial aspects
- ✅ **Cons**: 3-5 unfavorable aspects
- ✅ **Recommendations**: Action items and suggestions

## 📊 Performance

- **Model Download**: 5-10 minutes on first run
- **Analysis Time**: 30-120 seconds (CPU), 10-30 seconds (GPU)
- **Memory Usage**: 4-8 GB RAM
- **Database**: SQLite (no external DB needed)

---

**Made with ❤️ for better legal understanding**
