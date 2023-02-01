import {
  ViewSubmissionHandler,
} from "deno-slack-sdk/functions/interactivity/types.ts";
import { postIncidentFunctionDefinition } from "../../definition.ts";
import { getIncident, saveIncident } from "../../../../datastores/incidents.ts";
import { getOpenIncidentBlocks } from "../../view_blocks/open_incident.ts";
import { updateJiraIssue } from "../../utils/update_jira_issue.ts";
import { generateChannelName } from "../../utils/generate_channel_name.ts";

export const editIncidentSubmission: ViewSubmissionHandler<
  typeof postIncidentFunctionDefinition.definition
> = async (
  { view, client, env },
) => {
  const { private_metadata = "", state: { values } } = view;

  const incidentID = await JSON.parse(private_metadata).incident_id;
  const incident = await getIncident(client, incidentID);
  const newSummary = values.summary_block.edit_summary_action.value || "";
  const newLongDesc = values.long_desc_block.edit_long_desc_action.value || "";

  // Update incident with the newly provided values
  incident.long_description = newLongDesc;
  incident.short_description = newSummary;

  // Update Jira ticket
  updateJiraIssue(env, incident, newSummary, newLongDesc);

  // Update incident record in datastore
  saveIncident(client, incident);

  // Get updated blocks for main incident channel message
  const mainChannelIncidentBlocks = getOpenIncidentBlocks(
    incident,
    incident.incident_channel,
  );

  // Get updated blocks for incident swarm channel message
  const swarmChannelIncidentBlocks = getOpenIncidentBlocks(
    incident,
    incident.incident_swarming_channel_id,
  );

  const editIncidentMsgBlocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          `:writing_hand: <@${incident.incident_trigger}> made edits to the incident:\n\n    *New summary:* ${newSummary}\n\n    *New description:*  ${newLongDesc}`,
      },
    },
  ];

  if (incident.incident_swarming_channel_id) {
    // Post edit update message to swarm channel
    client.chat.postMessage({
      channel: incident.incident_swarming_channel_id,
      blocks: editIncidentMsgBlocks,
    });

    // Update existing swarm channel message
    client.chat.update({
      channel: incident.incident_swarming_channel_id,
      ts: incident.incident_swarming_msg_ts,
      blocks: swarmChannelIncidentBlocks,
    });

    // Update incident message in main incident channel
    client.chat.update({
      channel: incident.incident_channel,
      ts: incident.incident_channel_msg_ts,
      blocks: mainChannelIncidentBlocks,
    });

    // Generate new channel name based on description
    const channelName = `${incident.incident_id}-${
      incident.long_description.substring(0, 25)
    }`;
    const santizedChannelName = generateChannelName(channelName);

    // Update channel name using new description
    client.conversations.rename({
      channel: incident.incident_swarming_channel_id,
      name: santizedChannelName,
    });

    // Update the channel topic
    client.conversations.setTopic({
      channel: incident.incident_swarming_channel_id,
      topic: `Major Incident Channel: ${
        incident.long_description.substring(0, 250)
      }`,
    });
  } else {
    // Reply to main channel's incident thread with edit details
    client.chat.postMessage({
      channel: incident.incident_channel,
      thread_ts: incident.incident_channel_msg_ts,
      blocks: editIncidentMsgBlocks,
    });

    // Update the main channel's incident message
    client.chat.update({
      channel: incident.incident_channel,
      ts: incident.incident_channel_msg_ts,
      blocks: mainChannelIncidentBlocks,
    });
  }
};
