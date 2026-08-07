import dotenv from "dotenv";
import app from "@/app";

// Load environment variables FIRST before anything else
dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});