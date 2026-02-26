import { AudioRecorder } from './infrastructure/audio-recorder/audio-recorder';
import { BackendSpeechToTextService } from './infrastructure/speech-to-text/backend-speech-to-text.service';
import { BrowserSpeechToTextService } from './infrastructure/speech-to-text/browser-speech-to-text.service';
import type { SpeechToTextService } from './infrastructure/speech-to-text/speech-to-text.service';
import { createAppState } from './state/app-state';
import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <div class="card">
        <input id="email-input" type="email" name="email" placeholder="Your e-mail address" required>
    </div>
    <h3 id="state-headline"></h3>
    <div class="card">
        <div id="original-text" class="original-text"></div>
        <audio id="audio" controls hidden></audio>
    </div>
    <div class="card">
      <button id="record-btn" type="button"></button>
      <button id="reset-btn" type="button">Reset</button>
    </div>
  </div>
`

const emailInputEl = document.querySelector<HTMLInputElement>("#email-input")!;
const stateHeadlineEl = document.querySelector<HTMLDivElement>("#state-headline")!;
const originalTextEl = document.querySelector<HTMLDivElement>("#original-text")!;
const audioEl = document.querySelector<HTMLAudioElement>("#audio")!;
const recordBtnEl = document.querySelector<HTMLButtonElement>("#record-btn")!;
const resetBtnEl = document.querySelector<HTMLButtonElement>("#reset-btn")!;

const audioRecorder = new AudioRecorder();
let audioUrl = "";

let speechToTextService: SpeechToTextService = 
    isSpeechToTextSupported() ? new BrowserSpeechToTextService() : new BackendSpeechToTextService();

let originalText = "";

const appState = createAppState(render);
appState.set("idle");

recordBtnEl.addEventListener("click", async () => {
    switch (appState.get()) {
        case "idle":
            const isValid = emailInputEl.checkValidity();
            if (isValid) {
                await audioRecorder.start();
                try {
                    await speechToTextService.start();
                } catch (error) {

                    if (speechToTextService.type === "browser") {
                        speechToTextService = new BackendSpeechToTextService();
                    } else {
                        throw error;
                    }
                }
                
                appState.set("recording");
            }
            emailInputEl.reportValidity()
            break;
        case "recording":
            const audioBlob = await audioRecorder.stop();
            audioUrl = URL.createObjectURL(audioBlob);
            audioEl.src = audioUrl;
            appState.set("stt");

            originalText = await speechToTextService.stop(audioBlob);
            appState.set("done");
            break;
    }
});

resetBtnEl.addEventListener("click", async () => {
    originalText = "";
    audioUrl = "";
    await audioRecorder.stop();
    appState.set("idle");
});

const ORIGINAL_PREFIX = "<strong>Original:</strong> ";

function render() {
    switch (appState.get()) {
        case "idle":
            emailInputEl.disabled = false;
            stateHeadlineEl.textContent = "Ready to record";
            originalTextEl.textContent = "";
            audioEl.hidden = true;
            recordBtnEl.textContent = "Start Recording";
            recordBtnEl.disabled = false;
            break;
        case "recording":
            emailInputEl.disabled = true;
            stateHeadlineEl.textContent = "Recording ...";
            originalTextEl.textContent = "";
            audioEl.hidden = true;
            recordBtnEl.textContent = "Stop Recording";
            recordBtnEl.disabled = false;
            break;
        case "stt":
            emailInputEl.disabled = true;
            stateHeadlineEl.textContent = "Converting speech to text ...";
            originalTextEl.textContent = "";
            audioEl.hidden = false;
            recordBtnEl.textContent = "Stop Recording";
            recordBtnEl.disabled = true;
            break;
        case "done":
            emailInputEl.disabled = true;
            stateHeadlineEl.textContent = "Done!";
            originalTextEl.innerHTML = ORIGINAL_PREFIX + originalText;
            audioEl.hidden = false;
            recordBtnEl.textContent = "Stop Recording";
            recordBtnEl.disabled = true;
            break;
    }
}

function isSpeechToTextSupported(): boolean {
    return !!(
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition
    );
}
