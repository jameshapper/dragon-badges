import { useState } from 'react';
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
import { useLoaderData } from 'react-router-dom';

function Note() {
    console.log('made it to Note')

    const [ noteForEdit, setNoteForEdit ] = useState({})

    const [ open, setOpen ] = useState(false)
    const [ buttonType, setButtonType ] = useState('New')

    const [ studentClass, setStudentClass ] = useState({label: "", value: "see teacher to enroll in a class"})

    const { termGoals, currentPlans, summaryEvidence, classes, badges } = useLoaderData()
    const uiLoading = false

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
                        <Grid xs={5}>
                            <Typography variant='h5' sx={{mb:0}}>Student Dashboard</Typography>
                        </Grid>
                        <Grid xs={6} key="classesMenu" >
                        <FormControl sx={{ m: 1, minWidth: 100 }}>
                            <InputLabel id="ClassesMenu">Class</InputLabel>
                            <Select
                                labelId="classesMenu"
                                id="classesMenu"
                                value={studentClass}
                                label="Class"
                                onChange={onChange}
                                defaultValue={studentClass}
                            >
                            {classes.length && classes.map(aClass => (
                                <MenuItem key={aClass.value} value={aClass}>
                                    <ListItemText primary={aClass.label} />
                                </MenuItem>
                            ))}
                            </Select>
                            </FormControl>

                        </Grid>
                        
                        <Grid xs={1} key="addNoteIcon">
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

                {
                //open && classes && <NewNote open={open} handleClose={handleClose} buttonType={buttonType} noteForEdit={noteForEdit} classes={classes} badges={badges} studentClass={studentClass} />
                }
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
