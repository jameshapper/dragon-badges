import { useContext, useState, useEffect } from 'react'
import { db } from '../firebase';
import { arrayUnion, doc, getDoc, collection, addDoc, updateDoc } from 'firebase/firestore';
import { UserContext } from '../contexts/usercontext';
import { MultiSelect } from "react-multi-select-component";

import { 
    Box, 
    Typography, 
    TextField, 
    Button, 
    Toolbar 
    } from '@mui/material';

import Grid from '@mui/material/Unstable_Grid2';

import { useNavigate, useLocation } from 'react-router-dom';

export default function AddClass() {

    const { currentUser, isAdmin } = useContext(UserContext)
    const navigate = useNavigate()
    const [ className, setClassName ] = useState("")
    const [ supportedBadges, setSupportedBadges ] = useState([])
    const [ badgesForSelect, setBadgesForSelect ] = useState([])
    const [ allBadges, setAllBadges ] = useState([])
    const classData = useLocation()

    const classId = classData.state ? classData.state.classId : null
    console.log('current user id',currentUser.uid)

    useEffect(() => {
        getDoc(doc(db,"adminDocs","badgeList"))
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
            console.log('trying to get supported badges')
            getDoc(doc(db,"users",currentUser.uid,"teacherClasses",classId))
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
            const classesRef = collection(db,"users",currentUser.uid,"teacherClasses")
            addDoc(classesRef,{name:className, students:[], supportedBadges:supportedBadges})
            .then((doc) => {
                console.log("check to see if new class added correctly doc id"+doc.id)
                classesRef.doc(doc.id).get()
                .then((newClass) => {
                    updateDoc(doc(db,"adminDocs","classesList"),{
                        classes: arrayUnion({...newClass.data(), classId: doc.id})
                })
                //classesRef.doc(doc.id).collection("privateData").doc("private").set({students:[]})

                })
            })
            .then(() => {
                navigate('/classes')
            })
            .catch(error => {
                console.log("error loading new class", +error)
            })
        } else {
            const classesRef = doc(db,"users",currentUser.uid,"teacherClasses",classId)
            updateDoc(classesRef,{name:className, supportedBadges:supportedBadges})
            .then(() => {
                console.log("check to see if new class added correctly")
                getDoc(doc(db,"adminDocs","classesList"))
                .then(classListdoc => {
                    const updatedClasses = classListdoc.data().classes.map(aClass => {
                        if(aClass.classId === classId){
                            return {...aClass,name:className, supportedBadges:supportedBadges}
                        } else {
                            return aClass
                        }
                    })
                    console.log("updatedClasses is "+JSON.stringify(updatedClasses))
                    updateDoc(doc(db,"adminDocs","classesList"),{classes:updatedClasses})
                })
            })
            .then(() => {
                navigate('/classes')
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
                    <Grid xs={10}></Grid>
                    <Grid xs={6}>
                        <TextField
                            label="Class Name"
                            variant="filled"
                            value={className}
                            onChange={(e) => {setClassName(e.target.value)}}
                        />
                    </Grid>
                    <Grid xs={8}>
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
