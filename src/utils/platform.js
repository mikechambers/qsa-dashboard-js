import { Platform } from "@/enums/Platform";
import { isTauri } from "@tauri-apps/api/core";

export const PLATFORM = isTauri() ? Platform.DESKTOP : Platform.WEB;
