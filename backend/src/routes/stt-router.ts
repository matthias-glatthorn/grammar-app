import { Router } from "express";
import multer from "multer";
import { STTService } from "../services/stt/stt.service";

export const createSTTRouter = (sttService: STTService) => {
    const router = Router();
    const upload = multer();

    router.post("/transcribe", upload.single("audio"), async (req, res) => {
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: "No audio file provided" });
        }

        try {
            const result = await sttService.transcribe(file);
            res.json({ text: result });
        } catch (err) {
            console.error("Grammar processing failed:", err);

            res.status(500).json({
                error: "Internal server error"
            });
        }
    });

    return router;
};