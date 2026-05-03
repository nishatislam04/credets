import { format, parse } from "date-fns";

/**
 * this util function will be used to parse our local date to a specific format
 * so that both server date and local date match or does not match
 *
 * the local date format MUST be in this format
 * dd/MM/yyyy
 * (03/05/2026) or this format valid too (3/5/2026)
 *
 * @param {string} localDateInput - the specific local date input as dd/MM/yyyy
 * @returns {string} return the formatted local date to compare
 */
export function parseLocalDate(localDateInput: string): string {
	const localDateParsed = parse(localDateInput, "dd/MM/yyyy", new Date());
	const localDateFormatted = format(localDateParsed, "yyyy-MM-dd");

	return localDateFormatted;
}
