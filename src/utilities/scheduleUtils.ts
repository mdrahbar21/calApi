import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { parseISO, formatISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

const API_KEY = process.env.API_KEY;
const BASE_URL = 'https://api.cal.com/v1';

// Helper function to fetch schedules
export async function fetchSchedules(username: string) {
    try {
        const schedulesUrl = `${BASE_URL}/schedules?apiKey=${API_KEY}&username=${username}`;
        const response = await axios.get(schedulesUrl);
        return response.data.schedules;
    } catch (error: any) {
        throw new Error('Failed to fetch schedules: ' + (error.response?.data?.message || error.message));
    }
}

// Helper function to fetch busy slots
export async function fetchBusySlots(username: string, date: string) {
    try {
        const availabilityUrl = `${BASE_URL}/availability?apiKey=${API_KEY}&username=${username}&dateFrom=${date}&dateTo=${date}`;
        const response = await axios.get(availabilityUrl);
        return response.data.busy;
    } catch (error: any) {
        throw new Error('Failed to fetch busy slots: ' + (error.response?.data?.message || error.message));
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