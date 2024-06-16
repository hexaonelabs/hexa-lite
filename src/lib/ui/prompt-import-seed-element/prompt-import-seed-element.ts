// import css from './prompt-import-seed-element.css';

const css = `.prompt__message {
	margin-bottom: 1.5rem;
}
.prompt__message h4 {
	margin: 0 auto -0.7rem;
	font-size: 1.3em;
}
#input__seed,
#input__password {
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
	font-family: inherit;
}

#input__seed {
	min-height: 110px;
}
#input__seed::placeholder {
	text-align: center;
	transform: translateY(50%);
}
`;

export const promptImportSeedElement = async (
	ref: HTMLElement
): Promise<{
	seed: string;
	secret: string;
}> => {
	const container = document.createElement('div');
	container.classList.add('prompt-container');
	ref.after(container);
	ref.style.display = 'none';
	container.innerHTML = `
      <style>
        ${css}
      </style>
      <div class="prompt__message">
        <h4>Import Secret Seed</h4>
        <p><b>Access your Wallet with secret seed & authenticate with Google.
        </b></p>
        <p>
          The password you enter will encrypts your seed & gives access to your funds. Please store your password in a safe place. We don’t keep your information & can’t restore it.
        </p>
      </div>
      <div class="prompt__seed">
        <div class="input__container">
          <textarea placeholder="secret seed" id="input__seed"></textarea>
          <input id="input__password" type="password" placeholder="password" />
        </div>
        <button id="button__import_seed">Import</button>
      </div>
    `;

	const inputSeed = container.querySelector('#input__seed') as HTMLInputElement;
	const inputPassword = container.querySelector(
		'#input__password'
	) as HTMLInputElement;
	const buttonImportSeed = container.querySelector(
		'#button__import_seed'
	) as HTMLButtonElement;

	return new Promise(resolve => {
		buttonImportSeed.addEventListener('click', () => {
			resolve({
				seed: inputSeed.value,
				secret: inputPassword.value
			});
			container.remove();
			ref.style.display = 'block';
		});
	});
};
