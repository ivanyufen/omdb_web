import {Container, Autocomplete, TextField, Button, Box, Backdrop, CircularProgress, List, ListItem, ListItemText, ListItemAvatar, Card, CardContent, Typography, CardActionArea, CardMedia} from '@mui/material';
import React from 'react';
import axios from 'axios';
import { ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/router'

const URL = 'https://www.omdbapi.com';

export default function Detail({ data }) {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  }

  if(!data || data?.Response === "False"){
    return (
    <div style={{ textAlign: 'center', padding: 20 }}>
      Movies not found :(
      <Box m={2}>
        <Button onClick={() => router.replace('/')} variant="outlined">Find another movie?</Button>
      </Box>
    </div>
    )
  }

  console.log(data)

  return (
    <Container fixed style={{ textAlign: 'center', padding: 0 }}>

      <Box p={2} mb={2} style={{ background: '#000', color: '#FFF', position: 'relative' }}>
        <ArrowBack onClick={handleGoBack} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 5 }} />
        <div>{data.Title}</div>
      </Box>

      <Box>
        <img src={data.Poster} alt={data.Title} />
      </Box>
      
      <Box style={{ width: 300, margin: '2em auto' }}>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', textAlign: 'left' }}>
          <div style={{ flex: 1 }}>Genre</div>
          <div style={{ flex: 1 }}>: {data.Genre}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', textAlign: 'left' }}>
          <div style={{ flex: 1 }}>Director</div>
          <div style={{ flex: 1 }}>: {data.Director}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', textAlign: 'left' }}>
          <div style={{ flex: 1 }}>Rating</div>
          <div style={{ flex: 1 }}>: {data.imdbRating}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', textAlign: 'left' }}>
          <div style={{ flex: 1 }}>Year</div>
          <div style={{ flex: 1 }}>: {data.Year}</div>
        </div>
      </Box>
    </Container>
  )
}

Detail.getInitialProps = async (ctx) => {
  const imdbId = ctx.query.id;
  const res = await axios.get(URL, { params: {
    apikey: 'faf7e5bb',
    i: imdbId
  }})

  if(res.status === 200){
    return {
      data: res.data
    }
  }

  return { data: null }
}
