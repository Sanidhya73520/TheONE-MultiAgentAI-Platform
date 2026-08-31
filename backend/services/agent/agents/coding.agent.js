import { getModel } from "../config/llmModels.js";
import { deductCredits } from "../utils/deductCredits.js";
import {checkAgentLimit} from "../config/agentLimit.js";
export const codingAgent = async (state) => {
  try{
      await checkAgentLimit(state.userId, "coding");
  const intentLlm = await getModel("intent");
  const llm = await getModel("coding");
  const intentRes = await intentLlm.invoke(`
You are an intent classifier.

Return ONLY one of these values.

CODE_GENERATION
CODE_REVIEW
CODE_EXPLANATION
DEBUGGING
OPTIMIZATION
CONVERSION
DOCUMENTATION

User Request:

${state.prompt}
  `);

  const intent = intentRes.content;
  if (intent === "CODE_GENERATION") {
    const prompt = `
    You are The ONE Coding Agent.
    Generate the required project.
    
    Default Stack:
    -HTML
    -CSS
    -JavaScript

    Use React / Next.js/ Vue ONLY if explicitly requested.

    Rules:
    -Responsive
    -Modern UI
    -CSS Variables
    -Flexbox / Grid
    -Smooth Scroll
    -Hover Effects
    -Beautiful Spacing 
    -Single Page unless user asks otherwise

    IMPORTANT CODE QUALITY RULES:
- Generate syntactically valid, runnable code.
- HTML must contain <!DOCTYPE html>, <html>, <head>, and <body>.
- Properly close every HTML tag.
- CSS must use valid CSS syntax.
- Do not unnecessarily escape CSS characters such as :.
- JavaScript must be complete and executable.
- index.html must correctly link style.css and script.js.
- Make sure all generated files work together.

IMAGES 
===================
Always use real unsplash images.
Never use placeholders.

    Return ONLY valid JSON.
    Schema:
    {
    "files":[
    {
    "name":"index.html",
    "content":"..."},
    {
    "name":"style.css",
    "content":"..."
    },
    {
    "name":"script.js",
    "content":"..."
    }]}

    Rules:
    -Output must start with {
    -Output must end with }
    -No markdown
    - No explanation
    - No extra text
    - No \`\`\`
    - Never mention intent

    User Request:
    ${state.prompt}
    `;

    const res = await llm.invoke(prompt);

    const clean = String(res.content)
      .replace(/^```json\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const data = JSON.parse(clean);
    const creditResult = await deductCredits(state.userId,"coding")
    return {
      ...state,
      aiResponse: "Code Generated Successfully",
      artifacts: [
        {
          id: Date.now(),
          type: "Project",
          files: data.files || [],
          title: state.prompt,
        },
      ],
       credits: creditResult?.credits,
    };
  }

  const res = await llm.invoke(`
    You are The ONE Coding Agent.
    The user's request is:
    ${intent}
Rules:

- Answer the user's request clearly and concisely.
- Do NOT generate project files unless the intent is CODE_GENERATION.
- Do NOT use Markdown bold syntax.
- NEVER use **text**.
- NEVER use __text__.
- Use plain text instead of bold formatting.
- Do NOT wrap the entire response in a markdown code block.
- Use simple headings without # symbols.
- Use bullet points using - when useful.
- Use numbered lists when explaining steps.
- Use inline code using backticks only when necessary.
- Use fenced code blocks only for actual source code.
- Keep the response clean and readable.
- Do not add unnecessary formatting.



    Never generate project files.
    Use Headings like:
    # Overview
    ## Explanation
    ## Problems
    ## Improvements
    ## Best Practices
    ## Optimized Code (if Needed)

    User Request:
    ${state.prompt}
    `);

  const data = res.content;
  const creditResult =await deductCredits(state.userId,"coding")
  return {
    ...state,
    aiResponse: data,
    artifacts: [],
     credits: creditResult?.credits,
  };

  }catch(error){
    console.log(error);
      return {
        ...state,
        aiResponse:error?.data?.message || "Failed to generate Response",
        artifacts: []
      }
  }

};
