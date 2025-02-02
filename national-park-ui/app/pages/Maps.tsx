import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import React, {useState, useEffect} from "react";
import axios from 'axios'

interface map_props{name:string}

const Maps: React.FC<map_props> = ({name}) => {

    const [latitude, setLatitude] = useState(0);
    const [longitude, setLongitude] = useState(0);

    const mapDetail = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json
    ?fields=formatted_address%2Cname%2Crating%2Copening_hours%2Cgeometry
    &input=${name}
    &inputtype=textquery
    &key=${import.meta.env.VITE_GOOGLE_MAPS_KEY}}`;

    useEffect(() => {
        axios.get(mapDetail)
        .then(response => {
            console.log(response.data)
        })
        .catch(err => {
            console.error("Error", err);
        })
    }, []);

    return (
        <div>
                    {/*
            <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY} onLoad={() => console.log("Maps API has loaded.")}>
            <Map 
                center={yosemiteLocation} 
                zoom={10} 
                style={{ width: "100%", height: "800px" }}
            >
                <Marker position={yosemiteLocation} />
            </Map>
        </APIProvider>
        */}
            hello world!</div>

    );
}

export default Maps;
