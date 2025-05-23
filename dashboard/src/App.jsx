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
    setValue('');
    setIndex(0);
    setLoading(false);
  }

  return(
    <>
      <header className="header">
        <form onSubmit={(event) => {event.preventDefault(); sendQuery()}} className="header__search">
          <input type="text" value={value} onChange={(event) => setValue(event.target.value)} placeholder="Search a movie or show..." className="header__search--input" />
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
      {
        loading ? <Loading/> :
        <main className="main">
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
                  <p className="result__text--overview">{data.overview}</p>
                </article>
                {
                  data.seasons ? 
                    <span className="result__seasons">
                        <div className="result__seasons--item" key={index}>
                          <img src={`${url}${data.seasons[index].poster_path}`} alt={data.seasons[index].name} className="result__seasons--item-image" />
                          <article className="result__seasons--item-wrapper">
                            <p className="result__seasons--item-title">{data.seasons[index].name}</p>
                            <p className="result__seasons--item-episodes">{data.seasons[index].episode_count} {data.seasons[index].episode_count == 1 ? 'episode' : 'episodes'}</p>
                          </article>
                          {
                            index > 0 ? 
                              <button onClick={() => setIndex(index - 1)} className="result__seasons--item-button result__seasons--item-left">
                                <i className="fa-solid fa-chevron-left result__seasons--item-icon"/>
                              </button> 
                            : null
                          }
                          {
                            data.seasons.length !== index + 1 ?
                              <button onClick={() => setIndex(index + 1)} className="result__seasons--item-button result__seasons--item-right">
                                <i className="fa-solid fa-chevron-right result__seasons--item-icon"/>
                              </button>
                            : null
                          }
                        </div>
                    </span>
                  : null
                }
              </div>
            </section>
            <section className="cast">
            <span className="cast__heading">Cast</span>
              <ul className="cast__list">
                {
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