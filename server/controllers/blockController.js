function parseNonNegativeNumber(value) {
	if (typeof value === 'number') {
		return Number.isFinite(value) && value >= 0 ? value : null;
	}
	if (typeof value !== 'string' || !/^\d+(?:\.\d+)?$/.test(value.trim())) {
		return null;
	}

	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : null;
}

function parseEarnings(value) {
	if (typeof value === 'string' && !/^\d+(?:\.\d{1,2})?$/.test(value.trim())) return null;
	const earnings = parseNonNegativeNumber(value);
	if (earnings === null) return null;
	return typeof value === 'number' &&
		Math.abs(earnings * 100 - Math.round(earnings * 100)) >= 1e-8
		? null
		: earnings;
}

function parseDate(value) {
	if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
	const date = new Date(`${value}T12:00:00.000Z`);
	return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
}

export async function createBlock(request, response, next) {
	try {
		const { date, startOdometer: startValue, endOdometer: endValue } = request.body ?? {};
		const dateValue = parseDate(date);
		if (!dateValue) {
			return response.status(400).json({ message: 'Enter a valid block date.' });
		}

		const startOdometer = parseNonNegativeNumber(startValue);
		if (startOdometer === null) {
			return response.status(400).json({ message: 'Start odometer must be a non-negative number.' });
		}

		const endOdometer = parseNonNegativeNumber(endValue);
		if (endOdometer === null || endOdometer < startOdometer) {
			return response.status(400).json({
				message: 'End odometer must be a non-negative number greater than or equal to the start odometer.',
			});
		}

		const earningsValue = request.body?.earnings;
		let earnings;
		if (earningsValue !== undefined && earningsValue !== null && earningsValue !== '') {
			earnings = parseEarnings(earningsValue);
			if (earnings === null) {
				return response.status(400).json({ message: 'Earnings must be a non-negative amount with up to two decimal places.' });
			}
		}

		const notesValue = request.body?.routeNotes;
		if (notesValue !== undefined && typeof notesValue !== 'string') {
			return response.status(400).json({ message: 'Route notes must be text.' });
		}
		const routeNotes = typeof notesValue === 'string' ? notesValue.trim() : '';
		if (routeNotes.length > 1000) {
			return response.status(400).json({ message: 'Route notes must be 1000 characters or fewer.' });
		}

		const block = {
			userId: request.authenticatedUser._id,
			date: dateValue,
			startOdometer,
			endOdometer,
			milesDriven: endOdometer - startOdometer,
			...(request.authenticatedUser.defaultVehicle
				? { vehicle: request.authenticatedUser.defaultVehicle }
				: {}),
			...(earnings !== undefined ? { earnings } : {}),
			...(routeNotes ? { routeNotes } : {}),
			createdAt: new Date(),
		};
		const result = await request.database.collection('blocks').insertOne(block);

		return response.status(201).json({
			message: 'Delivery block saved.',
			block: {
				id: result.insertedId.toString(),
				date: block.date.toISOString(),
				startOdometer: block.startOdometer,
				endOdometer: block.endOdometer,
				milesDriven: block.milesDriven,
				...(block.vehicle ? { vehicle: block.vehicle } : {}),
				...(block.earnings !== undefined ? { earnings: block.earnings } : {}),
				...(block.routeNotes ? { routeNotes: block.routeNotes } : {}),
			},
		});
	} catch (error) {
		return next(error);
	}
}

export async function listBlocks(request, response, next) {
	try {
		const blocks = await request.database
			.collection('blocks')
			.find({ userId: request.authenticatedUser._id })
			.sort({ date: -1, _id: -1 })
			.toArray();

		return response.status(200).json({
			blocks: blocks.map((block) => ({
				id: block._id.toString(),
				milesDriven: block.milesDriven,
				fuelCost: block.fuelCost ?? 0,
				...(block.startOdometer !== undefined ? { startOdometer: block.startOdometer } : {}),
				...(block.endOdometer !== undefined ? { endOdometer: block.endOdometer } : {}),
				...(block.vehicle ? { vehicle: block.vehicle } : {}),
				...(block.earnings !== undefined ? { earnings: block.earnings } : {}),
				...(block.routeNotes ? { routeNotes: block.routeNotes } : {}),
				date: block.date instanceof Date ? block.date.toISOString() : block.date,
			})),
		});
	} catch (error) {
		return next(error);
	}
}
