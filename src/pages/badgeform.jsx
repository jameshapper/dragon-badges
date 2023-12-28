import { useEffect } from 'react'
import { db } from '../firebase';
import { useNavigate, useParams, useLoaderData } from 'react-router';
import { doc, updateDoc, collection, addDoc, arrayRemove, arrayUnion } from "firebase/firestore";

import Toolbar from '@mui/material/Toolbar'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { FormControl, InputLabel, Select, MenuItem, Box, Typography, Grid, TextField, Button } from '@mui/material';

export default function BadgeForm() {

    const badgeData = useLoaderData()
    const navigate = useNavigate()
    const { badgeId } = useParams()
    const isAddMode = !badgeId

    const { handleSubmit, control, setValue } = useForm();

    // the fields array rewrites criteria from default values, rerendering the component
    const { fields, append, remove } = useFieldArray(
    {
        control,
        name: "criteria"
    }
    );

    console.log("isAddMode is "+isAddMode)
    console.log("and badgeId is "+badgeId)

    // the "criteria" field is an array of objects with fields label, level, crits, and criterion
    // this leads to an infinite loop and I don't know why. useEffect below avoids this
/*     if(!isAddMode){
        const badgeFields = ['badgename', 'badgelevel', 'description', 'issuer', 'totalcrits','criteria','status']
        badgeFields.forEach(field => {
            setValue(field, badgeData[field]);
            console.log("value of a field is "+JSON.stringify(badgeData[field]))
        })
    } */

    // this component still seems to render twice even without strict mode
    // Okay, I think this is because UserContext runs twice as "admin" is checked upon refresh?
    useEffect(() => {
        console.log('useEffect firing...')
        if(!isAddMode){
            const badgeFields = ['badgename', 'badgelevel', 'description', 'issuer', 'totalcrits','criteria','status']
            badgeFields.forEach(field => {
                setValue(field, badgeData[field]);
            })
        }
    },[badgeData, isAddMode, setValue])

    const previous = {
        badgename: badgeData ? badgeData.badgename : '',
        id: badgeId,
        description: badgeData ? badgeData.description : '',
        imageUrl: badgeData ? badgeData.imageUrl : '',
        badgelevel: badgeData ? badgeData.badgelevel : 100,
        totalcrits: badgeData ? badgeData.totalcrits : 0,
        status: badgeData ? badgeData.status : 'dev'
    }

    function onSubmit(data) {
        return isAddMode
            ? newBadge(data)
            : updateBadge(badgeId, data);
    }

    async function newBadge(data) {

        data.criteria.forEach(function(criterion) {criterion.critsAwarded=0})
        console.log(data);

        const newBadgeRef = await addDoc(collection(db,"badges"), {
            imageUrl:"https://via.placeholder.com/150",...data
        })
        const newBadgeListItem = {
            badgename: data.badgename,
            imageUrl: "https://via.placeholder.com/150",
            description: data.description,
            badgelevel: parseInt(data.badgelevel),
            totalcrits: parseInt(data.totalcrits),
            id: newBadgeRef.id,
            status: data.status
        }
        const badgeListRef = doc(db,"adminDocs", "badgeList")
        await updateDoc(badgeListRef,{
            badges: arrayUnion(newBadgeListItem)
        })
        navigate('/badges')
        // add error handling somehow
    }

    async function updateBadge(docId, data) {
        const badgeRef = doc(db, "badges", badgeId)
        await updateDoc(badgeRef,{...data})
        const badgeListRef = doc(db,"adminDocs", "badgeList")
        await updateDoc(badgeListRef,{
            badges: arrayRemove(previous)
        })
        const updatedBadgeListItem = {
            badgename: data.badgename,
            description: data.description,
            id: docId,
            badgelevel: parseInt(data.badgelevel),
            totalcrits: parseInt(data.totalcrits),
            imageUrl: previous.imageUrl,
            status: data.status
        }
        await updateDoc(badgeListRef,{
            badges: arrayUnion(updatedBadgeListItem)
        })
        navigate('/badges')
        // add error handling
    }

    return (
        <div>
            <Toolbar/>

            <Typography>New Badge Form</Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Box sx={{px:2}}>
                    <Button onClick={() => navigate('/badges')} variant="contained" sx={{m:2}}>
                    Cancel
                    </Button>
                    <Button type="submit" variant="contained" color="primary" sx={{m:2}}>
                    Submit Badge
                    </Button>
                    <Controller
                        name="status"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }}) => (
                            <FormControl fullWidth sx={{ m: 1, width: 150 }}>
                            <InputLabel id="course-label">Status</InputLabel>
                            <Select
                                labelId="status-label"
                                id="status"
                                value={value}
                                label="Status"
                                onChange={onChange}
                            >
                                <MenuItem value={"Dev"}>Dev</MenuItem>
                                <MenuItem value={"Published"}>Published</MenuItem>
                            </Select>
                            </FormControl>
                        )}
                    />
                </Box>
                <Grid container spacing={2}>
                    <Grid item xs={10}></Grid>
                    <Grid item xs={6}>
                        <Controller
                        name="badgename"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <TextField
                            label="Badge Name"
                            variant="filled"
                            value={value}
                            onChange={onChange}
                            error={!!error}
                            helperText={error ? error.message : null}
                        />
                        )}
                        rules={{ required: 'Badge name required' }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <Controller
                        name="badgelevel"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <TextField
                            label="Badge Level"
                            type="number"
                            variant="filled"
                            value={value}
                            onChange={onChange}
                            error={!!error}
                            helperText={error ? error.message : null}
                        />
                        )}
                        rules={{ required: 'Badge level required' }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <Controller
                        name="issuer"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <TextField
                            label="Issuer"
                            variant="filled"
                            value={value}
                            onChange={onChange}
                            error={!!error}
                            helperText={error ? error.message : null}
                        />
                        )}
                        rules={{ required: 'Issuer required' }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <Controller
                        name="totalcrits"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <TextField
                            label="Total Crits"
                            type="number"
                            variant="filled"
                            value={value}
                            onChange={onChange}
                            error={!!error}
                            helperText={error ? error.message : null}
                        />
                        )}
                        rules={{ required: 'Total crits required' }}
                        />
                    </Grid>
                    <Grid item xs={10}>
                        <Controller
                        name="description"
                        control={control}
                        defaultValue=""
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Description"
                            variant="filled"
                            value={value}
                            onChange={onChange}
                            error={!!error}
                            helperText={error ? error.message : null}
                        />
                        )}
                        rules={{ required: 'Description required' }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography>Add Criteria Below as Needed</Typography>
                    </Grid>
                </Grid>
                
                <Box sx={{m:2}}>
                <Grid container spacing={2} >
                {fields.map((item, index) => {
                    //console.log(fields.length)
                return (
                    <Box key={item.id} sx={{display:'flex'}} >
                    <Grid item md={2} sx={{p:0.5}}>
                    <Controller
                        render={({ field }) => 
                            <TextField {...field} 
                                variant="filled"
                                label="Criterion Label"
                            />}
                        name={`criteria.${index}.label`}
                        control={control}
                        defaultValue={'add label'} // make sure to set up defaultValue
                    />
                    </Grid>
                    <Grid item md={1} sx={{p:0.5}}>
                    <Controller
                        render={({ field }) => 
                            <TextField {...field} 
                                variant="filled"
                                label="Level"
                            />}
                        name={`criteria.${index}.level`}
                        control={control}
                        defaultValue={100} // make sure to set up defaultValue
                    />
                    </Grid>
                    <Grid item md={1} sx={{p:0.5}}>
                    <Controller
                        render={({ field }) => 
                            <TextField {...field} 
                                variant="filled"
                                label="Crits"
                            />}
                        name={`criteria.${index}.crits`}
                        control={control}
                        defaultValue={7} // make sure to set up defaultValue
                    />
                    </Grid>
                    <Grid item md={7} sx={{p:0.5}}>
                    <Controller
                        render={({ field }) => 
                            <TextField {...field} 
                                variant="filled"
                                label="Criterion Description"
                                fullWidth
                            />}
                        name={`criteria.${index}.criterion`}
                        control={control}
                        defaultValue={'add criterion'} // make sure to set up defaultValue
                    />
                    </Grid>
                    <Grid item md={1}>
                    <Button type="button" variant="outlined" onClick={() => remove(index)}>
                        Delete
                    </Button>
                    </Grid>
                    </Box>
                );
                })}
                </Grid>
                </Box>
                <Button
                    type="button"
                    variant="outlined"
                    onClick={() => {
                        append({ label: "", crits: 10, level: 100, criterion:"what to do" });
                    }}
                    >
                    append
                </Button>

            </form>
        </div>
    )
}
