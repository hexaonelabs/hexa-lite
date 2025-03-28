import { ReserveDataHumanized } from "@aave/contract-helpers";
import {
  ComputedUserReserve,
  FormatReserveUSDResponse,
  FormatUserSummaryResponse,
} from "@aave/math-utils";
import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { CardComponent } from "@app/components/ui/card/card.component";
import { MarketPool } from "@app/models/market-pool.interface";
import { ToChainNamePipe } from "@app/pipes/to-chain-name/to-chain-name.pipe";
import { ToDecimalPipe } from "@app/pipes/to-decimal/to-decimal.pipe";
import { AAVEV3Service } from "@app/services/aave-v3/aave-v3.service";
import { LIFIService } from "@app/services/lifi/lifi.service";
import { WalletconnectService } from "@app/services/walletconnect/walletconnect.service";
import { IonAlert } from "@ionic/angular";
import {
  ActionSheetButton,
  ActionSheetController,
  AlertController,
  IonAvatar,
  IonButton,
  IonCol,
  IonContent,
  IonFooter,
  IonGrid,
  IonItem,
  IonLabel,
  IonList,
  IonRow,
  IonText,
  IonToolbar,
  LoadingController,
} from "@ionic/angular/standalone";
import { getToken, getTokenBalance, Token, TokenAmount } from "@lifi/sdk";
import { BehaviorSubject, firstValueFrom, max } from "rxjs";

const UIElements = [
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonAvatar,
  IonText,
  IonItem,
  IonButton,
  IonLabel,
  IonFooter,
  IonToolbar,
];

@Component({
  selector: "app-aavepool-page",
  templateUrl: "./aavepool-page.component.html",
  styleUrls: ["./aavepool-page.component.scss"],
  imports: [...UIElements, CommonModule, CardComponent, ToChainNamePipe, ToDecimalPipe],
})
export class AAVEPoolPageComponent implements OnInit {
  @Input() set pool(value: MarketPool) {
    this.marketPool$.next(value);
  }
  public readonly marketPool$ = new BehaviorSubject<MarketPool | null>(null);
  public readonly token$ = new BehaviorSubject<null | TokenAmount>(null);
  public readonly userReserveData$ = new BehaviorSubject<
    | null
    | ComputedUserReserve<ReserveDataHumanized & FormatReserveUSDResponse>
    | undefined
  >(null);
  public userSummary$ = new BehaviorSubject<null | FormatUserSummaryResponse<ReserveDataHumanized & FormatReserveUSDResponse> | undefined>(null);
  public currentHealFactor$ = new BehaviorSubject<null | number>(null);

  constructor(
    private readonly _walletService: WalletconnectService,
    private readonly _aavev3Service: AAVEV3Service
  ) {}

  async ngOnInit() {
    if (!this.marketPool$.value) {
      throw new Error("Market pool not set");
    }
    const walletAddress = await firstValueFrom(
      this._walletService.walletAddress$
    );
    const chainId = Number(this.marketPool$.value.id.split("-")[0]);
    const token: TokenAmount = walletAddress
      ? await getToken(chainId, this.marketPool$.value.underlyingAsset).then(
          async (token) =>
            (await getTokenBalance(walletAddress, token)) || token
        )
      : await getToken(chainId, this.marketPool$.value.underlyingAsset);
    this.token$.next(token);
    this.marketPool$.next({
      ...this.marketPool$.value,
      imageURL: token.logoURI,
    });
    const userSummaries: Map<
      number,
      FormatUserSummaryResponse<ReserveDataHumanized & FormatReserveUSDResponse>
    > = (await firstValueFrom(this._aavev3Service.getUserSummaries$())) ||
    new Map();
    const userSummary = userSummaries.get(chainId);
    this.currentHealFactor$.next(Number(userSummary?.healthFactor));
    const userReserveData = userSummary?.userReservesData.find(
      (reserve) => reserve.reserve.id === this.marketPool$.value?.id
    );
    this.userReserveData$.next(userReserveData);
    this.userSummary$.next(userSummary);
    console.log("token", {
      token,
      userReserveData,
      userSummary,
      pool: this.marketPool$.value,
    });
  }

