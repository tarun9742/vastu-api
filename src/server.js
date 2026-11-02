import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./lib/dbConnect.js";

const PORT = Number(process.env.PORT) || 3001;

async function startServer() {
  try {
    console.log("Connecting to MongoDB...");
    await connectDB();
    console.log("Connected to MongoDB successfully.");

    app.listen(PORT, () => {
      console.log(`Vastu API server running at http://localhost:${PORT}`);
      console.log(`Health endpoint: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
