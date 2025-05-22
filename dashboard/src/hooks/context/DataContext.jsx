import { createContext, useState } from "react";

const DataContext = createContext(null);

const DataProvider = ({children}) => {
    const [data, setData] = useState([]);
    const key = import.meta.env.VITE_APIKEY;
    const url = import.meta.env.VITE_IMAGEURL;

    const searchQuery = async (query) => {
        const response = await fetch(`https://api.themoviedb.org/3/search/multi?query=${query}&api_key=${key}`);
        const data = await response.json();
        setData(data);
        return data;
    }
    
    const fetchResult = async (id, type) => {
        const response = await fetch(`https://api.themoviedb.org/3/${type}/${id}?api_key=${key}&append_to_response=credits,images`);
        const data = await response.json();
        return data;
    }

    return(
        <DataContext.Provider value={{data, searchQuery, fetchResult, url}}>
            {children}
        </DataContext.Provider>
    )
}

export default DataContext;
export {DataProvider};