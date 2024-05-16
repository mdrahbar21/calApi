import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const API_KEY = process.env.API_KEY;
const BASE_URL = 'https://api.cal.com/v1/bookings';

interface BookingRequest {
  eventTypeId: number;
  eventTypeSlug?: string;
  start: string;
  end?: string;
  timeZone: string;
  language: string;
  metadata: Record<string, any>;
  responses: {
    name: string;
    email: string;
    location: {
      value?: string;
      optionValue: string;
    };
    guests?: any[];
  };
  hasHashedBookingLink?: boolean;
}

async function createBooking(data: BookingRequest) {
  try {
    const response = await axios.post(`${BASE_URL}?apiKey=${API_KEY}`, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error:any) {
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
    eventTypeSlug,
    start,
    end,
    timeZone,
    language,
    metadata,
    responses,
    hasHashedBookingLink
  } = req.body;

  try {
    const booking = await createBooking({
      eventTypeId,
      eventTypeSlug,
      start,
      end,
      timeZone,
      language,
      metadata,
      responses,
      hasHashedBookingLink
    });
    res.status(201).json(booking);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating booking', details: error.message });
  }
}
