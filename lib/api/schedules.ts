import { fetchApi } from "./base";
import type { Schedule } from "@/lib/types";

const HALLS = "/api/v1/halls";
const SCHEDULES = "/api/v1/schedules";

type ScheduleDto = {
  id: string;
  weddingHallId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: number;
};

function toSchedule(d: ScheduleDto): Schedule {
  return {
    id: d.id,
    weddingHallId: d.weddingHallId,
    date: d.date,
    startTime: d.startTime,
    endTime: d.endTime,
    status: d.status === 1 ? "Reserved" : "Available",
  };
}

export type UpdateScheduleData = {
  weddingHallId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "Available" | "Reserved";
};

export async function getSchedulesByHall(hallId: string): Promise<Schedule[]> {
  const list = await fetchApi<ScheduleDto[]>(`${HALLS}/${hallId}/schedules`);
  return (list ?? []).map(toSchedule);
}

export async function updateSchedule(id: string, data: UpdateScheduleData): Promise<Schedule> {
  const body = {
    weddingHallId: data.weddingHallId,
    date: data.date,
    startTime: data.startTime,
    endTime: data.endTime,
    status: data.status === "Available" ? 0 : 1,
  };
  const d = await fetchApi<ScheduleDto>(`${SCHEDULES}/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return toSchedule(d);
}
