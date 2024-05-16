import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const API_KEY = process.env.API_KEY;
const BASE_URL = 'https://api.cal.com/v1/event-types';

interface EventType {
  id: number;
  title: string;
  slug: string;
  length: number;
  userId: number;
  description?: string; 
}

async function getEventTypes(): Promise<EventType[]> {
  try {
    const response = await axios.get(`${BASE_URL}?apiKey=${API_KEY}`);
    // Extract the event_types from response data and map to desired format
    const eventTypes = response.data.event_types.map((event: any) => ({
      id: event.id,
      title: event.title,
      slug: event.slug,
      length: event.length,
      userId: event.userId,
      description: event.description || `not available :(`  
    }));
    return eventTypes;
  } catch (error: any) {
    console.error('Error fetching event types:', error.response ? error.response.data : error.message);
    throw new Error('Failed to fetch event types');
  }
}

export default async function findEventTypeId(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.status(405).json({ message: 'Only GET requests allowed' });
        return;
    }
    
    try {
        const eventTypes = await getEventTypes();
        res.status(200).json({ eventTypes });
    } catch (error:any) {
        res.status(500).json({ message: 'Error retrieving event types', details: error.message });
    }
}
