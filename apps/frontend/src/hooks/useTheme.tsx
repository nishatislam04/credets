import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark" | "system";

type ThemeProviderProps = {
	children: ReactNode;
	defaultTheme?: Theme;
	storageKey?: string;
};

type ThemeProviderState = {
	theme: Theme;
	setTheme: (theme: Theme) => void;
};

const STORAGE_KEY = "credets-theme";

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

/** Apply the resolved theme class (light/dark) to <html> and persist to localStorage. */
function applyTheme(resolved: "light" | "dark") {
	const root = document.documentElement;
	root.classList.toggle("dark", resolved === "dark");
}

/** Resolve a persisted theme value to an actual light/dark value. */
function resolveTheme(theme: Theme): "light" | "dark" {
	if (theme === "system") {
		return window.matchMedia("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light";
	}
	return theme;
}

export function ThemeProvider({
	children,
	defaultTheme = "system",
	storageKey = STORAGE_KEY,
}: ThemeProviderProps) {
	const [theme, setThemeState] = useState<Theme>(() => {
		const stored = localStorage.getItem(storageKey);
		return (stored as Theme) ?? defaultTheme;
	});

	// Apply the theme whenever it changes
	useEffect(() => {
		const resolved = resolveTheme(theme);
		applyTheme(resolved);
		localStorage.setItem(storageKey, theme);
	}, [theme, storageKey]);

	// Listen for system preference changes
	useEffect(() => {
		const mq = window.matchMedia("(prefers-color-scheme: dark)");

		const handler = () => {
			if (theme === "system") {
				applyTheme(mq.matches ? "dark" : "light");
			}
		};

		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, [theme]);

	const setTheme = (newTheme: Theme) => {
		setThemeState(newTheme);
	};

	return (
		<ThemeProviderContext.Provider value={{ theme, setTheme }}>
			{children}
		</ThemeProviderContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeProviderContext);

	if (context === undefined) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}

	return context;
}
