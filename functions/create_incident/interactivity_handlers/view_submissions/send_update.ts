import {
  ViewSubmissionHandler,
} from "deno-slack-sdk/functions/interactivity/types.ts";
import { getIncident, saveIncident } from "../../../../datastores/incidents.ts";

import { postIncidentFunctionDefinition } from "../../definition.ts";
import { addJiraComment } from "../../utils/add_jira_comment.ts";

export const sendUpdateSubmission: ViewSubmissionHandler<
  typeof postIncidentFunctionDefinition.definition
> = async (
  { inputs, body, view, client, env },
) => {
  const { interactivity: { interactor } } = body;
  const { incident_id = "" } = inputs;

  const incident = await getIncident(client, incident_id);
  const update = view.state.values.send_update_block.send_update_action.value;
  const incidentJiraKey = incident.incident_jira_issue_key;

  // The update should be sent to the appropriate Jira ticket via a comment
  addJiraComment(
    env,
    incidentJiraKey,
    update,
  );

  // Update incident with most recent update
  incident.last_incident_update = update;
  incident.last_incident_update_ts = Date.now();
  saveIncident(client, incident);

  const updateBlocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `<@${interactor.id}> submitted an update:\n\n>${update}`,
      },
    },
  ];

  if (incident.incident_swarming_channel_id) {
    // Post update message to swarm channel
    client.chat.postMessage({
      channel: incident.incident_swarming_channel_id,
      blocks: updateBlocks,
    });
  } else {
    // Post update message to main incident channel
    client.chat.postMessage({
      channel: incident.incident_channel,
      thread_ts: incident.incident_channel_msg_ts,
      blocks: updateBlocks,
    });
  }
};
