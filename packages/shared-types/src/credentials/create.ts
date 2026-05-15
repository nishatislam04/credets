import type { credentialsCreateSchema } from "@credets/shared-schema/credentials/create";
import type { z } from "zod";

export type CredentialCreateType = z.infer<typeof credentialsCreateSchema>;
