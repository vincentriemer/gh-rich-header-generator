const path = require("path");
const { parse } = require("url");
const text2png = require("./text2png");

const sizes = {
  h1: 32,
  h2: 24,
  h3: 20,
  h4: 16
};

const colors = {
  black: "#24292",
  gray: "#586069",
  blue: "#0366d6",
  red: "#cb2431",
  orange: "#e36209",
  green: "#28a745",
  purple: "#6f42c1"
};

const fonts = {
  light: {
    localFontPath: path.resolve(__dirname, "./Roboto/Roboto-Light.ttf"),
    localFontName: "RobotoLight"
  },
  regular: {
    localFontPath: path.resolve(__dirname, "./Roboto/Roboto-Regular.ttf"),
    localFontName: "RobotoRegular"
  },
  medium: {
    localFontPath: path.resolve(__dirname, "./Roboto/Roboto-Medium.ttf"),
    localFontName: "RobotoMedium"
  },
  bold: {
    localFontPath: path.resolve(__dirname, "./Roboto/Roboto-Bold.ttf"),
    localFontName: "RobotoBold"
  },
  black: {
    localFontPath: path.resolve(__dirname, "./Roboto/Roboto-Black.ttf"),
    localFontName: "RobotoBlack"
  }
};

module.exports = (req, res) => {
  const { query, pathname } = parse(req.url, true);

  if (pathname !== "/header") {
    res.statusCode = 400;
    res.end("Bad Request", "utf8");
    return;
  }

  const { text, size = "h1", weight = "medium", color = "black" } = query;

  const fontConfig = fonts[weight];

  const options = {
    color: colors[color],
    font: `${sizes[size]}px ${fontConfig.localFontName}`,
    ...fontConfig,
    paddingBottom: 1,
    output: "stream"
  };

  const imgStream = text2png(text, options);

  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "max-age=0, s-maxage=31536000");
  imgStream.pipe(res);
};
