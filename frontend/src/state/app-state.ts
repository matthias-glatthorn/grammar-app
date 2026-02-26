export type ApplicationState = "idle" | "recording" | "stt" | "done";

export function createAppState(renderFn: () => void) {
    let state: ApplicationState = "idle";

    function set(newState: ApplicationState) {
        state = newState;
        renderFn();
    }

    function get() {
        return state;
    }

    return {
        set,
        get,
    };
}