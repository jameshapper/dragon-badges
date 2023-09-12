import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { Link } from "react-router-dom";
import ListTable from './listtable2'

//import Datepicker from 'react-datepicker'
import DatePicker from '@mui/lab/DatePicker';
import 'react-datepicker/dist/react-datepicker.css'
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import MultiSelect from "react-multi-select-component";

import CloseIcon from '@mui/icons-material/Close';
import Grid from '@mui/material/Unstable_Grid2';

import { 
    Box,
    Typography,
    Button,
    Dialog,
    AppBar,
    Toolbar,
    IconButton,
    Slide,
    Card,
    CircularProgress,
    CardContent,
    CardActionArea, 
    MenuItem, 
    Select, 
    InputLabel, 
    TextField 
    } from '@mui/material';

const Transition = React.forwardRef(function Transition(props, ref) {
	return <Slide direction="up" ref={ref} {...props} />;
});

function TeacherClasses() {

    const [ user ] = useState(auth.currentUser)

    const [ title, setTitle ] = useState('')

    const [ students10, setStudents10 ] = useState([])
    const [ students20, setStudents20 ] = useState([])
    const [ students30, setStudents30 ] = useState([])

    const [ currentClass, setCurrentClass ] = useState([])
    const [ classId, setClassId ] = useState("")
    const [ classForSelect, setClassForSelect ] = useState([])

    const [ open, setOpen ] = useState(false)
    const [ uiLoading, setUiLoading ] = useState(true)

    const [ teacherClasses, setTeacherClasses ] = useState([]);
    const [ notes, setNotes ] = useState([]);
    const [ status, setStatus ] = useState("Active")
    const [ noteType, setNoteType ] = useState("ActionItem")
    const [ actionType, setActionType ] = useState("ProblemSolving")
    const [ selectedDate, setSelectedDate ] = useState(new Date(Date.now() - 604800000))
    const [ laterDate ] = useState(new Date(Date.now() + 691200000))
    //const [ laterDate, setLaterDate ] = useState(new Date(Date.now() + 691200000))

    const [ selected, setSelected ] = useState([])

    //get class data (if stored in teacherClasses collection?)
    useEffect(() => {
        
        if(user){
            return db.collection("users").doc(user.uid).collection('teacherClasses').get()
            .then((snapshot) => {
                const teacherData = []
                snapshot.forEach((doc) => {
                    teacherData.push({...doc.data(), id: doc.id})
                })
                setTeacherClasses(teacherData)
                setUiLoading(false)
            })
            .catch((error) => {
                console.log("No classes error: ", error);
            })
        }

    }, [user]);

    useEffect(() => {
        //console.log('selected ids are '+selected.map((student) => student.value))
        //setSelectedStudents(selected.map(a => a.value))
        setStudents10(selected.map(a=>a.value).slice(0,10))
        setStudents20(selected.map(a=>a.value).slice(10,20))
        setStudents30(selected.map(a=>a.value).slice(20,30))

    },[selected])

    dayjs.extend(relativeTime);
    //const { classes } = props;

    const handleSelectOpen = (teacherClass) => {
        setTitle(teacherClass.name)
        setCurrentClass(teacherClass.students)
        setClassId(teacherClass.id)
        setOpen(true)
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        let notes10 = []
        let notes20 = []
        let notes30 = []

        let recentDate = selectedDate
        let classObject = {}
        let targetAssessment = {}
        let termGoal = {}
        let sumEvidence = 0

        console.log('selectedDate is ')
        console.log(selectedDate)
        console.log('later date is ')
        console.log(laterDate)

        function evidenceSum(evidenceArray, startDate) {
            const termEvidence = evidenceArray.filter(evidence => {
                return (evidence.ts_msec)/1000 - startDate/1000 > 0
            })
            const sumAllCritsToDate = termEvidence.reduce((total, evidence) => {
                return total + evidence.sumCritsForAssessment
            },0)
            console.log('sumAllCritsToDate is ' +sumAllCritsToDate)
            return sumAllCritsToDate
        }

        console.log('students in array groups lengths '+students10.length+students20.length+students30.length)

        if(noteType === "Progress") {
            if(students10.length > 0) {
                await
                db.collection('users').where('uid','in',students10).get()
                .then(docs => {
                    docs.forEach(doc => {
                        if("nextTarget" in doc.data()){
                            targetAssessment = doc.data().nextTarget.find(thisClass => {                        
                                return thisClass.classId === classId
                            })
                        }
                        if("termGoals" in doc.data()){
                            termGoal = doc.data().termGoals.find(thisClass => {
                                return thisClass.classId === classId
                            })
                        }
                        let nextCrits = 0
                        if(targetAssessment && "crits" in targetAssessment){
                            nextCrits = targetAssessment.crits
                        }
                        classObject = {...targetAssessment, ...termGoal, nextCrits: nextCrits, uid: doc.data().uid, firstName: doc.data().firstName, avatar: doc.data().avatar}
                        sumEvidence = evidenceSum(doc.data().evidence, classObject.startDate)
                        classObject = {...classObject, sumEvidence: sumEvidence}
                        notes10.push(classObject)
                        console.log(classObject)
                    })
                })       
                students10.forEach(studentId => {
                    db.collectionGroup('notes')
                    .where('uid','==',studentId)
                    .where('noteType','==','Assessment')
                    .where('ts_msec','>=',1647320001000)
                    .orderBy('ts_msec','asc')
                    .limit(1)
                    .get()
                    .then(docs => {
                        docs.forEach(doc => {
                            console.log("latest assessment for "+studentId)
                            console.log(doc.data())
                        })
                    })
                })
            }
            if(students20.length > 0) {
                await
                db.collection('users').where('uid','in',students20).get()
                .then(docs => {
                    docs.forEach(doc => {
                        if("nextTarget" in doc.data()){
                            targetAssessment = doc.data().nextTarget.find(thisClass => {                        
                                return thisClass.classId === classId
                            })
                        }
                        if("termGoals" in doc.data()){
                            termGoal = doc.data().termGoals.find(thisClass => {
                                return thisClass.classId === classId
                            })
                        }
                        classObject = {...targetAssessment, ...termGoal, uid: doc.data().uid, firstName: doc.data().firstName, avatar: doc.data().avatar}
                        sumEvidence = evidenceSum(doc.data().evidence, classObject.startDate)
                        classObject = {...classObject, sumEvidence: sumEvidence}
                        notes20.push(classObject)
                    })
                })       
            }

            if(students30.length > 0) {
                await
                db.collection('users').where('uid','in',students30).get()
                .then(docs => {
                    docs.forEach(doc => {
                        if("nextTarget" in doc.data()){
                            targetAssessment = doc.data().nextTarget.find(thisClass => {                        
                                return thisClass.classId === classId
                            })
                        }
                        if("termGoals" in doc.data()){
                            termGoal = doc.data().termGoals.find(thisClass => {
                                return thisClass.classId === classId
                            })
                        }
                        classObject = {...targetAssessment, ...termGoal, uid: doc.data().uid, firstName: doc.data().firstName, avatar: doc.data().avatar}
                        sumEvidence = evidenceSum(doc.data().evidence, classObject.startDate)
                        classObject = {...classObject, sumEvidence: sumEvidence}
                        notes30.push(classObject)
                    })
                })       
            }

        } else {

             if(students10.length>0){
                let first10 = await
                db.collectionGroup('notes')
                .where('uid','in', students10)
                .where('noteType','==',noteType)
                .where("timestamp", ">=", recentDate)
                .where("timestamp", "<", laterDate)
                .orderBy("timestamp","desc")
                .get()

                first10.forEach((doc) => {
                    notes10.push({ ...doc.data(), id: doc.id })
                })
            }

            if(students20.length>0){
                let second10 = await
                db.collectionGroup('notes')
                .where('uid','in', students20)
                .where('noteType','==',noteType)
                .where("timestamp", ">=", recentDate)
                .orderBy("timestamp","desc")
                .get()

                second10.forEach((doc) => {
                notes20.push({ ...doc.data(), id: doc.id })
                })
            }

            if(students30.length>0){
                let third10 = await
                db.collectionGroup('notes')
                .where('uid','in', students30)
                .where('noteType','==',noteType)
                .where("timestamp", ">=", recentDate)
                .orderBy("timestamp","desc")
                .get()

                third10.forEach((doc) => {
                notes30.push({ ...doc.data(), id: doc.id })
                })
            }
        }

        setNotes(notes10.concat(notes20,notes30))
        setOpen(false)
        //console.log("notes10 is "+notes10.length+" notes20 is "+notes20.length+" and notes30 is "+notes30.length)

    };

    useEffect(() => {
        const toLabelValue = currentClass.map((student) => {
            return {
                label: student.firstName,
                value: student.uid
            }
        })
        setClassForSelect(toLabelValue)
    },[currentClass])

    const handleClose = () => setOpen(false);

    if (uiLoading === true) {
        return (
            <Box sx={{flexGrow:1, p:3}} >
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
            <Box sx={{flexGrow:1, p: 3}}>
                <Toolbar />

                <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
                    <AppBar sx={{position: 'relative'}} >
                        <Toolbar>
                            <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
                                <CloseIcon />
                            </IconButton>
                            <Typography variant="h6" sx={{ml:2, flex:1}} >
                                <Link   to={{
                                        pathname: "/addClass",
                                        state: { classId: classId}
                                    }}>{title}
                                </Link>
                            </Typography>

                            <Button
                                autoFocus
                                color="inherit"
                                onClick={handleSubmit}
                                sx={{
                                    display: 'block',
                                    color: 'white',
                                    textAlign: 'center',
                                    position: 'absolute',
                                    top: 14,
                                    right: 10
                                }}
                            >
                                Submit
                            </Button>
                        </Toolbar>
                    </AppBar>

                    <Box component="form"
                    sx={{
                        width: '98%',
                        marginLeft: 2,
                        marginTop: 3
                    }} noValidate>
                        <Grid container spacing={2}>
                            <Grid item xs={6} sm={6} key='date' sx={{mt:1}}>
                                <DatePicker
                                    label="Earliest Date"
                                    value={selectedDate}
                                    onChange={(newValue) => {
                                    setSelectedDate(newValue);
                                    }}
                                    renderInput={(params) => <TextField {...params} />}
                                />
                            </Grid>
                            <Grid item xs={6} sm={6} key='student-select'>
                                <Box sx={{m:0, maxWidth:300, flexDirection:'column'}}>
                                    <Typography>Students</Typography>
                                    <MultiSelect
                                    options={classForSelect}
                                    value={selected}
                                    onChange={setSelected}
                                    labelledBy={"Select"}
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={12}>
                                <InputLabel id="note-status">Status</InputLabel>
                                <Select
                                    labelId="note-status"
                                    id="note-status"
                                    value={status}
                                    label="Status"
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    <MenuItem value={"Active"}>Active</MenuItem>
                                    <MenuItem value={"Archived"}>Archived</MenuItem>
                                    <MenuItem value={"Paused"}>Paused</MenuItem>
                                </Select>
                            </Grid>
                            <Grid item xs={12} sm={12}>
                                <InputLabel id="noteType label">Note Type</InputLabel>
                                <Select
                                    labelId="noteType label"
                                    id="noteType"
                                    value={noteType}
                                    label="Note Type"
                                    onChange={(e) => setNoteType(e.target.value)}
                                >
                                    <MenuItem value={"ActionItem"}>Action Item</MenuItem>
                                    <MenuItem value={"Plan"}>Current Plans</MenuItem>
                                    <MenuItem value={"TermGoals"}>Term Goals</MenuItem>
                                    <MenuItem value={"Progress"}>Progress</MenuItem>
                                </Select>
                            </Grid>
                            <Grid item xs={12} sm={12} key="actionType">
                                <InputLabel id="action-type-label">Action Type</InputLabel>
                                <Select
                                    labelId="action-type-label"
                                    id="action-type"
                                    value={actionType}
                                    label="Action Type"
                                    onChange={(e) => setActionType(e.target.value)}
                                >
                                    <MenuItem value={"ProblemSolving"}>Problem Solving</MenuItem>
                                    <MenuItem value={"ResearchStudy"}>Research Study</MenuItem>
                                    <MenuItem value={"HandsOn"}>Hands On</MenuItem>
                                    <MenuItem value={"DataAnalysis"}>Data Analysis</MenuItem>
                                    <MenuItem value={"Communicating"}>Communicating</MenuItem>
                                </Select>
                            </Grid>

                        </Grid>
                    </Box>
                </Dialog>

                <Grid container spacing={4} justify='center'>
                    {teacherClasses.map((teacherClass) => (
                        <Grid item xs={4} sm={2} key = {teacherClass.name}>
                            <Card sx={{minWidth:160}} variant="outlined">
                                <CardActionArea onClick={() => handleSelectOpen( teacherClass )}>
                                <CardContent>
                                    <Typography variant="button" display="block" gutterBottom >
                                        {teacherClass.name}
                                    </Typography>
                                </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                    <Grid item xs={3} sm={2} key='newclass'>
                        <Button variant="outlined" component={Link} to='/addclass'>Add class</Button> 
                    </Grid>
                </Grid>

                { notes && notes.length > 0 && 
                <ListTable notes={notes} rowType={noteType}/>
                }
  
            </Box>
        );
    }
}

export default TeacherClasses;
