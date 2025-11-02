// Import required packages
import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const apiKey = process.env.GEMINI_API_KEY;
const mongoUri = process.env.MONGO_URI;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!apiKey || !mongoUri || !adminPassword) {
  console.error("❌ Missing .env values — check GEMINI_API_KEY, MONGO_URI, ADMIN_PASSWORD");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

// ✅ Allow your live frontend & local development
const allowedOrigins = [
  "https://frontend-seven-omega-51.vercel.app", // your Vercel site
  "https://pratik-xi.vercel.app", // optional second frontend
  "http://localhost:5500", // for local testing
  "http://127.0.0.1:5500",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error("Not allowed by CORS"));
  }
}));

app.use(express.json());

// ✅ MongoDB setup
mongoose.connect(mongoUri)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// ✅ Message model
const Message = mongoose.model("Message", new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
}));

// ✅ AI endpoint
app.post("/api/ai", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); // fixed model name
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ text });
  } catch (err) {
    console.error("AI API Error:", err);
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

// ✅ Contact form endpoint
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ error: "Please fill all required fields" });

    await new Message({ name, email, phone, message }).save();
    res.status(201).json({ success: true, message: "Message saved!" });
  } catch (err) {
    console.error("Contact Form Error:", err);
    res.status(500).json({ error: "Failed to save message" });
  }
});

// ✅ Admin messages
app.post("/api/messages", async (req, res) => {
  const { password } = req.body;
  if (password !== adminPassword)
    return res.status(401).json({ error: "Unauthorized" });

  const messages = await Message.find().sort({ createdAt: -1 });
  res.json(messages);
});

// ✅ Browser test page (for you)
app.get("/", (req, res) => {
  res.send(`
    <html>
      <body style="font-family: sans-serif;">
        <h2>Gemini AI Test</h2>
        <input id="prompt" style="width:300px" placeholder="Enter prompt..." />
        <button onclick="send()">Ask</button>
        <pre id="output"></pre>
        <script>
          async function send() {
            const res = await fetch('/api/ai', {
              method: 'POST',
              headers: {'Content-Type':'application/json'},
              body: JSON.stringify({ prompt: document.getElementById('prompt').value })
            });
            const data = await res.json();
            document.getElementById('output').innerText = data.text || data.error;
          }
        </script>
      </body>
    </html>
  `);
});

// ✅ Start server
app.listen(port, "0.0.0.0", () => console.log(`✅ Server running on http://localhost:${port}`));
