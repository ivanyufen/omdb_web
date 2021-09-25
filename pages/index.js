import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'

import styles from '../styles/Home.module.css'
import {Container, Autocomplete, TextField, Button, Box, Backdrop, CircularProgress, List, ListItem, ListItemText, ListItemAvatar, Card, CardContent, Typography, CardActionArea, CardMedia} from '@mui/material';
import React, {useCallback, useEffect, useRef, useState, useLayoutEffect} from 'react';
import debounce from 'lodash.debounce';
import axios from 'axios';


const URL = 'https://www.omdbapi.com';

const Loader = ({isLoading}) => (
  <Backdrop
    sx={{ color: '#fff', zIndex: 99 }}
    open={isLoading}
  >
    <CircularProgress color="inherit" />
</Backdrop>
)

const ImageModal = ({isVisible, url, handleClose}) => (
  <Backdrop
    sx={{ color: '#fff', zIndex: 99 }}
    open={isVisible}
    onClick={handleClose}
  >
  <img src={url} alt={url} />
</Backdrop>
)

export default function Home() {
  const router = useRouter();

  const [keyword, setKeyword] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [movieSuggestions, setMovieSuggestions] = useState([]);
  const [movies, setMovies] = useState({});
  const [page, setPage] = useState(1);
  const [theEnd, setTheEnd] = useState(false);
  const [hasFetch, setHasFetch] = useState(false);
  const [poster, setPoster] = useState({
    isVisible: false,
    url: ''
  });
  const [isLoadingMovies, setIsLoadingMovie] = useState(false);
  const [error, setError] = useState({});
  const inputRef= useRef(null);

  const endOfList = movies && movies.data && Number(movies.total) === Number(movies.totalResults);


   useEffect(() => {
    window.onscroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight) {
        if(movies && movies.data && Number(movies.total) < Number(movies.totalResults)){
          const nextPage = page + 1;
          setPage(nextPage);
          handleSearch(nextPage, true);
        }
      }
    }
  })
  


  const requestMovieSuggestions = useCallback(
    debounce((query) => {
      axios.get(URL, { params: {
        apikey: 'faf7e5bb',
        s: query
      }}).then((res) => {
        if(res.status === 200){
          const { data } = res;
          if(data.Response === "False"){
            return;
          } else {
            setMovieSuggestions(data.Search);
          }
        }
      })
    }, 500),
    []
  );


  useEffect(() => {
    requestMovieSuggestions(keyword);
  }, [keyword, requestMovieSuggestions])
  

  const handleKeywordChange = (e) => {
    setKeyword(e.target.value);
    setError({});
    if(!e.target.value){
      setShowSuggestions(false);
    }
  }

  const handleKeyDown = (e) => {
    if(e && e.keyCode === 13){
      inputRef.current.blur();
      handleSearch(page);
    }
  }

  const handleSearch = (page, isFetchNext = false) => {
    if(keyword !== ''){
      setIsLoadingMovie(true);

      // Search Logic here
      axios.get(URL, { params: {
        apikey: 'faf7e5bb',
        s: keyword,
        page
      }}).then((res) => {
        if(res.status === 200){
          const { data } = res;
          if(data.Response === "False"){
            setMovies({});
            return;
          } else {
            if(isFetchNext){
              setMovies({
                ...movies,
                total: movies.total + data.Search.length,
                data: [...movies.data, ...data.Search]
              })
            } else {
              setMovies({
                total: data.Search.length,
                totalResults : data.totalResults,
                data: data.Search
              })
            }
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsLoadingMovie(false);
        setHasFetch(true);
      })
    } else {
      setError({
        keyword: "Movie title can't be blank"
      })
    }
  }
  const handleOpenPoster = (url) => {
    if(url){
      setPoster({
        isVisible: true,
        url
      })
    }
  }

  const handleClosePoster = (url) => {
    if(url){
      setPoster({
        isVisible: false,
        url: ''
      })
    }
  }

  const handleSeeDetail = (imdbID) => {
    router.push(`/detail/${imdbID}`)
  }

  const renderMovies = () => {
    return (
      <div style={{ height: '90vh', overflowY: 'auto' }}>
        <Typography component="div" m={2} >Showing {movies.total} from {movies.totalResults} results</Typography>
        <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>        
        {
          movies.data.map((movie, index) => {
            return (
              <ListItem key={movie.imdbID}>
                <Card sx={{ width: '100%', display: 'flex'}}>
                  <CardMedia style={{ flex: 1, maxHeight: 160, maxWidth: 140 }} onClick={() => handleOpenPoster(movie.Poster)}
                    component="img"
                    image={movie.Poster !== 'N/A' ? movie.Poster : 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/1200px-No-Image-Placeholder.svg.png'}
                    alt={movie.Title}
                  />
                  <CardContent style={{ flex: 1, position: 'relative'}}>
                    <Typography gutterBottom variant="body1" component="div">
                      {movie.Title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {movie.Year}
                    </Typography>
                    <Button onClick={() => handleSeeDetail(movie.imdbID)} variant="text" style={{ position: 'absolute', bottom: 5, width: '100%' }}>See Detail</Button>
                  </CardContent>
              </Card>
              </ListItem>
            )
          })
        }
        </List>
        {endOfList && <p>You have load all the data.</p>}
      </div>
    )
  }

  return (
    <Container fixed>
      <Head>
        <title>OMDB by Ivan</title>
        <meta name="description" content="Your only movie database" />
        <link rel="icon" href="/favicon.ico" />
        <link
            rel="preload"
            href="/fonts/Rubik-Regular.ttf"
            as="font"
            crossOrigin=""
          />
      </Head>

      <main>

        {/* Input and Search button */}
        <Box style={{ position: 'sticky', top: 0, background: '#FFF', zIndex: 99 }} p={1}>
          <h1>OMDB Movie Database</h1>
          <TextField 
          type="search"
          inputRef={inputRef} 
          onKeyDown={handleKeyDown} 
          fullWidth 
          value={keyword} 
          onChange={handleKeywordChange} 
          label="Search by Movie Title"
          error={!!error.keyword}
          helperText={error.keyword}
          />
          <Box mt={2}>
            <Button fullWidth variant="contained" onClick={() => handleSearch(page)}>Search</Button>
          </Box>
        </Box>

        {/* Movie List */}
        <Box>
          {Object.keys(movies).length > 0
          ? renderMovies()
          : hasFetch 
            ? <div>No movies found. Try to change your keyword.</div>
            : null
          }
        </Box>


        {/* <Autocomplete
          open={showSuggestions}
          onOpen={() => {
            if(keyword){
              setShowSuggestions(true);
            }
          }}
          autoComplete
          getOptionLabel={(option) => option.Title}
          options={movieSuggestions}
          filterOptions={(x) => x}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} value={keyword} onChange={handleKeywordChange} label="Search by Movie Title" />}
        /> */}

      {/* Modal and Loader */}
      <Loader isLoading={isLoadingMovies} />
      <ImageModal isVisible={poster.isVisible} url={poster.url} handleClose={handleClosePoster} />

      </main>
    </Container>
  )
}
