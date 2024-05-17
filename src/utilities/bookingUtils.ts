import { findEventTypeId } from './eventUtils';
import { getUserDetails } from './userUtils';
import { getAvailableSlots } from './availabilityUtils';

const API_KEY = process.env.API_KEY;
const BASE_URL = 'https://api.cal.com/v1';

export interface BookingData {
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

export async function createBooking(reqBody: any) {
    const user = await getUserDetails();
    const eventTypeId = await findEventTypeId(reqBody.eventTypeSlug);
    const bookingData: BookingData = {
        eventTypeId,
        start: reqBody.start,
        end: reqBody.end,
        responses: {
            name: reqBody.responses.name,
            email: reqBody.responses.email,
            location: {
                value: reqBody.responses.location.value,
                optionValue: reqBody.responses.location.optionValue,
                address: reqBody.responses.location.address
            }
        },
        timeZone: user.timeZone,
        language: user.locale || 'en',
        title: reqBody.title,
        description: reqBody.description,
        metadata: reqBody.metadata
    };

    const response = await fetch(`${BASE_URL}/bookings?apiKey=${API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
    });

    const data = await response.json();
    if (!response.ok) {
        // throw new Error(data.message || 'Failed to create booking');
        const free_slots = await getAvailableSlots(user.username, reqBody.start.split('T')[0]);
        if (free_slots.length==0){
            return { success: false, status: 503, message: 'No slots available, either it is Sunday or all slots are booked' };
        }
        else {
            const formattedSlots = free_slots.map(slot => `${slot.start} to ${slot.end}`).join(', ');
            return { success: false, status: 503, message: `Slot not available, please choose one of the following slots: ${formattedSlots}` };
        }

    }
    return data;
}
