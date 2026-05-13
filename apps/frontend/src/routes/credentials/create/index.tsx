import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
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
import {
	type CredentialCreateType,
	credentialsCreateSchema,
} from "./-types/create-types";

export const Route = createFileRoute("/credentials/create/")({
	component: RouteComponent,
});

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
				className="space-y-6 px-4 md:px-12"
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
										rows={8}
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
										rows={8}
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
									<DataBlockItem
										key={`${crypto.randomUUID()}`}
										item={data}
										idx={idx}
										form={form}
										onRemove={() => arrayField.removeValue(idx)}
									/>
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
										{field.state.value.map((file, index) => {
											const imageFiles: File[] = (field.state.value as File[]) ?? [];

											return (
												<li
													key={`${crypto.randomUUID()}`}
													className="flex items-center gap-2"
												>
													<span>{file.name}</span>
													<Button
														type="button"
														variant="ghost"
														size="sm"
														className="text-destructive h-auto px-1"
														onClick={() => {
															const updated = imageFiles.filter((_, i) => i !== index);
															field.handleChange(updated);
														}}
													>
														Remove
													</Button>
												</li>
											);
										})}
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
										rows={10}
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
										rows={10}
									/>
								</FormControl>
								<FormMessage
									errors={field.state.meta.errors.map((e) => e?.message || "")}
								/>
							</FormItem>
						)}
					/>
				</div>

				<Button
					type="submit"
					size="lg"
					className="my-3 flex justify-center items-center w-full"
				>
					Add new credential data
				</Button>
			</Form>
		</main>
	);
}
