import { LoadingController } from "@ionic/angular/standalone";
import { WalletconnectService } from "@services/walletconnect/walletconnect.service";

export const appInitializer = async (walletService: WalletconnectService) => {
  const ionLoading = await new LoadingController().create();
  await ionLoading.present();
  await walletService.init();
  await ionLoading.dismiss();
}