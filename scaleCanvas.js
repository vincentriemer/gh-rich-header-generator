function scaleCanvas(canvas, context, ratio) {
  if (!canvas || !context) {
    throw new Error("Must pass in `canvas` and `context`.");
  }

  var width = canvas.width; // keep existing width
  var height = canvas.height;
  var deviceRatio = ratio || 1;
  var bsRatio = 1;
  var ratio = deviceRatio / bsRatio;

  // Adjust canvas if ratio =/= 1
  if (deviceRatio !== bsRatio) {
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.scale(ratio, ratio);
  }
  return ratio;
}

module.exports = scaleCanvas;
