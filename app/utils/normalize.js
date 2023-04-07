import { Dimensions, PixelRatio } from "react-native";

const windowHeight = Dimensions.get("screen").height;

export function normalize(size) {
  const newSize = (size * windowHeight) / 100;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}
