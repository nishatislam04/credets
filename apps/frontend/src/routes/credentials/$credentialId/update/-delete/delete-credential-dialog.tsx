import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, LoaderIcon, Trash2 } from "lucide-react";
import { useState } from "react";
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
	const queryClient = useQueryClient();
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

			// Invalidate the listings query so TanStack Query refetches fresh data
			queryClient.invalidateQueries({ queryKey: ["credentials-listings"] });

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
							<Trash2 className="size-4" />
						)}
						{isDeleting ? "Deleting..." : "Delete"}
					</Button>
				}
			/>
			<AlertDialogPopup>
				{/* Large warning icon */}
				<div className="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/10 ring-1 ring-destructive/20">
					<AlertTriangle className="size-8 text-destructive" />
				</div>

				<AlertDialogTitle className="text-center text-xl text-foreground">
					Delete credential
				</AlertDialogTitle>

				<AlertDialogDescription className="text-center">
					This will permanently delete{" "}
					<span className="font-semibold text-foreground">&ldquo;{credentialTitle}&rdquo;</span> and
					all its associated data, including images and files. This action{" "}
					<strong className="text-destructive">cannot be undone</strong>.
				</AlertDialogDescription>

				<div className="mt-2 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-xs text-destructive/70">
					This action is irreversible. Once deleted, you will not be able to recover the credential
					or any of its associated data.
				</div>

				<div className="flex justify-end gap-3 mt-6">
					<AlertDialogClose
						render={
							<Button type="button" variant="outline" size="lg" disabled={isDeleting}>
								Cancel
							</Button>
						}
					/>
					<AlertDialogClose
						render={
							<Button
								type="button"
								variant="destructive"
								size="lg"
								className="gap-2 px-6 shadow-lg shadow-destructive/25 hover:shadow-xl hover:shadow-destructive/30 transition-all duration-200"
								disabled={isDeleting}
								onClick={handleDelete}
							>
								{isDeleting ? (
									<LoaderIcon className="size-4 animate-spin" />
								) : (
									<Trash2 className="size-4" />
								)}
								{isDeleting ? "Deleting..." : "Yes, delete it"}
							</Button>
						}
					/>
				</div>
			</AlertDialogPopup>
		</AlertDialogRoot>
	);
}
