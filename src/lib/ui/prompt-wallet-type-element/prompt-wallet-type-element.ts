import extensionIcon from '../../assets/svg/extension-puzzle-outline.svg';
import downloadIcon from '../../assets/svg/download-outline.svg';
import keyOutlineIcon from '../../assets/svg/key-outline.svg';
// import css from './prompt-wallet-type-element.css';

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
