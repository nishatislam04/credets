import { Button } from "@/components/ui/button";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function DataBlockItem({ item, idx, form }) {
	return (
		<div className="rounded-lg border p-4 mb-3 relative space-y-4">
			{item.type === "single_label" && (
				<form.Field
					name={`data.${idx}.value`}
					children={(field) => (
						<FormItem>
							<FormLabel htmlFor={field.name}>Value</FormLabel>
							<FormControl>
								<Input
									id={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							</FormControl>
							<FormMessage errors={field.state.meta.errors.map((e) => e?.message)} />
						</FormItem>
					)}
				/>
			)}

			{item.type === "key_value" && (
				<div className="grid grid-cols-2 gap-4">
					<form.Field
						name={`data.${idx}.key`}
						children={(field) => (
							<FormItem>
								<FormLabel htmlFor={field.name}>Key</FormLabel>
								<FormControl>
									<Input
										id={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
								</FormControl>
								<FormMessage errors={field.state.meta.errors.map((e) => e?.message)} />
							</FormItem>
						)}
					/>
					<form.Field
						name={`data.${idx}.value`}
						children={(field) => (
							<FormItem>
								<FormLabel htmlFor={field.name}>Value</FormLabel>
								<FormControl>
									<Input
										id={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
								</FormControl>
								<FormMessage errors={field.state.meta.errors.map((e) => e?.message)} />
							</FormItem>
						)}
					/>
				</div>
			)}

			{item.type === "information" && (
				<form.Field
					name={`data.${idx}.value`}
					children={(field) => (
						<FormItem>
							<FormLabel htmlFor={field.name}>Information</FormLabel>
							<FormControl>
								<Textarea
									id={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									rows={8}
								/>
							</FormControl>
							<FormMessage errors={field.state.meta.errors.map((e) => e?.message)} />
						</FormItem>
					)}
				/>
			)}

			<Button
				type="button"
				variant="destructive"
				size="sm"
				onClick={() => form.removeValue?.(idx)}
			>
				Remove
			</Button>
		</div>
	);
}
