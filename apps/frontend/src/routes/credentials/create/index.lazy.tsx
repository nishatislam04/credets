import { credentialsCreateSchema } from "@credets/shared-schema/credentials/create";
import type { CredentialCreateType } from "@credets/shared-types/credentials/create";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, X } from "lucide-react";
import { useRef, useState } from "react";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "#/components/ui/field";
import { gooeyToast } from "#/components/ui/goey-toaster";
import { CredetsImage } from "#/components/ui/image";
import { Item, ItemContent, ItemDescription, ItemTitle } from "#/components/ui/item";
import { RichTextEditor } from "#/components/ui/rich-text-editor";
import { ImagePreviewOverlay } from "#/routes/credentials/-components/image-preview-overlay";
import { type TypePathEntry, TypeSelector } from "#/routes/credentials/-components/TypeSelector";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TagInput } from "@/components/ui/tag-input";
import { Textarea } from "@/components/ui/textarea";
import { createCredentialAction } from "./-actions/createCredentialAction";
import { createCredentialValidation } from "./-actions/createCredentialValidation";
import { DataBlock } from "./-components/Datablock";

export const Route = createLazyFileRoute("/credentials/create/")({
	component: RouteComponent,
});

const defaultCredentialValues = (csrfToken: string): CredentialCreateType => ({
	_csrf: csrfToken || "",
	title: "",
	type: "",
	types: [],
	short_description: undefined,
	long_description: undefined,
	thumbnail: null,
	data: [{ type: "single_label", value: "" }],
	images: [],
	notes: "",
	tags: "",
});

