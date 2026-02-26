export class SpeechToTextError extends Error {
    constructor(
        message: string
    ) {
        super(message);
    }
}

export interface SpeechToTextService {
    start(): void;
    stop(audio?: Blob): Promise<string>;
    abort(): void;
}