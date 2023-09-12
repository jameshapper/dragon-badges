import { useContext, useEffect, useState } from 'react'
import { db } from '../firebase';
import { useParams, Link } from 'react-router-dom';
import { UserContext } from '../contexts/usercontext';

import { 
    Button, 
    Typography, 
    Paper, 
    Toolbar, 
    Box, 
    Table, 
    TableContainer, 
    TableHead, 
    TableBody, 
    TableRow, 
    TableCell
    } from '@mui/material';

import Grid from '@mui/material/Unstable_Grid2';

export default function FeedbackView() {

    const { isAdmin } = useContext(UserContext)
    const { myBadgeId, studentId, feedbackId } = useParams()

    const [ feedback, setFeedback ] = useState()
    const [ badgeDetails, setBadgeDetails ] = useState()

    useEffect(() => {
        db.collection("users").doc(studentId).collection("myBadges").doc(myBadgeId).collection("feedback").doc(feedbackId).get()
        .then(doc => {
            if(doc.exists){
                setFeedback(doc.data())
                console.log('feedback doc is '+JSON.stringify(doc.data()))
            } else {
                alert('No feedback document')
            }
        })
    },[feedbackId, myBadgeId, studentId])

    useEffect(() => {
        
        if(myBadgeId){
            return db.collection("users").doc(studentId).collection("myBadges").doc(myBadgeId).get()
            .then((doc)=> {
                if(doc.exists){
                    let badgeData = doc.data()
                    setBadgeDetails({...badgeData, badgeId: myBadgeId})
                    console.log('badgeData title is '+badgeData.badgename)
                } else {
                    alert("I can't find that document")
                }
            })
        }

    }, [ myBadgeId, studentId ]);


    return (
        <div>
            {feedback && badgeDetails && 
            <>
            <Toolbar/>

            <Typography variant="h6">
                Feedback Item for: {feedback.studentName}
            </Typography>
            <Typography variant="subtitle1">Assessor: {feedback.assessorName}</Typography>
            
            {isAdmin &&
            <Button component={Link} to={{pathname:`/feedback/${feedbackId}`, state: {selectedStudentId: studentId, badgeDetails: badgeDetails, selectedStudentName: feedback.studentName} }}>Edit</Button>
            }

            <Grid container sx={{m:2}}>
                <Grid item>
                    <Typography variant="h3">{feedback.badgeName} </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="body2" align="justify" sx={{m:4}}>{feedback.createdAt} </Typography>
                </Grid>
                <Grid item>
                    <Typography variant="h5">Links to Evidence</Typography>
                <div dangerouslySetInnerHTML={{__html:feedback.artifactLinks}}/>

                    <Typography variant="h5">Assessor Comments</Typography>
                    <Typography variant="body1">{feedback.assessorComments} </Typography>
                </Grid>
            </Grid>

            <Box sx={{flexGrow:1, p:3}} >

                <Grid item xs={12} sm={12}>
  
                </Grid>
                <Grid item xs={12} sm={12}>

                </Grid>

                {badgeDetails.criteria && 
                <TableContainer component={Paper} sx={{borderRadius:2, m:1, maxWidth:950}}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                        <TableRow>
                            <TableCell align="left" sx={{fontWeight:'bold',backgroundColor:(theme)=>theme.palette.secondary.main, color: (theme)=>theme.palette.getContrastText(theme.palette.secondary.main)}}>Criterion</TableCell>
                            <TableCell align="right" sx={{fontWeight:'bold',backgroundColor:(theme)=>theme.palette.secondary.main, color: (theme)=>theme.palette.getContrastText(theme.palette.secondary.main)}}>Level</TableCell>
                            <TableCell align="left" sx={{fontWeight:'bold',backgroundColor:(theme)=>theme.palette.secondary.main, color: (theme)=>theme.palette.getContrastText(theme.palette.secondary.main)}}>Description</TableCell>
                            <TableCell align="right" sx={{fontWeight:'bold',backgroundColor:(theme)=>theme.palette.secondary.main, color: (theme)=>theme.palette.getContrastText(theme.palette.secondary.main)}}>Total Crits</TableCell>
                            <TableCell align="right" sx={{fontWeight:'bold',backgroundColor:(theme)=>theme.palette.secondary.main, color: (theme)=>theme.palette.getContrastText(theme.palette.secondary.main)}}>Max Crits</TableCell>
                            <TableCell align="right" sx={{fontWeight:'bold',backgroundColor:(theme)=>theme.palette.secondary.main, color: (theme)=>theme.palette.getContrastText(theme.palette.secondary.main)}}>Awarded Crits</TableCell>
                        </TableRow>
                        </TableHead>
                        <TableBody>
                        {badgeDetails.criteria.map((row) => (
                            <TableRow
                            key={row.label}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                            <TableCell component="th" scope="row">
                                {row.label}
                            </TableCell>
                            <TableCell align="right">{row.level}</TableCell>
                            <TableCell align="left">{row.criterion}</TableCell>
                            <TableCell align="right" sx={{fontWeight:'bold'}}>{row.crits}</TableCell>
                            <TableCell align='right'>
                                {feedback.critsMax[row.label]}
                            </TableCell>
                            <TableCell align='center' sx={{fontWeight:'bold', fontSize:18, color:(theme)=>theme.palette.primary.main}}>
                                {feedback.critsAwarded[row.label]}
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                }
            </Box>
            </>
            }
        </div>
    )
}
