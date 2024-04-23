import { Emulator } from "./emulator";

function main() {
  const input = document.querySelector(".rom-input") as HTMLInputElement;
  const startStop = document.querySelector(".emu-start-stop") as HTMLButtonElement;
  const step = document.querySelector(".emu-step") as HTMLButtonElement;
  const stepOver = document.querySelector(".emu-step-over") as HTMLButtonElement;

  const emulator = new Emulator();

  input.addEventListener("change", (event) => {
    const files = (event.target as HTMLInputElement).files;

    if (files && files.length > 0) {
      const rom = files[0];
      emulator.load(rom);
    }
  });

  startStop.addEventListener("click", (event) => {
    event.preventDefault();

    if (emulator._running) {
      if (emulator._paused) {
        emulator._paused = false;
      } else {
        emulator._paused = true;
      }
    } else {
      emulator.run();
    }
    switch (startStop.innerText) {
      case "start":
        startStop.innerText = "stop";
        break;
      case "stop":
        startStop.innerText = "start";
        break;
    }
  });

  step.addEventListener("click", (event) => {
    event.preventDefault();
    emulator.step();
  });

  stepOver.addEventListener("click", (event) => {
    event.preventDefault();
    emulator.stepOver();
  });
}

document.addEventListener("DOMContentLoaded", function () {
  main();
});
