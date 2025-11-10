import { useCallback } from "react";
import * as anchor from "@coral-xyz/anchor";
import type { Idl } from "@coral-xyz/anchor";

export type ParsedAnchorError = {
  type: "AnchorError" | "UnknownError";
  code: number | null;
  name: string | null;
  message: string;
  idlMessage: string | null;
  logs: string[];
  uiMessage: string;
};

export function useAnchorErrorHandler(idl: Idl) {

  const handleAnchorError = useCallback(
    (err: any): ParsedAnchorError | null => {
      if (err instanceof anchor.AnchorError) {
        const { number, code } = err.error.errorCode;
        const msg = err.error.errorMessage;
        const idlError = idl.errors?.find((e) => e.code === number);

        // const uiMessage =
        //   t(`errors.${code}`, {
        //     defaultValue: idlError?.msg ?? msg ?? t("errors.Default"),
        //   }) ?? t("errors.Default");

        const uiMessage = msg ?? '交易失败，请重试'

        return {
          type: "AnchorError",
          code: number,
          name: code,
          message: msg,
          idlMessage: idlError?.msg ?? null,
          logs: err.logs ?? [],
          uiMessage,
        };
      }

      return null;
    },
    [idl]
  );

  return { handleAnchorError };
}
