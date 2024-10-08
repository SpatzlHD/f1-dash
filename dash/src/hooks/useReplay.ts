"use client";

import { isJson } from "@/lib/isJson";
import { useEffect, useState } from "react";
import { inflate } from "@/lib/inflate";
import { CarData, CarsData, Position, Positions, State } from "@/types/state.type";
import { isBase64Encoded } from "@/lib/isBase64Encoded";
import { useStateEngine } from "./useStateEngine";
import { utc } from "moment";

type EventProps = {
	event: string;
	time: string;
	channel: string;
	previousEvents?: [
		{
			event: string;
			time: string;
		},
	];
};

export default function useReplay(timing: Map<string, { feed: string; data: string }> | null) {
	const [loading, setLoading] = useState<boolean>(true);
	const [curentTime, setCurrentTime] = useState<number>(0);
	const [isPlaying, setIsPlaying] = useState<boolean>(true);
	const [speed, setSpeed] = useState<number>(1);
	const [isFinished, setIsFinished] = useState<boolean>(false);
	const [length, setLength] = useState<number>(0);
	const [timeString, setTimeString] = useState<string>("00000000");
	const [intervalData, setIntervalData] = useState<any>(null);

	const stateEngine = useStateEngine<State>("state");
	const carDataEngine = useStateEngine<CarsData>("carData");
	const positionEngine = useStateEngine<Positions>("position");

	useEffect(() => {
		const highestKey = timing ? Math.max(...Array.from(timing.keys()).map((key) => parseInt(key, 10))) : 0;
		setLength(highestKey);
	}, [timing]);
	useEffect(() => {
		if (length != 0) setLoading(false);
	}, [length]);

	const play = () => {
		setIsPlaying(true);
	};

	const pause = () => {
		setIsPlaying(false);
	};

	const stop = () => {
		setIsPlaying(false);
		setCurrentTime(0);
	};

	const fast = (speed: 0.5 | 1 | 2 | 5 | 20) => {
		setSpeed(speed);
	};

	if (!timing) return { curentTime, isPlaying, speed, isFinished, play, pause, stop, fast };

	// Inside your component
	useEffect(() => {
		if (isPlaying && length > 0) {
			// Clear existing interval to prevent multiple intervals
			clearInterval(intervalData);

			setIntervalData(
				setInterval(() => {
					setCurrentTime((prev) => {
						const nextTime = prev + 1;
						const parsedString = nextTime.toString().padStart(8, "0");
						setTimeString(parsedString);
						if (timing.has(parsedString)) {
							let data:
								| {
										feed?: string;
										data?: CarData | Position | string | undefined;
								  }
								| undefined = timing.get(parsedString);
							const channel = data?.feed;
							if (!isJson(data?.data as string) && isBase64Encoded(data?.data as string)) {
								if (data?.data) data.data = inflate<CarData | Position>(data?.data as string);
							}
							if (channel === "CarData.z" && typeof data?.data === "object") {
								carDataEngine.setState((data?.data as CarData).Entries[0].Cars as CarsData);
								carDataEngine.addFramesWithTimestamp(
									(data?.data as CarData).Entries.map((e) => ({
										data: e.Cars,
										timestamp: utc(e.Utc).local().milliseconds(),
									})),
								);
							} else if (channel === "Position.z" && typeof data?.data === "object") {
								positionEngine.setState((data?.data as Position).Position[0].Entries as Positions);
								positionEngine.addFramesWithTimestamp(
									(data?.data as Position).Position.map((p) => ({
										data: p.Entries,
										timestamp: utc(p.Timestamp).local().milliseconds(),
									})),
								);
							} else {
								stateEngine.setState(data?.data as State);
							}
						}
						if (nextTime >= length) {
							console.log("clearing interval");
							clearInterval(intervalData);
							setIsPlaying(false);
							setIsFinished(true);
						}
						return nextTime;
					});
				}, 1 / speed),
			);
		}

		return () => clearInterval(intervalData); // Cleanup on component unmount or when isPlaying/speed changes
	}, [isPlaying, speed, length, timing]); // Dependencies array

	return {
		curentTime,
		isPlaying,
		speed,
		isFinished,
		play,
		pause,
		stop,
		fast,
		length,
		timeString,
		intervalData,

		loading,
		metrics: {
			mapSize: timing.size,
		},
	};
}
