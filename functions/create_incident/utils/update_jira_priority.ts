import { getBasicAuthAtlassian } from "./get_atlassian_auth.ts";

// https://docs.atlassian.com/software/jira/docs/api/REST/7.6.1/?_ga=2.226925854.2030217466.1525875113-593458345.1525875113#api/2/issue-editIssue
// deno-lint-ignore no-explicit-any
export async function updateJiraPriorityToLow(env: any, issueKey: string) {
  const instance = env["ATLASSIAN_INSTANCE"];
  const basicAuth = getBasicAuthAtlassian(env);

  // URL to update an Issue via Jira Cloud API
  const url = `https://${instance}/rest/api/2/issue/${issueKey}`;

  // Current Mapping for Jira Cloud Priorities
  //     "name": "Highest",
  //     "id": "1"
  //     "name": "High",
  //     "id": "2"
  //     "name": "Medium",
  //     "id": "3"
  //     "name": "Low",
  //     "id": "4"
  //     "name": "Lowest",
  //     "id": "5"
  // Automatically set any priority to "Low" once we call close incident

  // deno-lint-ignore no-explicit-any
  const requestBody: any = JSON.stringify({
    "update": { "priority": [{ "set": { "id": "4" } }] },
  });

  const updateJiraPriorityResp = await fetch(
    url,
    {
      method: "PUT",
      headers: {
        "Authorization": basicAuth,
        "Content-Type": "application/json",
      },
      body: requestBody,
    },
  );

  return updateJiraPriorityResp;
}
