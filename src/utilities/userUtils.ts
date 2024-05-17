const API_KEY = process.env.API_KEY;
const BASE_URL = 'https://api.cal.com/v1';

export async function getUserDetails() {
    console.log('called getUserDetails');
    const url = `${BASE_URL}/me?apiKey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.user;
}