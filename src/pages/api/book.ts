import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { fetchSchedules, fetchBusySlots, calculateFreeSlots } from '../../utilities/scheduleUtils'; 

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
    [key: string]: any; 
}

async function getUserDetails() {
    const url = `${BASE_URL}/me?apiKey=${API_KEY}`;
    const response = await axios.get(url);
    return response.data.user;
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

async function findFreeSchedule(username: string, date: string) {
    try {
        const schedules = await fetchSchedules(username);
        const busySlots = await fetchBusySlots(username, date);
        const freeSlots = calculateFreeSlots(schedules, busySlots, date);
        return { freeSlots }; // Returning directly as data
    } catch (error: any) {
        console.error('Error fetching free schedule:', error);
        throw new Error('Failed to fetch free schedule');
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Only POST requests allowed' });
        return;
    }

    let user: any = null;
    let bookingData: BookingData | null = null;

    try {
        user = await getUserDetails();
        const { eventTypeId, start, end, responses, title, description, metadata } = req.body;
        
        bookingData = {
            eventTypeId,
            start,
            end,
            responses: {
                name: user.name,
                email: user.email,
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
        if (error.message === 'no_available_users_found_error' && user && bookingData) {
            const freeSchedule = await findFreeSchedule(user.username, bookingData.start.split('T')[0]);
            res.status(503).json({ message: 'Slot not available, please choose one of the following slots:', freeSchedule });
        } else {
            const status = error.message.includes('Missing field') ? 400 : 500;
            res.status(status).json({ message: 'Error creating booking', details: error.message });
        }
    }
}
