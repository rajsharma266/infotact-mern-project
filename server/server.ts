import express from "express";
import dotenv from "dotenv";
const app = express();
const PORT = process.env.PORT || 4000;
dotenv.config();



app.get("/", (req, res) => {
  res.send("Backend Running");
});

app.listen(PORT, () => {
  console.log(`Server is successfully running on port ${PORT}`);
});

const dbConnect=require('../server/config/db')
  dbConnect();
