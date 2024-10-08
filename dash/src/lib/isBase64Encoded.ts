export function isBase64Encoded(str: string | undefined): boolean {
	if (!str) return false;
	// Regular expression to check if the string is a valid base64 encoded string
	const regex = /^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/;

	return regex.test(str);
}
