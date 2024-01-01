import { useState } from 'react'
/** @jsxImportSource @emotion/react */

import ViewNotes from './viewnotes'
import NewNote from './newnote'
import PropTypes from 'prop-types';

import dayjs from 'dayjs';

import Grid from '@mui/material/Unstable_Grid2';

import {
    Box, 
    Avatar,
    List, 
    ListItem, 
    ListItemIcon } from '@mui/material';

import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit'

// ListGoals propTypes and component

ListGoals.propTypes = {
    notes: PropTypes.array,
    canEdit: PropTypes.bool,
    classes: PropTypes.array,
    badges: PropTypes.array,
    studentClass: PropTypes.object
}

export default function ListGoals({notes, canEdit, classes, badges, studentClass}) {

    const PlansIcon = "https://firebasestorage.googleapis.com/v0/b/dragon-badges.appspot.com/o/GoalTargetEditted.png?alt=media&token=698c0dac-eba1-484b-b04c-261148771b9f"
    const GoalsIcon = "https://firebasestorage.googleapis.com/v0/b/dragon-badges.appspot.com/o/GoalToInkscapeEditted.svg?alt=media&token=ee22f16f-bf83-4c0c-9a60-f47714d59145"

    const [ viewOpen, setViewOpen ] = useState(false)
    const [ open, setOpen ] = useState(false)
    const [ note, setNote ] = useState({})

    const handleEditOpen = (note) => {
        setNote(note)
        setOpen(true)
	}

    const handleClose = () => {
        setOpen(false)
    }

    const handleViewOpen = (note) => {
        setNote(note)
        setViewOpen(true)
	}

    const handleViewClose = () => {
        setViewOpen(false)
    }
    
    return (
        <div>
            <Grid container spacing={{ xs: 2, md: 2, lg:2 }}>
                {notes.map((note) => (
                    <Grid xs={12} md={6} lg={6} key = {note.id}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'left',
                                bgcolor: 'background.paper',
                                overflow: 'hidden',
                                borderRadius: '12px',
                                boxShadow: 1,
                                fontWeight: 'bold',
                                justifyContent: 'space-between',
                                maxWidth:350,
                                minWidth:250,
                                minHeight:125
                            }}
                        >
                            <Box
                                sx={{
                                    display:'flex',
                                    flexDirection: 'row',
                                    alignItems: 'left',
                                    justifyContent:'left',
                                    p: 1
                                }}
                            >
                                <Box
                                    sx={{
                                    height: 75,
                                    width: 100,
                                    maxHeight: 75,
                                    maxWidth: 100,
                                    ml:1
                                    }}
                                >
                                    {note.noteType === "TermGoals" ? 
                                        <Avatar aria-label="recipe" sx={{height: 75, width: 75}} src={GoalsIcon} /> :
                                        <Avatar aria-label="recipe" sx={{height: 75, width: 75}} src={PlansIcon} />
                                    }
                                    <Box sx={{ ml:0, width: 5 }}>
                                        <List sx={{display:'flex', flexDirection: 'row'}}>
                                            <ListItem 
                                            button
                                            key="viewNoteFromLC"
                                            onClick={() => handleViewOpen( note )}
                                            >
                                                <ListItemIcon ><VisibilityIcon fontSize='small'/></ListItemIcon>
                                            </ListItem>
                                        {canEdit && <>
                                            <ListItem 
                                            button
                                            key="editNoteFromLC"
                                            onClick={() => handleEditOpen( note )}
                                            >
                                                <ListItemIcon ><EditIcon fontSize='small'/></ListItemIcon>
                                            </ListItem>
                                        </>}

                                        </List>
                                    </Box>
                                </Box>
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'left',
                                    m: 1,
                                    minWidth: { md: 150, lg: 150 },
                                    width:200
                                    }}
                                >
                                    <Box component="span" sx={{ fontSize: 10, mt:0 }}>
                                        {note.title}
                                    </Box>
                                    <Box color="text.secondary" component="span" sx={{ fontSize: 10, m:1 }}>
                                        {dayjs(note.createdAt).fromNow()+" by "+note.author}
                                    </Box>
                                    <Box color="text.secondary" component="span" sx={{ ml:1, fontSize: 10 }}>
                                        {note.body.substring(0, 65)+"..."}
                                    </Box>
                                </Box>


                            </Box>
                        </Box>
                    </Grid>
                ))}
            </Grid>

            <ViewNotes note={note} handleViewClose={handleViewClose} viewOpen={viewOpen}/>

            {open && 
                <NewNote open={open} handleClose={handleClose} buttonType={"Edit"} noteForEdit={note} classes={classes} badges={badges} studentClass={studentClass} />
            }

        </div>
    )
}
