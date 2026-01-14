import express from "express";
import cors from "cors";
import "dotenv/config";
import { 
  VectorStoreIndex, 
  storageContextFromDefaults,
  Settings 
} from "llamaindex";
import { OpenAI, OpenAIEmbedding } from "@llamaindex/openai";
import path from "path";
import fs from "fs";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let queryEngine;

async function initializeBrain() {
  try {
    console.log("🧠 Initializing Brain (Standard Mode)...");

    // 1. Setup OpenAI
    Settings.llm = new OpenAI({ model: "gpt-4" });
    Settings.embedModel = new OpenAIEmbedding();

    const storageDir = path.resolve("./storage");
    
    // 2. Pulse Check
    if (!fs.existsSync(storageDir)) {
        throw new Error("Storage folder missing!");
    }

    // 3. Load Brain Automatically
    // We let the library match up the IDs itself
    const storageContext = await storageContextFromDefaults({
      persistDir: storageDir,
    });

    const index = await VectorStoreIndex.init({
      storageContext: storageContext,
    });

    // 4. Create Query Engine
    queryEngine = index.asQueryEngine({
        similarityTopK: 10, // Check top 10 chunks
    });

    console.log("✅ Competitor Intelligence Online. Brain is loaded.");

  } catch (error) {
    console.error("❌ FATAL: Failed to load brain.");
    console.error(error);
    process.exit(1);
  }
}

app.post("/api/ask-competitor", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) return res.status(400).json({ error: "Question required." });
    if (!queryEngine) return res.status(503).json({ error: "Brain loading..." });

    console.log(`\n📨 Query: "${question}"`);

    const response = await queryEngine.query({ query: question });

    // Extract sources
    const sources = response.sourceNodes?.map(node => ({
        file: node.node.metadata?.original_file || "Unknown File",
        text: (node.node.text || "").substring(0, 150) + "..."
    })) || [];

    console.log(`✅ Found ${sources.length} sources.`);

    res.json({
      answer: response.toString(),
      sources: sources
    });

  } catch (error) {
    console.error("Query Error:", error);
    res.status(500).json({ error: "Internal AI Error", details: error.message });
  }
});

app.listen(PORT, async () => {
  await initializeBrain();
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});