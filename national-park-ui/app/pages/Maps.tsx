import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import React from "react";
import { createRoot } from "react-dom/client";

export default function Maps() {
    const yosemiteLocation = { lat: 37.8651, lng: -119.5383 }; // Yosemite National Park coordinates

    return (
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY} onLoad={() => console.log("Maps API has loaded.")}>
            <Map 
                center={yosemiteLocation} 
                zoom={10} 
                style={{ width: "100%", height: "800px" }}
            >
                <Marker position={yosemiteLocation} />
            </Map>
        </APIProvider>
    );
}
