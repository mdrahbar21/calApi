import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const API_KEY = process.env.API_KEY;
const BASE_URL = 'https://api.cal.com/v1'; 

async function checkUserAvailability(username: string, date: string, start: string, end: string): Promise<boolean> {
    try {
        const { data } = await axios.get(`${BASE_URL}/availability?apiKey=${API_KEY}&username=${username}&dateFrom=${date}&dateTo=${date}`);
        return data.some((slot: any) => slot.start === start && slot.end === end);
    } catch (error) {
        console.error('Error checking availability:', error);
        return false;
    }
}

async function createBooking(eventTypeId: number, start: string, end: string, username: string): Promise<any> {
    try {
        const body = {
            eventTypeId,
            start,
            end,
            username  // Assume API supports booking by username
        };
        const { data } = await axios.post(`${BASE_URL}/bookings?apiKey=${API_KEY}`, body);
        return data;
    } catch (error) {
        console.error('Error creating booking:', error);
        throw new Error('Failed to create booking');
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Only POST requests allowed' });
        return;
    }

    const { username, eventTypeId, date, start, end } = req.body;

    // Check availability
    const isAvailable = await checkUserAvailability(username, date, start, end);
    if (!isAvailable) {
        res.status(409).json({ message: 'User is not available at the specified time.' });
        return;
    }

    // Create booking
    try {
        const booking = await createBooking(eventTypeId, start, end, username);
        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create booking', error: (error as Error).message });
    }
}
