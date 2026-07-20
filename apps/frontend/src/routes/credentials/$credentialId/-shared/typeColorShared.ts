import { hashString, TYPE_COLORS } from "../../-utils/colors";

export function typeColorShared(type_value: string | null) {
	const typeValue = type_value ?? "";
	const colorIndex = hashString(typeValue) % TYPE_COLORS.length;
	const typeColor = TYPE_COLORS[colorIndex];

	return typeColor;
}
