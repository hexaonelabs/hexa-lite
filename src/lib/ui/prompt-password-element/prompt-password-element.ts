/* eslint-disable @typescript-eslint/no-explicit-any */
import { storageService } from '../../services/storage.service';

export const promptPasswordElement = async (
	ref: HTMLElement
): Promise<string | null> => {
	const minPasswordLength = 6;
	const maxPasswordLength = 32;

	const isCreating = !(await storageService.isExistingPrivateKeyStored());
	console.log('isCreating', isCreating);
	const isValideInputs = (value: string, confirmeValue?: string) => {
		if (!confirmeValue) {
			return (
				value.length > minPasswordLength - 1 &&
				value.length < maxPasswordLength - 1
			);
		}
		return (
			value.length >= minPasswordLength - 1 &&
			confirmeValue?.length > minPasswordLength - 1 &&
			value === confirmeValue &&
			value.length < maxPasswordLength - 1
		);
	};

	const focusNextInput = (input: HTMLInputElement) => {
		// focus next input
		const next = input.nextElementSibling as HTMLInputElement | null;
		if (next) {
			next.focus();
		} else {
			input.blur();
		}
	};

	return new Promise(resolve => {
		const container = document.createElement('div');
		container.classList.add('prompt-container');
		const html = `
    <style>
      .prompt-container {
        background: var(--dialog-background-color);
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 0rem;
        box-sizing: border-box;
      }

      .prompt__input {
        display: block;
        min-height: 50px;
        width: 100%;
        max-width: 300px;
        margin: 0rem auto 0.5rem;
        text-align: center;
        color: var(--text-color);
        background: var(--button-background);
        border: var(--dialog-border);
        border-radius: 12px;
        padding: 12px 16px;
        font-size: 1em;
        text-align: center;
      }
			.prompt__input.single {
				width: 45px;
				display: inline;
			}
      .prompt__message { 
        margin-bottom: 1.5rem;
      }
			.prompt__message h4 {
				margin: 0 auto -0.7rem;
				font-size: 1.3em;
			}
      .prompt__button {
        margin-top: 1rem;
      }

    </style>
      <div class="prompt__message">
				${isCreating ? '<h4>Create a new Wallet</h4>' : '<h4>Connect to your Wallet</h4>'}
        <p><b>${
					isCreating ? 'Protect your Wallet with a password' : 'Welcome back!'
				}</b></p>
        <p>
          ${
						isCreating
							? `The password you enter encrypts your private key & gives access to your funds. Please store your password in a safe place. We don’t keep your information & can’t restore it.`
							: `Unlock with your password.`
					}
        </p>
      </div>
			<div id="inputs">
					<input class="prompt__input password single" type="password" maxLength="1" inputmode="numeric" />
					<input class="prompt__input password single" type="password" maxLength="1" inputmode="numeric" />
					<input class="prompt__input password single" type="password" maxLength="1" inputmode="numeric" />
					<input class="prompt__input password single" type="password" maxLength="1" inputmode="numeric" />
					<input class="prompt__input password single" type="password" maxLength="1" inputmode="numeric" />
					<input class="prompt__input password single" type="password" maxLength="1" inputmode="numeric" />
			</div>
      <button disabled class="prompt__button">OK</button>
			${
				!isCreating
					? `<button type="reset" id="create-new-wallet">
			<small>Create new Wallet</small>
		</button>`
					: ''
			}
			
    `;
		container.innerHTML = html;
		ref.after(container);
		ref.style.display = 'none';

		const inputs = Array.from(
			container.querySelectorAll('.prompt__input.single')
		) as HTMLInputElement[];
		const button = container.querySelector(
			'.prompt__button'
		) as HTMLButtonElement;
		button.addEventListener('click', () => {
			resolve(inputs.map(i => i.value).join(''));
			container.remove();
			// prevent flash ui. ref will be hiden to display backup step
			// if is creating wallet. This is why we dont switch to display block
			// if (!isCreating) {
			// 	ref.style.display = 'block';
			// }
			ref.style.display = 'block';
		});

		// manage validation of input to enable button
		for (let index = 0; index < inputs.length; index++) {
			const input = inputs[index];
			input.addEventListener('focus', e => {
				// clear input value on focus and prevent autofill & preventDefault
				e.preventDefault();
				input.value = '';
				const isValid = isValideInputs(inputs.map(i => i.value).join(''));
				button.disabled = !isValid;
			});
			input.addEventListener('input', () => {
				if (input.value !== '' && input.value.length === 1) {
					focusNextInput(input);
				}
				const isValid = isValideInputs(inputs.map(i => i.value).join(''));
				button.disabled = !isValid;
			});
		}

		//  manage reset & create new wallet
		const createBtn = container.querySelector(
			'#create-new-wallet'
		) as HTMLButtonElement;
		createBtn?.addEventListener('click', () => {
			resolve(null);
			container.remove();
			ref.style.display = 'block';
		});
	});
};
