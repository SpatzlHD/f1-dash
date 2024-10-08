"use client";
import { useEffect, useState } from "react";
import { env } from "@/env.mjs";

export default function useReplayData(basePath: string | null) {
	const [avalibaleFeeds, setAvaliableFeeds] = useState<any>(null);
	const [raceFeeds, setRaceFeeds] = useState<any>(null);
	const [finished, setFinished] = useState<boolean>(false);
	const url = `https://livetiming.formula1.com/static/${basePath}`;
	const [timing, setTiming] = useState<Map<string, { feed: string; data: string }>>(new Map());

	useEffect(() => {
		async function fetchData() {
			if (!basePath) return;
			const encodedUrl = encodeURIComponent(url + "Index.json");
			const proxyUrl = `${env.NEXT_PUBLIC_API_URL}/api/proxy`;
			try {
				const res = await fetch(`${proxyUrl}/${encodedUrl}`);
				const json = await res.json();
				setAvaliableFeeds(json.Feeds);
			} catch (error) {
				console.error(error);
			}
		}
		fetchData();
	}, [basePath]);

	useEffect(() => {
		async function fetchFeedData() {
			if (!avalibaleFeeds) return;
			const feeds = avalibaleFeeds;
			const promises = Object.keys(feeds).map(async (key: any) => {
				const feed = feeds[key];

				const encodedUrl = encodeURIComponent(url + feed.StreamPath);
				const proxyUrl = `${env.NEXT_PUBLIC_API_URL}/api/proxy`;
				try {
					const res = await fetch(`${proxyUrl}/${encodedUrl}`);
					const json = await res.text();
					feed.data = json;
				} catch (error) {
					console.error(error);
				}
			});

			await Promise.all(promises);
			setRaceFeeds(feeds);
			setFinished(true);
		}
		fetchFeedData();
	}, [avalibaleFeeds]);

	useEffect(() => {
		async function addTimingData() {
			if (!raceFeeds) return;
			const feeds = raceFeeds;
			const promises = Object.keys(feeds).map(async (key) => {
				const feed = feeds[key];
				const data = feed.data;
				const lines = data.split("\n");
				const newTiming = new Map(timing); // Clone current timing if it's a state
				lines.forEach((line: string) => {
					const timingKey = line.substring(0, 11).replaceAll(".", "").replaceAll(":", "");
					if (!timingKey) return;
					let value = line.substring(12).replace("\r", "");
					try {
						// Directly parse the JSON string to an object
						const jsonValue = JSON.parse(value);
						const data = {
							feed: key,
							data: jsonValue,
						};
						// Store the object directly, without re-stringifying
						newTiming.set(timingKey, data);
					} catch (e) {
						// Handle the case where parsing is not possible (not a JSON string)

						const data = {
							feed: key,
							data: value,
						};

						newTiming.set(timingKey, data);
					}
				});
				return newTiming;
			});

			Promise.all(promises).then((timingArrays) => {
				const finalTiming = new Map();
				timingArrays.forEach((timingMap) => {
					timingMap.forEach((value, key) => {
						finalTiming.set(key, value);
					});
				});

				// Assuming `setTiming` is the setter for [`timing`](command:_github.copilot.openSymbolFromReferences?%5B%7B%22%24mid%22%3A1%2C%22fsPath%22%3A%22c%3A%5C%5CUsers%5C%5Cspatz%5C%5COneDrive%5C%5CDokumente%5C%5CCoding%5C%5Cf1-dash%5C%5Cdash%5C%5Csrc%5C%5Chooks%5C%5CuseReplayData.ts%22%2C%22_sep%22%3A1%2C%22external%22%3A%22file%3A%2F%2F%2Fc%253A%2FUsers%2Fspatz%2FOneDrive%2FDokumente%2FCoding%2Ff1-dash%2Fdash%2Fsrc%2Fhooks%2FuseReplayData.ts%22%2C%22path%22%3A%22%2FC%3A%2FUsers%2Fspatz%2FOneDrive%2FDokumente%2FCoding%2Ff1-dash%2Fdash%2Fsrc%2Fhooks%2FuseReplayData.ts%22%2C%22scheme%22%3A%22file%22%7D%2C%7B%22line%22%3A9%2C%22character%22%3A1%7D%5D "src/hooks/useReplayData.ts") state
				setTiming(finalTiming);
			});
		}
		addTimingData();
	}, [raceFeeds, finished]);

	return { avalibaleRaceFeeds: avalibaleFeeds, raceFeeds, finished, timing };
}
