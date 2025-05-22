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

  const sendQuery = async () => {
    const response = await searchQuery(value);
    setResults(response.results);
    setSearch(true);
  }
  const getResult = async (id) => {
    const response = await fetchResult(id);
    setData(response);
    setSearch(false);
    setDirector(response.credits.crew.find((item) => item.job === "Director"))
    setValue('');
    setLoading(false);
  }

  return(
    <>
      <header className="header">
        <form onSubmit={(event) => {event.preventDefault(); sendQuery()}} className="header__search">
          <input type="text" value={value} onChange={(event) => setValue(event.target.value)} className="header__search--input" />
        </form>
        {
          search ?
          <ul className="header__results">
            {
              results.map((item, index) => 
                <li className="header__results--item" key={index}>
                  <button onClick={() => getResult(item.id)} className="header__results--item-button">
                    <img src={`${url}${item.poster_path}`} alt={item.title} className="header__results--item-image" />
                    <article className="header__results--item-wrapper">
                      <p className="header__results--item-title">{item.title}</p>
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
                <img src={`${url}${data.poster_path}`} alt={data.title} className="result__figure--image" />
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
                  <figure className="result__heading--title">{data.title}</figure>
                  <figure className="result__heading--directed">Directed by {director.name}</figure>
                </article>
                <article className="result__text">
                  <p className="result__text--tagline">{data.tagline}</p>
                  <p className="result__text--overview">{data.overview}</p>
                </article>
              </div>
            </section>
            <section className="cast">
              <ul className="cast__list">
                {
                  data.credits.cast.map((item, index) => 
                    <li className="cast__item" key={index}>
                      <img src={`${url}${item.profile_path}`} alt={item.name} className="cast__item--image" />
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
            {data.images.backdrops.map((item, index) => <img src={`${url}${item.file_path}`} alt={data.title} className="images__item" key={index} />)}
          </section>
        </main>
      }
    </>
  )
}

export default App;