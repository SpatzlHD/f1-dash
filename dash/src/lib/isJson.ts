export function isJson(str?: string): boolean {
	if (!str) return false;
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
}
