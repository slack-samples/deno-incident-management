import Incident from "../../../types/incident.ts";

/**
 * getOpenIncidentBlocks returns the view blocks for an open incident message
 */
export const getOpenIncidentBlocks = (
  incident: Incident,
  channelId: string,
) => {
  const {
    incident_dri,
    incident_id,
    short_description,
    incident_trigger,
    long_description,
    incident_status,
    severity,
    incident_start_time,
    incident_participants,
    external_incident_id,
    incident_swarming_channel_id,
  } = incident;

  const incidentStr = JSON.stringify(incident);

  // Check whether incident was triggered by user or webhook
  const incidentCreator = external_incident_id
    ? incident_trigger
    : `<@${incident_trigger}>`;

  // Identify assigned DRI
  const incidentDRI = incident_dri ? `<@${incident_dri}>` : "Not assigned";

  // Identify participants
  let participants = "";
  let participantsArr;
  if (incident_participants) {
    participantsArr = JSON.parse(incident_participants);
    for (let i = 0; i < participantsArr.length; i++) {
      participants += `<@${participantsArr[i]}> `;
    }
  }

  // Standard, all-case incident text
  let messageText =
    `:warning: *${incident_id}: ${short_description}* has been created by ${incidentCreator} \n\n *Description*: ${long_description}\n`;

  // If blocks are for main incident channel and swarm is happening, include swarm channel information
  if (
    incident_swarming_channel_id && channelId !== incident_swarming_channel_id
  ) {
    messageText +=
      `\n\n :rotating_light: INCIDENT IS BEING RESOLVED IN <#${incident_swarming_channel_id}>`;
  }

  const formattedStartTime = new Date(incident_start_time * 1000);

  // Open incident message + associated button actions
  // deno-lint-ignore no-explicit-any
  const blocks: any = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: messageText,
      },
    },
    // Incident quick facts
    {
      type: "context",
      elements: [
        {
          text: "Status: " + `*${incident_status}* `,
          type: "mrkdwn",
        },
        {
          text: " ⬆️ Severity: " + `*${severity}*`,
          type: "mrkdwn",
        },
        {
          text: " 🙋🏽‍♀️ DRI: " + `*${incidentDRI}*`,
          type: "mrkdwn",
        },
        {
          text: " 🙋🏽 Participants: " +
            `${participants ? participants : "Not assigned"}`,
          type: "mrkdwn",
        },
        {
          text: " ⏰ Start Time: " + `*${formattedStartTime}*`,
          type: "mrkdwn",
        },
      ],
    },
    // Incident buttons/actions to take
    {
      type: "actions",
      block_id: "incident_management_block",
      elements: [
        {
          type: "button",
          action_id: "send_update",
          text: {
            type: "plain_text",
            text: "Send Update",
            emoji: true,
          },
          value: incidentStr,
        },
        {
          type: "button",
          action_id: "all_clear",
          text: {
            type: "plain_text",
            text: "All Clear",
            emoji: true,
          },
          value: incidentStr,
        },
        {
          type: "button",
          action_id: "escalate",
          text: {
            type: "plain_text",
            text: "Escalate",
            emoji: true,
          },
          value: incidentStr,
        },
        {
          type: "button",
          action_id: "de_escalate",
          text: {
            type: "plain_text",
            text: "De-escalate",
            emoji: true,
          },
          value: incidentStr,
        },
        {
          type: "button",
          action_id: "assign_dri",
          text: {
            type: "plain_text",
            text: "Assign DRI",
            emoji: true,
          },
          value: incidentStr,
        },
        {
          type: "button",
          action_id: "add_participants",
          text: {
            type: "plain_text",
            text: "Add Participants",
            emoji: true,
          },
          value: incidentStr,
        },
        {
          type: "button",
          action_id: "edit",
          text: {
            type: "plain_text",
            text: "Edit",
            emoji: true,
          },
          value: incidentStr,
        },
      ],
    },
  ];

  // If blocks are for main incident channel and swarm channel exists, remove button actions
  if (
    channelId !== incident_swarming_channel_id && incident_swarming_channel_id
  ) {
    blocks.pop();
  }

  // If no swarm channel has been created, include 'Create channel' button
  if (!incident_swarming_channel_id) {
    const createButtonElem = {
      type: "button",
      action_id: "create_channel",
      text: {
        type: "plain_text",
        text: "Create Channel",
        emoji: true,
      },
      value: incidentStr,
    };

    // Insert 'Create channel' option as 2nd action/button
    blocks[2].elements.splice(1, 0, createButtonElem);
  }

  return blocks;
};
