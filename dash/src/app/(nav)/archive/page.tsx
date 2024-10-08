"use client";
import Button from "@/components/Button";

import Modal from "@/components/Modal";
import RaceCard from "@/components/archive/RaceCard";
import useProxyedRequest from "@/hooks/useProxyedRequest";
import { Meeting, Season } from "@/types/archive.type";
import { utc } from "moment";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const dataAvalibleSince = 2019;

export default function ArchivePage() {
	const router = useRouter();
	const [years, setYears] = useState<number[]>([]);
	const [curentYear] = useState<number>(new Date().getFullYear());

	const [selectedRace, setSelectedRace] = useState<Meeting | null>(null);
	const [modalOpen, setModalOpen] = useState(false);

	const [selectedYear, setSelectedYear] = useState<number>(years[0]);
	console.log(selectedYear);
	const { data, isSuccess }: { data: Season; isSuccess: boolean } = useProxyedRequest({
		url: selectedYear
			? `https://livetiming.formula1.com/static/${selectedYear}/Index.json`
			: `
		https://livetiming.formula1.com/static/${curentYear}/Index.json`,
	});

	const modalRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const years = Array.from({ length: curentYear - dataAvalibleSince + 1 }, (_, i) => curentYear - i);
		setYears(years);
		setSelectedYear(years[0]);
	}, []);
	useEffect(() => {
		function handleClickOutside(event: { target: any }) {
			if (modalRef.current && !modalRef.current.contains(event.target)) {
				setModalOpen(false); // Close the modal if click is outside
			}
		}

		// Add when the modal is open and remove when the modal is closed
		if (modalOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			document.addEventListener("touchstart", handleClickOutside);
			document.addEventListener("keydown", (e) => {
				if (e.key === "Escape") setModalOpen(false);
			});
		} else {
			document.removeEventListener("mousedown", handleClickOutside);
		}

		// Cleanup
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [modalOpen]); // Re-run when modalOpen changes
	return (
		<div className="container mx-auto mb-10 max-w-screen-lg px-4">
			<div className="my-4">
				<h1 className=" text-3xl">Race Archive</h1>
				<p className="text-zinc-600">Here you can find Races from the past </p>

				{isSuccess && (
					<>
						<div className="flex gap-4">
							{years.map((year) => (
								<Button
									key={year}
									onClick={() => setSelectedYear(year)}
									className={selectedYear === year ? "bg-zinc-900" : ""}
								>
									{year}
								</Button>
							))}
						</div>

						<div>
							<h2 className="mt-4 text-2xl">{data.Year} Season</h2>
							<div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
								{data.Meetings.map((meeting) => (
									<RaceCard
										key={meeting.Key}
										meeting={meeting}
										selectedYear={selectedYear}
										onClick={() => {
											setModalOpen(!modalOpen);
											setSelectedRace(meeting);
										}}
									/>
								))}
							</div>
						</div>
					</>
				)}
				<Modal open={modalOpen}>
					{selectedRace && (
						<div ref={modalRef} className="flex flex-col items-center">
							<p className="text-lg font-medium leading-none">{selectedRace.OfficialName}</p>
							<p className="leading-tight text-zinc-400">{selectedRace.Location}</p>
							<p className="text-sm leading-tight text-zinc-600">
								{utc(selectedRace.Sessions[0].StartDate).local().format("DD.MM.YYYY")} -{" "}
								{utc(selectedRace.Sessions[selectedRace.Sessions.length - 1].StartDate)
									.local()
									.format("DD.MM.YYYY")}
							</p>
							<div className="grid grid-cols-3  sm:divide-zinc-600 lg:grid-flow-col lg:divide-x lg:divide-dashed ">
								{selectedRace.Sessions.map((session) => (
									<div
										onClick={() => {
											router.push(`/archive/${selectedYear}/${selectedRace.Key}/${session.Key}`);
										}}
										key={session.Key}
										className=" flex flex-col gap-2    bg-zinc-900 p-2 hover:cursor-pointer "
									>
										<p className="text-lg font-medium leading-none">{session.Name}</p>
										<p className="text-sm leading-tight text-zinc-600">
											{utc(session.StartDate).local().format("DD.MM.YYYY")} -{" "}
											{utc(session.EndDate).local().format("DD.MM.YYYY")}
										</p>
									</div>
								))}
							</div>
						</div>
					)}
				</Modal>
			</div>
		</div>
	);
}
