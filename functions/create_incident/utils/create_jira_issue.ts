import Incident from "../../../types/incident.ts";
import { getBasicAuthAtlassian } from "./get_atlassian_auth.ts";

// deno-lint-ignore no-explicit-any
export async function createJiraIssue(env: any, incident: Incident) {
  const projectKey = env["JIRA_PROJECT"];
  const instance = env["ATLASSIAN_INSTANCE"];
  const basicAuth = getBasicAuthAtlassian(env);
  const issueURL = "/rest/api/2/issue/";

  const url = "https://" + instance + issueURL;
  const incidentID = incident.incident_id;

  //build the requestBody with our inputs from the UI
  // deno-lint-ignore no-explicit-any
  const requestBody: any = {
    "fields": {
      "project": {
        "key": projectKey,
      },
      "summary": incidentID + ": " + incident.short_description,
      "description": "",
      "issuetype": {
        "name": "Task",
      },
    },
  };

  //only add optional fields to request body if they were filled in in the UI
  if (incident.long_description !== "") {
    requestBody.fields.description = incident.long_description;
  }

  // deno-lint-ignore no-explicit-any
  const createTicketResp: any = await fetch(
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
  const createTicketJson = await createTicketResp.json();

  return createTicketJson;
}
