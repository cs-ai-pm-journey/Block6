Market Intelligence Agent (Hybrid RAG + ReAct)
An autonomous AI agent designed to perform real-time competitive analysis. Unlike standard chatbots that rely on frozen training data, this system uses a Hybrid RAG (Retrieval-Augmented Generation) architecture. It intelligently routes queries between a private vector database (internal proprietary documents) and a real-time web search engine (live market data) to synthesize comprehensive strategic reports.

🚀 The Problem
LLMs (like ChatGPT) suffer from Data Staleness and Hallucination when analyzing specific business competitors.

They don't know today's pricing changes.

They cannot compare a private internal PDF against a competitor's live landing page.

They struggle to format unstructured research into decision-ready tables.

💡 The Solution
This Agent solves the "Staleness" problem by acting as a Research Orchestrator:

Internal Grounding: First checks internal knowledge base (PDFs/Docs) for proprietary data.

Live Tool Use: Autonomously decides to use the Tavily Search API if the user asks about external competitors (e.g., "Compare us to Stripe Atlas").

Comparative Logic: Normalizes data from both sources into structured Markdown tables.

🛠️ Technical Architecture
Cognitive Architecture (The Brain)
Framework: LlamaIndex (TypeScript/Node.js)

Logic: ReAct (Reasoning + Acting) Agent Loop.

LLM: GPT-4 Turbo.

Vector Store: Local VectorStoreIndex (Embeddings).

The Stack
Backend: Node.js, Express (Custom Non-blocking Architecture).

Frontend: React, Vite (Single Page Application).

Live Data: Tavily Search API.

Styling: Custom CSS with Responsive Data Grids.

✨ Key Features
1. Hybrid Information Retrieval
The agent automatically determines the source of truth:

User: "What is the LegalZoom Satisfaction Guarantee?"

Agent: [Retrieves from legalzoom.txt] (Internal)

User: "How much does Stripe Atlas cost?"

Agent: [Triggers web_search tool] (External)

2. Autonomous Comparative Analysis
When asked to compare entities, the agent performs multi-hop reasoning:

Fetches Side A data (Internal).

Fetches Side B data (Web).

Synthesizes a Comparison Table.

3. Qualitative Sentiment Analysis
Beyond hard data, the agent can scrape review aggregators (Trustpilot, Reddit) to summarize current user sentiment and qualitative strengths/weaknesses.

📦 Installation & Setup
Prerequisites
* Node.js v18+
* OpenAI API Key
* Tavily API Key

1. Clone the Repository
```bash
git clone [https://github.com/cs-ai-pm-journey/Block6.git](https://github.com/cs-ai-pm-journey/Block6.git)
cd Block6/b6-competitor-bot

2. Install Dependencies
Bash

npm install
3. Environment Config
Create a .env file in the root:

Code snippet

OPENAI_API_KEY=sk-...
TAVILY_API_KEY=tvly-...
PORT=3001
4. Build the Brain (Ingestion)
If you have new internal documents, place them in /data and run:

Bash

npm run ingest
(This generates the local vector index in /storage)

5. Run the System
Bash

npm start
Backend runs on http://localhost:3001

Frontend is served statically from the backend.

📸 Screenshots