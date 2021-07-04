'user strict';
import dotenv from 'dotenv';
dotenv.config();

export const apiBaseUrl = process.env.VUE_APP_BACKEND_API_URL;
