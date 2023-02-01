import { SlackFunction } from "deno-slack-sdk/mod.ts";
import { postIncidentFunctionDefinition } from "./definition.ts";
import Incident from "../../types/incident.ts";
import { saveIncident } from "../../datastores/incidents.ts";
import { createJiraIssue } from "./utils/create_jira_issue.ts";
import { getOpenIncidentBlocks } from "./view_blocks/open_incident.ts";

// Interactivity handlers : Actions
import { allClear } from "./interactivity_handlers/actions/all_clear.ts";
import { createChannel } from "./interactivity_handlers/actions/create_channel.ts";
import { escalate } from "./interactivity_handlers/actions/escalate.ts";
import { sendUpdate } from "./interactivity_handlers/actions/send_update.ts";
import { deEscalate } from "./interactivity_handlers/actions/de-escalate.ts";
import { addParticipants } from "./interactivity_handlers/actions/add_participants.ts";
import { edit } from "./interactivity_handlers/actions/edit.ts";
import { reOpen } from "./interactivity_handlers/actions/re-open.ts";
import { closeAndArchive } from "./interactivity_handlers/actions/close_and_archive.ts";

// Interactivity handlers : View Submissions
import { allClearSubmission } from "./interactivity_handlers/view_submissions/all_clear.ts";
import { assignDRISubmission } from "./interactivity_handlers/view_submissions/assign_dri.ts";
import { addParticipantsSubmission } from "./interactivity_handlers/view_submissions/add_participants.ts";
import { sendUpdateSubmission } from "./interactivity_handlers/view_submissions/send_update.ts";
import { editIncidentSubmission } from "./interactivity_handlers/view_submissions/edit.ts";
import { assignDRI } from "./interactivity_handlers/actions/assign_dri.ts";

/**
 * This is the handling code for the postIncidentFunction. It will:
 * 1. Create a Jira issue
 * 2. Create and save a new incident to the incidents datastore
 * 3. Post an incident message to the main incident channel with button actions to take
 */
export default SlackFunction(
  postIncidentFunctionDefinition,
  async (
    { inputs, client, env },
  ) => {
    const incidentChannel = env["INCIDENT_CHANNEL"];

    // TODO :: convert into CustomType
    const incident: Incident = {
      ...inputs,
      short_description: inputs.short_description.substring(0, 50),
      incident_status: "OPEN",
      incident_jira_issue_key: "",
      incident_call_id: "",
      incident_closed_ts: "",
      incident_start_time: (Date.now() / 1000),
      zoom_call_bookmark_id: "",
      last_incident_update: "",
      last_incident_update_ts: "",
      leadership_paged: false,
      rca_doc_bookmark_id: "",
      incident_participants: "",
    };

    try {
      // Create Jira issue and save key to incident
      const jiraCreateRes = await createJiraIssue(env, incident);
      if (jiraCreateRes.errors) {
        throw new Error(`Jira: ${JSON.stringify(jiraCreateRes.errors)}`);
      }

      // Update incident with Jira issue information
      incident.incident_jira_issue_key = jiraCreateRes.key;

      // Post initial incident message and save message timestamp
      const blocks = getOpenIncidentBlocks(incident, incidentChannel);
      const { ts } = await client.chat.postMessage({
        channel: incidentChannel,
        blocks,
      });

      // Update incident with main channel incident message timestamp
      incident.incident_channel_msg_ts = ts;

      saveIncident(client, incident);

      // Post message with link to Jira ticket in thread
      const issueKey = jiraCreateRes.key ||
        jiraCreateRes.incident_jira_issue_key;
      const instance = env["ATLASSIAN_INSTANCE"];

      const link = `https://${instance}/browse/${issueKey}`;
      const jiraIssueBlocks = [
        {
          type: "section",
          block_id: "jira_issue_block",
          text: {
            type: "mrkdwn",
            text: " :atlassian: Jira Issue: " + "<" + `${link}` + "|" +
              issueKey +
              ">" +
              " created.",
          },
        },
      ];

      client.chat.postMessage({
        channel: incidentChannel,
        blocks: jiraIssueBlocks,
        thread_ts: ts,
      });
    } catch (err) {
      return {
        error:
          `An error was encountered during issue creation: \`${err.message}\``,
      };
    }

    /**
     * IMPORTANT! Set `completed` to false in order to pause function's complete state
     * since we will wait for user interaction in the button handlers below.
     * Steps after this step in the workflow will not execute until we
     * complete our function.
     */
    return { completed: false };
  },
)
  // Block Actions (buttons)
  .addBlockActionsHandler("send_update", sendUpdate)
  .addBlockActionsHandler("create_channel", createChannel)
  .addBlockActionsHandler("all_clear", allClear)
  .addBlockActionsHandler("escalate", escalate)
  .addBlockActionsHandler("de_escalate", deEscalate)
  .addBlockActionsHandler("add_participants", addParticipants)
  .addBlockActionsHandler("edit", edit)
  .addBlockActionsHandler("re_open", reOpen)
  .addBlockActionsHandler("close_and_archive", closeAndArchive)
  .addBlockActionsHandler("assign_dri", assignDRI)
  // View Submissions
  .addViewSubmissionHandler("all_clear_modal", allClearSubmission)
  .addViewSubmissionHandler("assign_dri_modal", assignDRISubmission)
  .addViewSubmissionHandler("add_participants_modal", addParticipantsSubmission)
  .addViewSubmissionHandler("send_update_modal", sendUpdateSubmission)
  .addViewSubmissionHandler("edit_incident_modal", editIncidentSubmission);
