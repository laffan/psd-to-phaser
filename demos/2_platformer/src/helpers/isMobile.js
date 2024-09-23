import UAParser from "ua-parser-js";

function isMobile() {
  // Initialize UAParser
  const parser = new UAParser();
  const result = parser.getResult();
  console.log(result)
   return result.device.type === "mobile";
}

export default isMobile;
