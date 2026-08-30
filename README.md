# 💬 Real-Time MERN Chat Application

A modern, full-stack, real-time messaging application built with the **MERN Stack** (MongoDB, Express.js, React, Node.js) and **Socket.IO**. Designed with a clean, WhatsApp-inspired dark interface, cookie-based JWT authentication, instant 1-on-1 messaging, and profile customization.

---

## ✨ Features

- **🔐 Authentication & Security**:
  - Secure user registration and login with `bcrypt` password hashing.
  - HTTP-Only Cookie-based JWT authentication with handshake verification in Socket.IO.
  - Automatic session restoration on reload (`/api/auth/me`).
  - Protected routes on the client side.

- **⚡ Real-Time Messaging**:
  - Instant 1-on-1 messaging powered by **Socket.IO**.
  - Room-based architecture for isolated conversation streams.
  - Live message delivery without manual page refreshing.
  - Auto-scrolling to the latest message.

- **👥 User Discovery & Chat History**:
  - Browse registered users with live search filtering.
  - Persistent chat history stored in MongoDB.
  - Timestamped message bubbles with distinct styles for sender and recipient.

- **📸 Profile Picture Uploads**:
  - Custom avatar upload supported via `Multer`.
  - Image size and MIME-type validation.
  - Dynamic fallback to user initials if no photo is set.

- **📱 Clean & Responsive UI**:
  - Sleek dark theme with neutral tones and teal accents (`#00a884`).
  - Built with modern Vanilla CSS (custom properties, flexbox, CSS grid).
  - Fully responsive layout with mobile drawer toggle (<768px).

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React (Vite)
- **Routing**: React Router DOM (v7)
- **HTTP Client**: Axios (configured with credentials)
- **Real-Time Client**: Socket.IO Client
- **Icons**: Lucide React
- **Styling**: Vanilla CSS (Custom Design System, Dark Mode)

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Token (JWT) & `cookie-parser`
- **Real-Time Server**: Socket.IO
- **File Storage**: Multer (Disk Storage)
- **Security**: CORS, Bcrypt

---

## 📁 Project Structure

```
Chat_Application/
├── backend/
│   ├── public/
│   │   ├── default/               # Default profile assets
│   │   └── uploads/               # Uploaded user avatars
│   ├── src/
│   │   ├── config/                # Database connection
│   │   ├── controllers/           # Auth, Conversation, Message controllers
│   │   ├── middlewares/           # JWT auth & Multer upload middleware
│   │   ├── models/                # User, Conversation, Message Mongoose models
│   │   ├── routes/                # Express API routes
│   │   ├── app.js                 # Express application & middleware configuration
│   │   └── server.js              # HTTP server & Socket.IO event handlers
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/                    # Static assets & favicons
│   ├── src/
│   │   ├── api/                   # Axios API instance
│   │   ├── components/            # Sidebar, ChatWindow, MessageBubble, UserAvatar, etc.
│   │   ├── context/               # AuthContext for global user state
│   │   ├── hooks/                 # useSocket custom hook
│   │   ├── pages/                 # Login, Register, Chat pages
│   │   ├── App.css                # Global design system & theme variables
│   │   ├── App.jsx                # Router & Protected route guards
│   │   └── main.jsx               # Application entry point
│   ├── index.html
│   └── package.json
│
└── README.md
```

---

## 🔌 API Endpoints Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user (`name`, `email`, `password`) | No |
| `POST` | `/api/auth/login` | Login user & set HTTP-only cookie | No |
| `POST` | `/api/auth/logout` | Clear auth cookie | Yes |
| `GET` | `/api/auth/me` | Get current authenticated user profile | Yes |
| `GET` | `/api/auth/users` | List all other registered users | Yes |
| `PATCH` | `/api/auth/profile-picture`| Upload new profile picture (`FormData`) | Yes |

### Conversations (`/api/conversation`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/conversation/with/:userId` | Get or create conversation with a user | Yes |

### Messages (`/api/messages`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/messages/` | Send a new message (`conversationId`, `text`) | Yes |
| `GET` | `/api/messages/:conversationId` | Get all messages for a conversation | Yes |

---

## ⚡ Socket.IO Events

| Event Name | Direction | Payload / Parameters | Description |
|---|---|---|---|
| `join-conversation` | Client ➔ Server | `conversationId, callback` | Joins the socket room for the active conversation |
| `send-message` | Client ➔ Server | `{ conversationId, text }, callback` | Creates and broadcasts a message to the room |
| `new-message` | Server ➔ Client | `message` (populated object) | Received by all clients in the conversation room |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) running locally or a MongoDB Atlas URI

---

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend/` root:
   ```env
   PORT=5000
   MONGO_URL=mongodb://127.0.0.1:27017/realTimeChat
   JWT_SECRET=your_jwt_secret_key_here
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend server will run on `http://localhost:5000`.

---

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`.

---

## 🧪 Testing the Application

1. Open `http://localhost:5173` in a standard browser tab.
2. Click **Create one** and register a user (e.g., *Alice*).
3. Open an **Incognito** or secondary browser tab at `http://localhost:5173` and register a second user (e.g., *Bob*).
4. Select *Bob* from *Alice*'s sidebar list and start typing to test instant real-time delivery and profile picture updates!

---

## 📄 License

This project is open source and available under the [ISC License](LICENSE).
