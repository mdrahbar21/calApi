import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const API_KEY = process.env.API_KEY;
const BASE_URL = 'https://api.cal.com/v1/bookings';

interface BookingData {
    eventTypeId: number;
    start: string;
    end?: string;
    responses: {
        name: string;
        email: string;
        location: {
            value: string;
            optionValue?: string;
            address?: string;
        };
    };
    timeZone: string;
    language: string;
    title?: string;
    description?: string;
    metadata: Record<string, any>;
    [key: string]: any; 
}

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
        if (error.response) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Failed to create booking');
    }
}

// Function to validate required fields
function validateBookingFields(fields: BookingData) {
    const requiredFields = ['eventTypeId', 'start', 'responses', 'timeZone', 'language','metadata'];
    for (const field of requiredFields) {
        if (fields[field] === undefined) {
            throw new Error(`Missing field: ${field}`);
        }
    }
    if (!fields.responses.name || !fields.responses.email || !fields.responses.location.value) {
        throw new Error('Missing property on booking entity.');
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Only POST requests allowed' });
        return;
    }

    try {
        const { eventTypeId, start, end, responses, timeZone, language, title, description, metadata } = req.body;

        // Validate all required fields
        validateBookingFields({ eventTypeId, start, end, responses, timeZone, language, title, description, metadata });

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
        const status = error.message.includes('Missing field') ? 400 : 500;
        res.status(status).json({ message: 'Error creating booking', details: error.message });
    }
}
