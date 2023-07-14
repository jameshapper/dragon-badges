import { useState, useContext, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore'
import { Link, useLoaderData } from 'react-router-dom'

import { Typography,
         CircularProgress,
         Card,
         Toolbar,
         Button,
         CardMedia,
         CardContent,
         FormControl,
         InputLabel, 
         Select, 
         MenuItem, 
         TextField, 
         Tooltip,
         Box } from '@mui/material';

import Grid from '@mui/material/Unstable_Grid2';

import { UserContext } from '../contexts/usercontext';

// this method of getting data uses react router's loader and useLoaderData hook
export function loader() {
    return getBadges()
}
const badgesRef = doc(db, "adminDocs", "badgeList")

async function getBadges() {
    const badges = await getDoc(badgesRef)
    const badgeData = await badges.data().badges
    return badgeData
}
// end of loader

function Badges() {

    const { loading, isAdmin } = useContext(UserContext)

    //const [ badges, setBadges ] = useState([])
    const [ classesList, setClassesList ] = useState([])
    const [ selectedCourse, setSelectedCourse ] = useState("All Badges")
    const [ searchParam ] = useState(["badgename"]);
    const [ supportedBadgeIds, setSupportedBadgeIds ] = useState([])
    const [q, setQ] = useState("");

    const [ uiLoading, setUiLoading ] = useState(loading)

    const badges = useLoaderData()

/*     useEffect(() => {
        setUiLoading(true)
        const badgeListRef = doc(db,'adminDocs','badgeList')
        // ? https://devtrium.com/posts/async-functions-useeffect ? Cleanup?
        const fetchBadges = async () => {
            const badges = await getDoc(badgeListRef)
            const badgeData = await badges.data().badges
            setBadges(badgeData)
            setUiLoading(false)
        }

        fetchBadges() */
/*         return getDoc(badgeListRef)

        .onSnapshot(snapshot => {
            setBadges(snapshot.data().badges)
            setUiLoading(false)
        }) */
 //   }, []);

    useEffect(() => {
        setUiLoading(true)
        const classesListRef = doc(db,'adminDocs','classesList')
        const fetchClasses = async () => {
            const classes = await getDoc(classesListRef)
            const classesData = await classes.data().classes
            setClassesList(classesData)
            setUiLoading(false)
        }

        fetchClasses()
/*         return getDoc(classesListRef)

        .then(doc => {
            setClassesList(doc.data().classes)
            setUiLoading(false)
        }) */
    }, []);

    function search(badges) {
        return badges.filter((badge) => {
            if (supportedBadgeIds.includes(badge.id)) {
                return searchParam.some((newBadge) => {
                    return (
                        badge[newBadge]
                            .toString()
                            .toLowerCase()
                            .indexOf(q.toLowerCase()) > -1
                    );
                });
                //return true
            } else if (selectedCourse === "All Badges") {
                 return searchParam.some((newBadge) => {
                    return (
                        badge[newBadge]
                            .toString()
                            .toLowerCase()
                            .indexOf(q.toLowerCase()) > -1
                    );
                });
                //return true
            } else {return false}
        });
    }


    const handleCourseFilter = (event) => {

        if(event.target.value === "All Badges"){
            setSelectedCourse(event.target.value)
        } else {
            setSelectedCourse(event.target.value)
            const oneCourseObjectInArray = classesList.filter(course => {
                return course.classId === event.target.value
            })
            console.log(event.target.value)
            const supportedBadgeArray = oneCourseObjectInArray[0].supportedBadges
            setSupportedBadgeIds(supportedBadgeArray.map(badgeObj => {
                return badgeObj.value
            }))
            console.log("supported badge ids are "+JSON.stringify(supportedBadgeIds))
        }
    }

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
            <Box sx={{flexGrow:1, p:3}}>
            <Toolbar />
            <Grid container pb={3}>
                <Grid xs={12} pb={2}>
                {isAdmin &&
                    <Button component={Link} to={'/badgeForm'} size='small' variant='contained' >Add Badge</Button>
                }
                </Grid>
                <Grid xs={4}>
                    <FormControl fullWidth>
                        <TextField
                            id="search-course"
                            label="Badge search"
                            type="search"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />
                    </FormControl> 
                </Grid>
                <Grid xs={3}/>
                <Grid xs={3}>

                    <FormControl fullWidth sx={{ m: 1, width: 300 }}>
                    <InputLabel id="course-label">Course</InputLabel>
                    <Select
                        labelId="course-select-label"
                        defaultValue="All Badges"
                        id="course-select"
                        value={selectedCourse ? selectedCourse : "All Badges"}
                        label="Course"
                        onChange={handleCourseFilter}
                    >
                            <MenuItem key={"all courses"} value={"All Badges"}>All Badges</MenuItem>    

                        {classesList && classesList.map((eachClass) => (
                            <MenuItem key={eachClass.name} value={eachClass.classId}>{eachClass.name}</MenuItem>    
                        ))}

                    </Select>
                    </FormControl>
                    </Grid>
            </Grid>

            <Grid container spacing={3} justifyContent='space-around'>
                    {badges && badges.length>0 && search(badges).map((badge) => (
                        <Grid xs={12} sm={6} md={4} lg={3} key = {badge.id} p={2}>
                            <Card sx={{ maxWidth: 250, minWidth: 200, backgroundColor:'#eeeeee', pt:1 }}>
                                <Tooltip title={badge.description.substring(0, 200)+"..."}>
                                    <CardMedia
                                        sx={{ height: 100, width: 'auto', m:'auto' }}
                                        image={badge.imageUrl}
                                        component='img'
                                    />
                                </Tooltip>
                            <CardContent sx={{width: 'auto'}}>
                                <Box sx={{display: 'flex', justifyContent:'center'}}>
                                    <Typography fontWeight='bold' align='center' gutterBottom variant="subtitle1" component={Link} to={`/badges/${badge.id}`} >
                                    {badge.badgename}
                                    </Typography>
                                </Box>
                                <Box sx={{display: 'flex', justifyContent:'center'}}>
                                    <Box padding={1}>
                                        <Typography variant='subtitle2'>Lvl: {badge.badgelevel}</Typography>
                                    </Box>
                                    <Box padding={1}>
                                        <Typography variant='subtitle2'>Crits: {badge.totalcrits}</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{display: 'flex', justifyContent:'center'}}>
                                    {badge.status === "Dev" ? 'Development' : 'Published'}
                                </Box>
                            </CardContent>
                                {isAdmin && 
                                    <Button sx={{display: 'flex', justifyContent:'center'}} component={Link} to={`/badgeForm/${badge.id}`} size="small">Edit</Button>
                                }
                            </Card>
                        </Grid>
                    ))}
                </Grid>

            </Box>
        );
    }
}

export default Badges;