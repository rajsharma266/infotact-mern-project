import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import dbConnect from "./config/db";

const PORT = process.env.PORT || 4000;

dbConnect();

app.listen(PORT, () => {
  console.log(`Server is successfully running on port ${PORT}`);
});