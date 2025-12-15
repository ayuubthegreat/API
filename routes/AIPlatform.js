import OpenAI from "openai";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.warn("WARNING: OPENAI_API_KEY environment variable is not set");
}

const client = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export { client };