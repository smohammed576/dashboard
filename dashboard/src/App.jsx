import { useContext, useState } from "react";
import DataContext from "./hooks/context/DataContext";
import Loading from "./Components/Loading/Loading";

function App(){
  const {searchQuery, url, fetchResult} = useContext(DataContext);
  const [value, setValue] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(false);
  const [results, setResults] = useState([]);
  const [director, setDirector] = useState('');
  const [index, setIndex] = useState(0);
  const [type, setType] = useState('');
  const [list, setList] = useState(true);

  const sendQuery = async () => {
    const response = await searchQuery(value);
    setResults(response.results.filter((item) => item.media_type !== "person"));
    setSearch(true);
  }
  const getResult = async (id, type) => {
    const response = await fetchResult(id, type);
    setData(response);
    setSearch(false);
    if(type === "movie"){
      setDirector(response.credits.crew.find((item) => item.job === "Director"))
    }
    else{
      setDirector('');
    }
    setType(type);
    setValue('');
    setIndex(0);
    setLoading(false);
  }

  return(
    <>
      <header onClick={() => search ? setSearch(false) : null} className="header">
        <nav className="header__navigation">
          <form onSubmit={(event) => {event.preventDefault(); sendQuery()}} className="header__search">
            <input style={search ? {borderRadius: 0} : null} type="text" value={value} onChange={(event) => setValue(event.target.value)} placeholder="Search a movie or show..." className="header__search--input" />
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
                        <p className="header__results--item-type">{item.media_type}</p>
                      </article>
                    </button>
                  </li>
                )
              }
            </ul>
            : null
          }
        </nav>
      </header>
      {
        loading ? <Loading/> :
        <main onClick={() => search ? setSearch(false) : null} className="main">
          <span className="wrapper">
            <section className="result">
              <figure className="result__figure">
                <img src={`${url}${data.poster_path}`} alt={data.title ? data.title : data.name} className="result__figure--image" />
                <article className="result__figure--rating">
                  <span className="result__figure--rating-wrapper">
                    {
                      Array.from({length: Math.floor(data.vote_average) / 2}, (_,index) => <i className="fa-solid fa-star result__figure--rating-star" key={index}/> )
                    }
                    {Number.isInteger(Math.floor(data.vote_average) / 2) ? null : <i className="fa-solid fa-star-half result__figure--rating-star"/>}
                  </span>
                  <p className="result__figure--rating-raters">out of {data.vote_count}</p>
                </article>
              </figure>
              <div className="result__wrapper">
                <article className="result__heading">
                  <h2 className="result__heading--title">{data.title ? data.title : data.name}</h2>
                  {
                    director == '' ?  
                    <span className="result__heading--created">
                      <h3 className="result__heading--created-text">Created by</h3>
                      {
                        data.created_by.map((item, index) => 
                          <h3 className="result__heading--created-item" key={index}>{item.name}{index + 1 == data.created_by.length ? null : ','}</h3>
                        )
                      }
                    </span> : <h3 className="result__heading--directed">Directed by {director.name}</h3>
                  }
                </article>
                <article className="result__text">
                  <p className="result__text--tagline">{data.tagline}</p>
                  <p className="result__text--overview">{data.overview.length > 830 ? `${data.overview.slice(0, 330)}...` : data.overview}</p>
                </article>
                <article className="result__info">
                  <span className="result__info--wrapper">
                    {
                      type === 'movie' && <p className="result__info--runtime">{data.runtime} min</p>
                    }
                    <span className="result__info--links">
                      <a href={`https://www.imdb.com/title/${data.external_ids.imdb_id}/?ref_=fn_all_ttl_1`} target="_blank" className="result__info--links-item">IMDB</a>
                      <a href={`https://www.themoviedb.org/${director == '' ? 'tv' : 'movie'}/${data.id}`} target="_blank" className="result__info--links-item">TMDB</a>
                    </span>
                  </span>
                  <span className="result__info--genres">
                    {
                      data.genres.map((item, index) => <p className="result__info--genres-item" key={index}>{item.name}</p> )
                    }
                  </span>
                </article>
              </div>
            </section>
            <section className="cast">
            <span className="cast__heading">
              <button onClick={() => setList(true)} className={`cast__heading--button ${list ? 'cast__heading--button-active' : null}`}>Cast</button>
              {
                type === 'tv' && <button onClick={() => setList(false)} className={`cast__heading--button ${list ? null : 'cast__heading--button-active'}`}>Seasons</button>
              }
            </span>
              <ul className="cast__list">
                {
                  list ? 
                  data.credits.cast.map((item, index) => 
                    <li className="cast__item" key={index}>
                      {
                        item.profile_path ? <img src={`${url}${item.profile_path}`} alt={item.name} className="cast__item--image" /> 
                        : <figure className="cast__item--placeholder"></figure>
                      }
                      <article className="cast__item--wrapper">
                        <p className="cast__item--name">{data.credits.cast[index].name}</p>
                        <p className="cast__item--character">{data.credits.cast[index].character}</p>
                      </article>
                    </li>
                  ) :
                  data.seasons.map((item, index) => 
                    <li className="seasons__item" key={index}>
                      <img src={`${url}${item.poster_path}`} alt={item.name} className="seasons__item--image" />
                      <article className="seasons__item--wrapper">
                        <p className="seasons__item--name">{item.name}</p>
                        <p className="seasons__item--episodes">{`${item.episode_count} ${item.episode_count == 1 ? 'episode' : 'episodes'}`}</p>
                      </article>
                    </li>
                  )
                }
              </ul>
            </section>
          </span>
          <section className="images">
            {data.images.backdrops.map((item, index) => <img src={`${url}${item.file_path}`} alt={data.title ? data.title : data.name} className="images__item" key={index} />)}
          </section>
        </main>
      }
    </>
  );
}

export default App;