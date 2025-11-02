// Import required packages
import express from 'express';
import { GoogleGenerativeAI } from "@google/generative-ai";

import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 5000;

// --- Configuration ---
const apiKey = process.env.GEMINI_API_KEY;
const mongoUri = process.env.MONGO_URI;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!apiKey) {
  console.error('ERROR: GEMINI_API_KEY is not set.');
  process.exit(1);
}
if (!mongoUri) {
  console.error('ERROR: MONGO_URI is not set in your .env file.');
  process.exit(1);
}
if (!adminPassword) {
  console.error('ERROR: ADMIN_PASSWORD is not set in your .env file.');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

// 2. Configure CORS
const allowedOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'https://pratik-xi.vercel.app' // ✅ your live frontend URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('❌ Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  }
}));


// 3. Use Express's JSON parser
app.use(express.json());

// --- 4. Connect to MongoDB ---
mongoose.connect(mongoUri)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- 5. Define MongoDB Model ---
const messageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// --- API Endpoints ---
app.post('/api/ai', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    res.json({ text: text });
  } catch (error) {
    console.error('AI API Error:', error);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Please fill all required fields' });
    }
    const newMessage = new Message({ name, email, phone, message });
    await newMessage.save();
    res.status(201).json({ success: true, message: 'Message saved!' });
  } catch (error) {
    console.error('Contact Form Error:', error);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const { password } = req.body;
    if (password !== adminPassword) {
      return res.status(401).json({ error: 'Unauthorized: Wrong password' });
    }
    const messages = await Message.find({}).sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error('Admin Fetch Error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});