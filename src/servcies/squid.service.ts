
import { SquidWidget } from "@0xsquid/widget";

export const SQUID_CONFIG = Object.freeze({
  integratorId: 'hexa-lite-swap-widge',
  collectFees: {
    integratorAddress: '', // The EVM address of the integrator that will receive the fee
    fee: 50 // The amount in "basis points" for the fee. 50 = 0.05%. there is currently soft limit of 1% fee allowed for each tx.
  },
  companyName: "Hexa Lite",
  slippage: 1, // default slippage
  style: {
    neutralContent: "#fff",
    baseContent: "#fff",
    base100: "#24344d",
    // base200: "#202230",
    // base300: "#0090FF",
    // error: "#ED6A5E",
    // warning: "#FFB155",
    // success: "#62C555",
    primary: "#0090FF",
    // secondary: "#37394C",
    secondaryContent: "#B2BCD3",
    neutral: "#1d253d",
    roundedBtn: "32px",
    roundedBox: "1.48rem",
    // roundedDropDown: "0px",
    advanced: {
      transparentWidget: false,
    },
  },
  // hideAnimations: true, 
  // instantExec: true,
  // infiniteApproval: true,
  // apiUrl: "https://api.0xsquid.com",
  // mainLogoUrl: "",
  titles: {
    swap: "Exchange",
    // settings: "Settings",
    // wallets: "Wallets",
    // tokens: "Tokens",
    // chains: "Chains",
    // history: "History",
    // transaction: "Transaction",
    // destination: "Destination address",
  },
  // priceImpactWarnings: {
  //   warning: 3,
  //   critical: 5,
  // },
  // initialFromChainId: 42161, // Arbitrum
  // initialToChainId: 1284, // Moonbeam
  // favTokens: [
  //   {
  //     address: "0x539bdE0d7Dbd336b79148AA742883198BBF60342", // Token address for MAGIC
  //     chainId: 42161, // Chain ID for Arbitrum
  //   },
  //   {
  //     address: "0x0E358838ce72d5e61E0018a2ffaC4bEC5F4c88d2", // Token address for STELLA
  //     chainId: 1284, // Chain ID for Moonbeam
  //   },
  // ],
  // defaultTokens: [
  //   {
  //     address: "0xd4d42F0b6DEF4CE0383636770eF773390d85c61A", // Token address for SUSHI
  //     chainId: 42161, // Chain ID for Arbitrum
  //   },
  //   {
  //     address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // Token address for GLMR
  //     chainId: 1284, // Chain ID for Moonbeam
  //   },
  // ],
}) as any;