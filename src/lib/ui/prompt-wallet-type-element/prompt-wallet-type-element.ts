// import extensionIcon from '../../assets/svg/extension-puzzle-outline.svg';
// import downloadIcon from '../../assets/svg/download-outline.svg';
// import keyOutlineIcon from '../../assets/svg/key-outline.svg';
// import css from './prompt-wallet-type-element.css';

const extensionIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M413.66 246.1H386a2 2 0 01-2-2v-77.24A38.86 38.86 0 00345.14 128H267.9a2 2 0 01-2-2V98.34c0-27.14-21.5-49.86-48.64-50.33a49.53 49.53 0 00-50.4 49.51V126a2 2 0 01-2 2H87.62A39.74 39.74 0 0048 167.62V238a2 2 0 002 2h26.91c29.37 0 53.68 25.48 54.09 54.85.42 29.87-23.51 57.15-53.29 57.15H50a2 2 0 00-2 2v70.38A39.74 39.74 0 0087.62 464H158a2 2 0 002-2v-20.93c0-30.28 24.75-56.35 55-57.06 30.1-.7 57 20.31 57 50.28V462a2 2 0 002 2h71.14A38.86 38.86 0 00384 425.14v-78a2 2 0 012-2h28.48c27.63 0 49.52-22.67 49.52-50.4s-23.2-48.64-50.34-48.64z"/></svg>`;
const downloadIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path d="M336 176h40a40 40 0 0140 40v208a40 40 0 01-40 40H136a40 40 0 01-40-40V216a40 40 0 0140-40h40" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M176 272l80 80 80-80M256 48v288"/></svg>`;
const keyOutlineIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><path d="M218.1 167.17c0 13 0 25.6 4.1 37.4-43.1 50.6-156.9 184.3-167.5 194.5a20.17 20.17 0 00-6.7 15c0 8.5 5.2 16.7 9.6 21.3 6.6 6.9 34.8 33 40 28 15.4-15 18.5-19 24.8-25.2 9.5-9.3-1-28.3 2.3-36s6.8-9.2 12.5-10.4 15.8 2.9 23.7 3c8.3.1 12.8-3.4 19-9.2 5-4.6 8.6-8.9 8.7-15.6.2-9-12.8-20.9-3.1-30.4s23.7 6.2 34 5 22.8-15.5 24.1-21.6-11.7-21.8-9.7-30.7c.7-3 6.8-10 11.4-11s25 6.9 29.6 5.9c5.6-1.2 12.1-7.1 17.4-10.4 15.5 6.7 29.6 9.4 47.7 9.4 68.5 0 124-53.4 124-119.2S408.5 48 340 48s-121.9 53.37-121.9 119.17zM400 144a32 32 0 11-32-32 32 32 0 0132 32z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="32"/></svg>`;

const css = `
.prompt__wallet_type button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.prompt__wallet_type button svg {
  width: 28px;
  height: 28px;
  color: var(--text-color);
}
`;

export const promptWalletTypeElement = async (
	ref: HTMLElement
): Promise<'browser-extension' | 'import-privatekey' | 'import-seed'> => {
	const container = document.createElement('div');
	container.classList.add('prompt-container');
	ref.after(container);
	ref.style.display = 'none';
	container.innerHTML = `
      <style>
        ${css}
      </style>
      <div class="prompt__wallet_type">
        <button id="button__external_wallet">
          ${extensionIcon}
          <span>Browser extension</span>
        </button>
        <button id="button__import_seed">
          ${keyOutlineIcon}
          <span>import secret seed</span>
        </button>
        <button id="button__import_wallet">
          ${downloadIcon}
          <span>import Wallet Backup</span>
        </button>
      </div>
    `;

	const buttonExternalWallet = container.querySelector(
		'#button__external_wallet'
	) as HTMLButtonElement;
	const buttonImportWallet = container.querySelector(
		'#button__import_wallet'
	) as HTMLButtonElement;
	const buttonImportSeed = container.querySelector(
		'#button__import_seed'
	) as HTMLButtonElement;

	return new Promise(resolve => {
		buttonExternalWallet.addEventListener('click', () => {
			resolve('browser-extension');
			container.remove();
			ref.style.display = 'block';
		});

		buttonImportWallet.addEventListener('click', () => {
			// request `import-seed` or `import-privatekey`
			// based on user selection
			// this will be handled in the next step
			resolve('import-privatekey');
			container.remove();
			// ref.style.display = 'block';
		});

		buttonImportSeed.addEventListener('click', () => {
			resolve('import-seed');
			container.remove();
			ref.style.display = 'block';
		});
	});
};
