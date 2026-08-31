import { getModel } from "../config/llmModels.js";
import axios from "axios";
import { uploadToS3 } from "../utils/uploadToS3.js";
import { getFromS3 } from "../utils/getFromS3.js";
import { deductCredits } from "../utils/deductCredits.js";
import {checkAgentLimit} from "../config/agentLimit.js";

export const visionAgent = async (state) => {
  try {
    await checkAgentLimit(state.userId, "image");
    const llm = await getModel("image");

    const res = await llm.invoke(`
You are an elite AI image prompt engineer.

Convert the user request into a highly detailed image generation prompt.

Requirements:

- Cinematic lighting
- Professional composition
- Ultra realistic
- High detail
- Beautiful color palette
- 8K Quality
- Sharp focus
- Clean and clear image
- Photorealistic
- High resolution
- Professional photography
- Natural realistic textures
- Subject in tack-sharp focus
- No blur in the image
- No motion blur
- No excessive depth of field
- Stunning visuals

Return only the image prompt.

User Request:
${state.prompt}
  `);

    const prompt = res.content.trim();
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
    const imageRes = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const creditResult = await deductCredits(state.userId, "vision");

    const buffer = Buffer.from(imageRes.data);
    const filename = `image-${Date.now()}.png`;

    await uploadToS3(filename, buffer, "image/png");

    const downloadUrl = await getFromS3(filename, 24 * 60 * 60);
    return {
      ...state,
      aiResponse: `
![Generated Image](${downloadUrl})
📩 [Download Image](${downloadUrl})
⌛ Link expires in 24 Hours.
`,
      credits: creditResult?.credits,
    };
  } catch (error) {
    console.log(error);
      return {
        ...state,
        aiResponse:error?.data?.message || "Failed to generate Image",
      }
  }
};
