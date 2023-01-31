// Field details can be found in the datastores/*.ts files
export type Incident = {
  incident_id: string;
  severity: string;
  short_description: string;
  long_description?: string;
  incident_participants?: string;
  incident_dri?: string;
  incident_start_time: number;
  incident_trigger?: string;
  external_incident_id?: string | undefined;
  slack_reporter?: string | undefined;
  incident_channel?: string | undefined;
  incident_channel_url?: string | undefined;
  incident_channel_msg_ts?: string | undefined;
  incident_swarming_channel_id?: string | undefined;
  incident_swarming_channel_url?: string | undefined;
  incident_swarming_msg_ts?: string | undefined;
  incident_closed_ts?: string | undefined;
  incident_close_notes?: string | undefined;
  incident_jira_issue_key?: string | undefined;
  incident_status: string;
  incident_call_id: string;
  zoom_call_bookmark_id: string;
  last_incident_update: string;
  last_incident_update_ts: string;
  leadership_paged: boolean;
  rca_doc_bookmark_id: string;
};

export default Incident;
