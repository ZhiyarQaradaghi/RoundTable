import { Box, IconButton, Zoom } from "@mui/material";

import {
  ThumbUp,
  Favorite,
  EmojiEmotions,
  Celebration,
  SentimentVeryDissatisfied,
  Lightbulb,
} from "@mui/icons-material";


const REACTIONS = [
  { icon: ThumbUp, color: "#4CAF50", name: "thumbsup" },
  { icon: Favorite, color: "#E91E63", name: "heart" },
  { icon: EmojiEmotions, color: "#FFC107", name: "smile" },
  { icon: Celebration, color: "#9C27B0", name: "celebrate" },
  { icon: SentimentVeryDissatisfied, color: "#FF5722", name: "sad" },
  { icon: Lightbulb, color: "#2196F3", name: "idea" },
];

export default function Reactions({ onReact }) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      {REACTIONS.map((reaction) => (
        <IconButton
          key={reaction.name}
          onClick={() => onReact(reaction.name)}
          sx={{
            color: reaction.color,
            "&:hover": {
              backgroundColor: `${reaction.color}20`,
            },
          }}
        >
          <reaction.icon />
        </IconButton>
      ))}
    </Box>
  );
}
