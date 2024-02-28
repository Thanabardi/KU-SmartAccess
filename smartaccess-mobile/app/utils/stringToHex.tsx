global.Buffer = global.Buffer || require("buffer").Buffer;

export default function StringToHex(str: String) {
  const hex = Buffer.from(str, "utf8").toString("hex");
  return hex;
}
