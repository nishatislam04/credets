import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "#/components/ui/button";

interface ErrorBoundaryProps {
	children: ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	message: string;
}

export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	state: ErrorBoundaryState = {
		hasError: false,
		message: "",
	};

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return {
			hasError: true,
			message: error.message || "Something went wrong",
		};
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		console.error("Root error boundary caught:", error, info.componentStack);
	}

	render() {
		if (!this.state.hasError) {
			return this.props.children;
		}

		return (
			<div className="mx-auto flex min-h-[50vh] w-full max-w-lg flex-col items-center justify-center px-4 py-24 text-center">
				<div className="mb-5 flex size-16 items-center justify-center rounded-full bg-destructive/10">
					<span className="text-2xl text-destructive">!</span>
				</div>
				<h1 className="mb-2 text-lg font-semibold">Something broke</h1>
				<p className="mb-6 text-sm text-muted-foreground">{this.state.message}</p>
				<Button
					type="button"
					onClick={() => {
						this.setState({ hasError: false, message: "" });
						window.location.assign("/");
					}}
				>
					Reload app
				</Button>
			</div>
		);
	}
}
