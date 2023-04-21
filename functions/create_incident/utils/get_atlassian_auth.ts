import { Env } from "deno-slack-sdk/types.ts";

export function getBasicAuthAtlassian(env: Env) {
  const username = env["ATLASSIAN_USERNAME"];
  const password = env["ATLASSIAN_API_KEY"];
  const basicAuth = "Basic " + btoa(username + ":" + password);
  return basicAuth;
}
