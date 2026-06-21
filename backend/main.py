from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import os

from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser

# 1. Load Environment Variables (API Keys)
load_dotenv()

# 2. Initialize the FastAPI Server
app = FastAPI(title="Real Estate AI Auditor API")

# Allow our Next.js frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, change this to your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Define the Data Structures (What goes in, what comes out)
class AuditRequest(BaseModel):
    marketing_copy: str

# This forces the AI to reply in EXACTLY this JSON format
class AuditResult(BaseModel):
    score: int = Field(description="A score out of 100 based on persuasiveness and clarity")
    strengths: list[str] = Field(description="List of 2-3 things the copy does well")
    weaknesses: list[str] = Field(description="List of 2-3 reasons this copy might lose a real estate lead")
    rewritten_copy: str = Field(description="A completely rewritten, highly converting version of the copy")

# 4. Create the API Endpoint
@app.post("/audit")
async def audit_marketing_copy(request: AuditRequest):
    # Initialize the OpenAI Model
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)
    
    # Set up the parser to enforce our JSON structure
    parser = PydanticOutputParser(pydantic_object=AuditResult)
    
    # Create the Prompt Template
    prompt = PromptTemplate(
        template="""You are an elite, million-dollar real estate marketing copywriter. 
        Your job is to audit the following marketing copy written by a real estate developer.
        Analyze it strictly for lead conversion. Does it create urgency? Does it sound premium? 
        
        Here is the copy:
        {copy}
        
        {format_instructions}
        """,
        input_variables=["copy"],
        partial_variables={"format_instructions": parser.get_format_instructions()},
    )
    
    # Create the "Chain" (Connect the prompt to the LLM to the Parser)
    chain = prompt | llm | parser
    
    # Run the chain!
    result = chain.invoke({"copy": request.marketing_copy})
    
    return result

@app.get("/")
def read_root():
    return {"message": "AI Brain is running!"}
