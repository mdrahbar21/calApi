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

export async function findEventTypeId(slug: string): Promise<number> {
    try {
        const eventTypes = await getEventTypes();
        const eventType = eventTypes.find(et => et.slug === slug);
        if (eventType) {
            return eventType.id;
        } else {
            throw new Error(`Event type with slug '${slug}' not found`);
        }
    } catch (error: any) {
        throw new Error('Error retrieving event types: ' + (error.response?.data?.message || error.message));
    }
}
