//import React, { useContext } from 'react';
import React from 'react';


//import { Timestamp, arrayRemove, arrayUnion } from 'firebase/firestore';
//import { db } from '../firebase';
import "react-quill/dist/quill.snow.css";
import { useForm, Controller } from 'react-hook-form'
import PropTypes from 'prop-types';

//import { UserContext } from '../contexts/usercontext';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
// import DatePicker from '@mui/lab/DatePicker';
import { DatePicker } from '@mui/x-date-pickers';


import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./styles.css";

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
    TextField,
    Select,
    MenuItem,
    InputLabel, 
    Checkbox, 
    ListItemText } from '@mui/material';

/* const Transition = React.forwardRef(function Transition(props, ref) {
	return <Slide direction="up" ref={ref} {...props} />;
}); */

// NewNote propTypes and component

NewNote.propTypes = {
    open: PropTypes.bool,
    buttonType: PropTypes.string,
    noteForEdit: PropTypes.object,
    handleClose: PropTypes.func,
    classes: PropTypes.array,
    badges: PropTypes.array,
    studentClass: PropTypes.string
}

function NewNote({open, buttonType, noteForEdit, handleClose, classes, badges, studentClass }) {

    console.log('buttonType',buttonType)
    const note = noteForEdit
    let initNoteType
    if(buttonType === 'Edit'){
        initNoteType = note.noteType
    } else {
        initNoteType = "ActionItem"
    }

    console.log('in newnote4 classes and badges are '+JSON.stringify(classes)+" "+JSON.stringify(badges))
    console.log(studentClass)

    //const { currentUser, avatar } = useContext(UserContext)

    const { handleSubmit, control, setValue, watch } = useForm();

    //const noteType = watch("noteType",initNoteType)

    let previousTermGoals
    let previousAssessment
    let previousActionItem

    if(buttonType === "Edit"){
        console.log(note)
        console.log(new Date().getTime())
        const fields = ['title','status','plannedHrs','completedHrs','actionType','noteType','rt','targetDate','badges','evidence','studentClass','crits']
        fields.forEach(field => {
            if(Object.prototype.hasOwnProperty.call(note,field)){
                if(field === 'targetDate'){
                    setValue(field, new Date(1000*note[field].seconds))
                    console.log('targetDate seconds is '+JSON.parse(JSON.stringify(note[field])).seconds)
                } else if(field === 'studentClass'){
                    setValue(field, studentClass)
                    console.log('student class '+JSON.stringify(studentClass))
                } else if(field === 'rt'){
                    if(note[field] === ""){
                        setValue(field,note['body'])
                        console.log('no rt')
                    } else {
                        setValue(field,note['rt'])
                    }
                } else {
                    setValue(field, note[field]);
                }
                console.log("value of a field is "+JSON.stringify(note[field]))
            } else {
                console.log("this note is missing the key: "+field)
            }
        })
        if(note.noteType === "TermGoals"){
            previousTermGoals = {
                classId: note.studentClass.value,
                className: note.studentClass.label,
                noteId: note.id,
                startDate: note.ts_msec,
                crits: note.crits
            }
            console.log(previousTermGoals)
        } else if(note.noteType === "Assessment"){
            previousAssessment = {
                classId: note.studentClass.value,
                className: note.studentClass.label,
                noteId: note.id,
                plannedDate: note.ts_msec,
                crits: note.crits
            }
            console.log(previousAssessment)
        } else if(note.noteType === "ActionItem"){
            previousActionItem = {
                classId: note.studentClass.value,
                className: note.studentClass.label,
                noteId: note.id,
                ts_msec: note.ts_msec,
                title: note.title,
                body: note.body
            }  
            console.log(previousActionItem)
        }

    } else {
        //setValue("studentClass",studentClass)
    }

    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;
    const MenuProps = {
        PaperProps: {
          style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
          },
        },
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "left"
        },
        transformOrigin: {
          vertical: "top",
          horizontal: "left"
        },
        //getContentAnchorEl: null
      };
    
    console.log('in newnote4 classes and badges are '+JSON.stringify(classes)+" "+JSON.stringify(badges))


    const dataList = badges

    const evidenceList = [
        {label:'Notebook-Notes',value: 'Notebook-Notes'},
        {label:'Video', value: 'Video'},
        {label:'Report', value: 'Report'},
        {label:'TestQuiz', value: 'Test/Quiz'}
    ];

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

    dayjs.extend(relativeTime);

    function onSubmit(data) {
        console.log('onSubmit',data)

    }

    const rightNow = new Date()

    return (<></>)

    /* return (                
        <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
            <AppBar sx={{position: 'relative'}} >
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
                        <CloseIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ml:2, flex:1}} >
                        {buttonType === 'Edit' ? 'Edit Note' : 'Create a new Note '}
                    </Typography>
                    <Button
                        autoFocus
                        color="inherit"
                        onClick={handleSubmit(onSubmit)}
                        sx={{
                            display: 'block',
                            color: 'white',
                            textAlign: 'center',
                            position: 'absolute',
                            top: 14,
                            right: 10
                        }}
                    >
                        {buttonType === 'Edit' ? 'Save' : 'Submit'}
                    </Button>
                </Toolbar>
            </AppBar>

            <form>
            <Box sx={{
                width: '98%',
                marginLeft: 2,
                marginTop: 3
            }} noValidate>
                <Grid container spacing={2}>
                    
                    <Grid item xs={4} key="studentClass">
                        <InputLabel id="studentClass">Class</InputLabel>
                        <Controller
                            name="studentClass"
                            control={control}
                            defaultValue={null}
                            render={({ field: { onChange, value } }) => (
                            <Select
                                labelId="studentClass"
                                id="studentClass"
                                value={value}
                                defaultValue={classes[0]}
                                label="Classes"
                                onChange={onChange}
                            >
                                {classes && classes.length && classes.map(aClass => (
                                <MenuItem key={aClass.value} value={aClass}>
                                    <ListItemText primary={aClass.label} />
                                </MenuItem>
                                ))}
                            </Select>
                            )}
                        />
                    </Grid>
                    <Grid item xs={4} key="noteType">
                        <InputLabel id="noteType label">Note Type</InputLabel>
                        <Controller
                            name="noteType"
                            control={control}
                            defaultValue="ActionItem"
                            render={({ field: { onChange, value } }) => (
                            <Select
                                labelId="noteType label"
                                id="noteType"
                                value={value}
                                defaultValue="ActionItem"
                                label="Note Type"
                                onChange={onChange}
                            >
                                <MenuItem value={"ActionItem"}>Action Item</MenuItem>
                                <MenuItem value={"Assessment"}>Assessment</MenuItem>
                                <MenuItem value={"Plan"}>Current Plans</MenuItem>
                                <MenuItem value={"TermGoals"}>Term Goals</MenuItem>
                            </Select>
                            )}
                        />
                    </Grid>
                    <Grid item xs={4} key="status">
                        <InputLabel id="status">Status</InputLabel>
                        <Controller
                            name="status"
                            control={control}
                            defaultValue="Active"
                            render={({ field: { onChange, value } }) => (
                            <Select
                                labelId="status"
                                id="status"
                                value={value}
                                defaultValue="Active"
                                label="Status"
                                onChange={onChange}
                            >
                                <MenuItem value={"Active"}>Active</MenuItem>
                                <MenuItem value={"Archived"}>Archived</MenuItem>
                                <MenuItem value={"Paused"}>Paused</MenuItem>
                            </Select>
                            )}
                        />
                    </Grid>
                    <Grid item xs={4} key='planned-hrs'>
                        <Box sx={{display: noteType === 'ActionItem' || noteType === 'Plan' ? 'block' : 'none'}}>
                        <Controller
                            name="plannedHrs"
                            control={control}
                            defaultValue="2"
                            render={({ field: { onChange, value } }) => (
                                <TextField
                                    variant="outlined"
                                    required
                                    id="plannedHrs"
                                    label="Planned Hours"
                                    name="plannedHrs"
                                    autoComplete="plannedHrs"
                                    value={value}
                                    onChange={onChange}
                                />
                            )}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={4} key='completedHrs'>
                        <Box sx={{display: noteType === 'ActionItem' || noteType === 'Plan' ? 'block' : 'none'}}>
                        <Controller
                            name="completedHrs"
                            control={control}
                            defaultValue="0"
                            render={({ field: { onChange, value } }) => (
                            <TextField
                                variant="outlined"
                                required
                                id="completedHrs"
                                label="Completed Hours"
                                name="completedHrs"
                                autoComplete="completedHrs"
                                value={value}
                                onChange={onChange}
                            />
                            )}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={4} sm={4} key='date' sx={{mt:1}}>
                        <InputLabel id="date label">Target Date</InputLabel>
                        <Controller
                            name="targetDate"
                            control={control}
                            defaultValue={rightNow}
                            render={({ field: { onChange, value } }) => (
                            <DatePicker
                                value={value}
                                defaultValue={rightNow}
                                onChange={onChange}
                                renderInput={(params) => <TextField {...params} />}
                            />
                            )}
                        />
                    </Grid>
                    <Grid item xs={4} key='crits'>
                        <Box sx={{display: noteType === 'TermGoals' || noteType === 'Assessment' ? 'block' : 'none'}}>
                        <Controller
                            name="crits"
                            control={control}
                            defaultValue="100"
                            render={({ field: { onChange, value } }) => (
                            <TextField
                                variant="outlined"
                                required
                                id="crits"
                                label="crits Target"
                                name="crits"
                                autoComplete="crits"
                                value={value}
                                onChange={onChange}
                            />
                            )}
                            />
                        </Box>
                    </Grid>


                    <Grid item xs={4} key="chipsBadges">
                    <Box sx={{display: noteType === 'ActionItem' ? 'flex' : 'none', flexDirection:'column'}}>
                        <InputLabel id="Badges">Badges</InputLabel>
                        <Controller
                            name="badges"
                            control={control}
                            defaultValue={[]}
                            render={({ field: { onChange, value } }) => (
                            <Select
                                labelId="chipsBadges"
                                id="chipsBadges"
                                multiple
                                value={value}
                                onChange={onChange}
                                defaultValue=""
                                renderValue={() => value + ' '}
                                MenuProps={MenuProps}
                                label="Badges"
                            >
                            {dataList && dataList.map((option) => (
                                <MenuItem key={option} value={option}>
                                    <Checkbox checked={value.indexOf(option) > -1} />
                                    <ListItemText primary={option} />
                                </MenuItem>
                            ))}
                            </Select>
                            )}
                            />
                    </Box>                    
                    </Grid>    

                    <Grid item xs={4} key="chipsEvidence">
                    <Box sx={{display: noteType === 'ActionItem' || noteType === 'Assessment' ? 'flex' : 'none', flexDirection: 'column'}}>
                        <InputLabel id="Badges">Evidence</InputLabel>
                        <Controller
                            name="evidence"
                            control={control}
                            defaultValue={[]}
                            render={({ field: { onChange, value } }) => (
                            <Select
                                labelId="evidence"
                                id="evidence"
                                multiple
                                value={value}
                                onChange={onChange}
                                defaultValue={[]}
                                renderValue={() => value + ' '}
                                MenuProps={MenuProps}
                                label="Badges"
                            >
                            {evidenceList.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    <Checkbox checked={value.indexOf(option.value) > -1} />
                                    <ListItemText primary={option.label} />
                                </MenuItem>
                            ))}
                            </Select>
                            )}
                            />
                    </Box>                    
                    </Grid>  

                    <Grid item xs={4} key="actionType">
                        <Box sx={{display: noteType === 'ActionItem' ? 'block' : 'none'}}>
                            <InputLabel id="action-type-label">Action Type</InputLabel>
                            <Controller
                            name="actionType"
                            control={control}
                            defaultValue="ProblemSolving"
                            render={({ field: { onChange, value } }) => (
                            <Select
                                labelId="action-type-label"
                                id="action-type"
                                value={value}
                                defaultValue="ProblemSolving"
                                label="Action Type"
                                onChange={onChange}
                            >
                                <MenuItem value={"ProblemSolving"}>Problem Solving</MenuItem>
                                <MenuItem value={"ResearchStudy"}>Research Study</MenuItem>
                                <MenuItem value={"HandsOn"}>Hands On</MenuItem>
                                <MenuItem value={"DataAnalysis"}>Data Analysis</MenuItem>
                                <MenuItem value={"Communicating"}>Communicating</MenuItem>
                            </Select>
                            )}
                            />
                        </Box>
                    </Grid>

                    <Grid item xs={12} key='title'>
                    <Controller
                            name="title"
                            control={control}
                            defaultValue=""
                            render={({ field: { onChange, value } }) => (
                        <TextField
                            variant="outlined"
                            required
                            fullWidth
                            id="noteTitle"
                            label="Note Title"
                            name="title"
                            autoComplete="noteTitle"
                            value={value}
                            onChange={onChange}
                        />
                            )}
                            />
                    </Grid>

                    <Grid item xs={12} sm={6} key='rt'>
                        <Controller
                            name="rt"
                            control={control}
                            defaultValue=""
                            render={({ field: { onChange, value } }) => (
                            <ReactQuill
                                theme="snow"
                                value={value}
                                onChange={onChange}
                                placeholder={"Add notes and links here..."}
                                modules={modules}
                                formats={formats}
                            />
                            )}
                        /> 
                    </Grid>
                </Grid>
            </Box>
            </form>
        </Dialog>
    ); */
}

export default NewNote;
