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
} from "#/components/ui/alert-dialog";
import { gooeyToast } from "#/components/ui/goey-toaster";
import { Button } from "@/components/ui/button";
import { deleteCredentialAction } from "../update/-delete/delete-credential-action";
import { getCSRFtoken } from "../../create/-actions/getCSRFtoken";

interface DeleteButtonProps {
	credentialId: string;
	credentialTitle: string;
}

export function DeleteButton({
	credentialId,
	credentialTitle,
}: DeleteButtonProps) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [open, setOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			const csrfRes = await getCSRFtoken();
			await deleteCredentialAction({
				credentialId,
				csrfToken: csrfRes.data.token,
			});

			gooeyToast.success("Credential deleted", {
				description: `"${credentialTitle}" has been deleted`,
			});

			queryClient.invalidateQueries({ queryKey: ["credentials-listings"] });
			navigate({ to: "/credentials" });
		} catch (err) {
			gooeyToast.error("Failed to delete", {
				description:
					err instanceof Error ? err.message : "Something went wrong",
			});
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-destructive/20 bg-card px-4 py-3 text-sm text-destructive/80 transition-all duration-200 hover:bg-destructive/5 hover:text-destructive hover:shadow-sm hover:shadow-destructive/10 active:scale-[0.98]"
				disabled={isDeleting}
			>
				<Trash2 className="size-4" />
				Delete this credential
			</button>

			<AlertDialog open={open} onOpenChange={setOpen}>
				<AlertDialogContent>
					<div className="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/10 ring-1 ring-destructive/20">
						<AlertTriangle className="size-8 text-destructive" />
					</div>

					<AlertDialogTitle className="text-center text-xl text-foreground">
						Delete credential
					</AlertDialogTitle>

					<AlertDialogDescription className="text-center">
						<p>
							This will permanently delete{" "}
							<span className="font-semibold text-foreground">
								&ldquo;{credentialTitle}&rdquo;
							</span>
							.
						</p>
						<p className="mt-2">
							All associated images and files will also be removed.
						</p>
					</AlertDialogDescription>

					<div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-xs text-destructive/70">
						This action is irreversible. Once deleted, you will not be able to
						recover the credential or any of its associated data.
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
