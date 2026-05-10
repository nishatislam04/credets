import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/credentials/create/")({
	component: RouteComponent,
});

const singleLabelSchema = z.object({
	type: z.literal("single_label"),
	value: z
		.string()
		.trim()
		.min(1, "label value can not be empty")
		.or(z.literal("")),
});

const keyValueSchema = z.object({
	type: z.literal("key_value"),
	key: z.string().min(1, "key is required"),
	value: z.string().trim().min(1, "value is required"),
});

const informationSchema = z.object({
	type: z.literal("information"),
	text: z.string().trim().min(1, "information text can not be empty"),
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
		.max(
			50,
			"credentials short description can not be grater than 50 characters",
		)
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
			console.log(data);
		},
	});
	return (
		<main>
			<p className="capitalize text-4xl text-center my-8">
				creadential create form
			</p>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
				className="flex flex-col gap-4"
			>
				{/*title field*/}
				<form.Field
					name="title"
					children={(field) => (
						<>
							<div>
								<label htmlFor="title">title</label>
								<input
									id="title"
									name="title"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									className="ring-1 ml-2 w-80"
								/>
							</div>
						</>
					)}
				/>
				{/*side-by-side short and long desciption*/}
				<div className="flex gap-4 justify-between">
					{/*short description*/}
					<form.Field
						name="short_description"
						children={(field) => (
							<>
								<div className="flex flex-col w-full">
									<label htmlFor="short_description">short description</label>
									<textarea
										rows={6}
										cols={33}
										id="short_description"
										name="short_description"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										className="ring-1 mx-1"
									/>
								</div>
							</>
						)}
					/>
					{/*long description*/}
					<form.Field
						name="long_description"
						children={(field) => (
							<>
								<div className="flex flex-col w-full">
									<label htmlFor="long_description">long description</label>
									<textarea
										rows={6}
										cols={33}
										id="long_description"
										name="long_description"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										className="ring-1 mx-1"
									/>
								</div>
							</>
						)}
					/>
				</div>
				{/*thumbnail*/}
				<form.Field
					name="thumbnail"
					children={(field) => (
						<>
							<div>
								<label htmlFor="thumbnail">
									thumbnail (to describe the data as image)
								</label>
								<input
									id="thumbnail"
									name="thumbnail"
									type="file"
									onBlur={field.handleBlur}
									onChange={(e) => {
										const file = e.target.files?.[0] || null;
										field.handleChange(file);
									}}
									className="ring-1 ml-2 w-80"
								/>
							</div>
						</>
					)}
				/>

				{/* data placeholder*/}
				<div className="text-3xl my-12 text-center italic">
					data placeholder
				</div>
				{/*images*/}
				<form.Field
					name="images"
					children={(field) => (
						<>
							<div>
								<label htmlFor="images">
									images (to describe the data as image)
								</label>
								<input
									id="images"
									name="images"
									type="file"
									onBlur={field.handleBlur}
									onChange={(e) => {
										const files = e.target.files
											? Array.from(e.target.files)
											: [];
										field.handleChange(files);
									}}
									multiple
									className="ring-1 ml-2 w-80"
								/>
							</div>
						</>
					)}
				/>
				{/*side-by-side notes and tags*/}
				<div className="flex justify-between w-full gap-4">
					{/*notes*/}
					<form.Field
						name="notes"
						children={(field) => (
							<>
								<div className="flex flex-col w-full">
									<label htmlFor="notes">notes</label>
									<textarea
										rows={6}
										cols={33}
										id="notes"
										name="notes"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										className="ring-1 mx-1"
									/>
								</div>
							</>
						)}
					/>
					{/*tags*/}
					<form.Field
						name="tags"
						children={(field) => (
							<>
								<div className="flex flex-col w-full">
									<label htmlFor="tags">tags</label>
									<textarea
										rows={6}
										cols={33}
										id="tags"
										name="tags"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										className="ring-1 mx-1"
									/>
								</div>
							</>
						)}
					/>
				</div>
				<button type="submit" className="my-4 text-2xl">
					add new credential data
				</button>
			</form>
		</main>
	);
}
