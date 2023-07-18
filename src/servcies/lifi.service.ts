
import { ethers, Contract } from "ethers";

interface LiFiQuoteResponse {
  type:               string;
  id:                 string;
  tool:               string;
  toolDetails:        ToolDetails;
  action:             Action;
  estimate:           Estimate;
  includedSteps:      IncludedStep[];
  integrator:         string;
  transactionRequest: TransactionRequest;
}

interface Action {
  fromToken:                  Token;
  fromAmount:                 string;
  toToken:                    Token;
  fromChainId:                number;
  toChainId:                  number;
  slippage:                   number;
  fromAddress:                string;
  toAddress:                  string;
  destinationGasConsumption?: string;
}

interface Token {
  address:  string;
  chainId:  number;
  symbol:   string;
  decimals: number;
  name:     string;
  priceUSD: string;
  logoURI:  string;
  coinKey:  string;
}

interface Estimate {
  tool:              string;
  approvalAddress:   string;
  toAmountMin:       string;
  toAmount:          string;
  fromAmount:        string;
  feeCosts:          FeeCost[];
  gasCosts:          GasCost[];
  executionDuration: number;
  fromAmountUSD?:    string;
  toAmountUSD?:      string;
  toolData?:         ToolData;
}

interface FeeCost {
  name:        string;
  description: string;
  percentage:  string;
  token:       Token;
  amount:      string;
  amountUSD:   string;
  included:    boolean;
}

interface GasCost {
  type:      string;
  price:     string;
  estimate:  string;
  limit:     string;
  amount:    string;
  amountUSD: string;
  token:     Token;
}

interface ToolData {
  relayerFeeCost: FeeCost;
}

interface IncludedStep {
  id:          string;
  type:        string;
  action:      Action;
  estimate:    Estimate;
  tool:        string;
  toolDetails: ToolDetails;
}

interface ToolDetails {
  key:     string;
  name:    string;
  logoURI: string;
}

interface TransactionRequest {
  data:     string;
  to:       string;
  value:    string;
  from:     string;
  chainId:  number;
  gasPrice: string;
  gasLimit: string;
}

const ERC20_ABI = [
  {
      "name": "approve",
      "inputs": [
          {
              "internalType": "address",
              "name": "spender",
              "type": "address"
          },
          {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
          }
      ],
      "outputs": [
          {
              "internalType": "bool",
              "name": "",
              "type": "bool"
          }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "name": "allowance",
      "inputs": [
          {
              "internalType": "address",
              "name": "owner",
              "type": "address"
          },
          {
              "internalType": "address",
              "name": "spender",
              "type": "address"
          }
      ],
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  }
];

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
  fromAddress: string,
  ): Promise<LiFiQuoteResponse> => {
  const integrator = "hexa-lite";
  const fee = 0.005;
  // build url params from input
  const params = new URLSearchParams();
  params.append('fromChain', fromChain);
  params.append('toChain', toChain);
  params.append('fromToken', fromToken);
  params.append('toToken', toToken);
  params.append('fromAmount', fromAmount);
  params.append('fromAddress', fromAddress);
  params.append('integrator', integrator);
  params.append('fee', fee.toString());
  const reponse = await fetch(`https://li.quest/v1/quote?${params.toString()}`);
  const result:LiFiQuoteResponse =  await reponse.json()
  return result;
}

/**
 * Sending the Transaction
 */
export const sendTransaction = async (
  quote: LiFiQuoteResponse, 
  provider: ethers.providers.Web3Provider,
) => {
  const signer = provider.getSigner();
  const tx = await signer.sendTransaction(quote.transactionRequest);
  const receipt = await tx.wait();
  return receipt;
}

/**
 * Checking allowence
 * Get the current the allowance and update if needed

 */
export const checkAndSetAllowance = async (
  provider: ethers.providers.Web3Provider, 
  tokenAddress: string, 
  approvalAddress: string, 
  amount: string,
) => {
    // Transactions with the native token don't need approval
    if (tokenAddress === ethers.constants.AddressZero) {
        return
    }
    const signer = provider.getSigner();
    const erc20 = new Contract(tokenAddress, ERC20_ABI, signer);
    const address = await signer.getAddress();
    const allowance = await erc20.allowance(address, approvalAddress);
    if (allowance.lt(amount)) {
        const approveTx = await erc20.approve(approvalAddress, amount);
        await approveTx.wait();
    }
}

/**
 * Perform the swap with LiFi
 * @param ops 
 * @param provider 
 */
export const swapWithLiFi = async (
  ops: {
    fromChain: string,
    toChain: string,
    fromToken: string,
    toToken: string,
    fromAmount: string,
    fromAddress: string,
  },
  provider: ethers.providers.Web3Provider,
) => {
  const quote = await getQuote(
    ops.fromChain, 
    ops.toChain, 
    ops.fromToken, 
    ops.toToken, 
    ops.fromAmount, 
    ops.fromAddress,
  );
  await checkAndSetAllowance(
    provider, 
    quote.action.fromToken.address, 
    quote.estimate.approvalAddress, 
    quote.action.fromAmount,
  );
  const receipt = await sendTransaction(quote, provider);
  return receipt;
}