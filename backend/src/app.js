const express = require("express");
const cors = require("cors");
const cookieparser = require("cookie-parser");
const authRoutes = require("./routes/auth.routes");
const conversationRoutes = require("./routes/conversation.route");
const messageRoutes = require("./routes/message.route");
const path = require("path");

const app = express();

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieparser());
app.use(express.urlencoded());
app.use("/api/auth", authRoutes);
app.use("/api/conversation", conversationRoutes);
app.use("/api/messages", messageRoutes);


app.get("/", (req, res) => {
  res.json({
    message: "Real-time messaging app",
  });
});

module.exports = app;
