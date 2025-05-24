import { useContext, useState } from "react";
import DataContext from "../../hooks/context/DataContext";

function Header(){
  const {searchQuery, url, fetchResult} = useContext(DataContext);
  const [value, setValue] = useState('');
  const [search, setSearch] = useState(false);
  const [results, setResults] = useState([]);

  
  const sendQuery = async () => {
    const response = await searchQuery(value);
    setResults(response.results.filter((item) => item.media_type !== "person"));
    setSearch(true);
  }

  const getResult = async (id, type) => {
    const response = await fetchResult(id, type);
    // setData(response);
    // setSearch(false);
    // if(type === "movie"){
    //   setDirector(response.credits.crew.find((item) => item.job === "Director"))
    // }
    setValue('');
  }
    
  return(
      <header className="header">
      <form onSubmit={(event) => {event.preventDefault(); sendQuery()}} className="header__search">
        <input type="text" value={value} onChange={(event) => setValue(event.target.value)} placeholder="Search a movie or show..." className={`header__search--input ${search ? 'header__search--input-open' : null}`} />
      </form>
      {
        search ?
        <ul className="header__results">
          {
            results.map((item, index) => 
              <li className="header__results--item" key={index}>
                <button onClick={() => getResult(item.id, item.media_type)} className="header__results--item-button">
                  {
                    item.poster_path ? <img src={`${url}${item.poster_path}`} alt={item.media_type === "movie" && item.title || item.media_type === "tv" && item.name} className="header__results--item-image" />
                    : <figure className="header__results--item-placeholder"></figure>
                  }
                  <article className="header__results--item-wrapper">
                    <p className="header__results--item-title">{item.media_type === "movie" && item.title || item.media_type === "tv" && item.name}</p>
                  </article>
                </button>
              </li>
            )
          }
        </ul>
        : null
      }
    </header>
  )
}

export default Header;