import { Router } from 'express';
import { login, logout, register } from '../controllers/authController.js';

const authRoutes = Router();

const postOnly = (request, response) => {
	response.set('Allow', 'POST');
	return response.status(405).json({
		message: `Use POST /api${request.baseUrl === '/api/auth' ? '/auth' : ''}${request.path} to submit this request.`,
	});
};

authRoutes.get('/register', postOnly);
authRoutes.get('/login', postOnly);
authRoutes.get('/logout', postOnly);
authRoutes.post('/register', register);
authRoutes.post('/login', login);
authRoutes.post('/logout', logout);

export default authRoutes;
