import { searchTool } from "../config/tavily.js";
import { deductCredits } from "../utils/deductCredits.js";
import {checkAgentLimit} from "../config/agentLimit.js";

export const searchAgent = async (state) => {
  try {
    await checkAgentLimit(state.userId, "search");
    const results = await searchTool.invoke({ query: state.prompt });
    const searchResults = {
  query: results.query,
  answer: results.answer,
  images: results.images || [],
  results: (results.results || []).slice(0, 3).map((item) => ({
    title: item.title,
    url: item.url,
    content: item.content?.slice(0, 800),
  })),
};
   const creditResult = await deductCredits(state.userId,"search")
    console.log(results);
    return {
      ...state,
      searchResults,
      images: results.images || [],
      credits: creditResult?.credits,
    };
  } catch (error) {
    console.log(error);
      return {
        ...state,
        aiResponse:error?.data?.message || "Failed to generate Response",
              searchResults: [],
      images: [],
      }
  }
};
