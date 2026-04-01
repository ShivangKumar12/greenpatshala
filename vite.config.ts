import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
    // Load env from root directory
    const env = loadEnv(mode, __dirname, '');

    // Determine backend port from env or default
    const backendPort = env.PORT || '5050';
    const backendURL = `http://localhost:${backendPort}`;

    return {
        plugins: [react()],
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "client", "src"),
                "@assets": path.resolve(__dirname, "client", "src", "assets", "attached_assets"),
                "@db": path.resolve(__dirname, "db"),
            },
        },
        root: path.resolve(__dirname, "client"),
        envDir: __dirname, // Load .env from root directory
        build: {
            outDir: path.resolve(__dirname, "dist/public"),
            emptyOutDir: true,
        },
        server: {
            port: 3000,
            strictPort: true,
            proxy: {
                '/api': {
                    target: backendURL,
                    changeOrigin: true,
                },
                '/uploads': {
                    target: backendURL,
                    changeOrigin: true,
                }
            }
        },
    };
});
