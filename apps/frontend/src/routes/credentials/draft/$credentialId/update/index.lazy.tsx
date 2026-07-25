import type {
	CredentialDetail,
	CredentialImage,
	DataBlockEntry,
} from "@credets/shared-types/credentials/listings";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import {
	createLazyFileRoute,
	useNavigate,
	useRouter,
} from "@tanstack/react-router";
import { ArrowLeft, FileEdit, SaveAll, X } from "lucide-react";
import { lazy, Suspense, useRef, useState } from "react";
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
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "#/components/ui/item";
import { CredentialsShell } from "#/routes/credentials/-components/credentials-shell";
import { ImagePreviewOverlay } from "#/routes/credentials/-components/image-preview-overlay";
import {
	type TypePathEntry,
	TypeSelector,
} from "#/routes/credentials/-components/TypeSelector";
import { DataBlock } from "#/routes/credentials/create/-components/Datablock";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TagInput } from "@/components/ui/tag-input";
import { Textarea } from "@/components/ui/textarea";
import { updateCredentialValidation } from "#/routes/credentials/$credentialId/update/-actions/updateCredentialValidation";
import { DeleteCredentialDialog } from "#/routes/credentials/$credentialId/update/-delete/delete-credential-dialog";
import { updateDraftAction } from "./-actions/updateDraftAction";

const RichTextEditor = lazy(() => import("#/components/ui/rich-text-editor"));

function imageSrc(img: { image_url?: string | null }) {
	return img?.image_url ?? null;
}

/** Convert a flat object (from seed) into typed blocks for editing */
function normalizeDataForEdit(
	data: Record<string, unknown> | DataBlockEntry[],
): DataBlockEntry[] {
	if (!data) return [{ type: "single_label", value: "" }];
	if (Array.isArray(data)) {
		if (data.length === 0) return [{ type: "single_label", value: "" }];
		// Check if it's already typed
		if ("type" in (data[0] ?? {})) return data as DataBlockEntry[];
		// Flat array of objects – convert each to key_value
		return data.flatMap((item) => {
			if (typeof item === "object" && item !== null) {
				return Object.entries(item).map(([key, value]) => ({
					type: "key_value" as const,
					key,
					value: String(value ?? ""),
				}));
			}
			return [];
		});
	}
	// Flat object – convert to key_value blocks
	return Object.entries(data).map(([key, value]) => ({
		type: "key_value" as const,
		key,
		value: String(value ?? ""),
	}));
}

export const Route = createLazyFileRoute("/credentials/draft/$credentialId/update/")({
	component: RouteComponent,
});

