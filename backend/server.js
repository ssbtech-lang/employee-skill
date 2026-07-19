const dns=require('node:dns');
dns.setServers(['1.1.1.1','8.8.8.8']);

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const resumeRoutes = require("./routes/resumeRoutes");
dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// app.get("/", (req, res) => {
//   res.send(
//     "Employee Skill Discovery Backend is running"
//   );
// });

app.get("/", (req, res) => {
  res.send(
    "Employee Skill Discovery Backend is running"
  );
});

app.use(
  "/api/search",
  require("./routes/searchRoutes")
);

app.use(
  "/api/auth",
  require("./routes/authRoutes")
);

app.use(
  "/api/profile",
  require("./routes/profileRoutes")
);

app.use(
  "/api/skills",
  require("./routes/skillRoutes")
);

//neww---
app.use("/api/resume", resumeRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});