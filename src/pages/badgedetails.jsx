import { useState, useContext } from 'react'
import { db, storage } from '../firebase';
import { doc, query, getDocs, updateDoc, where, collection, addDoc, arrayRemove, arrayUnion } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { UserContext } from '../contexts/usercontext';

import { useLoaderData, useNavigate, useParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CircularProgress from '@mui/material/CircularProgress';
import { Dialog, Typography, Button, ButtonGroup, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Paper, Card, CardMedia, DialogContent } from '@mui/material'

export default function BadgeDetails() {

    const { badgeId } = useParams()
    const { currentUser, isAdmin } = useContext(UserContext)
    const [ refresh, setRefresh ] = useState(false)

    const uiLoading = false
    const [ badgeAddDialog, setAddBadgeDialog ] = useState(false)

    const navigate = useNavigate()
    
    const badgeDetails = useLoaderData()
    console.log(badgeDetails)
    const previousBadgeSummary = {
        badgename: badgeDetails.badgename,
        id: badgeId,
        description: badgeDetails.description,
        imageUrl: badgeDetails.imageUrl,
        badgelevel: parseInt(badgeDetails.badgelevel),
        totalcrits: parseInt(badgeDetails.totalcrits),
        status: badgeDetails.status
    }

    const handleViewClose = () => setAddBadgeDialog(false);

    const handleAddBadge = (e) => {
        e.preventDefault()
        if(badgeDetails.status && badgeDetails.status === "Published"){
            const checkAddBadge = async () => {
                const myBadgesColRef = collection(db,'users',currentUser.uid,'myBadges')
                const queryRef = query(myBadgesColRef,where("uid","==",currentUser.uid),where("badgename","==",badgeDetails.badgename))
                const querySnapshot = await getDocs(queryRef)
                console.log('number of docs in snapshot is '+querySnapshot.docs.length)
                if(querySnapshot.docs.length === 0){
                    const userMyBadgesRef = collection(db,'users',currentUser.uid,'myBadges')
                    console.log('we want to add ',{...badgeDetails,uid: currentUser.uid, progress:0})
                    await addDoc(userMyBadgesRef, {...badgeDetails,uid: currentUser.uid, progress:0})
                    .then((addedBadge)=>{
                        console.log('New badge aspiration added')
                        const newBadge = {
                            badgename:badgeDetails.badgename,
                            myBadgeId:addedBadge.id,
                            crits:badgeDetails.totalcrits,
                            critsAwarded: 0,
                            progress: 0,
                            evidence: []
                            }
                        const userDocRef = doc(db,'users',currentUser.uid)
                        updateDoc(userDocRef,{
                            [`myBadgesMap.${badgeId}`]:newBadge
                        })
                        setAddBadgeDialog(false)
                        navigate('/myBadges')
                    })
                } else {
                    setAddBadgeDialog(false)
                    alert('Maybe you already have this badge?')
                }
            }

            checkAddBadge()

        } else {
            alert('This badge is still under development! Check with your teacher about when it might be published.')
        }

    }

    const [ fileUpload, setFileUpload ] = useState(null)
  
    const onFileChange = async (e) => {
        setFileUpload(e.target.files[0])
    };

    const onSubmit = async () => {

        console.log('file upload name is '+fileUpload.name)
  
        const fileRef = ref(storage, fileUpload.name)
        await uploadBytes(fileRef, fileUpload)
        const downloadUrl = await getDownloadURL(fileRef)
        //console.log('waiting for download url '+await downloadUrl)
        const badgeIdRef = doc(db,"badges",badgeId)
        await updateDoc(badgeIdRef, {
            imageUrl: downloadUrl
        })
        alert("check to see if badge updated correctly")
        const badgeListRef = doc(db,"adminDocs", "badgeList")
        await updateDoc(badgeListRef, {
            badges: arrayRemove(previousBadgeSummary)
        })
        const updatedBadgeListItem = {
            ...previousBadgeSummary,
            imageUrl: downloadUrl
        }
        await updateDoc(badgeListRef, {
            badges: arrayUnion(updatedBadgeListItem)
        })
        console.log("update appears successful")
        setRefresh(!refresh)
  
    };

    console.log('reached the BadgeDetails component with id of '+badgeId)
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
        <>
            <Toolbar />
            {!isAdmin &&
                <IconButton
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    right: 0
                }}
                color="primary"
                aria-label="Add Badge"
                onClick={() => setAddBadgeDialog(true)}
                >
                    <AddCircleIcon sx={{ fontSize: 60 }} />
                </IconButton>
            }


            <Dialog
                onClose={handleViewClose}
                aria-labelledby="customized-dialog-title"
                open={badgeAddDialog}
                fullWidth
                classes={{ paperFullWidth: {maxWidth: '75%'} }}
            >
                <Paper elevation={2}
                sx={{
                    padding: 1,
                    backgroundColor: "#e0e0e0",
                    border: "1px solid black",
                    margin: "2px 2px 8px 2px"
                }}>
                    <DialogContent>
                        Do you want to add this as a Badge Aspiration? Once it is added, only the teacher will be able to remove it! But if you are ready to go for it, click Add and enjoy the challenge!
                    </DialogContent>
                    <Button variant='contained' onClick={handleAddBadge}>Add Badge</Button>
                </Paper>
            </Dialog>

            {isAdmin && 
            <ButtonGroup orientation='vertical'>
                <Button variant='contained' component='label' sx={{m:1}}>
                    Upload New Image
                    <input type="file" hidden onChange={onFileChange} />
                </Button>
                
                <Button variant='outlined' sx={{m:1}} onClick = {onSubmit}> Submit New Image </Button>
            </ButtonGroup>
            }

            <Box sx={{ flexGrow:1, p:3}} >
                <Box sx={{display:'flex', justifyContent: 'space-between'}}>
                <Box sx={{m:2, width:140}}>
                    <Typography variant='h4' >{badgeDetails.badgename}</Typography>
                </Box>
                <Box sx={{mx:'auto', width:280}}>
                    <Card sx={{ maxWidth: 280 }}>
                        <CardMedia
                            sx={{ p:1 }}
                            image={badgeDetails.imageUrl}
                            title="Badge Image"
                            component="img"
                        />
                    </Card>
                </Box>
                <Box sx={{m:2, width:140}}>
                    <Typography variant='h6' >Level: {badgeDetails.badgelevel}</Typography>
                    <Typography variant='h6' >Total Crits: {badgeDetails.totalcrits}</Typography>
                </Box>
                </Box>
                <Typography sx={{m:2, p:2}} variant='body1' >Description: {badgeDetails.description}</Typography>
                {badgeId && badgeDetails.criteria && 
                <TableContainer component={Paper} sx={{borderRadius:2, m:1, maxWidth:950}}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                        <TableRow>
                            <TableCell align="right" sx={{fontWeight:'bold',backgroundColor:(theme)=>theme.palette.secondary.main, color: (theme)=>theme.palette.getContrastText(theme.palette.secondary.main)}}>Criterion</TableCell>
                            <TableCell align="right" sx={{fontWeight:'bold',backgroundColor:(theme)=>theme.palette.secondary.main, color: (theme)=>theme.palette.getContrastText(theme.palette.secondary.main)}}>Level</TableCell>
                            <TableCell align="left" sx={{fontWeight:'bold',backgroundColor:(theme)=>theme.palette.secondary.main, color: (theme)=>theme.palette.getContrastText(theme.palette.secondary.main)}}>Description</TableCell>
                            <TableCell align="right" sx={{fontWeight:'bold',backgroundColor:(theme)=>theme.palette.secondary.main, color: (theme)=>theme.palette.getContrastText(theme.palette.secondary.main)}}>Total Crits</TableCell>
                        </TableRow>
                        </TableHead>
                        <TableBody>
                        {badgeDetails.criteria.map((row) => (
                            <TableRow
                            key={row.label}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                            <TableCell component="th" scope="row">
                                {row.label}
                            </TableCell>
                            <TableCell align="right">{row.level}</TableCell>
                            <TableCell align="left">{row.criterion}</TableCell>
                            <TableCell align="right" sx={{fontWeight:'bold'}}>{row.crits}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                }
                {!isAdmin &&
                    <Button onClick={() => setAddBadgeDialog(true)}>Add Badge?</Button>
                }
            </Box>

        </>
    )}
}
