import { IAsset } from "@/interfaces/asset.interface";
import { HiddenUI, WidgetConfig } from "@lifi/widget";
import { ethers, Contract } from "ethers";

export interface LiFiQuoteResponse {
  type: string;
  id: string;
  tool: string;
  toolDetails: ToolDetails;
  action: Action;
  estimate: Estimate;
  includedSteps: IncludedStep[];
  integrator: string;
  transactionRequest: TransactionRequest;
}

interface Action {
  fromToken: Token;
  fromAmount: string;
  toToken: Token;
  fromChainId: number;
  toChainId: number;
  slippage: number;
  fromAddress: string;
  toAddress: string;
  destinationGasConsumption?: string;
}

interface Token {
  address: string;
  chainId: number;
  symbol: string;
  decimals: number;
  name: string;
  priceUSD: string;
  logoURI: string;
  coinKey: string;
}

interface Estimate {
  tool: string;
  approvalAddress: string;
  toAmountMin: string;
  toAmount: string;
  fromAmount: string;
  feeCosts: FeeCost[];
  gasCosts: GasCost[];
  executionDuration: number;
  fromAmountUSD?: string;
  toAmountUSD?: string;
  toolData?: ToolData;
}

interface FeeCost {
  name: string;
  description: string;
  percentage: string;
  token: Token;
  amount: string;
  amountUSD: string;
  included: boolean;
}

interface GasCost {
  type: string;
  price: string;
  estimate: string;
  limit: string;
  amount: string;
  amountUSD: string;
  token: Token;
}

interface ToolData {
  relayerFeeCost: FeeCost;
}

interface IncludedStep {
  id: string;
  type: string;
  action: Action;
  estimate: Estimate;
  tool: string;
  toolDetails: ToolDetails;
}

interface ToolDetails {
  key: string;
  name: string;
  logoURI: string;
}

interface TransactionRequest {
  data: string;
  to: string;
  value: string;
  from: string;
  chainId: number;
  gasPrice: string;
  gasLimit: string;
}

