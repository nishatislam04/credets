import { AlertTriangle, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
} from "#/components/ui/alert-dialog";
import { Card } from "#/components/ui/card";
import { Field, FieldError } from "#/components/ui/field";
import { Label } from "#/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/**
 * ! we will later type the form params with 'FormApi'
 * i dont know how it fully works... but here is a sample
 *
 * import { FormApi } from '@tanstack/react-form'
 *
 * interface MyFormData {
 *  email: string
 * }
 *
 * params -- { form }: { form: FormApi<MyFormData, any> }
 */

/**
 * ! we will also manually type out 'item' params later
 */

export function DataBlock({
	item,
	idx,
	form,
	onRemove,
	shouldFocus,
	onFocused,
}: {
	item: any;
	idx: number;
	form: any;
	onRemove?: () => void;
	shouldFocus?: boolean;
	onFocused?: () => void;
}) {
	const blockRef = useRef<HTMLDivElement>(null);
	const [confirmOpen, setConfirmOpen] = useState(false);

	// Auto-focus the first input in this block when it's newly created
	useEffect(() => {
		if (shouldFocus && blockRef.current) {
			const firstInput = blockRef.current.querySelector(
				"input, textarea",
			) as HTMLElement | null;
			if (firstInput) {
				firstInput.focus();
				onFocused?.();
			}
		}
	}, [shouldFocus, onFocused]);

	// Check if the block has any non-empty values by reading directly from form state.
	// Using form.getFieldValue() ensures we get the latest value even when the input
	// is still focused (arrayField.state.value may not have synced yet).
	const currentValue: string = form.getFieldValue(`data.${idx}.value`) ?? "";
	const currentKey: string = form.getFieldValue(`data.${idx}.key`) ?? "";
	const hasValues =
		currentValue.trim().length > 0 || currentKey.trim().length > 0;

	const handleRemove = useCallback(() => {
		// Re-check values in the callback for the freshest read
		const val: string = form.getFieldValue(`data.${idx}.value`) ?? "";
		const key: string = form.getFieldValue(`data.${idx}.key`) ?? "";
		const hasContent = val.trim().length > 0 || key.trim().length > 0;
		if (hasContent) {
			setConfirmOpen(true);
		} else {
			onRemove?.();
		}
	}, [idx, onRemove]);

	const handleConfirmRemove = useCallback(() => {
		setConfirmOpen(false);
		onRemove?.();
	}, [onRemove]);
	return (
		<Card
			ref={blockRef}
			className="rounded-lg border p-4 mb-3 relative space-y-4"
		>
			{item.type === "single_label" && (
				<form.Field
					name={`data.${idx}.value`}
					children={(field) => {
						const isinvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isinvalid}>
								<Label htmlFor={field.name}>Value</Label>
								<Input
									id={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									aria-invalid={isinvalid}
								/>
								{isinvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>
			)}

			{item.type === "key_value" && (
				<div className="grid grid-cols-2 gap-8">
					<form.Field
						name={`data.${idx}.key`}
						children={(field) => {
							const isinvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isinvalid}>
									<Label htmlFor={field.name}>Key</Label>
									<Input
										id={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={isinvalid}
									/>
									{isinvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					/>
					<form.Field
						name={`data.${idx}.value`}
						children={(field) => {
							const isinvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isinvalid}>
									<Label htmlFor={field.name}>Value</Label>
									<Input
										id={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={isinvalid}
									/>
									{isinvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					/>
				</div>
			)}

			{item.type === "information" && (
				<form.Field
					name={`data.${idx}.value`}
					children={(field) => {
						const isinvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isinvalid}>
								<Label htmlFor={field.name}>Information</Label>
								<Textarea
									id={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									rows={8}
									aria-invalid={isinvalid}
								/>
								{isinvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>
			)}

			{/* Delete button — always visible */}
			<Button
				type="button"
				variant="destructive"
				size="sm"
				onClick={handleRemove}
				className="self-end"
			>
				<Trash2 />
			</Button>

			{/* Confirmation dialog — shown only when block has values */}
			{hasValues && (
				<AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
					<AlertDialogContent className="max-w-md">
						{/* Warning icon */}
						<div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10 ring-1 ring-destructive/20">
							<AlertTriangle className="size-7 text-destructive" />
						</div>

						<AlertDialogTitle className="text-center text-lg">
							Remove data block?
						</AlertDialogTitle>

						<AlertDialogDescription className="text-center">
							This data block has{" "}
							<span className="font-semibold text-foreground">content</span>{" "}
							that will be lost.{" "}
							<strong className="text-destructive">
								This action cannot be undone
							</strong>
							.
						</AlertDialogDescription>

						<div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-2.5 text-xs text-destructive/70">
							{item.type === "key_value" && item.key
								? `Key "${item.key}" and its value will be permanently removed.`
								: "All data in this block will be permanently removed."}
						</div>

						<div className="flex justify-end gap-3 mt-2">
							<AlertDialogCancel variant="outline" size="sm">
								Cancel
							</AlertDialogCancel>
							<Button
								type="button"
								variant="destructive"
								size="lg"
								className="gap-2 shadow-lg shadow-destructive/25 hover:shadow-xl hover:shadow-destructive/30 transition-all duration-200"
								onClick={handleConfirmRemove}
							>
								<Trash2 className="size-4" />
								Remove
							</Button>
						</div>
					</AlertDialogContent>
				</AlertDialog>
			)}
		</Card>
	);
}
