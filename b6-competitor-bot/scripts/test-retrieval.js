import { 
  VectorStoreIndex, 
  Settings,
  SimpleDocumentStore,
  SimpleVectorStore,
  SimpleIndexStore,
} from "llamaindex";
import { OpenAI, OpenAIEmbedding } from "@llamaindex/openai";
import "dotenv/config";
import path from "path";
import fs from "fs";

async function testRetrieval() {
  try {
    console.log("🔎 Starting Retrieval Diagnostic...");

    // 1. Force OpenAI Settings
    Settings.llm = new OpenAI({ model: "gpt-4" });
    Settings.embedModel = new OpenAIEmbedding();

    const storageDir = path.resolve("./storage");
    const docPath = path.join(storageDir, "doc_store.json");
    const vectorPath = path.join(storageDir, "vector_store.json");
    const indexPath = path.join(storageDir, "index_store.json");

    // 2. Pulse Check
    if (!fs.existsSync(vectorPath)) {
        console.error("❌ Critical: vector_store.json missing!");
        return;
    }

    // 3. Load Stores Manually
    console.log("📂 Loading Memory...");
    const docStore = await SimpleDocumentStore.fromPersistPath(docPath);
    const vectorStore = await SimpleVectorStore.fromPersistPath(vectorPath);
    const indexStore = await SimpleIndexStore.fromPersistPath(indexPath);

    // 4. Validate Vector Count
    // We check the internal data to ensure we actually have the 12 chunks
    const embeddingCount = vectorStore.data ? Object.keys(vectorStore.data.embeddingDict || {}).length : 0;
    console.log(`📊 Brain contains ${embeddingCount} embeddings (Expect ~12).`);

    if (embeddingCount === 0) {
        console.error("❌ STOP: The Vector Store is empty. Re-run generate-index-chunked.js");
        return;
    }

    // 5. Reconstruct Index
    const indices = await indexStore.getIndexStructs();
    const index = await VectorStoreIndex.init({
      docStore, 
      vectorStore, 
      indexStore, 
      indexStruct: indices[0] 
    });

    // 6. Run the Search
    const query = "How much does the LegalZoom LLC Pro package cost?";
    console.log(`\n❓ Asking: "${query}"`);
    
    const retriever = index.asRetriever({ similarityTopK: 3 });
    const nodes = await retriever.retrieve({ query: query });
    
    console.log(`🔍 Retriever found ${nodes.length} matches.\n`);

    if (nodes.length === 0) {
        console.log("❌ FAILURE: No matches found. Embedding mismatch suspected.");
    } else {
        nodes.forEach((node, i) => {
            console.log(`--- Match ${i+1} (Score: ${node.score.toFixed(3)}) ---`);
            console.log(node.node.text);
            console.log("------------------------------------------------\n");
        });
        console.log("✅ SUCCESS: The brain works. The issue is in the Server code.");
    }

  } catch (e) {
    console.error("Diagnostic Failed:", e);
  }
}

testRetrieval();