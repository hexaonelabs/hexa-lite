import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { toggleDarkPalette } from "@app/app.utils";
import { LIFIService } from "@app/services/lifi/lifi.service";
import { WalletconnectService } from "@app/services/walletconnect/walletconnect.service";
import {
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonFooter,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonRow,
  IonText,
  IonToggle,
  IonToolbar,
  ModalController,
} from "@ionic/angular/standalone";
import { addIcons } from "ionicons";
import { openOutline } from "ionicons/icons";

const UIElements = [
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonToggle,
  IonButtons,
  IonButton,
  IonIcon,
  IonText,
  IonList,
  IonLabel,
  IonFooter,
  IonToolbar,
];

@Component({
  selector: "app-settings-page",
  templateUrl: "./settings-page.component.html",
  styleUrls: ["./settings-page.component.scss"],
  imports: [...UIElements, CommonModule, FormsModule],
})
export class SettingsPageComponent implements OnInit {
  public paletteToggle: boolean = false;
  public readonly hideSmalAmount$;
  public readonly walletAddress$;
  constructor(
    private readonly _walletService: WalletconnectService,
    private readonly _lifiService: LIFIService,
    private readonly _router: Router,
    private readonly _modalCtrl: ModalController,
  ) {
    addIcons({
      openOutline,
    });
    this.walletAddress$ = this._walletService.walletAddress$;
    this.hideSmalAmount$ = this._lifiService.hideSmallAmount$;
  }

  ngOnInit() {
    this.paletteToggle = localStorage.getItem("theme") === "dark";
  }

  async disconnect() {
    const ionModal =  await this._modalCtrl.getTop();
    await this._walletService.disconnect();
    await ionModal?.dismiss();
    await this._router.navigateByUrl("/");
  }

  toggleThemeChange(isChecked: boolean) {
    const shouldAdd = isChecked;
    toggleDarkPalette(shouldAdd);
  }

  toggleHideSmallAmount() {
    this._lifiService.toggleHideSmallAmount();
  }
}
