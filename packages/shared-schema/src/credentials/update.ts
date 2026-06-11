import z from "zod";

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
	value: z.string().trim().min(1, "information text can not be empty"),
});

const dataBlockSchema = z.discriminatedUnion("type", [
	singleLabelSchema,
	keyValueSchema,
	informationSchema,
]);

export const credentialsUpdateSchema = z.object({
	_csrf: z
		.string()
		.min(1, "csrf token can not be missing. please reload the page"),
	title: z
		.string()
		.trim()
		.min(4, "credentials title need to be at least 4 characters")
		.max(30, "credentials title can not be greater than 30 characters"),
	type: z.string().min(1, "type is required"),
	short_description: z
		.string()
		.min(5, "credentials short description can not be less than 5 characters")
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
	images: z
		.array(z.any())
		.max(6, "maximum 6 images allowed")
		.default([])
		.nullable()
		.optional(),
	existing_images_keep: z.string().optional().nullable(),
	notes: z.string().trim().nullable().optional(),
	tags: z.string().trim().nullable().optional(),
});
