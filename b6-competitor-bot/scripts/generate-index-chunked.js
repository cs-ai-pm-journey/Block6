import { 
  VectorStoreIndex, 
  Document, 
  storageContextFromDefaults,
  Settings,
  SentenceSplitter 
} from "llamaindex";
import { OpenAI, OpenAIEmbedding } from "@llamaindex/openai";
import "dotenv/config";
import fs from "fs";
import path from "path";

async function generateIndex() {
  try {
    console.log("🚀 Starting Data Ingestion (Nodes-as-Docs Mode)...");

    Settings.llm = new OpenAI({ model: "gpt-4" });
    Settings.embedModel = new OpenAIEmbedding();
    
    // 1. Configure Splitter
    // We set the global chunk size HUGE so the library doesn't re-split our chunks
    Settings.chunkSize = 1024; 
    
    // We use a local splitter to do the actual chopping
    const splitter = new SentenceSplitter({ chunkSize: 100, chunkOverlap: 20 });
    
    const dataDir = "./data";
    const storageDir = "./storage";

    // 2. Cleanup
    if (fs.existsSync(storageDir)) fs.rmSync(storageDir, { recursive: true, force: true });

    // 3. Read Files
    const files = fs.readdirSync(dataDir);
    const rawDocs = [];
    for (const file of files) {
      if (file.endsWith(".txt")) {
        const content = fs.readFileSync(path.join(dataDir, file), "utf-8");
        rawDocs.push(new Document({ text: content, id_: file }));
      }
    }

    // 4. MANUAL SPLIT & WRAP (The Fix)
    console.log("🪓 Manually chopping text...");
    
    // We split the text into nodes...
    const nodes = await splitter.getNodesFromDocuments(rawDocs);
    
    // ...THEN we convert those nodes back into "Mini Documents"
    // This forces the index to accept them as the primary data source.
    const miniDocs = nodes.map((node, i) => new Document({
        text: node.getText(),
        id_: `chunk_${i}_${node.id_}`, // Unique ID for every chunk
        metadata: { ...node.metadata, original_file: node.id_ }
    }));
    
    console.log(`✅ Converted ${nodes.length} nodes into ${miniDocs.length} Mini-Documents.`);

    // 5. Create Index
    console.log("🧠 Embedding Mini-Documents...");
    
    // We use storageContextFromDefaults which internally creates the stores we need
    const storageContext = await storageContextFromDefaults({
        persistDir: storageDir // Tell it up front where to save
    });

    // We use .fromDocuments() which is the most stable method
    const index = await VectorStoreIndex.fromDocuments(miniDocs, {
        storageContext: storageContext
    });

    // 6. EXPLICIT PERSIST (The Granular Fix)
    console.log("💾 Saving to ./storage...");
    
    // We manually trigger persist on each internal component
    // We assume these exist because we used fromDocuments
    await storageContext.docStore.persist(path.join(storageDir, "doc_store.json"));
    console.log("   - doc_store.json:    OK");

    await storageContext.vectorStore.persist(path.join(storageDir, "vector_store.json"));
    console.log("   - vector_store.json: OK");

    await storageContext.indexStore.persist(path.join(storageDir, "index_store.json"));
    console.log("   - index_store.json:  OK");

    console.log("🎉 Success! All systems go.");

  } catch (error) {
    console.error("❌ Failed:", error);
  }
}

generateIndex();