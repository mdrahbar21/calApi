import { parseISO, setHours, setMinutes, addMinutes, eachMinuteOfInterval, formatISO, startOfDay, addDays, isWithinInterval } from 'date-fns';

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
    const response = await fetch(url);
    const data: AvailabilityData = await response.json();
    return data;
}

export async function getAvailableSlots(username: string, startDate: string, endDate?: string): Promise<{ start: string; end: string }[]> {
    console.log('called getAvailableSlots')
    const resolvedEndDate = endDate ? endDate : formatISO(addDays(parseISO(startDate), 1), { representation: 'date' });
    const availability = await getAvailability(username, startDate, resolvedEndDate);
    const timezoneOffset = 330; // GMT+05:30 in minutes
    let freeSlots: { start: string; end: string }[] = [];

    // Process each day in the range
    eachMinuteOfInterval({ start: parseISO(startDate), end: parseISO(resolvedEndDate) }, { step: 1440 }).forEach(day => {
        const dayOfWeek = day.getDay(); // getDay returns 0 (Sunday) to 6 (Saturday)

        availability.workingHours.forEach(wh => {
            if (wh.days.includes(dayOfWeek)) {
                // Convert start and end times to the local timezone
                const dayStart = addMinutes(setMinutes(setHours(startOfDay(day), Math.floor(wh.startTime / 60)), wh.startTime % 60), timezoneOffset);
                const dayEnd = addMinutes(setMinutes(setHours(startOfDay(day), Math.floor(wh.endTime / 60)), wh.endTime % 60), timezoneOffset);
                let currentStart = dayStart;

                availability.busy.forEach(slot => {
                    const busyStart = parseISO(slot.start);
                    const busyEnd = parseISO(slot.end);

                    if (isWithinInterval(busyStart, { start: dayStart, end: dayEnd })) {
                        if (currentStart < busyStart) {
                            freeSlots.push({ start: formatISO(currentStart), end: formatISO(busyStart) });
                        }
                        currentStart = busyEnd > dayEnd ? dayEnd : busyEnd;
                    }
                });

                if (currentStart < dayEnd) {
                    freeSlots.push({ start: formatISO(currentStart), end: formatISO(dayEnd) });
                }
            }
        });
    });

    return freeSlots;
}
