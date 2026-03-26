import express from 'express';
import axios from 'axios';
import rateLimit from 'express-rate-limit';
import NodeCache from 'node-cache';

const router = express.Router();

// Create a cache instance with a standard TTL (time to live)
const cache = new NodeCache({ stdTTL: 300 }); // Cache expires after 5 minutes

// Rate limiter to allow 100 requests per 15 minutes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.'
});

// Rate limit the routes that use TMDB API calls
router.use(limiter);

// TMDB API key (make sure to set this up according to your environment)
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Example endpoint to fetch popular movies
router.get('/popular-movies', async (req, res) => {
    try {
        // Check cache for response
        const cacheKey = 'popular-movies';
        const cachedResponse = cache.get(cacheKey);
        if (cachedResponse) {
            return res.json(cachedResponse);
        }

        // Fetch data from TMDB API
        const response = await axios.get(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`);

        // Store response in cache
        cache.set(cacheKey, response.data);

        // Send response back to client
        return res.json(response.data);
    } catch (error) {
        console.error('Error fetching popular movies:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
