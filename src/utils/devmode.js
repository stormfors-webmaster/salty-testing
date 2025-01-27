export function toggleDevMode() {
  const current = localStorage.getItem("devMode") === "true";
  localStorage.setItem("devMode", (!current).toString());
  console.log(`Dev mode is now ${!current ? "ON" : "OFF"}`);
  return !current;
}

export function loadScript(path) {
  document.addEventListener("DOMContentLoaded", () => {
    const script = document.createElement("script");
    script.src = path;
    document.body.appendChild(script);
  });
}

export function loadModule(path) {
  document.addEventListener("DOMContentLoaded", () => {
    const script = document.createElement("script");
    script.src = path;
    script.defer = true;
    script.type = "module";
    document.body.appendChild(script);
  });
}

export class DevModeStop extends Error {
  constructor() {
    super("Production code stopped (this is not an error)");
    this.name = "🔧 Dev Mode";
    this.background = "#2ecc71";
  }
}

export function customConsoleLog(name) {
  console.log(
    `%c🛠️ ${name} Dev Mode Active`,
    "color: #2ecc71; font-weight: bold; font-size: 14px;"
  );
}
