import fs, {stat} from "fs";
import { PDFParse } from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { vectorStore } from "../config/vectorDb.js";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { getModel } from "../config/llmModels.js";
import { deductCredits } from "../utils/deductCredits.js";
import {checkAgentLimit} from "../config/agentLimit.js";

export const pdfRag = async (state) => {

  try {
    await checkAgentLimit(state.userId, "pdf");
    const buffer = fs.readFileSync(state.file.path);
    const pdf = new PDFParse({
      data: buffer,
    });
    const result = await pdf.getText();
    const text = result.text;

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await splitter.createDocuments([text]);

    const collectionName = `pdf-${Date.now()}`;
    const store = await vectorStore(docs, collectionName);

    const relevantDocs = await store.similaritySearch(state.prompt, 5);

    const context = relevantDocs.map((d) => d.pageContent).join("\n\n");

    const llm = await getModel("pdf-rag");

    const messages = [
      new SystemMessage(`You are The ONE AI PDF Assistant.

      Rules:
      - Answer ONLY from the uploaded PDF
      - Never make up information
      - If the answer is not in the PDF, respond with "I couldn't find this information in the PDF."
      - Always provide the answer in a concise manner.
      - Use markdown formatting.
        
        `),

      new HumanMessage(`Context: ${context}
        Question: ${state.prompt}`),
    ];

    const response = await llm.invoke(messages);
    const creditResult =await deductCredits(state.userId,"pdf")
    return {
      ...state,
      aiResponse: response.content,
      credits: creditResult?.credits,
    }
  } catch (error) 
  {
    console.log(error);
      return {
        ...state,
        aiResponse:error?.data?.message || "Failed to Analyze PDF"
      }
  }

  finally{
    fs.unlinkSync(state.file.path);
  }
};
