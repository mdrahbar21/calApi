import axios from 'axios';
import { parseISO, setHours, setMinutes, addMinutes, eachMinuteOfInterval, formatISO, startOfDay, addDays, isBefore, isEqual } from 'date-fns';

const API_KEY = process.env.API_KEY;
const BASE_URL = 'https://api.cal.com/v1';

interface BusySlot {
    start: string;
    end: string;
    title?: string;
}

interface WorkingHour {
    days: number[];
    startTime: number;
    endTime: number;
    userId: number;
}

interface AvailabilityData {
    busy: BusySlot[];
    workingHours: WorkingHour[];
}

async function getAvailability(username: string, startDate: string, endDate: string): Promise<AvailabilityData> {
    const url = `${BASE_URL}/availability?apiKey=${API_KEY}&username=${username}&dateFrom=${startDate}&dateTo=${endDate}`;
    const response = await axios.get<AvailabilityData>(url);
    return response.data;
}

export async function getAvailableSlots(username: string, startDate: string, endDate?: string): Promise<{ start: string; end: string }[]> {
    const resolvedEndDate = endDate ? endDate : formatISO(addDays(parseISO(startDate), 1), { representation: 'date' });
    const availability = await getAvailability(username, startDate, resolvedEndDate);
    const timezoneOffset = 330; // GMT+05:30 in minutes
    let freeSlots: { start: string; end: string }[] = [];

    eachMinuteOfInterval({ start: parseISO(startDate), end: parseISO(resolvedEndDate) }, { step: 1440 }).forEach(day => {
        const dayOfWeek = day.getDay();
        availability.workingHours.forEach(wh => {
            if (wh.days.includes(dayOfWeek)) {
                const dayStart = addMinutes(setMinutes(setHours(startOfDay(day), Math.floor(wh.startTime / 60)), wh.startTime % 60), timezoneOffset);
                const dayEnd = addMinutes(setMinutes(setHours(startOfDay(day), Math.floor(wh.endTime / 60)), wh.endTime % 60), timezoneOffset);
                let currentStart = dayStart;
    
                availability.busy.sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime()).forEach(slot => {
                    const busyStart = parseISO(slot.start);
                    const busyEnd = parseISO(slot.end);
    
                    if (isBefore(currentStart, busyStart) && isBefore(busyStart, dayEnd)) {
                        freeSlots.push({ start: formatISO(currentStart), end: formatISO(busyStart) });
                    }
                    if (isBefore(currentStart, busyEnd)) {
                        currentStart = busyEnd;
                    }
                });
    
                if (isBefore(currentStart, dayEnd)) {
                    freeSlots.push({ start: formatISO(currentStart), end: formatISO(dayEnd) });
                }
            }
        });
    });
    
    // Eliminate duplicates and merge overlapping slots
    freeSlots = freeSlots.reduce<{ start: string; end: string }[]>((acc, slot) => {
        if (!acc.find(s => isEqual(parseISO(s.start), parseISO(slot.start)) && isEqual(parseISO(s.end), parseISO(slot.end)))) {
            acc.push(slot);
        }
        return acc;
    }, []);
    


    return freeSlots;
}
