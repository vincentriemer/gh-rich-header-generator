const path = require("path");
const { parse } = require("url");
const text2png = require("./text2png");

const BASE_FONT_SIZE = 16;

const em = em => {
  return em * BASE_FONT_SIZE;
};

const sizes = {
  h1: em(2),
  h2: em(1.5),
  h3: em(1.25),
  h4: em(1)
};

const paddingBottoms = {
  h1: em(0.3),
  h2: em(0.3),
  h3: 0,
  h4: 0
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

  if (pathname !== "/") {
    res.statusCode = 400;
    res.end("Bad Request", "utf8");
    return;
  }

  const { text, type = "h1", weight = "medium", color = "black" } = query;

  const fontConfig = fonts[weight];

  const options = {
    color,
    font: `${sizes[type]}px ${fontConfig.localFontName}`,
    ...fontConfig,
    paddingBottom: 1,
    output: "stream"
  };

  const imgStream = text2png(text, options);

  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "max-age=31536000");
  imgStream.pipe(res);
};
