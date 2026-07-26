import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { homedir } from "os";
import { join, resolve } from "path";
import { defineConfig, searchForWorkspaceRoot } from "vite";
import { statsPlugin } from "vite-bundle-explorer/plugin";

export default defineConfig(({ mode, command }) => {
	const isStaging = mode === "staging";
	const isProductionBuild = command === "build" && mode === "production";
	const analyze =
		isStaging || process.env.ANALYZE === "true";

	return {
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
				// Keep DevTools in staging builds; strip only on production builds.
				removeDevtoolsOnBuild: isProductionBuild,
			}),
			tailwindcss(),
			tanstackRouter({ target: "react", autoCodeSplitting: true }),
			viteReact(),
			statsPlugin({
				// Staging (`vite build --mode staging`) + explicit ANALYZE=true only.
				// Never on default production builds (Render).
				enabled: analyze,
				reportCompressedSize: true,
				emitJson: true,
			}),
		],
	};
});
