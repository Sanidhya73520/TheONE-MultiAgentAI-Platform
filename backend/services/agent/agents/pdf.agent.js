import { getModel } from "../config/llmModels.js";
import { generatePdf } from "../utils/generatePdf.js";
import { uploadToS3 } from "../utils/uploadToS3.js";
import { getFromS3 } from "../utils/getFromS3.js";
import { deductCredits } from "../utils/deductCredits.js";import {checkAgentLimit} from "../config/agentLimit.js";


export const pdfAgent = async (state) => {

  try {
      await checkAgentLimit(state.userId, "pdf");
    const llm = await getModel("pdf");

    const prompt = `
You are an expert content writer and document creator.

Create the ACTUAL CONTENT that will be placed inside a professional PDF based on the user's request.

IMPORTANT:
- Write directly ABOUT the user's requested topic.
- Do NOT explain how to create a PDF.
- Do NOT provide a PDF creation guide, blueprint, workflow, or design instructions.
- Do NOT discuss target audience, research methodology, document structure, exporting, formatting, or distribution unless the user explicitly asks for those things.
- The generated content will be directly inserted into a PDF, so make it self-contained and useful.
- Adapt the content to the topic and the user's request.
- Include relevant facts, explanations, examples, important details, and context where appropriate.
- Do not invent specific facts or statistics.
- Avoid unnecessary repetition.
- Keep the writing professional, clear, and engaging.
- Use concise but informative points.
- If the topic is technical, explain technical concepts accurately.
- If the topic is a person, cover their background, career, achievements, and significance where relevant.
- If the topic is a company or product, cover its background, features, development, impact, and relevant details where appropriate.
- If the topic is historical, cover important events, timeline, causes, effects, and significance where appropriate.
- If the topic is educational, explain the concepts progressively with useful examples.
- Choose sections based on what is actually relevant to the user's topic rather than using a fixed template.

Return ONLY valid JSON.

Use exactly this structure:

{
  "title": "Relevant title",
  "subtitle": "Short descriptive subtitle",
  "sections": [
    {
      "heading": "Section heading",
      "points": [
        "Informative point",
        "Informative point",
        "Informative point"
      ]
    }
  ]
}

Requirements:
- Generate 5-8 relevant sections.
- Each section should contain 3-6 informative points.
- Every section must contain information about the requested topic.
- Do not create sections about "How to create this PDF" unless explicitly requested.
- Make the title specific to the requested topic.
- Make the subtitle describe the actual content.
- Keep points concise enough to fit naturally in a PDF.
- Return valid JSON only.
- No Markdown.
- No code fences.
- No explanations outside the JSON.

User Request:
${state.prompt}
`;

    const res = await llm.invoke(prompt);

    const clean = String(res.content)
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const data = JSON.parse(clean);
    const creditResult = await deductCredits(state.userId, "pdf");
    const pdfBuffer = await generatePdf(data);

    const filename = `pdf-${Date.now()}.pdf`;

    await uploadToS3(filename, pdfBuffer, "application/pdf");

    const downloadUrl = await getFromS3(filename, 24 * 60 * 60);

    return {
      ...state,
      aiResponse: `Your PDF has been generated successfully.

${data.title}

[📥 Download PDF](${downloadUrl})
`,
      credits: creditResult?.credits,
    };
  } catch (error) {


console.log(error);
      return {
        ...state,
        aiResponse:error?.data?.message || "Failed to generate PDF"
      }
  }
};
