export class NotchPath {
  constructor(container) {
    this.container = container;
    this.svg = container.querySelector(".notch-svg");
    this.path = container.querySelector(".dynamic-path");
    this.notchButton = container.querySelector(".card_button");
    this.rightEdge = 304; // SVG width

    this.points = [];
    this.controlPoints = [];
    this.bezierRelationships = [];
    this.originalPoints = [];
    this.originalControlPoints = [];

    this.initialize();
  }

  initialize() {
    const commands = this.initializePath();
    this.setupResizeObserver();
  }

  initializePath() {
    const commands = this.path
      .getAttribute("d")
      .trim()
      .split(/(?=[MmLlHhVvCcSsQqTtAaZz])/);

    let pointIndex = 0;
    let controlPointIndex = 0;

    commands.forEach((cmd) => {
      const type = cmd[0];
      const coords = cmd
        .slice(1)
        .trim()
        .split(/[\s,]+/)
        .map(Number);

      switch (type) {
        case "M":
        case "L":
          this.points.push({ type, x: coords[0], y: coords[1] });
          pointIndex++;
          break;
        case "C":
          this.controlPoints.push(
            { x: coords[0], y: coords[1] },
            { x: coords[2], y: coords[3] }
          );
          this.points.push({ type, x: coords[4], y: coords[5] });
          this.bezierRelationships.push({
            pointIndex: pointIndex,
            controlPoints: [controlPointIndex, controlPointIndex + 1],
          });
          controlPointIndex += 2;
          pointIndex++;
          break;
      }
    });

    // Store initial positions
    this.originalPoints = this.points.map((p) => ({ ...p }));
    this.originalControlPoints = this.controlPoints.map((cp) => ({ ...cp }));

    return commands;
  }

  updatePath() {
    let newPathData = "";
    let pointIndex = 0;
    let controlPointIndex = 0;

    const commands = this.path
      .getAttribute("d")
      .trim()
      .split(/(?=[MmLlHhVvCcSsQqTtAaZz])/);
    commands.forEach((cmd) => {
      const type = cmd[0];
      switch (type) {
        case "M":
        case "L":
          newPathData += `${type}${this.points[pointIndex].x} ${this.points[pointIndex].y} `;
          pointIndex++;
          break;
        case "C":
          const cp1 = this.controlPoints[controlPointIndex];
          const cp2 = this.controlPoints[controlPointIndex + 1];
          const point = this.points[pointIndex];
          newPathData += `${type}${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${point.x} ${point.y} `;
          controlPointIndex += 2;
          pointIndex++;
          break;
        default:
          newPathData += cmd + " ";
      }
    });

    this.path.setAttribute("d", newPathData.trim());
  }

  updateNotchWidth(buttonWidth) {
    const svgWidth =
      (buttonWidth / this.notchButton.parentElement.offsetWidth) *
      this.rightEdge;

    const offset = this.rightEdge - svgWidth;
    const initialButtonWidth = 130;

    // Update points 7-12 (notch points)
    for (let i = 7; i <= 12; i++) {
      const originalX = this.points[i].x;
      this.points[i].x =
        offset +
        (this.originalPoints[i].x - (this.rightEdge - initialButtonWidth));

      // Update associated control points
      const bezierRelationship = this.bezierRelationships.find(
        (rel) => rel.pointIndex === i
      );
      if (bezierRelationship) {
        const [cp1Index, cp2Index] = bezierRelationship.controlPoints;
        this.controlPoints[cp1Index].x =
          offset +
          (this.originalControlPoints[cp1Index].x -
            (this.rightEdge - initialButtonWidth));
        this.controlPoints[cp2Index].x =
          offset +
          (this.originalControlPoints[cp2Index].x -
            (this.rightEdge - initialButtonWidth));
      }
    }

    this.updatePath();
  }

  setupResizeObserver() {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        this.updateNotchWidth(entry.contentRect.width);
      }
    });

    observer.observe(this.notchButton);
  }
}
