/**
 * we are only checking if each of our data block is empty or not.
 * if empty we return a `true` otherwise `false`
 * based on the returned information, we normalize the data block in our submit handler
 */

type BlockType =
	| {
			type: "single_label";
			value: string | undefined | null;
	  }
	| {
			type: "key_value";
			key: string;
			value: string | null | undefined;
	  }
	| {
			type: "information";
			value: string | null | undefined;
	  };

export function isDatablockEmpty(block: BlockType): boolean {
	switch (block.type) {
		case "single_label":
			if (!block.value) return true;
			if (block.value.trim() === "") return true;
			return false;

		case "key_value":
			if (!block.key) return true;
			if (block.key.trim() === "") return true;
			if (!block.value) return true;
			if (block.value.trim() === "") return true;
			return false;

		case "information":
			if (!block.value) return true;
			if (block.value.trim() === "") return true;
			return false;
		default:
			return false;
	}
}
