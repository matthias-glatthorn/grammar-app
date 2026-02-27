import { STTService } from "./stt.service";

export class StubSTTService implements STTService {
    async transcribe(audioFile: Express.Multer.File): Promise<string> {
        console.log("StubSTTService received request:", {
            size: audioFile.size,
            mimeType: audioFile.mimetype,
        });

        // Fake processing
        await new Promise(r => setTimeout(r, 1000));
        return "(Stub) the transcribed text would be here";
    }

}