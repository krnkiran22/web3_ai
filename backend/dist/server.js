"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const ws_1 = require("ws");
const uuid_1 = require("uuid");
const alith_1 = require("alith");
const app = (0, express_1.default)();
const port = 8000;
// CORS
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Alith agent initialization
const agent = new alith_1.Agent({
    model: "llama3-70b-8192",
    apiKey: "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", // Replace with your actual API key
    baseUrl: "https://api.groq.com/openai/v1",
    preamble: "You are a helpful AI assistant. Be friendly and provide concise answers.",
});
// Start chat endpoint
app.get("/start_chat", (req, res) => {
    const clientId = (0, uuid_1.v4)();
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
    }
    catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
});
// Start HTTP server
const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
// WebSocket server
const wss = new ws_1.WebSocketServer({ server, path: "/ws" });
const clients = {};
wss.on("connection", (ws, req) => {
    // Get client_id from query string
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const clientId = url.searchParams.get("client_id") || (0, uuid_1.v4)();
    clients[clientId] = { id: clientId, ws };
    ws.on("message", async (message) => {
        try {
            const prompt = message.toString();
            const response = await agent.prompt(prompt);
            ws.send(response);
        }
        catch (err) {
            ws.send("Error: " + (err instanceof Error ? err.message : "Unknown error"));
        }
    });
    ws.on("close", () => {
        delete clients[clientId];
    });
});
