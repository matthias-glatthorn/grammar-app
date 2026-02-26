export class AudioRecorder {
    private mediaRecorder: MediaRecorder | undefined;
    private stream: MediaStream | undefined;
    private chunks: BlobPart[] = [];

    async start(): Promise<void> {
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(this.stream);
        this.chunks = [];

        this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
            if (event.data.size > 0) {
                this.chunks.push(event.data);
            }
        };

        this.mediaRecorder.start();
    }

    async stop(): Promise<Blob> {
        return new Promise((resolve) => {
            this.mediaRecorder!.onstop = () => {
                const blob = new Blob(this.chunks, { type: "audio/webm" });

                this.stream?.getTracks().forEach(track => track.stop());

                this.mediaRecorder = undefined;
                this.stream = undefined;

                resolve(blob);
            };

            this.mediaRecorder!.stop();
        });
    }
}