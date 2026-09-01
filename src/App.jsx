import { useEffect, useState } from "react"
import Search from "./components/Search"
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import { useDebounce } from "react-use";
import { updateSearchCount } from "./appwrite";

const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`,
  }
}

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);


  const fetchmovies = async (query= '') => {
    setLoading(true);
    setErrorMessage('');

    if (!API_KEY) {
      setErrorMessage('TMDB API Key is missing. Please add VITE_TMDB_API_KEY to your .env file.');
      setLoading(false);
      return;
    }

    try {
      const endpoint = query 
      ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      :`${API_BASE_URL}/discover/movie?sort_by=popularity.desc`

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      if(data.success === false) {
        setErrorMessage(data.status_message || 'Failed to fetch movies');
        setMovieList([]);
        return;
      }
      setMovieList(data.results || []);

      if(query && data.results.length > 0) {
        const movie = data.results[0];
        updateSearchCount(query, movie);
      }

    } catch (error) {
      console.error('Error fetching movies:', error);
      setErrorMessage('Failed to fetch movies. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchmovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);
  
  return (
    <main>
      <div className='pattern' />
      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero-banner" />
          <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy Without the Hassle</h1>
        
        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        <section className="all-movies">
          <h2 className="mt-[40px]">All Movies</h2>

          {loading ? (
            <Spinner />
          ) : errorMessage ? (
            <div className="bg-red-500/10 border border-red-500/50 p-5 rounded-xl text-center">
              <p className="text-red-400 font-medium">{errorMessage}</p>
            </div>
          ) : movieList.length === 0 ? (
            <div className="text-center py-10 mt-10 text-gray-100 bg-dark-100/50 rounded-2xl border border-light-100/10">
              <p className="text-xl font-medium mb-2">No movies found</p>
              <p className="text-sm">Try adjusting your search to find what you're looking for.</p>
            </div>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie}/>
              ))}
            </ul>
          )}
        </section>

        </div>
    </main>
  )
}

export default App