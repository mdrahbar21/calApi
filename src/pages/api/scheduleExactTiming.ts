import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const API_KEY = process.env.API_KEY;

export default async function scheduleExactTiming(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Only POST requests allowed' });
    return;
  }

  const { time } = req.body;

  if (!time) {
    res.status(400).json({ error: 'start_time is required' });
    return;
  }

  try {
    const response = await axios.post(`https://api.cal.com/v1/bookings?apiKey=${API_KEY}`, { time });
    res.status(200).json(response.data);
  } catch (error: any) {
    console.error(error.response.data);
    res.status(error.response.status).json(error.response.data);
  }
}
