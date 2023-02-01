import {
  BlockActionHandler,
} from "deno-slack-sdk/functions/interactivity/types.ts";
import { postIncidentFunctionDefinition } from "../../definition.ts";
import { getIncident, saveIncident } from "../../../../datastores/incidents.ts";
import { getOpenIncidentBlocks } from "../../view_blocks/open_incident.ts";

export const escalate: BlockActionHandler<
  typeof postIncidentFunctionDefinition.definition
> = async ({ inputs, body, client }) => {
  const { incident_id } = inputs;
  const { interactivity: { interactor } } = body;
  const incident = await getIncident(client, incident_id);

  const curSeverity = incident.severity;

  let newSeverity;
  switch (curSeverity) {
    case "Low": {
      newSeverity = "Medium";
      break;
    }
    case "Medium": {
      newSeverity = "High";
      break;
    }
    case "High": {
      newSeverity = "Critical";
      break;
    }
    case "Critical":
      {
        const errBlocks = [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text:
                "Cannot escalate an incident that already has a `Critical` severity rating",
            },
          },
        ];

        // If there is already a swarm channel created
        if (incident.incident_swarming_channel_id) {
          client.chat.postEphemeral({
            channel: incident.incident_swarming_channel_id,
            user: interactor.id,
            blocks: errBlocks,
          });
          // Otherwise send error message to the main channel
        } else {
          client.chat.postEphemeral({
            channel: incident.incident_channel,
            user: interactor.id,
            blocks: errBlocks,
          });
        }
      }
      return;
  }

  // Update incident record severity
  incident.severity = newSeverity;
  saveIncident(client, incident);

  const severityBlocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `Severity updated from \`${curSeverity}\` → \`${newSeverity}\``,
      },
    },
  ];

  const mainChannelIncidentBlocks = getOpenIncidentBlocks(
    incident,
    incident.incident_channel,
  );
  const swarmChannelIncidentBlocks = getOpenIncidentBlocks(
    incident,
    incident.incident_swarming_channel_id,
  );

  // If a swarm channel has been created
  if (incident.incident_swarming_channel_id) {
    // Post message with updated severity to swarm channel
    client.chat.postMessage({
      channel: incident.incident_swarming_channel_id,
      blocks: severityBlocks,
      unfurl_links: true,
    });

    // Update swarm channel incident message
    client.chat.update({
      channel: incident.incident_swarming_channel_id,
      ts: incident.incident_swarming_msg_ts,
      blocks: swarmChannelIncidentBlocks,
    });

    // Update main channel incident message
    client.chat.update({
      channel: incident.incident_channel,
      ts: incident.incident_channel_msg_ts,
      blocks: mainChannelIncidentBlocks,
    });
  } else {
    // Post updated severity message to main channel incident thread
    client.chat.postMessage({
      channel: incident.incident_channel,
      thread_ts: incident.incident_channel_msg_ts,
      blocks: severityBlocks,
    });

    // Update main channel incident message
    client.chat.update({
      channel: incident.incident_channel,
      ts: incident.incident_channel_msg_ts,
      blocks: mainChannelIncidentBlocks,
    });
  }
};
