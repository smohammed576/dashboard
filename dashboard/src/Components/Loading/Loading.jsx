function Loading(){
    return(
        <main className="main">
          <span className="wrapper">
            <section className="result">
              <figure className="result__figure">
                <figure className="result__figure--image-loading"></figure>
                <span className="result__figure--rating">
                  <figure className="result__figure--rating-loading"></figure>
                </span>
              </figure>
              <div className="result__wrapper">
                <article className="result__heading">
                  <figure className="result__heading--title-loading"></figure>
                  <figure className="result__heading--directed-loading"></figure>
                </article>
                <article className="result__text">
                  <figure className="result__text--tagline-loading"></figure>
                  <div className="result__text--wrapper">
                    {
                      Array.from({length: 6}, (_,index) => <figure className="result__text--wrapper-loading" key={index}></figure> )
                    }
                  </div>
                </article>
              </div>
            </section>
            <section className="cast">
              <ul className="cast__list">
                {
                  Array.from({length: 10}, (_,index) => 
                    <li className="cast__item" key={index}>
                      <figure className="cast__item--image-loading"></figure>
                      <article className="cast__item--wrapper">
                        <figure className="cast__item--name-loading"></figure>
                        <figure className="cast__item--character-loading"></figure>
                      </article>
                    </li>
                  )
                }
              </ul>
            </section>
          </span>
          <section className="images">
            {
              Array.from({length: 10}, (_,index) => <figure className="images__item--loading" key={index}></figure> )
            }
          </section>
        </main>
    );
}

export default Loading;