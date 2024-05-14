import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const API_KEY = process.env.API_KEY;

export default async function getAvailableSlots(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Only GET requests allowed' });
    return;
  }

  const { date } = req.query;
  const dateFrom=date;
  const dateTo = date;
    if (!date) {
    res.status(400).json({ error: 'Date is required' });
    return;
  }

  try {
    const url = `https://api.cal.com/v1/availability?apiKey=${API_KEY}&dateFrom=${dateFrom}&dateTo=${dateTo}`;
    
    const response = await axios.get(url);
    
    res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Failed to fetch available slots:', error.response ? error.response.data : error.message);
    res.status(error.response ? error.response.status : 500).json({
      error: 'Failed to fetch available slots',
      details: error.response ? error.response.data : 'Server error'
    });
}
}
