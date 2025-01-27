export class Slider {
  constructor(options) {
    this.containerId = options.containerId;
    this.prevBtnId = options.prevBtnId;
    this.nextBtnId = options.nextBtnId;
    this.stepSize = options.stepSize || 1;
    this.maxItems = options.maxItems || null;
    this.itemWidth = options.itemWidth || "22rem"; // Allow custom item width
    this.categoryUrl = options.categoryUrl || "#";

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

    // Add "Go to Category" link
    const categoryLink = document.createElement("a");
    categoryLink.href = this.categoryUrl;
    categoryLink.classList.add("slider-last-card");
    categoryLink.innerHTML = "<h6>Go to Category</h6>";

    // Create a wrapper div to match other items' structure
    const linkWrapper = document.createElement("div");
    linkWrapper.appendChild(categoryLink);
    this.container.appendChild(linkWrapper);
    this.items.push(linkWrapper);

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
    this.items.forEach((item, index) => {
      item.style.flex = `0 0 ${this.itemWidth}`;
      item.style.transition = "transform 0.3s ease-in-out";

      // Apply special styles to the last item (category link)
      if (index === this.items.length - 1) {
        const linkElement = item.querySelector("a");
        if (linkElement) {
          linkElement.style.width = "100%";
          linkElement.style.margin = "0rem";
        }
      }
    });

    // Add event listeners with preventDefault
    this.prevBtn.addEventListener("click", (e) => {
      e.preventDefault();
      this.slide("prev");
    });
    this.nextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      this.slide("next");
    });

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
    const isAtStart = this.currentIndex === 0;
    const isAtEnd = this.currentIndex >= this.items.length - this.itemsInView;

    this.prevBtn.disabled = isAtStart;
    this.nextBtn.disabled = isAtEnd;

    // Add opacity changes
    this.prevBtn.style.opacity = isAtStart ? "0.3" : "1";
    this.nextBtn.style.opacity = isAtEnd ? "0.3" : "1";
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

    // Calculate nearest index - now using itemWidthPx/2 to make swipe distance shorter
    const nearestIndex = Math.round(
      -this.currentTranslateX / (itemWidthPx / 2)
    );
    const actualIndex = Math.floor(-this.currentTranslateX / itemWidthPx);

    // Use the actual index if the swipe wasn't strong enough to trigger next slide
    this.currentIndex = Math.max(
      0,
      Math.min(this.items.length - this.itemsInView, actualIndex)
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
