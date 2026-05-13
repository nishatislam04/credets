import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DataBlockItem } from "./-components/Datablock";

export const Route = createFileRoute("/credentials/create/")({
	component: RouteComponent,
});

const singleLabelSchema = z.object({
	type: z.literal("single_label"),
	value: z.string().trim().min(1, "label value can not be empty").or(z.literal("")),
});

const keyValueSchema = z.object({
	type: z.literal("key_value"),
	key: z.string().min(1, "key is required"),
	value: z.string().trim().min(1, "value is required"),
});

const informationSchema = z.object({
	type: z.literal("information"),
	value: z.string().trim().min(1, "information text can not be empty"),
});

const dataBlockSchema = z.discriminatedUnion("type", [
	singleLabelSchema,
	keyValueSchema,
	informationSchema,
]);

const credentialsCreateSchema = z.object({
	title: z
		.string()
		.trim()
		.min(4, "credentials title need to be at least 4 characters")
		.max(30, "credentials title can not be grater than 30 characters"),
	short_description: z
		.string()
		.min(5, "credentials short description can not be less than 5 characters")
		.max(50, "credentials short description can not be grater than 50 characters")
		.optional()
		.or(z.literal("")),
	long_description: z
		.string()
		.min(5, "credentials long description can not be less than 5 characters")
		.optional()
		.or(z.literal("")),
	thumbnail: z
		.file()
		.max(3_000_000, "Max 3mb")
		.mime(["image/jpg", "image/jpeg", "image/png", "image/webp"])
		.nullable()
		.optional(),
	data: z.array(dataBlockSchema),
	images: z.array(z.file()).default([]).nullable().optional(),
	notes: z.string().trim().optional(),
	tags: z.string().trim().optional(),
});

type CredentialCreateType = z.infer<typeof credentialsCreateSchema>;

const defaultCredentialValues: CredentialCreateType = {
	title: "",
	short_description: undefined,
	long_description: undefined,
	thumbnail: null,
	data: [{ type: "single_label", value: "" }],
	images: [],
	notes: "",
	tags: "",
};

// function DataBlockItem({ item, idx, form }) {
// 	console.log(item);
// 	return (
// 		<div className="p-4 border rounded mb-3 relative">
// 			{item.type === "single_label" && (
// 				<form.Field
// 					name={`data.${idx}.value`}
// 					children={(field) => (
// 						<div>
// 							<label htmlFor={field.name}>value</label>
// 							<input
// 								type="text"
// 								id={field.name}
// 								value={field.state.value}
// 								onBlur={field.handleBlur}
// 								onChange={(e) => field.handleChange(e.target.value)}
// 								className="p-2 w-full"
// 							/>
// 							{field.state.meta.errors.map((error, i) => (
// 								<p key={i} className="text-red-600 text-sm mt-1">
// 									{error?.message}
// 								</p>
// 							))}
// 						</div>
// 					)}
// 				/>
// 			)}

// 			{item.type === "key_value" && (
// 				<div className="grid grid-cols-2 gap-2">
// 					<form.Field
// 						name={`data.${idx}.key`}
// 						children={(field) => (
// 							<div>
// 								<label htmlFor={field.name}>key</label>
// 								<input
// 									id={field.name}
// 									name={field.name}
// 									value={field.state.value}
// 									onBlur={field.handleBlur}
// 									onChange={(e) => field.handleChange(e.target.value)}
// 								/>
// 								{field.state.meta.errors.map((error, i) => (
// 									<p key={i} className="text-red-500 text-sm mt-1">
// 										{error?.message}
// 									</p>
// 								))}
// 							</div>
// 						)}
// 					/>

// 					<form.Field
// 						name={`data.${idx}.value`}
// 						children={(field) => (
// 							<div>
// 								<label htmlFor={field.name}>value</label>
// 								<input
// 									id={field.name}
// 									name={field.name}
// 									value={field.state.value}
// 									onBlur={field.handleBlur}
// 									onChange={(e) => field.handleChange(e.target.value)}
// 								/>
// 								{field.state.meta.errors.map((error, i) => (
// 									<p key={i} className="text-red-500 text-sm mt-1">
// 										{error?.message}
// 									</p>
// 								))}
// 							</div>
// 						)}
// 					/>
// 				</div>
// 			)}

// 			{item.type === "information" && (
// 				<form.Field
// 					name={`data.${idx}.value`}
// 					children={(field) => (
// 						<div>
// 							<label htmlFor={field.name}>information</label>
// 							<textarea
// 								id={field.name}
// 								name={field.name}
// 								value={field.state.value}
// 								onBlur={field.handleBlur}
// 								onChange={(e) => field.handleChange(e.target.value)}
// 								rows={8}
// 								cols={60}
// 							/>
// 							{field.state.meta.errors.map((error, i) => (
// 								<p key={i} className="text-red-500 text-sm mt-1">
// 									{error?.message}
// 								</p>
// 							))}
// 						</div>
// 					)}
// 				/>
// 			)}
// 		</div>
// 	);
// }

