import { findEventTypeId } from './eventUtils';
import { getUserDetails } from './userUtils';
import { getAvailableSlots, getSlots,mergeSlots  } from './availabilityUtils';

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

function checkRequiredFields(reqBody: any) {
    if (!reqBody.eventTypeSlug) throw new Error("Missing field: eventTypeSlug (the slug of the event's URL, if URL of your event is 'cal.com/ignis-lumen/15min', then eventTypeSlug ='15min')");
    if (!reqBody.start) throw new Error('Missing field: start');
    if (!reqBody.timeZone) throw new Error('Missing field: timeZone');
    if (!reqBody.language) throw new Error('Missing field: language');
    if (!reqBody.metadata) throw new Error('Missing field: metadata');
    if (!reqBody.responses) throw new Error('Missing field: responses');
    if (!reqBody.responses.name) throw new Error('Missing field: responses.name');
    if (!reqBody.responses.email) throw new Error('Missing field: responses.email');
    if (!reqBody.responses.location) throw new Error('Missing field: responses.location');
    if (!reqBody.responses.location.value) throw new Error('Missing field: responses.location.value');
}

export async function createBooking(reqBody: any) {
    const user = await getUserDetails();
    checkRequiredFields(reqBody);
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
        const free_slots = await getSlots(reqBody.start, eventTypeId, reqBody.end, reqBody.timeZone);
    
        if (!Array.isArray(free_slots) || !free_slots.length) {
            return { success: false, status: 503, message: 'No slots available, either it is not a working day or all slots are booked' };
        }
    
        const formattedSlots = free_slots.map((slot:any) => slot.time).join(', ');
    
        if (!formattedSlots.length) {
            return { success: false, status: 503, message: 'No slots available or unable to parse slots data' };
        }    
        return { success: false, status: 503, message: `Slot not available, please choose one of the following slots: ${formattedSlots}` };
    }
    
    
    return data;
}

