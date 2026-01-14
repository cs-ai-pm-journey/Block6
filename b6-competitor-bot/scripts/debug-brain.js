import { 
  SimpleDocumentStore, 
  SimpleVectorStore,
  SimpleIndexStore,
  Settings 
} from "llamaindex";
import { OpenAI, OpenAIEmbedding } from "@llamaindex/openai";
import "dotenv/config";
import path from "path";
import fs from "fs";

async function runDiagnostics() {
  try {
    console.log("🩺 Starting Brain Scan (Fixed Mode)...");

    // 0. CONFIGURE SETTINGS (The Missing Piece)
    Settings.llm = new OpenAI({ model: "gpt-4" });
    Settings.embedModel = new OpenAIEmbedding();

    const storageDir = path.resolve("./storage");

    // 1. Check File Existence
    const requiredFiles = ["doc_store.json", "vector_store.json", "index_store.json"];
    const existingFiles = fs.readdirSync(storageDir);
    
    console.log(`\n📂 Files in storage: ${existingFiles.join(", ")}`);
    const missing = requiredFiles.filter(f => !existingFiles.includes(f));
    
    if (missing.length > 0) {
        console.error(`❌ CRITICAL FAILURE: Missing files: ${missing.join(", ")}`);
        return;
    }

    // 2. Load and Count Internals
    console.log("\n📊 Analyzing Data Structures...");
    
    // Load Doc Store
    const docStore = await SimpleDocumentStore.fromPersistDir(storageDir);
    const docs = await docStore.getAllRefDocInfo(); 
    const docCount = docs ? Object.keys(docs).length : 0;
    console.log(`   📄 Document Store: Found ${docCount} documents.`);

    // Load Vector Store (Now with Settings configured!)
    const vectorStore = await SimpleVectorStore.fromPersistDir(storageDir);
    const embeddingCount = vectorStore.data ? Object.keys(vectorStore.data.embeddingDict || {}).length : 0;
    console.log(`   🧠 Vector Store:   Found ${embeddingCount} embeddings.`);

    // Load Index Store
    const indexStore = await SimpleIndexStore.fromPersistDir(storageDir);
    const indices = await indexStore.getIndexStructs();
    console.log(`   🗂️  Index Store:    Found ${indices.length} indices.`);

    // 3. Diagnosis
    if (docCount === 0 || embeddingCount === 0) {
        console.log("\n❌ DIAGNOSIS: The Brain is EMPTY. Re-run ingestion.");
    } else {
        console.log("\n✅ DIAGNOSIS: The Brain is HEALTHY.");
    }

  } catch (e) {
    console.error("Diagnostic Error:", e);
  }
}

runDiagnostics();