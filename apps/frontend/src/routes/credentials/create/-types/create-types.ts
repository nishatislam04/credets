import z from "zod";

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

export const credentialsCreateSchema = z.object({
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
	images: z.array(z.any()).default([]).nullable().optional(), // we are validating size on the element itself!
	notes: z.string().trim().optional(),
	tags: z.string().trim().optional(),
});

export type CredentialCreateType = z.infer<typeof credentialsCreateSchema>;
