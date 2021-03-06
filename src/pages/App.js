import React, {useState} from "react";
import {Query} from 'react-apollo';
import {gql} from 'apollo-boost';
import withStyles from "@material-ui/core/styles/withStyles";

import SearchTracks from '../components/Track/SearchTracks';
import CreateTrack from '../components/Track/CreateTrack';
import TrackList from '../components/Track/TrackList';
import Loading from '../components/Shared/Loading';
import Error from '../components/Shared/Error';
import { exact } from "prop-types";

const App = ({ classes }) => {
  const [searchResult, setSearchResult] = useState([]);

  return (
    <div className={classes.container}>
      <SearchTracks setSearchResult={setSearchResult}/>
      <CreateTrack />
      
      <Query query={GET_TRACKS_QUERY}>
        {({data, loading, error}) => {
          if (loading) return <Loading />;
          if (error) return <Error error={error} />; 
          const tracks = searchResult.length > 0 ? searchResult : data.tracks;
          
          return <TrackList tracks={tracks} />
        }}
      </Query>
    </div>
  )
};

export const GET_TRACKS_QUERY = gql`
  query getTracksQuery {
    tracks {
      id
      title
      description
      url
      likes {
        id
      }
      postedBy {
        id
        username
      }
    }
  }
`;

const styles = theme => ({
  container: {
    margin: "0 auto",
    maxWidth: 960,
    padding: theme.spacing.unit * 2
  }
});

export default withStyles(styles)(App);
