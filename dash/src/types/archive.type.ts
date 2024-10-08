export type Season = {
	Year: number;
	Meetings: Meeting[];
};

export type Meeting = {
	Sessions: Session[];
	Key: number;
	Code: string;
	Number: number;
	Location: string;
	OfficialName: string;
	Name: string;
	Country: {
		Key: number;
		Code: string;
		Name: string;
	};
	Circuit: {
		Key: number;
		ShortName: string;
	};
};

export type Session = {
	Key: number;
	Type: "Practice" | "Qualifying" | "Race";
	Number: number;
	Name: string;
	StartDate: string;
	EndDate: string;
	GmtOffset: number;
	Path?: string;
};
