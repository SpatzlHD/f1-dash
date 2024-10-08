import { env } from "@/env.mjs";
import { set } from "lodash";
import { useEffect, useState } from "react";

export default function useProxyedRequest({ url, options }: { url: string; options?: RequestInit }) {
	const [data, setData] = useState<any>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<any>(null);
	const [isError, setIsError] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	useEffect(() => {
		async function fetchData() {
			const encodedUrl = encodeURIComponent(url).toString();
			const proxyUrl = `${env.NEXT_PUBLIC_API_URL}/api/proxy`;
			try {
				const res = await fetch(`${proxyUrl}/${encodedUrl}`, options);
				console.log(res);
				if (!res.ok) {
					setIsError(true);
					setError({
						code: res.status,
						message: res.statusText,
					});
				} else {
					const json = await res.json();

					setData(json);
					setIsSuccess(true);
				}
			} catch (error) {
				setIsError(true);
				setError(error);
			} finally {
				setLoading(false);
			}
		}
		fetchData();
	}, [url, options]);

	return { data, loading, error, isError, isSuccess };
}
