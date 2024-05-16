import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { parseISO, formatISO } from 'date-fns';

const API_KEY = process.env.API_KEY;
const BASE_URL = 'https://api.cal.com/v1';

// Helper function to fetch schedules
async function fetchSchedules(username: string) {
    try {
        const schedulesUrl = `${BASE_URL}/schedules?apiKey=${API_KEY}&username=${username}`;
        const response = await axios.get(schedulesUrl);
        return response.data.schedules;
    } catch (error: any) {
        throw new Error('Failed to fetch schedules: ' + (error.response?.data?.message || error.message));
    }
}

// Helper function to fetch busy slots
async function fetchBusySlots(username: string, date: string) {
    try {
        const availabilityUrl = `${BASE_URL}/availability?apiKey=${API_KEY}&username=${username}&dateFrom=${date}&dateTo=${date}`;
        const response = await axios.get(availabilityUrl);
        return response.data.busy;
    } catch (error: any) {
        throw new Error('Failed to fetch busy slots: ' + (error.response?.data?.message || error.message));
    }
}

// Helper function to calculate free time slots
function calculateFreeSlots(schedules: any[], busySlots: any[]) {
    let freeSlots: { start: string, end: string }[] = [];
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

    return freeSlots;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.status(405).json({ message: 'Only GET requests allowed' });
        return;
    }

    const { username, date } = req.query;

    if (!username || typeof username !== 'string' || !date || typeof date !== 'string') {
        res.status(400).json({ error: 'Username and date are required as string types' });
        return;
    }

    try {
        const schedules = await fetchSchedules(username);
        const busySlots = await fetchBusySlots(username, date);
        const freeSlots = calculateFreeSlots(schedules, busySlots);
        res.status(200).json({ freeSlots });
    } catch (error:any) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving data', details: error.message });
    }
}
