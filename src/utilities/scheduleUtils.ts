import axios from 'axios';
import { parseISO, formatISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

const API_KEY = process.env.API_KEY;
const BASE_URL = 'https://api.cal.com/v1';

// Helper function to fetch schedules using fetch
export async function fetchSchedules(username: string) {
    const schedulesUrl = `${BASE_URL}/schedules?apiKey=${API_KEY}&username=${username}`;
    try {
        const response = await fetch(schedulesUrl);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error('Failed to fetch schedules: ' + (errorData.message || response.statusText));
        }
        const data = await response.json();
        return data.schedules;
    } catch (error: any) {
        throw new Error('Failed to fetch schedules: ' + error.message);
    }
}

// Helper function to fetch busy slots using fetch
export async function fetchBusySlots(username: string, date: string) {
    const availabilityUrl = `${BASE_URL}/availability?apiKey=${API_KEY}&username=${username}&dateFrom=${date}&dateTo=${date}`;
    try {
        const response = await fetch(availabilityUrl);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error('Failed to fetch busy slots: ' + (errorData.message || response.statusText));
        }
        const data = await response.json();
        return data.busy;
    } catch (error: any) {
        throw new Error('Failed to fetch busy slots: ' + error.message);
    }
}

// Helper function to calculate free time slots
export function calculateFreeSlots(schedules: any[], busySlots: any[], queryDate: string) {
    let freeSlots: { start: string, end: string }[] = [];
    const targetDateStart = startOfDay(parseISO(queryDate)); 
    const targetDateEnd = endOfDay(parseISO(queryDate)); 

    schedules.forEach(schedule => {
        schedule.availability.forEach((wh: any) => {
            let dayStart = parseISO(`${wh.date}T${wh.startTime}`);
            let dayEnd = parseISO(`${wh.date}T${wh.endTime}`);

            let currentStart = dayStart;
            busySlots.forEach(slot => {
                let busyStart = parseISO(slot.start);
                let busyEnd = parseISO(slot.end);

                if (currentStart < busyStart) {
                    freeSlots.push({ start: formatISO(currentStart), end: formatISO(busyStart) });
                }
                currentStart = busyEnd;
            });

            if (currentStart < dayEnd) {
                freeSlots.push({ start: formatISO(currentStart), end: formatISO(dayEnd) });
            }
        });
    });

    // Remove duplicates
    const uniqueSlots = Array.from(new Set(freeSlots.map(slot => JSON.stringify(slot))))
                             .map(slot => JSON.parse(slot));

    // Filter slots to include only those that intersect with the query date
    return uniqueSlots.filter(slot =>
        isWithinInterval(parseISO(slot.start), { start: targetDateStart, end: targetDateEnd }) ||
        isWithinInterval(parseISO(slot.end), { start: targetDateStart, end: targetDateEnd }) ||
        (parseISO(slot.start) <= targetDateStart && parseISO(slot.end) >= targetDateEnd)
    );
}

export function calculateFreeSlotsAll(schedules: any[], busySlots: any[]) {
    let freeSlots: { start: string, end: string }[] = [];
    let uniqueSlotSet = new Set<string>();  // Set to track unique slots

    schedules.forEach(schedule => {
        schedule.availability.forEach((wh: any) => {
            let dayStart = parseISO(`${wh.date}T${wh.startTime}`);
            let dayEnd = parseISO(`${wh.date}T${wh.endTime}`);

            let currentStart = dayStart;
            busySlots.forEach(slot => {
                let busyStart = parseISO(slot.start);
                let busyEnd = parseISO(slot.end);

                if (currentStart < busyStart) {
                    let start = formatISO(currentStart);
                    let end = formatISO(busyStart);
                    let slotString = JSON.stringify({ start, end });
                    if (!uniqueSlotSet.has(slotString)) {
                        freeSlots.push({ start, end });
                        uniqueSlotSet.add(slotString);  // Add to set to track uniqueness
                    }
                }
                currentStart = busyEnd;
            });

            if (currentStart < dayEnd) {
                let start = formatISO(currentStart);
                let end = formatISO(dayEnd);
                let slotString = JSON.stringify({ start, end });
                if (!uniqueSlotSet.has(slotString)) {
                    freeSlots.push({ start, end });
                    uniqueSlotSet.add(slotString);  // Add to set to track uniqueness
                }
            }
        });
    });

    return freeSlots;
}
