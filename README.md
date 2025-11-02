# Backend for My MERN Website

This is the backend API built with **Node.js, Express, MongoDB, and Gemini AI**.

## 🚀 Live Server
Backend hosted on Render: [https://pratik-1.onrender.com](https://pratik-1.onrender.com)

## 📦 Tech Stack
- Node.js + Express
- MongoDB Atlas (Database)
- Google Gemini API (AI Integration)
- Hosted on Render (Free Tier)

## 🧰 API Endpoints
| Method | Endpoint | Description |
|--------|-----------|--------------|
| POST | `/api/contact` | Save contact form data |
| POST | `/api/messages` | Fetch all messages (Admin only) |
| POST | `/api/ai` | Ask AI question (Gemini API) |

## 🗝 Environment Variables
| Key | Description |
|-----|--------------|
| `MONGO_URI` | MongoDB connection URI |
| `GEMINI_API_KEY` | Google Gemini API Key |
| `ADMIN_PASSWORD` | Password for admin route |
| `PORT` | Port number (default 5000) |

---

### ⚠️ Important
> Do **not** upload your `.env` file or secrets to GitHub.  
Render environment variables handle them safely.
