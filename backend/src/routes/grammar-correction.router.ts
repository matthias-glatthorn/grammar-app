import { Router } from "express";
import { GrammarCorrectionService } from "../services/grammar-correction/grammar-correction.service";

export const createGrammarRouter = ( grammarService: GrammarCorrectionService) => {
    const router = Router();

    router.post("/check", async (req, res) => {
      const { text } = req.body ?? {};

      if (typeof text !== "string" || text.trim().length === 0) {
        return res.status(400).json({
          message: "Text must not be empty"
        });
      }

        try {
            const result = await grammarService.correct(req.body);
            res.json(result);
        } catch (err) {
            console.error("Grammar processing failed:", err);

            res.status(500).json({
                error: "Internal server error"
            });
        }
    });

  return router;
}