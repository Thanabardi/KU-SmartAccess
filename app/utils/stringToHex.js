global.Buffer = global.Buffer || require("buffer").Buffer;

export function StringToHex(str) {
  const hex = Buffer.from(str, "utf8").toString("hex");
  return hex;
}
