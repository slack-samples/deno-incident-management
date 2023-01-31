import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { postIncidentFunctionDefinition } from "../functions/create_incident/definition.ts";

/**
 * This workflow creates an incident from a link trigger
 *
 * A workflow is a set of steps that are executed in order
 * Each step in a Workflow is a function.
 * https://api.slack.com/future/workflows
 *
 * This workflow uses interactivity. Learn more at:
 * https://api.slack.com/future/forms#add-interactivity
 */
const createIncidentWorkflow = DefineWorkflow({
  callback_id: "create_incident_workflow",
  title: "Create an incident",
  description: "Create an incident",
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
      interactivity_context: {
        type: Schema.slack.types.interactivity,
        description: "Interactivity context",
      },
    },
    required: [
      "currentUser",
      "currentChannel",
      "currentTime",
      "interactivity_context",
    ],
  },
});

const postIncidentStep1 = createIncidentWorkflow
  .addStep(
    Schema.slack.functions.OpenForm,
    {
      title: "Create an Incident",
      submit_label: "Submit",
      interactivity: createIncidentWorkflow.inputs.interactivity_context,
      fields: {
        elements: [
          {
            name: "short_description",
            title: "Summary (limit 50 characters)",
            type: Schema.types.string,
          },
          {
            name: "severity",
            title: "Severity",
            type: Schema.types.string,
            enum: ["Low", "Medium", "High", "Critical"],
            choices: [{
              title: "Low",
              value: "Low",
            }, {
              title: "Medium",
              value: "Medium",
            }, {
              title: "High",
              value: "High",
            }, {
              title: "Critical",
              value: "Critical",
            }],
          },
          {
            name: "long_description",
            title: "Description",
            type: Schema.types.string,
          },
          {
            name: "incident_dri",
            title: "Directly Responsible Individual",
            type: Schema.slack.types.user_id,
          },
        ],
        required: ["short_description", "long_description", "severity"],
      },
    },
  );

createIncidentWorkflow
  .addStep(postIncidentFunctionDefinition, {
    incident_id: "INC-" + createIncidentWorkflow.inputs.currentTime,
    short_description: postIncidentStep1.outputs.fields.short_description,
    severity: postIncidentStep1.outputs.fields.severity,
    long_description: postIncidentStep1.outputs.fields.long_description,
    incident_dri: postIncidentStep1.outputs.fields.incident_dri,
    incident_start_time: createIncidentWorkflow.inputs.currentTime,
    incident_trigger: createIncidentWorkflow.inputs.currentUser,
    incident_channel: createIncidentWorkflow.inputs.currentChannel,
  });

export default createIncidentWorkflow;
