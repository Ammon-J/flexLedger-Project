import express from 'express';
import authRoutes from './routes/authRoutes.js';
import blockRoutes from './routes/blockRoutes.js';

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: false, limit: '16kb' }));
app.use('/api/auth', authRoutes);
app.use('/api', authRoutes);
app.use('/api/blocks', blockRoutes);

app.use((request, response) => {
	response.status(404).json({ message: 'API route not found.' });
});

app.use((error, request, response, next) => {
	console.error('API request failed:', error);
	if (response.headersSent) return next(error);

	const status = error.code === 'DATABASE_CONFIGURATION_MISSING'
		? 503
		: Number.isInteger(error.status) && error.status >= 400 && error.status < 500
			? error.status
			: 500;
	return response.status(status).json({
		message:
			status === 500
				? 'An unexpected server error occurred.'
				: error.message,
	});
});

export default app;
