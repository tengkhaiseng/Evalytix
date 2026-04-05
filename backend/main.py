import sys
import asyncio
import os
import json
import PyPDF2
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from pydantic import BaseModel
from playwright.async_api import async_playwright
from playwright_stealth import stealth
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from openai import AsyncOpenAI
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware

# Import your database files
from database import engine, SessionLocal
import models

# --- 1. WINDOWS 11 FIX ---
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

# --- 2. CREATE DATABASE TABLES ---
models.Base.metadata.create_all(bind=engine)

# --- 3. SETUP AI KEY ---
load_dotenv() 
openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY", "no-key-yet"))

# --- 4. DATA MODELS ---
class UserRequest(BaseModel):
    email: str
    password: str

class URLRequest(BaseModel):
    url: str

class EvaluationRequest(BaseModel):
    startup_name: str
    extracted_text: str
    evaluation_mode: str = "Post-Launch"
    user_email: Optional[str] = None  # <-- Updated this line!

# --- 5. DATABASE DEPENDENCY ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- 6. BROWSER LIFESPAN ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.playwright = await async_playwright().start()
    app.state.browser = await app.state.playwright.chromium.launch(headless=True)
    yield
    await app.state.browser.close()
    await app.state.playwright.stop()

app = FastAPI(lifespan=lifespan)

# --- 7. CORS MIDDLEWARE (THE VIP LIST) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://evalytix.vercel.app",  # Your live Vercel frontend
        "http://localhost:3000"         # Your local testing frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
#        AUTHENTICATION ENDPOINTS
# ==========================================

