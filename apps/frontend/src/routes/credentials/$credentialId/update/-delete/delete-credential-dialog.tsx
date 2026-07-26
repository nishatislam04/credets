import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, LoaderIcon, Trash2 } from "lucide-react";
import { useState } from "react";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "#/components/ui/alert-dialog";
import { toast } from "#/components/ui/toast";
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
	const [open, setOpen] = useState(false);

	const handleDelete = async () => {
		if (!csrfToken) {
			toast.error("Session expired", {
				description: "Please refresh the page and try again.",
			});
			return;
		}

		setIsDeleting(true);
		try {
			await deleteCredentialAction({ credentialId, csrfToken });

			toast.success("Credential deleted", {
				description: `"${credentialTitle}" has been deleted`,
			});

			// Invalidate the listings query so TanStack Query refetches fresh data
			queryClient.invalidateQueries({ queryKey: ["credentials-listings"] });

			navigate({ to: "/credentials" });
		} catch (err) {
			toast.error("Failed to delete", {
				description:
					err instanceof Error ? err.message : "Something went wrong",
			});
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<>
			{/* Trigger button – no AlertDialogTrigger wrapper */}
			<Button
				type="button"
				variant="destructive"
				size="lg"
				className="px-8 py-4"
				disabled={isDeleting}
				onClick={() => setOpen(true)}
			>
				{isDeleting ? (
					<LoaderIcon className="size-4 animate-spin" />
				) : (
					<Trash2 className="size-4" />
				)}
				{isDeleting ? "Deleting..." : "Delete"}
			</Button>

			{/* Controlled alert dialog */}
			<AlertDialog open={open} onOpenChange={setOpen}>
				<AlertDialogContent>
					<div className="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/10 ring-1 ring-destructive/20">
						<AlertTriangle className="size-8 text-destructive" />
					</div>

					<AlertDialogTitle className="text-center text-xl text-foreground">
						Delete credential
					</AlertDialogTitle>

					<AlertDialogDescription className="text-center">
						<span>
							This will move{" "}
							<span className="font-semibold text-foreground">
								&ldquo;{credentialTitle}&rdquo;
							</span>
							to trash.
						</span>
						<br />
						<span>
							You can find it later in the trash page to either permanently
							delete or restore it.
						</span>
					</AlertDialogDescription>

					<div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-xs text-destructive/70">
						The credential will not be permanently deleted right away. It will
						be stored in the trash until you take further action.
					</div>

					<div className="flex justify-end gap-3 mt-6">
						<AlertDialogCancel
							variant="outline"
							size="lg"
							disabled={isDeleting}
						>
							Cancel
						</AlertDialogCancel>
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
					</div>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
