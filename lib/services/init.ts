import { getCollection } from "@/lib/mongo";
let hasInitialized = false;
export async function initServices() {
  if (hasInitialized) return;
  hasInitialized = true;
  try {
    await getCollection("start", "toStart");
    console.log("[Services] All services initialized.");
  } catch (err) {
    console.error("[Services] Initialization failed:", err);
  }
}
