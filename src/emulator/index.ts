import { Emulator } from "./emulator";

const emulator = new Emulator();

onmessage = function (event) {
  const { action, rom }: { action: string; rom?: File } = event.data;
  switch (action) {
    case "load":
      if (!rom) {
        throw new Error("Load Error: No ROM Provided");
      }
      emulator.load(rom);
      return;
    case "step":
      // emulator.step(true);
      return;
    case "toggleStartStop":
      if (emulator._running) {
        if (emulator._paused) {
          emulator._paused = false;
        } else {
          emulator._paused = true;
        }
        // emulator._running = false;
      } else {
        emulator.run();
      }
      return;
  }
};
