import Incident from "../../../types/incident.ts";

/**
 * getClosedIncidentBlocks returns the view blocks for a closed incident message
 */
export const getClosedIncidentBlocks = (incident: Incident) => {
  const {
    external_incident_id,
    incident_trigger,
    incident_dri,
    incident_id,
    short_description,
    long_description,
    incident_status,
    incident_start_time,
    incident_closed_ts,
    severity,
  } = incident;

  // Check whether incident was triggered by user or webhook
  const incidentCreator = external_incident_id
    ? incident_trigger
    : `<@${incident_trigger}>`;

  // Identify assigned DRI
  const incidentDRI = incident_dri ? `<@${incident_dri}>` : "Not assigned";

  // deno-lint-ignore no-explicit-any
  const startTime = new Date(<any> incident_start_time * 1000);
  // deno-lint-ignore no-explicit-any
  const endTime = new Date(<any> incident_closed_ts * 1000);

  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          `⚠️ *${incident_id}*: *${short_description}* has been created by ${incidentCreator} \n\n*Description*: ${long_description}\n`,
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
          text: " ⏰ Start Time: " + `*${startTime}*`,
          type: "mrkdwn",
        },
        {
          text: " 🕓 End Time: " + `*${endTime}*`,
          type: "mrkdwn",
        },
      ],
    },
    {
      type: "actions",
      block_id: "incident_management_block",
      elements: [
        {
          type: "button",
          action_id: "re_open",
          text: {
            type: "plain_text",
            text: "Reopen",
            emoji: true,
          },
          value: String(incident),
        },
        {
          type: "button",
          action_id: "close_and_archive",
          text: {
            type: "plain_text",
            text: "Close and Archive",
            emoji: true,
          },
          value: String(incident),
        },
      ],
    },
  ];

  // If incident has been closed and archived, remove all button options
  if (incident.incident_status === "CLOSED") {
    blocks.pop();
  }

  return blocks;
};
