import { useState, useEffect, useContext } from 'react';
//import { collectionGroup, where, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase';

import { UserContext } from "../contexts/usercontext"
import ListGoals from './listgoals'
import NewNote from './newnote'
import ListNotes from './listnotes'

import { 
    Box,
    Typography,
    Toolbar,
    IconButton,
    CircularProgress,
    TableContainer, 
    TableBody, 
    TableCell, 
    Table, 
    TableHead, 
    TableRow, 
    Paper, 
    Select, 
    MenuItem, 
    ListItemText, 
    InputLabel, 
    FormControl,
    Divider 
    } from '@mui/material'

import AddCircleIcon from '@mui/icons-material/AddCircle';
import Grid from '@mui/material/Unstable_Grid2';

function Note() {

    const [ noteForEdit, setNoteForEdit ] = useState({})

    const [ open, setOpen ] = useState(false)
    const [ uiLoading, setUiLoading ] = useState(true)
    const [ buttonType, setButtonType ] = useState('New')

    //const [ notes, setNotes ] = useState([]);
/*     const [ classes, setClasses ] = useState(() => {
        if(localStorage.getItem('classes') !== null){
            return JSON.parse(localStorage.getItem('classes'))
        } else {
            return []
        }
    })
    const [ studentClass, setStudentClass ] = useState(() => {
        if(localStorage.getItem('studentClass') !== null){
            return JSON.parse(localStorage.getItem('studentClass'))
        } else {
            return ""
        }
    }) */
    const [ classes, setClasses ] = useState([])
    const [ studentClass, setStudentClass ] = useState("")
    const [ badges, setBadges ] = useState([])
    //const [ assessmentItems, setassessmentItems ] = useState([]);
    const [ termGoals, setTermGoals ] = useState([]);
    const [ currentPlans, setCurrentPlans ] = useState([]);
    const [ summaryEvidence, setSummaryEvidence ] = useState([])

    const { currentUser, isAdmin } = useContext(UserContext)

    // dayjs.extend(relativeTime);

/*     useEffect(() => {
        return localStorage.setItem("classes",JSON.stringify(classes))
    },[classes])

    useEffect(() => {
        const index = classes.findIndex((element) => element === studentClass)
        console.log('index is '+index)
        return localStorage.setItem('studentClass',JSON.stringify(classes[0]))
    },[studentClass, classes]) */

    useEffect(() => {
        // const fetchData = async () => {
        //     const db = firebase.firestore();
        //     const data = await db.collection("notes").get();
        //     setNotes(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        //     setUiLoading(false);
        // };
        // fetchData()
        if(studentClass !== ''){
            let recentDate = new Date('2021-04-29')
        
            console.log("user from firebase auth", currentUser)

            return db.collectionGroup("notes").where("uid", "==", currentUser.uid)
            .where("timestamp", ">=", recentDate)
            .where("studentClass","==",studentClass)
            .where("status", "==","Active")
            .where("noteType","==","ActionItem")
            .orderBy("timestamp","desc")
            .onSnapshot(snapshot => {
                const notesData = [];
                snapshot.forEach(doc => notesData.push({ ...doc.data(), id: doc.id }));
                //setNotes(notesData)
                setUiLoading(false)
            })
        }

    }, [currentUser, studentClass]);

    useEffect(() => {

        if(studentClass !== ''){
            let recentDate = new Date('2021-04-29')
        
            return db.collectionGroup("notes").where("uid", "==", currentUser.uid)
            .where("timestamp", ">=", recentDate)
            .where("studentClass","==",studentClass)
            .where("status", "==","Active")
            .where("noteType","==","Assessment")
            .orderBy("timestamp","desc")
            .onSnapshot(snapshot => {
                const notesData = [];
                snapshot.forEach(doc => notesData.push({ ...doc.data(), id: doc.id }));
                //setassessmentItems(notesData)
                setUiLoading(false)
            })
        }

    }, [currentUser, studentClass]);

    useEffect(() => {

        if(studentClass !== ''){
            let recentDate = new Date('2021-04-29')
        
            return db.collectionGroup("notes").where("uid", "==", currentUser.uid)
            .where("timestamp", ">=", recentDate)
            .where("studentClass","==",studentClass)
            .where("status", "==","Active")
            .where("noteType","==","TermGoals")
            .orderBy("timestamp","desc")
            .onSnapshot(snapshot => {
                const notesData = [];
                snapshot.forEach(doc => notesData.push({ ...doc.data(), id: doc.id }));
                setTermGoals(notesData)
                setUiLoading(false)
            })
        }

    }, [currentUser, studentClass]);

    useEffect(() => {

        if(studentClass !== ''){
            let recentDate = new Date('2021-04-29')
        
            return db.collectionGroup("notes").where("uid", "==", currentUser.uid)
            .where("timestamp", ">=", recentDate)
            .where("studentClass","==",studentClass)
            .where("status", "==","Active")
            .where("noteType","==","Plan")
            .orderBy("timestamp","desc")
            .onSnapshot(snapshot => {
                const notesData = [];
                snapshot.forEach(doc => notesData.push({ ...doc.data(), id: doc.id }));
                setCurrentPlans(notesData)
                setUiLoading(false)
            })
        }

    }, [currentUser, studentClass]);

    useEffect(() => {
        if(!isAdmin && currentUser){
        db.collection('users').doc(currentUser.uid).get()
        .then(doc => {
            const hasClasses = "classes" in doc.data()
            if(doc){
            setSummaryEvidence(doc.data().evidence)
            setClasses(hasClasses ? doc.data().classes : [])
            const badgeMap = doc.data().myBadgesMap
            if(badgeMap){
            const entries = Object.entries(badgeMap)
            console.log('entries are '+JSON.stringify(entries))
            const badgeNames = []
            entries.map(entry => {
                return badgeNames.push(entry[1].badgename)
            })
            setBadges(badgeNames)
            }
            //console.log("summary evidence max crits for first item is "+doc.data().evidence[0].sumCritsMax)
            setUiLoading(false)
        }
        })}
    }, [currentUser,isAdmin])

	const handleEditOpen = (note) => {
        setNoteForEdit(note)
        setButtonType("Edit")
        setOpen(true)
	}

    const handleClickOpen = () => {
        setOpen(true)
    };

    const handleClose = () => {
        setOpen(false)
    }

    const onChange = (e) => {
        setStudentClass(e.target.value)
        console.log('student class is '+JSON.stringify(e.target.value))
    }


    if (uiLoading === true) {
        return (
            <Box sx={{flexGrow:1, p:3}}>
                <Toolbar />
                {uiLoading && <CircularProgress size={150} sx={{
                    position: 'fixed',
                    zIndex: '1000',
                    height: '31px',
                    width: '31px',
                    left: '50%',
                    top: '35%'
                }} />}
            </Box>
        );
    } else {
        return (
            <Box sx={{p:3}} >
                <Toolbar />

                <Box sx={{
                        width: '98%',
                        marginLeft: 2,
                        marginTop: 3
                    }} noValidate>
                    <Grid container spacing={2}>
                        <Grid item xs={5}>
                            <Typography variant='h5' sx={{mb:0}}>Student Dashboard</Typography>
                        </Grid>
                        <Grid item xs={6} key="classesMenu" >
                        <FormControl sx={{ m: 1, minWidth: 100 }}>
                            <InputLabel id="ClassesMenu">Class</InputLabel>
                            <Select
                                labelId="classesMenu"
                                id="classesMenu"
                                value={studentClass}
                                label="Class"
                                onChange={onChange}
                                defaultValue=""
                            >
                            {classes.length && classes.map(aClass => (
                                <MenuItem key={aClass.value} value={aClass}>
                                    <ListItemText primary={aClass.label} />
                                </MenuItem>
                            ))}
                            </Select>
                            </FormControl>

                        </Grid>
                        
                        <Grid item xs={1} key="addNoteIcon">
                            <IconButton
                                sx={{
                                }}
                                color="primary"
                                aria-label="Add Note"
                                onClick={handleClickOpen}
                                size='small'
                            >
                                <AddCircleIcon sx={{ fontSize: 30 }} />
                            </IconButton>
                        </Grid>
                    </Grid>
                </Box>

                <Box>
                    <Box sx={{
                        bgcolor: '#eeeeee',
                        boxShadow: 1,
                        borderRadius: 1,
                        p:1,
                        minWidth: 300,
                        maxWidth: 1000
                        }}>
                        <Typography variant='h6' sx={{mb:0}}>Current Goals and Plans</Typography>
                        <Divider sx={{mb:1}}/>
                        <ListGoals notes={termGoals.concat(currentPlans)} handleEditOpen={handleEditOpen} canEdit={true} classes={classes} badges={badges} studentClass={studentClass} />
                    </Box>
                    <Divider sx={{mt:1}}/>
                </Box>

                {open && classes && <NewNote open={open} handleClose={handleClose} buttonType={buttonType} noteForEdit={noteForEdit} classes={classes} badges={badges} studentClass={studentClass} />}
                
                <Divider sx={{mt:1}}/>

                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' }
                    }}>

                    <Box sx={{mr:0}}>

                        <Box sx={{
                            bgcolor: '#eeeeee',
                            boxShadow: 1,
                            borderRadius: 1,
                            minWidth: 300,
                            maxWidth: 1000
                            }}>
                            <Typography variant='h6' sx={{mb:0,p:1}}>Action Items</Typography>
                            <Divider sx={{mb:1}}/>
                            {classes &&
                                <ListNotes classes={classes} badges={badges} studentClass={studentClass} />
                            }
                        </Box>

                        <Divider sx={{mt:1}}/>

                        <Box sx={{
                            bgcolor: '#eeeeee',
                            boxShadow: 1,
                            borderRadius: 1,
                            p: 1,
                            minWidth: 300,
                            maxWidth: 1000
                            }}>

                            <Typography variant="h6" sx={{mb:0}}>Evidence and Feedback</Typography>

                            <Box sx={{flexGrow:1}} >
                                <>
                                <TableContainer component={Paper} sx={{borderRadius:2, m:0, maxWidth:1000}}>
                                    <Table sx={{ minWidth: 450 }} aria-label="simple table">
                                        <TableHead>
                                        <TableRow>
                                            <TableCell align="left" sx={{fontWeight:'bold',backgroundColor:(theme)=>theme.palette.secondary.main, color: (theme)=>theme.palette.getContrastText(theme.palette.secondary.main)}}>Date</TableCell>
                                            <TableCell align="left" sx={{fontWeight:'bold',backgroundColor:(theme)=>theme.palette.secondary.main, color: (theme)=>theme.palette.getContrastText(theme.palette.secondary.main)}}>Badge</TableCell>
                                            <TableCell align="left" sx={{fontWeight:'bold',backgroundColor:(theme)=>theme.palette.secondary.main, color: (theme)=>theme.palette.getContrastText(theme.palette.secondary.main)}}>Max Available</TableCell>
                                            <TableCell align="left" sx={{fontWeight:'bold',backgroundColor:(theme)=>theme.palette.secondary.main, color: (theme)=>theme.palette.getContrastText(theme.palette.secondary.main)}}>Crits Awarded</TableCell>
                                        </TableRow>
                                        </TableHead>
                                        <TableBody>
                                        {summaryEvidence && summaryEvidence.map(evidenceItem => (
                                            <TableRow key={evidenceItem.feedbackId}>
                                            <TableCell>
                                                {evidenceItem.createdAt.slice(0,10)}
                                            </TableCell>
                                            <TableCell>
                                                {evidenceItem.badgeName}
                                            </TableCell>
                                            <TableCell>
                                                {evidenceItem.sumCritsMax}
                                            </TableCell>
                                            <TableCell>
                                                {evidenceItem.sumCritsForAssessment}
                                            </TableCell>
                                            </TableRow>
                                        ))
                                        }
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                </>
                            </Box>
                        </Box>

                    </Box>
                </Box>

            </Box>
        );
    }
}

export default Note;
