import {
  ViewSubmissionHandler,
} from "deno-slack-sdk/functions/interactivity/types.ts";

import { postIncidentFunctionDefinition } from "../../definition.ts";
import { getIncident, saveIncident } from "../../../../datastores/incidents.ts";
import { addJiraComment } from "../../utils/add_jira_comment.ts";
import { updateJiraPriorityToLow } from "../../utils/update_jira_priority.ts";
import { createConfluenceDoc } from "../../utils/create_confluence_page.ts";
import { getClosedIncidentBlocks } from "../../view_blocks/closed_incident.ts";

export const allClearSubmission: ViewSubmissionHandler<
  typeof postIncidentFunctionDefinition.definition
> = async (
  { view, body, client, env },
) => {
  const { private_metadata = "" } = view;
  const allClearTS = Date.now() / 1000;

  const incidentID = JSON.parse(private_metadata).incident_id;
  const incident = await getIncident(client, incidentID);
  const comment =
    view.state.values.add_comment_block.close_incident_action.value;
  const incidentJiraKey = incident.incident_jira_issue_key;

  // Update incident details
  incident.incident_status = "ALL CLEAR";
  incident.incident_close_notes = comment;
  incident.incident_closed_ts = allClearTS;

  try {
    addJiraComment(
      env,
      incident.incident_jira_issue_key,
      comment,
    );

    // Update Jira priority
    updateJiraPriorityToLow(env, incidentJiraKey);

    // Update original incident message to closed status
    const closedBlocks = getClosedIncidentBlocks(incident);
    client.chat.update({
      channel: incident.incident_channel,
      ts: incident.incident_channel_msg_ts,
      blocks: closedBlocks,
    });

    const swarmInitiated = incident.incident_swarming_channel_id &&
      incident.incident_swarming_msg_ts;

    const allClearMessageBlocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            `${incident.incident_id} has been declared *All Clear* by <@${body.interactivity.interactor.id}> with the following notes:\n\n>*${comment}*`,
        },
      },
    ];

    if (swarmInitiated) {
      // End the Zoom meeting
      client.calls.end({
        id: incident.incident_call_id,
      });

      // Remove the Zoom bookmark
      client.bookmarks.remove({
        channel_id: incident.incident_swarming_channel_id,
        bookmark_id: incident.zoom_call_bookmark_id,
      });

      // Set channel topic
      client.conversations.setTopic({
        channel: incident.incident_swarming_channel_id,
        topic: `ALL CLEAR ${incident.long_description?.substring(0, 250)}`,
      });

      // Update original incident swarm message
      client.chat.update({
        channel: incident.incident_swarming_channel_id,
        blocks: closedBlocks,
        ts: incident.incident_swarming_msg_ts,
      });

      // Send incident closed message with notes
      await client.chat.postMessage({
        channel: incident.incident_swarming_channel_id,
        blocks: allClearMessageBlocks,
      });

      // Create Confluence document
      const rcaURL = await createConfluenceDoc(env, incident);

      // TODO :: Existing implementation does not allow for subsequent updating of
      // Confluence document if issue is re-opened and re-closed. See note in
      // create_confuence_page.ts
      if (rcaURL !== "FAILED") {
        // Add RCA bookmark
        const rcaBookmark = await client.bookmarks.add({
          channel_id: incident.incident_swarming_channel_id,
          title: "RCA Template",
          type: "link",
          link: rcaURL,
          emoji: ":confluence:",
        });

        if (rcaBookmark) {
          incident.rca_doc_bookmark_id = rcaBookmark.bookmark.id;

          // Send RCA document message
          await client.chat.postMessage({
            channel: incident.incident_swarming_channel_id,
            blocks: [
              {
                type: "section",
                block_id: "doc_on_incident_close",
                text: {
                  type: "mrkdwn",
                  text:
                    `*As this was a major incident, generated RCA documents have been generated: <${rcaURL}|Start Working Here>*`,
                },
              },
            ],
          });
        }
      }
    } else {
      // Send message to main incident channel indicating that issue has been closed
      client.chat.postMessage({
        channel: incident.incident_channel,
        thread_ts: incident.incident_channel_msg_ts,
        blocks: allClearMessageBlocks,
      });
    }

    saveIncident(client, incident);
  } catch (err) {
    console.error(err);
  }
};
