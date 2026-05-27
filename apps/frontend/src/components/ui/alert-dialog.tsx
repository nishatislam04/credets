import {
	AlertDialog as AlertDialogPrimitive,
} from "@base-ui/react/alert-dialog";
import type {
	AlertDialogBackdropProps,
	AlertDialogCloseProps,
	AlertDialogDescriptionProps,
	AlertDialogPopupProps,
	AlertDialogRootProps,
	AlertDialogTitleProps,
	AlertDialogTriggerProps,
} from "@base-ui/react/alert-dialog";

import { cn } from "#/lib/utils.ts";

function AlertDialogRoot(props: AlertDialogRootProps) {
	return (
		<AlertDialogPrimitive.Root
			data-slot="alert-dialog-root"
			{...props}
		/>
	);
}

function AlertDialogTrigger({
	className,
	...props
}: AlertDialogTriggerProps) {
	return (
		<AlertDialogPrimitive.Trigger
			data-slot="alert-dialog-trigger"
			className={cn(className)}
			{...props}
		/>
	);
}

function AlertDialogBackdrop({
	className,
	...props
}: AlertDialogBackdropProps) {
	return (
		<AlertDialogPrimitive.Backdrop
			data-slot="alert-dialog-backdrop"
			className={cn(
				"fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 transition-opacity duration-150",
				className,
			)}
			{...props}
		/>
	);
}

function AlertDialogPopup({
	className,
	...props
}: AlertDialogPopupProps) {
	return (
		<AlertDialogPrimitive.Portal>
			<AlertDialogPrimitive.Backdrop />
			<AlertDialogPrimitive.Popup
				data-slot="alert-dialog-popup"
				className={cn(
					"fixed left-1/2 top-1/2 z-50 flex w-full max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-2xl bg-card p-6 shadow-xl ring-1 ring-foreground/5 dark:ring-foreground/10 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 transition-all duration-150",
					className,
				)}
				{...props}
			/>
		</AlertDialogPrimitive.Portal>
	);
}

function AlertDialogTitle({
	className,
	...props
}: AlertDialogTitleProps) {
	return (
		<AlertDialogPrimitive.Title
			data-slot="alert-dialog-title"
			className={cn("text-lg font-semibold", className)}
			{...props}
		/>
	);
}

function AlertDialogDescription({
	className,
	...props
}: AlertDialogDescriptionProps) {
	return (
		<AlertDialogPrimitive.Description
			data-slot="alert-dialog-description"
			className={cn("text-sm text-muted-foreground", className)}
			{...props}
		/>
	);
}

function AlertDialogClose({ className, ...props }: AlertDialogCloseProps) {
	return (
		<AlertDialogPrimitive.Close
			data-slot="alert-dialog-close"
			className={cn(className)}
			{...props}
		/>
	);
}

export {
	AlertDialogBackdrop,
	AlertDialogClose,
	AlertDialogDescription,
	AlertDialogPopup,
	AlertDialogRoot,
	AlertDialogTitle,
	AlertDialogTrigger,
};
