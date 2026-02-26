import type { SpeechToTextService } from "./speech-to-text.service";

export class BackendSpeechToTextService implements SpeechToTextService {
    start() {
        return;
    }

    async stop(audioBlob: Blob): Promise<string> {
        return "Stub transcript";
    }

    abort() {

    }
}