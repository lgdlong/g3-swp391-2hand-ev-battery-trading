import axios from 'axios';
import { DEFAULT_API_BASE_URL } from '@/config/constants';

export const api = axios.create({
  baseURL: DEFAULT_API_BASE_URL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  timeout: 15000,
});
