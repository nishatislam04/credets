import type { GooeyToasterProps } from "goey-toast";
import { GooeyToaster as GooeyToasterPrimitive, gooeyToast } from "goey-toast";
import "goey-toast/styles.css";


export { gooeyToast };
export type { GooeyToasterProps };
export type {
	GooeyPromiseData,
	GooeyToastAction,
	GooeyToastClassNames,
	GooeyToastOptions,
	GooeyToastTimings,
} from "goey-toast";

function GooeyToaster(props: GooeyToasterProps) {
	return <GooeyToasterPrimitive position="top-right" preset="bouncy" {...props} />;
}

export { GooeyToaster };