function RouteComponent() {
	const form = useForm({
		defaultValues: defaultCredentialValues,
		validators: { onBlur: credentialsCreateSchema },
		onSubmitMeta: {
			submitAction: "continue",
		},
		onSubmit: async ({ value }) => {
			// we will construct the FormData here and append files manually
			// and omit content-type totally???
			const response = await fetch(
				`${import.meta.env.VITE_BACKEND_APP}/credentials/create`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(value),
				},
			);
			const data = await response.json();
			console.log("server response", data);
		},
	});

	return (
		<main>
			<p className="capitalize text-4xl text-center my-8">creadential create form</p>

			<Form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
				className="space-y-6"
			>
				{/*title*/}
				<form.Field
					name="title"
					children={(field) => (
						<FormItem>
							<FormLabel htmlFor="title">Title</FormLabel>
							<FormControl>
								<Input
									id="title"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="Enter credential title"
								/>
							</FormControl>
							<FormMessage
								errors={field.state.meta.errors.map((e) => e?.message || "")}
							/>
						</FormItem>
					)}
				/>
				{/*side-by-side short and long desciption*/}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<form.Field
						name="short_description"
						children={(field) => (
							<FormItem>
								<FormLabel htmlFor="short_description">Short description</FormLabel>
								<FormControl>
									<Textarea
										id="short_description"
										value={field.state.value ?? ""}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										rows={4}
										placeholder="Brief summary"
									/>
								</FormControl>
								<FormMessage
									errors={field.state.meta.errors.map((e) => e?.message || "")}
								/>
							</FormItem>
						)}
					/>
					<form.Field
						name="long_description"
						children={(field) => (
							<FormItem>
								<FormLabel htmlFor="long_description">Long description</FormLabel>
								<FormControl>
									<Textarea
										id="long_description"
										value={field.state.value ?? ""}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										rows={4}
										placeholder="Detailed description"
									/>
								</FormControl>
								<FormMessage
									errors={field.state.meta.errors.map((e) => e?.message || "")}
								/>
							</FormItem>
						)}
					/>
				</div>

				{/* Thumbnail file */}
				<form.Field
					name="thumbnail"
					children={(field) => (
						<FormItem>
							<FormLabel htmlFor="thumbnail">Thumbnail (image)</FormLabel>
							<FormControl>
								<Input
									id="thumbnail"
									type="file"
									accept="image/jpeg,image/png,image/webp"
									onBlur={field.handleBlur}
									onChange={(e) => {
										const file = e.target.files?.[0] || null;
										field.handleChange(file);
									}}
								/>
							</FormControl>
							<FormMessage
								errors={field.state.meta.errors.map((e) => e?.message || "")}
							/>
						</FormItem>
					)}
				/>

				{/* Data array */}
				<div>
					<h2 className="text-lg font-semibold mb-3">Data items</h2>
					<form.Field
						name="data"
						mode="array"
						children={(arrayField) => (
							<div className="space-y-4">
								{arrayField.state.value.map((data, idx) => (
									<DataBlockItem key={idx} item={data} idx={idx} form={form} />
								))}

								<div className="flex flex-wrap gap-2">
									<Button
										type="button"
										variant="outline"
										onClick={() =>
											arrayField.pushValue({ type: "single_label", value: "" })
										}
									>
										+ Single label
									</Button>
									<Button
										type="button"
										variant="outline"
										onClick={() =>
											arrayField.pushValue({ type: "key_value", key: "", value: "" })
										}
									>
										+ Key / Value
									</Button>
									<Button
										type="button"
										variant="outline"
										onClick={() =>
											arrayField.pushValue({ type: "information", value: "" })
										}
									>
										+ Information
									</Button>
								</div>
							</div>
						)}
					/>
				</div>

				{/* Images multi-file */}
				<form.Field
					name="images"
					children={(field) => (
						<FormItem>
							<FormLabel htmlFor="images">Images (multi)</FormLabel>
							<FormControl>
								<Input
									key={field.state.value?.length ?? 0}
									id="images"
									type="file"
									multiple
									accept="image/*"
									onBlur={field.handleBlur}
									onChange={(e) => {
										const newFiles = e.target.files ? Array.from(e.target.files) : [];
										const current = field.state.value ?? [];
										field.handleChange([...current, ...newFiles]);
										e.target.value = "";
									}}
								/>
							</FormControl>
							{field.state.value && field.state.value.length > 0 && (
								<div className="mt-2 text-sm">
									<p className="font-medium">Selected files:</p>
									<ul className="list-disc list-inside">
										{field.state.value.map((file, index) => (
											<li key={index} className="flex items-center gap-2">
												<span>{file.name}</span>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="text-destructive h-auto px-1"
													onClick={() => {
														const updated = [...field.state.value];
														updated.splice(index, 1);
														field.handleChange(updated);
													}}
												>
													Remove
												</Button>
											</li>
										))}
									</ul>
								</div>
							)}
							<FormMessage
								errors={field.state.meta.errors.map((e) => e?.message || "")}
							/>
						</FormItem>
					)}
				/>

				{/* Notes & Tags side by side */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<form.Field
						name="notes"
						children={(field) => (
							<FormItem>
								<FormLabel htmlFor="notes">Notes</FormLabel>
								<FormControl>
									<Textarea
										id="notes"
										value={field.state.value ?? ""}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										rows={4}
									/>
								</FormControl>
								<FormMessage
									errors={field.state.meta.errors.map((e) => e?.message || "")}
								/>
							</FormItem>
						)}
					/>
					<form.Field
						name="tags"
						children={(field) => (
							<FormItem>
								<FormLabel htmlFor="tags">Tags</FormLabel>
								<FormControl>
									<Textarea
										id="tags"
										value={field.state.value ?? ""}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										rows={4}
									/>
								</FormControl>
								<FormMessage
									errors={field.state.meta.errors.map((e) => e?.message || "")}
								/>
							</FormItem>
						)}
					/>
				</div>

				<Button type="submit" size="lg" className="w-full">
					Add new credential data
				</Button>
			</Form>
		</main>
	);
}
