import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

interface ApiRequest extends NextApiRequest {
  body: {
    type: string;
    date?: string;
    start_time?: string;
    start_date?: string;
    end_date?: string;
    num_slots?: number;
  };
}

const API_KEY = process.env.API_KEY;

export default async function handler(req: ApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Only POST requests allowed' });
    return;
  }

  const { type, date, start_time, start_date, end_date, num_slots = 3 } = req.body;

  try {
    switch (type) {
      case 'exact':
        if (start_time) {
          await scheduleExactTiming(start_time, res);
        } else {
          res.status(400).json({ error: 'start_time is required for exact scheduling' });
        }
        break;
      case 'date':
        if (date) {
          await getAvailableSlots(date, num_slots, res);
        } else {
          res.status(400).json({ error: 'date is required for date scheduling' });
        }
        break;
      case 'range':
        if (start_date && end_date) {
          await getAvailableSlotsRange(start_date, end_date, num_slots, res);
        } else {
          res.status(400).json({ error: 'start_date and end_date are required for range scheduling' });
        }
        break;
      default:
        res.status(400).json({ error: 'Invalid request type specified' });
    }
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}

async function scheduleExactTiming(time: string, res: NextApiResponse) {
  try {
    const response = await axios.post(`https://api.cal.com/v1/bookings?apiKey=${API_KEY}`, { time });
    res.status(200).json(response.data);
  } catch (error: any) {
    console.error(error.response.data);
    res.status(error.response.status).json(error.response.data);
  }
}

async function getAvailableSlots(date: string, num_slots: number, res: NextApiResponse) {
  try {
    const response = await axios.get(`https://api.cal.com/v1/availability?apiKey=${API_KEY}&date=${date}`);
    const slots = response.data.slots.slice(0, num_slots);
    res.status(200).json({ available_slots: slots });
  } catch (error: any) {
    console.error(error.response.data);
    res.status(error.response.status).json(error.response.data);
  }
}

async function getAvailableSlotsRange(start_date: string, end_date: string, num_slots: number, res: NextApiResponse) {
  try {
    const response = await axios.get(`https://api.cal.com/v1/availability?apiKey=${API_KEY}&start_date=${start_date}&end_date=${end_date}`);
    const slots = response.data.slots.slice(0, num_slots);
    res.status(200).json({ available_slots: slots });
  } catch (error: any) {
    console.error(error.response.data);
    res.status(error.response.status).json(error.response.data);
  }
}
