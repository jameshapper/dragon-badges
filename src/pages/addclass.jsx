import { useContext, useState, useEffect } from 'react'
import { db } from '../firebase';
import { arrayUnion } from 'firebase/firestore';
import { UserContext } from '../contexts/usercontext';
import MultiSelect from "react-multi-select-component";

import { 
    Box, 
    Typography, 
    TextField, 
    Button, 
    Toolbar 
    } from '@mui/material';

import Grid from '@mui/material/Unstable_Grid2';

import { useHistory, useLocation } from 'react-router-dom';

export default function AddClass() {

    const { currentUser, isAdmin } = useContext(UserContext)
    const history = useHistory()
    const [ className, setClassName ] = useState("")
    const [ supportedBadges, setSupportedBadges ] = useState([])
    const [ badgesForSelect, setBadgesForSelect ] = useState([])
    const [ allBadges, setAllBadges ] = useState([])
    const classData = useLocation()

    const classId = classData.state ? classData.state.classId : null

    useEffect(() => {
        db.collection("adminDocs").doc("badgeList").get()
        .then(doc => {
            setAllBadges(doc.data().badges)
        })
    },[])

    useEffect(() => {
        const toLabelValue = allBadges.map((badge) => {
            return {
                label: badge.badgename,
                value: badge.id
            }
        })
        setBadgesForSelect(toLabelValue)
    },[allBadges])

    useEffect(() => {
        if(classId) {
            db.collection("users").doc(currentUser.uid).collection("teacherClasses").doc(classId).get()
            .then(doc => {
                console.log("there is already a class of this id "+doc.data().name)
                setClassName(doc.data().name)
                if(doc.data().supportedBadges){
                    setSupportedBadges(doc.data().supportedBadges)
                }
            })
        }
    },[classId, currentUser.uid])

    const handleSubmit = (e) => {
        e.preventDefault();

        if(!classId){
            console.log("trying to add a new class...")
            console.log("classname is "+className)
            console.log("handleSubmit has isAdmin "+isAdmin)
            const classesRef = db.collection("users").doc(currentUser.uid).collection("teacherClasses")
            classesRef.add({name:className, students:[], supportedBadges:supportedBadges})
            .then((doc) => {
                console.log("check to see if new class added correctly doc id"+doc.id)
                classesRef.doc(doc.id).get()
                .then((newClass) => {
                    db.collection("adminDocs").doc("classesList").update({
                        classes: arrayUnion({...newClass.data(), classId: doc.id})
                })
                //classesRef.doc(doc.id).collection("privateData").doc("private").set({students:[]})

                })
            })
            .then(() => {
                history.push('/classes')
            })
            .catch(error => {
                console.log("error loading new class", +error)
            })
        } else {
            const classesRef = db.collection("users").doc(currentUser.uid).collection("teacherClasses").doc(classId)
            classesRef.update({name:className, supportedBadges:supportedBadges})
            .then(() => {
                console.log("check to see if new class added correctly")
                db.collection("adminDocs").doc("classesList").get()
                .then(doc => {
                    const updatedClasses = doc.data().classes.map(aClass => {
                        if(aClass.classId === classId){
                            return {...aClass,name:className, supportedBadges:supportedBadges}
                        } else {
                            return aClass
                        }
                    })
                    console.log("updatedClasses is "+JSON.stringify(updatedClasses))
                    db.collection("adminDocs").doc("classesList").update({classes:updatedClasses})
                })
            })
            .then(() => {
                history.push('/classes')
            })
            .catch(error => {
                console.log("error loading new class", +error)
            })
        }

    }

    return (
        <div>
            <Toolbar />

            <Typography>Enter Class Details Below</Typography>
            <form onSubmit={handleSubmit}>
                <Box sx={{px:2}}>
                    <Button type="submit" variant="contained" color="primary" sx={{m:2}}>
                    Submit New Class
                    </Button>
                </Box>
                <Grid container spacing={2}>
                    <Grid item xs={10}></Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="Class Name"
                            variant="filled"
                            value={className}
                            onChange={(e) => {setClassName(e.target.value)}}
                        />
                    </Grid>
                    <Grid item xs={8}>
                        <div>
                            <h3>Select Supported Badges</h3>
                            <MultiSelect
                            options={badgesForSelect}
                            value={supportedBadges}
                            onChange={setSupportedBadges}
                            labelledBy={"Select"}
                            />
                        </div>
                    </Grid>
                </Grid>
            </form>
            
        </div>
    )
}