const ERC20_ABI = [
  {
    name: "approve",
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    name: "allowance",
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

/**
 * Requesting possibles connection
 * @param fromChain
 * @param toChain
 * @param fromToken
 * @param toToken
 * @param fromAmount
 * @param fromAddress
 */
export const getConnections = async (
  fromChain: string,
  toChain: string,
  fromToken: string,
  toToken: string,
  fromAmount: string,
  fromAddress: string
) => {
  const integrator = "hexa-lite";
  const fee = 0.005;
  // build url params from input
  const params = new URLSearchParams();
  params.append("fromChain", fromChain);
  params.append("toChain", toChain);
  params.append("fromToken", fromToken);
  params.append("toToken", toToken);
  params.append("fromAmount", fromAmount);
  params.append("fromAddress", fromAddress);
  params.append("integrator", integrator);
  params.append("fee", fee.toString());
  const reponse = await fetch(
    `https://li.quest/v1/connections?${params.toString()}`
  );
  const result = await reponse.json();
  return result;
};

/**
 * Requesting a Quote
 * @param fromChain
 * @param toChain
 * @param fromToken
 * @param toToken
 * @param fromAmount
 * @param fromAddress
 * @returns
 */
export const getQuote = async (
  fromChain: string,
  toChain: string,
  fromToken: string,
  toToken: string,
  fromAmount: string,
  fromAddress: string
): Promise<LiFiQuoteResponse> => {
  const integrator = "hexa-lite";
  const fee = 0.005;
  // build url params from input
  const params = new URLSearchParams();
  params.append("fromChain", fromChain);
  params.append("toChain", toChain);
  params.append("fromToken", fromToken);
  params.append("toToken", toToken);
  params.append("fromAmount", fromAmount);
  params.append("fromAddress", fromAddress);
  params.append("integrator", integrator);
  params.append("fee", fee.toString());
  const reponse = await fetch(`https://li.quest/v1/quote?${params.toString()}`);
  const result: LiFiQuoteResponse = await reponse.json();
  return result;
};
export const fakeQuote = {
  type: "lifi",
  id: "14c2de39-e6ce-4e9c-b438-bc68977912f4",
  tool: "stargate",
  toolDetails: {
    key: "stargate",
    name: "Stargate",
    logoURI:
      "https://raw.githubusercontent.com/lifinance/types/5685c638772f533edad80fcb210b4bb89e30a50f/src/assets/icons/bridges/stargate.png",
  },
  action: {
    fromToken: {
      address: "0x625e7708f30ca75bfd92586e17077590c60eb4cd",
      chainId: 10,
      symbol: "aOptUSDC",
      decimals: 6,
      name: "Aave Optimism USDC",
      priceUSD: "1",
      logoURI:
        "https://static.debank.com/image/op_token/logo_url/0x625e7708f30ca75bfd92586e17077590c60eb4cd/edbff4857cf186c17bfdac67f2b0e6b1.png",
      coinKey: "aOptUSDC",
    },
    fromAmount: "0.2",
    toToken: {
      address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      symbol: "USDC",
      decimals: 6,
      chainId: 1,
      name: "USD Coin",
      coinKey: "USDC",
      logoURI:
        "https://static.debank.com/image/coin/logo_url/usdc/e87790bfe0b3f2ea855dc29069b38818.png",
      priceUSD: "1",
    },
    fromChainId: 10,
    toChainId: 1,
    slippage: 0.005,
    fromAddress: "0xd2b2A35039270d8fDcA84E7c15E1461daD9F3Ad7",
    toAddress: "0xd2b2A35039270d8fDcA84E7c15E1461daD9F3Ad7",
  },
  estimate: {
    tool: "stargate",
    approvalAddress: "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE",
    toAmountMin: "2",
    toAmount: "2",
    fromAmount: "2",
    feeCosts: [
      {
        name: "Integrator Fee",
        description: "Fee shared between integrator and LI.FI",
        token: {
          address: "0x625e7708f30ca75bfd92586e17077590c60eb4cd",
          chainId: 10,
          symbol: "aOptUSDC",
          decimals: 6,
          name: "Aave Optimism USDC",
          priceUSD: "1",
          logoURI:
            "https://static.debank.com/image/op_token/logo_url/0x625e7708f30ca75bfd92586e17077590c60eb4cd/edbff4857cf186c17bfdac67f2b0e6b1.png",
          coinKey: "aOptUSDC",
        },
        amount: "0",
        amountUSD: "0.00",
        percentage: "0",
        included: true,
      },
      {
        name: "LayerZero fees",
        description: "Infrastructure fee paid in native token",
        token: {
          address: "0x0000000000000000000000000000000000000000",
          symbol: "ETH",
          decimals: 18,
          chainId: 10,
          name: "ETH",
          coinKey: "ETH",
          logoURI:
            "https://static.debank.com/image/op_token/logo_url/op/d61441782d4a08a7479d54aea211679e.png",
          priceUSD: "1573.41",
        },
        amount: "3358382275654522",
        amountUSD: "5.28",
        percentage: "2642056.1282",
        included: false,
      },
      {
        name: "Equilibrium fees",
        description:
          "The fee paid to users who rebalance tokens for the stargate protocol",
        token: {
          address: "0x7f5c764cbc14f9669b88837ca1490cca17c31607",
          symbol: "USDC.e",
          decimals: 6,
          chainId: 10,
          name: "Bridged USD Coin",
          coinKey: "USDCe",
          logoURI:
            "https://static.debank.com/image/coin/logo_url/usdc/e87790bfe0b3f2ea855dc29069b38818.png",
          priceUSD: "1",
        },
        amount: "0",
        amountUSD: "0.00",
        percentage: "0.0000",
        included: true,
      },
      {
        name: "Liquidity provider fees",
        description:
          "The fee paid to liquidity providers for the stargate protocol",
        token: {
          address: "0x7f5c764cbc14f9669b88837ca1490cca17c31607",
          symbol: "USDC.e",
          decimals: 6,
          chainId: 10,
          name: "Bridged USD Coin",
          coinKey: "USDCe",
          logoURI:
            "https://static.debank.com/image/coin/logo_url/usdc/e87790bfe0b3f2ea855dc29069b38818.png",
          priceUSD: "1",
        },
        amount: "0",
        amountUSD: "0.00",
        percentage: "0.0000",
        included: true,
      },
      {
        name: "Protocol fees",
        description: "The fee paid to the stargate protocol",
        token: {
          address: "0x7f5c764cbc14f9669b88837ca1490cca17c31607",
          symbol: "USDC.e",
          decimals: 6,
          chainId: 10,
          name: "Bridged USD Coin",
          coinKey: "USDCe",
          logoURI:
            "https://static.debank.com/image/coin/logo_url/usdc/e87790bfe0b3f2ea855dc29069b38818.png",
          priceUSD: "1",
        },
        amount: "0",
        amountUSD: "0.00",
        percentage: "0.0000",
        included: true,
      },
    ],
    gasCosts: [
      {
        type: "SEND",
        price: "55972628",
        estimate: "1586508",
        limit: "2379762",
        amount: "88801022103024",
        amountUSD: "0.14",
        token: {
          address: "0x0000000000000000000000000000000000000000",
          symbol: "ETH",
          decimals: 18,
          chainId: 10,
          name: "ETH",
          coinKey: "ETH",
          logoURI:
            "https://static.debank.com/image/op_token/logo_url/op/d61441782d4a08a7479d54aea211679e.png",
          priceUSD: "1573.41",
        },
      },
    ],
    executionDuration: 70,
    fromAmountUSD: "0.00",
    toAmountUSD: "0.00",
  },
  includedSteps: [
    {
      id: "6ae78e41-66a0-4435-8e66-a5fcdb92c785",
      type: "protocol",
      action: {
        fromChainId: 10,
        fromAmount: "2",
        fromToken: {
          address: "0x625e7708f30ca75bfd92586e17077590c60eb4cd",
          chainId: 10,
          symbol: "aOptUSDC",
          decimals: 6,
          name: "Aave Optimism USDC",
          priceUSD: "1",
          logoURI:
            "https://static.debank.com/image/op_token/logo_url/0x625e7708f30ca75bfd92586e17077590c60eb4cd/edbff4857cf186c17bfdac67f2b0e6b1.png",
          coinKey: "aOptUSDC",
        },
        toChainId: 10,
        toToken: {
          address: "0x625e7708f30ca75bfd92586e17077590c60eb4cd",
          chainId: 10,
          symbol: "aOptUSDC",
          decimals: 6,
          name: "Aave Optimism USDC",
          priceUSD: "1",
          logoURI:
            "https://static.debank.com/image/op_token/logo_url/0x625e7708f30ca75bfd92586e17077590c60eb4cd/edbff4857cf186c17bfdac67f2b0e6b1.png",
          coinKey: "aOptUSDC",
        },
        slippage: 0.005,
        fromAddress: "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE",
        toAddress: "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE",
      },
      estimate: {
        fromAmount: "2",
        toAmount: "2",
        toAmountMin: "2",
        tool: "feeCollection",
        approvalAddress: "0xbD6C7B0d2f68c2b7805d88388319cfB6EcB50eA9",
        gasCosts: [
          {
            type: "SEND",
            amount: "130000",
            token: {
              address: "0x0000000000000000000000000000000000000000",
              symbol: "ETH",
              decimals: 18,
              chainId: 10,
              name: "ETH",
              coinKey: "ETH",
              logoURI:
                "https://static.debank.com/image/op_token/logo_url/op/d61441782d4a08a7479d54aea211679e.png",
              priceUSD: "1573.41",
            },
            price: "55972628",
            limit: "200000",
            estimate: "200000",
            amountUSD: "0.01",
          },
        ],
        feeCosts: [
          {
            name: "Integrator Fee",
            description: "Fee shared between integrator and LI.FI",
            token: {
              address: "0x625e7708f30ca75bfd92586e17077590c60eb4cd",
              chainId: 10,
              symbol: "aOptUSDC",
              decimals: 6,
              name: "Aave Optimism USDC",
              priceUSD: "1",
              logoURI:
                "https://static.debank.com/image/op_token/logo_url/0x625e7708f30ca75bfd92586e17077590c60eb4cd/edbff4857cf186c17bfdac67f2b0e6b1.png",
              coinKey: "aOptUSDC",
            },
            amount: "0",
            amountUSD: "0.00",
            percentage: "0",
            included: true,
          },
        ],
        executionDuration: 0,
      },
      tool: "feeCollection",
      toolDetails: {
        key: "feeCollection",
        name: "Integrator Fee",
        logoURI:
          "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/protocols/feeCollection.png",
      },
    },
    {
      id: "10c780b1-475e-4cf7-b671-96ae464f3419",
      type: "swap",
      action: {
        fromChainId: 10,
        fromAmount: "2",
        fromToken: {
          address: "0x625e7708f30ca75bfd92586e17077590c60eb4cd",
          chainId: 10,
          symbol: "aOptUSDC",
          decimals: 6,
          name: "Aave Optimism USDC",
          priceUSD: "1",
          logoURI:
            "https://static.debank.com/image/op_token/logo_url/0x625e7708f30ca75bfd92586e17077590c60eb4cd/edbff4857cf186c17bfdac67f2b0e6b1.png",
          coinKey: "aOptUSDC",
        },
        toChainId: 10,
        toToken: {
          address: "0x7f5c764cbc14f9669b88837ca1490cca17c31607",
          symbol: "USDC.e",
          decimals: 6,
          chainId: 10,
          name: "Bridged USD Coin",
          coinKey: "USDCe",
          logoURI:
            "https://static.debank.com/image/coin/logo_url/usdc/e87790bfe0b3f2ea855dc29069b38818.png",
          priceUSD: "1",
        },
        slippage: 0.005,
        fromAddress: "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE",
        toAddress: "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE",
      },
      estimate: {
        tool: "1inch",
        fromAmount: "2",
        toAmount: "2",
        toAmountMin: "2",
        approvalAddress: "0x1111111254eeb25477b68fb85ed929f73a960582",
        executionDuration: 30,
        feeCosts: [],
        gasCosts: [
          {
            type: "SEND",
            price: "55972628",
            estimate: "518508",
            limit: "777762",
            amount: "29022255399024",
            amountUSD: "0.05",
            token: {
              address: "0x0000000000000000000000000000000000000000",
              symbol: "ETH",
              decimals: 18,
              chainId: 10,
              name: "ETH",
              coinKey: "ETH",
              logoURI:
                "https://static.debank.com/image/op_token/logo_url/op/d61441782d4a08a7479d54aea211679e.png",
              priceUSD: "1573.41",
            },
          },
        ],
        toolData: {
          fromToken: {
            address: "0x625e7708f30ca75bfd92586e17077590c60eb4cd",
            symbol: "aOptUSDC",
            name: "Aave Optimism USDC",
            decimals: 6,
          },
          toToken: {
            address: "0x7f5c764cbc14f9669b88837ca1490cca17c31607",
            symbol: "USDC",
            name: "USD Coin",
            decimals: 6,
            logoURI:
              "https://tokens.1inch.io/0x7f5c764cbc14f9669b88837ca1490cca17c31607.png",
            tags: ["PEG:USD", "tokens"],
          },
          estimatedGas: 518508,
          protocols: [
            [
              [
                {
                  name: "OPTIMISM_AAVE_V3",
                  part: 100,
                  fromTokenAddress:
                    "0x625e7708f30ca75bfd92586e17077590c60eb4cd",
                  toTokenAddress: "0x7f5c764cbc14f9669b88837ca1490cca17c31607",
                },
              ],
            ],
          ],
          toTokenAmount: "2",
          fromTokenAmount: "2",
        },
      },
      tool: "1inch",
      toolDetails: {
        key: "1inch",
        name: "1inch",
        logoURI:
          "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/exchanges/oneinch.png",
      },
    },
    {
      id: "b1342367-306c-49e6-b568-c0b8d363b20d",
      type: "cross",
      action: {
        fromChainId: 10,
        fromAmount: "2",
        fromToken: {
          address: "0x7f5c764cbc14f9669b88837ca1490cca17c31607",
          symbol: "USDC.e",
          decimals: 6,
          chainId: 10,
          name: "Bridged USD Coin",
          coinKey: "USDCe",
          logoURI:
            "https://static.debank.com/image/coin/logo_url/usdc/e87790bfe0b3f2ea855dc29069b38818.png",
          priceUSD: "1",
        },
        toChainId: 1,
        toToken: {
          address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          symbol: "USDC",
          decimals: 6,
          chainId: 1,
          name: "USD Coin",
          coinKey: "USDC",
          logoURI:
            "https://static.debank.com/image/coin/logo_url/usdc/e87790bfe0b3f2ea855dc29069b38818.png",
          priceUSD: "1",
        },
        slippage: 0.005,
        destinationGasConsumption: "0",
        destinationCallData:
          "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
        fromAddress: "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE",
        toAddress: "0xd2b2A35039270d8fDcA84E7c15E1461daD9F3Ad7",
      },
      estimate: {
        tool: "stargate",
        fromAmount: "2",
        toAmount: "2",
        toAmountMin: "2",
        approvalAddress: "0xB0D502E938ed5f4df2E681fE6E419ff29631d62b",
        executionDuration: 40,
        feeCosts: [
          {
            name: "LayerZero fees",
            description: "Infrastructure fee paid in native token",
            token: {
              address: "0x0000000000000000000000000000000000000000",
              symbol: "ETH",
              decimals: 18,
              chainId: 10,
              name: "ETH",
              coinKey: "ETH",
              logoURI:
                "https://static.debank.com/image/op_token/logo_url/op/d61441782d4a08a7479d54aea211679e.png",
              priceUSD: "1573.41",
            },
            amount: "3358382275654522",
            amountUSD: "5.28",
            percentage: "2642056.1282",
            included: false,
          },
          {
            name: "Equilibrium fees",
            description:
              "The fee paid to users who rebalance tokens for the stargate protocol",
            token: {
              address: "0x7f5c764cbc14f9669b88837ca1490cca17c31607",
              symbol: "USDC.e",
              decimals: 6,
              chainId: 10,
              name: "Bridged USD Coin",
              coinKey: "USDCe",
              logoURI:
                "https://static.debank.com/image/coin/logo_url/usdc/e87790bfe0b3f2ea855dc29069b38818.png",
              priceUSD: "1",
            },
            amount: "0",
            amountUSD: "0.00",
            percentage: "0.0000",
            included: true,
          },
          {
            name: "Liquidity provider fees",
            description:
              "The fee paid to liquidity providers for the stargate protocol",
            token: {
              address: "0x7f5c764cbc14f9669b88837ca1490cca17c31607",
              symbol: "USDC.e",
              decimals: 6,
              chainId: 10,
              name: "Bridged USD Coin",
              coinKey: "USDCe",
              logoURI:
                "https://static.debank.com/image/coin/logo_url/usdc/e87790bfe0b3f2ea855dc29069b38818.png",
              priceUSD: "1",
            },
            amount: "0",
            amountUSD: "0.00",
            percentage: "0.0000",
            included: true,
          },
          {
            name: "Protocol fees",
            description: "The fee paid to the stargate protocol",
            token: {
              address: "0x7f5c764cbc14f9669b88837ca1490cca17c31607",
              symbol: "USDC.e",
              decimals: 6,
              chainId: 10,
              name: "Bridged USD Coin",
              coinKey: "USDCe",
              logoURI:
                "https://static.debank.com/image/coin/logo_url/usdc/e87790bfe0b3f2ea855dc29069b38818.png",
              priceUSD: "1",
            },
            amount: "0",
            amountUSD: "0.00",
            percentage: "0.0000",
            included: true,
          },
        ],
        gasCosts: [
          {
            type: "SEND",
            price: "55972628",
            estimate: "525000",
            limit: "787500",
            amount: "29385629700000",
            amountUSD: "0.05",
            token: {
              address: "0x0000000000000000000000000000000000000000",
              symbol: "ETH",
              decimals: 18,
              chainId: 10,
              name: "ETH",
              coinKey: "ETH",
              logoURI:
                "https://static.debank.com/image/op_token/logo_url/op/d61441782d4a08a7479d54aea211679e.png",
              priceUSD: "1573.41",
            },
          },
        ],
        toolData: {
          sourcePoolId: "1",
          destinationPoolId: "1",
          router: "0xB0D502E938ed5f4df2E681fE6E419ff29631d62b",
          layerZeroChainId: 101,
        },
      },
      tool: "stargate",
      toolDetails: {
        key: "stargate",
        name: "Stargate",
        logoURI:
          "https://raw.githubusercontent.com/lifinance/types/5685c638772f533edad80fcb210b4bb89e30a50f/src/assets/icons/bridges/stargate.png",
      },
    },
  ],
  integrator: "hexa-lite",
  transactionRequest: {
    data: "0xed17861900000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000220000000000000000000000000000000000000000000000000000000000000076098db3c9bcf693438ae393a90b6b853c20c5e32f5d71f51e2415bcdc5ee66ec0d0000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000000000000000000000000000000007f5c764cbc14f9669b88837ca1490cca17c31607000000000000000000000000d2b2a35039270d8fdca84e7c15e1461dad9f3ad70000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000873746172676174650000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009686578612d6c69746500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000001e0000000000000000000000000bd6c7b0d2f68c2b7805d88388319cfb6ecb50ea9000000000000000000000000bd6c7b0d2f68c2b7805d88388319cfb6ecb50ea9000000000000000000000000625e7708f30ca75bfd92586e17077590c60eb4cd000000000000000000000000625e7708f30ca75bfd92586e17077590c60eb4cd000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000084eedd56e1000000000000000000000000625e7708f30ca75bfd92586e17077590c60eb4cd000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003ec627be9a3c1f30ef5fbf39609d2d6ab947e37e000000000000000000000000000000000000000000000000000000000000000000000000000000001111111254eeb25477b68fb85ed929f73a9605820000000000000000000000001111111254eeb25477b68fb85ed929f73a960582000000000000000000000000625e7708f30ca75bfd92586e17077590c60eb4cd0000000000000000000000007f5c764cbc14f9669b88837ca1490cca17c31607000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022412aa3caf000000000000000000000000b63aae6c353636d66df13b89ba4425cfe13d10ba000000000000000000000000625e7708f30ca75bfd92586e17077590c60eb4cd0000000000000000000000007f5c764cbc14f9669b88837ca1490cca17c31607000000000000000000000000b63aae6c353636d66df13b89ba4425cfe13d10ba0000000000000000000000001231deb6f5749ef6ce6943a275a1d3e7486f4eae000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009a00000000000000000000000000000000000000000000000000000000007c4120794a61358d6845594f94dc1db02a252b5b4814ad002469328dec0000000000000000000000007f5c764cbc14f9669b88837ca1490cca17c3160700000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111111254eeb25477b68fb85ed929f73a960582000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000bee6e4e8f737a000000000000000000000000d2b2a35039270d8fdca84e7c15e1461dad9f3ad7000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001400000000000000000000000000000000000000000000000000000000000000014d2b2a35039270d8fdca84e7c15e1461dad9f3ad70000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    to: "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE",
    value: "0x0bee6e4e8f737a",
    from: "0xd2b2A35039270d8fDcA84E7c15E1461daD9F3Ad7",
    chainId: 10,
    gasPrice: "0x03561314",
    gasLimit: "0x244ff2",
  },
} as LiFiQuoteResponse;

/**
 * Sending the Transaction
 */
export const sendTransaction = async (
  quote: LiFiQuoteResponse,
  signer: ethers.providers.JsonRpcSigner
) => {
  const tx = await signer.sendTransaction(quote.transactionRequest);
  const receipt = await tx.wait();
  return receipt;
};

/**
 * Checking allowence
 * Get the current the allowance and update if needed

 */
export const checkAndSetAllowance = async (
  signer: ethers.providers.JsonRpcSigner,
  tokenAddress: string,
  approvalAddress: string,
  amount: string
) => {
  // Transactions with the native token don't need approval
  if (tokenAddress === ethers.constants.AddressZero) {
    return;
  }
  const erc20 = new Contract(tokenAddress, ERC20_ABI, signer);
  const address = await signer.getAddress();
  const allowance = await erc20.allowance(address, approvalAddress);
  if (allowance.lt(amount)) {
    const approveTx = await erc20.approve(approvalAddress, amount);
    await approveTx.wait();
  }
};

/**
 * Perform the swap with LiFi
 * @param ops
 * @param provider
 */
export const swapWithLiFi = async (
  ops: {
    fromChain: string;
    toChain: string;
    fromToken: string;
    toToken: string;
    fromAmount: string;
    fromAddress: string;
  },
  signer: ethers.providers.JsonRpcSigner
) => {
  const quote = await getQuote(
    ops.fromChain,
    ops.toChain,
    ops.fromToken,
    ops.toToken,
    ops.fromAmount,
    ops.fromAddress
  );
  await checkAndSetAllowance(
    signer,
    quote.action.fromToken.address,
    quote.estimate.approvalAddress,
    quote.action.fromAmount
  );
  const receipt = await sendTransaction(quote, signer);
  return receipt;
};

export const getTokensPrice = async (tokens: IAsset[]) => {
  if (!tokens.length) {
    return [];
  }
  const options = { method: "GET", headers: { accept: "application/json" } };
  const chainIds = tokens
    .map((token) => token.chain?.id)
    .filter(Boolean)
    .join(",");
  const url = `https://li.quest/v1/tokens?chains=${chainIds}`;
  let tokensResponse!: { [key: string]: Token[] };
  //use Cache API to store the response
  try {
    const cache = await caches.open("hexa-lite_li-quest");
    cache.keys;
    const { data, timestamp } =
      ((await cache.match(url)?.then((r) => r?.json())) as {
        data: {
          tokens: {
            [key: string]: Token[];
          };
        };
        timestamp: number;
      }) || {};
    if (data && Date.now() - timestamp < 1000 * 60 * 15) {
      tokensResponse = data.tokens;
      console.log("[INFO] Tokens with price from cache:", data);
    } else {
      const response = await fetch(url, options);
      const responseData = (await response.json()) as {
        tokens: { [key: string]: Token[] };
      };
      cache.put(
        url,
        new Response(
          JSON.stringify({
            data: responseData,
            timestamp: Date.now(),
          })
        )
      );
      tokensResponse = responseData.tokens;
    }
  } catch (error) {
    throw error;
  }
  const tokenWithPrice: IAsset[] = [];
  for (const token of tokens) {
    const index = tokensResponse[token.chain?.id as number].findIndex(
      (t) => t.symbol === token.symbol
    );
    if (index > -1) {
      tokenWithPrice.push({
        ...token,
        priceUsd: Number(
          tokensResponse[token.chain?.id as number][index].priceUSD
        ),
        balanceUsd:
          token.balance *
          Number(tokensResponse[token.chain?.id as number][index].priceUSD),
        thumbnail:
          token.thumbnail ||
          tokensResponse[token.chain?.id as number][index].logoURI,
      });
    }
  }
  // console.log("[INFO] Tokens with price:", tokenWithPrice);
  return tokenWithPrice;
};

export const LIFI_CONFIG = Object.freeze<WidgetConfig>({
  // integrator: "cra-example",
  integrator: process.env.NEXT_PUBLIC_APP_IS_PROD ? "hexa-lite" : "",
  fee: 0.01,
  variant: "expandable",
  insurance: true,
  containerStyle: {
    border: `1px solid rgba(var(--ion-color-primary-rgb), 0.4);`,
    borderRadius: "32px",
    filter: "drop-shadow(rgba(var(--ion-color-primary-rgb), .1) 0px 0px 50px )",
  },
  theme: {
    shape: {
      borderRadius: 12,
      borderRadiusSecondary: 24,
    },
    palette: {
      grey: {
        "800": "rgba(var(--ion-color-primary-rgb), 0.4)",
      },
      text: {
        primary: "rgb(var(--ion-text-color-rgb))",
        secondary: "rgba(var(--ion-text-color-rgb), 0.6)",
      },
      background: {
        paper: "rgb(var(--item-background-shader-rgb))", // green
        // default: '#182449',
      },
      primary: {
        main: "#0090FF",
        contrastText: "rgb(var(--ion-text-color.rgb))",
      },
      secondary: {
        main: "#4CCCE6",
        contrastText: "rgb(var(--ion-text-color.rgb))",
      },
    },
  },
  languages: {
    default: "en",
  },
  appearance: "dark",
  hiddenUI: [HiddenUI.Appearance, HiddenUI.PoweredBy, HiddenUI.Language],
});
