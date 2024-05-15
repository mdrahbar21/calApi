import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const API_KEY = process.env.API_KEY;
const BASE_URL = 'https://api.cal.com/v1/bookings';

interface BookingData {
    eventTypeId: number;
    start: string;
    end: string;
    responses: {
        name: string;
        email: string;
        location: {
            type: string; 
            address?: string; 
        };
    };
    timeZone: string;
    language: string;
    title?: string;
    description?: string;
    metadata?: Record<string, any>;
}

// Helper function to create a booking
async function createBooking(data: BookingData) {
    try {
        const response = await axios.post(`${BASE_URL}?apiKey=${API_KEY}`, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
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

    const {
        eventTypeId,
        start,
        end,
        responses,
        timeZone,
        language,
        title,
        description,
        metadata
    } = req.body;

    try {
        // Create the booking
        const booking = await createBooking({
            eventTypeId,
            start,
            end,
            responses,
            timeZone,
            language,
            title,
            description,
            metadata
        });
        res.status(201).json(booking);
    } catch (error: any) {
        res.status(500).json({ message: 'Error creating booking', details: error.message });
    }
}
