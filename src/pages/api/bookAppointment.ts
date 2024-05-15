import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const API_KEY = process.env.API_KEY;
const BASE_URL = 'https://api.cal.com/v1/bookings';

async function createBooking(data: {
    eventTypeId: number,
    start: string,
    end: string,
    userId: string,
    title: string,
    description?: string,
    timeZone: string,
    language?: string,
    status?: string
}) {
    try {
        const response = await axios.post(`${BASE_URL}?apiKey=${API_KEY}`, data);
        return response.data;
    } catch (error: any) {
        console.error('Error creating booking:', error.response ? error.response.data : error.message);
        throw new Error('Failed to create booking');
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Only POST requests allowed' });
        return;
    }

    const { eventTypeId, start, end, userId, title, description, timeZone, language, status } = req.body;

    try {
        // Create the booking
        const booking = await createBooking({ eventTypeId, start, end, userId, title, description, timeZone, language, status });
        res.status(201).json(booking);
    } catch (error: any) {
        res.status(500).json({ message: 'Error creating booking', details: error.message });
    }
}
