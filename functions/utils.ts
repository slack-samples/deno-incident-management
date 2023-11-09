import { BaseResponse } from "deno-slack-api/types.ts";

export function buildError(
  method: string,
  response: BaseResponse,
): { error: string } {
  return {
    error: `Error while executing ${method}, Error detail ${response.error}`,
  };
}
