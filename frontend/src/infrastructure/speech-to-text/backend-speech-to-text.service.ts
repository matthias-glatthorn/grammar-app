import type { SpeechToTextService } from "./speech-to-text.service";

export class BackendSpeechToTextService implements SpeechToTextService {
    readonly type = "backend";

    start() {
        return Promise.resolve();
    }

    async stop(audioBlob: Blob): Promise<string> {
        return "Stub transcript";
    }
}