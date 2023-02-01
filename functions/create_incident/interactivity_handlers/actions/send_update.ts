import {
  BlockActionHandler,
} from "deno-slack-sdk/functions/interactivity/types.ts";
import { postIncidentFunctionDefinition } from "../../definition.ts";

export const sendUpdate: BlockActionHandler<
  typeof postIncidentFunctionDefinition.definition
> = ({ body, client, action }) => {
  const incident = action.value;

  // Open send update modal
  client.views.open({
    trigger_id: body.interactivity.interactivity_pointer,
    view: {
      type: "modal",
      callback_id: "send_update_modal",
      private_metadata: incident,
      title: {
        type: "plain_text",
        text: "Send an update",
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
          block_id: "send_update_block",
          element: {
            type: "plain_text_input",
            action_id: "send_update_action",
            multiline: true,
          },
          label: {
            type: "plain_text",
            text: "Incident update details",
            emoji: true,
          },
        },
      ],
    },
  });
};
