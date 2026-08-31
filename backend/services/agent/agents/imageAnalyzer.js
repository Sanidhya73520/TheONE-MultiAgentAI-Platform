import { SystemMessage, HumanMessage } from "@langchain/core/messages";

import { getModel } from "../config/llmModels.js";
import fs from "fs/promises";

import { deductCredits } from "../utils/deductCredits.js";
import {checkAgentLimit} from "../config/agentLimit.js";


export const imageAnalyzer = async (state) => {

  try {
      await checkAgentLimit(state.userId, "image");
    const llm = await getModel("imageAnalyzer");

    const imageBuffer = await fs.readFile(state.file.path);
    const base64Image = imageBuffer.toString("base64");

    const messages = [
      new SystemMessage(
        `You are The One AI Image Analyzer Agent.
        Rules:

        - Analyze only the uploaded Image
        - Answer the user's question accurately.
        - If text exists in the image, extract it.
        - if charts or tables exists in the image, explain them.
        - if Something is unclear, ask the user for clarification.
        - Use Markdown when helpful
        - Do Not Hallucinate or make up information.
        
        `,
      ),
      new HumanMessage({
        content: [
          {
            type: "text",
            text:
              state.prompt ||
              "Please analyze the uploaded image and provide insights.",
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${state.file.mimetype};base64,${base64Image}`,
            },
          },
        ],
      }),
    ];

    const response = await llm.invoke(messages);
    const creditResult =await deductCredits(state.userId,"vision")
    return {
      ...state,
      aiResponse: response.content,
      credits: creditResult?.credits,
    };
  } catch (error) {
    console.log(error);
      return {
        ...state,
        aiResponse:error?.data?.message || "Failed to Analyze Image"
      }
  }
  finally{
    await fs.unlink(state.file.path)
  }
};
