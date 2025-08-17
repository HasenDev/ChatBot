import { initServices } from "./init";
let initialized = false;
(async () => {
  if (!initialized) {
    initialized = true;
    await initServices();
    console.log("[Bootstrap] Services initialized.");
  }
})();
