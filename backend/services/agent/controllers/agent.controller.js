import axios from "axios";
import { graph } from "../graph/graph.js";
import { addMessage } from "../config/memory.js";
import { deductCredits } from "../utils/deductCredits.js";

export const agent = async (req, res, next) => {
  try {
    const { prompt, conversationId, agent } = req.body;
    const file = req.file;
    const userId = req.headers["x-user-id"];
    console.log("1. Saving message...");

    const chatService = process.env.CHAT_SERVICE || "http://127.0.0.1:8002";
    await axios.post(`${chatService}/save-message`, {
      conversationId,
      role: "user",
      content: prompt,
    });

    console.log("2. Saved");

    console.log("3. Calling graph...");

    const result = await graph.invoke({
      prompt,
      conversationId,
      agent,
      userId,
      file,
    });
    console.log("4. Graph returned:", result);
    const response = result.aiResponse;
    await addMessage(conversationId, "user", prompt);

    await addMessage(conversationId, "assistant", response);
    await axios.post(`${chatService}/save-message`, {
      conversationId,
      role: "assistant",
      content: response,
      images: result?.images,
      artifacts: result?.artifacts,
    });
    console.log("5. Returning response:", response);
    return res.status(200).json({
      answer: response,
      images: result?.images,
      artifacts: result?.artifacts,
      credits: result?.credits,
    });
  } catch (error) {
    next(error);
    
    //     console.error("========== AGENT ERROR ==========");
    // console.error(error);
    // console.error("Message:", error.message);

    // if (error.response) {
    //   console.error("Response:", error.response.data);
    // }
    // return res.status(500).json({ message: `agent error ${error}` });
  }
};
