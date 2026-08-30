require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const Conversation = require("./models/Conversation.js");
const connectDB = require("./config/db.js");
const app = require("./app");

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);

io.engine.use(cookieParser());

io.use((socket, next) => {
  const token = socket.request.cookies?.token;

  if (!token) {
    return next(new Error("Unauthorized"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    socket.user = decoded;
    return next();
  } catch (error) {
    return next(new Error("Invalid or expired token"));
  }
});

io.on("connection", (socket) => {
  console.log("Socket Connected: ", socket.id, "User: ", socket.user.id);

  socket.on(
    "join-conversation",
    async (conversationId, callback = () => {}) => {
      try {
        if (!mongoose.isValidObjectId(conversationId)) {
          return callback({
            success: false,
            message: "Invalid conversation Id",
          });
        }

        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: socket.user.id,
        });

        if (!conversation) {
          return callback({
            success: false,
            message: "You are not allowed to join this conversation",
          });
        }

        socket.join(conversationId);

        console.log(
          `User ${socket.user.id} joined conversation ${conversationId}`,
        );

        return callback({
          success: true,
          message: "Joined conversation successfully",
        });
      } catch (error) {
        return callback({
          success: false,
          message: "Unable to join conversation",
        });
      }
    },
  );

  socket.on("disconnect", () => {
    console.log("Socket Disconnected: ", socket.id, "User:", socket.user.id);
  });
});

const StartServer = async () => {
  try {
    await connectDB();

    httpServer.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start the server: ", error);
  }
};

StartServer();
