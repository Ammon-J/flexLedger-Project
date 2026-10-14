export function currentUser(request, response) {
	const user = request.authenticatedUser;
	return response.status(200).json({
		user: {
			id: user._id.toString(),
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			...(user.defaultVehicle ? { defaultVehicle: user.defaultVehicle } : {}),
		},
	});
}
