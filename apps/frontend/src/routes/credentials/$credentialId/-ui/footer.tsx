import { Separator } from "@base-ui/react";
import type { CredentialDetail } from "@credets/shared-types/credentials/listings";
import { formatDate } from "../-utils/formatDate";

export function Footer({ credential }: { credential: CredentialDetail }) {
	return (
		<>
			<Separator className="my-12" />
			<div className="text-center text-sm text-muted-foreground/50">
				Created {formatDate(credential.created_at)}
				{credential.updated_at &&
					credential.updated_at !== credential.created_at && (
						<>
							<span className="mx-1">·</span>
							Updated {formatDate(credential.updated_at)}
						</>
					)}
			</div>
		</>
	);
}
