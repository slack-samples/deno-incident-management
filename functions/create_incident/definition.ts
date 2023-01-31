import { DefineFunction, Schema } from "deno-slack-sdk/mod.ts";
/**
 * This is a custom function manifest definition that
 * takes posts a new incident to the incident channel.
 *
 * More on defining functions here:
 * https://api.slack.com/future/functions/custom
 */
export const postIncidentFunctionDefinition = DefineFunction({
  callback_id: "create_incident",
  title: "Post new incident",
  description: "Post a new incident to the incident channel",
  source_file: "functions/create_incident/handler.ts",
  input_parameters: {
    properties: {
      incident_id: {
        type: Schema.types.string,
        description: "Slack Incident Id",
      },
      short_description: {
        type: Schema.types.string,
        description: "Short Description",
      },
      long_description: {
        type: Schema.types.string,
        description: "Long Description",
      },
      severity: {
        type: Schema.types.string,
        description: "Severity",
      },
      incident_dri: {
        type: Schema.types.string,
        description: "Incident DRI",
      },
      incident_start_time: {
        type: Schema.types.string,
        description: "Start Time",
      },
      incident_trigger: {
        type: Schema.types.string,
        description: "Incident Trigger",
      },
      incident_channel: {
        type: Schema.slack.types.channel_id,
      },
    },
    required: [
      "incident_id",
      "short_description",
      "severity",
      "incident_trigger",
    ],
  },
  output_parameters: {
    properties: {},
    required: [],
  },
});
