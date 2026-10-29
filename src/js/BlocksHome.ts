export function initializeBlocksHome() {
	type User = { firstName: string; lastName: string; email: string };
	type Block = { id: string; milesDriven: number; fuelCost: number; date: string };

	const dateFormatter = new Intl.DateTimeFormat(undefined, {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
	const monthFormatter = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' });
	const currencyFormatter = new Intl.NumberFormat(undefined, {
		style: 'currency',
		currency: 'USD',
	});

	const longDate = document.querySelector<HTMLElement>('[data-long-date]');
	const todayDate = document.querySelector<HTMLElement>('[data-today]');
	const firstNameElement = document.querySelector<HTMLElement>('[data-first-name]');
	const initialsElement = document.querySelector<HTMLElement>('[data-initials]');
	const syncTitle = document.querySelector<HTMLElement>('[data-sync-title]');
	const syncDetail = document.querySelector<HTMLElement>('[data-sync-detail]');
	const totalMilesElement = document.querySelector<HTMLElement>('[data-total-miles]');
	const totalFuelElement = document.querySelector<HTMLElement>('[data-total-fuel]');
	const blockCountElement = document.querySelector<HTMLElement>('[data-block-count]');
	const periodSelect = document.querySelector<HTMLSelectElement>('[data-period]');
	const loadingElement = document.querySelector<HTMLElement>('[data-loading]');
	const emptyElement = document.querySelector<HTMLElement>('[data-empty]');
	const listElement = document.querySelector<HTMLDivElement>('[data-block-list]');
	const errorElement = document.querySelector<HTMLElement>('[data-error]');
	const errorMessageElement = document.querySelector<HTMLElement>('[data-error-message]');
	const viewAllButton = document.querySelector<HTMLButtonElement>('[data-view-all]');
	const retryButton = document.querySelector<HTMLButtonElement>('[data-retry]');

	const now = new Date();
	if (longDate) longDate.textContent = dateFormatter.format(now);
	if (todayDate) todayDate.textContent = dateFormatter.format(now);

	let blocks: Block[] = [];
	let showAll = false;

	function getSelectedBlocks() {
		if (!periodSelect || periodSelect.value === 'all') return blocks;
		return blocks.filter((block) => {
			const date = new Date(block.date);
			return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` === periodSelect.value;
		});
	}

	function renderBlocks() {
		if (!listElement || !emptyElement || !viewAllButton) return;
		const selected = getSelectedBlocks();
		const shown = showAll ? selected : selected.slice(0, 3);
		const totalMiles = selected.reduce((sum, block) => sum + block.milesDriven, 0);
		const totalFuel = selected.reduce((sum, block) => sum + block.fuelCost, 0);

		if (totalMilesElement) totalMilesElement.textContent = `${new Intl.NumberFormat().format(totalMiles)} mi`;
		if (totalFuelElement) totalFuelElement.textContent = currencyFormatter.format(totalFuel);
		if (blockCountElement) {
			blockCountElement.textContent = `${selected.length} ${selected.length === 1 ? 'delivery block' : 'delivery blocks'}`;
		}
		if (viewAllButton) {
			viewAllButton.hidden = selected.length <= 3;
			viewAllButton.textContent = showAll ? 'Show less' : 'View all';
		}

		listElement.replaceChildren();
		if (selected.length === 0) {
			listElement.hidden = true;
			emptyElement.hidden = false;
			return;
		}
		emptyElement.hidden = true;
		listElement.hidden = false;

		for (const block of shown) {
			const row = document.createElement('article');
			row.className = 'block-row';

			const dateText = document.createElement('span');
			dateText.className = 'block-date';
			dateText.textContent = dateFormatter.format(new Date(block.date));

			const metrics = document.createElement('span');
			metrics.className = 'block-metrics';
			metrics.textContent = `${new Intl.NumberFormat().format(block.milesDriven)} mi`;

			const fuel = document.createElement('span');
			fuel.className = 'block-fuel';
			fuel.textContent = currencyFormatter.format(block.fuelCost);

			const synced = document.createElement('small');
			synced.className = 'block-status';
			synced.textContent = '✓ Synced';

			row.append(dateText, metrics, fuel, synced);
			listElement.append(row);
		}
	}

	async function loadDashboard() {
		if (!loadingElement || !errorElement || !errorMessageElement || !emptyElement || !listElement) return;
		loadingElement.hidden = false;
		errorElement.hidden = true;
		emptyElement.hidden = true;
		listElement.hidden = true;

		try {
			const [userResponse, blocksResponse] = await Promise.all([
				fetch('/api/me'),
				fetch('/api/blocks'),
			]);
			if (userResponse.status === 401 || blocksResponse.status === 401) {
				window.location.replace('/login');
				return;
			}
			const userResult = await userResponse.json();
			const blocksResult = await blocksResponse.json();
			if (!userResponse.ok) throw new Error(userResult.message ?? 'Unable to load your account.');
			if (!blocksResponse.ok) throw new Error(blocksResult.message ?? 'Unable to load your delivery blocks.');

			const user = userResult.user as User;
			const receivedBlocks = blocksResult.blocks as Block[];
			if (!Array.isArray(receivedBlocks)) throw new Error('The blocks API returned an invalid response.');
			blocks = receivedBlocks;

			if (firstNameElement) firstNameElement.textContent = `, ${user.firstName}`;
			if (initialsElement) {
				initialsElement.textContent = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();
			}
			if (syncTitle) syncTitle.textContent = 'Online · ledger synced';
			if (syncDetail) syncDetail.textContent = 'Your account and delivery blocks are up to date.';

			if (periodSelect) {
				const months = [...new Set(blocks.map((block) => {
					const date = new Date(block.date);
					return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
				}))];
				for (const month of months) {
					const option = document.createElement('option');
					option.value = month;
					option.textContent = monthFormatter.format(new Date(`${month}-01T12:00:00`));
					periodSelect.append(option);
				}
				const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
				if (months.includes(currentMonth)) periodSelect.value = currentMonth;
			}
			renderBlocks();
		} catch (error) {
			errorMessageElement.textContent =
				error instanceof Error ? error.message : 'Please check your connection and try again.';
			errorElement.hidden = false;
		} finally {
			loadingElement.hidden = true;
		}
	}

	periodSelect?.addEventListener('change', () => {
		showAll = false;
		renderBlocks();
	});
	viewAllButton?.addEventListener('click', () => {
		showAll = !showAll;
		renderBlocks();
	});
	retryButton?.addEventListener('click', loadDashboard);

	document.querySelectorAll<HTMLButtonElement>('[data-logout]').forEach((button) => {
		button.addEventListener('click', async () => {
			button.disabled = true;
			try {
				const response = await fetch('/api/logout', { method: 'POST' });
				if (!response.ok) throw new Error('Unable to sign out. Please try again.');
				window.location.replace('/');
			} catch (error) {
				if (errorElement && errorMessageElement) {
					errorMessageElement.textContent = error instanceof Error ? error.message : 'Unable to sign out.';
					errorElement.hidden = false;
				}
				button.disabled = false;
			}
		});
	});

	void loadDashboard();
}
