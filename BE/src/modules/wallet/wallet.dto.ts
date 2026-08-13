import { Wallet } from "./wallet.model";

export interface IWalletResponse {
  id: number;
  balance: number;
}

export const walletResponse = (data: {
  wallet: Wallet;
  langCode: string;
  multiLang?: boolean;
}) => {
  const { langCode, wallet, multiLang } = data;
  const { id, balance } = wallet;
  const response: IWalletResponse = {
    id,
    balance: parseFloat(balance),
  };
  return response;
};
