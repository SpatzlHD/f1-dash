"use client";
import Button from "@/components/Button";

import { useDevMode } from "@/hooks/useDevMode";
import useProxyedRequest from "@/hooks/useProxyedRequest";
import useReplay from "@/hooks/useReplay";
import useReplayData from "@/hooks/useReplayData";
import { Season, Session } from "@/types/archive.type";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type RaceData = {
	meeting: {
		key: number;
		name: string;
		curcuit: {
			Key: number;
			ShortName: string;
		};
		location: string;
		country: {
			Key: number;
			Name: string;
			Code: string;
		};
		code: string;
		officialName: string;
		number: number;
	};
	session: Session;
};

export default function Replay() {
	const { year, raceKey, sessionKey } = useParams();
	const [raceData, setRaceData] = useState<RaceData | null>(null);
	const { data, isSuccess }: { data: Season; isSuccess: boolean } = useProxyedRequest({
		url: `https://livetiming.formula1.com/static/${year}/Index.json`,
	});
	const { raceFeeds, avalibaleRaceFeeds, finished, timing } = useReplayData(raceData?.session.Path || null);
	const { curentTime, length, timeString, intervalData, metrics, loading } = useReplay(timing || null);
	const devMode = useDevMode();

	useEffect(() => {
		if (isSuccess) {
			const meetings = data.Meetings;
			const meeting = meetings.find(
				(meeting) =>
					meeting.Key.toString() === raceKey &&
					meeting.Sessions.find((session) => session.Key.toString() === sessionKey),
			);
			if (!meeting) return;
			const session = meeting?.Sessions.find((session) => session.Key.toString() === sessionKey);
			if (session) {
				const newData = {
					meeting: {
						key: meeting.Key,
						name: meeting.Name,
						curcuit: meeting.Circuit,
						location: meeting.Location,
						country: meeting.Country,
						code: meeting.Code,
						officialName: meeting.OfficialName,
						number: meeting.Number,
					},
					session: session,
				};
				setRaceData(newData);
			}
		}
	}, [data]);
	return (
		<div>
			<h1>Replay</h1>
			<p>Year: {year}</p>
			<p>
				Url:{" "}
				<a
					rel="noreferrer"
					target="_blank"
					href={`https://livetiming.formula1.com/static/${raceData?.session.Path}Index.json`}
				>{`https://livetiming.formula1.com/static/${raceData?.session.Path}`}</a>
			</p>
			{!loading && (
				<>
					<p>Finished: {finished.toString()}</p>
					<p></p>
					<Button onClick={() => clearInterval(intervalData)}>Clear Intervall</Button>
				</>
			)}
			{devMode.active && (
				<div className="fixed right-5 top-5 z-50 rounded-lg bg-black p-2 text-sm">
					<pre>Current Time: {curentTime}</pre>
					<pre>Length: {length}</pre>
					<pre>Time String: {timeString}</pre>
					<pre>Map Size: {metrics?.mapSize}</pre>
					<Button onClick={() => clearInterval(intervalData)}>Clear Intervall</Button>
				</div>
			)}
		</div>
	);
}
