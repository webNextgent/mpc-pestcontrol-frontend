/* eslint-disable no-unused-vars */
import { useState, useCallback, useEffect, useRef } from "react";
import { FaLocationCrosshairs, FaPlus, FaMinus } from "react-icons/fa6";
import { FaSatellite } from "react-icons/fa";
import {
  GoogleMap,
  useJsApiLoader,
  Autocomplete,
} from "@react-google-maps/api";
import NextBtn from "../../../components/NextBtn/NextBtn";
import Summery from "../../../components/Summery/Summery";
import { useSummary } from "../../../provider/SummaryProvider";
import ServiceDetails from "../../../components/ServiceDetails/ServiceDetails";
import { useNavigate } from "react-router-dom";
import dirhum from "../../../assets/icon/dirhum.png";
import toast from "react-hot-toast";
import { IoIosArrowUp } from "react-icons/io";

const containerStyle = { width: "100%", height: "460px" };
const defaultCenter = { lat: 25.2048, lng: 55.2708 };

export default function LocationPicker() {
  const navigate = useNavigate();
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const [showMapOverlay, setShowMapOverlay] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  const {
    itemSummary,
    totalAfterDiscount,
    showInput,
    setShowInput,
    address,
    serviceTitle,
    setMapLongitude,
    setMapLatitude,
    setAddressLocation,
    liveAddress,
    saveAddress,
    setLiveAddress,
    totalVatRate,
    mapLongitude,
    mapLatitude,
  } = useSummary();

  const [selectedAddressId, setSelectedAddressId] = useState(
    liveAddress?.id || null,
  );
  const [currentAddress, setCurrentAddress] = useState(null);
  const [isGettingCurrentAddress, setIsGettingCurrentAddress] = useState(false);
  const [showCurrentAddressOption, setShowCurrentAddressOption] =
    useState(false);
  const [isNextDisabled, setIsNextDisabled] = useState(true);
  const [, setMapAddressSelected] = useState(false);
  const [fromListSelection, setFromListSelection] = useState(false);
  const [selectedPos, setSelectedPos] = useState(defaultCenter);
  const [map, setMap] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [mapType, setMapType] = useState("roadmap");
  const [open, setOpen] = useState(false);
  const [showMapForNew, setShowMapForNew] = useState(false);

  const autocompleteRef = useRef(null);
  const dropdownRef = useRef(null);

  // ─── Close dropdown on outside click ───────────────────────────
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        autocompleteRef.current &&
        !autocompleteRef.current.contains(e.target)
      ) {
        setShowCurrentAddressOption(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // ─── Fresh user → show map ─────────────────────────────────────
  useEffect(() => {
    if (saveAddress.length === 0) {
      setShowMapForNew(true);
      setShowMapOverlay(true);
      setSelectedAddressId(null);
      setIsNextDisabled(true);
    }
  }, [saveAddress]);

  const getAddressFromLatLng = (lat, lng) => {
    const geocoder = new window.google.maps.Geocoder();
    return new Promise((resolve, reject) => {
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          reject("Address not found");
        }
      });
    });
  };

  const handleLocation = useCallback(
    async (pos) => {
      setSelectedPos(pos);
      map?.panTo(pos);
      const addressText = await getAddressFromLatLng(pos.lat, pos.lng);
      setAddressLocation(addressText);
      setMapLatitude(pos.lat);
      setMapLongitude(pos.lng);
      return addressText;
    },
    [map, setAddressLocation, setMapLatitude, setMapLongitude],
  );

  // ─── handleMapClick depends on handleLocation ──────────────────
  const handleMapClick = useCallback(
    async (event) => {
      const pos = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      await handleLocation(pos);
      setIsNextDisabled(false);
      setMapAddressSelected(true);
      setFromListSelection(false);
      setShowCurrentAddressOption(false);
    },
    [handleLocation],
  );

  const handleAddressSelect = (addr) => {
    setSelectedAddressId(addr.id);
    setLiveAddress(addr);
    if (addr.latitude && addr.longitude) {
      setMapLatitude(addr.latitude);
      setMapLongitude(addr.longitude);
      setAddressLocation(addr.displayAddress);
    }
    setIsNextDisabled(false);
    setFromListSelection(true);
    setShowMapForNew(false);
  };

  const onLoadAutocomplete = (auto) => {
    setAutocomplete(auto);
    // Don't attach manual click listener; handled via JSX onClick
  };

  const onPlaceChanged = async () => {
    if (!autocomplete) return;
    const place = autocomplete.getPlace();
    if (!place.geometry) return;
    const pos = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };
    await handleLocation(pos);
    setIsNextDisabled(false);
    setMapAddressSelected(true);
    setFromListSelection(false);
    setShowCurrentAddressOption(false);
  };

  const getCurrentAddress = async () => {
    setIsGettingCurrentAddress(true);
    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by your browser");
      }
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });
      const pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      const geocoder = new window.google.maps.Geocoder();
      const result = await new Promise((resolve, reject) => {
        geocoder.geocode({ location: pos }, (results, status) => {
          if (status === "OK" && results[0])
            resolve(results[0].formatted_address);
          else reject("Could not get address");
        });
      });
      const currentAddr = {
        id: "current-location",
        displayAddress: result,
        latitude: pos.lat,
        longitude: pos.lng,
        type: "Current Location",
        area: "Current Location",
        city: "",
        isCurrentLocation: true,
      };
      setCurrentAddress(currentAddr);
      setSelectedPos(pos);
      map?.panTo(pos);
      setMapLatitude(pos.lat);
      setMapLongitude(pos.lng);
      setAddressLocation(result);
      setIsNextDisabled(false);
      setMapAddressSelected(true);
      setFromListSelection(false);
      setShowCurrentAddressOption(false);
      if (autocomplete?.inputField) autocomplete.inputField.value = result;
      return currentAddr;
    } catch (error) {
      console.error("Error getting current address:", error);
      toast.error(
        "Could not get your current location. Please check your location permissions.",
      );
      return null;
    } finally {
      setIsGettingCurrentAddress(false);
    }
  };

  const handleCurrentAddressClick = async () => {
    const addr = await getCurrentAddress();
    if (addr) {
      setSelectedAddressId(addr.id);
      setLiveAddress(addr);
    }
  };

  const gotoMyLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      const pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      handleLocation(pos);
      setIsNextDisabled(false);
      setMapAddressSelected(true);
      setFromListSelection(false);
      setShowCurrentAddressOption(false);
    });
  };

  // ─── handleNextClick — fallback navigate if neither flag set ───
  const handleNextClick = async () => {
    if (showMapForNew) {
      navigate("/address");
      return false;
    }
    if (fromListSelection) {
      navigate("/date-time");
      return false;
    }
    // Map address selected (not from list)
    navigate("/date-time");
    return false;
  };

  if (!isLoaded)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#01788E]" />
      </div>
    );

  return (
    <div className="mb-20">
      {!showMapForNew && (
        <div className="mt-10 md:mt-0">
          <ServiceDetails title="Address" currentStep={2} />
        </div>
      )}

      <div className="flex justify-center gap-8 md:mt-5">
        {/* ── Main Card ─────────────────────────────────────────────── */}
        <div className="md:w-[60%] mb-4 w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Card Header */}
          <div className="px-6 pt-1 md:pt-4 pb-4 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">
              Where do you need the service?
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Select a saved address or pin a new location on the map
            </p>
          </div>

          {/* ── Saved Addresses View ─────────────────────────────── */}
          {saveAddress.length > 0 && !showMapForNew ? (
            <div className="px-6 md:px-9 py-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Saved Addresses
              </h3>

              {saveAddress.map((addr) => {
                const isSelected = selectedAddressId === addr.id;
                return (
                  <div
                    key={addr.id}
                    onClick={() => handleAddressSelect(addr)}
                    className={`
                                            relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer
                                            transition-all duration-200 group
                                            ${
                                              isSelected
                                                ? "border-[#01788E] bg-[#01788E]/5 shadow-sm"
                                                : "border-gray-200 hover:border-[#01788E]/40 hover:bg-gray-50"
                                            }
                                        `}
                  >
                    {/* ── BUG FIX: Radio filled when selected ── */}
                    <div className="mt-0.5 shrink-0">
                      <div
                        className={`
                                                w-5 h-5 rounded-full border-2 flex items-center justify-center
                                                transition-all duration-200
                                                ${
                                                  isSelected
                                                    ? "border-[#01788E] bg-[#01788E]"
                                                    : "border-gray-300 group-hover:border-[#01788E]/60"
                                                }
                                            `}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Address type badge */}
                      <span
                        className={`
                                                inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium mb-1
                                                ${
                                                  isSelected
                                                    ? "bg-[#01788E]/10 text-[#01788E]"
                                                    : "bg-gray-100 text-gray-600"
                                                }
                                            `}
                      >
                        {addr.type || "Address"}
                      </span>

                      <p
                        className={`font-medium text-sm leading-snug truncate
                                                ${isSelected ? "text-gray-900" : "text-gray-700"}`}
                      >
                        {addr.displayAddress}
                      </p>

                      <p className="text-xs text-gray-400 mt-0.5">
                        {addr.area}
                        {addr.city ? `, ${addr.city}` : ""}
                      </p>

                      {addr.buildingName && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          🏢 {addr.buildingName}
                        </p>
                      )}
                    </div>

                    {isSelected && (
                      <div className="shrink-0 flex items-center gap-1 text-[#01788E] text-xs font-semibold">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Selected
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add New Address button */}
              <button
                onClick={() => {
                  setShowMapForNew(true);
                  setShowMapOverlay(true);
                  setSelectedAddressId(null);
                  setFromListSelection(false);
                  setIsNextDisabled(true);
                  if (mapLatitude && mapLongitude) {
                    setSelectedPos({ lat: mapLatitude, lng: mapLongitude });
                  }
                }}
                className="
                                    mt-2 w-full flex items-center justify-center gap-2
                                    border-2 border-dashed border-[#01788E]/30 rounded-xl
                                    py-3 text-[#01788E] text-sm font-medium
                                    hover:border-[#01788E] hover:bg-[#01788E]/5
                                    transition-all duration-200
                                "
              >
                <FaPlus className="w-3.5 h-3.5" />
                Add New Address
              </button>
            </div>
          ) : (
            /* ── Map View ───────────────────────────────────────── */
            <div className="relative">
              {/* Search bar */}
              <div className="px-4 pt-4 pb-3 bg-white z-20 relative">
                <div className="relative" ref={autocompleteRef}>
                  <Autocomplete
                    onLoad={onLoadAutocomplete}
                    onPlaceChanged={onPlaceChanged}
                  >
                    <div className="relative">
                      <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                        />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search for your address…"
                        className="
                                                    w-full pl-10 pr-4 py-2.5 text-sm
                                                    border border-gray-200 rounded-xl
                                                    focus:outline-none focus:ring-2 focus:ring-[#01788E]/30 focus:border-[#01788E]
                                                    transition-all
                                                "
                        onClick={() => setShowCurrentAddressOption(true)}
                      />
                    </div>
                  </Autocomplete>

                  {/* Current location dropdown */}
                  {showCurrentAddressOption && (
                    <div
                      ref={dropdownRef}
                      className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30 overflow-hidden"
                    >
                      <button
                        onClick={handleCurrentAddressClick}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#01788E]/5 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#01788E]/10 flex items-center justify-center shrink-0">
                          {isGettingCurrentAddress ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#01788E]" />
                          ) : (
                            <FaLocationCrosshairs className="text-[#01788E] w-3.5 h-3.5" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            Use Current Location
                          </p>
                          <p className="text-xs text-gray-500">
                            {isGettingCurrentAddress
                              ? "Detecting your location…"
                              : "Detect via GPS"}
                          </p>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Map container */}
              <div className="relative">
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={selectedPos}
                  zoom={15}
                  onLoad={setMap}
                  onClick={handleMapClick}
                  mapTypeId={mapType}
                  options={{
                    disableDefaultUI: true,
                    zoomControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                    streetViewControl: false,
                    keyboardShortcuts: false,
                    gestureHandling: "greedy",
                    scrollwheel: false,
                  }}
                >
                  <img
                    src="https://servicemarket.com/dist/images/map-marker.svg"
                    alt="center marker"
                    className="pointer-events-none"
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -100%)",
                      width: "80px",
                      height: "80px",
                      zIndex: 20,
                    }}
                  />
                </GoogleMap>

                {/* Map controls */}
                <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
                  {[
                    {
                      icon: <FaPlus className="w-3 h-3" />,
                      action: () => map?.setZoom(map.getZoom() + 1),
                      title: "Zoom in",
                    },
                    {
                      icon: <FaMinus className="w-3 h-3" />,
                      action: () => map?.setZoom(map.getZoom() - 1),
                      title: "Zoom out",
                    },
                    {
                      icon: <FaLocationCrosshairs className="w-3 h-3" />,
                      action: gotoMyLocation,
                      title: "My location",
                    },
                    {
                      icon: <FaSatellite className="w-3 h-3" />,
                      action: () =>
                        setMapType(
                          mapType === "roadmap" ? "hybrid" : "roadmap",
                        ),
                      title: "Toggle satellite",
                    },
                  ].map(({ icon, action, title }) => (
                    <button
                      key={title}
                      onClick={action}
                      title={title}
                      className="
                                                w-8 h-8 bg-white rounded-lg shadow-md
                                                flex items-center justify-center
                                                text-gray-600 hover:text-[#01788E]
                                                hover:shadow-lg transition-all duration-150
                                                border border-gray-100
                                            "
                    >
                      {icon}
                    </button>
                  ))}
                </div>

                {/* Location permission overlay */}
                {showMapForNew && showMapOverlay && (
                  <div className="absolute inset-0 z-30 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-6 w-[85%] max-w-xs text-center shadow-2xl">
                      <div className="w-14 h-14 bg-[#01788E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaLocationCrosshairs className="text-[#01788E] text-2xl" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 mb-1">
                        Use your current location?
                      </h3>
                      <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                        We can automatically detect your location to make
                        address entry faster.
                      </p>
                      <div className="flex gap-2">
                        <button
                          disabled={isLocationLoading}
                          onClick={async () => {
                            try {
                              setIsLocationLoading(true);
                              await getCurrentAddress();
                              setShowMapOverlay(false);
                            } catch (error) {
                              toast.error("Location permission denied");
                            } finally {
                              setIsLocationLoading(false);
                            }
                          }}
                          className={`
                                                        flex-1 py-2.5 rounded-xl text-sm font-semibold
                                                        flex items-center justify-center gap-2
                                                        transition-all duration-200
                                                        ${
                                                          isLocationLoading
                                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                            : "bg-[#01788E] text-white hover:bg-[#015f72] active:scale-[0.98]"
                                                        }
                                                    `}
                        >
                          {isLocationLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-transparent" />
                              Detecting…
                            </>
                          ) : (
                            <>
                              <FaLocationCrosshairs className="w-3.5 h-3.5" />
                              Use Location
                            </>
                          )}
                        </button>
                        <button
                          disabled={isLocationLoading}
                          onClick={() => setShowMapOverlay(false)}
                          className="
                                                        flex-1 py-2.5 rounded-xl text-sm font-medium
                                                        border border-gray-200 text-gray-600
                                                        hover:bg-gray-50 active:scale-[0.98]
                                                        disabled:opacity-40 transition-all duration-200
                                                    "
                        >
                          Skip
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Back to saved addresses */}
              {saveAddress.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setShowMapForNew(false);
                      setShowMapOverlay(false);
                    }}
                    className="flex items-center gap-1.5 text-sm text-[#01788E] font-medium hover:underline"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Back to saved addresses
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <Summery
          serviceTitle={serviceTitle}
          address={address}
          itemSummary={itemSummary}
          totalVatRate={totalVatRate}
          showInput={showInput}
          setShowInput={setShowInput}
          liveAddress={liveAddress}
          isValid={!isNextDisabled}
          open={open}
          setOpen={setOpen}
        />
      </div>

      {/* Mobile bottom bar */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.08)] border-t border-gray-200 z-50">
        <div className="flex justify-center px-3 py-2">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setOpen(true)}
              className="cursor-pointer select-none active:scale-[0.98] transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-1"
            >
             <p className="text-[10px] text-gray-600 font-medium uppercase">View Summary</p>
                    <div className="flex items-center gap-0.5 justify-center">
                        <img src={dirhum} className="w-3.5 h-3.5 mt-0.5" alt="" />
                        <span className="text-sm sm:text-base font-bold text-gray-900">
                            {totalAfterDiscount.toFixed(2)}
                        </span>
                        <span className="text-gray-900 text-sm"><IoIosArrowUp /></span>
                    </div> 
            </button>
            <div className="w-[140px]">
              <NextBtn disabled={isNextDisabled} onClick={handleNextClick} />
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:block">
        <NextBtn disabled={isNextDisabled} onClick={handleNextClick} />
      </div>
    </div>
  );
};






// main component code
// /* eslint-disable no-unused-vars */
// import { useState, useCallback, useEffect, useRef } from "react";
// import { FaLocationCrosshairs, FaPlus, FaMinus } from "react-icons/fa6";
// import { FaSatellite } from "react-icons/fa";
// import { GoogleMap, useJsApiLoader, Autocomplete } from "@react-google-maps/api";
// import NextBtn from "../../../components/NextBtn/NextBtn";
// import Summery from "../../../components/Summery/Summery";
// import { useSummary } from "../../../provider/SummaryProvider";
// import ServiceDetails from "../../../components/ServiceDetails/ServiceDetails";
// import { useNavigate } from "react-router-dom";
// import dirhum from '../../../assets/icon/dirhum.png';
// import toast from "react-hot-toast";

// const containerStyle = { width: "100%", height: "500px" };
// const defaultCenter = { lat: 25.2048, lng: 55.2708 };

// export default function LocationPicker() {
//     const navigate = useNavigate();
//     const { isLoaded } = useJsApiLoader({
//         googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
//         libraries: ["places"],
//     });
//     const [showMapOverlay, setShowMapOverlay] = useState(false);
//     const [isLocationLoading, setIsLocationLoading] = useState(false);

//     const { itemSummary, totalAfterDiscount, showInput, setShowInput, address, serviceTitle, setMapLongitude, setMapLatitude, setAddressLocation, liveAddress, saveAddress, setLiveAddress, totalVatRate, mapLongitude, mapLatitude } = useSummary();

//     const [selectedAddressId, setSelectedAddressId] = useState(
//         liveAddress?.id || null
//     );

//     // Current address state
//     const [currentAddress, setCurrentAddress] = useState(null);
//     const [isGettingCurrentAddress, setIsGettingCurrentAddress] = useState(false);
//     const [showCurrentAddressOption, setShowCurrentAddressOption] = useState(false);

//     // Autocomplete input ref
//     const autocompleteInputRef = useRef(null);

//     const handleAddressSelect = (addr) => {
//         setSelectedAddressId(addr.id);
//         setLiveAddress(addr);

//         // Latitude, longitude সেট করুন
//         if (addr.latitude && addr.longitude) {
//             setMapLatitude(addr.latitude);
//             setMapLongitude(addr.longitude);
//             setAddressLocation(addr.displayAddress);
//         }

//         setIsNextDisabled(false);
//         setFromListSelection(true);
//         setShowMapForNew(false);
//     };

//     const [isNextDisabled, setIsNextDisabled] = useState(true);
//     const [, setMapAddressSelected] = useState(false);
//     const [fromListSelection, setFromListSelection] = useState(false);
//     const [selectedPos, setSelectedPos] = useState(defaultCenter);
//     const [map, setMap] = useState(null);
//     const [autocomplete, setAutocomplete] = useState(null);
//     const [mapType, setMapType] = useState("roadmap");
//     const [open, setOpen] = useState(false);
//     const [showMapForNew, setShowMapForNew] = useState(false);

//     const getAddressFromLatLng = (lat, lng) => {
//         const geocoder = new window.google.maps.Geocoder();
//         return new Promise((resolve, reject) => {
//             geocoder.geocode({ location: { lat, lng } }, (results, status) => {
//                 if (status === "OK" && results[0]) {
//                     resolve(results[0].formatted_address);
//                 } else {
//                     reject("Address not found");
//                 }
//             });
//         });
//     };

//     const handleLocation = async (pos) => {
//         setSelectedPos(pos);
//         map?.panTo(pos);
//         const addressText = await getAddressFromLatLng(pos.lat, pos.lng);
//         setAddressLocation(addressText);
//         setMapLatitude(pos.lat);
//         setMapLongitude(pos.lng);
//         return addressText;
//     };

//     const onLoadAutocomplete = (auto) => {
//         setAutocomplete(auto);

//         // Attach click event listener to the input
//         const inputElement = auto.inputField;
//         if (inputElement) {
//             inputElement.addEventListener('click', handleInputClick);
//         }
//     };

//     const handleInputClick = () => {
//         setShowCurrentAddressOption(true);
//     };

//     const onPlaceChanged = async () => {
//         if (!autocomplete) return;
//         const place = autocomplete.getPlace();
//         if (!place.geometry) return;
//         const pos = {
//             lat: place.geometry.location.lat(),
//             lng: place.geometry.location.lng(),
//         };
//         await handleLocation(pos);
//         setIsNextDisabled(false);
//         setMapAddressSelected(true);
//         setFromListSelection(false);
//         setShowCurrentAddressOption(false);
//     };

//     const handleMapClick = useCallback(
//         async (event) => {
//             const pos = {
//                 lat: event.latLng.lat(),
//                 lng: event.latLng.lng(),
//             };
//             await handleLocation(pos);
//             setIsNextDisabled(false);
//             setMapAddressSelected(true);
//             setFromListSelection(false);
//             setShowCurrentAddressOption(false);
//         },
//         [map]
//     );

//     // Get current address function
//     const getCurrentAddress = async () => {
//         setIsGettingCurrentAddress(true);
//         try {
//             if (!navigator.geolocation) {
//                 throw new Error("Geolocation is not supported by your browser");
//             }

//             const position = await new Promise((resolve, reject) => {
//                 navigator.geolocation.getCurrentPosition(resolve, reject, {
//                     enableHighAccuracy: true,
//                     timeout: 10000,
//                     maximumAge: 0
//                 });
//             });

//             const pos = {
//                 lat: position.coords.latitude,
//                 lng: position.coords.longitude,
//             };

//             // Get address from coordinates
//             const geocoder = new window.google.maps.Geocoder();
//             const result = await new Promise((resolve, reject) => {
//                 geocoder.geocode({ location: pos }, (results, status) => {
//                     if (status === "OK" && results[0]) {
//                         resolve(results[0].formatted_address);
//                     } else {
//                         reject("Could not get address");
//                     }
//                 });
//             });

//             // Create current address object
//             const currentAddr = {
//                 id: "current-location",
//                 displayAddress: result,
//                 latitude: pos.lat,
//                 longitude: pos.lng,
//                 type: "Current Location",
//                 area: "Current Location",
//                 city: "",
//                 isCurrentLocation: true
//             };

//             setCurrentAddress(currentAddr);

//             // Update map position
//             setSelectedPos(pos);
//             map?.panTo(pos);
//             setMapLatitude(pos.lat);
//             setMapLongitude(pos.lng);
//             setAddressLocation(result);

//             setIsNextDisabled(false);
//             setMapAddressSelected(true);
//             setFromListSelection(false);
//             setShowCurrentAddressOption(false);

//             // Clear the input field
//             if (autocomplete && autocomplete.inputField) {
//                 autocomplete.inputField.value = result;
//             }

//             return currentAddr;
//         } catch (error) {
//             console.error("Error getting current address:", error);
//             toast.error("Could not get your current location. Please check your location permissions.");
//             return null;
//         } finally {
//             setIsGettingCurrentAddress(false);
//         }
//     };

//     // Handle current address selection from autocomplete dropdown
//     const handleCurrentAddressClick = async () => {
//         const addr = await getCurrentAddress();
//         if (addr) {
//             setSelectedAddressId(addr.id);
//             setLiveAddress(addr);
//         }
//     };

//     // GPS Button - for map view
//     const gotoMyLocation = () => {
//         navigator.geolocation.getCurrentPosition((position) => {
//             const pos = {
//                 lat: position.coords.latitude,
//                 lng: position.coords.longitude,
//             };
//             handleLocation(pos);
//             setIsNextDisabled(false);
//             setMapAddressSelected(true);
//             setFromListSelection(false);
//             setShowCurrentAddressOption(false);
//         });
//     };

//     const handleNextClick = async () => {
//         if (showMapForNew) {
//             navigate("/address");
//             return false;
//         }

//         if (fromListSelection) {
//             navigate("/date-time");
//             return false;
//         }
//         return true;
//     };

//     // Cleanup event listener
//     useEffect(() => {
//         return () => {
//             if (autocomplete && autocomplete.inputField) {
//                 autocomplete.inputField.removeEventListener('click', handleInputClick);
//             }
//         };
//     }, [autocomplete]);

//     useEffect(() => {
//         // Fresh user: no saved address
//         if (saveAddress.length === 0) {
//             setShowMapForNew(true);
//             setShowMapOverlay(true);
//             setSelectedAddressId(null);
//             setIsNextDisabled(true);
//         }
//     }, [saveAddress]);

//     if (!isLoaded) return <div>Loading map…</div>;
//     return (
//         <div>
//             <div className="mt-10 md:mt-0">
//                 <ServiceDetails title="Address" currentStep={2} />
//             </div>
//             <div className="flex justify-center gap-8 md:mt-5">
//                 <div className="md:w-[60%] mb-4 space-y-1 relative shadow-md w-full py-6 px-3">
//                     <h2 className="text-[24px] text-center md:text-start font-semibold">Where do you need the service?</h2>
//                     <p>Please select your current address or add a new address</p>

//                     {
//                         saveAddress.length > 0 && !showMapForNew ?
//                             <div className="">
//                                 <h3 className="text-xl font-semibold mb-4">
//                                     Select your address
//                                 </h3>

//                                 {/* Current Location Option in saved addresses */}
//                                 {/* <div
//                                     onClick={() => handleCurrentAddressClick()}
//                                     className={`border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors mb-3
//                                         ${selectedAddressId === 'current-location'
//                                             ? "border-[#01788E] bg-white"
//                                             : ""
//                                         }`}
//                                 >
//                                     <div className="flex items-start gap-3">
//                                         <div className="mt-1">
//                                             <div className={`w-4 h-4 rounded-full border-2
//                                                 ${selectedAddressId === 'current-location'
//                                                     ? "border-[#01788E] bg-white"
//                                                     : "border-[#01788E]"
//                                                 }`}
//                                             ></div>
//                                         </div>

//                                         <div className="flex-1">
//                                             <div className="flex items-center gap-2">
//                                                 <FaLocationCrosshairs className="text-[#01788E]" />
//                                                 <span className="font-medium">
//                                                     Current Location
//                                                 </span>
//                                             </div>

//                                             {isGettingCurrentAddress ? (
//                                                 <div className="text-sm text-gray-600 mt-1">
//                                                     Getting your location...
//                                                 </div>
//                                             ) : currentAddress ? (
//                                                 <>
//                                                     <div className="text-sm text-gray-600 mt-1">
//                                                         {currentAddress.displayAddress}
//                                                     </div>
//                                                     <div className="text-xs text-gray-500 mt-1 italic">
//                                                         Based on your device's GPS
//                                                     </div>
//                                                 </>
//                                             ) : (
//                                                 <div className="text-sm text-gray-600 mt-1">
//                                                     Click to use your current location
//                                                 </div>
//                                             )}
//                                         </div>

//                                         {selectedAddressId === 'current-location' && (
//                                             <div className="text-[#01788E] font-medium">
//                                                 ✓ Selected
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div> */}

//                                 <div className="mb-4">
//                                     {saveAddress.map((addr) => (
//                                         <div
//                                             key={addr.id}
//                                             onClick={() => handleAddressSelect(addr)}
//                                             className={`border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors mb-2
//                                                 ${selectedAddressId === addr.id
//                                                     ? "border-[#01788E] bg-white"
//                                                     : ""
//                                                 }`}
//                                         >
//                                             <div className="flex items-start gap-3">
//                                                 <div className="mt-1">
//                                                     <div
//                                                         className={`w-4 h-4 rounded-full border-2
//                                                             ${selectedAddressId === addr.id
//                                                                 ? "border-[#01788E] bg-white"
//                                                                 : "border-[#01788E]"
//                                                             }`}
//                                                     ></div>
//                                                 </div>

//                                                 <div className="flex-1">
//                                                     <div className="font-medium">
//                                                         {addr.displayAddress}
//                                                     </div>

//                                                     <div className="text-sm text-gray-600 mt-1">
//                                                         {addr.type} • {addr.area}, {addr.city}
//                                                     </div>

//                                                     {addr.buildingName && (
//                                                         <div className="text-sm text-gray-500 mt-1">
//                                                             Building: {addr.buildingName}
//                                                         </div>
//                                                     )}
//                                                 </div>

//                                                 {selectedAddressId === addr.id ? (
//                                                     <div className="text-[#01788E] font-medium">
//                                                         ✓ Selected
//                                                     </div>
//                                                 ) : (null)}
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>

//                                 <div className="mt-6">
//                                     <button
//                                         onClick={() => {
//                                             setShowMapForNew(true);
//                                             setShowMapOverlay(true);
//                                             setSelectedAddressId(null);
//                                             setFromListSelection(false);
//                                             setIsNextDisabled(true);
//                                             // নতুন address এর জন্য current location সেট করুন
//                                             if (mapLatitude && mapLongitude) {
//                                                 setSelectedPos({ lat: mapLatitude, lng: mapLongitude });
//                                             }
//                                         }}
//                                         className="text-[#01788E] font-medium flex items-center gap-2"
//                                     >
//                                         <FaPlus /> Add New Address
//                                     </button>
//                                 </div>
//                             </div> :
//                             <div className="">
//                                 {/* Search Input */}
//                                 <div className="absolute md:top-26 left-1/2 -translate-x-1/2 z-20 w-11/12">
//                                     <div className="shadow-lg bg-white rounded-md relative">
//                                         <Autocomplete
//                                             onLoad={onLoadAutocomplete}
//                                             onPlaceChanged={onPlaceChanged}
//                                         >
//                                             <input
//                                                 ref={autocompleteInputRef}
//                                                 type="text"
//                                                 placeholder="Search for your address…"
//                                                 className="w-full p-3 border rounded-md focus:outline-none"
//                                                 onClick={() => setShowCurrentAddressOption(true)}
//                                             />
//                                         </Autocomplete>

//                                         {/* Custom Current Location Option in Autocomplete Dropdown */}
//                                         {showCurrentAddressOption && (
//                                             <div className="absolute top-full left-0 right-0 bg-white border border-t-0 border-gray-300 rounded-b-md shadow-lg z-30">
//                                                 <div
//                                                     onClick={handleCurrentAddressClick}
//                                                     className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
//                                                 >
//                                                     <div className="text-[#01788E]">
//                                                         <FaLocationCrosshairs />
//                                                     </div>
//                                                     <div className="flex-1">
//                                                         <div className="font-medium">
//                                                             Use Current Location
//                                                         </div>
//                                                         <div className="text-sm text-gray-600">
//                                                             {isGettingCurrentAddress
//                                                                 ? "Getting your location..."
//                                                                 : "Get your current address using GPS"}
//                                                         </div>
//                                                     </div>
//                                                     {isGettingCurrentAddress && (
//                                                         <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#01788E]"></div>
//                                                     )}
//                                                 </div>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>

//                                 {/* Buttons */}
//                                 <div className="absolute top-80 right-3 z-20 flex flex-col space-y-2">
//                                     <button onClick={() => map?.setZoom(map.getZoom() + 1)} className="bg-white shadow p-2 rounded-lg">
//                                         <FaPlus />
//                                     </button>
//                                     <button onClick={() => map?.setZoom(map.getZoom() - 1)} className="bg-white shadow p-2 rounded-lg">
//                                         <FaMinus className="font-bold" />
//                                     </button>
//                                     <button onClick={gotoMyLocation} className="bg-white shadow p-2 rounded-lg flex items-center justify-center">
//                                         <FaLocationCrosshairs />
//                                     </button>
//                                     <button onClick={() => setMapType(mapType === "roadmap" ? "hybrid" : "roadmap")} className="bg-white shadow p-2 rounded-lg">
//                                         <FaSatellite />
//                                     </button>
//                                 </div>

//                                 {showMapForNew && showMapOverlay && (
//                                     <div className="absolute inset-0 z-30 bg-black/40 flex items-center justify-center">
//                                         <div className="bg-white rounded-xl p-6 w-[90%] max-w-sm text-center shadow-xl">
//                                             <FaLocationCrosshairs className="text-[#01788E] text-3xl mx-auto mb-3" />

//                                             <h3 className="text-lg font-semibold mb-2">
//                                                 Use your current location?
//                                             </h3>

//                                             <p className="text-sm text-gray-600 mb-4">
//                                                 We can automatically detect your location for this address.
//                                             </p>

//                                             <div className="flex gap-3">
//                                                 {/* <button
//                                                     onClick={async () => {
//                                                         await getCurrentAddress();   // ♻ existing function
//                                                         setShowMapOverlay(false);    // overlay OFF
//                                                     }}
//                                                     className="flex-1 bg-[#01788E] text-white py-2 rounded-lg font-medium"
//                                                 >
//                                                     Use Location
//                                                 </button> */}
//                                                 <button
//                                                     disabled={isLocationLoading}
//                                                     onClick={async () => {
//                                                         try {
//                                                             setIsLocationLoading(true);      // 🔄 loading start
//                                                             await getCurrentAddress();       // 📍 GPS + address
//                                                             setShowMapOverlay(false);        // ❌ overlay close
//                                                         } catch (error) {
//                                                             alert("Location permission denied");
//                                                             console.error(error);
//                                                         } finally {
//                                                             setIsLocationLoading(false);     // ✅ loading stop
//                                                         }
//                                                     }}
//                                                     className={`flex-1 py-1 rounded font-medium flex items-center justify-center gap-0.5
//                                                             ${isLocationLoading
//                                                             ? "bg-gray-300 cursor-not-allowed"
//                                                             : "bg-[#01788E] text-white"
//                                                         }`}
//                                                 >
//                                                     {isLocationLoading ? (
//                                                         <>
//                                                             <svg
//                                                                 className="animate-spin h-5 w-5 text-white"
//                                                                 xmlns="http://www.w3.org/2000/svg"
//                                                                 fill="none"
//                                                                 viewBox="0 0 24 24"
//                                                             >
//                                                                 <circle
//                                                                     className="opacity-25"
//                                                                     cx="12"
//                                                                     cy="12"
//                                                                     r="10"
//                                                                     stroke="currentColor"
//                                                                     strokeWidth="4"
//                                                                 />
//                                                                 <path
//                                                                     className="opacity-75"
//                                                                     fill="currentColor"
//                                                                     d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
//                                                                 />
//                                                             </svg>
//                                                             <span>Getting location...</span>
//                                                         </>
//                                                     ) : (
//                                                         "Use Location"
//                                                     )}
//                                                 </button>

//                                                 <button
//                                                     disabled={isLocationLoading}
//                                                     onClick={() => setShowMapOverlay(false)}
//                                                     className="flex-1 border border-gray-300 py-2 rounded-lg font-medium text-gray-700 disabled:opacity-50"
//                                                 >
//                                                     Skip
//                                                 </button>

//                                             </div>
//                                         </div>
//                                     </div>
//                                 )}

//                                 {/* Google Map */}
//                                 <GoogleMap
//                                     mapContainerStyle={containerStyle}
//                                     center={selectedPos}
//                                     zoom={15}
//                                     onLoad={setMap}
//                                     onClick={handleMapClick}
//                                     mapTypeId={mapType}
//                                     options={{
//                                         disableDefaultUI: true,
//                                         zoomControl: false,
//                                         mapTypeControl: false,
//                                         fullscreenControl: false,
//                                         streetViewControl: false,
//                                         keyboardShortcuts: false,
//                                         gestureHandling: "greedy",
//                                         scrollwheel: false,
//                                     }}
//                                 >
//                                     <img
//                                         src="https://servicemarket.com/dist/images/map-marker.svg"
//                                         alt="center marker"
//                                         className="pointer-events-none"
//                                         style={{
//                                             position: "absolute",
//                                             top: "50%",
//                                             left: "50%",
//                                             transform: "translate(-50%, -100%)",
//                                             width: "80px",
//                                             height: "80px",
//                                             zIndex: 20,
//                                         }}
//                                     />
//                                 </GoogleMap>
//                             </div>
//                     }
//                 </div>

//                 <Summery
//                     serviceTitle={serviceTitle}
//                     address={address}
//                     itemSummary={itemSummary}
//                     totalVatRate={totalVatRate}
//                     showInput={showInput}
//                     setShowInput={setShowInput}
//                     liveAddress={liveAddress}
//                     isValid={!isNextDisabled}
//                     open={open}
//                     setOpen={setOpen}
//                 />
//             </div>

//             {/* for mobile & tablet view  */}
//             <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.08)] border-t border-gray-200 z-50">
//                 <div className="flex justify-center px-3 py-2">
//                     <div className="flex items-center gap-4">

//                         {/* View Summary */}
//                         <button
//                             onClick={() => setOpen(true)}
//                             className="cursor-pointer select-none
//                    active:scale-[0.98] transition-transform
//                    focus:outline-none focus:ring-2
//                    focus:ring-blue-500 focus:ring-offset-2
//                    rounded-lg px-1"
//                         >
//                             <p className="text-[10px] text-gray-500 font-medium uppercase">
//                                 View Summary
//                             </p>
//                             <div className="flex items-center gap-1.5 justify-center">
//                                 <img src={dirhum} className="w-3.5 h-3.5" alt="" />
//                                 <span className="text-base font-bold text-gray-900">
//                                     {totalAfterDiscount.toFixed(2)}
//                                 </span>
//                                 <span className="text-gray-400 text-sm">›</span>
//                             </div>
//                         </button>

//                         {/* Next Button (Fixed Width) */}
//                         <div className="w-[140px]">
//                             <NextBtn
//                                 disabled={isNextDisabled}
//                                 onClick={handleNextClick}
//                             />
//                         </div>

//                     </div>
//                 </div>
//             </div>

//             <div className="hidden lg:block">
//                 <NextBtn
//                     disabled={isNextDisabled}
//                     onClick={handleNextClick}
//                 />
//             </div>
//         </div>
//     );
// };
