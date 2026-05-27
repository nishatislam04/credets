import type { credentialsUpdateSchema } from "@credets/shared-schema/credentials/update";
import type { z } from "zod";

export type CredentialUpdateType = z.infer<typeof credentialsUpdateSchema>;
