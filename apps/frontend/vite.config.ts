import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { homedir } from "os";
import { join, resolve } from "path";
import { defineConfig, searchForWorkspaceRoot } from "vite";
import { statsPlugin } from "vite-bundle-explorer/plugin";

export default defineConfig({
	resolve: {
		tsconfigPaths: true,
		dedupe: ["react", "react-dom"],
		alias: {
			react: resolve(__dirname, "node_modules/react"),
			"react-dom": resolve(__dirname, "node_modules/react-dom"),
		},
	},
	server: {
		fs: {
			allow: [
				searchForWorkspaceRoot(process.cwd()),
				join(homedir(), ".bun/install/cache/"),
			],
		},
	},
	optimizeDeps: {
		include: ["react", "react-dom"],
	},
	build: {
		rolldownOptions: {
			output: {
				chunkFileNames: "assets/[name]-[hash].js",
			},
		},
	},
	plugins: [
		devtools({
			consolePiping: { enabled: false },
		}),
		tailwindcss(),
		tanstackRouter({ target: "react", autoCodeSplitting: true }),
		viteReact(),
		statsPlugin({
			enabled: true,
			reportCompressedSize: true,
			emitJson: true,
		}),
	],
});
