// scripts/generate-index.js
import { 
  VectorStoreIndex, 
  Document, 
  storageContextFromDefaults,
  Settings 
} from "llamaindex";
import { OpenAI, OpenAIEmbedding } from "@llamaindex/openai";
import "dotenv/config";
import fs from "fs";
import path from "path";

async function generateIndex() {
  try {
    console.log("🚀 Starting Data Ingestion (String Path Fix)...");

    // 0. Settings: Explicitly use OpenAI
    Settings.llm = new OpenAI({ model: "gpt-4" });
    Settings.embedModel = new OpenAIEmbedding();

    const dataDir = "./data";
    const storageDir = "./storage";

    // 1. Check Data Directory
    if (!fs.existsSync(dataDir)) {
      console.error("❌ Error: './data' folder not found.");
      return;
    }

    // 2. Read Files Manually
    const files = fs.readdirSync(dataDir);
    const documents = [];

    console.log(`📂 Found ${files.length} files in ${dataDir}...`);

    for (const file of files) {
      if (file.endsWith(".txt")) {
        const filePath = path.join(dataDir, file);
        const content = fs.readFileSync(filePath, "utf-8");
        documents.push(new Document({ text: content, id_: file }));
        console.log(`   📄 Processed: ${file}`);
      }
    }

    if (documents.length === 0) {
      console.log("⚠️ No .txt files found.");
      return;
    }

    // 3. Storage Context
    // Initialize without default paths to avoid auto-save conflicts
    const storageContext = await storageContextFromDefaults({});

    // 4. Create Index (Generates Embeddings)
    console.log("🧠 Generating Vector Embeddings...");
    await VectorStoreIndex.fromDocuments(documents, {
      storageContext: storageContext,
    });

    // 5. Save (The Fix)
    console.log("💾 Saving Vector Store to ./storage...");
    
    // Ensure storage directory exists
    if (!fs.existsSync(storageDir)){
        fs.mkdirSync(storageDir);
    }

    // FIX: Pass the full file path string DIRECTLY. No objects.
    if (storageContext.docStore) {
        await storageContext.docStore.persist(path.join(storageDir, "doc_store.json"));
    }
    if (storageContext.vectorStore) {
        await storageContext.vectorStore.persist(path.join(storageDir, "vector_store.json"));
    }
    if (storageContext.indexStore) {
        await storageContext.indexStore.persist(path.join(storageDir, "index_store.json"));
    }
    
    // Also save graph store if present
    if (storageContext.graphStore) {
         await storageContext.graphStore.persist(path.join(storageDir, "graph_store.json"));
    }

    console.log("🎉 Success! Vector Store saved.");

  } catch (error) {
    console.error("❌ Ingestion Failed:", error);
  }
}

generateIndex();