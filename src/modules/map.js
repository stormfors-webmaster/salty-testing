export function map() {
  console.log("map.js module loaded");
  const mapboxToken =
    "pk.eyJ1IjoiZmVsaXhoZWxsc3Ryb20iLCJhIjoiY20zaXhucjcwMDVwdTJqcG83ZjMxemJlciJ9._TipZd1k8nMEslWbCDg6Eg";

  let mapDefaultZoom = 9;
  let mapStartPosition = [-118.37655405160609, 33.78915439099377];
  let mapStartPitch = 0;

  //mapbox://styles/cv-mapbox/cm5zgyf7a002m01sgf936d3u6
  //mapbox://styles/mapbox/outdoors-v12
  mapboxgl.accessToken = mapboxToken;
  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/cv-mapbox/cm5zh2w0i002g01sfdcrs6dgj",
    projection: "globe",
    zoom: mapDefaultZoom,
    center: mapStartPosition,
    pitch: mapStartPitch,
  });

  map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

  map.addControl(
    new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
    }),
    "bottom-right"
  );

  window.dev = {
    openHome: openHomeSidebar,
    closeHome: closeHomeSidebar,
    openBeachList: openBeachListSidebar,
    closeBeachList: closeBeachListSidebar,
    openBeach: openBeachSidebar,
    closeBeach: closeBeachSidebar,
    openShop: openShopPage,
  };

  const markers = new Map(); // Store markers with their IDs

  init();

  async function init() {
    addClickEvents();
    setBeachMarkersFromHTML();
    // Check URL parameters for beaches query
    if (window.location.search.includes("beaches")) {
      console.log("beaches query found");
      closeHomeSidebar();
      openBeachListSidebar();
      // Clear URL parameters after handling them
      window.history.pushState({}, "", window.location.pathname);
    }

    if (window.innerWidth <= 991) {
      $(".mapboxgl-ctrl-bottom-right").hide();
    }
    //logMapCoordinates();
  }

  function setBeachMarkersFromHTML() {
    let beachElements = document.querySelectorAll("[temp-data=beach]");
    beachElements.forEach((element) => {
      let id = element.getAttribute("temp-id");
      let lat = parseFloat(element.getAttribute("lat"));
      let lon = parseFloat(element.getAttribute("lon"));
      if (
        isNaN(lat) ||
        isNaN(lon) ||
        lat < -90 ||
        lat > 90 ||
        lon < -180 ||
        lon > 180
      ) {
        console.warn(
          `Invalid coordinates for beach ${id}: lat=${lat}, lon=${lon}`
        );
        return;
      }
      let coordinates = [lon, lat];
      let popuptext = element.getAttribute("popup-text");
      createMarker(coordinates, popuptext, id);
    });
  }

  function createMarker(coordinates, popupText, id) {
    let popup = new mapboxgl.Popup({ offset: 25 }).setText(popupText);

    let markerElementX = document.createElement("div");
    markerElementX.className = "beach-marker";
    markerElementX.id = id;

    const marker = new mapboxgl.Marker(markerElementX)
      .setLngLat(coordinates)
      .setPopup(popup)
      .addTo(map);

    // Store the marker reference
    markers.set(id, marker);

    popup.on("open", () => {
      let lng = popup.getLngLat().lng;
      let lat = popup.getLngLat().lat;
      console.log("popup opened");
      console.log(id);
      map.flyTo({
        center: [lng, lat],
        zoom: 14,
        pitch: 75,
      });
      hideAllSidebars();
      openBeachListSidebar();
      openBeachSidebar(id);
      window.scrollTo({ top: 0, behavior: "instant" });
    });

    popup.on("close", () => {
      console.log("popup closed");
      console.log(id);
      window.scrollTo({ top: 0, behavior: "instant" });
    });
  }

  function addClickEvents() {
    document.addEventListener("click", (e) => {
      //open home sidebar
      if (e.target.matches("[open-sidebar=home], [open-sidebar=home] *")) {
        e.preventDefault();
        hideAllSidebars();
        openHomeSidebar();
        resetMapPosition();
      }
      //click on beach list buttons
      if (
        e.target.matches(
          "[open-sidebar=beach-list], [open-sidebar=beach-list] *"
        )
      ) {
        e.preventDefault();
        hideAllSidebars();
        if (window.innerWidth > 479) {
          openBeachListSidebar();
        }
        if (window.innerWidth <= 991) {
          expandMap();
        }
        if (window.innerWidth <= 479) {
          openBeachListSidebar();
        }
      }
      //click on beach list item
      if (e.target.matches("[map-link=item], [map-link=item] *")) {
        const target = e.target.matches("[map-link=item]")
          ? e.target
          : e.target.closest("[map-link=item]");
        let lat = target.getAttribute("lat");
        let lon = target.getAttribute("lon");
        let tempID = target.getAttribute("temp-id");
        toggleMarkerPopup(tempID);
        map.flyTo({
          center: [lon, lat],
          zoom: 14,
          pitch: 75,
        });
        openBeachSidebar(tempID);
      }
      if (
        e.target.matches(
          ".modal_close-button, .modal_close-button *, .mobile-back, .mobile-back *"
        )
      ) {
        closeBeachSidebar();
      }

      if (e.target.matches("[close-sidebar=beach]")) {
        closeAllPopups();
        openBeachListSidebar();
      }

      if (e.target.matches("[map-function=expand]")) {
        expandMap();
        setTimeout(() => {
          $("[sidebar-toggle=beach-list]").show();
          $(".mapboxgl-ctrl-bottom-right").show();
        }, 1000);
      }
      if (
        e.target.matches("[map-function=collapse] *, [map-function=collapse]")
      ) {
        collapseMap();
        $("[sidebar=beach-list]").css({
          transform: "translateX(-100%)",
          transition: "none",
        });
        $("[sidebar=home]").css({
          transform: "translateX(0%)",
          transition: "none",
        });
        $("[sidebar-toggle=beach-list]").hide();
        $(".mapboxgl-ctrl-bottom-right").hide();
      }
      if (e.target.matches("[toggle-sidebar=home]")) {
        toggleHomeSidebar();
      }
      if (e.target.matches("[toggle-sidebar=beach-list]")) {
        toggleBeachListSidebar();
      }
      //mobile beach close button
      if (e.target.matches(".mob-beach-top-inner, .mob-beach-top-inner *")) {
        console.log("mob-beach-top-inner clicked");
        closeBeachSidebar();
        openBeachListSidebar();
      }
      if (e.target.matches("[stormfors-sort=reverse]")) {
        const beachList = document.querySelector(".beach-list_list");
        const beachItems = [...beachList.children];
        beachItems.reverse();
        beachItems.forEach((item) => beachList.appendChild(item));
      }
      //end of click events
    });
  }

  function toggleHomeSidebar() {
    let open = $("[sidebar-toggle=home]").hasClass("folded");
    if (open) {
      openHomeSidebar();
    } else {
      closeHomeSidebar();
    }
  }

  function toggleBeachListSidebar() {
    let open = $("[sidebar-toggle=beach-list]").hasClass("folded");
    if (open) {
      openBeachListSidebar();
    } else {
      closeBeachListSidebar();
      closeBeachSidebar();
    }
  }

  function expandMap() {
    $("[map-function=expand]").hide();
    $("[map-function=container]").addClass("expanded");
    for (let i = 0; i < 100; i++) {
      setTimeout(() => {
        map.resize();
      }, i * 10);
    }
    //extra resize to fix map position visual bug
    map.resize();
    setTimeout(() => {
      map.resize();
      $("[map-function=collapse]").show();
    }, 1000);
  }

  function collapseMap() {
    $("[map-function=collapse]").hide();
    $("[map-function=container]").removeClass("expanded");
    for (let i = 0; i < 100; i++) {
      setTimeout(() => {
        map.resize();
      }, i * 10);
    }
    setTimeout(() => {
      $("[map-function=expand]").show();
    }, 1000);
  }

  function openShopPage() {
    window.scrollTo({ top: 0, behavior: "instant" });
    $("[page=shop]").removeClass("hide");
  }

  function closeShopPage() {
    window.scrollTo({ top: 0, behavior: "instant" });
    $("[page=shop]").addClass("hide");
  }

  function openHomeSidebar() {
    window.scrollTo({ top: 0, behavior: "instant" });
    $("[sidebar=home]").removeClass("folded");
    $("[sidebar-toggle=home]").removeClass("folded");
    setTimeout(() => {
      $("[map-function=expand]").show();
      $("[home-toggle-icon=when-open]").show();
      $("[home-toggle-icon=when-closed]").hide();
    }, 500);
  }

  function closeHomeSidebar() {
    window.scrollTo({ top: 0, behavior: "instant" });
    $("[sidebar=home]").addClass("folded");
    $("[sidebar-toggle=home]").addClass("folded");
    $("[home-toggle-icon=when-open]").hide();
    $("[home-toggle-icon=when-closed]").show();
  }

  function openBeachListSidebar() {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (window.innerWidth <= 479) {
      $("[sidebar=beach-list]").css({
        transition: "none",
        transform: "translateX(0%)",
      });
    }
    $("[sidebar-toggle=beach-list]").removeClass("folded");
    $("[sidebar=beach-list]").removeClass("folded");
    $("[beach-toggle-icon=when-open]").show();
    $("[beach-toggle-icon=when-closed]").hide();
  }

  function closeBeachListSidebar() {
    window.scrollTo({ top: 0, behavior: "instant" });
    $("[sidebar-toggle=beach-list]").addClass("folded");
    $("[sidebar=beach-list]").addClass("folded");
    $("[beach-toggle-icon=when-open]").hide();
    $("[beach-toggle-icon=when-closed]").show();
  }

  function openBeachSidebar(name) {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (window.innerWidth <= 479) {
      $("[sidebar=beach-list]").css({
        transition: "none",
        transform: "translateX(-100%)",
      });
    }
    $("[sidebar=beach]").show();
    $("[sidebar=" + name + "]").show();
    $("[sidebar=" + name + "]")
      .parent()
      .show();
  }

  function closeBeachSidebar(name) {
    window.scrollTo({ top: 0, behavior: "instant" });
    $("[sidebar=beach]").hide();
    $("[sidebar=" + name + "]").hide();
    $("[sidebar=" + name + "]")
      .parent()
      .hide();
  }

  function hideAllSidebars() {
    window.history.pushState({}, "", window.location.pathname);
    window.scrollTo({ top: 0, behavior: "instant" });
    closeHomeSidebar();
    closeBeachListSidebar();
    closeBeachSidebar();
    //this excludes the home sidebar from being hidden (causes issues with the image notch animation on the sliders otherwise)
    $("[beach-item=container]").hide();
  }

  function resetMapPosition() {
    map.flyTo({
      center: mapStartPosition,
      zoom: mapDefaultZoom,
      pitch: mapStartPitch,
    });
  }

  function getMapCenter() {
    // Get the map's center coordinates
    const center = map.getCenter();
    console.log(`Map center: ${center.lng}, ${center.lat}`);
  }

  function getMapZoomLevel() {
    const zoom = map.getZoom();
    console.log(`Map zoom level: ${zoom}`);
  }

  function getMapPitch() {
    const pitch = map.getPitch();
    console.log(`Map pitch: ${pitch}`);
  }

  function logMapCoordinates() {
    // Log center whenever map moves
    map.on("moveend", () => {
      getMapCenter();
      getMapZoomLevel();
      getMapPitch();
    });

    // Log current coordinates to console on mouse click
    map.on("click", (e) => {
      console.log(`${e.lngLat.lng}, ${e.lngLat.lat}`);
      console.log(e);

      /* if (e.target.matches(".beach-marker")) {
                  console.log("beach-marker clicked");
                  console.log(e.target.id);
                } */
    });
  }

  // Example of how to toggle a specific marker's popup
  function toggleMarkerPopup(id) {
    const marker = markers.get(id);
    if (marker) {
      marker.togglePopup();
    }
  }

  function closeAllPopups() {
    markers.forEach((marker) => {
      const popup = marker.getPopup();
      if (popup.isOpen()) {
        popup.remove();
      }
    });
  }
}
