import React, {useState, useRef} from "react";
import {gql} from 'apollo-boost';
import { ApolloConsumer } from 'react-apollo';
import withStyles from "@material-ui/core/styles/withStyles";
import TextField from "@material-ui/core/TextField";
import ClearIcon from "@material-ui/icons/Clear";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";

const SearchTracks = ({ classes, setSearchResult }) => {
  const [search, setSearch] = useState("");
  
  const inputEl = useRef();

  const clearSearchInput = () => {
    setSearchResult([]);
    setSearch("");
    inputEl.current.focus();
  };

  const handleSubmit = async (event, client) => {
    event.preventDefault();
    const res = await client.query({
      query: SEARCH_TRACKS_QUERY,
      variables: { search }
    });
    setSearchResult(res.data.tracks);
  };

  return (
    <ApolloConsumer>
      {(client) => (
        <form onSubmit={event => handleSubmit(event, client)}>
          <Paper className={classes.root} elevation={1}>
            <IconButton>
              <ClearIcon onClick={clearSearchInput}/>
            </IconButton>
            <TextField
              fullWidth
              placeholder="Search tracks"
              InputProps={{
                disableUnderline: true
              }} 
              onChange={event => setSearch(event.target.value)} 
              value={search} 
              inputRef={inputEl} />
            <IconButton type="submit">
              <SearchIcon />
            </IconButton>
          </Paper>
        </form>
      )}
    </ApolloConsumer>
  )
};

const SEARCH_TRACKS_QUERY = gql`
  query($search: String) {
    tracks(search: $search) {
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
  root: {
    padding: "2px 4px",
    margin: theme.spacing.unit,
    display: "flex",
    alignItems: "center"
  }
});

export default withStyles(styles)(SearchTracks);