function RouteComponent() {
	const data = Route.useLoaderData() as {
		credential: CredentialDetail;
		csrfToken: string;
	};
	const credential = data.credential;
	const csrfToken = data.csrfToken;
	const navigate = useNavigate();
	const router = useRouter();
	const queryClient = useQueryClient();

	// ── Draft intent ref ──
	// undefined = normal update, true = keep as draft, false = publish
	const isDraftIntentRef = useRef<boolean | undefined>(undefined);

	// ── Image state ──
	const existingImages: CredentialImage[] = Array.isArray(credential.images)
		? credential.images
		: [];
	const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
	const [newImages, setNewImages] = useState<File[]>([]);
	const [thumbnailRemoved, setThumbnailRemoved] = useState(false);
	const [previewSrc, setPreviewSrc] = useState<string | null>(null);
	const [focusBlockIndex, setFocusBlockIndex] = useState<number | null>(null);
	const visibleExistingImages = existingImages.filter(
		(img) => !removedImageIds.includes(img.id),
	);

	// ── Initial data blocks ──
	const initialDataBlocks = normalizeDataForEdit(credential.data);

	// Build initial types array from the credential's full type path (root → leaf)
	const initialTypes: TypePathEntry[] =
		Array.isArray(credential.type_path) && credential.type_path.length > 0
			? credential.type_path.map((entry: { value: string; label: string }) => ({
					value: entry.value,
					label: entry.label,
				}))
			: credential.type_value
				? [
						{
							value: credential.type_value,
							label: credential.type_label || credential.type_value,
						},
					]
				: [];

	// ── Form ──
	const form = useForm({
		defaultValues: {
			_csrf: csrfToken || "",
			title: credential.title || "",
			type: credential.type_value || "",
			types: initialTypes,
			short_description: credential.short_description || "",
			long_description: credential.long_description || "",
			thumbnail: null as File | null,
			data: initialDataBlocks,
			notes: credential.notes || "",
			tags: Array.isArray(credential.tags)
				? credential.tags.join(", ")
				: (credential.tags as string) || "",
		},
		validators: {
			onSubmitAsync: async ({ value }) => {
				try {
					const data = await updateCredentialValidation({
						...value,
						credentialId: credential.id,
						newImages,
						existingImagesKeep: visibleExistingImages.map((img) => img.id),
					});

					if (!data.success && data.type === "form-validation") {
						gooeyToast.error(data.message || "Validation failed", {
							description: "Please fix all the form errors and try again.",
						});
						return { fields: data.errors };
					}

					if (!data.success) {
						gooeyToast.error(
							data.message ||
								"something went wrong on server side while validating data",
						);
						return {
							message:
								"something went wrong on server side while validating credential data",
						};
					}
				} catch (error) {
					gooeyToast.error("something went wrong", {
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
			const draftIntent = isDraftIntentRef.current;

			const existingImagesKeep = visibleExistingImages.map((img) => img.id);
			const updatePromise = updateDraftAction({
				...value,
				credentialId: credential.id,
				newImages,
				existingImagesKeep,
				removeThumbnail: thumbnailRemoved,
				is_draft: draftIntent,
			}).then(async () => {
				queryClient.invalidateQueries({ queryKey: ["credentials-listings"] });
				queryClient.invalidateQueries({ queryKey: ["draft-listings"] });
				queryClient.invalidateQueries({ queryKey: ["types_listings"] });
				queryClient.invalidateQueries({ queryKey: ["type_children"] });
				await router.invalidate();
			});

			await gooeyToast.promise(updatePromise, {
				loading: "updating...",
				success: "draft updated",
				error: "failed to update the draft",
				description: {
					success: "the draft has been updated successfully",
					error: "Please try again later.",
				},
				action: {
					success: {
						label:
							draftIntent === false
								? "view in listings"
								: "back to drafts",
						onClick: async () => {
							if (draftIntent === false) {
								navigate({ to: "/credentials" });
							} else {
								navigate({ to: "/credentials/draft" });
							}
						},
					},
				},
			});

			form.reset(form.state.values);
			isDraftIntentRef.current = undefined;
		},
	});

	return (
		<CredentialsShell>
			<main>
				<div className="relative flex items-center justify-center my-8 mb-8">
					<button
						type="button"
						onClick={() => navigate({ to: "/credentials/draft" })}
						className="absolute left-0 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground/50 hover:text-foreground transition-colors ml-3 md:ml-12 cursor-pointer"
					>
						<ArrowLeft className="size-6" />
					</button>
					<p className="capitalize text-4xl text-center">
						Edit draft
					</p>
				</div>

				<Form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					className="px-4 md:px-12"
				>
					<FieldGroup>
						{/* csrf hidden */}
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
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						/>
						{/* Title */}
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
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						/>
						{/* Type field - using hierarchical TypeSelector */}
						<form.Field
							name="type"
							children={(field) => {
								const isInvalid = !field.state.meta.isValid;
								return (
									<Field orientation="responsive" data-invalid={isInvalid}>
										<FieldContent className="flex-none">
											<FieldLabel className="w-15 mt-2" htmlFor="type">
												types <span className="text-destructive -ml-2">*</span>
											</FieldLabel>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</FieldContent>
										<div className="flex-1 w-full">
											<Input
												id="type"
												value={field.state.value}
												type="hidden"
												aria-invalid={isInvalid}
											/>
											<form.Field
												name="types"
												mode="array"
												children={(typesField) => {
													const isTypesInvalid = !typesField.state.meta.isValid;
													return (
														<>
															<TypeSelector
																types={
																	typesField.state.value as TypePathEntry[]
																}
																onTypesChange={(newTypes) => {
																	typesField.handleChange(newTypes);
																	const leafValue =
																		newTypes.length > 0
																			? newTypes[newTypes.length - 1].value
																			: "";
																	field.handleChange(leafValue);
																}}
															/>
															{isTypesInvalid && (
																<FieldError
																	errors={typesField.state.meta.errors}
																/>
															)}
														</>
													);
												}}
											/>
										</div>
									</Field>
								);
							}}
						/>
						{/* Short & Long description side by side */}
						<form.Field
							name="short_description"
							children={(field) => {
								const isInvalid = !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor="short_description">
											Short description
										</FieldLabel>
										<Textarea
											id="short_description"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="Write a short description..."
											aria-invalid={isInvalid}
										/>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
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
										<FieldLabel htmlFor="long_description">
											Long description
										</FieldLabel>
										<Suspense
											fallback={
												<div
													className="overflow-hidden rounded-xl border border-input bg-background"
													style={{ height: "358px" }}
												>
													<div className="flex size-full items-center justify-center">
														<div className="flex flex-col items-center gap-3">
															<div className="size-8 animate-spin rounded-full border-2 border-border border-t-foreground/40" />
															<p className="text-sm text-muted-foreground/50 font-medium tracking-wide">
																Loading editor
															</p>
														</div>
													</div>
												</div>
											}
										>
											<RichTextEditor
												value={field.state.value}
												onChange={(val) => field.handleChange(val)}
												placeholder="Write a detailed description..."
												minHeight="300px"
											/>
										</Suspense>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						/>
						{/* Data blocks */}
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
													arrayField.pushValue({
														type: "single_label",
														value: "",
													});
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
													arrayField.pushValue({
														type: "key_value",
														key: "",
														value: "",
													});
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
													arrayField.pushValue({
														type: "information",
														value: "",
													});
												}}
											>
												+ Information
											</Button>
										</div>
									</div>
								)}
							/>
						</div>{" "}
						{/* ── Thumbnail and Images ── */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
							{/* Thumbnail */}
							<form.Field
								name="thumbnail"
								children={(field) => {
									const isInvalid = !field.state.meta.isValid;
									const existingThumbnailSrc = credential.thumbnail_url || null;
									const showExisting =
										!field.state.value &&
										existingThumbnailSrc &&
										!thumbnailRemoved;
									const showPreview = field.state.value;
									const previewUrl = showPreview
										? URL.createObjectURL(field.state.value)
										: null;

									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor="thumbnail">
												Thumbnail (image)
											</FieldLabel>

											{showExisting && (
												<div className="mb-3 max-w-48">
													<div className="group relative aspect-square overflow-hidden rounded-lg border bg-muted/20">
														<button
															type="button"
															onClick={() =>
																setPreviewSrc(existingThumbnailSrc!)
															}
															className="size-full cursor-pointer border-0 bg-transparent p-0"
														>
															<CredetsImage
																src={existingThumbnailSrc!}
																alt="Current thumbnail"
																width={192}
																height={192}
																className="size-full object-cover transition-transform duration-200 hover:scale-105"
															/>
														</button>
														<button
															type="button"
															onClick={() => setThumbnailRemoved(true)}
															className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/50 text-white/80 opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer border-0"
															aria-label="Remove thumbnail"
														>
															<X className="size-3" />
														</button>
													</div>
													<p className="mt-1 truncate text-xs text-muted-foreground">
														Existing thumbnail
													</p>
												</div>
											)}

											{showPreview && previewUrl && (
												<div className="mb-3 max-w-48">
													<div className="group relative aspect-square overflow-hidden rounded-lg border bg-muted/20">
														<button
															type="button"
															onClick={() => setPreviewSrc(previewUrl)}
															className="size-full cursor-pointer border-0 bg-transparent p-0"
														>
															<CredetsImage
																src={previewUrl}
																alt="New thumbnail"
																unoptimized
																className="size-full object-cover transition-transform duration-200 hover:scale-105"
															/>
														</button>
														<button
															type="button"
															onClick={() => {
																field.handleChange(null);
															}}
															className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/50 text-white/80 opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer border-0"
															aria-label="Remove thumbnail"
														>
															<X className="size-3" />
														</button>
													</div>
													{field.state.value?.name && (
														<p className="mt-1 truncate text-xs text-muted-foreground">
															{field.state.value.name}
														</p>
													)}
												</div>
											)}

											{thumbnailRemoved && !showPreview && (
												<p className="text-xs text-destructive mb-2">
													Thumbnail will be removed on save ·{" "}
													<button
														type="button"
														onClick={() => setThumbnailRemoved(false)}
														className="underline cursor-pointer border-0 bg-transparent text-muted-foreground hover:text-foreground"
													>
														Undo
													</button>
												</p>
											)}

											<Input
												id="thumbnail"
												type="file"
												accept="image/jpeg,image/png,image/webp"
												onBlur={field.handleBlur}
												onChange={(e) => {
													const file = e.target.files?.[0] || null;
													field.handleChange(file);
													if (file) setThumbnailRemoved(false);
												}}
												aria-invalid={isInvalid}
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							/>

							{/* Images */}
							<Field>
								<FieldLabel htmlFor="new-images">Images (multi)</FieldLabel>

								{visibleExistingImages.length > 0 && (
									<div className="mb-3">
										<p className="text-xs text-muted-foreground mb-2">
											Existing images ({visibleExistingImages.length})
										</p>
										<div className="grid grid-cols-3 gap-2">
											{visibleExistingImages.map((img) => {
												const src = imageSrc(img);
												return (
													<div key={img.id} className="group relative">
														<div className="aspect-square overflow-hidden rounded-lg border bg-muted/20">
															{src ? (
																<button
																	type="button"
																	onClick={() => setPreviewSrc(src)}
																	className="size-full cursor-pointer border-0 bg-transparent p-0"
																>
																	<CredetsImage
																		src={src}
																		alt=""
																		layout="fullWidth"
																		className="size-full object-cover transition-transform duration-200 hover:scale-105"
																	/>
																</button>
															) : (
																<div className="flex size-full items-center justify-center text-muted-foreground/40 text-xs">
																	No data
																</div>
															)}
															<button
																type="button"
																className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/50 text-white/80 opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer border-0"
																onClick={() => {
																	setRemovedImageIds((prev) => [
																		...prev,
																		img.id,
																	]);
																}}
																aria-label="Remove image"
															>
																<X className="size-3" />
															</button>
														</div>
														<p className="mt-1 truncate text-xs text-muted-foreground">
															Image #{img.id.slice(0, 6)}
														</p>
													</div>
												);
											})}
										</div>
									</div>
								)}

								{removedImageIds.length > 0 && (
									<p className="text-xs text-destructive mb-2">
										{removedImageIds.length} image
										{removedImageIds.length > 1 ? "s" : ""} will be removed on
										save
									</p>
								)}

								<Input
									id="new-images"
									type="file"
									multiple
									accept="image/*"
									onChange={(e) => {
										const files = e.target.files
											? Array.from(e.target.files)
											: [];
										const available =
											6 - visibleExistingImages.length - newImages.length;

										if (available <= 0) {
											gooeyToast.error("max 6 images support", {
												description: "you can have up to 6 images total",
											});
											e.target.value = "";
											return;
										}

										const toAdd = files.slice(0, available);
										if (toAdd.length < files.length) {
											gooeyToast.error("max 6 images support", {
												description: `Only ${available} more image(s) allowed`,
											});
										}

										setNewImages((prev) => [...prev, ...toAdd]);
										e.target.value = "";
									}}
								/>

								{newImages.length > 0 && (
									<div className="mt-3">
										<p className="text-xs text-muted-foreground mb-2">
											New images ({newImages.length})
										</p>
										<div className="grid grid-cols-3 gap-2">
											{newImages.map((file, index) => {
												const fileUrl = URL.createObjectURL(file);
												return (
													<div
														key={`${file.name}-${index}`}
														className="group relative"
													>
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
																	setNewImages((prev) =>
																		prev.filter((_, i) => i !== index),
																	);
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
							</Field>
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
											<FieldDescription>
												optional note about this credential
											</FieldDescription>
											<Suspense
												fallback={
													<div
														className="overflow-hidden rounded-xl border border-input bg-background"
														style={{ height: "358px" }}
													>
														<div className="flex size-full items-center justify-center">
															<div className="flex flex-col items-center gap-3">
																<div className="size-8 animate-spin rounded-full border-2 border-border border-t-foreground/40" />
																<p className="text-sm text-muted-foreground/50 font-medium tracking-wide">
																	Loading editor
																</p>
															</div>
														</div>
													</div>
												}
											>
												<RichTextEditor
													value={field.state.value}
													onChange={(val) => field.handleChange(val)}
													placeholder="Add any notes..."
													minHeight="200px"
												/>
											</Suspense>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
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
												Press Enter or comma (,) to add a tag. up to 15 tags
												allowed.
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
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							/>
						</div>
						{/* Submit */}
						<form.Subscribe
							selector={(state) => [
								state.canSubmit,
								state.isSubmitting,
								state.isPristine,
							]}
							children={([canSubmit, isSubmitting, isPristine]) => (
								<div className="flex flex-col items-center gap-3 my-3">
									<div className="min-h-[44px]">
										{!canSubmit && !isSubmitting && (
											<div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/[0.04] px-4 py-2.5 text-sm text-destructive/80">
												<span className="size-1.5 rounded-full bg-destructive/60 shrink-0" />
												<span>
													There are validation errors that need to be fixed
													before submitting.
												</span>
											</div>
										)}
									</div>
									<div className="flex items-center justify-center gap-4">
										<Button
											type="button"
											size="lg"
											className="gap-2 px-8 py-4"
											disabled={!canSubmit || isPristine}
											onClick={() => {
												isDraftIntentRef.current = false;
												form.handleSubmit();
											}}
										>
											<SaveAll className="size-4" />
											{isSubmitting ? "..." : "Save"}
										</Button>

										<Button
											type="button"
											variant="secondary"
											size="lg"
											className="gap-2 px-8 py-4"
											disabled={!canSubmit || isPristine}
											onClick={() => {
												isDraftIntentRef.current = true;
												form.handleSubmit();
											}}
										>
											<FileEdit className="size-4" />
											{isSubmitting ? "..." : "Update & Draft"}
										</Button>

										<DeleteCredentialDialog
											credentialId={credential.id}
											credentialTitle={credential.title}
											csrfToken={csrfToken}
										/>
									</div>
								</div>
							)}
						/>
					</FieldGroup>
				</Form>

				{/* ── Image preview overlay ── */}
				{previewSrc && (
					<ImagePreviewOverlay
						src={previewSrc}
						onClose={() => setPreviewSrc(null)}
					/>
				)}
			</main>
		</CredentialsShell>
	);
}
