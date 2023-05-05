import { Trigger } from "deno-slack-sdk/types.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";
import createIncidentWorkflow from "../workflows/create_incident.ts";

/**
 * This is a definition file for a shortcut link trigger
 * For more on triggers and other trigger types:
 * https://api.slack.com/automation/triggers
 */
const trigger: Trigger<
  typeof createIncidentWorkflow.definition
> = {
  type: TriggerTypes.Shortcut,
  name: "Create an incident",
  description:
    "Create and send an announcement to one or more channels in your workspace.",
  workflow: "#/workflows/create_incident_workflow",
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
    interactivity_context: {
      value: TriggerContextData.Shortcut.interactivity,
    },
  },
};

export default trigger;
