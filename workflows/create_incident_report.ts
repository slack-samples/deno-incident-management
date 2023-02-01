import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { postReportFunctionDefinition } from "../functions/create_report/definition.ts";

/**
 * A workflow is a set of steps that are executed in order
 * Each step in a Workflow is a function.
 * https://api.slack.com/future/workflows
 */
const createReportWorkflow = DefineWorkflow({
  callback_id: "create_incident_report",
  title: "Create incident report",
  description: "Create an incident Report",
  input_parameters: {
    properties: {
      currentUser: {
        type: Schema.slack.types.user_id,
      },
      currentChannel: {
        type: Schema.slack.types.channel_id,
      },
      currentTime: {
        type: Schema.slack.types.timestamp,
      },
    },
    required: [
      "currentUser",
      "currentChannel",
      "currentTime",
    ],
  },
});

createReportWorkflow.addStep(postReportFunctionDefinition, {
  currentUser: createReportWorkflow.inputs.currentUser,
  currentChannel: createReportWorkflow.inputs.currentChannel,
  currentTime: createReportWorkflow.inputs.currentTime,
});

export default createReportWorkflow;
