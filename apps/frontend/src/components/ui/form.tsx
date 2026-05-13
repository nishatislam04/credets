import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// ---------- Form (just a styled container, completely optional) ----------
const Form = React.forwardRef<HTMLFormElement, React.FormHTMLAttributes<HTMLFormElement>>(
	({ className, ...props }, ref) => (
		<form ref={ref} className={cn("space-y-6", className)} {...props} />
	),
);
Form.displayName = "Form";

// ---------- FormItem – group label, control and message ----------
const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => (
		<div ref={ref} className={cn("space-y-2", className)} {...props} />
	),
);
FormItem.displayName = "FormItem";

// ---------- FormLabel – uses the shadcn Label ----------
const FormLabel = React.forwardRef<
	React.ElementRef<typeof Label>,
	React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => (
	<Label ref={ref} className={cn("font-medium", className)} {...props} />
));
FormLabel.displayName = "FormLabel";

// ---------- FormControl – wraps the actual input ----------
const FormControl = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => <div ref={ref} {...props} />);
FormControl.displayName = "FormControl";

// ---------- FormMessage – displays field errors ----------
interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
	errors?: string[];
}

const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
	({ className, errors, children, ...props }, ref) => {
		const body = errors?.length
			? errors.map((e, i) => (
					<span key={i}>
						{e}
						{i < errors.length - 1 ? " " : ""}
					</span>
				))
			: children;

		if (!body) return null;

		return (
			<p
				ref={ref}
				className={cn("text-sm font-medium text-destructive", className)}
				{...props}
			>
				{body}
			</p>
		);
	},
);
FormMessage.displayName = "FormMessage";

export { Form, FormControl, FormItem, FormLabel, FormMessage };
