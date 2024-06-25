export enum TxType  {
  ['0x0'] = 'Natif',
}

export interface TxInterface1 {
  timestamp: Date;
  nonce: number;
  blockNumber: number;
  from: string;
  to: string;
  gas: number;
  gasPrice: number;
  input: string;
  transactionIndex: string;
  blockHash: string;
  value: string;
  type: string;
  cumulativeGasUsed: number;
  gasUsed: number;
  hash: string;
  status: number;
  blockchain: string;
}

export interface TxInterface {
  type:          string;
  id:            string;
  attributes:    TxAttributes;
  relationships: Relationships;
}

export interface TxAttributes {
  operation_type:       string;
  hash:                 string;
  mined_at_block:       number;
  mined_at:             string;
  sent_from:            string;
  sent_to:              string;
  status:               string;
  nonce:                number;
  fee:                  Fee;
  transfers:            Transfer[];
  approvals:            Approval[];
  application_metadata: TxApplicationMetadata;
  flags:                AttributesFlags;
}

export interface TxApplicationMetadata {
  name:             string;
  icon:             Icon;
  contract_address: string;
  method:           Method;
}

export interface Icon {
  url: string;
}

export interface Method {
  id:   string;
  name: string;
}

export interface Approval {
  fungible_info: FungibleInfo;
  quantity:      Quantity;
  sender:        string;
}

export interface FungibleInfo {
  name:            string;
  symbol:          string;
  icon:            Icon | null;
  flags:           FungibleInfoFlags;
  implementations: Implementation[];
}

export interface FungibleInfoFlags {
  verified: boolean;
}

export interface Implementation {
  chain_id: string;
  address:  string;
  decimals: number;
}

export interface Quantity {
  int:      string;
  decimals: number;
  float:    number;
  numeric:  string;
}

export interface Fee {
  fungible_info: FungibleInfo;
  quantity:      Quantity;
  price:         number;
  value:         number;
}

export interface AttributesFlags {
  is_trash: boolean;
}

export interface Transfer {
  fungible_info: FungibleInfo;
  direction:     string;
  quantity:      Quantity;
  value:         number;
  price:         number;
  sender:        string;
  recipient:     string;
}

export interface Relationships {
  chain: Chain;
  dapp:  Dapp;
}

export interface Chain {
  links: Links;
  data:  Data;
}

export interface Data {
  type: string;
  id:   string;
}

export interface Links {
  related: string;
}

export interface Dapp {
  data: Data;
}
