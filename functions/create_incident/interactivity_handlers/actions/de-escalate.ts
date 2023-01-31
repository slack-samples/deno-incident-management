import {
  BlockActionHandler,
} from "deno-slack-sdk/functions/interactivity/types.ts";
import { postIncidentFunctionDefinition } from "../../definition.ts";
import { getIncident, saveIncident } from "../../../../datastores/incidents.ts";
import { getOpenIncidentBlocks } from "../../view_blocks/open_incident.ts";

export const deEscalate: BlockActionHandler<
  typeof postIncidentFunctionDefinition.definition
> = async ({ inputs, body, client }) => {
  const { incident_id } = inputs;
  const { interactivity: { interactor } } = body;
  const curIncident = await getIncident(client, incident_id!); // TODO :: Remove !

  let newSeverity;

  switch (curIncident.severity) {
    case "Low": {
      const errBlocks = [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text:
              "Cannot de-escalate an incident that already has a `Low` severity rating",
          },
        },
      ];

      // Send error message to swarm channel
      if (curIncident.incident_swarming_channel_id) {
        client.chat.postEphemeral({
          channel: curIncident.incident_swarming_channel_id,
          user: interactor.id,
          blocks: errBlocks,
          unfurl_links: true,
        });
      } else {
        // Send error message main incident channel
        client.chat.postEphemeral({
          channel: curIncident.incident_channel,
          user: interactor.id,
          blocks: errBlocks,
          unfurl_links: true,
        });
      }
      return;
    }
    case "Medium": {
      newSeverity = "Low";
      break;
    }
    case "High": {
      newSeverity = "Medium";
      break;
    }
    case "Critical": {
      newSeverity = "High";
      break;
    }
  }

  const severityMessageBlocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          `Severity updated from \`${curIncident.severity}\` → \`${newSeverity}\``,
      },
    },
  ];

  // Update severity and save record to datastore
  curIncident.severity = newSeverity;
  await saveIncident(client, curIncident);

  // Generate updated blocks for main channel
  const mainChannelIncidentBlocks = getOpenIncidentBlocks(
    curIncident,
    curIncident.incident_channel,
  );

  // Generate updated blocks for swarm channel
  const swarmChannelIncidentBlocks = getOpenIncidentBlocks(
    curIncident,
    curIncident.incident_swarming_channel_id,
  );

  // If there is currently a swarm channel
  if (curIncident.incident_swarming_channel_id) {
    // Post message to swarm channel
    client.chat.postMessage({
      channel: curIncident.incident_swarming_channel_id,
      blocks: severityMessageBlocks,
      unfurl_links: true,
    });

    // Update swarm channel incident message
    client.chat.update({
      channel: curIncident.incident_swarming_channel_id,
      ts: curIncident.incident_swarming_msg_ts,
      blocks: swarmChannelIncidentBlocks,
    });

    // Update main channel incident message
    client.chat.update({
      channel: curIncident.incident_channel,
      ts: curIncident.incident_channel_msg_ts,
      blocks: mainChannelIncidentBlocks,
    });
  } else {
    // Post message to main channel's incident thread
    client.chat.postMessage({
      channel: curIncident.incident_channel,
      thread_ts: curIncident.incident_channel_msg_ts,
      blocks: severityMessageBlocks,
      unfurl_links: true,
    });

    // Update main incident channel message
    client.chat.update({
      channel: curIncident.incident_channel,
      ts: curIncident.incident_channel_msg_ts,
      blocks: mainChannelIncidentBlocks,
    });
  }
};