@app.post("/signup/")
def signup(user: UserRequest, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        return {"error": "This email is already registered! Please log in."}
    
    new_user = models.User(email=user.email, hashed_password=user.password)
    db.add(new_user)
    db.commit()
    
    return {"message": "Account created successfully! You can now log in."}

@app.post("/login/")
def login(user: UserRequest, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    
    if not db_user:
        return {"error": "Account not found. Please sign up first!"}
        
    if db_user.hashed_password != user.password:
        return {"error": "Incorrect password. Please try again."}
        
    return {"message": "Login successful!", "email": db_user.email}

# ==========================================
#          EXTRACTION ENDPOINTS
# ==========================================

@app.post("/extract-pdf/")
async def extract_pdf(file: UploadFile = File(...)):
    try:
        pdf_reader = PyPDF2.PdfReader(file.file)
        extracted_text = ""
        for page in pdf_reader.pages:
            extracted_text += page.extract_text() + "\n"
            
        return {"status": "Success", "filename": file.filename, "full_text": extracted_text.strip()}
    except Exception as e:
        return {"error": str(e)}

@app.post("/extract-url/")
async def extract_url(request: URLRequest):
    try:
        context = await app.state.browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0"
        )
        page = await context.new_page()
        await stealth(page) 
        await page.goto(request.url, wait_until="domcontentloaded", timeout=60000)
        await asyncio.sleep(2)
        
        html_content = await page.content()
        await page.close()
        await context.close()
        
        soup = BeautifulSoup(html_content, "html.parser")
        for tag in soup(["script", "style", "noscript"]):
            tag.decompose()
        
        text = "\n".join([line.strip() for line in soup.get_text(separator="\n").splitlines() if line.strip()])
        return {"status": "Success", "url": request.url, "preview": text[:500] + "..."}

    except Exception as e:
        print(f"DEBUG ERROR: {e}")
        raise HTTPException(status_code=500, detail=f"Scraper Error: {str(e)}")

# ==========================================
#          EVALUATION ENDPOINTS
# ==========================================

@app.post("/evaluate/")
async def evaluate_startup(request: EvaluationRequest, db: Session = Depends(get_db)):
    if os.getenv("OPENAI_API_KEY") == "placeholder_key_for_now":
        raise HTTPException(status_code=400, detail="Please add your real OpenAI API Key to the .env file first!")

    # --- 1. SECURITY BOUNCER WITH ADMIN BYPASS ---
    user = None
    
    # 👑 Put your exact login email here!
    ADMIN_EMAILS = ["tengkhaiseng0253@gmail.com", "admin@evalytix.com"] 
    
    if request.user_email:
        user = db.query(models.User).filter(models.User.email == request.user_email).first()
        if user:
            is_admin = user.email in ADMIN_EMAILS
            
            # If they are NOT an admin, and they hit the limit, block them!
            if not is_admin and user.subscription_tier == models.TierEnum.STARTER and user.evaluations_count >= 3:
                raise HTTPException(status_code=403, detail="Free tier limit reached (3/3). Please upgrade to Premium to evaluate more startups!")
    # ---------------------------------------------

    try:
        system_prompt = """
        You are an expert venture capitalist AI. Evaluate the startup text and return ONLY a valid JSON object with these exact keys:
        "technical_readiness_score": (float 0-100),
        "business_viability_score": (float 0-100),
        "innovation_index_score": (float 0-100),
        "financial_sustainability_score": (float 0-100),
        "key_strengths": (Array of 3-4 objects, each with "title" and "desc" strings),
        "priority_actions": (Array of 3 strings detailing immediate critical steps),
        "strategic_opportunities": (Array of 3 strings detailing long-term growth opportunities),
        "feedback": (A short paragraph summarizing the evaluation)
        """
        
        response = await openai_client.chat.completions.create(
            model="gpt-4o", 
            response_format={ "type": "json_object" }, 
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Startup Name: {request.startup_name}\n\nInformation:\n{request.extracted_text[:3000]}"}
            ],
            temperature=0.3
        )
        
        ai_data = json.loads(response.choices[0].message.content)

        # Extract the 4 scores generated by AI
        tech_score = float(ai_data.get("technical_readiness_score", 0))
        biz_score = float(ai_data.get("business_viability_score", 0))
        innov_score = float(ai_data.get("innovation_index_score", 0))
        fin_score = float(ai_data.get("financial_sustainability_score", 0))

        # Apply Your Exact Custom Weightage (30%, 30%, 20%, 20%)
        calculated_overall_score = (tech_score * 0.30) + (biz_score * 0.30) + (innov_score * 0.20) + (fin_score * 0.20)
        
        # Round it to 1 decimal place
        final_overall_score = round(calculated_overall_score, 1)
        
        new_evaluation = models.Evaluation(
            startup_name=request.startup_name,
            evaluation_mode=request.evaluation_mode,
            input_type="Text Extraction",
            technical_readiness_score=tech_score,
            business_viability_score=biz_score,
            innovation_index_score=innov_score,
            financial_sustainability_score=fin_score,
            overall_viability_score=final_overall_score,
            key_strengths=json.dumps(ai_data.get("key_strengths", [])),
            priority_actions=json.dumps(ai_data.get("priority_actions", [])),
            strategic_opportunities=json.dumps(ai_data.get("strategic_opportunities", [])),
            ai_feedback_json=ai_data.get("feedback", "No feedback provided.")
        )
        
        db.add(new_evaluation)
        
        # --- 2. UPDATE QUOTA: Only subtract a credit if the AI succeeded! ---
        if user:
            user.evaluations_count += 1
            
        db.commit()
        db.refresh(new_evaluation) 
        
        return {
            "status": "Success",
            "id": new_evaluation.id, 
            "startup": request.startup_name,
            "overall_score": final_overall_score,
            "scores": ai_data
        }

    except Exception as e:
        print(f"AI/DB Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to evaluate and save: {str(e)}")

@app.get("/evaluations/")
def get_evaluations(db: Session = Depends(get_db)):
    try:
        evaluations = db.query(models.Evaluation).all()
        return {
            "status": "Success", 
            "total_saved": len(evaluations), 
            "data": evaluations
        }
    except Exception as e:
        print(f"Database Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch data: {str(e)}")

@app.get("/profile/{email}")
def get_user_profile(email: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    
    if not user:
        return {"error": "User not found"}
        
    return {
        "email": user.email,
        "subscription_tier": getattr(user, "subscription_tier", "Free Tier"), 
        "evaluations_count": getattr(user, "evaluations_count", 0),
        "created_at": str(getattr(user, "created_at", "Today")).split(" ")[0] 
    }

@app.delete("/evaluations/{eval_id}")
def delete_evaluation(eval_id: int, db: Session = Depends(get_db)):
    db_eval = db.query(models.Evaluation).filter(models.Evaluation.id == eval_id).first()
    
    if not db_eval:
        return {"error": "Evaluation not found."}
        
    db.delete(db_eval)
    db.commit()
    
    return {"message": "Evaluation deleted successfully."}