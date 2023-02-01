import {
  ViewSubmissionHandler,
} from "deno-slack-sdk/functions/interactivity/types.ts";
import { getIncident, saveIncident } from "../../../../datastores/incidents.ts";
import { getOpenIncidentBlocks } from "../../view_blocks/open_incident.ts";

import { postIncidentFunctionDefinition } from "../../definition.ts";

export const addParticipantsSubmission: ViewSubmissionHandler<
  typeof postIncidentFunctionDefinition.definition
> = async (
  { view, client },
) => {
  const { private_metadata = "" } = view;

  const incidentID = JSON.parse(private_metadata).incident_id;
  const incident = await getIncident(client, incidentID);

  // Get current participants
  const participantsArr = !incident.incident_participants
    ? []
    : JSON.parse(incident.incident_participants);

  // Get newly assigned participants
  const incidentParticipants =
    view.state.values.add_participants_block.add_participants_action
      .selected_users;
  for (let i = 0; i < incidentParticipants.length; i++) {
    participantsArr.push(incidentParticipants[i]);
  }

  // Add the participants to the existing array
  let participants = "";
  for (let i = 0; i < participantsArr.length; i++) {
    participants += `<@${participantsArr[i]}> `;
  }

  // Save the new pariticpant list
  incident.incident_participants = JSON.stringify(participantsArr);

  saveIncident(client, incident);

  // TODO :: Refactor (inherited)
  let participantList = "";

  for (let i = 0; i < incidentParticipants.length; i++) {
    participantList += `<@${incidentParticipants[i]}> `;
  }

  const participantBlocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `:busts_in_silhouette: ${participantList}${
          incidentParticipants.length > 1 ? "have" : "has"
        } been added as participants to this incident!`,
      },
    },
  ];

  // Generate updated swarm channel incident message blocks
  const swarmChannelIncidentBlocks = getOpenIncidentBlocks(
    incident,
    incident.incident_swarming_channel_id,
  );

  // Generate updated main channel incident message blocks
  const mainChannelIncidentBlocks = getOpenIncidentBlocks(
    incident,
    incident.incident_channel,
  );

  // If there's an existing swarm channel
  if (incident.incident_swarming_channel_id) {
    // Invite all participants to the swarm channel
    for (let i = 0; i < participantsArr.length; i++) {
      client.conversations.invite({
        channel: incident.incident_swarming_channel_id,
        users: participantsArr[i],
      });
    }

    // Update the channel's incident message with new participants
    client.chat.update({
      channel: incident.incident_swarming_channel_id,
      ts: incident.incident_swarming_msg_ts,
      blocks: swarmChannelIncidentBlocks,
    });

    // Update main incident channel's incident message with new participants
    client.chat.update({
      channel: incident.incident_channel,
      ts: incident.incident_channel_msg_ts,
      blocks: mainChannelIncidentBlocks,
    });

    // Post participant message to main incident channel
    client.chat.postMessage({
      channel: incident.incident_swarming_channel_id,
      blocks: participantBlocks,
    });
  } else {
    // Update main incident channel message blocks
    await client.chat.update({
      channel: incident.incident_channel,
      ts: incident.incident_channel_msg_ts,
      blocks: mainChannelIncidentBlocks,
    });

    // Post participant update to main incident channel's thread
    client.chat.postMessage({
      channel: incident.incident_channel,
      thread_ts: incident.incident_channel_msg_ts,
      blocks: participantBlocks,
    });
  }
};
