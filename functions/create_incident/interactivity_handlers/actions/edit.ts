import {
  BlockActionHandler,
} from "deno-slack-sdk/functions/interactivity/types.ts";
import { postIncidentFunctionDefinition } from "../../definition.ts";

export const edit: BlockActionHandler<
  typeof postIncidentFunctionDefinition.definition
> = ({ body, client, action }) => {
  const incident = action.value;

  client.views.open({
    trigger_id: body.interactivity.interactivity_pointer,
    view: {
      "type": "modal",
      "callback_id": "edit_incident_modal",
      "private_metadata": incident,
      "title": {
        "type": "plain_text",
        "text": "Edit Incident",
        "emoji": true,
      },
      "submit": {
        "type": "plain_text",
        "text": "Submit",
        "emoji": true,
      },
      "close": {
        "type": "plain_text",
        "text": "Cancel",
        "emoji": true,
      },
      "blocks": [
        {
          "type": "input",
          "block_id": "summary_block",
          "element": {
            "type": "plain_text_input",
            "action_id": "edit_summary_action",
          },
          "label": {
            "type": "plain_text",
            "text": "Summary (Limit 50 Characters)",
            "emoji": true,
          },
        },
        {
          "type": "input",
          "block_id": "long_desc_block",
          "element": {
            "type": "plain_text_input",
            "action_id": "edit_long_desc_action",
            "multiline": true,
          },
          "label": {
            "type": "plain_text",
            "text": "Long description",
            "emoji": true,
          },
        },
      ],
    },
  });
};
