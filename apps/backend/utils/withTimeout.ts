import { TimeoutError } from "@backend/err/timeout";

/**
 * Wraps a promise with a timeout. If the promise does not settle within
 * `timeoutMs` milliseconds, it is rejected with a {@link TimeoutError}.
 *
 * The returned promise uses an internal `AbortController` so callers that
 * support `AbortSignal` can be notified of cancellation. Even if the timeout
 * fires, the original promise continues to run — any eventual rejection is
 * silently caught to prevent unhandled promise rejections.
 *
 * @example
 * ```ts
 * const result = await withTimeout(
 *   someExpensiveOp(),
 *   30_000,
 * );
 * ```
 */
export async function withTimeout<T>(
	promise: Promise<T>,
	timeoutMs: number,
	timeoutMessage?: string,
): Promise<T> {
	const abortController = new AbortController();

	return new Promise<T>((resolve, reject) => {
		const timeoutId = setTimeout(() => {
			abortController.abort();
			reject(new TimeoutError(timeoutMessage));
		}, timeoutMs);

		// When the original promise settles, clear the timeout and forward
		// its result. If the timeout already fired, resolve/reject are no-ops.
		promise
			.then((result) => {
				clearTimeout(timeoutId);
				resolve(result);
			})
			.catch((error) => {
				clearTimeout(timeoutId);
				reject(error);
			});
	});
}
