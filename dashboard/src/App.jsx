import { useContext, useState } from "react";
import DataContext from "./hooks/context/DataContext";
import Loading from "./Components/Loading/Loading";

function App(){
  const {searchQuery} = useContext(DataContext);
  const [value, setValue] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const sendQuery = async () => {
    const response = await searchQuery(value);
    setData(response);
    console.log(response)
    setLoading(false);
  }

  return(
    <>
      <header className="header">
        <form onSubmit={(event) => {event.preventDefault(); sendQuery()}} className="header__search">
          <input type="text" value={value} onChange={(event) => setValue(event.target.value)} className="header__search--input" />
        </form>
      </header>
      <main className="main">
        <span className="wrapper">
          <section className="result">
            <figure className="result__figure">
              <figure className="result__figure--image">a</figure>
              <span className="result__figure--rating">
                {
                  Array.from({length: 5}, (_,index) => <i className="fa-solid fa-star result__figure--rating-star" key={index}/> )
                }
                <p className="result__figure--rating-raters">out of 3928</p>
              </span>
            </figure>
            <div className="result__wrapper">
              <article className="result__heading">
                <figure className="result__heading--title">a</figure>
                <figure className="result__heading--directed">a</figure>
              </article>
              <article className="result__text">
                <figure className="result__text--tagline">a</figure>
                {
                  Array.from({length: 6}, (_,index) => <figure className="result__text--overview" key={index}>{index}</figure> )
                }
              </article>
            </div>
          </section>
          <section className="cast">
            <ul className="cast__list">
              {
                Array.from({length: 5}, (_,index) => 
                  <li className="cast__item" key={index}>
                    <figure className="cast__item--image">{index}</figure>
                    <article className="cast__item--wrapper">
                      <p className="cast__item--name">Firstname Lastname</p>
                      <p className="cast__item--character">Character name</p>
                    </article>
                  </li>
                )
              }
            </ul>
          </section>
        </span>
        <section className="images">
          {
            Array.from({length: 5}, (_,index) => <figure className="images__item" key={index}>{index}</figure> )
          }
        </section>
      </main>
    </>
  )
}

export default App;