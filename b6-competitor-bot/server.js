import express from "express";
import cors from "cors";
import "dotenv/config";
import { 
  VectorStoreIndex, 
  storageContextFromDefaults,
  Settings,
  ReActAgent, 
  QueryEngineTool,
  FunctionTool 
} from "llamaindex";
import { OpenAI, OpenAIEmbedding } from "@llamaindex/openai";
import { tavily } from "@tavily/core"; 
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

// 1. Setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 2. Serve Frontend
app.use(express.static(path.join(__dirname, "public")));

// 3. Define Web Search Tool
const searchTool = FunctionTool.from(
  async ({ query }) => {
    if (!query || query === "undefined") return "Error: Query missing.";
    try {
        const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
        const result = await tvly.search(query, { search_depth: "basic", max_results: 3 });
        return result.results.map(r => `Source: ${r.url}\nContent: ${r.content}`).join("\n---\n");
    } catch (e) {
        return "Search failed.";
    }
  },
  {
    name: "web_search",
    description: "Finds competitor info on the web.",
    parameters: {
      type: "object",
      properties: { query: { type: "string" } },
      required: ["query"],
    },
  }
);

// 4. Initialize Brain
let agent; 

async function initializeBrain() {
  try {
    console.log("🧠 Initializing AI...");
    Settings.llm = new OpenAI({ model: "gpt-4-turbo" });
    Settings.embedModel = new OpenAIEmbedding();

    const storageDir = path.resolve("./storage");
    let tools = [searchTool];

    if (fs.existsSync(storageDir)) {
        const storageContext = await storageContextFromDefaults({ persistDir: storageDir });
        const index = await VectorStoreIndex.init({ storageContext });
        
        const vectorTool = new QueryEngineTool({
            queryEngine: index.asQueryEngine({ similarityTopK: 10 }),
            metadata: { name: "legalzoom_internal_knowledge", description: "Internal LegalZoom docs." }
        });
        tools.push(vectorTool);
    } 

    agent = new ReActAgent({
        tools: tools,
        verbose: true,
        // UPDATED: Stricter instructions to prevent "Lazy Agent" behavior
        systemPrompt: `You are an elite Competitor Intelligence Analyst.
        
        CORE RESPONSIBILITIES:
        1. INTERNAL KNOWLEDGE: Always check 'legalzoom_internal_knowledge' for LegalZoom data.
        2. EXTERNAL RESEARCH: If the user asks about a competitor (e.g., ZenBusiness, Bizee, Stripe) that is NOT in your internal files, you **MUST** use the 'web_search' tool to find their current pricing/features.
        3. COMPLETENESS CHECK: Do not answer until you have data for ALL companies mentioned in the prompt.
           - Bad: "LegalZoom is $249." (Partial info)
           - Good: "LegalZoom is $249, but ZenBusiness starts at $0, making ZenBusiness cheaper."
        4. FORMAT: Use Markdown tables for comparisons.`
    });
    console.log("✅ AI Online.");

  } catch (error) {
    console.error("❌ AI Load Failed:", error);
  }
}

// 5. API Route
app.post("/api/ask-competitor", async (req, res) => {
  if (!agent) return res.status(503).json({ error: "AI loading..." });
  try {
    const response = await agent.chat({ message: req.body.question });
    
    let sources = response.sourceNodes?.map(node => ({
        file: node.node.metadata?.original_file || "Internal Doc",
        text: (node.node.text || "").substring(0, 150) + "..."
    })) || [];
    
    if (sources.length === 0) sources.push({ file: "Web Search", text: "Live Data" });

    res.json({ answer: response.response.toString(), sources });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Start Server (With Error Handling)
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  initializeBrain();
});

server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      console.error(`❌ FATAL: Port ${PORT} occupied. Run 'killall node' again.`);
    }
});