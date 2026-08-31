import dotenv from "dotenv";
import { ChatGroq } from "@langchain/groq"
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { ChatOpenRouter } from "@langchain/openrouter";


dotenv.config();

const groq = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0.3,
    maxTokens: undefined,
    maxRetries: 2,
    // other params...
})

const gemini = new ChatGoogleGenerativeAI({
    model: "gemini-3.6-flash",
    temperature: 0.3,
    maxRetries: 2,
    // other params...
})

const openrouter = new ChatOpenRouter({
  model:"deepseek/deepseek-chat",
  temperature: 0.7,
  maxTokens:8000,
  maxRetries: 2
})

export const getModel=async (agent)=>{
  switch(agent){
    case "chat":
      return groq;
    case "search":
      return groq;
    case "coding":
      return openrouter;
    case "imageAnalyzer":
      return gemini;
    

    default:
      return groq;
  }
}