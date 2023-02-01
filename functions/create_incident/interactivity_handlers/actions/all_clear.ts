import {
  BlockActionHandler,
} from "deno-slack-sdk/functions/interactivity/types.ts";

import { postIncidentFunctionDefinition } from "../../definition.ts";

export const allClear: BlockActionHandler<
  typeof postIncidentFunctionDefinition.definition
> = ({ body, client, action }) => {
  const incident = action.value;

  // Open All Clear modal to close issue and submit notes
  client.views.open({
    trigger_id: body.interactivity.interactivity_pointer,
    view: {
      type: "modal",
      callback_id: "all_clear_modal",
      private_metadata: incident,
      title: {
        type: "plain_text",
        text: "Call all clear",
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
          block_id: "add_comment_block",
          element: {
            type: "plain_text_input",
            action_id: "close_incident_action",
            multiline: true,
          },
          label: {
            type: "plain_text",
            text: "Add all clear notes",
            emoji: true,
          },
        },
      ],
    },
  });
};
