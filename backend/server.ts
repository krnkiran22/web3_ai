import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";
import { Agent } from "alith";

const app = express();
const port = 8000;

// CORS
app.use(cors());
app.use(express.json());

// Alith agent initialization
const agent = new Agent({
  model: "llama3-70b-8192",
  apiKey: "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", // Replace with your actual API key
  baseUrl: "https://api.groq.com/openai/v1",
  preamble: "You are a helpful AI assistant. Be friendly and provide concise answers.",
});

// Start chat endpoint
app.get("/start_chat", (req, res) => {
  const clientId = uuidv4();
  res.json({ client_id: clientId });
});

app.post("/prompt", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt in request body" });
  }
  try {
    const response = await agent.prompt(prompt);
    res.json({ response });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

// Start HTTP server
const server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// WebSocket server
const wss = new WebSocketServer({ server, path: "/ws" });

interface Client {
  id: string;
  ws: any;
}

const clients: Record<string, Client> = {};

wss.on("connection", (ws, req) => {
  // Get client_id from query string
  const url = new URL(req.url || "", `http://${req.headers.host}`);
  const clientId = url.searchParams.get("client_id") || uuidv4();
  clients[clientId] = { id: clientId, ws };

  ws.on("message", async (message: Buffer) => {
    try {
      const prompt = message.toString();
      const response = await agent.prompt(prompt);
      ws.send(response);
    } catch (err) {
      ws.send("Error: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  });

  ws.on("close", () => {
    delete clients[clientId];
  });
});