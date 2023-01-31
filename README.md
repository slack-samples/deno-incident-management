# Incident-Management-Functions ⚠️

The incident management functions are a set of functions used to optimize the process of incident management within Slack. This project utilizes 
Jira, Zoom, Box, and other partners to save incident data. It utilizes the beta [Slack CLI](https://api.slack.com/future/tools/cli) to create functions.

## Demo Videos

### App 1 Minute Summary
https://user-images.githubusercontent.com/10428517/200922003-058f6678-f672-406f-8465-d0e283774cf8.mp4

### App Full Feature Demo (3 Minutes)
https://user-images.githubusercontent.com/10428517/201747087-8705f4fe-b7a2-42d4-9e87-da6e5a8d07ac.mp4

## Known Issues & Disclaimer
> 🚨 When running in dev mode (`slack run`) the app will get timeout errors and may retry adding incidents which didn't succeed because of the timeout. This may cause duplicate incidents and erratic behavior. We are working to fix this as soon as we can. This is not a problem if you run `slack deploy`. 🚨

This project is built using pre-released features on the Slack Platform. It may contain bugs, performance issues, and isn't representative of the final product. The code in this project isn't meant to be a standard template. It may change or become legacy as updates are released to the Slack Beta Platform.

# Steps 
1. [Clone the repo](#step-1-clone-the-repo)
2. [Configuration Via Environmental Variables](#step-2-configuration-via-environmental-variables)
3. [Deploy the App](#step-3-deploy-the-app)
4. [Add Environmental Variables to Slack Cloud](#step-4-add-environmental-variables-to-slack-cloud)
5. [Add Emojis](#step-5-add-emojis)
6. [Create the Triggers](#step-6-Create-the-triggers)
7. [Run the Workflows and Create an Incident](#step-7-run-the-workflows-and-create-an-incident)
8. [View Incident Details in Jira](#step-8-view-incident-details-in-jira)
9. [Create Swarming Channel](#step-9-create-swarming-channel)
10. [Close the Incident](#step-10-close-the-incident)
11. [Generate a Report](#step-11-generate-a-report)

## Step 1. Clone the Repo

```git clone https://github.com/Slack-Partner-Engineering/Incident-Management-Functions.git```

## Step 2. Configuration Via Environmental Variables

Next, you will have to configure your app by setting enviornmental variables. This will enable you to send incident data to your exteral accounts, such as 
Zendesk, Jira, and others.

Go ahead and open the `.sample.env` file. 
There you will find  the necessary environmental variables. A completed `.env` file should look like the following:

```
INCIDENT_CHANNEL=C0422*****
ZOOM_JWT_TOKEN=
ATLASSIAN_USERNAME=test@gmail.com
ATLASSIAN_API_KEY=
ATLASSIAN_SPACE=OPERATIONS
ATLASSIAN_PROJECT=INC
ATLASSIAN_INSTANCE=.atlassian.net
ACCESS_TOKEN=
CLERK_KEY=ab*********
CLERK_NOTIFICATION_METHOD=SMS
CLERK_NOTIFICATION_LEVEL=Critical
CLERK_NOTIFICATION_NUMBERS=+*********
INCIDENT_LEADERSHIP_GROUP_NAME=incident-leadership
CLERK_API=https://*******
SLACK_URL=https://de*****.slack.com/archives/
```

> If you want to run this in local mode, you will need to copy the `sample.env` file, rename it to `.env`, add your env variables, and then run `source .env` to set your variables. Next, run `slack run` to run the app in local mode.

### Notes on Getting API Keys

* `INCIDENT_CHANNEL` is where you will be interacting with the app. It is where the app will post updates about your incident. It needs to be a public Slack channel.

* `ZOOM_JWT_TOKEN` will need to be collected from the Zoom Developer Site. Login (or create an account if you do not have one). Go to the [zoom 
marketplace](https://marketplace.zoom.us/develop/create) to create a JWT token. <b>If you logged in with your company account and do not have the correct 
permissions to create a JWT token, create a basic Zoom account with your personal email.</b>

![ZoomToken](https://user-images.githubusercontent.com/10428517/195176403-1a2ee3c7-f423-4fb3-b177-a4bc2b49cb72.png)

* `ATLASSIAN_USERNAME` is the email from your Jira Cloud developer account. This is needed to create Jira Issues. First, you will need to create a free Atlassian 
account. Next, sign up for the free [Cloud Developer Bundle](https://www.atlassian.com/try/cloud/signup?product=confluence.ondemand,jira-software.ondemand,jira-servicedesk.ondemand,jira-core.ondemand&developer=true) with Atlassian. 

* `ATLASSIAN_API_KEY` can be managed from here: https://id.atlassian.com/manage-profile/security/api-tokens. Make sure to create one, and then save it in a safe place.

* `ATLASSIAN_PROJECT` This env variable is the project `Key` that you want to add issues to. It's usually a three letter upper case name, as shown in the screenshot below (My `JIRA_PROJECT` keys happen to be `INC` and `TEST`). To create a Jira Project, follow [these steps](https://support.atlassian.com/jira-software-cloud/docs/create-a-new-project/). After you've created a project, you can quickly find your projects, with their respective keys, here, under the `Key` field: 
`https://add-your-domain-here.atlassian.net/jira/projects`. Note that you will have to replace the `add-your-domain-here` portion of the URL with your own domain.
My URL happens to be: https://horeaporutiu.atlassian.net/jira/projects. 

![JiraKey](https://user-images.githubusercontent.com/10428517/195177542-1fd06cf0-2170-4a26-a96b-eeb08b59c1a6.png)

## Step 3. Deploy the App

In order to be able to add env variables to a deployed app, you will need to deploy it first!
Run `slack deploy` to do so. If all went well, you will see the following message:

```
hporutiu@hporuti-ltmkkef Incident-Management-Functions % slack deploy
? Choose a workspace devrelsandbox  Team ID: T038J6**** 
   App ID: A045X****  Status: Installed


📚 App Manifest
   Updated app manifest for "Incident Response" in "DevRel Sandbox" workspace

🏠 Workspace Install
   Installed "Incident Response" app to "DevRel Sandbox" workspace
   Updated app icon: assets/icon.png
   Finished in 4.2s

🎁 App packaged and ready to deploy
   0.019MB was packaged in 1.9s

🚀 Incident Response deployed in 6.1s
   Dashboard:  https://slack.com/apps/A045X8*****
   App Owner:  hporutiu (U039******)
   Workspace:  DevRel Sandbox (T038J6****)
```

## Step 4. Add Environmental Variables to Slack Cloud

To add the `INCIDENT_CHANNEL` variable to our deployed app, we would run `slack env add INCIDENT_CHANNEL C03V2ED7111` and then hit enter.
You should see the following output:

```
hporutiu@hporuti-ltmkkef Incident-Management-Functions % slack env add INCIDENT_CHANNEL C03V2ED7111
? Choose a workspace devrelsandbox  Team ID: T038J6***** 
   App ID: A045X8*****   Status: Installed

 APP  A045X8****
✨  successfully added INCIDENT_CHANNEL to app environment variables
```

> Use the `env-helper.ts` script to automate this process. This script will help deploy all of your 
env variables to production without you having to do this manually. To run the script use 

`deno run utils/scripts/env-helpers.ts` and type in `Y` when prompted in terminal to add the env variables.

Make sure to repeat that process for the rest of the variables.

🎉 Awesome! You are one step away from running your app! 🎉

## Step 5. Add Emojis

Upload the emojis from [assets](./assets/): 

1. :atlassian:
2. :boxcorp:
3. :clerk:
4. :zoom:
5. :confluence:

To do this, first go to the workspace where you plan to run this app. Next, go to the 
composer where you would write a Slack message, and click on the `Emoji` button. Next,
click on `Add Emoji`, and upload the emojis listed above.

## Step 6. Create the Triggers

https://user-images.githubusercontent.com/10428517/195186528-43d81752-145c-4fd9-8a7f-cbc77cd36778.mp4

After creating your app, you'll need to create a new trigger that will start the
workflow.

```bash
slack trigger create --trigger-def triggers/create-incident-button.json
```

The CLI will ask you to choose a workspace to install your trigger to. Also, it will ask you 
if you want to install it for your dev app, or your prod app. Choose wisely, as the dev version of 
the trigger will only work with `slack run`, and the prod version with `slack deploy`. Let's choose 
the production version for now! Once you've picked a
workspace, you should see output like this:

```
   App ID: A045MHR6SCT   Status: Installed
   Workspace: devrelsandbox      Team ID: T038J6TH5PF


⚡ Trigger created
   Trigger ID:   Ft045S9B0VHR
   Trigger Type: shortcut
   Trigger Name: Create an Incident
   URL: https://slack.com/shortcuts/Ft045W7LGYKG/6374de8cdf66f250deb6335c58b4d04d
```

> Note, there are a two other triggers that we will want to generate to get the full funcionality of this app. To do so, run the 
following commands:

```bash
slack trigger create --trigger-def triggers/create-new-report-button.json
```
This trigger will be the same as the one above, except that it will just automatically generate a report, as shown in 

🎉 Great job! Now, let's use that trigger to kick off a workflow! 🎉

## Step 7. Run the Workflows and Create an Incident

https://user-images.githubusercontent.com/10428517/195210585-88d78009-e1a7-44a3-8400-cb2c052f42da.mp4

Now, take the URL, and paste it into a channel. It should unfurl with a green button that 
says `Start`, as shown below. That button will kick off your workflow!

Now, click on the `Start` button. Fill out the form, and then hit `Submit` when you are done. You should see an incident created in your 
incident channel, as shown below.

🙌🏼 Great job! You've now created a incident via a link trigger! 🙌🏼

### Create an Incident via Webhook

https://user-images.githubusercontent.com/10428517/195428586-7ac3db97-3302-4814-bffa-bb97920f69fe.mp4

Now that we have learned how to create an incident manually, via a button click, let's learn how to create one via a webhook. First, we'll need 
to create a webhook trigger, by running the following command:

```
slack trigger create --trigger-def triggers/create-incident-webhook.json
```

Again, make sure to choose the production (non-dev) version. You should see an output like the following:

```
? Choose an app Incident Response
   App ID: A045X89BRCK   Status: Installed
   Workspace: devrelsandbox      Team ID: T038J6TH5PF


⚡ Trigger created
   Trigger ID:   Ft046MEBS6N5
   Trigger Type: webhook
   Trigger Name: Create Incident From External Source via Webhook
   Webhook URL:  https://hooks.slack.com/triggers/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
```

My Webhook URL is `https://hooks.slack.com/triggers/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` but yours will be slightly different.
Now, to test out that the trigger is working successfully, send the following cURL request (<b>make sure to use your own webhook URL!</b>).


```bash
 curl --location --request POST 'https://hooks.slack.com/triggers/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' \                    
--header 'Content-Type: application/json' \
--data-raw '{
"short_description": "Many reports that site is down! Multiple pages are returning 404 errors!",   
"severity": "High",              
"external_incident_id": "XX-2345"
}'
```

Now, you should see a new incident created in your incident channel, as shown in the video above.

🙌🏼 Great job! You now know how to create an incident via a webhook! 🙌🏼

## Step 8. View Incident Details in Jira

https://user-images.githubusercontent.com/10428517/195429541-18b10e8c-eabf-4111-81bb-1e2a83a8d44b.mp4

Go ahead and click on the incident replies to see the Jira issue that was created. You will need to have set up your account credentials via
the env variables to make sure this works as shown below.

## Step 9. Create Swarming Channel

https://user-images.githubusercontent.com/10428517/195429767-2e2ec683-2c86-43db-8950-51cf971cdb7c.mp4

Next, click on the `Create Channel` button to create a Swarming channel. This will automatically create a Zoom call and start it so that the participants can 
resolve the incident.

## Step 10. Close the Incident

https://user-images.githubusercontent.com/10428517/195429714-c608a98e-be05-4004-81d1-13314a140a15.mp4

Now that we've solved the incident, it's time to close it! Click on `Close Incident` and add your close notes as shown below.

Great job! You've now used the power of the Slack Platform to create, swarm, and close an incident all within Slack, while keeping all of your 
records of data updated!

## Step 11. Generate a Report

https://user-images.githubusercontent.com/10428517/195429846-ef8a4caa-b663-40e6-a75b-37c3b2259445.mp4

Lastly, let's generate a report. To do so, we will need to create a trigger by using the following command:

```
slack trigger create --trigger-def triggers/create-new-report-button.json
```

## Conclusion

Thanks for following, and we hope this was useful for you. Please send feedback in this [Google Form](https://docs.google.com/forms/d/e/1FAIpQLSdwUK6ohBLc1EV3LCNwyO5QUr3_YNSyHRPBH-n46U_TsM9PfA/viewform).

## Building the App

To test new changes before pushing, you can use the `build.sh` script to format,
lint, and test the code. Once all checks pass, feel free to add your pull
request.

<!-- ## Testing

You can write tests for your function, see `functions/reverse_test.ts` for a
sample. Test base filenames should be suffixed with `_test`. To run tests just
run:

```bash
slack deno test
``` -->

## Troubleshooting
- If the bookmarks are not added in a swarming channel. Make sure all the emojis are uploaded properly with the correct names. 
- If incidents are getting posted multiple times, try deploying and running in non-local dev mode. There can be dispatch timeouts and retries in local dev mode. 
- If you get any get or put DB errors, same as above, test with a deploy. This tends to be a timeout issue also. 
