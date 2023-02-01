export const generateChannelName = (
  channelName: any,
) => {
  let channelStr = channelName.toString();
  channelStr = channelStr.toLowerCase();
  const noSpecialChars = channelStr.replace(/[^a-zA-Z0-9-.!'? ]/g, "");

  channelStr = noSpecialChars.split("");

  for (let i = 0; i < channelStr.length; i++) {
    if (channelStr[i] === " ") {
      (channelStr[i] as any) = "-";
    }
    if (channelStr[i] === ".") {
      (channelStr[i] as any) = "";
    }
    if (channelStr[i] === "!") {
      (channelStr[i] as any) = "";
    }
    if (channelStr[i] === "?") {
      (channelStr[i] as any) = "";
    }
    if (channelStr[i] === "'") {
      (channelStr[i] as any) = "";
    }
  }
  channelStr = channelStr.join("");
  //max chars for a channel name is 80
  channelStr = channelStr.substring(0, 80);
  return channelStr;
};
