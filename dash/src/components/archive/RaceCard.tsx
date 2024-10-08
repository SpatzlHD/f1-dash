import { Meeting } from "@/types/archive.type";
import Map from "../Map";
import { motion } from "framer-motion";
import { useState } from "react";
import { utc } from "moment";

type Props = {
	meeting: Meeting;
	selectedYear: number;
	onClick: () => void;
};

export default function RaceCard({ meeting, selectedYear, onClick }: Props) {
	const [hovered, setHovered] = useState(false);
	return (
		<motion.div
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			initial={false}
			animate={{ scale: hovered ? 1.015 : 1 }}
			className="flex flex-col gap-2 rounded-md bg-zinc-900 p-4 hover:cursor-pointer"
			onClick={onClick}
		>
			<Map
				year={selectedYear}
				circuitKey={meeting.Circuit.Key}
				drivers={undefined}
				timingDrivers={undefined}
				positions={null}
				trackStatus={undefined}
				raceControlMessages={undefined}
			/>
			<p className="text-lg font-medium leading-none">{meeting.Name}</p>

			<p className="leading-tight text-zinc-400">{meeting.Location}</p>
			<p className="leading-tight text-zinc-400">
				{utc(meeting.Sessions[0].StartDate).local().format("DD.MM.YYYY")} -{" "}
				{utc(meeting.Sessions[meeting.Sessions.length - 1].StartDate)
					.local()
					.format("DD.MM.YYYY")}
			</p>
		</motion.div>
	);
}
