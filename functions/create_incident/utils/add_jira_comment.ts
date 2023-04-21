import { Env } from "deno-slack-sdk/types.ts";
import { getBasicAuthAtlassian } from "./get_atlassian_auth.ts";

export async function addJiraComment(
  env: Env,
  jiraIssueKey: string,
  closeNotes: string,
) {
  const instance = env["ATLASSIAN_INSTANCE"];
  const basicAuth = getBasicAuthAtlassian(env);
  const issueURL = "/rest/api/2/issue/";
  const url = "https://" + instance + issueURL + jiraIssueKey + "/comment";

  const requestBody = {
    "body": closeNotes,
  };

  const addCommentResp = await fetch(
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
