import React, {useState} from "react";
import {gql} from 'apollo-boost';
import {Mutation} from 'react-apollo';
import axios from 'axios';
import withStyles from "@material-ui/core/styles/withStyles";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";

import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import AddIcon from "@material-ui/icons/Add";
import ClearIcon from "@material-ui/icons/Clear";
import LibraryMusicIcon from "@material-ui/icons/LibraryMusic";

import {GET_TRACKS_QUERY} from '../../pages/App';
import Error from "../Shared/Error";

const CreateTrack = ({ classes }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fileError, setFileError] = useState("");
  
  const handleAudioChange = event => {
    const selectedFile = event.target.files[0];
    const fileSizeLimit = 10000000 // 10mb
    if ( selectedFile && selectedFile.size > fileSizeLimit) {
      setFileError(`${selectedFile.name} size too large`);
    } else {
      setFile(selectedFile);
    }
  };

  const handleAudioUploader = async () => {
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("resource_type", "raw");
      data.append("upload_preset", "react-tracks");
      data.append("cloud_name", "codeartistry");
      data.append("resource_type", "raw");
      const res = await axios.post("https://api.cloudinary.com/v1_1/codeartistry/raw/upload", data);
      return res.data.url;
    } catch(err) {
      console.log('Error uploading file', err);
      setSubmitting(false);
    }
  };

  const handleSubmit = async (event, createTrack) => {
    event.preventDefault();
    setSubmitting(true);
    const updateUrl = await handleAudioUploader();
    createTrack({variables: { title, description, url: updateUrl }});
  };

  const handleUpdateCache = (cache, {data: {createTrack}}) => {
    const data = cache.readQuery({query: GET_TRACKS_QUERY});
    const tracks = data.tracks.push(createTrack.track);
    cache.writeQuery({query: GET_TRACKS_QUERY, data: { tracks }});
  };
 
  return (
    <div>
      <Button
        variant="fab"
        className={classes.fab}
        color="secondary"
        onClick={() => setOpen(true)}>
          { open ? <ClearIcon /> : <AddIcon /> }
      </Button>
      <Mutation 
        mutation={CREATE_TRACK_MUTATION}
        onCompleted={data => {
          setOpen(false);
          setSubmitting(false);
          setTitle("");
          setDescription("");
        }}
        update={handleUpdateCache}>
        {(createTrack, {loading, error}) => {
          if (error) return <Error />;

          return (
            <Dialog open={open} className={classes.dialog}>
              <form
                onSubmit={event => handleSubmit(event, createTrack)}>
                <DialogTitle>Create Dialog</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Add a title, description and audiofile
                  </DialogContentText>
                  <FormControl fullWidth>
                  <TextField
                    label="Title"
                    placeholder="Add title"
                    className={classes.textField} 
                    value={title}
                    onChange={event => setTitle(event.target.value)} />
                  </FormControl>
                  <FormControl fullWidth>
                    <TextField
                      label="Description"
                      placeholder="Add Description"
                      className={classes.textField} 
                      value={description}
                      onChange={event => setDescription(event.target.value)}/>
                  </FormControl>
                  <FormControl error={Boolean(fileError)}>
                    <input 
                      id="audio"
                      type="file"
                      accept="audio/mp3,audio/wav"
                      className={classes.input}
                      required
                      onChange={handleAudioChange}/>
                    <label htmlFor="audio">
                        <Button 
                          variant="outlined" 
                          color={file ? "secondary" : "inherit"}
                          component="span"
                          className={classes.button}>
                            Audio File
                            <LibraryMusicIcon className={classes.icon}/>
                        </Button>
                        {file && file.name}
                        <FormHelperText>{ fileError }</FormHelperText>
                    </label>
                  </FormControl>
                </DialogContent>
                <DialogActions>
                  <Button
                    disabled={submitting}
                    className={classes.cancel}
                    onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    disabled={submitting && !title.trim() && !description.trim() && !file}
                    type="submit"
                    className={classes.save}>
                    {submitting ? (
                      <CircularProgress 
                        className={classes.save}
                        size={24} />
                    ) : (
                      "Add Track"
                    )}
                  </Button>
                </DialogActions>
              </form>
            </Dialog>
          )
        }}
      </Mutation>
    </div>
  )
};

const CREATE_TRACK_MUTATION = gql`
  mutation($title: String!, $description: String!, $url: String!) {
    createTrack(title: $title, description: $description, url: $url) {
      track {
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
  }
`;

const styles = theme => ({
  container: {
    display: "flex",
    flexWrap: "wrap"
  },
  dialog: {
    margin: "0 auto",
    maxWidth: 550
  },
  textField: {
    margin: theme.spacing.unit
  },
  cancel: {
    color: "red"
  },
  save: {
    color: "green"
  },
  button: {
    margin: theme.spacing.unit * 2
  },
  icon: {
    marginLeft: theme.spacing.unit
  },
  input: {
    display: "none"
  },
  fab: {
    position: "fixed",
    bottom: theme.spacing.unit * 2,
    right: theme.spacing.unit * 2,
    zIndex: "200"
  }
});

export default withStyles(styles)(CreateTrack);
