import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const API_KEY = process.env.API_KEY;

// Handler for getting available slots on a specific date
export default async function getAvailableSlots(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Only GET requests allowed' });
    return;
  }

  const { date } = req.query;

  if (!date) {
    res.status(400).json({ error: 'Date is required' });
    return;
  }

  try {
    const response = await axios.get(`https://api.cal.com/v1/availability?apiKey=${API_KEY}&date=${date}`);
    res.status(200).json(response.data);
  } catch (error: any) {
    console.error(error.response.data);
    res.status(error.response.status).json(error.response.data);
  }
}
