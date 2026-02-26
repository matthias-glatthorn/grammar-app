export interface SpeechToTextService {
    readonly type: "browser" | "backend";

    start(): Promise<void>;
    stop(audio: Blob): Promise<string>;
}