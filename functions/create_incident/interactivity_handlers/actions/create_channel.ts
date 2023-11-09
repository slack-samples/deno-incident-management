import {
  BlockActionHandler,
} from "deno-slack-sdk/functions/interactivity/types.ts";
import { getIncident, saveIncident } from "../../../../datastores/incidents.ts";
import { getOpenIncidentBlocks } from "../../view_blocks/open_incident.ts";
import { postIncidentFunctionDefinition } from "../../definition.ts";
import { createZoomMeeting } from "../../utils/create_zoom_meeting.ts";
import { generateChannelName } from "../../utils/generate_channel_name.ts";
import { buildError } from "../../../utils.ts";

export const createChannel: BlockActionHandler<
  typeof postIncidentFunctionDefinition.definition
> = async ({ inputs, client, env }) => {
  const {
    incident_id,
    long_description = "",
  } = inputs;
  const incident = await getIncident(client, incident_id);
  const channelName = `${incident_id}-${long_description.substring(0, 25)}`;
  const santizedChannelName = generateChannelName(channelName);

  // Create incident channel
  const createResp = await client.conversations.create({
    name: santizedChannelName,
    is_private: false,
  });
  if (!createResp.ok) {
    return buildError("client.conversations.create", createResp);
  }

  // Post message to original incident thread to notify others of swarm
  const initMsgResp = await client.chat.postMessage({
    channel: incident.incident_channel,
    blocks: [{
      type: "section",
      text: {
        type: "mrkdwn",
        text: `:warning: Incident channel #${santizedChannelName} created!`,
      },
    }],
    unfurl_links: false,
    thread_ts: incident.incident_channel_msg_ts,
  });
  if (!initMsgResp.ok) {
    return buildError("client.chat.postMessage", initMsgResp);
  }

  // Update incident with swarm channel ID
  incident.incident_swarming_channel_id = createResp.channel.id;

  // Get message blocks for swarm channel
  const swarmChannelIncidentBlocks = getOpenIncidentBlocks(
    incident,
    incident.incident_swarming_channel_id,
  );

  // Get updated message blocks for main channel
  const mainIncidentChannelBlocks = getOpenIncidentBlocks(
    incident,
    incident.incident_channel,
  );

  // Identify users to be invited to swarm channel
  const participants = incident.incident_participants
    ? JSON.parse(incident.incident_participants)
    : [];

  let swarmUsers = `${incident.incident_trigger}`;
  swarmUsers += incident.incident_dri ? `,${incident.incident_dri}` : "";
  swarmUsers += participants.length ? `,${participants.join(",")}` : "";

  // Post message to new swarm channel with incident details
  const detailMsgResp = await client.chat.postMessage({
    channel: incident.incident_swarming_channel_id,
    blocks: swarmChannelIncidentBlocks,
  });
  if (!detailMsgResp.ok) {
    return buildError("client.chat.postMessage", detailMsgResp);
  }

  // Update incident with original swarm message timestamp
  incident.incident_swarming_msg_ts = detailMsgResp.ts;

  // Add bookmark for runbook
  const runbookBookmarkResp = await client.bookmarks.add({
    channel_id: createResp.channel.id,
    title: "Incident Runbook",
    type: "link",
    link: "https://foo.box.com/fakeAccount",
    emoji: ":boxcorp:",
  });
  if (!runbookBookmarkResp.ok) {
    return buildError("client.bookmarks.add", runbookBookmarkResp);
  }

  // TODO :: reintroduce Box
  // Retrieve and post runbook
  // const boxRunbook = await getBoxRunbook();
  // await postMessage(
  //   token,
  //   createChannelResp.channel.id,
  //   boxRunbook,
  // );

  // Create message blocks for Jira ticket
  const issueKey = incident.key || incident.incident_jira_issue_key;
  const instance = env["ATLASSIAN_INSTANCE"];
  const issueLink = `https://${instance}/browse/${issueKey}`;
  const jiraIssueMessageBlocks = [
    {
      type: "section",
      block_id: "jira_issue_block",
      text: {
        type: "mrkdwn",
        text: " :atlassian: Jira Issue: " + "<" + `${issueLink}` + "|" +
          issueKey +
          ">" +
          " created.",
      },
    },
  ];

  // Post Jira ticket information
  const issueMsgResp = await client.chat.postMessage({
    channel: createResp.channel.id,
    blocks: jiraIssueMessageBlocks,
  });
  if (!issueMsgResp.ok) {
    return buildError("client.chat.postMessage", issueMsgResp);
  }

  // Create bookmark for Jira ticket
  const jiraIssueBookmark = await client.bookmarks.add({
    channel_id: createResp.channel.id,
    title: "Jira Ticket",
    type: "link",
    link: `https://${
      env["ATLASSIAN_INSTANCE"]
    }/browse/${incident.incident_jira_issue_key}`,
    emoji: ":atlassian:",
  });
  if (!jiraIssueBookmark.ok) {
    return buildError("client.bookmarks.add", jiraIssueBookmark);
  }

  // Create Zoom meeting
  const meetingResp = await createZoomMeeting(env);
  const callResp = await client.calls.add({
    join_url: meetingResp.join_url,
    external_unique_id: Date.now(),
  });
  if (!callResp.ok) return buildError("client.calls.add", callResp);

  // Post Zoom meeting information
  const zoomMsgResp = await client.chat.postMessage({
    channel: createResp.channel.id,
    blocks: [
      {
        type: "call",
        call_id: callResp.call.id,
      },
    ],
  });
  if (!zoomMsgResp.ok) {
    return buildError("client.chat.postMessage", zoomMsgResp);
  }

  // Create bookmark for Zoom meeting
  const zoomBookmarkResp = await client.bookmarks.add({
    channel_id: createResp.channel.id,
    title: "Incident Call",
    type: "link",
    link: meetingResp.join_url,
    emoji: ":zoom:",
  });
  if (!zoomBookmarkResp.ok) {
    return buildError("client.bookmarks.add", zoomBookmarkResp);
  }

  // Update incident with Zoom meeting information
  incident.incident_call_id = callResp.call.id;
  incident.zoom_call_bookmark_id = zoomBookmarkResp.bookmark.id;

  saveIncident(client, incident);

  // Set topic of swarm channel
  const setTopicResp = await client.conversations.setTopic({
    channel: createResp.channel.id,
    topic: `Major Incident Channel: ${long_description?.substring(0, 250)}`,
  });
  if (!setTopicResp.ok) {
    return buildError("client.conversations.setTopic", setTopicResp);
  }

  // Update message in main channel (ie, remove 'Create Channel' button)
  const updateResp = await client.chat.update({
    channel: incident.incident_channel,
    ts: incident.incident_channel_msg_ts,
    blocks: mainIncidentChannelBlocks,
  });
  if (!updateResp.ok) return buildError("client.chat.update", updateResp);

  // Invite incident creator, DRI, and participants to channel
  const inviteResp = await client.conversations.invite({
    channel: incident.incident_swarming_channel_id,
    users: swarmUsers,
  });
  if (!inviteResp.ok) {
    return buildError("client.conversations.invite", inviteResp);
  }
};
