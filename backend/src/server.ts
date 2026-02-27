import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { StubGrammarCorrectionService } from "./services/grammar-correction/stub-grammar-correction.service";
import { createGrammarRouter } from "./routes/grammar-correction.router";
import { createSTTRouter } from "./routes/stt-router";
import { StubSTTService } from "./services/stt/stub-stt.service";

dotenv.config();
dotenv.config({ path: ".env.local" });
const app = express();

const corsOrigin = process.env.CORS_ORIGIN;

if (!corsOrigin) {
  throw new Error("CORS_ORIGIN is not defined");
}

app.use(cors({
  origin: corsOrigin
}));
app.use(express.json());


const grammarService = new StubGrammarCorrectionService();
app.use("/grammar", createGrammarRouter(grammarService));

const sttService = new StubSTTService();
app.use("/stt", createSTTRouter(sttService));

app.listen(3000, () => {
  console.log("Server running on port 3000");
});