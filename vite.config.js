import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "path";
import { execSync } from "node:child_process";

const git = (args) => {
    try {
        return execSync(`git ${args}`, { stdio: ["ignore", "pipe", "ignore"] })
            .toString()
            .trim();
    } catch {
        return "unknown"; // no git available, e.g. a source tarball
    }
};

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    define: {
        __APP_VERSION__: JSON.stringify(
            git("describe --tags --always --dirty"),
        ),
        __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
    server: {
        host: "127.0.0.1",
        watch: {
            ignored: ["**/src-tauri/**"],
        },
    },
});
