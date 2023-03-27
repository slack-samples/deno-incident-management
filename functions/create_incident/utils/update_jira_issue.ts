import Incident from "../../../types/incident.ts";
import { getBasicAuthAtlassian } from "./get_atlassian_auth.ts";

export async function updateJiraIssue(
  // deno-lint-ignore no-explicit-any
  env: any,
  incident: Incident,
  newSummary: string,
  newLongDesc: string,
) {
  const instance = env["ATLASSIAN_INSTANCE"];
  const basicAuth = getBasicAuthAtlassian(env);
  const jiraIssueKey = incident.incident_jira_issue_key;
  const issueURL = "/rest/api/2/issue/" + jiraIssueKey;

  const url = "https://" + instance + issueURL;
  const incidentID = incident.incident_id;

  //build the requestBody with our inputs from the UI
  // deno-lint-ignore no-explicit-any
  const requestBody: any = {
    "fields": {},
  };

  //only add optional fields to request body if they were filled in in the UI
  if (newLongDesc !== "") {
    requestBody.fields.description = newLongDesc;
  }

  if (newSummary !== "") {
    requestBody.fields.summary = incidentID + ": " + newSummary;
  }

  // deno-lint-ignore no-explicit-any
  const updateTicketResp: any = await fetch(
    url,
    {
      method: "PUT",
      headers: {
        "Authorization": basicAuth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    },
  );

  return updateTicketResp;
}
