import { map } from "./modules/map.js";
import { NotchPath } from "./modules/notch.js";
import { Slider } from "./modules/slider.js";

function notch() {
  if (window.innerWidth > 479) {
    const containers = document.querySelectorAll(".path-container");
    containers.forEach((container) => {
      new NotchPath(container);
    });
    console.log("notch.js module loaded");
    return;
  }
}

function slider() {
  const sliderKiddos = new Slider({
    containerId: "slider-kiddos",
    prevBtnId: "prev-button-kiddos",
    nextBtnId: "next-button-kiddos",
    itemWidth: "22rem",
    stepSize: 1,
    maxItems: 10,
    categoryUrl: "/product-categories/kiddos",
  });

  const sliderSun = new Slider({
    containerId: "slider-sun",
    prevBtnId: "prev-button-sun",
    nextBtnId: "next-button-sun",
    itemWidth: "22rem",
    stepSize: 1,
    maxItems: 10,
    categoryUrl: "/product-categories/sun-protection",
  });

  const sliderTransport = new Slider({
    containerId: "slider-transport",
    prevBtnId: "prev-button-transport",
    nextBtnId: "next-button-transport",
    itemWidth: "22rem",
    stepSize: 1,
    maxItems: 10,
    categoryUrl: "/product-categories/transport",
  });

  console.log("slider module loaded");
}

async function init() {
  console.log("init");
  map();
  slider();
  notch();
}

init();
