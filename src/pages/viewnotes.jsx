import { useEffect, useState, useContext } from 'react'
import { serverTimestamp, increment, where, getDocs, query, collectionGroup, addDoc, collection, doc, updateDoc } from "firebase/firestore";

import { db } from '../firebase';
import { UserContext } from '../contexts/usercontext';
import Editor from './editor'
import dayjs from 'dayjs';
// import relativeTime plugin
import relativeTime from "dayjs/plugin/relativeTime"; 

// extend dayjs with relativeTime plugin
dayjs.extend(relativeTime); 

import PropTypes from 'prop-types';
import Grid from '@mui/material/Unstable_Grid2';
import CloseIcon from '@mui/icons-material/Close'
import {
    Dialog, 
    Paper, 
    Avatar, 
    DialogContent,
    Button,
    Typography,
    IconButton,
    DialogTitle } from '@mui/material'
    


/* const DialogTitle = ((props) => {
    const { children, onClose, ...other } = props;
    return (
        <MuiDialogTitle sx={{minWidth:220}} {...other}>
            <div><Typography variant="h6">{children}</Typography></div>
            {onClose ? (
                <IconButton aria-label="close" sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: '#9e9e9e'
                }} onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            ) : null}
        </MuiDialogTitle>
    );
}); */

const CloseDialogTitle = ((props) => {
    const { children, onClose, ...other } = props;
    return (
        <DialogTitle sx={{minWidth:220}} {...other}>
            <div><Typography variant="h6">{children}</Typography></div>
            {onClose ? (
                <IconButton aria-label="close" sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: '#9e9e9e'
                }} onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            ) : null}
        </DialogTitle>
    );
});

// DialogTitle propTypes

CloseDialogTitle.propTypes = {
    children: PropTypes.any,
    onClose: PropTypes.func,
}

// ViewNotes propTypes and component

ViewNotes.propTypes = {
    note: PropTypes.object,
    handleViewClose: PropTypes.func,
    viewOpen: PropTypes.bool
}

export default function ViewNotes({note, handleViewClose, viewOpen }) {
    
    const noteId = note.id
    const studentId = note.uid
    const created = note.createdAt

    const { currentUser, avatar } = useContext(UserContext)


    const [ comments, setComments ] = useState([])
    const [ commentBody, setCommentBody ] = useState("")
    const [ commentRt, setCommentRt ] = useState("")

    useEffect(() => {
        
        if(noteId && studentId){
            getDocs(query(collectionGroup(db,"comments")
            ,where("studentId", "==", studentId)
            ,where("noteId","==",noteId)))
            .then((querySnapshot) => {
                const commentsData = [];
                querySnapshot.forEach((commentDoc) => {
                    commentsData.push({ ...commentDoc.data(), id: commentDoc.id })
                    console.log("comment doc id is "+commentDoc.id)
                })
                setComments(commentsData)
            })
            .catch((error) => {
                alert('something wrong while looking for comments')
                console.log(error)
            })
        }

    }, [noteId, studentId]);
    
    const handleSubmitComment = (event) => {
        event.preventDefault();

        const newComment = {
            body: commentBody,
            createdAt: new Date().toISOString(),
            timestamp: serverTimestamp(),
            uid: currentUser.uid,
            author: currentUser.displayName,
            avatar: avatar,
            rt: commentRt,
            studentId: studentId,
            noteId: noteId
        }
        addDoc(collection(db,'users',studentId,'notes',noteId,'comments'),newComment)
        .then(()=>{
            console.log("New comment added to db")
            handleViewClose()
            setCommentRt("")
        })
        .then(() => {
            let noteRef = doc(db,'users',studentId,'notes',noteId)
            updateDoc(noteRef,({ commentNum: increment(1)}))
        })
        .catch((error) => {
            handleViewClose()
            console.error(error);
            alert('Something went wrong' );
        });
    }


    return (
    <Dialog
        onClose={handleViewClose}
        fullScreen
        aria-labelledby="customized-dialog-title"
        open={viewOpen}
        classes={{ paperFullWidth: {maxWidth: '100%'} }}
    >
        <Paper   elevation={2}
            sx={{
                padding: 2,
                backgroundColor: "#e0e0e0",
                border: "1px solid black",
                margin: "8px 8px 8px 8px"
            }}>
            <Grid container >
                <Grid xs={1}>
                    <Avatar aria-label="recipe" sx={{
                        height: 55,
                        width: 50,
                        flexShrink: 0,
                        flexGrow: 0,
                        marginTop: 2}}
                        src={avatar} />
                </Grid>
                <Grid xs={11}>
                    <DialogTitle id="customized-dialog-title" onClose={handleViewClose}>
                    {note.title}
                    </DialogTitle>
                    <div>{dayjs(created).fromNow() +" by "+note.author}</div>
                </Grid>
                <Grid >
                    <DialogContent>
                        <div dangerouslySetInnerHTML={{__html:note.rt}}/>
                    </DialogContent>
                </Grid>
            </Grid>
        </Paper>


        {comments && comments.length > 0 && 
          <div>
              {comments.map((comment) => (
                <Grid container key={comment.id}>
                    <Grid xs={1}>
                    <Avatar aria-label="recipe" sx={{
                        height: 55,
                        width: 50,
                        flexShrink: 0,
                        flexGrow: 0,
                        marginTop: 2,
                        m:1
                    }} src={comment.avatar} />
                    </Grid>
                    <Grid xs={11}>
                        <Paper>
                        {dayjs(comment.createdAt).fromNow()+" by "+comment.author}
                            <DialogContent>
                                <div dangerouslySetInnerHTML={{__html:comment.rt}}/>
                            </DialogContent>
                        </Paper>

                    </Grid>
                    <hr/>
                </Grid>
              ))}
          </div>
        }
        <Grid xs={12} sm={6} m={1}>
            <Editor initText={commentRt} setRt={rt => setCommentRt(rt)} setBody={body => setCommentBody(body)}/>
        </Grid>

        <Grid xs={12} sm={6} m={1}>
            <Button variant="contained" onClick={handleSubmitComment}>Add Comment</Button>
        </Grid>

    </Dialog>
    )
}
