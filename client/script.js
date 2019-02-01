var generatorForm = document.getElementById("generator"),
  outputTarget = document.getElementById("output"),
  loadingTemplate = document.getElementById("template--loading"),
  resultTemplate = document.getElementById("template--result"),
  textInput = document.getElementById("text-input"),
  sizeInput = document.getElementById("size-input"),
  weightInput = document.getElementById("weight-input"),
  colorInput = document.getElementById("color-input"),
  alignInput = document.getElementById("align-input"),
  resetButton = document.getElementById("reset-btn");

var TAB = "  ",
  previousTaskArgs = null,
  latestTaskId = 0;

function loadHLJSStyle() {
  return new Promise(function(resolve) {
    var elem = document.createElement("link");
    elem.id = "hljs-style";
    elem.rel = "stylesheet";
    elem.href = "highlight/styles/github.css";
    elem.onload = resolve;
    document.head.appendChild(elem);
  });
}

function loadHLJSScript() {
  return new Promise(function(resolve) {
    var elem = document.createElement("script");
    elem.id = "hljs-script";
    elem.type = "text/javascript";
    elem.src = "highlight/highlight.pack.js";
    elem.onload = resolve;
    document.head.appendChild(elem);
  });
}

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}

function getDefaultSelectValue(elem) {
  return elem.querySelector("option[selected]").getAttribute("value");
}

function clearInputs() {
  textInput.value = textInput.getAttribute("value");
  sizeInput.value = getDefaultSelectValue(sizeInput);
  weightInput.value = getDefaultSelectValue(weightInput);
  colorInput.value = getDefaultSelectValue(colorInput);
  alignInput.value = getDefaultSelectValue(alignInput);
}

function clearOutput() {
  outputTarget.innerHTML = "";
}

function clearSearchParams(push) {
  var isPush = push == null ? false : push;
  var params = new URLSearchParams(location.search);
  if (isPush && params.toString() !== "") {
    history.pushState(null, "", location.pathname);
  } else {
    history.replaceState(null, "", location.pathname);
  }
}

function resetForm(push) {
  clearInputs();
  clearOutput();
  clearSearchParams(push);
  // if we don't clear the task args, going forward after a back
  // won't re-generate the text
  previousTaskArgs = null;
}

function syncSearchParams(text, size, weight, color, align) {
  var currentParams = new URLSearchParams(location.search);
  var nextParams = new URLSearchParams({
    text: text,
    size: size,
    weight: weight,
    color: color,
    align: align
  });

  // without this conditional the browser history ends up
  // getting filled with redundant entries
  if (currentParams.toString() !== nextParams.toString()) {
    var nextPath = window.location.pathname + "?" + nextParams.toString();
    if (currentParams.toString() === "") {
      history.replaceState(null, "", nextPath);
    } else {
      history.pushState(null, "", nextPath);
    }
  }
}

function copyClickHandler(htmlSrc) {
  return function(event) {
    var copyTarget = document.createElement("textarea");
    copyTarget.value = htmlSrc;
    copyTarget.setAttribute("readonly", "");
    copyTarget.style.position = "absolute";
    copyTarget.style.left = "-9999px";
    document.body.appendChild(copyTarget);
    copyTarget.select();
    document.execCommand("copy");
    document.body.removeChild(copyTarget);
  };
}

