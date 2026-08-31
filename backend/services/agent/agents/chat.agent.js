import { getModel } from "../config/llmModels.js";
import { getMemory } from "../config/memory.js";

import {
  SystemMessage,
  HumanMessage,
  AIMessage,
} from "@langchain/core/messages";
import { deductCredits } from "../utils/deductCredits.js";
import {checkAgentLimit} from "../config/agentLimit.js";

export const chatAgent = async (state) => {
  try {

    await checkAgentLimit(state.userId, "chat");
    const llm = await getModel("chat");
    const history = await getMemory(state.conversationId);

    const searchContext =
      state.searchResults?.results?.length > 0
        ? `Web Search Results:
${JSON.stringify(state.searchResults)}
Answer the user using only the above search results.`
        : "";

    const systemPrompt = `
You are The ONE, an intelligent AI assistant.
${searchContext}

If searchContext exists:
- Use search results to answer.
- Do not mention internal tools.

Rules:
- For simple questions, greetings and short queries, respond naturally in plain text.
- For technical, educational, coding, or detailed topics, use clean Markdown.

Search response rules:

- When using web search results, answer in around 100 words.
- Never dump the raw search results.
- Use only the provided search results for current/fresh information.
- Do not mention internal tools.
- Prefer 3-5 short bullet points when appropriate.
- Do not repeat information.

Formatting:
- Use # for titles and ## for sections.
- Leave a blank line after headings.
- Use bullet points for lists.
- Use numbered lists for steps.
- Use fenced code blocks with language tags for code.
- Keep paragraphs short and readable.
- Never write headings and content in the same line.
- Never generate large walls of text.
`;
    const messages = [new SystemMessage(systemPrompt)];

    history.forEach((msg) => {
      if (!msg?.content) return;
      if (msg.role === "user") {
        messages.push(new HumanMessage(msg.content));
      }
      if (msg.role === "assistant") {
        messages.push(new AIMessage(msg.content));
      }
    });
    messages.push(new HumanMessage(state.prompt));

    const response = await llm.invoke(messages);
    // await deductCredits(state.userId,"chat")
const creditResult = await deductCredits(state.userId, "chat");

    return {
      ...state,
      aiResponse: response.content,
      credits: creditResult?.credits,
    };
  } catch (error) {
console.log(error);
      return {
        ...state,
        aiResponse:error?.data?.message || "Failed to generate Response"
      }
  }
};
