function main() {
  const input = document.querySelector(".rom-input") as HTMLInputElement;
  const startStop = document.querySelector(".emu-start-stop") as HTMLButtonElement;

  const emulator = new Worker(new URL("./emulator/index.ts", import.meta.url), {
    name: "emulator",
    type: "module",
  });

  input.addEventListener("change", (event) => {
    const files = (event.target as HTMLInputElement).files;

    if (files && files.length > 0) {
      const rom = files[0];
      emulator.postMessage({ action: "load", rom });
    }
  });

  startStop.addEventListener("click", (event) => {
    event.preventDefault();
    emulator.postMessage({ action: "toggleStartStop" });
    switch (startStop.innerText) {
      case "start":
        startStop.innerText = "stop";
        break;
      case "stop":
        startStop.innerText = "start";
        break;
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  main();
});
