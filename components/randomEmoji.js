const emojis = [
  "😀",
  "🥰",
  "😘",
  "😎",
  "🤩",
  "🥳",
  "😏",
  "🤬",
  "🤯",
  "😳",
  "🥵",
  "🥶",
  "😱",
  "😨",
  "😰",
  "😲",
  "🥱",
  "😪",
  "😵",
  "🤐",
  "🥴",
  "🤢",
  "😷",
  "🤒",
  "🤕",
  "🤑",
  "🤠",
  "😈",
  "👿",
  "👹",
  "👺",
  "🤡",
  "💩",
  "👻",
  "💀",
];
export default function randomEmoji ()
{
        const randemojis = Math.floor(Math.random() * emojis.length);
        return emojis[randemojis];
      

}

