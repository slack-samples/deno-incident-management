import Incident from "../../../types/incident.ts";
import { getBasicAuthAtlassian } from "./get_atlassian_auth.ts";

// deno-lint-ignore no-explicit-any
export async function createConfluenceDoc(env: any, incident: Incident) {
  const instance = env["ATLASSIAN_INSTANCE"];
  const basicAuth = getBasicAuthAtlassian(env);
  const url = `https://${instance}/wiki/rest/api/content`;

  const documentHTML = getConfluenceCreateHTML(incident, env);

  const requestBody = {
    "type": "page",
    "title": `${incident.incident_id}`,
    "space": { "key": env["ATLASSIAN_SPACE"] },
    "body": {
      "storage": {
        "value": documentHTML,
        "representation": "storage",
      },
    },
  };

  // TODO :: Existing implementation does not allow for subsequent updating of
  // Confluence document if issue is re-opened and re-closed
  // deno-lint-ignore no-explicit-any
  const createPageResp: any = await fetch(
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

  const createPageJson = await createPageResp.json();

  const docURL = createPageJson._links
    ? `https://${instance}/wiki${createPageJson._links.webui}`
    : `FAILED`;

  return docURL;
}

// deno-lint-ignore no-explicit-any
function getConfluenceCreateHTML(incident: Incident, env: any) {
  const instance = env["ATLASSIAN_INSTANCE"];

  const jiraLink = "https://" + instance + "/browse/" +
    incident.incident_jira_issue_key;

  const slackSwarmChannel = env["SLACK_URL"] +
    incident.incident_swarming_channel_id;

  let update = "";
  if (incident.last_incident_update == undefined) {
    update = "No updates sent";
  } else {
    update = incident.last_incident_update;
  }
  const html = `
  <h2>
  <ac:emoticon ac:name="blue-star" ac:emoji-shortname=":clipboard:" ac:emoji-id="1f4cb"
    ac:emoji-fallback="📋]" />&nbsp;Root Cause Analysis Summary
</h2>
<table data-layout="default" ac:local-id="24a6e628-6735-4fda-ba3d-4505ca9a9f02">
  <colgroup>
    <col style="width: 167.0px;" />
    <col style="width: 592.0px;" />
  </colgroup>
  <tbody>
    <tr>
      <td data-highlight-colour="#f4f5f7">
        <p><strong>Incident</strong></p>
      </td>
      <td>
        <p>${incident.short_description}</p>
      </td>
    </tr>
    <tr>
      <td data-highlight-colour="#f4f5f7">
        <p><strong>Severity</strong></p>
      </td>
      <td>
        <p>${incident.severity}</p>
      </td>
    </tr>
    <tr>
      <td data-highlight-colour="#f4f5f7">
        <p><strong>Jira Ticket</strong></p>
      </td>
      <td>
        <p><a href="${jiraLink}">Ticket to Jira Issue</a></p>
      </td>
    </tr>
    <tr>
      <td data-highlight-colour="#f4f5f7">
        <p><strong>Description</strong></p>
      </td>
      <td>
        <p>${incident.long_description}</p>
      </td>
    </tr>
  </tbody>
</table>
<table data-layout="default" ac:local-id="d6b662b4-7710-4cfd-b17c-c82e8a569447">
  <colgroup>
    <col style="width: 167.0px;" />
    <col style="width: 592.0px;" />
  </colgroup>
  <tbody>
    <tr>
      <th>
        <p><strong>Last Update</strong></p>
      </th>
      <th data-highlight-colour="#ffffff">
        <p>${update}</p>
      </th>
    </tr>
    <tr>
      <td data-highlight-colour="#f4f5f7">
        <p><strong>Close Notes</strong></p>
      </td>
      <td>
        <p>${incident.incident_close_notes}</p>
      </td>
    </tr>
    <tr>
      <td data-highlight-colour="#f4f5f7">
        <p><strong>Slack Incident Channel</strong></p>
      </td>
      <td>
        <p><a href="${slackSwarmChannel}">Incident Swarming Channel in Slack</a></p>
      </td>
    </tr>
  </tbody>
</table>
<p />
<p />
<ac:adf-extension>
  <ac:adf-node type="panel">
    <ac:adf-attribute key="panel-type">note</ac:adf-attribute>
    <ac:adf-content>
      <h2>Executive summary</h2>
      <p> <ac:placeholder>Summarize the incident in a few sentences and include its duration, severity, and causes.
        </ac:placeholder> </p>
    </ac:adf-content>
  </ac:adf-node>
  <ac:adf-fallback>
    <div class="panel conf-macro output-block" style="background-color: rgb(234,230,255);border-color:
      rgb(153,141,217);border-width: 1.0px;">
      <div class="panelContent" style="background-color: rgb(234,230,255);"><h2>Executive summary</h2>
        <p>  </p>
      </div>
    </div>
  </ac:adf-fallback>
</ac:adf-extension>
<p />
<h2>
  <ac:emoticon ac:name="blue-star" ac:emoji-shortname=":pencil:" ac:emoji-id="1f4dd" ac:emoji-fallback="📝" />&nbsp;Postmortem report
</h2>
<table data-layout="wide" ac:local-id="1a5dbdb0-3299-4db5-b510-fd66a32acb39">
  <colgroup>
    <col style="width: 222.0px;" />
    <col style="width: 578.0px;" />
  </colgroup>
  <tbody>
    <tr>
      <th data-highlight-colour="#fffae6">
        <p><strong>Instructions</strong></p>
      </th>
      <th data-highlight-colour="#fffae6">
        <p><strong>Report</strong></p>
      </th>
    </tr>
    <tr>
      <td>
        <h3>
          <ac:emoticon ac:name="warning" ac:emoji-shortname=":warning:" ac:emoji-id="atlassian-warning"
            ac:emoji-fallback=":warning:" />&nbsp;Leadup
        </h3>
        <p><br />List the sequence of events that led to the incident.</p>
      </td>
      <td>
        <p> <ac:placeholder>You can @ mention team members, attach links, or use slash commands to share relevant
            data. </ac:placeholder> </p>
      </td>
    </tr>
    <tr>
      <td>
        <h3>
          <ac:emoticon ac:name="blue-star" ac:emoji-shortname=":woman_gesturing_no:"
            ac:emoji-id="1f645-200d-2640-fe0f" ac:emoji-fallback="🙅&zwj;♀️" />&nbsp;Fault
        </h3>
        <p><br />Describe how the change that was implemented didn't work as expected. If available, include relevant
          data visualizations.</p>
      </td>
      <td>
        <p />
      </td>
    </tr>
    <tr>
      <td>
        <h3>
          <ac:emoticon ac:name="blue-star" ac:emoji-shortname=":flying_disc:" ac:emoji-id="1f94f"
            ac:emoji-fallback="🥏" />&nbsp;Impact
        </h3>
        <p><br />Describe how internal and external users were impacted during the incident. Include how many support
          cases were raised.</p>
      </td>
      <td>
        <p />
      </td>
    </tr>
    <tr>
      <td>
        <h3>
          <ac:emoticon ac:name="blue-star" ac:emoji-shortname=":eye:" ac:emoji-id="1f441"
            ac:emoji-fallback="👁" />&nbsp;Detection
        </h3>
        <p><br />Report when the team detected the incident and how they knew it was happening. Describe how the team
          could've improved time to detection.</p>
      </td>
      <td>
        <p />
      </td>
    </tr>
    <tr>
      <td>
        <h3>
          <ac:emoticon ac:name="blue-star" ac:emoji-shortname=":man_raising_hand:"
            ac:emoji-id="1f64b-200d-2642-fe0f" ac:emoji-fallback="🙋&zwj;♂️" />&nbsp;Response
        </h3>
        <p><br />Report who responded to the incident and describe what they did at what times. Include any delays or
          obstacles to responding.</p>
      </td>
      <td>
        <p />
      </td>
    </tr>
    <tr>
      <td>
        <h3>
          <ac:emoticon ac:name="blue-star" ac:emoji-shortname=":woman_gesturing_ok:"
            ac:emoji-id="1f646-200d-2640-fe0f" ac:emoji-fallback="🙆&zwj;♀️" />&nbsp;Recovery
        </h3>
        <p><br />Report how the user impact was mitigated and when the incident was deemed resolved. Describe how the
          team could've improved time to mitigation.</p>
      </td>
      <td>
        <p />
      </td>
    </tr>
    <tr>
      <td>
        <h3>
          <ac:emoticon ac:name="blue-star" ac:emoji-shortname=":timer:" ac:emoji-id="23f2"
            ac:emoji-fallback="⏲" />&nbsp;Timeline
        </h3>
        <p><br />Detail the incident timeline using UTC to standardize for timezones. Include lead-up events,
          post-impact event, and any decisions or changes made.</p>
      </td>
      <td>
        <p />
      </td>
    </tr>
    <tr>
      <td>
        <h3>
          <ac:emoticon ac:name="blue-star" ac:emoji-shortname=":mag_right:" ac:emoji-id="1f50e"
            ac:emoji-fallback="🔎" />&nbsp;Five whys root cause identification
        </h3>
        <p><br />Run a <a href="https://www.atlassian.com/team-playbook/plays/5-whys">5-whys analysis</a> to
          understand the true causes of the incident.&nbsp;</p>
      </td>
      <td>
        <p />
      </td>
    </tr>
    <tr>
      <td>
        <h3>
          <ac:emoticon ac:name="blue-star" ac:emoji-shortname=":seedling:" ac:emoji-id="1f331"
            ac:emoji-fallback="🌱" />&nbsp;Blameless root cause
        </h3>
        <p><br />Note the final root cause and describe what needs to change without placing blame to prevent this
          class of incident from recurring.</p>
      </td>
      <td>
        <p />
      </td>
    </tr>
    <tr>
      <td>
        <h3>
          <ac:emoticon ac:name="blue-star" ac:emoji-shortname=":white_check_mark:" ac:emoji-id="2705"
            ac:emoji-fallback="✅" />&nbsp;Backlog check
        </h3>
        <p><br />Review the engineering backlog to find out if there was unplanned work that could've prevented the
          incident or reduced its impact.</p>
      </td>
      <td>
        <p />
      </td>
    </tr>
    <tr>
      <td>
        <h3>
          <ac:emoticon ac:name="blue-star" ac:emoji-shortname=":card_box:" ac:emoji-id="1f5c3"
            ac:emoji-fallback="🗃" />&nbsp;Related incidents
        </h3>
        <p><br />Check if any past incidents could've had the same root cause. Note what mitigation was attempted in
          those incidents and ask why this incident occurred again.</p>
      </td>
      <td>
        <p />
      </td>
    </tr>
    <tr>
      <td>
        <h3>
          <ac:emoticon ac:name="blue-star" ac:emoji-shortname=":thinking:" ac:emoji-id="1f914"
            ac:emoji-fallback="🤔" />&nbsp;Lessons learned
        </h3>
        <p><br />Describe what you learned, what went well, and how you can improve.</p>
      </td>
      <td>
        <p />
      </td>
    </tr>
    <tr>
      <td>
        <h3>
          <ac:emoticon ac:name="blue-star" ac:emoji-shortname=":writing_hand:" ac:emoji-id="270d"
            ac:emoji-fallback="✍" />&nbsp;Follow-up tasks
        </h3>
        <p><br />List the Jira issues created to prevent this class of incident in the future. Note who is
          responsible, when they have to complete the work, and where that work is being tracked.</p>
      </td>
      <td>
        <p />
      </td>
    </tr>
  </tbody>
</table>
<p />
<p />
<p />"
`;
  return html;
}
