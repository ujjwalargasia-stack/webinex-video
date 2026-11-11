import React from "react";
import { Composition } from "remotion";
import { WebinexPromo, TOTAL_FRAMES, FPS, WIDTH, HEIGHT } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="WebinexPromo"
        component={WebinexPromo}
        durationInFrames={TOTAL_FRAMES} // 900 frames = 30 seconds @ 30fps
        fps={FPS}
        width={WIDTH} // 1080
        height={HEIGHT} // 1920 (9:16 vertical)
      />
    </>
  );
};