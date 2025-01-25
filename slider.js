class Slider {
  constructor(options) {
    this.containerId = options.containerId;
    this.prevBtnId = options.prevBtnId;
    this.nextBtnId = options.nextBtnId;
    this.stepSize = options.stepSize || 1;
    this.maxItems = options.maxItems || null;
    this.itemWidth = options.itemWidth || "22rem"; // Allow custom item width

    // Initialize elements
    this.container = document.getElementById(this.containerId);
    this.prevBtn = document.getElementById(this.prevBtnId);
    this.nextBtn = document.getElementById(this.nextBtnId);

    if (!this.container || !this.prevBtn || !this.nextBtn) {
      console.error("Required elements not found");
      return;
    }

    // Get all items and limit them if maxItems is set
    this.items = Array.from(this.container.children);
    if (this.maxItems && this.items.length > this.maxItems) {
      this.items = this.items.slice(0, this.maxItems);
      // Hide extra items
      Array.from(this.container.children)
        .slice(this.maxItems)
        .forEach((item) => (item.style.display = "none"));
    }

    // Calculate how many items fit in the container
    const containerWidth = this.container.offsetWidth;
    const itemWidthValue = parseFloat(this.itemWidth);
    const itemUnit = this.itemWidth.replace(itemWidthValue.toString(), "");
    let itemWidthPx;

    // Convert item width to pixels based on unit
    if (itemUnit === "rem") {
      itemWidthPx =
        itemWidthValue *
        parseFloat(getComputedStyle(document.documentElement).fontSize);
    } else if (itemUnit === "px") {
      itemWidthPx = itemWidthValue;
    } else {
      // For other units, temporarily set width and measure
      const tempDiv = document.createElement("div");
      tempDiv.style.width = this.itemWidth;
      document.body.appendChild(tempDiv);
      itemWidthPx = tempDiv.offsetWidth;
      document.body.removeChild(tempDiv);
    }

    this.itemsInView = Math.floor(containerWidth / itemWidthPx);

    // Don't initialize if there aren't enough items
    if (this.items.length <= this.itemsInView) {
      console.warn("Not enough items to create slider");
      return;
    }

    this.currentIndex = 0;
    this.touchStartX = 0;
    this.touchEndX = 0;
    this.currentTranslateX = 0;
    this.isDragging = false;
    this.startTranslateX = 0;

    this.init();
  }

  init() {
    // Style the container
    this.container.style.display = "flex";
    this.container.style.overflow = "visible";
    this.container.style.position = "relative";
    this.container.style.userSelect = "none";

    // Style all items
    this.items.forEach((item) => {
      item.style.flex = `0 0 ${this.itemWidth}`;
      item.style.transition = "transform 0.3s ease-in-out";
    });

    // Add event listeners
    this.prevBtn.addEventListener("click", () => this.slide("prev"));
    this.nextBtn.addEventListener("click", () => this.slide("next"));

    // Touch events for mobile
    this.container.addEventListener("touchstart", (e) =>
      this.handleTouchStart(e)
    );
    this.container.addEventListener("touchmove", (e) =>
      this.handleTouchMove(e)
    );
    this.container.addEventListener("touchend", () => this.handleTouchEnd());

    // Initial button state
    this.updateButtonStates();
  }

  slide(direction) {
    if (
      direction === "next" &&
      this.currentIndex < this.items.length - this.itemsInView
    ) {
      this.currentIndex = Math.min(
        this.currentIndex + this.stepSize,
        this.items.length - this.itemsInView
      );
    } else if (direction === "prev" && this.currentIndex > 0) {
      this.currentIndex = Math.max(0, this.currentIndex - this.stepSize);
    }

    this.updateSliderPosition();
    this.updateButtonStates();
  }

  updateSliderPosition() {
    const itemWidthValue = parseFloat(this.itemWidth);
    const itemUnit = this.itemWidth.replace(itemWidthValue.toString(), "");
    let translateX;

    if (itemUnit === "rem") {
      translateX = -(
        this.currentIndex *
        itemWidthValue *
        parseFloat(getComputedStyle(document.documentElement).fontSize)
      );
    } else if (itemUnit === "px") {
      translateX = -(this.currentIndex * itemWidthValue);
    } else {
      // For other units, calculate based on actual rendered width
      const tempDiv = document.createElement("div");
      tempDiv.style.width = this.itemWidth;
      document.body.appendChild(tempDiv);
      translateX = -(this.currentIndex * tempDiv.offsetWidth);
      document.body.removeChild(tempDiv);
    }

    this.currentTranslateX = translateX;
    this.items.forEach((item) => {
      item.style.transform = `translateX(${translateX}px)`;
    });
  }

  updateButtonStates() {
    this.prevBtn.disabled = this.currentIndex === 0;
    this.nextBtn.disabled =
      this.currentIndex >= this.items.length - this.itemsInView;
  }

  handleTouchStart(e) {
    this.isDragging = true;
    this.touchStartX = e.touches[0].clientX;
    this.startTranslateX = this.currentTranslateX;

    // Remove transition during drag
    this.items.forEach((item) => {
      item.style.transition = "none";
    });
  }

  handleTouchMove(e) {
    if (!this.isDragging) return;
    e.preventDefault();

    this.touchEndX = e.touches[0].clientX;
    const diff = this.touchEndX - this.touchStartX;
    const newTranslateX = this.startTranslateX + diff;

    // Calculate bounds
    const itemWidthValue = parseFloat(this.itemWidth);
    const itemUnit = this.itemWidth.replace(itemWidthValue.toString(), "");
    let itemWidthPx;

    if (itemUnit === "rem") {
      itemWidthPx =
        itemWidthValue *
        parseFloat(getComputedStyle(document.documentElement).fontSize);
    } else if (itemUnit === "px") {
      itemWidthPx = itemWidthValue;
    } else {
      const tempDiv = document.createElement("div");
      tempDiv.style.width = this.itemWidth;
      document.body.appendChild(tempDiv);
      itemWidthPx = tempDiv.offsetWidth;
      document.body.removeChild(tempDiv);
    }

    const maxTranslate = 0;
    const minTranslate = -(
      (this.items.length - this.itemsInView) *
      itemWidthPx
    );

    // Apply bounds
    this.currentTranslateX = Math.max(
      minTranslate,
      Math.min(maxTranslate, newTranslateX)
    );

    // Apply the translation
    this.items.forEach((item) => {
      item.style.transform = `translateX(${this.currentTranslateX}px)`;
    });
  }

  handleTouchEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;

    // Calculate the nearest slide position
    const itemWidthValue = parseFloat(this.itemWidth);
    const itemUnit = this.itemWidth.replace(itemWidthValue.toString(), "");
    let itemWidthPx;

    if (itemUnit === "rem") {
      itemWidthPx =
        itemWidthValue *
        parseFloat(getComputedStyle(document.documentElement).fontSize);
    } else if (itemUnit === "px") {
      itemWidthPx = itemWidthValue;
    } else {
      const tempDiv = document.createElement("div");
      tempDiv.style.width = this.itemWidth;
      document.body.appendChild(tempDiv);
      itemWidthPx = tempDiv.offsetWidth;
      document.body.removeChild(tempDiv);
    }

    // Calculate nearest index
    const nearestIndex = Math.round(-this.currentTranslateX / itemWidthPx);
    this.currentIndex = Math.max(
      0,
      Math.min(this.items.length - this.itemsInView, nearestIndex)
    );

    // Restore transition
    this.items.forEach((item) => {
      item.style.transition = "transform 0.3s ease-in-out";
    });

    // Update position to snap to nearest slide
    this.updateSliderPosition();
    this.updateButtonStates();
  }
}

var Webflow = Webflow || [];
Webflow.push(function () {
  // DOMready has fired
  // May now use jQuery and Webflow api
  const sliderKiddos = new Slider({
    containerId: "slider-kiddos",
    prevBtnId: "prev-button-kiddos",
    nextBtnId: "next-button-kiddos",
    itemWidth: "22rem", // Optional: custom item width (default is '20rem')
    stepSize: 1, // Optional: items to move per step (default is 1)
    maxItems: 10, // Optional: maximum items to show (default is null)
  });

  const sliderSun = new Slider({
    containerId: "slider-sun",
    prevBtnId: "prev-button-sun",
    nextBtnId: "next-button-sun",
    itemWidth: "22rem", // Optional: custom item width (default is '20rem')
    stepSize: 1, // Optional: items to move per step (default is 1)
    maxItems: 10, // Optional: maximum items to show (default is null)
  });

  const sliderTransport = new Slider({
    containerId: "slider-transport",
    prevBtnId: "prev-button-transport",
    nextBtnId: "next-button-transport",
    itemWidth: "22rem", // Optional: custom item width (default is '20rem')
    stepSize: 1, // Optional: items to move per step (default is 1)
    maxItems: 10, // Optional: maximum items to show (default is null)
  });
  // end webflow push
});
