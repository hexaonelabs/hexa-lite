// import html from './dialogElement.html';
// import css from './dialogElement.css';
import { DEFAULT_SIGNIN_METHODS, KEYS, SigninMethod } from '../../constant';
import { promptPasswordElement } from '../prompt-password-element/prompt-password-element';
import { promptEmailPasswordElement } from '../prompt-email-password-element/prompt-email-password-element';
import { promptToDownloadElement } from '../prompt-download-element/prompt-download-element';
import { SpinnerElement } from '../spinner-element/spinner-element';
import { promptWalletTypeElement } from '../prompt-wallet-type-element/prompt-wallet-type-element';

import { DialogUIOptions } from '../../interfaces/sdk.interface';
import { FirebaseWeb3ConnectDialogElement } from '../../interfaces/dialog-element.interface';
import { storageService } from '../../services/storage.service';
import { promptSignoutElement } from '../prompt-signout-element/prompt-signout-element';
import { Logger } from '../../utils';

const html = `<dialog class="dialog">
<form method="dialog">
	<button type="reset" id="cancel">
		<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M12 10.586L15.879 6.707a1 1 0 011.414 1.414L13.414 12l3.879 3.879a1 1 0 01-1.414 1.414L12 13.414l-3.879 3.879a1 1 0 01-1.414-1.414L10.586 12 6.707 8.121a1 1 0 111.414-1.414L12 10.586z"
				class="app-icon"
			></path>
		</svg>
	</button>
	<p class="title">Onboard using {{integrator}}</p>
	<div id="logo">
		<svg width="49" height="51" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M3.9468 10.0288L20.5548.995c2.4433-1.3267 5.45-1.3267 7.8936 0l16.6078 9.0338C47.4966 11.3585 49 13.8102 49 16.4666V34.534c0 2.6537-1.5034 5.1082-3.9438 6.438l-16.6078 9.0307c-2.4435 1.3297-5.4503 1.3297-7.8937 0L3.9467 40.972C1.5035 39.642 0 37.1876 0 34.534V16.4667c0-2.6564 1.5034-5.108 3.9468-6.4378z"
				class="app-icon"
			></path>
		</svg>
	</div>

	<div id="dialog__auth_provider_methods">
		<div class="buttonsList">
			<button type="reset" id="connect-google">
				<svg
					width="28px"
					height="28px"
					viewBox="-3 0 262 262"
					xmlns="http://www.w3.org/2000/svg"
					preserveAspectRatio="xMidYMid"
				>
					<path
						d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
						fill="#4285F4"
					/>
					<path
						d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
						fill="#34A853"
					/>
					<path
						d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
						fill="#FBBC05"
					/>
					<path
						d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
						fill="#EB4335"
					/>
				</svg>
				Connect with Google
			</button>

			<p class="or">or</p>

			<!-- <button type="reset" id="connect-email">Email & Password</button> -->

			<button type="reset" id="connect-email-link">Email</button>

			<button type="reset" id="connect-wallet">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="ionicon"
					viewBox="0 0 512 512"
					width="28px"
					height="28px"
				>
					<rect
						x="48"
						y="144"
						width="416"
						height="288"
						rx="48"
						ry="48"
						fill="none"
						stroke="currentColor"
						stroke-linejoin="round"
						stroke-width="32"
					/>
					<path
						d="M411.36 144v-30A50 50 0 00352 64.9L88.64 109.85A50 50 0 0048 159v49"
						fill="none"
						stroke="currentColor"
						stroke-linejoin="round"
						stroke-width="32"
					/>
					<path d="M368 320a32 32 0 1132-32 32 32 0 01-32 32z" />
				</svg>
				Connect wallet
			</button>

			<button type="reset" id="create-new-wallet">
				<small>Create new Wallet</small>
			</button>
		</div>

		<div id="spinner" style="display: none"></div>
	</div>
	<p class="policy"><a href="https://hexa-lite.io/terms/" target="_blank" rel="noopener">Terms & Privacy Policy</a></p>
	<p class="powered-by">
		Powered by
		<a href="https://hexaonelabs.com" target="_blank" rel="noopener"
			>HexaOne Labs</a
		>
	</p>
</form>
</dialog>
`;
const css = `:host([theme='light']) {
	--icon-color: #180d68;
	--dialog-box-shadow: 0 0 2rem 0 rgba(0, 0, 0, '0.1');
	--dialog-background-color: #fff;
	--text-color: #242424;
	--text-link: #646cff;
	--text-link-hover: #747bff;
	--dialog-border: solid 1px #ccc;
	--button-background: #fff;
	--button-hover-background: #f5f5f5;
}

:host([theme='dark']) {
	--icon-color: #fff;
	--dialog-box-shadow: 0 0 2rem 0 rgba(0, 0, 0, '0.3');
	--dialog-background-color: #242424;
	--text-color: #fff;
	--text-link: #646cff;
	--text-link-hover: #535bf2;
	--dialog-border: solid 1px #2c2c2c;
	--button-background: #1a1a1a;
	--button-hover-background: #333333;
}

@keyframes slide-in-up {
	0% {
		-webkit-tranform: translateY(100%);
		-moz-tranform: translateY(100%);
		transform: translateY(100%);
	}
}

:host .app-icon {
	fill: var(--icon-color);
}

:host {
	--animation-scale-down: scale-down 0.125s var(--ease);
	--animation-slide-in-down: slide-in-down 0.125s ease-in-out;
	--animation-slide-in-up: slide-in-up 0.125s var(--ease);
	--ease: cubic-bezier(0.25, 0, 0.3, 1);
	--ease-elastic-in-out: cubic-bezier(0.5, -0.5, 0.1, 1.5);
	--ease-squish: var(--ease-elastic-in-out);

	font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
	line-height: 1.5;
	font-weight: 400;
	color-scheme: light dark;
	box-sizing: border-box;
}

:host * {
	box-sizing: border-box;
}

:host dialog {
	z-index: 9999;
	overflow: hidden;
	transition: all 0.125s;
	box-shadow: var(--dialog-box-shadow);
	display: block;
	inset: 0;
	background-color: var(--dialog-background-color);
	color: var(--text-color);
	position: fixed;
	border: var(--dialog-border);
	border-radius: 32px;
	padding: 0px;
	text-align: center;
	width: 80vw;
	max-width: 400px;
	box-sizing: border-box;
	cursor: default;
	font-synthesis: none;
	text-rendering: optimizeLegibility;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	transition: all 0.125s ease-in-out;
}

:host dialog:not([open]) {
	pointer-events: none;
	opacity: 0;
}
:host dialog[open] {
	opacity: 1;
	/* animation: slide-in-up 0.225s ease-in-out forwards; */
}

:host dialog::backdrop {
	background-color: rgba(0, 0, 0, 0.2);
}

:host dialog form {
	width: 100%;
}

:host dialog #logo svg,
:host dialog #logo img {
	margin: 2em auto 3rem;
	display: block;
	transform: scale(1.5);
}

:host dialog #logo img {
	width: 58px;
}

a {
	color: #646cff;
	text-decoration: inherit;
}

:host a:hover {
	color: var(--text-link-hover);
}

:host p {
	font-size: 0.8rem;
	font-weight: 400;
	margin: 12px auto 0rem;
	max-width: 300px;
}

:host dialog p.title {
	font-size: 0.6rem;
	margin: 1rem auto;
}
:host dialog p.or {
	font-size: 0.8rem;
	opacity: 0.8;
}

:host p.policy {
	font-size: 0.6rem;
	margin: 1.5rem auto 0rem;
	border-top: solid 1px var(--button-hover-background);
	padding-top: 1rem;
	width: 100%;
	max-width: 100%;
}
:host p.powered-by {
	font-size: 0.5rem;
	margin: 0.2rem auto 1rem;
	opacity: 0.8;
}

:host .buttonsList {
	position: relative;
	padding: 0 16px;
}

:host *:focus-visible {
	outline: none;
	outline-offset: 2px;
}

:host dialog button {
	max-width: 300px;
	margin-left: auto;
	margin-right: auto;
}

:host dialog button:not(#cancel) {
	text-align: center;
	background-color: var(--button-background);
	color: var(--text-color);
	border: var(--dialog-border);
	border-radius: 24px;
	cursor: pointer;
	font-size: 16px;
	font-weight: 600;
	margin-top: 16px;
	padding: 12px 16px;
	display: flex;
	justify-content: center;
	width: 100%;
	min-width: 280px;
	min-height: 54px;
	align-items: center;
	font-family: 'Roboto', sans-serif;
	font-weight: 400;
	line-height: 20px;
}

:host dialog button:not(#cancel):not([disabled]):hover {
	background-color: var(--button-hover-background);
}

:host dialog button[disabled] {
	opacity: 0.6;
	cursor: not-allowed !important;
}

:host dialog button:not(#cancel) svg {
	margin-right: 8px;
}

:host dialog button#create-new-wallet {
	border: none;
	background: transparent;
	padding: 0;
	margin: 1rem auto 0;
	opacity: 0.6;
}
:host dialog button#create-new-wallet:hover {
	background-color: transparent !important;
}

:host #cancel {
	background-color: transparent;
	border: none;
	color: var(--text-color);
	cursor: pointer;
	position: absolute;
	right: 16px;
	top: 16px;
	padding-top: env(safe-area-inset-top);
}

@media (max-width: 600px) {
	:host dialog {
		width: 100vw;
		height: 100vh;
		max-width: 100vw;
		min-height: 100vh;
		border-radius: 0;
		border: none;
		margin: 0;
		display: flex;
		align-items: start;
		justify-content: center;
		overflow-y: scroll;
	}
}

/* iOS Header padding on Standalone mode */
@media (max-width: 600px) and (display-mode: standalone) {
	:host dialog {
		padding-top: env(safe-area-inset-top);
	}
}
`;
// export webcomponent with shadowdom
export class HexaSigninDialogElement
	extends HTMLElement
	implements FirebaseWeb3ConnectDialogElement
{
	private _ops?: DialogUIOptions;

	get ops() {
		return this._ops;
	}

	set ops(_ops: DialogUIOptions | undefined) {
		const enabledSigninMethods =
			_ops?.enabledSigninMethods?.filter(
				(method): method is (typeof DEFAULT_SIGNIN_METHODS)[number] =>
					method !== undefined
			) || DEFAULT_SIGNIN_METHODS;
		const integrator = _ops?.integrator
			? _ops.integrator
			: 'FirebaseWeb3Connect';
		const logoUrl =
			(this.ops?.logoUrl?.length || 0) > 0 ? this.ops?.logoUrl : undefined;
		const isLightMode =
			_ops?.isLightMode === undefined
				? window.matchMedia('(prefers-color-scheme: light)').matches
				: _ops.isLightMode;
		// object validation
		// TODO: validate object
		this._ops = {
			..._ops,
			logoUrl,
			integrator,
			enabledSigninMethods,
			isLightMode
		};
		Logger.log(`[INFO] ops: `, this.ops);

		// check if shadow dom is initialized and empty
		if (this.shadowRoot?.innerHTML === '') {
			this._render();
		} else {
			throw new Error('ShadowDOM already initialized');
		}
	}

	constructor() {
		super();
		// build shadow dom
		const shadow = this.attachShadow({ mode: 'open' });
		if (!shadow) {
			throw new Error('ShadowDOM not supported');
		}
	}

	private async _render() {
		// create template element
		const template = document.createElement('template');
		template.innerHTML = `
        <style>${css}</style>
        ${html}
    `;
		// add spinner element to template content
		(template.content.querySelector('#spinner') as HTMLElement).innerHTML =
			SpinnerElement();

		// disable buttons that are not enabled
		const buttons = template.content.querySelectorAll(
			'.buttonsList button'
		) as NodeListOf<HTMLButtonElement>;
		buttons.forEach(button => {
			if (
				!this.ops?.enabledSigninMethods?.includes(
					button.id as unknown as SigninMethod
				) &&
				button.id.startsWith('connect')
			) {
				button.remove();
			}
		});
		// remove `or` tage if google is not enabled
		if (
			!this.ops?.enabledSigninMethods?.includes(SigninMethod.Google) ||
			(this.ops.enabledSigninMethods.includes(SigninMethod.Google) &&
				this.ops.enabledSigninMethods.length === 1)
		) {
			template.content.querySelector('.or')?.remove();
		}
		if (this.ops?.logoUrl) {
			Logger.log(`[INFO] Logo URL: `, this.ops.logoUrl);
			(template.content.querySelector('#logo') as HTMLElement).innerHTML = `
				<img src="${this.ops.logoUrl}" alt="logo" />	
			`;
		}
		if (!this.shadowRoot) {
			throw new Error('ShadowRoot not found. Webcomponent not initialized.');
		}
		// add attribut to manage dark/light mode
		this.setAttribute('theme', this.ops?.isLightMode ? 'light' : 'dark');
		// finaly add template to shadow dom
		this.shadowRoot.appendChild(template.content.cloneNode(true));
		// replace tags from html with variables
		const variables = [{ tag: 'integrator', value: `${this.ops?.integrator}` }];
		variables.forEach(variable => {
			if (!this.shadowRoot) {
				throw new Error('ShadowRoot not found while replacing variables');
			}
			this.shadowRoot.innerHTML = this.shadowRoot.innerHTML.replace(
				new RegExp(`{{${variable.tag}}}`, 'g'),
				variable.value
			);
		});
	}

	public showModal(): void {
		this.shadowRoot?.querySelector('dialog')?.showModal();
	}

	public hideModal(): void {
		this.shadowRoot?.querySelector('dialog')?.close();
	}

	// manage events from shadow dom
	public connectedCallback() {
		this.shadowRoot
			?.querySelector('dialog')
			?.addEventListener('click', async event => {
				// filter event name `connect
				const button = (event.target as HTMLElement).closest('button');
				if (!button) return;
				// handle cancel
				if (button.id === 'cancel') {
					this.dispatchEvent(
						new CustomEvent('connect', {
							detail: button.id
						})
					);
					// stop further execution of code
					// as we don't want to show loading on cancel
					// and we don't want to show connected on cancel.
					// This will trigger the event and close the dialog
					return;
				}
				// handle reset button
				if (button.id === 'create-new-wallet') {
					this.dispatchEvent(new CustomEvent('reset'));
					return;
				}
				// only button from connection type request
				if (!button.id.includes('connect')) {
					return;
				}
				// hide all btns and display loader with animation
				const btnsElement = this.shadowRoot?.querySelector(
					'dialog .buttonsList'
				) as HTMLElement;
				const spinnerElement = this.shadowRoot?.querySelector(
					'dialog #spinner'
				) as HTMLElement;
				btnsElement.style.display = 'none';
				spinnerElement.style.display = 'block';

				// emiting custome event to SDK
				switch (button.id) {
					case 'connect-google':
						this.dispatchEvent(
							new CustomEvent('connect', {
								detail: button.id
							})
						);
						break;
					case 'connect-email':
						this.dispatchEvent(
							new CustomEvent('connect', {
								detail: button.id
							})
						);
						break;
					case 'connect-email-link':
						this.dispatchEvent(
							new CustomEvent('connect', {
								detail: button.id
							})
						);
						break;
					case 'connect-wallet':
						this.dispatchEvent(
							new CustomEvent('connect', {
								detail: button.id
							})
						);
						break;
				}
			});
	}

	public async toggleSpinnerAsCheck(message?: string): Promise<boolean> {
		await new Promise(resolve => {
			const t = setTimeout(() => {
				clearTimeout(t);
				resolve(true);
			}, 1500);
		});
		const element = this.shadowRoot?.querySelector(
			'dialog #spinner'
		) as HTMLElement;
		element.innerHTML = `
    <style>
    #check-group {
      animation: 0.32s ease-in-out 1.03s check-group;
      transform-origin: center;
    }
    
    #check-group #check {
        animation: 0.34s cubic-bezier(0.65, 0, 1, 1) 0.8s forwards check;
        stroke-dasharray: 0, 75px;
        stroke-linecap: round;
        stroke-linejoin: round;
    }
    
    #check-group #outline {
        animation: 0.38s ease-in outline;
        transform: rotate(0deg);
        transform-origin: center;
    }
    
    #check-group #white-circle {
        animation: 0.35s ease-in 0.35s forwards circle;
        transform: none;
        transform-origin: center;
    }
    
    @keyframes outline {
      from {
        stroke-dasharray: 0, 345.576px;
      }
      to {
        stroke-dasharray: 345.576px, 345.576px;
      }
    }
    @keyframes circle {
      from {
        transform: scale(1);
      }
      to {
        transform: scale(0);
      }
    }
    @keyframes check {
      from {
        stroke-dasharray: 0, 75px;
      }
      to {
        stroke-dasharray: 75px, 75px;
      }
    }
    @keyframes check-group {
      from {
        transform: scale(1);
      }
      50% {
        transform: scale(1.09);
      }
      to {
        transform: scale(1);
      }
    }
    </style>
  
    <svg
      width="115px"
      height="115px"
      viewBox="0 0 133 133"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
    >
      <g
          id="check-group"
          stroke="none"
          stroke-width="4"
          fill="none"
          fill-rule="evenodd"
      >
              <circle
              id="filled-circle"
              fill="#07b481"
              cx="66.5"
              cy="66.5"
              r="54.5"
          />
          <circle
              id="white-circle"
              fill="var(--dialog-background-color)"
              cx="66.5"
              cy="66.5"
              r="55.5"
          />
          <circle
              id="outline"
              stroke="#07b481"
              stroke-width="4"
              cx="66.5"
              cy="66.5"
              r="54.5"
          />
          <polyline
              id="check"
              stroke="var(--dialog-background-color)"
              stroke-width="6.5"
              points="41 70 56 85 92 49"
          />
      </g>
    </svg>
		${message ? `<p>${message}</p>` : ''}
    `;
		return new Promise(resolve => {
			const t = setTimeout(() => {
				clearTimeout(t);
				resolve(true);
			}, 1800);
		});
	}

	public async toggleSpinnerAsCross(
		message: string = 'An error occured. Please try again.'
	): Promise<boolean> {
		await new Promise(resolve => {
			const t = setTimeout(() => {
				clearTimeout(t);
				resolve(true);
			}, 1500);
		});
		const element = this.shadowRoot?.querySelector(
			'dialog #spinner'
		) as HTMLElement;
		element.innerHTML = `
    <style>
    @keyframes stroke {
      100% {
        stroke-dashoffset: 0;
      }
    }
    .cross__svg {
        border-radius: 50%;
        display: block;
        height: 111px;
        margin: 1rem auto;
        stroke-width: 4;
        width: 111px;
    }

    .cross__circle {
        animation: 0.6s ease 0s normal forwards 1 running stroke;
        fill: none;
        margin: 0 auto;
        stroke: #e55454;
        stroke-dasharray: 166;
        stroke-dashoffset: 166;
        stroke-width: 3;
    }

    .cross__path {
        stroke: #e55454;
        stroke-dasharray: 48;
        stroke-dashoffset: 48;
        transform-origin: 50% 50% 0;
    }
    .cross__path.cross__path--right {
      animation: 0.3s ease 0.8s normal forwards 1 running stroke;
    }
    .cross__path.cross__path--left {
      animation: 1s ease 0.8s normal forwards 1 running stroke;
    }
    p.cross__message {
      color: #e55454;
      font-size: 0.8rem;
      text-align: center;
    }


    </style>
  
    <svg class="cross__svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
      <circle class="cross__circle" cx="26" cy="26" r="25" fill="none"/>
      <path class="cross__path cross__path--right" fill="none" d="M16,16 l20,20" />
      <path class="cross__path cross__path--right" fill="none" d="M16,36 l20,-20" />
    </svg>
    <p class="cross__message">${message}</p>
    `;
		return new Promise(resolve => {
			const t = setTimeout(() => {
				clearTimeout(t);
				resolve(true);
			}, 1800);
		});
	}

	public async promptPassword() {
		const value = await promptPasswordElement(
			this.shadowRoot?.querySelector('dialog #spinner') as HTMLElement
		);
		return value;
	}

	public async promptEmailPassword(ops?: {
		hideEmail?: boolean;
		hidePassword?: boolean;
	}) {
		const value = await promptEmailPasswordElement(
			this.shadowRoot?.querySelector('dialog #spinner') as HTMLElement,
			ops
		);
		return value;
	}

	public async promptBackup() {
		const value = await promptToDownloadElement(
			this.shadowRoot?.querySelector('dialog #spinner') as HTMLElement
		);
		return value;
	}

	public async promptSignoutWithBackup() {
		const value = await promptSignoutElement(
			this.shadowRoot?.querySelector('dialog #spinner') as HTMLElement
		);
		return value;
	}

	public async promptWalletType() {
		const value = await promptWalletTypeElement(
			this.shadowRoot?.querySelector('dialog #spinner') as HTMLElement
		);
		return value;
	}

	public async promptAuthMethods() {
		(
			this.shadowRoot?.querySelector('dialog #spinner') as HTMLElement
		).style.display = 'none';
		(
			this.shadowRoot?.querySelector('dialog .buttonsList') as HTMLElement
		).style.display = 'block';
	}

	public async reset() {
		const confirm = window.confirm(
			`You are about to clear all data to create new Wallet. This will remove all your existing data and we will not be able to recover it if you don't have backup. You are confirming that you want to clear all data and create new Wallet?`
		);
		if (!confirm) {
			return;
		}
		// reset html
		if (this.shadowRoot?.innerHTML) this.shadowRoot.innerHTML = '';
		this._ops = {
			...this._ops,
			enabledSigninMethods: DEFAULT_SIGNIN_METHODS
		};
		await this._render();
		// add event listener
		this.connectedCallback();
		// remove "Create new Wallet" button if no auth method is enabled
		const authMethod = await storageService.getItem(
			KEYS.STORAGE_AUTH_METHOD_KEY
		);
		if (!authMethod) {
			this.shadowRoot?.querySelector('#create-new-wallet')?.remove();
		}
		this.showModal();
	}
}
