import { AlertTriangle, LoaderIcon, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
	AlertDialogClose,
	AlertDialogDescription,
	AlertDialogPopup,
	AlertDialogRoot,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "#/components/ui/alert-dialog";
import { gooeyToast } from "#/components/ui/goey-toaster";
import { Button } from "@/components/ui/button";
import { deleteCredentialAction } from "./delete-credential-action";

interface DeleteCredentialDialogProps {
	credentialId: string;
	credentialTitle: string;
	csrfToken: string | undefined;
}

export function DeleteCredentialDialog({
	credentialId,
	credentialTitle,
	csrfToken,
}: DeleteCredentialDialogProps) {
	const navigate = useNavigate();
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		if (!csrfToken) {
			gooeyToast.error("Session expired", {
				description: "Please refresh the page and try again.",
			});
			return;
		}

		setIsDeleting(true);
		try {
			await deleteCredentialAction({ credentialId, csrfToken });

			gooeyToast.success("Credential deleted", {
				description: `"${credentialTitle}" has been deleted`,
			});

			navigate({ to: "/credentials" });
		} catch (err) {
			gooeyToast.error("Failed to delete", {
				description: err instanceof Error ? err.message : "Something went wrong",
			});
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<AlertDialogRoot>
			<AlertDialogTrigger
				render={
					<Button
						type="button"
						variant="destructive"
						size="lg"
						className="px-8 py-4"
						disabled={isDeleting}
					>
						{isDeleting ? (
							<LoaderIcon className="size-4 animate-spin" />
						) : (
							<AlertTriangle className="size-4" />
						)}
						{isDeleting ? "Deleting..." : "Delete"}
					</Button>
				}
			/>
			<AlertDialogPopup>
				<AlertDialogTitle>Delete credential</AlertDialogTitle>
				<AlertDialogDescription>
					Are you sure you want to delete &ldquo;{credentialTitle}&rdquo;? This action cannot
					be undone.
				</AlertDialogDescription>
				<div className="flex justify-end gap-3 mt-2">
					<AlertDialogClose
						render={
							<Button type="button" variant="outline" size="sm">
								Cancel
							</Button>
						}
					/>
					<AlertDialogClose
						render={
							<Button
								type="button"
								variant="destructive"
								size="sm"
								disabled={isDeleting}
								onClick={handleDelete}
							>
								<Trash2 className="size-4" />
								Delete
							</Button>
						}
					/>
				</div>
			</AlertDialogPopup>
		</AlertDialogRoot>
	);
}
