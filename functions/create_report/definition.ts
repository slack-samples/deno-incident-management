import { DefineFunction, Schema } from "deno-slack-sdk/mod.ts";

/**
 * This is a custom function manifest definition that
 * posts an incident report to channel ephemerally.
 *
 * More on defining functions here:
 * https://api.slack.com/future/functions/custom
 */
export const postReportFunctionDefinition = DefineFunction({
  callback_id: "post_report",
  title: "Post incident report",
  description: "Posts an incident report to the incident channel ephemerally",
  source_file: "functions/create_report/handler.ts",
  input_parameters: {
    properties: {
      currentUser: {
        type: Schema.slack.types.user_id,
        description: "User who wants an incident report",
      },
      currentTime: {
        type: Schema.slack.types.timestamp,
      },
      currentChannel: {
        type: Schema.slack.types.channel_id,
      },
    },
    required: ["currentUser", "currentTime", "currentChannel"],
  },
  output_parameters: {
    properties: {},
    required: [],
  },
});
