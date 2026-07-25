import type { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "#/components/ui/sidebar";
import { CredentialsSidebar } from "./credentials-sidebar";
import { CredentialsHeader } from "./credentials-header";

export function CredentialsShell({ children }: { children: ReactNode }) {
	return (
		<SidebarProvider defaultOpen={true}>
			<CredentialsSidebar />
			<SidebarInset>
				<CredentialsHeader />
				{children}
			</SidebarInset>
		</SidebarProvider>
	);
}
