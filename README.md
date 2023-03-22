# Incident Management App

This sample uses workflows to automate and simplify the process of incident
management within Slack, featuring the use of external tools like Jira and Zoom.

**Guide Outline**:

- [Supported Workflows](#supported-workflows)
- [Setup](#setup)
  - [Install the Slack CLI](#install-the-slack-cli)
  - [Clone the Sample App](#clone-the-sample-app)
  - [Atlassian & Zoom Access Tokens](#atlassian-and-zoom-access-tokens)
- [Create a Link Trigger](#create-a-link-trigger)
- [Running Your Project Locally](#running-your-project-locally)
- [Datastores](#datastores)
- [Deploying Your App](#deploying-your-app)
  - [Viewing Activity Logs](#viewing-activity-logs)
- [Project Structure](#project-structure)
- [Resources](#resources)

---

## Supported Workflows

- **Create incident**: Submit an incident by providing details, determining a
  severity, and optionally assiging a DRI.
- **Create incident report**: Generate a report that gives statistics of all
  incidents within a designated incident channel.

## Setup

Before getting started, make sure you have a development workspace where you
have permissions to install apps. If you don’t have one set up, go ahead and
[create one](https://slack.com/create). Also, please note that the workspace
requires any of [the Slack paid plans](https://slack.com/pricing).

### Install the Slack CLI

To use this sample, you first need to install and configure the Slack CLI.
Step-by-step instructions can be found in our
[Quickstart Guide](https://api.slack.com/future/quickstart).

### Clone the Sample App

Start by cloning this repository:

```zsh
# Clone this project onto your machine
$ slack create my-app -t slack-samples/deno-incident-management

# Change into this project directory
$ cd my-app
```

### Atlassian and Zoom Access Tokens

To run this application, access tokens are required in order to make calls to
the Atlassian and Zoom APIs.

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

##### Development environment variables

When [developing locally](https://api.slack.com/future/run), environment
variables found in the `.env` file at the root of your project are used. For
local development, rename `.env.sample` to `.env` and add your access token to
the file contents (replacing `ACCESS_TOKEN` with your token):

```bash
# .env
ZOOM_JWT_TOKEN=ACCESS_TOKEN
```

##### Production environment variables

[Deployed apps](https://api.slack.com/future/deploy) use environment variables
that are added using `slack env`. To add your access token to a Workspace where
your deployed app is installed, use the following command (once again, replacing
`ACCESS_TOKEN` with your token):

```zsh
$ slack env add ZOOM_JWT_TOKEN ACCESS_TOKEN
```

### Configure Outgoing Domains

Hosted custom functions must declare which
[outgoing domains](https://api.slack.com/future/manifest) are used when making
network requests, including Atlassian and Zoom calls. `api.zoom.com` is already
configured as an outgoing domain in this sample's manifest, but you'll also need
to provide your Atlassian subdomain (`<your-subdomain>.atlassian.net`).

## Create a Link Trigger

[Triggers](https://api.slack.com/future/triggers) are what cause workflows to
run. These triggers can be invoked by a user, or automatically as a response to
an event within Slack.

A [link trigger](https://api.slack.com/future/triggers/link) is a type of
trigger that generates a **Shortcut URL** which, when posted in a channel or
added as a bookmark, becomes a link. When clicked, the link trigger will run the
associated workflow.

Link triggers are _unique to each installed version of your app_. This means
that Shortcut URLs will be different across each workspace, as well as between
[locally run](#running-your-project-locally) and
[deployed apps](#deploying-your-app). When creating a trigger, you must select
the Workspace that you'd like to create the trigger in. Each Workspace has a
development version (denoted by `(dev)`), as well as a deployed version.

To create a link trigger for the workflow that enables end-users to configure
the channels with active event triggers, run the following command:

```zsh
$ slack trigger create --trigger-def triggers/create_incident.ts
```

After selecting a Workspace, the output provided will include the link trigger
Shortcut URL. Copy and paste this URL into a channel as a message, or add it as
a bookmark in a channel of the Workspace you selected.

**Note: this link won't run the workflow until the app is either running locally
or deployed!** Read on to learn how to run your app locally and eventually
deploy it to Slack hosting.

## Running Your Project Locally

While building your app, you can see your changes propagated to your workspace
in real-time with `slack run`. In both the CLI and in Slack, you'll know an app
is the development version if the name has the string `(dev)` appended.

```zsh
# Run app locally
$ slack run

Connected, awaiting events
```

Once running, click the
[previously created Shortcut URL](#create-a-link-trigger) associated with the
`(dev)` version of your app to run the associated workflow.

To stop running locally, press `<CTRL> + C` to end the process.

## Deploying Your App

Once you're done with development, you can deploy the production version of your
app to Slack hosting using `slack deploy`:

```zsh
$ slack deploy
```

After deploying, [create a new link trigger](#create-a-link-trigger) for the
production version of your app (not appended with `(dev)`). Once the trigger is
invoked, the workflow should run just as it did in when developing locally.

```
$ slack trigger create --trigger-def triggers/create_incident.ts
```

## Datastores

When your app needs to store any data, datastores are the right place for that.
For an example of a datastore, see `datastores/incident.ts`. Using a datastore
also requires the `datastore:write`/`datastore:read` scopes to be present in
your manifest.

### Viewing Activity Logs

Activity logs for the production instance of your application can be viewed with
the `slack activity` command:

```zsh
$ slack activity
```

## Project Structure

### `manifest.ts`

The [app manifest](https://api.slack.com/future/manifest) contains the app's
configuration. This file defines attributes like app name and description.

### `slack.json`

Used by the CLI to interact with the project's SDK dependencies. It contains
script hooks that are executed by the CLI and implemented by the SDK.

### `/functions`

[Functions](https://api.slack.com/future/functions) are reusable building blocks
of automation that accept inputs, perform calculations, and provide outputs.
Functions can be used independently or as steps in workflows.

### `/workflows`

A [workflow](https://api.slack.com/future/workflows) is a set of steps that are
executed in order. Each step in a workflow is a function.

Workflows can be configured to run without user input or they can collect input
by beginning with a [form](https://api.slack.com/future/forms) before continuing
to the next step.

### `/triggers`

[Triggers](https://api.slack.com/future/triggers) determine when workflows are
executed. A trigger file describes a scenario in which a workflow should be run,
such as a user pressing a button or when a specific event occurs.

### `/datastores`

[Datastores](https://api.slack.com/future/datastores) can securely store and
retrieve data for your application. Required scopes to use datastores include
`datastore:write` and `datastore:read`.

## Resources

To learn more about developing with the CLI, you can visit the following guides:

- [Creating a new app with the CLI](https://api.slack.com/future/create)
- [Configuring your app](https://api.slack.com/future/manifest)
- [Developing locally](https://api.slack.com/future/run)

To view all documentation and guides available, visit the
[Overview page](https://api.slack.com/future/overview).
