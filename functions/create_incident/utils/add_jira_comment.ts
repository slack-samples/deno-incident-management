import { getBasicAuthAtlassian } from "./get_atlassian_auth.ts";

export async function addJiraComment(
  // deno-lint-ignore no-explicit-any
  env: any,
  jiraIssueKey: string,
  closeNotes: string,
) {
  const instance = env["ATLASSIAN_INSTANCE"];
  const basicAuth = getBasicAuthAtlassian(env);
  const issueURL = "/rest/api/2/issue/";

  const url = "https://" + instance + issueURL + jiraIssueKey + "/comment";

  // deno-lint-ignore no-explicit-any
  const requestBody: any = {
    "body": closeNotes,
  };

  // deno-lint-ignore no-explicit-any
  const addCommentResp: any = await fetch(
    url,
    {
      method: "POST",
      headers: {
        "Authorization": basicAuth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    },
  );
  return addCommentResp;
}
