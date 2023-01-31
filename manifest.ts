import { Manifest } from "deno-slack-sdk/mod.ts";
import createIncidentWorkflow from "./workflows/create_incident.ts";
import incidentDatastore from "./datastores/incidents.ts";
import auditIncidentDatastore from "./datastores/audit_incidents.ts";
import createReportWorkflow from "./workflows/create_incident_report.ts";

export default Manifest({
  name: "Incident Management",
  description:
    "Help automate the responding, analyzing, and resolving of incidents",
  icon: "assets/icon.png",
  workflows: [
    createIncidentWorkflow,
    createReportWorkflow,
  ],
  outgoingDomains: [
    "misscoded.atlassian.net",
    "api.zoom.us",
  ],
  datastores: [incidentDatastore, auditIncidentDatastore],
  botScopes: [
    "commands",
    "chat:write",
    "chat:write.public",
    "datastore:read",
    "datastore:write",
    "channels:manage",
    "calls:write",
    "triggers:write",
    "bookmarks:write",
  ],
});
