// deno-lint-ignore no-explicit-any
export function getBasicAuthAtlassian(env: any) {
  const username = env["ATLASSIAN_USERNAME"];
  const password = env["ATLASSIAN_API_KEY"];
  const basicAuth = "Basic " + btoa(username + ":" + password);
  return basicAuth;
}
