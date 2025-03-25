import { ErrorHandler } from "@angular/core";
import { AppErrorHandlerService } from "./services/app-error-handler/app-error-handler.service";

export const provideErrorHandler = () => ({
  provide: ErrorHandler,
  useClass: AppErrorHandlerService,
})