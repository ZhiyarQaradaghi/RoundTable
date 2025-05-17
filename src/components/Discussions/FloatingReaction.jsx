import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import {
  ThumbUp,
  Favorite,
  EmojiEmotions,
  Celebration,
  SentimentVeryDissatisfied,
  Lightbulb,
} from "@mui/icons-material";

const REACTION_ICONS = {
  thumbsup: ThumbUp,
  heart: Favorite,
  smile: EmojiEmotions,
  celebrate: Celebration,
  sad: SentimentVeryDissatisfied,
  idea: Lightbulb,
};

const REACTION_COLORS = {
  thumbsup: "#4CAF50",
  heart: "#E91E63",
  smile: "#FFC107",
  celebrate: "#9C27B0",
  sad: "#FF5722",
  idea: "#2196F3",
};

export default function FloatingReaction({ type, position }) {
  const Icon = REACTION_ICONS[type];

  return (
    <Box
      sx={{
        position: "fixed",
        left: `${position.x}%`,
        top: `${position.y}%`,
        color: REACTION_COLORS[type],
        transform: "scale(0)",
        animation: "floatAndFade 2s ease-out forwards",
        "@keyframes floatAndFade": {
          "0%": {
            transform: "scale(0) translateY(0)",
            opacity: 0,
          },
          "20%": {
            transform: "scale(1.2) translateY(0)",
            opacity: 1,
          },
          "30%": {
            transform: "scale(1) translateY(0)",
            opacity: 1,
          },
          "100%": {
            transform: "scale(1) translateY(-100px)",
            opacity: 0,
          },
        },
      }}
    >
      <Icon sx={{ fontSize: 40 }} />
    </Box>
  );
}
