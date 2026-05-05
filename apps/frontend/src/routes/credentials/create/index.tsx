import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/credentials/create/")({
	component: RouteComponent,
});

// const credentialsSchema = z.object({
// 	title: z
// 		.string()
// 		.trim()
// 		.min(4, "credentials title need to be at least 4 characters")
// 		.max(30, "credentials title can not be grater than 30 characters"),
// 	short_description: z
// 		.string()
// 		.min(5, "credentials short description can not be less than 5 characters")
// 		.max(
// 			50,
// 			"credentials short description can not be grater than 50 characters",
// 		)
// 		.optional(),
// 	long_description: z
// 		.string()
// 		.min(5, "credentials long description can not be less than 5 characters")
// 		.optional(),
// 	thumbnail: z
// 		.file()
// 		.max(3000000, "credentials thumbnail can not be larger than 3MB")
// 		.mime(["image/png", "image/jpg", "image/jpeg", "image/webp"])
// 		.optional(),
// 	data: z.string(),
// 	images: z.string().optional(),
// 	notes: z.string().optional(),
// 	tags: z.string().optional(),
// });

// type CredentialCreateType = {
// 	title: string;
// 	short_description: string;
// 	long_description: string;
// 	thumbnail: File | string;
// 	data: string;
// 	images: string;
// 	notes: string;
// 	tags: string;
// };

const defaultCredentialValue = {
	title: "",
	// short_description: "",
	// long_description: "",
	// thumbnail: "",
	// data: "",
	// images: "",
	// notes: "",
	// tags: "",
};

function RouteComponent() {
	const form = useForm({
		defaultValues: defaultCredentialValue,
		// validators: credentialsSchema,
		onSubmit: async ({ value }) => {
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
			>
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
								/>
							</div>
						</>
					)}
				/>
			</form>
		</main>
	);
}
