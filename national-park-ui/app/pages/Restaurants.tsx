import {useState, useEffect} from 'react';
import axios from 'axios';
import Maps from './Maps';

type Meals = {
    city: string,
    cost: string,
    food_type: string,
    name: string,
    rating: number
}

export default function Restaurants() {

    const [restaurants, setRestaurants] = useState([]);
    const nationalPark = "Yosemite National Park"

    useEffect(() => {
        axios.get('http://127.0.0.1:5000/yelp', {
            params: {
                location: nationalPark,
                cost: 3
            }
        })
        .then(response => {
            console.log(response.data)
            setRestaurants(response.data);
        })
        .catch(err => {
            console.error("Error", err);
        })
    }, [])

    return(
        <div>
            {Object.entries(restaurants).map(([mealType, mealItems]) => (
                <div key={mealType}>
                    <h1>{mealType}</h1>
                    {(mealItems[0] as Meals[])?.map((restaurant, index) => (
                        <div>
                            <p>{restaurant.name}</p>
                            <p>{restaurant.city}</p>
                            <p>{restaurant.food_type}</p>
                            <p>{restaurant.cost}</p>
                            <p>{restaurant.cost}</p>

                        </div>

                    ))}
                </div>
            ))}
        </div>
    )
}