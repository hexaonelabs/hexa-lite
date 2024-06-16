import { storageService } from '../../services/storage.service';

const isValideInputs = (
	inputs: {
		inputPassword: HTMLInputElement;
		inputEmail?: HTMLInputElement;
	},
	ops?: {
		hideEmail?: boolean;
		hidePassword?: boolean;
	}
) => {
	const { inputPassword, inputEmail } = inputs;
	const { hideEmail, hidePassword } = ops || {};
	const minPasswordLength = 6;
	const maxPasswordLength = 32;
	const isValidEmail = hideEmail ? true : inputEmail?.checkValidity();
	const isValidPassword = hidePassword
		? true
		: !hidePassword &&
			inputPassword?.value.length >= minPasswordLength &&
			inputPassword?.value.length <= maxPasswordLength;
	return isValidEmail && isValidPassword;
};

export const promptEmailPasswordElement = async (
	ref: HTMLElement,
	ops?: {
		hideEmail?: boolean;
		hidePassword?: boolean;
	}
): Promise<{
	password?: string;
	email?: string;
}> => {
	const { hideEmail, hidePassword } = ops || {};
	console.log({ hideEmail, hidePassword });
	const minPasswordLength = 4;
	const maxPasswordLength = 32;
	const isCreating = !(await storageService.isExistingPrivateKeyStored());

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
      <p>
        ${
					isCreating
						? `Enter your ${hideEmail ? '' : 'email '}${hidePassword ? '' : '& password'} to create a new wallet. ${hidePassword ? '' : `The password you enter will only be used to authenticate you.`}`
						: `Enter your ${hideEmail ? '' : 'email '}${hidePassword ? '' : '& password'}`
				}
      </p>
    </div>
    ${
			hideEmail
				? ''
				: `<input 
            class="prompt__input email" 
            name="email"
            type="email" 
            minLength="${minPasswordLength}"
            placeholder="email" />`
		}
    ${
			hidePassword
				? ''
				: `<input 
          class="prompt__input password" 
          name="password"
          type="password" 
          minLength="${minPasswordLength}"
          maxLength="${maxPasswordLength}"
          autocomplet="current-password"
          placeholder="password" />`
		}
    
    <button disabled class="prompt__button">Connect</button>
    `;
		container.innerHTML = html;
		ref.after(container);
		ref.style.display = 'none';

		const inputPassword = container.querySelector(
			'.prompt__input.password'
		) as HTMLInputElement;
		const inputEmail = container.querySelector(
			'.prompt__input.email'
		) as HTMLInputElement;
		const button = container.querySelector(
			'.prompt__button'
		) as HTMLButtonElement;

		// manage validation of input to enable button
		inputPassword?.addEventListener('input', () => {
			const isValid = isValideInputs({ inputPassword, inputEmail }, ops);
			button.disabled = !isValid;
		});
		inputEmail?.addEventListener('input', () => {
			const isValid = isValideInputs({ inputPassword, inputEmail }, ops);
			button.disabled = !isValid;
		});

		button.addEventListener('click', () => {
			resolve({
				password: inputPassword?.value,
				email: inputEmail?.value
			});
			container.remove();
			// prevent flash ui. ref will be hiden to display backup step
			// if is creating wallet. This is why we dont switch to display block
			// if (!isCreating) {
			ref.style.display = 'block';
			// }
		});
	});
};
