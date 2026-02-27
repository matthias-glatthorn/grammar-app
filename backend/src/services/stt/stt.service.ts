export interface STTService {
    transcribe(audioFile: Express.Multer.File): Promise<string>;
}