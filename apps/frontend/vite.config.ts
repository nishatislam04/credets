import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { statsPlugin } from "vite-bundle-explorer/plugin";

export default defineConfig({
	resolve: { tsconfigPaths: true },
	build: {
		rolldownOptions: {
			output: {
				// This keeps the original file name in the output for better debugging
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