function RouteComponent() {
	const csrfToken = Route.useLoaderData() as string;

	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const thumbnailInputRef = useRef<HTMLInputElement>(null);
	const [previewSrc, setPreviewSrc] = useState<string | null>(null);
	const [focusBlockIndex, setFocusBlockIndex] = useState<number | null>(null);

	const form = useForm({
		defaultValues: defaultCredentialValues(csrfToken),
		validators: {
			onSubmit: credentialsCreateSchema,
			onSubmitAsync: async ({ value }) => {
				try {
					const data = await createCredentialValidation(value);
					if (!data.success && data.type === "form-validation") {
						gooeyToast.error(data.message || "Validation failed", {
							description: "Please fix all the form errors and try again.",
						});
						return { fields: data.errors };
					}
					if (!data.success) {
						gooeyToast.error(
							data.message || "something went wrong on server side while validating data",
						);
						return {
							message: "something went wrong on server side while validating credential data",
						};
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
			await gooeyToast.promise(createCredentialAction(value), {
				loading: "creating...",
				success: "created a new credential",
				error: "failed to create the credential",
				description: {
					success: "the new credential has been saved on the list",
					error: "Please try again later.",
				},
				action: {
					success: {
						label: "Go back to listings",
						onClick: async () => {
							queryClient.invalidateQueries({ queryKey: ["credentials-listings"] });
							queryClient.invalidateQueries({ queryKey: ["types_listings"] });
							queryClient.invalidateQueries({ queryKey: ["type_children"] });
							navigate({
								to: "/credentials",
							});
						},
					},
				},
			});
			form.reset(form.state.values);
		},
	});

	return (
		<main>
			<div className="relative flex items-center justify-center my-8 mb-18">
				<Link
					to="/credentials"
					className="absolute left-0 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground/50 hover:text-foreground transition-colors ml-4 md:ml-12"
				>
					<ArrowLeft className="size-3 transition-transform duration-200 group-hover:-translate-x-0.5" />
					Back to listings
				</Link>
				<p className="capitalize text-4xl text-center">creadential create form</p>
			</div>

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
									<FieldLabel htmlFor="title">
										Title <span className="text-destructive -ml-2">*</span>
									</FieldLabel>
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
					{/* types field - using hierarchical TypeSelector */}
					<form.Field
						name="type"
						children={(field) => {
							const isInvalid = !field.state.meta.isValid;
							return (
								<Field orientation="responsive" data-invalid={isInvalid}>
									<FieldContent flex={false}>
										<FieldLabel className="w-15 mt-2" htmlFor="type">
											types <span className="text-destructive -ml-2">*</span>
										</FieldLabel>
										{isInvalid && <FieldError errors={field.state.meta.errors} />}
									</FieldContent>
									<div className="flex-1">
										{/* Sync hidden type field with leaf value */}
										<Input
											id="type"
											value={field.state.value}
											type="hidden"
											aria-invalid={isInvalid}
										/>
										<form.Field
											name="types"
											mode="array"
											children={(typesField) => (
												<TypeSelector
													types={typesField.state.value as TypePathEntry[]}
													onTypesChange={(newTypes) => {
														typesField.handleChange(newTypes);
														// Sync the leaf type value to the parent "type" field
														const leafValue =
															newTypes.length > 0 ? newTypes[newTypes.length - 1].value : "";
														field.handleChange(leafValue);
													}}
												/>
											)}
										/>
									</div>
								</Field>
							);
						}}
					/>
					{/*side-by-side short and long desciption*/}
					<form.Field
						name="short_description"
						children={(field) => {
							const isInvalid = !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor="short_description">Short description</FieldLabel>
									<RichTextEditor
										value={field.state.value}
										onChange={(val) => field.handleChange(val)}
										placeholder="Write a short description..."
										minHeight="200px"
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
									<RichTextEditor
										value={field.state.value}
										onChange={(val) => field.handleChange(val)}
										placeholder="Write a detailed description..."
										minHeight="300px"
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					/>
					{/*</div>*/}
					{/* Data array */}
					<div className="my-6">
						<h2 className="text-lg font-semibold mb-3">Data items</h2>
						<form.Field
							name="data"
							mode="array"
							children={(arrayField) => (
								<div className="space-y-4">
									{arrayField.state.value.length === 0 && (
										<Item className="my-8">
											<ItemContent className="items-center">
												<ItemTitle className="capitalize text-2xl font-semibold">
													no data block found
												</ItemTitle>
												<ItemDescription>
													click below action button to create a data block
												</ItemDescription>
											</ItemContent>
										</Item>
									)}
									{arrayField.state.value.length > 0 &&
										arrayField.state.value.map((data, idx) => (
											<DataBlock
												key={idx}
												item={data}
												idx={idx}
												form={form}
												shouldFocus={focusBlockIndex === idx}
												onFocused={() => setFocusBlockIndex(null)}
												onRemove={() => arrayField.removeValue(idx)}
											/>
										))}

									<div className="grid grid-cols-3 gap-2">
										<Button
											type="button"
											variant="secondary"
											onClick={() => {
												const newIdx = arrayField.state.value.length;
												setFocusBlockIndex(newIdx);
												arrayField.pushValue({ type: "single_label", value: "" });
											}}
										>
											+ Single label
										</Button>
										<Button
											type="button"
											variant="secondary"
											onClick={() => {
												const newIdx = arrayField.state.value.length;
												setFocusBlockIndex(newIdx);
												arrayField.pushValue({ type: "key_value", key: "", value: "" });
											}}
										>
											+ Key / Value
										</Button>
										<Button
											type="button"
											variant="secondary"
											onClick={() => {
												const newIdx = arrayField.state.value.length;
												setFocusBlockIndex(newIdx);
												arrayField.pushValue({ type: "information", value: "" });
											}}
										>
											+ Information
										</Button>
									</div>
								</div>
							)}
						/>
					</div>
					{/* Thumbnail and images side-by side */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<form.Field
							name="thumbnail"
							children={(field) => {
								const isinvalid = !field.state.meta.isValid;
								const file = field.state.value;
								const previewUrl = file ? URL.createObjectURL(file) : null;

								const handleRemoveThumbnail = () => {
									field.handleChange(null);
									// Clear the file input element so the filename doesn't persist
									if (thumbnailInputRef.current) {
										thumbnailInputRef.current.value = "";
									}
								};

								return (
									<Field data-invalid={isinvalid}>
										<FieldLabel htmlFor="thumbnail">Thumbnail (image)</FieldLabel>

										{/* Preview selected thumbnail */}
										{previewUrl && (
											<div className="mb-3 max-w-48">
												<div className="group relative aspect-square overflow-hidden rounded-lg border bg-muted/20">
													<button
														type="button"
														onClick={() => setPreviewSrc(previewUrl)}
														className="size-full cursor-pointer border-0 bg-transparent p-0"
													>
														<CredetsImage
															src={previewUrl}
															alt="Thumbnail preview"
															unoptimized
															className="size-full object-cover transition-transform duration-200 hover:scale-105"
														/>
													</button>
													<button
														type="button"
														onClick={handleRemoveThumbnail}
														className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/50 text-white/80 opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer border-0"
														aria-label="Remove thumbnail"
													>
														<X className="size-3" />
													</button>
												</div>
												{file?.name && (
													<p className="mt-1 truncate text-xs text-muted-foreground">{file.name}</p>
												)}
											</div>
										)}

										<Input
											ref={thumbnailInputRef}
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
											!["image/jpg", "image/jpeg", "image/png", "image/webp"].includes(file.type)
										) {
											return { message: `File "${file.name}" is not a valid image type` };
										}
									}
									return undefined;
								},
							}}
							children={(field) => {
								const isinvalid = !field.state.meta.isValid;
								const files: File[] = field.state.value ?? [];

								return (
									<Field data-invalid={isinvalid}>
										<FieldLabel htmlFor="images">Images (multi)</FieldLabel>

										{/* Image preview grid */}
										{files.length > 0 && (
											<div className="mb-3">
												<p className="text-xs text-muted-foreground mb-2">
													{files.length} image{files.length > 1 ? "s" : ""} selected
												</p>
												<div className="grid grid-cols-3 gap-2">
													{files.map((file, index) => {
														const fileUrl = URL.createObjectURL(file);
														return (
															<div key={`${file.name}-${index}`} className="group relative">
																<div className="aspect-square overflow-hidden rounded-lg border bg-muted/20">
																	<button
																		type="button"
																		onClick={() => setPreviewSrc(fileUrl)}
																		className="size-full cursor-pointer border-0 bg-transparent p-0"
																	>
																		<CredetsImage
																			src={fileUrl}
																			alt={file.name}
																			unoptimized
																			className="size-full object-cover transition-transform duration-200 hover:scale-105"
																		/>
																	</button>
																	<button
																		type="button"
																		className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/50 text-white/80 opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer border-0"
																		onClick={() => {
																			const updated = files.filter((_, i) => i !== index);
																			field.handleChange(updated);
																		}}
																		aria-label="Remove image"
																	>
																		<X className="size-3" />
																	</button>
																</div>
																<p className="mt-1 truncate text-xs text-muted-foreground">
																	{file.name}
																</p>
															</div>
														);
													})}
												</div>
											</div>
										)}

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
										{isinvalid && <FieldError errors={field.state.meta.errors} />}
									</Field>
								);
							}}
						/>
					</div>
					{/* Notes & Tags side by side */}
					<div className="my-8 space-y-6">
						<form.Field
							name="notes"
							children={(field) => {
								const isInvalid = !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor="notes">Notes</FieldLabel>
										<FieldDescription>optional note about this credential</FieldDescription>
										<RichTextEditor
											value={field.state.value}
											onChange={(val) => field.handleChange(val)}
											placeholder="Add any notes..."
											minHeight="200px"
										/>
										{isInvalid && <FieldError errors={field.state.meta.errors} />}
									</Field>
								);
							}}
						/>
						<form.Field
							name="tags"
							children={(field) => {
								const isInvalid = !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor="tags">Tags</FieldLabel>
										<FieldDescription>
											Press Enter or comma (,) to add a tag. up to 15 tags allowed.
										</FieldDescription>

										<TagInput
											id="tags"
											value={field.state.value ?? ""}
											onBlur={field.handleBlur}
											onChange={(newTags) => field.handleChange(newTags)}
											placeholder="e.g. database, production, aws"
											aria-invalid={isInvalid}
											maxTags={15}
										/>
										{isInvalid && <FieldError errors={field.state.meta.errors} />}
									</Field>
								);
							}}
						/>
					</div>
					<form.Subscribe
						selector={(state) => [state.canSubmit, state.isSubmitting, state.isPristine]}
						children={([canSubmit, isSubmitting, isPristine]) => (
							<div className="w-full flex flex-col items-center gap-3">
								{/* Validation error hint — fixed min-height prevents layout shift */}
								<div className="min-h-[44px]">
									{!canSubmit && !isSubmitting && (
										<div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/[0.04] px-4 py-2.5 text-sm text-destructive/80">
											<span className="size-1.5 rounded-full bg-destructive/60 shrink-0" />
											<span>
												There are validation errors that need to be fixed before submitting.
											</span>
										</div>
									)}
								</div>
								<Button
									type="submit"
									size="lg"
									className="my-3 px-12 py-4"
									disabled={!canSubmit || isPristine}
								>
									{isSubmitting ? "..." : "Submit"}
								</Button>
							</div>
						)}
					/>
				</FieldGroup>
			</Form>

			{/* ── Image preview overlay ── */}
			{previewSrc && <ImagePreviewOverlay src={previewSrc} onClose={() => setPreviewSrc(null)} />}
		</main>
	);
}
