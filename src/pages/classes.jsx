import React, { useState, useEffect } from 'react';
import { query, collection, where, getDocs, collectionGroup, orderBy } from 'firebase/firestore'

import { db } from '../firebase';
import { Link, useLoaderData } from "react-router-dom";
import ListTable from './listtable'

import { DatePicker } from '@mui/x-date-pickers';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {MultiSelect} from "react-multi-select-component";

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

    //const [ user ] = useState(auth.currentUser)

    const [ title, setTitle ] = useState('')

    const [ students10, setStudents10 ] = useState([])
    const [ students20, setStudents20 ] = useState([])
    const [ students30, setStudents30 ] = useState([])

    const [ currentClass, setCurrentClass ] = useState([])
    const [ classId, setClassId ] = useState("")
    const [ classForSelect, setClassForSelect ] = useState([])

    const [ open, setOpen ] = useState(false)
    // const [ uiLoading, setUiLoading ] = useState(true)
    const [ uiLoading ] = useState(false)


    //const [ teacherClasses, setTeacherClasses ] = useState([]);
    const [ notes, setNotes ] = useState([]);
    const [ status, setStatus ] = useState("Active")
    const [ noteType, setNoteType ] = useState("ActionItem")
    const [ actionType, setActionType ] = useState("ProblemSolving")
//  const [ selectedDate, setSelectedDate ] = useState(new Date(Date.now() - 604800000))
    const [ selectedDate, setSelectedDate ] = useState(dayjs())

    const [ selected, setSelected ] = useState([])
    const teacherClasses = useLoaderData()
    console.log('selectedDate start as ',selectedDate)

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

        let recentDate = selectedDate.toDate()
        let classObject = {}
        let targetAssessment = {}
        let termGoal = {}
        let sumEvidence = 0

        console.log('selectedDate is ')
        console.log(selectedDate)

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
        console.log('students10 is ',students10)

        if(noteType === "Progress") {
            if(students10.length > 0) {
                const q = query(collection(db, "users"), where('uid','in',students10));
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
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
                });
  
/*                 students10.forEach(studentId => {
                    const someNotes = query(collectionGroup(db, 'notes'), where('uid','==',studentId), where('noteType','==','Assessment'), where('ts_msec','>=',1647320001000), orderBy('ts_msec','asc'), limit(1));
                    const querySnapshot = await getDocs(someNotes);
                    querySnapshot.forEach((doc) => {
                        //console.log(doc.id, ' => ', doc.data());
                        console.log("latest assessment for "+studentId)
                        console.log(doc.data())
                    });
                }) */
            }
            if(students20.length > 0) {
                const q = query(collection(db, "users"), where('uid','in',students20));
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach((doc) => {
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
            }

            if(students30.length > 0) {
                const q = query(collection(db, "users"), where('uid','in',students30));
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach((doc) => {
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
            }

        } else {

             if(students10.length>0){
                console.log('start query')
                console.log('noteType is ', noteType)
                console.log('recentDate is ', recentDate)

                const first10query = query(collectionGroup(db,'notes')
                ,where('uid','in', students10)
                ,where('noteType','==',noteType)
                ,where("timestamp", ">=", recentDate)
                ,orderBy("timestamp","desc"))
                let first10 = await getDocs(first10query)
                first10.forEach((doc) => {
                    notes10.push({ ...doc.data(), id: doc.id })
                })
                console.log('notes10 ',notes10)
            }

            if(students20.length>0){
                const second10query = query(collectionGroup(db,'notes')
                ,where('uid','in', students20)
                ,where('noteType','==',noteType)
                ,where("timestamp", ">=", recentDate)
                ,orderBy("timestamp","desc"))
                let second10 = await getDocs(second10query)
                second10.forEach((doc) => {
                notes20.push({ ...doc.data(), id: doc.id })
                })
            }

            if(students30.length>0){
                const third10query = query(collectionGroup(db,'notes')
                ,where('uid','in', students30)
                ,where('noteType','==',noteType)
                ,where("timestamp", ">=", recentDate)
                ,orderBy("timestamp","desc"))
                let third10 = await getDocs(third10query)
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
                                <Link
                                    to={{ pathname: "/addClass" }}
                                    state= {{ classId: classId}} //allows addclass to recognize preexisting class through useLocation
                                >
                                    {title}
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
                            <Grid xs={6} sm={6} key='date' sx={{mt:1}}>
                                <DatePicker
                                    label="Earliest Date"
                                    value={selectedDate}
                                    onChange={(newValue) => {
                                    setSelectedDate(newValue);
                                    }}
                                    //renderInput={(params) => <TextField {...params} />}
                                    slots={{
                                        textField: params => <TextField {...params} />
                                      }}
                                />
                            </Grid>
                            <Grid xs={6} sm={6} key='student-select'>
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
                            <Grid xs={12} sm={12}>
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
                            <Grid xs={12} sm={12}>
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
                            <Grid xs={12} sm={12} key="actionType">
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
                        <Grid xs={4} sm={2} key = {teacherClass.name}>
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
                    <Grid xs={3} sm={2} key='newclass'>
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
