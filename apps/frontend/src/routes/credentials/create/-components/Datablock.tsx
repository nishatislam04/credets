import { Trash2 } from "lucide-react";
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

export function DataBlockItem({
	item,
	idx,
	form,
	onRemove,
}: {
	item: any;
	idx: number;
	form: any;
	onRemove?: () => void;
}) {
	return (
		<Card className="rounded-lg border p-4 mb-3 relative space-y-4">
			{item.type === "single_label" && (
				<form.Field
					name={`data.${idx}.value`}
					children={(field) => {
						const isinvalid = field.state.meta.isTouched && !field.state.meta.isValid;
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
							const isinvalid = field.state.meta.isTouched && !field.state.meta.isValid;
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
							const isinvalid = field.state.meta.isTouched && !field.state.meta.isValid;
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
						const isinvalid = field.state.meta.isTouched && !field.state.meta.isValid;
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

			<Button
				type="button"
				variant="destructive"
				size="sm"
				onClick={onRemove}
				className="self-end"
			>
				<Trash2 />
			</Button>
		</Card>
	);
}
