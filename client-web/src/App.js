import React, {useEffect, useState} from 'react';
import './App.css';
import {useSelector} from "react-redux";
import {useFirestoreConnect} from "react-redux-firebase";
import {HorizontalGridLines, LineSeries, MarkSeries, VerticalGridLines, XAxis, XYPlot, YAxis} from "react-vis";
import {Card, CardContent, CardMedia, Chip, Grid, Typography} from "@material-ui/core";

function App() {

  const [datas, setDatas] = useState([])
  // useFirestoreConnect(() => [{collection: "sensors/5190/samples", storeAs: "samples", where:['date', '<', Date.now()], }])
  useFirestoreConnect(() => [{
    collection: "sensors/0013a20041a72961/samples",
    storeAs: "samples",
    // limit: 10,
    // orderBy: ["date", "desc"]
    // where: ['date', '>', Date.now()- (1000 * 60*10)]
  }])
  const samples = useSelector((state) => state.firestore.ordered.samples)

  useEffect(() => {
    console.log(samples?.length)
    if (samples)
      {
        const slice = samples
          .map((sample) => ({x: sample?.date, y: sample?.value.toString()}))
          .slice(samples?.length - 50, samples?.length - 1);
        console.log(slice)
        setDatas(slice)
      }
  }, [samples])

  const isEmpty = datas?.pop()?.y <= 100;
  const currentImage = isEmpty ?
    'https://i.pinimg.com/originals/71/b5/9d/71b59de71b5d34b464d8838bf7be70f1.jpg' :
    'https://www.drronsanimalhospitalsimivalley.com/wp-content/uploads/2018/11/Happy-Cat-Eating-Food.jpg'
  return (
    <div className="App">

      <header className="App-header">
        <p style={{
          backgroundColor: 'rgba(255,255,255,0.5)',
          color: "deeppink",
          padding: 50,
          borderRadius: 20,
        }}>Ma Gamelle Connectée


        </p>
        {isEmpty ?
          <Chip label={'Bowl is empty'} color={"secondary"}/> :
          <Chip label={'Bowl is full'} color={"primary"}/>}
      </header>
      <Grid
        container
        direction="row"
        justify="center"
        alignItems="flex-start"
      >
        <Card style={{width: 500, margin: 20}}>
          <CardMedia
            style={{width: "100%", height: 250}}
            image={currentImage}
            title="Contemplative Rephttps://www.drronsanimalhospitalsimivalley.com/wp-content/uploads/2018/11/Happy-Cat-Eating-Food.jpgtile"
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              Live measure
            </Typography>
            <XYPlot height={300} width={500} xType="time"
                    yDomain={[0, 1024]}
            >

              <VerticalGridLines/>
              <HorizontalGridLines/>
              <XAxis/>
              <YAxis/>
              <MarkSeries data={datas}/>

            </XYPlot>
          </CardContent>
        </Card>
        <Card style={{width: 500, margin: 20}}>

          <XYPlot height={300} width={500}
                  stroke="#f70"
                  style={{strokeWidth: 5}}>
            {/*<LineMarkSeries data={datas} color={"red"}/>*/}
            <LineSeries data={datas} color="#ba4fb9" style={{fill: "none"}}/>
          </XYPlot>
        </Card>
      </Grid>
    </div>
  );
}

export default App;
