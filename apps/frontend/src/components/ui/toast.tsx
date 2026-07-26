import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import {
	CircleCheckIcon,
	InfoIcon,
	Loader2Icon,
	OctagonXIcon,
	TriangleAlertIcon,
	XIcon,
} from "lucide-react";

import { cn } from "#/lib/utils";
import { Button } from "#/components/ui/button";

// ── Global toast manager ──────────────────────────────────────────────────

const toastManager = ToastPrimitive.createToastManager();

// ── Convenience API (matches existing gooeyToast interface) ────────────────

type ToastOptions = {
	description?: string;
	duration?: number; // maps to base-ui's `timeout`
	actionProps?: ToastPrimitive.AddToastOptions["actionProps"];
	id?: string;
};

type PromiseData<T> = {
	loading: string | { title: string };
	success: string | { title: string } | ((data: T) => string);
	error: string | { title: string } | ((err: Error) => string);
};

function resolveMessage(v: string | { title: string } | undefined): string {
	if (!v) return "";
	return typeof v === "string" ? v : v.title;
}

function toastBase(title: string, options?: ToastOptions) {
	return toastManager.add({
		title,
		description: options?.description,
		timeout: options?.duration,
		actionProps: options?.actionProps,
	});
}

const toast = Object.assign(toastBase, {
	success: (title: string, options?: ToastOptions) =>
		toastManager.add({
			title,
			description: options?.description,
			type: "success",
			timeout: options?.duration,
		}),
	error: (title: string, options?: ToastOptions) =>
		toastManager.add({
			title,
			description: options?.description,
			type: "error",
			timeout: options?.duration,
		}),
	warning: (title: string, options?: ToastOptions) =>
		toastManager.add({
			title,
			description: options?.description,
			type: "warning",
			timeout: options?.duration,
		}),
	info: (title: string, options?: ToastOptions) =>
		toastManager.add({
			title,
			description: options?.description,
			type: "info",
			timeout: options?.duration,
		}),
	promise: <T,>(promise: Promise<T>, data: PromiseData<T>) =>
		toastManager.promise(promise, {
			loading: resolveMessage(data.loading),
			success:
				typeof data.success === "function"
					? data.success
					: () => resolveMessage(data.success),
			error:
				typeof data.error === "function"
					? data.error
					: () => resolveMessage(data.error),
		}),
});

// ── Sub-components ─────────────────────────────────────────────────────────

function ToastProvider({ ...props }: ToastPrimitive.Provider.Props) {
	return <ToastPrimitive.Provider toastManager={toastManager} {...props} />;
}

function ToastPortal({ ...props }: ToastPrimitive.Portal.Props) {
	return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />;
}

function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
	return (
		<ToastPrimitive.Viewport
			data-slot="toast-viewport"
			className={cn(
				"pointer-events-none fixed inset-x-4 top-4 z-50 mx-auto w-auto max-w-sm outline-none sm:right-4 sm:left-auto sm:mx-0 sm:w-full",
				className,
			)}
			{...props}
		/>
	);
}

function ToastRoot({ className, ...props }: ToastPrimitive.Root.Props) {
	return (
		<ToastPrimitive.Root
			data-slot="toast"
			className={cn(
				"group/toast pointer-events-auto absolute right-0 bottom-0 z-[calc(1000-var(--toast-index))] w-full origin-bottom rounded-2xl border bg-popover text-popover-foreground shadow-lg will-change-transform outline-none select-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
				"[--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]",
				"h-(--height) [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] [transition:transform_500ms_cubic-bezier(0.22,1,0.36,1),opacity_500ms,height_150ms]",
				"after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
				"data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
				"data-limited:opacity-0 data-starting-style:[transform:translateY(-150%)]",
				"[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(-150%)]",
				"data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
				"data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
				"data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
				"data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
				"data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
				"data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
				"data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
				"data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
				className,
			)}
			{...props}
		/>
	);
}

function ToastContent({ className, ...props }: ToastPrimitive.Content.Props) {
	return (
		<ToastPrimitive.Content
			data-slot="toast-content"
			className={cn(
				"flex h-full items-center gap-3 overflow-hidden p-4 transition-opacity duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100",
				className,
			)}
			{...props}
		/>
	);
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
	return (
		<ToastPrimitive.Title
			data-slot="toast-title"
			className={cn("text-sm font-medium", className)}
			{...props}
		/>
	);
}

