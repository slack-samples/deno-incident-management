import {
  BlockActionHandler,
} from "deno-slack-sdk/functions/interactivity/types.ts";
import { postIncidentFunctionDefinition } from "../../definition.ts";

export const assignDRI: BlockActionHandler<
  typeof postIncidentFunctionDefinition.definition
> = ({ body, client, action }) => {
  const incident = action.value;
  const { interactivity: { interactivity_pointer } } = body;

  client.views.open({
    trigger_id: interactivity_pointer,
    view: {
      type: "modal",
      callback_id: "assign_dri_modal",
      private_metadata: incident,
      title: {
        type: "plain_text",
        text: "Assign DRI",
        emoji: true,
      },
      submit: {
        type: "plain_text",
        text: "Submit",
        emoji: true,
      },
      close: {
        type: "plain_text",
        text: "Cancel",
        emoji: true,
      },
      blocks: [
        {
          type: "input",
          block_id: "assign_dri_block",
          element: {
            type: "multi_users_select",
            placeholder: {
              type: "plain_text",
              text: "Select DRI",
              emoji: true,
            },
            action_id: "users_select_action",
          },
          label: {
            type: "plain_text",
            text: "Select a user to be responsible for this incident",
            emoji: true,
          },
        },
      ],
    },
  });
};
