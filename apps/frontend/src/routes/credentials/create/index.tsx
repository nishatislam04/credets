import { credentialsCreateSchema } from "@credets/shared-schema/credentials/create";
import type { CredentialCreateType } from "@credets/shared-types/credentials/create";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { Field, FieldError, FieldGroup, FieldLabel } from "#/components/ui/field";
import { gooeyToast } from "#/components/ui/goey-toaster";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createCredentialAction } from "./-actions/createCredentialAction";
import { getCSRFtoken } from "./-actions/getCSRFtoken";
import { DataBlock } from "./-components/Datablock";

export const Route = createFileRoute("/credentials/create/")({
	component: RouteComponent,
});

const defaultCredentialValues = (csrfToken: string): CredentialCreateType => ({
	_csrf: csrfToken || "",
	title: "",
	short_description: undefined,
	long_description: undefined,
	thumbnail: null,
	data: [{ type: "single_label", value: "" }],
	images: [],
	notes: "",
	tags: "",
});

function RouteComponent() {
	const { data: csrfToken, isLoading: csrfTokenLoading } = useQuery({
		queryKey: ["_csrf"],
		queryFn: async () => {
			try {
				const res = await getCSRFtoken();
				return res.data.token;
			} catch (error) {
				gooeyToast.error(
					error instanceof Error ? error.message : "failed to fetch csrf token",
				);
			}
		},
	});

	const form = useForm({
		defaultValues: defaultCredentialValues(csrfToken),
		validators: {
			onBlur: credentialsCreateSchema,
			onSubmitAsync: async ({ value }) => {
				try {
					const data = await createCredentialAction(value);

					if (!data.success && data.type === "form-validation") {
						gooeyToast.error("Validation failed", {
							description: "Please fix all the form errors and try again.",
						});

						return { fields: data.errors };
					}

					if (!data.success) {
						gooeyToast.error(data.message);
						return { message: "something went wrong on server side" };
					}
				} catch (error) {
					gooeyToast.error("something went on wrong", {
						description:
							error instanceof Error
								? error.message
								: "something went wrong on our server. please try again later",
					});

					return { message: "something went wrong" };
				}
			},
		},

		onSubmit: async ({ value }) => {
			gooeyToast.promise(createCredentialAction(value), {
				loading: "creating...",
				success: "created a new credential",
				error: "failed to create the credential",
				description: {
					success: "the new credential has been saved on the list",
					error: "Please try again later.",
				},
				action: {
					error: {
						label: "Retry",
						onClick: () => null,
					},
					success: {
						label: "go back to listings",
						onClick: () => null,
					},
				},
			});
		},
	});

	if (csrfTokenLoading) return <p>fetching csrf token. please wait a moment</p>;

	return (
		<main>
			<p className="capitalize text-4xl text-center my-8 mb-18">
				creadential create form
			</p>

			<Form
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
				className="px-4 md:px-12"
			>
				<FieldGroup>
					{/* csrf */}
					<form.Field
						name="_csrf"
						children={(field) => {
							const isInvalid = !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<Input
										id="_csrf"
										value={field.state.value}
										type="hidden"
										aria-invalid={isInvalid}
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					/>

					{/*title*/}
					<form.Field
						name="title"
						children={(field) => {
							const isInvalid = !field.state.meta.isValid;

							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor="title">Title</FieldLabel>
									<Input
										id="title"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Enter credential title"
										aria-invalid={isInvalid}
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					/>
					{/*side-by-side short and long desciption*/}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
						<form.Field
							name="short_description"
							children={(field) => {
								const isInvalid = !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor="short_description">Short description</FieldLabel>
										<Textarea
											id="short_description"
											value={field.state.value ?? ""}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											rows={8}
											placeholder="Brief summary"
											aria-invalid={isInvalid}
										/>
										{isInvalid && <FieldError errors={field.state.meta.errors} />}
									</Field>
								);
							}}
						/>
						<form.Field
							name="long_description"
							children={(field) => {
								const isInvalid = !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor="long_description">Long description</FieldLabel>
										<Textarea
											id="long_description"
											value={field.state.value ?? ""}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											rows={8}
											placeholder="Detailed description"
											aria-invalid={isInvalid}
										/>
										{isInvalid && <FieldError errors={field.state.meta.errors} />}
									</Field>
								);
							}}
						/>
					</div>

					{/* Thumbnail file */}
					<form.Field
						name="thumbnail"
						children={(field) => {
							const isinvalid = !field.state.meta.isValid;
							return (
								<Field data-invalid={isinvalid}>
									<FieldLabel htmlFor="thumbnail">Thumbnail (image)</FieldLabel>
									<Input
										id="thumbnail"
										type="file"
										accept="image/jpeg,image/png,image/webp"
										onBlur={field.handleBlur}
										onChange={(e) => {
											const file = e.target.files?.[0] || null;
											field.handleChange(file);
										}}
										aria-invalid={isinvalid}
									/>
									{isinvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					/>

					{/* Data array */}
					<div className="my-6">
						<h2 className="text-lg font-semibold mb-3">Data items</h2>
						<form.Field
							name="data"
							mode="array"
							children={(arrayField) => (
								<div className="space-y-4">
									{arrayField.state.value.map((data, idx) => (
										<DataBlock
											key={`${crypto.randomUUID()}`}
											item={data}
											idx={idx}
											form={form}
											onRemove={() => arrayField.removeValue(idx)}
										/>
									))}

									<div className="grid grid-cols-3 gap-2">
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
						validators={{
							onChange: ({ value }) => {
								if (!value || value.length === 0) return undefined;

								// MAX IMAGES CHECK
								if (value.length > 6) {
									return { message: "Maximum 6 images allowed" };
								}

								// Check each file
								for (const file of value) {
									if (file.size > 3_000_000) {
										return { message: `File "${file.name}" is larger than 3MB` };
									}
									if (
										!["image/jpg", "image/jpeg", "image/png", "image/webp"].includes(
											file.type,
										)
									) {
										return { message: `File "${file.name}" is not a valid image type` };
									}
								}
								return undefined;
							},
						}}
						children={(field) => {
							const isinvalid = !field.state.meta.isValid;
							return (
								<Field data-invalid={isinvalid}>
									<FieldLabel htmlFor="images">Images (multi)</FieldLabel>
									<Input
										id="images"
										type="file"
										multiple
										accept="image/*"
										onBlur={field.handleBlur}
										onChange={(e) => {
											const newFiles = e.target.files ? Array.from(e.target.files) : [];
											const current = field.state.value ?? [];

											// Prevent exceeding 6 images
											const available = 6 - current.length;
											if (available <= 0) {
												gooeyToast.error("max 6 images support", {
													description: "you can choose only 6 images",
												});
												e.target.value = "";
												return;
											}

											const updated = [...current, ...newFiles];
											field.handleChange(updated);
											e.target.value = "";
										}}
										aria-invalid={isinvalid}
									/>
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
																	const updated = imageFiles.filter(
																		(_, i) => i !== index,
																	);
																	field.handleChange(updated);
																}}
															>
																<Trash2 />
															</Button>
														</li>
													);
												})}
											</ul>
										</div>
									)}
									{isinvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					/>

					{/* Notes & Tags side by side */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
						<form.Field
							name="notes"
							children={(field) => {
								const isinvalid = !field.state.meta.isValid;
								return (
									<Field data-invalid={isinvalid}>
										<FieldLabel htmlFor="notes">Notes</FieldLabel>
										<Textarea
											id="notes"
											value={field.state.value ?? ""}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											rows={10}
											aria-invalid={isinvalid}
										/>
										{isinvalid && <FieldError errors={field.state.meta.errors} />}
									</Field>
								);
							}}
						/>
						<form.Field
							name="tags"
							children={(field) => {
								const isinvalid = !field.state.meta.isValid;
								return (
									<Field data-invalid={isinvalid}>
										<FieldLabel htmlFor="tags">Tags</FieldLabel>
										<Textarea
											id="tags"
											value={field.state.value ?? ""}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											rows={10}
											aria-invalid={isinvalid}
										/>
										{isinvalid && <FieldError errors={field.state.meta.errors} />}
									</Field>
								);
							}}
						/>
					</div>

					<form.Subscribe
						selector={(state) => [state.canSubmit, state.isSubmitting, state.isPristine]}
						children={([canSubmit, isSubmitting, isPristine]) => (
							<Button
								type="submit"
								size="lg"
								className="my-3 flex justify-center items-center w-full"
								disabled={!canSubmit || isPristine}
							>
								{isSubmitting ? "..." : "Submit"}
							</Button>
						)}
					/>
				</FieldGroup>
			</Form>
		</main>
	);
}
