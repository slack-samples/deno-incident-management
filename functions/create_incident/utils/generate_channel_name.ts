export const generateChannelName = (
  channelName: string,
) => {
  let channelStr = channelName.toString();
  channelStr = channelStr.toLowerCase();
  const noSpecialChars = channelStr.replace(/[^a-zA-Z0-9-.!'? ]/g, "");
  const channelStrArr = noSpecialChars.split("");

  for (let i = 0; i < channelStrArr.length; i++) {
    if (channelStrArr[i] === " ") {
      (channelStrArr[i]) = "-";
    }
    if (channelStrArr[i] === ".") {
      (channelStrArr[i]) = "";
    }
    if (channelStrArr[i] === "!") {
      (channelStrArr[i]) = "";
    }
    if (channelStrArr[i] === "?") {
      (channelStrArr[i]) = "";
    }
    if (channelStrArr[i] === "'") {
      (channelStrArr[i]) = "";
    }
  }
  channelStr = channelStrArr.join("");
  //max chars for a channel name is 80
  channelStr = channelStr.substring(0, 80);
  return channelStr;
};
