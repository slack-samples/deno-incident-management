import {
  BlockActionHandler,
} from "deno-slack-sdk/functions/interactivity/types.ts";
import { postIncidentFunctionDefinition } from "../../definition.ts";

export const addParticipants: BlockActionHandler<
  typeof postIncidentFunctionDefinition.definition
> = ({ body, client, action }) => {
  const incident = action.value;
  const { interactivity: { interactivity_pointer } } = body;

  // Open Add Participants modal to assign participants
  client.views.open({
    trigger_id: interactivity_pointer,
    view: {
      type: "modal",
      callback_id: "add_participants_modal",
      private_metadata: incident,
      title: {
        type: "plain_text",
        text: "Add Participants",
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
          block_id: "add_participants_block",
          element: {
            type: "multi_users_select",
            placeholder: {
              type: "plain_text",
              text: "Add Participants",
              emoji: true,
            },
            action_id: "add_participants_action",
          },
          label: {
            type: "plain_text",
            text: "Select users to work on this incident",
            emoji: true,
          },
        },
      ],
    },
  });
};
