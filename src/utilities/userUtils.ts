import axios from "axios";

const API_KEY = process.env.API_KEY;
const BASE_URL = 'https://api.cal.com/v1';

export async function getUserDetails() {
    const url = `${BASE_URL}/me?apiKey=${API_KEY}`;
    const response = await axios.get(url);
    return response.data.user;
}