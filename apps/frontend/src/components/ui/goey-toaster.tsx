import type {
	GooeyPromiseData,
	GooeyToastOptions,
	GooeyToasterProps,
} from "goey-toast";
import {
	GooeyToaster as GooeyToasterPrimitive,
	gooeyToast as gooeyToastPrimitive,
} from "goey-toast";
import "goey-toast/styles.css";

export type { GooeyToasterProps };
export type {
	GooeyPromiseData,
	GooeyToastAction,
	GooeyToastClassNames,
	GooeyToastOptions,
	GooeyToastTimings,
} from "goey-toast";

// ── Wrapper: apply defaults (hide timestamp, add description class) to every toast ──

const DEFAULT_DESCRIPTION_CLASS = "toast-description";

function withDefaults(options?: GooeyToastOptions): GooeyToastOptions {
	return {
		...options,
		showTimestamp: false,
		classNames: {
			...options?.classNames,
			description: [options?.classNames?.description, DEFAULT_DESCRIPTION_CLASS]
				.filter(Boolean)
				.join(" "),
		},
	};
}

const gooeyToastBase = (title: string, options?: GooeyToastOptions) =>
	gooeyToastPrimitive(title, withDefaults(options));

const gooeyToast = Object.assign(gooeyToastBase, {
	success: (title: string, options?: GooeyToastOptions) =>
		gooeyToastPrimitive.success(title, withDefaults(options)),
	error: (title: string, options?: GooeyToastOptions) =>
		gooeyToastPrimitive.error(title, withDefaults(options)),
	warning: (title: string, options?: GooeyToastOptions) =>
		gooeyToastPrimitive.warning(title, withDefaults(options)),
	info: (title: string, options?: GooeyToastOptions) =>
		gooeyToastPrimitive.info(title, withDefaults(options)),
	promise: <T,>(promise: Promise<T>, data: GooeyPromiseData<T>) =>
		gooeyToastPrimitive.promise(promise, { ...data, showTimestamp: false }),
	dismiss: gooeyToastPrimitive.dismiss,
	update: gooeyToastPrimitive.update,
});

export { gooeyToast };

function GooeyToaster(props: GooeyToasterProps) {
	return <GooeyToasterPrimitive position="top-center" preset="bouncy" {...props} />;
}

export { GooeyToaster };
