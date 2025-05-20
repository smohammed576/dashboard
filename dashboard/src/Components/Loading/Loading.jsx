import { useContext, useState } from "react";
import DataContext from "../../hooks/context/DataContext";

function Loading(){
  const {searchQuery} = useContext(DataContext);
  const [value, setValue] = useState('');
  const [data, setData] = useState([]);

  const sendQuery = async (event) => {
    event.preventDefault();
    const response = await searchQuery(value);
    setData(response);
  }
    return(
        <section className="loading">
            <form onSubmit={(event) => sendQuery(event)} className="search">
                <input type="text" value={value} onChange={(event) => setValue(event.target.value)} className="search__input" />
            </form>
        </section>
    )
}

export default Loading;