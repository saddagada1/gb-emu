import { Emulator } from "./emulator/emulator";
import { Context } from "./lib/types";

function main() {
  const input = document.querySelector(".rom-input") as HTMLInputElement;
  const startStop = document.querySelector(".emu-start-stop") as HTMLButtonElement;
  const step = document.querySelector(".emu-step") as HTMLButtonElement;
  const statusContainer = document.querySelector(".status-container") as HTMLDivElement;
  const contextContainer = document.querySelector(".context-container") as HTMLDivElement;

  const emulator = new Emulator();

  // const emulator = new Worker(new URL("./emulator/index.ts", import.meta.url), {
  //   name: "emulator",
  //   type: "module",
  // });

  input.addEventListener("change", (event) => {
    const files = (event.target as HTMLInputElement).files;

    if (files && files.length > 0) {
      const rom = files[0];
      emulator.load(rom);
    }
  });

  startStop.addEventListener("click", (event) => {
    event.preventDefault();
    emulator.run();
    switch (startStop.innerText) {
      case "start":
        startStop.innerText = "stop";
        break;
      case "stop":
        startStop.innerText = "start";
        break;
    }
  });

  // step.addEventListener("click", (event) => {
  //   event.preventDefault();
  //   emulator.postMessage({ action: "step" });
  // });

  // emulator.onmessage = function (event) {
  //   const { status, context, debug }: { status: string; context: Context } = event.data;

  //   const statusLine = document.createElement("p");
  //   statusLine.innerText = status;
  //   statusLine.classList.add("status");
  //   statusContainer.appendChild(statusLine);

  //   const contextLine = document.createElement("p");
  //   contextLine.innerText = `A: ${context.a} F: ${context.f} B: ${context.b} C: ${context.c} D: ${context.d} E: ${context.e} H: ${context.h} L: ${context.l} AF: ${context.af} BC: ${context.bc} DE: ${context.de} HL: ${context.hl} SP: ${context.sp} FLAGS: [C: ${context.flags.c}, H: ${context.flags.h}, N: ${context.flags.n}, Z: ${context.flags.z}]`;
  //   contextLine.classList.add("status");
  //   contextContainer.appendChild(contextLine);
  // };
}

document.addEventListener("DOMContentLoaded", function () {
  main();
});
