import {
  BlockActionHandler,
} from "deno-slack-sdk/functions/interactivity/types.ts";
import { postIncidentFunctionDefinition } from "../../definition.ts";
import { getIncident, saveIncident } from "../../../../datastores/incidents.ts";
import { getOpenIncidentBlocks } from "../../view_blocks/open_incident.ts";

export const reOpen: BlockActionHandler<
  typeof postIncidentFunctionDefinition.definition
> = async ({ inputs, client, env }) => {
  const { incident_id, incident_trigger, long_description } = inputs;
  const incident = await getIncident(client, incident_id);

  incident.incident_status = "OPEN";
  incident.incident_closed_ts = "";

  const reOpenMessageBlocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `<@${incident_trigger}> has reopened the incident.`,
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

  if (incident.incident_swarming_channel_id) {
    // Post re-open notification
    client.chat.postMessage({
      channel: incident.incident_swarming_channel_id,
      blocks: reOpenMessageBlocks,
    });

    // Update original incident message in swarm channel
    client.chat.update({
      channel: incident.incident_swarming_channel_id,
      ts: incident.incident_swarming_msg_ts,
      blocks: swarmChannelIncidentBlocks,
    });

    // Update original message in general incident channel
    client.chat.update({
      channel: incident.incident_channel,
      ts: incident.incident_channel_msg_ts,
      blocks: mainChannelIncidentBlocks,
    });

    // Set topic of swarm channel
    client.conversations.setTopic({
      channel: incident.incident_swarming_channel_id,
      topic: `Major Incident Channel: ${long_description?.substring(0, 250)}`,
    });

    // Start and post Zoom meeting
    const meetingResp = await createZoomMeeting(env["ZOOM_JWT_TOKEN"]);
    const callBlockId = await client.calls.add({
      join_url: meetingResp.join_url,
      external_unique_id: Date.now(),
    });

    // Update incident with new Zoom meeting ID
    incident.incident_call_id = callBlockId.call.id;

    client.chat.postMessage({
      channel: incident.incident_swarming_channel_id,
      blocks: [
        {
          type: "call",
          call_id: callBlockId.call.id,
        },
      ],
    });

    // Add Zoom meeting link to bookmarks
    const zoomBookmark = await client.bookmarks.add({
      channel_id: incident.incident_swarming_channel_id,
      title: "Incident Call",
      type: "link",
      link: meetingResp.join_url,
      emoji: ":zoom:",
    });

    incident.zoom_call_bookmark_id = zoomBookmark.bookmark.id;

    // Remove the RCA bookmark, else it will keep adding multiple RCA docs
    client.bookmarks.remove({
      channel_id: incident.incident_swarming_channel_id,
      bookmark_id: incident.rca_doc_bookmark_id,
    });
  } else {
    client.chat.postMessage({
      channel: incident.incident_channel,
      blocks: reOpenMessageBlocks,
      thread_ts: incident.incident_channel_msg_ts,
    });

    await client.chat.update({
      channel: incident.incident_channel,
      ts: incident.incident_channel_msg_ts,
      blocks: mainChannelIncidentBlocks,
    });
  }

  saveIncident(client, incident);
};

async function createZoomMeeting(zoomToken: string) {
  const bt = "Bearer " + zoomToken;
  const zoomResponse = await fetch(
    "https://api.zoom.us/v2/users/me/meetings",
    {
      method: "POST",
      headers: {
        "Authorization": bt,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "topic": "Slack Zoom Meeting",
        "type": 8,
        "start_time": "2022-05-26T14:30:00Z",
        "duration": 60,
        "password": "123abc",
        "recurrence": {
          "type": "1",
          "repeat_interval": "1",
          "weekly_days": "4",
          "monthly_day": 30,
          "monthly_week": "4",
          "monthly_week_day": "4",
          "end_times": 1,
          "end_date_time": "2022-06-04T16:20:00Z",
        },
        "settings": {
          "host_video": true,
          "participant_video": true,
          "cn_meeting": false,
          "in_meeting": false,
          "join_before_host": true,
          "mute_upon_entry": false,
          "watermark": false,
          "use_pmi": false,
          "approval_type": 0,
          "registration_type": 1,
          "audio": "both",
          "auto_recording": "none",
          "alternative_hosts": "",
          "close_registration": true,
          "waiting_room": false,
          "contact_name": "Umesh",
          "contact_email": "abc@gmail.com",
          "registrants_email_notification": true,
          "meeting_authentication": true,
          "authentication_option": "",
          "authentication_domains": "",
        },
      }),
    },
  );
  const zoomRespJson = await zoomResponse.json();
  return zoomRespJson;
}
