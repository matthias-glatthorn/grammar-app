import { AudioRecorder } from './infrastructure/audio-recorder/audio-recorder';
import { createAppState } from './state/app-state';
import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <div class="card">
        <input id="email-input" type="email" name="email" placeholder="Your e-mail address" required>
    </div>
    <h3 id="state-headline"></h3>
    <div class="card">
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
const audioEl = document.querySelector<HTMLAudioElement>("#audio")!;
const recordBtnEl = document.querySelector<HTMLButtonElement>("#record-btn")!;
const resetBtnEl = document.querySelector<HTMLButtonElement>("#reset-btn")!;

const audioRecorder = new AudioRecorder();
let audioUrl = "";

const appState = createAppState(render);
appState.set("idle");

recordBtnEl.addEventListener("click", async () => {
    switch (appState.get()) {
        case "idle":
            const isValid = emailInputEl.checkValidity();
            if (isValid) {
                await audioRecorder.start();
                appState.set("recording");
            }
            emailInputEl.reportValidity()
            break;
        case "recording":
            const audioBlob = await audioRecorder.stop();
            audioUrl = URL.createObjectURL(audioBlob);
            audioEl.src = audioUrl;
            appState.set("done");
            break;
    }
});

resetBtnEl.addEventListener("click", () => {
    appState.set("idle");
});

function render() {
    switch (appState.get()) {
        case "idle":
            emailInputEl.disabled = false;
            stateHeadlineEl.textContent = "Ready to record";
            audioEl.hidden = true;
            recordBtnEl.textContent = "Start Recording";
            recordBtnEl.disabled = false;
            break;
        case "recording":
            emailInputEl.disabled = true;
            stateHeadlineEl.textContent = "Recording ...";
            audioEl.hidden = true;
            recordBtnEl.textContent = "Stop Recording";
            recordBtnEl.disabled = false;
            break;
        case "done":
            emailInputEl.disabled = true;
            stateHeadlineEl.textContent = "Done!";
            audioEl.hidden = false;
            recordBtnEl.textContent = "Stop Recording";
            recordBtnEl.disabled = true;
            break;
    }
}
