import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { fetchSchedules, fetchBusySlots, calculateFreeSlots } from '../../utilities/scheduleUtils'; 
import { findEventTypeId } from '../../utilities/eventUtils';
import { getUserDetails } from '../../utilities/userUtils';
import { getAvailableSlots } from '../../utilities/availabilityUtils';

const API_KEY = process.env.API_KEY;
const BASE_URL = 'https://api.cal.com/v1';

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
}

async function createBooking(data: BookingData) {
    try {
        const response = await axios.post(`${BASE_URL}/bookings?apiKey=${API_KEY}`, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error: any) {
        console.error('Error creating booking:', error.response ? error.response.data : error.message);
        if (error.response && error.response.data.message === "no_available_users_found_error") {
            throw new Error('no_available_users_found_error');
        }
        throw new Error(error.response.data.message || 'Failed to create booking');
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Only POST requests allowed' });
        return;
    }

    let bookingData: BookingData | null = null;  // Declare bookingData here
    let user = null;

    try {
        user = await getUserDetails();
        const { start, end, responses, eventTypeSlug, title, description, metadata } = req.body;
        const eventTypeId = await findEventTypeId(eventTypeSlug);        
        bookingData = {
            eventTypeId,
            start,
            end,
            responses: {
                name: responses.name,
                email: responses.email,
                location: {
                    value: responses.location.value,
                    optionValue: responses.location.optionValue,
                    address: responses.location.address
                }
            },
            timeZone: user.timeZone,
            language: user.locale || 'en',
            title,
            description,
            metadata
        };

        const booking = await createBooking(bookingData);
        res.status(201).json(booking);
    } catch (error: any) {
        if (error.message === 'no_available_users_found_error' && bookingData) {
            
            const freeSchedule = await getAvailableSlots(user.username, bookingData.start.split('T')[0]);
            res.status(503).json({ message: 'Slot not available, please choose one of the following slots:', freeSchedule });
        } else {
            const status = error.message.includes('Missing field') ? 400 : 500;
            res.status(status).json({ message: 'Error creating booking', details: error.message });
        }
    }
}
