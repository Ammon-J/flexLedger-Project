export function initializeRegister() {
	const registrationForm = document.querySelector<HTMLFormElement>('.register-form');
	const passwordField = document.querySelector<HTMLInputElement>('#password');
	const confirmPasswordField = document.querySelector<HTMLInputElement>('#confirm-password');

	if (registrationForm && passwordField && confirmPasswordField) {
		const statusMessage = registrationForm.querySelector<HTMLParagraphElement>('.form-message');
		const submitButton = registrationForm.querySelector<HTMLButtonElement>('.submit-button');

		const validatePasswordMatch = () => {
			confirmPasswordField.setCustomValidity(
				confirmPasswordField.value && confirmPasswordField.value !== passwordField.value
					? 'Passwords do not match.'
					: '',
			);
		};

		passwordField.addEventListener('input', validatePasswordMatch);
		confirmPasswordField.addEventListener('input', validatePasswordMatch);

		registrationForm.addEventListener('submit', async (event) => {
			event.preventDefault();
			if (!statusMessage || !submitButton) return;

			statusMessage.textContent = '';
			statusMessage.removeAttribute('data-error');
			submitButton.disabled = true;
			submitButton.textContent = 'Creating account...';

			try {
				const response = await fetch(registrationForm.action, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(Object.fromEntries(new FormData(registrationForm))),
				});
				const result = await response.json();
				if (!response.ok) {
					throw new Error(result.message ?? 'Unable to create your account.');
				}
				statusMessage.textContent = result.message;
				window.location.assign('/blocks');
			} catch (error) {
				statusMessage.dataset.error = 'true';
				statusMessage.textContent =
					error instanceof Error ? error.message : 'Unable to create your account. Please try again.';
			} finally {
				submitButton.disabled = false;
				submitButton.textContent = 'Create account';
			}
		});

		registrationForm.querySelectorAll<HTMLButtonElement>('[data-password-toggle]').forEach((toggle) => {
			toggle.addEventListener('click', () => {
				const targetId = toggle.dataset.passwordToggle;
				const target = targetId ? document.getElementById(targetId) : null;
				if (!(target instanceof HTMLInputElement)) return;

				const shouldShow = target.type === 'password';
				target.type = shouldShow ? 'text' : 'password';
				toggle.setAttribute('aria-label', shouldShow ? 'Hide password' : 'Show password');
			});
		});
	}
}
