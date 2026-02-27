import { transcribe } from "../api/speech-to-text-api-client";
import type { SpeechToTextService } from "./speech-to-text.service";

export class BackendSpeechToTextService implements SpeechToTextService {
    start() {
        return;
    }

    async stop(audioBlob: Blob): Promise<string> {
        const { text } = await transcribe(audioBlob);
        return text;
    }

    abort() {

    }
}