function ToastDescription({
	className,
	...props
}: ToastPrimitive.Description.Props) {
	return (
		<ToastPrimitive.Description
			data-slot="toast-description"
			className={cn("text-sm text-muted-foreground", className)}
			{...props}
		/>
	);
}

function ToastAction({
	className,
	render = <Button variant="outline" size="sm" />,
	...props
}: ToastPrimitive.Action.Props) {
	return (
		<ToastPrimitive.Action
			data-slot="toast-action"
			render={render}
			className={cn("shrink-0", className)}
			{...props}
		/>
	);
}

function ToastClose({
	className,
	children,
	render = <Button variant="ghost" size="icon-sm" />,
	...props
}: ToastPrimitive.Close.Props) {
	return (
		<ToastPrimitive.Close
			data-slot="toast-close"
			aria-label="Close toast"
			render={render}
			className={cn(
				"relative shrink-0 text-muted-foreground after:absolute after:-inset-2 after:content-[''] hover:text-foreground",
				className,
			)}
			{...props}
		>
			{children ?? <XIcon aria-hidden="true" />}
		</ToastPrimitive.Close>
	);
}

/**
 * Colorful status icons for each toast type.
 *
 * - success → green check
 * - error   → red X
 * - warning → amber triangle
 * - info    → blue info
 * - loading → animated spinner
 */
function ToastIcon({ type }: { type: string | undefined }) {
	const icon = (() => {
		switch (type) {
			case "success":
				return <CircleCheckIcon aria-hidden="true" />;
			case "error":
				return <OctagonXIcon aria-hidden="true" />;
			case "warning":
				return <TriangleAlertIcon aria-hidden="true" />;
			case "info":
				return <InfoIcon aria-hidden="true" />;
			case "loading":
				return <Loader2Icon className="animate-spin" aria-hidden="true" />;
			default:
				return null;
		}
	})();

	if (!icon) return null;

	const colorClass = (() => {
		switch (type) {
			case "success":
				return "text-green-600 dark:text-green-500";
			case "error":
				return "text-destructive";
			case "warning":
				return "text-amber-500 dark:text-amber-400";
			case "info":
				return "text-blue-600 dark:text-blue-400";
			default:
				return "text-muted-foreground";
		}
	})();

	return (
		<span
			data-slot="toast-icon"
			className={cn(
				"shrink-0 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5",
				colorClass,
			)}
		>
			{icon}
		</span>
	);
}

// ── Toast List Renderer ────────────────────────────────────────────────────

function ToastList() {
	const { toasts } = ToastPrimitive.useToastManager();

	return toasts.map((toastItem) => (
		<ToastRoot key={toastItem.id} toast={toastItem}>
			<ToastContent>
				<ToastIcon type={toastItem.type} />
				<div className="flex min-w-0 flex-1 flex-col gap-1">
					<ToastTitle />
					<ToastDescription />
				</div>
				<ToastAction />
				<ToastClose />
			</ToastContent>
		</ToastRoot>
	));
}

// ── Toaster (provider + viewport) ──────────────────────────────────────────

type ToasterProps = Omit<ToastPrimitive.Provider.Props, "toastManager"> & {
	/**
	 * Offset from the top edge, e.g. "5rem" to clear a fixed header.
	 * Applied as `margin-top` on the viewport.
	 */
	offset?: string;
};

function Toaster({ children, offset, ...props }: ToasterProps) {
	return (
		<ToastProvider {...props}>
			{children}
			<ToastPortal>
				<ToastViewport style={offset ? { marginTop: offset } : undefined}>
					<ToastList />
				</ToastViewport>
			</ToastPortal>
		</ToastProvider>
	);
}

// ── Re-exports for advanced use ────────────────────────────────────────────

const createToastManager = ToastPrimitive.createToastManager;
const useToastManager = ToastPrimitive.useToastManager;

export {
	createToastManager,
	toast,
	Toaster,
	ToastAction,
	ToastClose,
	ToastContent,
	ToastDescription,
	ToastProvider,
	ToastRoot as Toast,
	ToastTitle,
	ToastViewport,
	useToastManager,
};
