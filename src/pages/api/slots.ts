import type { NextApiRequest, NextApiResponse } from 'next';
import { getSlots } from '../../utilities/availabilityUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Only GET requests allowed' });
    }

    const { startTime, endTime, timeZone, eventTypeSlug } = req.query;
    let eventTypeId = Number(req.query.eventTypeId);

    try {
        const freeSlots = await getSlots(startTime as string, eventTypeId as number, endTime as string, eventTypeSlug as string,);
        res.status(200).json({ freeSlots });
    } catch (error: any) {
        console.error('Error fetching availability:', error.message);
        res.status(500).json({ message: 'Error retrieving data', details: error.message });
    }
}