  async choseOption() {
    const walletAddress = await firstValueFrom(this._walletService.walletAddress$);
    const hasBorrowPosition = (this.currentHealFactor$.value || -1) > 0;
    const hasDepositPosition = Number(this.userReserveData$.value?.underlyingBalance || 0) > 0;
    const hasBalance = Number(this.token$.value?.amount || 0) > 0;
    const actionSheet = await new ActionSheetController().create({
      header: 'Options',
      buttons: [
        {
          text: 'Deposit',
          role: 'supply',
          disabled: !hasBalance,
        },
        {
          text: 'Borrow',
          role: 'borrow',
        },
        hasDepositPosition ? {
          text: 'Withdraw',
          role: 'withdraw',
        } : null,
        hasBorrowPosition ? {
          text: 'Repay',
          role: 'repay',
        } : null,
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ].filter(Boolean) as ActionSheetButton[],
    });
    await actionSheet.present();
    const { role } = await actionSheet.onDidDismiss();
    if (!role) {
      throw new Error('No role selected');
    }
    if (role === 'cancel' || role === 'backdrop') {
      return;
    }
    const token = this.token$.value!;
    const aToken: TokenAmount = await getToken(this.token$.value?.chainId!, this.marketPool$?.value?.aTokenAddress!).then(
      async (token) => (await getTokenBalance(walletAddress!, token)) || token
    );
    console.log('role', {role, token, aToken}); 
    // handle errors
    switch (true) {
      case role === 'borrow': {
        const canBorrow = Number(this.userSummary$.value?.availableBorrowsUSD || 0) > 0;
        if (!canBorrow) {
          const ionAlert = await new AlertController().create({
            header: 'Error',
            message: `You have to deposit collateral on ${new ToChainNamePipe().transform(this.token$.value?.chainId || 0)} network to enable borrow.`,
            buttons: ['OK'],
          });
          await ionAlert.present();
          return;
        }
        break;
      } 
      case role === 'supply': {
        const canDeposit = Number(this.token$.value?.amount || 0) > 0;
        if (!canDeposit) {
          const ionAlert = await new AlertController().create({
            header: 'Error',
            message: `You have to get ${token.symbol} to enable deposit.`,
            buttons: ['OK'],
          });
          await ionAlert.present();
          return;
        }
        break;
      }  
      case role === 'withdraw': {
        const canWithdraw = Number(this.userReserveData$.value?.underlyingBalance || 0) > 0;
        if (!canWithdraw) {
          const ionAlert = await new AlertController().create({
            header: 'Error',
            message: `You have to deposit ${token.symbol} to enable withdraw.`,
            buttons: ['OK'],
          });
          await ionAlert.present();
          return;
        }
        break;
      }     
      default:
        throw new Error('No action selected');
    }
    // No error, user is allowed to perform action. 
    await this._executeAction(role);
  }

  private async _executeAction(role: string) {
    const pool = this.marketPool$?.value!
    const walletAddress = await firstValueFrom(
      this._walletService.walletAddress$
    );
    const maxAmount = await this._getMaxAmountToAction(role);
    // use maxAmount with max 4 digits
    const rountedMaxAmount = Math.floor(maxAmount * 10000) / 10000;
    // ask user to know amount to {role}
    const ionAlert = await new AlertController().create({
      header: role.toUpperCase(),
      message: `Enter amount (max: ${rountedMaxAmount})`,
      inputs: [
        {
          name: 'amount',
          type: 'number',
          placeholder: `Amount to ${role}`,
          attributes: {
            min: 0,
            max: rountedMaxAmount,
          },
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'OK',
          role: 'confirm',
        },
      ],
    });
    await ionAlert.present();
    const { data, role: confirmRole } = await ionAlert.onDidDismiss();
    if (!confirmRole) {
      throw new Error('No role selected');
    }
    if (confirmRole === 'cancel' || confirmRole === 'backdrop') {
      return;
    }
    const amount = Number(data.values.amount);
    if (isNaN(amount) || amount <= 0 || amount > rountedMaxAmount) {
      const ionAlert = await new AlertController().create({
        header: 'Error',
        message: `Invalid amount to ${role} ${pool.symbol}`,
        buttons: ['OK'],
      });
      await ionAlert.present();
      return;
    }
    const ionLoader = await new LoadingController().create({
      message: `Processing ${role}...`,
    });
    await ionLoader.present();
    this._aavev3Service.actions(role, {
      pool,
      amount
    });
    await this._aavev3Service.init(walletAddress!, true);
    await ionLoader.dismiss();
    const ionAlertSuccess = await new AlertController().create({
      header: 'Success',
      message: `${role} ${pool.symbol} successfully`,
      buttons: ['OK'],
    });
    await ionAlertSuccess.present();
    await ionAlertSuccess.onDidDismiss();
  }

  private async _getMaxAmountToAction(action: string) {
    const walletAddress = await firstValueFrom(
      this._walletService.walletAddress$
    );
    if (!walletAddress) {
      throw new Error("No wallet address found");
    }
    const token = this.token$.value;
    if (!token) {
      throw new Error("No token found");
    }
    let maxAmount = 0;
    switch (true) {
      case action === "supply": {
        maxAmount = Number(token.amount) / 10 ** token.decimals;;
        break;
      }
      case action === "borrow": {
        const userSummary = this.userSummary$.value!;
        const availableBorrowsUSD = Number(userSummary.availableBorrowsUSD);
        maxAmount = availableBorrowsUSD / Number(this.marketPool$.value?.priceInUSD);
        break;
      }
      case action === "withdraw": {
        const aToken: TokenAmount = await getToken(this.token$.value?.chainId!, this.marketPool$?.value?.aTokenAddress!).then(
          async (token) => (await getTokenBalance(walletAddress!, token)) || token
        );
        maxAmount = Number(aToken.amount) / 10 ** aToken.decimals;
        break;
      }
      case action === "repay": {
        const debtToken: TokenAmount = await getToken(this.token$.value?.chainId!, this.marketPool$?.value?.variableDebtTokenAddress!).then(
          async (token) => (await getTokenBalance(walletAddress!, token)) || token
        );
        const debtTokenAmount = Number(debtToken.amount) / 10 ** debtToken.decimals;
        const tokenAmount = Number(this.token$.value?.amount) / 10 ** this.token$.value?.decimals;
        maxAmount = debtTokenAmount + tokenAmount;
        break;
      }
      default: {
        throw new Error("Invalid action");
      }
    }
    return maxAmount;
  }
}
