import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";
import Incident from "../types/incident.ts";
import { saveAuditRecord } from "./audit_incidents.ts";
import { SlackAPIClient } from "deno-slack-api/types.ts";

/**
 * Datastores are a Slack-hosted location to store
 * and retrieve data for your app.
 * https://api.slack.com/future/datastores
 */
export default DefineDatastore({
  name: "incidents",
  primary_key: "incident_id",
  attributes: {
    incident_id: {
      type: Schema.types.string,
      description: "ID to track the incident, Ex: INC-123456789",
    },
    severity: {
      type: Schema.types.string,
      description:
        "Low, Medium, High, Critical. Critical is the highest priority incident",
    },
    short_description: {
      type: Schema.types.string,
      description: "Summary of incident",
    },
    long_description: {
      type: Schema.types.string,
      description: "Long description of incident",
    },
    incident_participants: {
      type: Schema.types.string,
      description: "Assigned participants in solving incident",
    },
    incident_dri: {
      type: Schema.types.string,
      description: "The main person who will be responsible for the incident",
    },
    incident_start_time: {
      type: Schema.types.string,
      description: "Incident start time",
    },
    incident_trigger: {
      type: Schema.types.string,
      description: "User that triggered the incident",
    },
    external_incident_id: {
      type: Schema.types.string,
      description: "External ID if started by an external service",
    },
    slack_reporter: {
      type: Schema.types.string,
      description: "User that created the incident",
    },
    incident_channel: {
      type: Schema.types.string,
      description: "Main incident channel to post updates to",
    },
    incident_channel_url: {
      type: Schema.types.string,
      description: "Main incident channel URL",
    },
    incident_channel_msg_ts: {
      type: Schema.types.string,
      description: "Timestamp of the original incident message",
    },
    incident_swarming_channel_id: {
      type: Schema.types.string,
      description: "Incident swarm channel",
    },
    incident_swarming_channel_url: {
      type: Schema.types.string,
      description: "Incident swarm channel URL",
    },
    incident_swarming_msg_ts: {
      type: Schema.types.string,
      description:
        "Timestamp of the original incident message in the swarm channel",
    },
    incident_closed_ts: {
      type: Schema.types.string,
      description: "Timestamp of when the incident was closed",
    },
    incident_close_notes: {
      type: Schema.types.string,
      description: "Resolution notes to be added into external systems",
    },
    incident_jira_issue_key: {
      type: Schema.types.string,
      description: "Key to Jira issue created for the incident",
    },
    incident_status: {
      type: Schema.types.string,
      description: "Incident status",
    },
    incident_call_id: {
      type: Schema.types.string,
      description: "ID of Zoom call (or other call) in the swarm channel",
    },
    zoom_call_bookmark_id: {
      type: Schema.types.string,
      description: "Zoom bookmark ID",
    },
    last_incident_update: {
      type: Schema.types.string,
      description: "Last update made to the incident",
    },
    last_incident_update_ts: {
      type: Schema.types.string,
      description: "Timestamp of when the incident was last updated",
    },
    leadership_paged: {
      type: Schema.types.boolean,
      description: "Leadership has been sent messages / updates from incident",
    },
    rca_doc_bookmark_id: {
      type: Schema.types.string,
      description: "Root Cause Analysis bookmark ID",
    },
  },
});

export const saveIncident = async (
  client: SlackAPIClient,
  incident: Incident,
) => {
  await saveAuditRecord(client, incident);

  const response = await client.apps.datastore.put(
    {
      datastore: "incidents",
      item: incident,
    },
  );

  if (!response.ok) {
    console.error(
      `Error calling apps.datastore.put for saveIncident in incidents: ${response.error}`,
    );
    return {
      error: response.error,
    };
  } else {
    return response.item;
  }
};

export const getIncident = async (
  client: SlackAPIClient,
  incident_id: string,
) => {
  try {
    const response = await client.apiCall("apps.datastore.get", {
      datastore: "Incidents",
      id: incident_id,
    });

    if (!response.ok) {
      console.error(
        `Error calling apps.datastore.get for getIncident in incidents: ${response.error}`,
      );
      return {
        error: response.error,
      };
    } else {
      return response.item;
    }
  } catch (err) {
    console.error(
      `Error occurred while retrieving incident (getIncident) : ${err}`,
    );
    return err;
  }
};

export const getIncidents = async (client: SlackAPIClient) => {
  try {
    const response = await client.apiCall("apps.datastore.query", {
      datastore: "Incidents",
      expression: "",
      limit: 1000,
    });

    if (!response.ok) {
      console.error(
        `Error occurred while retrieving incidents (getIncidents) : ${response.error}`,
      );
      return {
        error: response.error,
      };
    } else {
      return response;
    }
  } catch (err) {
    console.error(
      `Error occurred while retrieving incidents (getIncidents) : ${err}`,
    );
    return err;
  }
};
