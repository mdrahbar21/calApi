import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const API_KEY = process.env.API_KEY;  

export default async function getAvailableSlotsRange(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Only GET requests allowed' });
    return;
  }

  const { dateFrom, dateTo, username } = req.query;

  if (!dateFrom || !dateTo) {
    res.status(400).json({ error: 'Start date and end date are required' });
    return;
  }

  try {
    const response = await axios.get(`https://api.cal.com/v1/availability?apiKey=${API_KEY}&dateFrom=${dateFrom}&dateTo=${dateTo}&username=${username}`);
    res.status(200).json(response.data);
  } catch (error: any) {
    console.error(error.response.data);
    res.status(error.response.status).json(error.response.data);
  }
}
