import { GameClasses } from "./AppInterfaces";

export const getDecodeUrlData = (): any => {
  // Remove trailing slash, split by / , grab last segment.
  const lastSegment = window.location.pathname
    .replace(/\/$/, "")
    .split("/")
    .pop();
  const urlParam: URLSearchParams = new URLSearchParams(window.location.search);
  let jobId = 0;
  let tier = 0;
  let shareKey = "";

  if (lastSegment) {
    jobId = Number(lastSegment);

    const jobClasses = GameClasses.getById(jobId);
    jobId = jobClasses ? jobId : 0;

    const hasShareKey = urlParam.has("share");
    shareKey = urlParam.get("share")!;
    if (jobClasses && hasShareKey && shareKey) {
      switch (shareKey[0]) {
        case "a":
          tier = 20000;
          break;
        case "b":
          tier = 30000;
          break;
        case "c":
          tier = 40000;
          break;
        case "d":
          tier = 45003;
          break;
        default:
      }

      shareKey = shareKey
        .substr(1)
        .replace(/ /g, "+")
        .replace(/%2B/g, "+");
    }
  }
  return { jobId: jobId, tier: tier, shareKey: shareKey };
};

export const updateUrlShareKey = (jobId: number, shareKey: string) => {
  const currentPath = window.location.origin;
  const url = `${currentPath}/runes/${jobId}?share=${shareKey}`;
  return url;
  //window.history.replaceState("", "", url);
};
