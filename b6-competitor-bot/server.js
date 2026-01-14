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

// Setup paths for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
// Serve the React frontend
app.use(express.static(path.join(__dirname, "public")));

let agent; 

// ---------------------------------------------------------
// 1. Define the Web Search Tool (Tavily)
// ---------------------------------------------------------
const searchTool = FunctionTool.from(
  async ({ query }) => {
    console.log(`🌎 Performing Web Search for: "${query}"`);
    try {
        const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
        const result = await tvly.search(query, {
          search_depth: "basic",
          max_results: 3,
        });
        
        // Format the results for the Agent to read
        return result.results.map(r => 
            `Source: ${r.url}\nTitle: ${r.title}\nContent: ${r.content}`
        ).join("\n---\n");

    } catch (e) {
        console.error("Search failed", e);
        return "The web search failed. Please try again or rely on internal knowledge.";
    }
  },
  {
    name: "web_search",
    description: "Useful for finding information about competitors (like ZenBusiness, Stripe Atlas), market trends, or facts NOT found in the LegalZoom internal documents.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query to send to the web.",
        },
      },
      required: ["query"],
    },
  }
);

// ---------------------------------------------------------
// 2. Initialize the Brain
// ---------------------------------------------------------
async function initializeBrain() {
  try {
    console.log("🧠 Initializing Agent (Hybrid Mode)...");

    Settings.llm = new OpenAI({ model: "gpt-4-turbo" });
    Settings.embedModel = new OpenAIEmbedding();

    const storageDir = path.resolve("./storage");
    
    if (!fs.existsSync(storageDir)) {
        throw new Error("Storage folder missing! Run ingestion script first.");
    }

    // Load Local Vector Store
    const storageContext = await storageContextFromDefaults({
      persistDir: storageDir,
    });
    const index = await VectorStoreIndex.init({
      storageContext: storageContext,
    });

    // Wrap Vector Index as a Tool
    const vectorTool = new QueryEngineTool({
      queryEngine: index.asQueryEngine({ 
          similarityTopK: 10 // Deep search in local files
      }),
      metadata: {
        name: "legalzoom_internal_knowledge",
        description: "ALWAYS use this tool FIRST. Contains official LegalZoom pricing, guarantee details, and API documentation.",
      },
    });

    // Create the ReAct Agent (The Manager)
    agent = new ReActAgent({
      tools: [vectorTool, searchTool],
      verbose: true, 
      systemPrompt: "You are a Competitor Intelligence Analyst. Your goal is to provide accurate answers by prioritizing internal documents. Always check 'legalzoom_internal_knowledge' first. If the info is missing, use 'web_search'. When answering, explicitly mention which sources you used."
    });

    console.log("✅ Agent Online. Capabilities: [Local Vectors] + [Web Search]");

  } catch (error) {
    console.error("❌ FATAL: Failed to load brain.");
    console.error(error);
    process.exit(1);
  }
}

// ---------------------------------------------------------
// 3. API Route
// ---------------------------------------------------------
app.post("/api/ask-competitor", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "Question required." });
    if (!agent) return res.status(503).json({ error: "Brain loading..." });

    console.log(`\n📨 Agent Task: "${question}"`);

    // The Agent autonomously decides which tool to use
    const response = await agent.chat({ message: question });

    // Source Extraction Logic (Simplified for UI)
    let sources = [];
    
    // 1. Check for Vector sources (Local files)
    if (response.sourceNodes && response.sourceNodes.length > 0) {
        sources = response.sourceNodes.map(node => ({
            file: node.node.metadata?.original_file || "Internal Doc",
            text: (node.node.text || "").substring(0, 150) + "..."
        }));
    } 
    
    // 2. If no vector sources, it likely used the Web.
    if (sources.length === 0) {
        sources.push({
            file: "Live Web Intelligence",
            text: "This information was retrieved via real-time Tavily search."
        });
    }

    res.json({
      answer: response.response.toString(),
      sources: sources
    });

  } catch (error) {
    console.error("Agent Error:", error);
    res.status(500).json({ error: "Agent Failed", details: error.message });
  }
});

// Catch-all for React Frontend
// We use a Regex /.*/ to match everything, bypassing the string parser bug
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, async () => {
  await initializeBrain();
  console.log(`🚀 Server running on port ${PORT}`);
});