import type { NextApiRequest, NextApiResponse } from 'next';

import { fetchSchedules, fetchBusySlots, calculateFreeSlots } from '../../utilities/scheduleUtils';


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
        const freeSlots = calculateFreeSlots(schedules, busySlots, date);
        res.status(200).json({ freeSlots });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving data', details: error.message });
    }
}
