import {
  BlockActionHandler,
} from "deno-slack-sdk/functions/interactivity/types.ts";
import { postIncidentFunctionDefinition } from "../../definition.ts";
import { getIncident, saveIncident } from "../../../../datastores/incidents.ts";
import { getClosedIncidentBlocks } from "../../view_blocks/closed_incident.ts";

export const closeAndArchive: BlockActionHandler<
  typeof postIncidentFunctionDefinition.definition
> = async ({ inputs, client }) => {
  const { incident_id } = inputs;
  const incident = await getIncident(client, incident_id);

  // Update record's incident status
  incident.incident_status = "CLOSED";
  saveIncident(client, incident);

  // TODO :: Are the swarm channel and this channel's blocks different?
  const incidentArchivedBlocks = getClosedIncidentBlocks(incident);

  // Update original incident message in main incident channel
  client.chat.update({
    channel: incident.incident_channel,
    blocks: incidentArchivedBlocks,
    ts: incident.incident_channel_msg_ts,
  });

  // If swarm channel has been created, update and archive the channel
  if (incident.incident_swarming_channel_id) {
    // Set topic of incident swarm channel
    client.conversations.setTopic({
      channel: incident.incident_swarming_channel_id,
      topic: `CLOSED ${incident.long_description?.substring(0, 250)}`,
    });

    // Update incident message in swarm channel
    client.chat.update({
      channel: incident.incident_swarming_channel_id,
      blocks: incidentArchivedBlocks,
      ts: incident.incident_swarming_msg_ts,
    });

    // Archive the swarm channel
    client.conversations.archive({
      channel: incident.incident_swarming_channel_id,
    });
  }
};
