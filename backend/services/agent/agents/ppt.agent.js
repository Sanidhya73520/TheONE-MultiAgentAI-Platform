import { getModel } from "../config/llmModels.js";
import { generatePpt } from "../utils/generatePpt.js";
import { uploadToS3 } from "../utils/uploadToS3.js";
import { getFromS3 } from "../utils/getFromS3.js";
import { deductCredits } from "../utils/deductCredits.js";
import {checkAgentLimit} from "../config/agentLimit.js";

export const pptAgent = async (state) => {
  
  try {
    await checkAgentLimit(state.userId, "ppt");
    const llm = await getModel("ppt");
    const prompt = `
You are an expert presentation designer.
Return ONLY valid JSON.

{
  "title": "",
  "subtitle": "",
  "slides": [
  {
  "title": "",
  "points": [
  "",
  "",
  "",
  ""
  ]}}
  }
  Rules:
  - Do NOT return markdown.
  - Generate exactly 6 content slides.
  - Each slide should have 4-6 concise bullet points.
  - No explanations
  - No code Block
  - Return only valid JSON.

  Topic:
  ${state.prompt}`;

    const res = await llm.invoke(prompt);
    const data = JSON.parse(res.content);
    const creditResult = await deductCredits(state.userId,"ppt")
    const ppt = await generatePpt(data);
    const buffer = await ppt.write({ outputType: "nodebuffer" });
    const filename = `ppt-${Date.now()}.pptx`;

    await uploadToS3(
      filename,
      buffer,
      "application/vnd.openxmlformats-officedocument.presentationm1.presentation",
    );

    const downloadUrl = await getFromS3(filename, 24 * 60 * 60);

    return {
      ...state,
      aiResponse: `Your presentation has been generated successfully.

${data.title}

[📥 Download Presentation](${downloadUrl})
`,
 credits: creditResult?.credits,
    };
  } catch (error) {
    console.log(error);
      return {
        ...state,
        aiResponse:error?.data?.message || "Failed to generate PPT"
      }

  }
};
