import { request, query } from './client.js'
export const getPrompt = (exclude) => request(query('/api/diaries/prompts/', { exclude }))
