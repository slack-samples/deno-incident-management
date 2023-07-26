# Incident Management

This sample automation uses workflows to simplify the process of incident
management, featuring the integration of external tools like Jira and Zoom.

**Guide Outline**:

- [Included Workflows](#included-workflows)
- [Setup](#setup)
  - [Install the Slack CLI](#install-the-slack-cli)
  - [Clone the Sample](#clone-the-sample)
  - [Atlassian & Zoom Access Tokens](#atlassian-and-zoom-access-tokens)
- [Creating Triggers](#creating-triggers)
- [Datastores](#datastores)
- [Testing](#testing)
- [Deploying Your App](#deploying-your-app)
- [Viewing Activity Logs](#viewing-activity-logs)
- [Project Structure](#project-structure)
- [Resources](#resources)

---

## Included Workflows

- **Create incident**: Submit an incident by providing details, determining a
  severity, and optionally assiging a DRI
- **Create incident report**: Generate a report that gives statistics of all
  incidents within a designated incident channel

## Setup

Before getting started, first make sure you have a development workspace where
you have permission to install apps. **Please note that the features in this
project require that the workspace be part of
[a Slack paid plan](https://slack.com/pricing).**

### Install the Slack CLI

To use this sample, you need to install and configure the Slack CLI.
Step-by-step instructions can be found in our
[Quickstart Guide](https://api.slack.com/automation/quickstart).

### Clone the Sample

Start by cloning this repository:

```zsh
# Clone this project onto your machine
$ slack create my-app -t slack-samples/deno-incident-management

# Change into the project directory
$ cd my-app
```

### Atlassian and Zoom Access Tokens

To run this application, **access tokens are required in order to make calls to
the Atlassian and Zoom APIs**.

`ZOOM_JWT_TOKEN` can be attained from the
[Zoom Developer Site](https://developers.zoom.us/) and many of the Atlassian
environment variables can be acquired by signing up for a free
[Cloud Developer Bundle](https://www.atlassian.com/try/cloud/signup?product=confluence.ondemand,jira-software.ondemand,jira-servicedesk.ondemand,jira-core.ondemand&developer=true)
with Atlassian.

> Your personal access token allows your application to perform the API calls
> used by functions as though it was _from your Atlassian and Zoom accounts_.
> That means all calls made from the Create Incident workflow will be made using
> the accounts associated with the personal access tokens in use!

#### Add access tokens to environment variables

Storing your access token as an environment variable allows you to use different
tokens across local and deployed versions of the same app.

- `INCIDENT_CHANNEL` is the channel ID of the designated, public incident
  channel. This is where the app will post updates about a given incident.

- `ZOOM_JWT_TOKEN` is used to make calls to the Zoom API.

- `ATLASSIAN_INSTANCE` is your Atlassian instance name.

- `ATLASSIAN_USERNAME` is the email from your Jira Cloud Developer account. This
  is used to create and update Jira issues.

- `ATLASSIAN_API_KEY` is used to make calls to the Atlassian API.

- `ATLASSIAN_SPACE` is used to create an RCA Confluence page.

- `JIRA_PROJECT` is the Jira project `Key` used to add and edit issues.

##### Development Environment Variables

When [developing locally](https://api.slack.com/automation/run), environment
variables found in the `.env` file at the root of your project are used. For
local development, rename `.env.sample` to `.env` and add your access token to
the file contents (replacing `ACCESS_TOKEN` with your token):

```bash
# .env
ZOOM_JWT_TOKEN=ACCESS_TOKEN
```

##### Production Environment Variables

[Deployed apps](https://api.slack.com/automation/deploy) use environment
variables that are added using `slack env`. To add your access token to a
Workspace where your deployed app is installed, use the following command (once
again, replacing `ACCESS_TOKEN` with your token):

```zsh
$ slack env add ZOOM_JWT_TOKEN ACCESS_TOKEN
```

### Configure Outgoing Domains

Hosted custom functions must declare which
[outgoing domains](https://api.slack.com/automation/manifest) are used when
making network requests, including Atlassian and Zoom calls. `api.zoom.com` is
already configured as an outgoing domain in this sample's manifest, but you'll
also need to provide your Atlassian subdomain
(`<your-subdomain>.atlassian.net`).

## Creating Triggers

[Triggers](https://api.slack.com/automation/triggers) are what cause workflows
to run. These triggers can be invoked by a user, or automatically as a response
to an event within Slack.

When you `run` or `deploy` your project for the first time, the CLI will prompt
you to create a trigger if one is found in the `triggers/` directory. For any
subsequent triggers added to the application, each must be
[manually added using the `trigger create` command](#manual-trigger-creation).

When creating triggers, you must select the workspace and environment that you'd
like to create the trigger in. Each workspace can have a local development
version (denoted by `(local)`), as well as a deployed version. _Triggers created
in a local environment will only be available to use when running the
application locally._

### Link Triggers

A [link trigger](https://api.slack.com/automation/triggers/link) is a type of
trigger that generates a **Shortcut URL** which, when posted in a channel or
added as a bookmark, becomes a link. When clicked, the link trigger will run the
associated workflow.

Link triggers are _unique to each installed version of your app_. This means
that Shortcut URLs will be different across each workspace, as well as between
[locally run](#running-your-project-locally) and
[deployed apps](#deploying-your-app).

With link triggers, after selecting a workspace and environment, the output
provided will include a Shortcut URL. Copy and paste this URL into a channel as
a message, or add it as a bookmark in a channel of the workspace you selected.
Interacting with this link will run the associated workflow.

**Note: triggers won't run the workflow unless the app is either running locally
or deployed!**

### Manual Trigger Creation

To manually create a trigger, use the following command:

```zsh
$ slack trigger create --trigger-def triggers/create_incident.ts
```

## Datastores

For storing data related to your app, datastores offer secure storage on Slack
infrastructure. For an example of a datastore, see `datastores/incidents.ts`.
The use of a datastore requires the `datastore:write`/`datastore:read` scopes to
be present in your manifest.

## Testing

Test filenames should be suffixed with `_test`.

Run all tests with `deno test`:

```zsh
$ deno test
```

## Deploying Your App

Once development is complete, deploy the app to Slack infrastructure using
`slack deploy`:

```zsh
$ slack deploy
```

When deploying for the first time, you'll be prompted to
[create a new link trigger](#creating-triggers) for the deployed version of your
app. When that trigger is invoked, the workflow should run just as it did when
developing locally (but without requiring your server to be running).

## Viewing Activity Logs

Activity logs of your application can be viewed live and as they occur with the
following command:

```zsh
$ slack activity --tail
```

## Project Structure

### `.slack/`

Contains `apps.dev.json` and `apps.json`, which include installation details for
development and deployed apps.

### `datastores/`

[Datastores](https://api.slack.com/automation/datastores) securely store data
for your application on Slack infrastructure. Required scopes to use datastores
include `datastore:write` and `datastore:read`.

### `functions/`

[Functions](https://api.slack.com/automation/functions) are reusable building
blocks of automation that accept inputs, perform calculations, and provide
outputs. Functions can be used independently or as steps in workflows.

### `triggers/`

[Triggers](https://api.slack.com/automation/triggers) determine when workflows
are run. A trigger file describes the scenario in which a workflow should be
run, such as a user pressing a button or when a specific event occurs.

### `workflows/`

A [workflow](https://api.slack.com/automation/workflows) is a set of steps
(functions) that are executed in order.

Workflows can be configured to run without user input or they can collect input
by beginning with a [form](https://api.slack.com/automation/forms) before
continuing to the next step.

### `manifest.ts`

The [app manifest](https://api.slack.com/automation/manifest) contains the app's
configuration. This file defines attributes like app name and description.

### `slack.json`

Used by the CLI to interact with the project's SDK dependencies. It contains
script hooks that are executed by the CLI and implemented by the SDK.

## Resources

To learn more about developing automations on Slack, visit the following:

- [Automation Overview](https://api.slack.com/automation)
- [CLI Quick Reference](https://api.slack.com/automation/cli/quick-reference)
- [Samples and Templates](https://api.slack.com/automation/samples)
