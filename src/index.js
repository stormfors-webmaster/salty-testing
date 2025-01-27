import { customConsoleLog } from "./utils/devmode.js";
import { map } from "./modules/map.js";
import { NotchPath } from "./modules/notch.js";
import { Slider } from "./modules/slider.js";

const devmode = localStorage.getItem("devMode") === "true";
if (devmode) {
  customConsoleLog("Salty");
}

console.log("active");
const homepage = window.location.pathname === "/";
const store = window.location.pathname.includes("/store");

if (!homepage && !store) {
  console.log("no script");
}

if (homepage) {
  initHomepage();
}

if (store) {
  initStore();
}

function notch() {
  if (window.innerWidth > 479) {
    const containers = document.querySelectorAll(".path-container");
    containers.forEach((container) => {
      new NotchPath(container);
    });
    return;
  }
}

async function initHomepage() {
  console.log("init homepage");
  map();
  notch();
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
}

function initStore() {
  console.log("init store");
  notch();
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
}
