import {
  ViewSubmissionHandler,
} from "deno-slack-sdk/functions/interactivity/types.ts";

import { getIncident, saveIncident } from "../../../../datastores/incidents.ts";
import { getOpenIncidentBlocks } from "../../view_blocks/open_incident.ts";
import { postIncidentFunctionDefinition } from "../../definition.ts";

export const assignDRISubmission: ViewSubmissionHandler<
  typeof postIncidentFunctionDefinition.definition
> = async (
  { view, client },
) => {
  const { private_metadata = "" } = view;

  const incidentID = JSON.parse(private_metadata).incident_id;
  const incident = await getIncident(client, incidentID);
  const dri =
    view.state.values.assign_dri_block.users_select_action.selected_users[0];

  // Update record DRI
  incident.incident_dri = dri;
  saveIncident(client, incident);

  const driBlocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          `:information_source: *<@${dri}> has been assigned as the DRI for incident ${incidentID}*`,
      },
    },
  ];

  // Generate updated swarm channel incident message blocks
  const swarmChannelIncidentBlocks = getOpenIncidentBlocks(
    incident,
    incident.incident_swarming_channel_id,
  );

  // Generate updated main channel incident message blocks
  const mainIncidentChannelBlocks = getOpenIncidentBlocks(
    incident,
    incident.incident_channel,
  );

  // If a swarm channel has been created
  if (incident.incident_swarming_channel_id) {
    // Update the swarm channel incident message
    client.chat.update({
      channel: incident.incident_swarming_channel_id,
      ts: incident.incident_swarming_msg_ts,
      blocks: swarmChannelIncidentBlocks,
    });

    // Update the main channel incident message
    client.chat.update({
      channel: incident.incident_channel,
      ts: incident.incident_channel_msg_ts,
      blocks: mainIncidentChannelBlocks,
    });

    // Post DRI assingment message to swarm channel
    client.chat.postMessage({
      channel: incident.incident_swarming_channel_id,
      blocks: driBlocks,
    });
  } else {
    // Update the original incident message with new DRI assignment
    client.chat.update({
      channel: incident.incident_channel,
      ts: incident.incident_channel_msg_ts,
      blocks: mainIncidentChannelBlocks,
    });

    // Post DRI assignment message to incident thread
    client.chat.postMessage({
      channel: incident.incident_channel,
      thread_ts: incident.incident_channel_msg_ts,
      blocks: driBlocks,
    });
  }
};