function generateOutput(text, size, weight, color, align) {
  var currentTaskArgs = [text, size, weight, color, align];
  if (arraysEqual(previousTaskArgs, currentTaskArgs)) return;
  previousTaskArgs = currentTaskArgs;

  syncSearchParams(text, size, weight, color, align);

  latestTaskId++;
  var generateId = latestTaskId;

  var loadingTimeoutId;
  if (outputTarget.querySelector(".loading-spinner") == null) {
    loadingTimeoutId = setTimeout(function() {
      var spinner = document.importNode(loadingTemplate.content, true);
      outputTarget.innerHTML = "";
      outputTarget.appendChild(spinner);
    }, 100);
  }

  var params = new URLSearchParams();
  params.append("text", text);
  params.append("size", size);
  params.append("weight", weight);
  params.append("color", color);

  var baseUrl = location.protocol + "//" + location.host;
  var imgSrc = baseUrl + "/header?" + params.toString();

  var img = new Image();

  img.onload = (function(text, align, imgSrc, img, id, loadingTimeoutId) {
    return function() {
      window.clearTimeout(loadingTimeoutId);

      var scaledWidth = Math.ceil(img.width / 2);
      var scaledHeight = Math.ceil(img.height / 2);

      var resultOutput = document.importNode(resultTemplate.content, true);

      // create preview output
      var previewImg = document.createElement("img");
      previewImg.setAttribute("width", scaledWidth.toString());
      previewImg.setAttribute("height", scaledHeight.toString());
      previewImg.setAttribute("alt", text);
      previewImg.setAttribute("src", imgSrc);

      var previewTarget = resultOutput.querySelector("#preview");
      var previewTag = document.createElement(size);
      previewTag.setAttribute("align", align);
      previewTag.appendChild(previewImg);
      previewTarget.appendChild(previewTag);

      // create code output
      var htmlSrc = [
        "<" + size + ' align="' + align + '">',
        TAB.repeat(1) + "<!-- Generated with " + location.href + " -->",
        TAB.repeat(1) + "<img",
        TAB.repeat(2) + 'width="' + scaledWidth.toString() + '"',
        TAB.repeat(2) + 'alt="' + text + '"',
        TAB.repeat(2) + 'src="' + imgSrc + '"',
        TAB.repeat(1) + "/>",
        "</" + size + ">"
      ].join("\n");
      var codeTarget = resultOutput.querySelector("pre code");
      codeTarget.textContent = htmlSrc;

      // setup code copy button
      var copyBtn = resultOutput.querySelector("#copy-btn");
      copyBtn.addEventListener("click", copyClickHandler(htmlSrc), false);

      function highlightAndAppend(resultOutput) {
        // highlight code output
        hljs.highlightBlock(resultOutput.querySelector("pre"));

        if (id === latestTaskId) {
          // clear output targets
          outputTarget.innerHTML = "";

          // append result to dom
          outputTarget.appendChild(resultOutput);
        }
      }

      if (
        document.getElementById("hljs-script") == null ||
        document.getElementById("hljs-style")
      ) {
        Promise.all([loadHLJSScript(), loadHLJSStyle()]).then(
          highlightAndAppend.bind(null, resultOutput)
        );
      } else {
        highlightAndAppend(resultOutput);
      }
    };
  })(text, align, imgSrc, img, generateId, loadingTimeoutId);

  img.src = imgSrc;
}

function populateDataFromSearchParams() {
  var searchParams = new URLSearchParams(window.location.search);

  var text = searchParams.get("text");
  var size = searchParams.get("size");
  var weight = searchParams.get("weight");
  var color = searchParams.get("color");
  var align = searchParams.get("align");

  if (
    typeof text === "string" &&
    typeof size === "string" &&
    typeof weight === "string" &&
    typeof color === "string" &&
    typeof align === "string"
  ) {
    textInput.value = text;
    sizeInput.value = size;
    weightInput.value = weight;
    colorInput.value = color;
    alignInput.value = align;
    generateOutput(text, size, weight, color, align);
  } else {
    resetForm(false);
  }
}

resetButton.addEventListener(
  "click",
  function() {
    resetForm(true);
  },
  false
);

generatorForm.addEventListener(
  "submit",
  function(event) {
    event.preventDefault();

    var fdata, textValue, sizeValue, weightValue, colorValue;

    fdata = new FormData(event.target);

    textValue = fdata.get("text");
    sizeValue = fdata.get("size");
    weightValue = fdata.get("weight");
    colorValue = fdata.get("color");
    alignValue = fdata.get("align");

    generateOutput(textValue, sizeValue, weightValue, colorValue, alignValue);

    return false;
  },
  false
);

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

populateDataFromSearchParams();
window.addEventListener("popstate", populateDataFromSearchParams, false);
