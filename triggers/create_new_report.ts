import { Trigger } from "deno-slack-sdk/types.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";
import createIncidentReportWorkflow from "../workflows/create_incident_report.ts";

/**
 * This is a definition file for a shortcut link trigger
 * For more on triggers and other trigger types:
 * https://api.slack.com/automation/triggers
 */
const trigger: Trigger<
  typeof createIncidentReportWorkflow.definition
> = {
  type: TriggerTypes.Shortcut,
  name: "Create an incident report",
  description: "Create and send an incident report",
  workflow: "#/workflows/create_incident_report",
  inputs: {
    currentUser: {
      value: TriggerContextData.Shortcut.user_id,
    },
    currentChannel: {
      value: TriggerContextData.Shortcut.channel_id,
    },
    currentTime: {
      value: "{{event_timestamp}}",
    },
  },
};

export default trigger;
