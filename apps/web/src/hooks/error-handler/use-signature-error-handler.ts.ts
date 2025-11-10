import { useCallback } from "react";

export type ParsedSignatureError = {
  type: "UserRejected" | "WalletNotConnected" | "SignatureFailed" | "UnknownSignatureError";
  message: string;
  uiMessage: string;
};

export function useSignatureErrorHandler() {

  const handleSignatureError = useCallback(
    (err: any): ParsedSignatureError | null => {
      const msg = String(err?.message ?? "").toLowerCase();

      if (msg.includes("user rejected") || msg.includes("transaction cancelled")) {
        return {
          type: "UserRejected",
          message: err?.message ?? "User rejected",
          uiMessage: '用户拒绝交易',
        };
      }

      if (msg.includes("wallet not connected")) {
        return {
          type: "WalletNotConnected",
          message: err?.message ?? "Wallet not connected",
          uiMessage: '请先连接钱包',
        };
      }

      if (msg.includes("sign") && msg.includes("fail")) {
        return {
          type: "SignatureFailed",
          message: err?.message ?? "Signature failed",
          uiMessage: '交易签名失败，请重试',
        };
      }

      return {
        type: "UnknownSignatureError",
        message: err?.message ?? "Unknown signature error",
        uiMessage: '未知签名错误，请检查钱包状态',
      };
    },
    []
  );

  return { handleSignatureError };
}
