// https://marketplace.zoom.us/docs/api-reference/zoom-api/methods/#operation/meetingCreate
// deno-lint-ignore no-explicit-any
export async function createZoomMeeting(env: any) {
  const bt = "Bearer " + env["ZOOM_JWT_TOKEN"];
  const zoomResponse = await fetch(
    "https://api.zoom.us/v2/users/me/meetings",
    {
      method: "POST",
      headers: {
        "Authorization": bt,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "topic": "Slack Zoom Meeting",
        "type": 8,
        "start_time": "2022-05-26T14:30:00Z",
        "duration": 60,
        "password": "123abc",
        "recurrence": {
          "type": "1",
          "repeat_interval": "1",
          "weekly_days": "4",
          "monthly_day": 30,
          "monthly_week": "4",
          "monthly_week_day": "4",
          "end_times": 1,
          "end_date_time": "2022-06-04T16:20:00Z",
        },
        "settings": {
          "host_video": true,
          "participant_video": true,
          "cn_meeting": false,
          "in_meeting": false,
          "join_before_host": true,
          "mute_upon_entry": false,
          "watermark": false,
          "use_pmi": false,
          "approval_type": 0,
          "registration_type": 1,
          "audio": "both",
          "auto_recording": "none",
          "alternative_hosts": "",
          "close_registration": true,
          "waiting_room": false,
          "contact_name": "Umesh",
          "contact_email": "abc@gmail.com",
          "registrants_email_notification": true,
          "meeting_authentication": true,
          "authentication_option": "",
          "authentication_domains": "",
        },
      }),
    },
  );
  const zoomRespJson = await zoomResponse.json();
  return zoomRespJson;
}
