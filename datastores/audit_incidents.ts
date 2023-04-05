import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";
import Incident from "../types/incident.ts";
import { SlackAPIClient } from "deno-slack-api/types.ts";

/**
 * Used to capture changes to the incidents
 *
 * Datastores are a Slack-hosted location to store
 * and retrieve data for your app.
 * https://api.slack.com/future/datastores
 */
export default DefineDatastore({
  name: "audit_incidents",
  primary_key: "incident_id_and_timestamp",
  attributes: {
    incident_id_and_timestamp: {
      type: Schema.types.string,
    },
    incident_object: {
      type: Schema.types.string,
    },
  },
});

export const saveAuditRecord = async (
  client: SlackAPIClient,
  incident: Incident,
) => {
  const incident_id_and_timestamp: string = incident.incident_id + "-" +
    Date.now(); //build in incident increment logic or something here

  const response = await client.apps.datastore.put(
    {
      datastore: "audit_incidents",
      item: {
        incident_id_and_timestamp: incident_id_and_timestamp,
        incident_object: JSON.stringify(incident),
      },
    },
  );

  if (!response.ok) {
    console.error(
      `Error calling apps.datastore.put in audit_incidents: ${response.error}`,
    );
    return {
      error: response.error,
    };
  } else {
    return response.item;
  }
};
