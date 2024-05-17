import type { NextApiRequest, NextApiResponse } from 'next';
import { getAvailableSlots } from '../../utilities/availabilityUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.status(405).json({ message: 'Only GET requests allowed' });
        return;
    }

    const { startDate, endDate, username } = req.query;

    if (!startDate || !username) {
        res.status(400).json({ error: 'Username and start date are required' });
        return;
    }

    try {
        const freeSlots = await getAvailableSlots(username as string, startDate as string, endDate as string);
        res.status(200).json({ freeSlots });
    } catch (error: any) {
        console.error('Error fetching availability:', error.message);
        res.status(500).json({ message: 'Error retrieving data', details: error.message });
    }
}
