import { Font } from "@react-pdf/renderer";
import NotoSansEthiopic from "/fonts/NotoSansEthiopic-Regular.ttf";
// Register the font
Font.register({
  family: "Noto Sans Ethiopic",
  fonts: [
    {
      src: NotoSansEthiopic,
    },
  ],
});
