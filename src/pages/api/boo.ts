import type { NextApiRequest, NextApiResponse } from 'next';
import { createBooking } from '../../utilities/bookingUtils';
import { getAvailableSlots } from '../../utilities/availabilityUtils';
import { getUserDetails } from '../../utilities/userUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Only POST requests allowed' });
        return;
    }
    let user=null;
    try {
        const booking = await createBooking(req.body);
        res.status(201).json(booking);
    } catch (error: any) {
        if (error.message === 'no_available_users_found_error') {
            console.log(req.body);
        } else {
            const status = error.message.includes('Missing field') ? 400 : 500;
            res.status(status).json({ message: 'Error creating booking', details: error.message });
        }
    }
}
