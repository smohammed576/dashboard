import { createContext, useState } from "react";

const DataContext = createContext(null);

const DataProvider = ({children}) => {
    const [data, setData] = useState([]);
    const key = import.meta.env.VITE_APIKEY;

    const searchQuery = async (query) => {
        console.log(query)
        const response = await fetch(`https://api.themoviedb.org/3/movie/${query}?api_key=${key}`);
        const data = await response.json();
        setData(data);
        return data;
    }

    return(
        <DataContext.Provider value={{data, searchQuery}}>
            {children}
        </DataContext.Provider>
    )
}

export default DataContext;
export {DataProvider};