import { useContext, useEffect } from 'react'
import { db } from '../firebase';
import { serverTimestamp, arrayUnion, arrayRemove, doc, addDoc, collection, updateDoc } from 'firebase/firestore';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { UserContext } from '../contexts/usercontext';
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./styles.css";

import { useForm, Controller } from 'react-hook-form'
import Grid from '@mui/material/Unstable_Grid2';

import { 
    Typography, 
    TextField, 
    Button,
    Paper, 
    Toolbar, 
    Box, 
    Table, 
    TableContainer, 
    TableHead, 
    TableBody, 
    TableRow, 
    TableCell 
    } from '@mui/material'

export default function Feedback() {

    /* HOW TO MODIFY THIS COMPONENT
        Source 1: Access from feedbackView, which is a specific feedback item that Admin decides to edit
            --We arrive with a "state" object that we access from the "location" object (which is from useLocation() of react-router)
            --Since we have everything we need, there is no need to go back to firestore,
                so we use setValue from react-hook-form to populate the form fields

        Source 2: Access from myBadgeDetails (which has a list of feedback items)
            --We arrive from a particular badge summary for a student
            --We just want to add a new feedback item (since the student has new evidence)
            --It might be convenient to access this directly from the student's "myBadges" list also
            --We are making something new, so we don't need much from the db except what we already have
                (myBadgeId, studentId)

        WHICH SOURCE?
            --An obvious difference will be the feedbackId that my as well be sent as
                a parameter in the link (from feedbackView)
            --If there is no such parameter, it must be we are coming from Source 2
                and Admin wants to create a new feedback form
    */

    const { currentUser } = useContext(UserContext)
    //const [ previousFeedbackSummary, setPreviousFeedbackSummary ] = useState({})
    //const [ previousShort, setPreviousShort ] = useState({})

    const { feedbackId } = useParams()
    const location = useLocation()
    console.log('location is ',location)
    const navigate = useNavigate()
    const { selectedStudentId, badgeDetails, selectedStudentName, oldFeedback={} } = location.state

    console.log('selectedStudentId is '+selectedStudentId)
    // console.log('badgeDetails are '+JSON.stringify(badgeDetails))
    const modules = {
        toolbar: {
            container: [
              [{header: [1,2,3,false]}],
              ['bold', 'italic'],
              ['link'],
              [{ list: 'ordered' }, { list: 'bullet' }]
            ]
        }
    }
  
    const formats = [
      "header",
      "font",
      "size",
      "bold",
      "italic",
      "list",
      "bullet",
      "link",
    ];

    const { handleSubmit, control, setValue } = useForm();

    // If feedbackId exists, admin must want to edit, so use setValue
    // We probably came from a "feedbackView", so location.state provided all needed data
    // including the original "feedback" object

    useEffect(() => {
        console.log('useEffect firing...')
        if(feedbackId) {
            const fields = ['artifactLinks','assessorComments','critsAwarded','critsMax']
            fields.forEach(field => {
                setValue(field, oldFeedback[field]);
            })
        }
        
    },[oldFeedback, feedbackId, setValue])

    const previousFeedbackSummary = {
        critsAwarded: oldFeedback ? oldFeedback.critsAwarded : 0,
        critsMax: oldFeedback ? oldFeedback.critsMax : 0,
        feedbackId: feedbackId,
        createdAt: oldFeedback ? oldFeedback.createdAt : '',
        sumCritsForAssessment: oldFeedback ? oldFeedback.sumCritsForAssessment : 0,
        sumCritsMax: oldFeedback ? oldFeedback.sumCritsMax : 0
    }
    const previousShort = {
        feedbackId: feedbackId,
        createdAt: oldFeedback ? oldFeedback.createdAt : '',
        sumCritsForAssessment: oldFeedback ? oldFeedback.sumCritsForAssessment : 0,
        sumCritsMax: oldFeedback ? oldFeedback.sumCritsMax : 0,
        badgeName: oldFeedback ? oldFeedback.badgeName : '',
        ts_msec: oldFeedback ? oldFeedback.ts_msec : 0
    }


    function onSubmit(data) {
        return !feedbackId
            ? newFeedback(data)
            : updateFeedback(feedbackId, data);
    }

    const newFeedback = data => {

        const createdDate = new Date()
        const createdAt = createdDate.toISOString()
        const ts_msec = createdDate.getTime()

        //const oldBadgeDetails = JSON.parse(JSON.stringify(badgeDetails.criteria))
        //console.log("original badgeDetails "+JSON.stringify(oldBadgeDetails))

/*         const newValues = badgeDetails.criteria.map(criterion => {
            const key = criterion.label
            return criterion.critsAwarded += parseInt(data.critsAwarded[key])
        })
        console.log("newValues "+newValues) */
        let sumCritsForAssessment = 0
        let sumCritsMax = 0
        let fbShortSummary = {}

        badgeDetails.criteria.map(criterion => {
            const key = criterion.label
            sumCritsForAssessment += parseInt(data.critsAwarded[key])
            sumCritsMax += parseInt(data.critsMax[key])
            return criterion.critsAwarded += parseInt(data.critsAwarded[key])
        })
        //console.log("badgeDetails update? "+JSON.stringify(badgeDetails.criteria))
        console.log("total crits for assessment and max "+ sumCritsForAssessment+" and "+ sumCritsMax)

        const totalCrits = badgeDetails.criteria.map(criterion => {
            return criterion.critsAwarded
        })

        const sumCrits = totalCrits.reduce((a,b) => a + b, 0)
        badgeDetails.progress = parseInt(100 * ( sumCrits / parseInt(badgeDetails.totalcrits) ))

        const feedback = {
            studentId: selectedStudentId,
            studentName: selectedStudentName,
            artifactLinks: data.artifactLinks,
            assessorComments: data.assessorComments,
            createdAt: createdAt,
            timestamp: serverTimestamp(),
            studentBadgeId: badgeDetails.myBadgeId,
            badgeName: badgeDetails.badgename,
            assessorName: currentUser.displayName,
            assessorId: currentUser.uid,
            critsAwarded: data.critsAwarded,
            critsMax: data.critsMax,
            sumCritsForAssessment: sumCritsForAssessment,
            sumCritsMax: sumCritsMax
        }
        
        addDoc(collection(db,'users',selectedStudentId,'myBadges',badgeDetails.myBadgeId,"feedback"),feedback)
        .then((feedbackDoc)=>{
            const feedbackSummary = {
                critsAwarded: data.critsAwarded,
                critsMax: data.critsMax,
                feedbackId: feedbackDoc.id,
                createdAt: createdAt,
                sumCritsForAssessment: sumCritsForAssessment,
                sumCritsMax: sumCritsMax,
                ts_msec: ts_msec
            }
            fbShortSummary = {
                feedbackId: feedbackDoc.id,
                createdAt: createdAt,
                sumCritsForAssessment: sumCritsForAssessment,
                sumCritsMax: sumCritsMax,
                badgeName: badgeDetails.badgename,
                ts_msec: ts_msec 
            }
            console.log("New feedback added to db")
            updateDoc(doc(db,'users',selectedStudentId,'myBadges',badgeDetails.myBadgeId)
            ,{evidence: arrayUnion(feedbackSummary), progress: badgeDetails.progress, criteria: badgeDetails.criteria})
        })
        .then(() => {
            updateDoc(doc(db,'users',selectedStudentId)
            ,{evidence: arrayUnion(fbShortSummary)})
        })
        .then(() => {
            navigate(`/students/${selectedStudentId}/myBadges/${badgeDetails.myBadgeId}`)
        })
        .catch((error) => {
            console.error(error);
            alert('Something went wrong' );
        });
    };

    const updateFeedback = (docId, data) => {

        console.log('data is '+JSON.stringify(data))
        console.log('badgeDetails.criteria start as '+JSON.stringify(badgeDetails.criteria))

        const createdDate = new Date()
        const createdAt = createdDate.toISOString()
        const ts_msec = createdDate.getTime()

        let sumCritsForAssessment = 0
        let sumCritsMax = 0
        let fbShortSummary = {}

        badgeDetails.criteria.map(criterion => {
            const key = criterion.label
            sumCritsForAssessment += parseInt(data.critsAwarded[key])
            sumCritsMax += parseInt(data.critsMax[key])
            return (
                criterion.critsAwarded += (parseInt(data.critsAwarded[key]) - parseInt(previousFeedbackSummary.critsAwarded[key]))
        )})

        const totalCrits = badgeDetails.criteria.map(criterion => {
            return criterion.critsAwarded
        })

        const sumCrits = totalCrits.reduce((a,b) => a + b, 0)
        badgeDetails.progress = parseInt(100 * ( sumCrits / parseInt(badgeDetails.totalcrits) ))

        const feedback = {
            studentId: selectedStudentId,
            studentName: selectedStudentName,
            artifactLinks: data.artifactLinks,
            assessorComments: data.assessorComments,
            createdAt: createdAt,
            timestamp: serverTimestamp(),
            studentBadgeId: badgeDetails.myBadgeId,
            badgeName: badgeDetails.badgename,
            assessorName: currentUser.displayName,
            assessorId: currentUser.uid,
            critsAwarded: data.critsAwarded,
            critsMax: data.critsMax,
            sumCritsForAssessment: sumCritsForAssessment,
            sumCritsMax: sumCritsMax
        }

        updateDoc(doc(db,'users',selectedStudentId,'myBadges',badgeDetails.myBadgeId,"feedback",feedbackId),feedback)
        .then(()=>{
            updateDoc(doc(db,'users',selectedStudentId,'myBadges',badgeDetails.myBadgeId)
            ,{evidence: arrayRemove(previousFeedbackSummary)})
            .then(() => {
                const feedbackSummary = {
                    critsAwarded: data.critsAwarded,
                    critsMax: data.critsMax,
                    feedbackId: feedbackId,
                    createdAt: createdAt,
                    sumCritsForAssessment: sumCritsForAssessment,
                    sumCritsMax: sumCritsMax,
                    ts_msec: ts_msec
                }
                fbShortSummary = {
                    feedbackId: feedbackId,
                    createdAt: createdAt,
                    sumCritsForAssessment: sumCritsForAssessment,
                    sumCritsMax: sumCritsMax,
                    badgeName: badgeDetails.badgename,
                    ts_msec: ts_msec
                }
                updateDoc(doc(db,'users',selectedStudentId,'myBadges',badgeDetails.myBadgeId)
                ,{evidence: arrayUnion(feedbackSummary), progress: badgeDetails.progress, criteria: badgeDetails.criteria})
            })
            .then(() => {
                updateDoc(doc(db,'users',selectedStudentId)
                ,{evidence: arrayRemove(previousShort)})
            })
            .then(() => {
                updateDoc(doc(db,'users',selectedStudentId)
                ,{evidence: arrayUnion(fbShortSummary)})
            })
            .then(() => console.log('badgeDetails.criteria are now '+JSON.stringify(badgeDetails.criteria)))
        })
        .then(() => {
            navigate(`/students/${selectedStudentId}/myBadges/${badgeDetails.myBadgeId}`)
        })
        .catch((error) => {
            console.error(error);
            alert('Something went wrong' );
        });
    };

    return (
        <div>
            <Toolbar/>

            <Typography variant="h6">
                New Feedback Form for: {selectedStudentName}
            </Typography>

            <Grid container sx={{m:2}}>
                <Grid >
                    <Typography variant="h3">{badgeDetails.badgename} </Typography>
                </Grid>
                <Grid xs={12}>
                    <Typography variant="body2" align="justify" sx={{m:4}}>{badgeDetails.description} </Typography>
                </Grid>
            </Grid>

            <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{flexGrow:1, p:3}} >
                <Button type="submit" variant="contained" color="primary" sx={{m:2}}>
                    Submit Feedback Form
                </Button>

                <Grid xs={12} sm={12}>
                    <Controller
                        name="artifactLinks"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value } }) => (
                        <ReactQuill
                            theme="snow"
                            value={value}
                            onChange={onChange}
                            placeholder={"Add links to archived work here..."}
                            modules={modules}
                            formats={formats}
                        />
                        )}
                    />   
                </Grid>
                <Grid xs={12} sm={12}>
                    <Controller
                        name={"assessorComments"}
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <TextField
                            label="Comments"
                            fullWidth
                            variant="filled"
                            value={value}
                            onChange={onChange}
                            error={!!error}
                            helperText={error ? error.message : null}
                        />
                        )}
                    />
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
                            <TableCell align="right" sx={{fontWeight:'bold',backgroundColor:(theme)=>theme.palette.secondary.main, color: (theme)=>theme.palette.getContrastText(theme.palette.secondary.main)}}>Current Crits</TableCell>
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
                            <TableCell align="right" sx={{fontWeight:'bold'}}>{row.critsAwarded}</TableCell>
                            <TableCell align='right'>
                                <Controller
                                    name={`critsMax.${row.label}`}
                                    control={control}
                                    defaultValue={0}
                                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                                    <TextField
                                        label="MaxCrits"
                                        variant="filled"
                                        value={value}
                                        onChange={onChange}
                                        error={!!error}
                                        helperText={error ? error.message : null}
                                    />
                                    )}
                                />
                            </TableCell>
                            <TableCell align='right'>
                                <Controller
                                    name={`critsAwarded.${row.label}`}
                                    control={control}
                                    defaultValue={0}
                                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                                    <TextField
                                        label="Crits"
                                        variant="filled"
                                        value={value}
                                        onChange={onChange}
                                        error={!!error}
                                        helperText={error ? error.message : null}
                                    />
                                    )}
                                />
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                }
            </Box>

            </form>
        </div>
    )
}
