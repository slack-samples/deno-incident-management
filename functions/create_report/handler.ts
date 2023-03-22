import { SlackFunction } from "deno-slack-sdk/mod.ts";
import { postReportFunctionDefinition } from "./definition.ts";
import { getIncidents } from "../../datastores/incidents.ts";

export default SlackFunction(
  postReportFunctionDefinition,
  async (
    { inputs, env, client },
  ) => {
    const incidentChannel = env["INCIDENT_CHANNEL"];
    const report = await getIncidents(client);

    // TODO :: Refactor / clean up (inherited)
    // The formatting of output could use a once-over
    report.numberOfIncidents = report.items.length;
    report.numberOfSwarmingIncidents = 0;
    report.numberOfOpenIncidents = 0;
    report.numberOfClosedIncidents = 0;
    report.incidentDris = {};
    report.incidentStatusCount = {};
    report.incidentSeverity = {};

    for (let i = 0; i < report.items.length; i++) {
      const element = report.items[i];

      if (element.incident_swarming_msg_ts) {
        report.numberOfSwarmingIncidents++;
      }

      if (element.incident_status === "OPEN") {
        report.numberOfOpenIncidents++;
      } else {
        report.numberOfClosedIncidents++;
      }

      if (element.incident_dri) {
        report.incidentDris[element.incident_dri] = "";
      }

      if (element.incident_status) {
        if (report.incidentStatusCount[element.incident_status]) {
          report.incidentStatusCount[element.incident_status]++;
        } else {
          report.incidentStatusCount[element.incident_status] = 1;
        }
      }

      if (element.severity) {
        if (report.incidentSeverity[element.severity]) {
          report.incidentSeverity[element.severity]++;
        } else {
          report.incidentSeverity[element.severity] = 1;
        }
      }
    }

    const blocks = newIncidentReport(report);

    client.chat.postEphemeral({
      channel: incidentChannel,
      blocks,
      user: inputs.currentUser,
    });

    return {
      outputs: false,
    };
  },
);

// TODO :: Pull this out into a dedicated block_views/ file (inherited)
// deno-lint-ignore no-explicit-any
function newIncidentReport(incidentReport: any) {
  let reportText = "";

  let incidentDRIs = "";
  for (const key in incidentReport.incidentDris) {
    if (
      Object.prototype.hasOwnProperty.call(incidentReport.incidentDris, key)
    ) {
      incidentDRIs += `<@${key}>`;
    }
  }

  let incidentSeveritiesPercentage = "";
  for (const key in incidentReport.incidentSeverity) {
    if (
      Object.prototype.hasOwnProperty.call(incidentReport.incidentSeverity, key)
    ) {
      incidentSeveritiesPercentage += `${key}: ${
        Math.round(
          (incidentReport.incidentSeverity[key] /
            incidentReport.numberOfIncidents) * 100,
        )
      }% \n`;
    }
  }

  reportText = reportText.concat(`:icon: *Incident Report* :icon: \n`)
    .concat(`Total Incidents: ${incidentReport.numberOfIncidents} \n`)
    .concat(`Swarming Incidents: ${incidentReport.numberOfSwarmingIncidents}\n`)
    .concat(`Open Incidents: ${incidentReport.numberOfOpenIncidents} \n`)
    .concat(`Closed Incidents: ${incidentReport.numberOfClosedIncidents}\n`)
    .concat(`Incident DRIs: ${incidentDRIs}\n\n`)
    .concat(
      `Percentage of OPEN Incidents: ${
        Math.round(
          (incidentReport.incidentStatusCount.OPEN /
            incidentReport.numberOfIncidents) * 100,
        )
      }%\n\n`,
    )
    .concat(
      `Percentage of Incidents by Severity: \n${incidentSeveritiesPercentage}`,
    );

  // deno-lint-ignore no-explicit-any
  const blocks: any = [
    {
      type: "section",
      block_id: "incident_report",
      text: {
        type: "mrkdwn",
        text: reportText,
      },
    },
  ];
  return blocks;
}
