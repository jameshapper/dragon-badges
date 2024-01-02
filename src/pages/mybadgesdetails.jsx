import { useContext } from 'react'
import { UserContext } from '../contexts/usercontext'
import Progress from './progressbar'
import { Link, useLoaderData } from 'react-router-dom'

//import { AssignmentInd } from '@material-ui/icons';

import { 
    Typography, 
    Button, 
    Paper, 
    Toolbar, 
    Box, 
    Table, 
    TableContainer, 
    TableHead, 
    TableBody, 
    TableRow, 
    TableCell } from '@mui/material'

export default function MyBadgeDetails() {

    const { isAdmin } = useContext(UserContext)
    const badgeDetails = useLoaderData()
    const studentName = "Temp Name"
    const studentId = badgeDetails.studentId 
    const myBadgeId = badgeDetails.myBadgeId

    const critsColor = (critsAward, critsMax) => {

        if(critsMax === 0){
            return
        }
        const percentTotal = 100*critsAward/critsMax
        if(percentTotal >= 90) {
            return 'skyblue'
        }else if(percentTotal >= 65){
            return 'lightgreen'
        }else if(percentTotal >= 40){
            return 'yellow'
        }else {
            return 'lightpink'
        }
    }

    return (
        <>
            <Toolbar />
            {console.log(badgeDetails)}

            <Box sx={{m:2, display: 'flex', justifyContent: 'space-between'}}>
            <Typography variant="h4">
                {badgeDetails.badgename}
            </Typography>
            <Box>
                <Typography>Current Progress</Typography>
                <Progress done={badgeDetails.progress} />
            </Box>
            <Typography variant="h5">
                Student: {studentName}
            </Typography>
            </Box>
            <Box sx={{m:2}}>
            <Typography variant='h6' >Level: {badgeDetails.badgelevel}</Typography>
            <Typography variant='h6' >Total Crits: {badgeDetails.totalcrits}</Typography>
            <Typography variant='body1'>Description: {badgeDetails.description}</Typography>
            </Box>
            <Box sx={{flexGrow:1, p:3}} >

                {myBadgeId && badgeDetails.criteria && 
                <>
                {isAdmin &&
                <Button component={Link} to={{pathname: '/feedback', state: {selectedStudentId: studentId, badgeDetails: badgeDetails, selectedStudentName: studentName} }} >
                    Add Feedback
                </Button>
                }
                <TableContainer component={Paper} sx={{borderRadius:2, m:1, maxWidth:950}}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                        <TableRow>
                            <TableCell align="left" sx={{fontWeight:'bold',backgroundColor:(theme)=>theme.palette.secondary.main, color: (theme)=>theme.palette.getContrastText(theme.palette.secondary.main)}}>Criterion</TableCell>
                            <TableCell align="right" sx={{fontWeight:'bold',backgroundColor:(theme)=>theme.palette.secondary.main, color: (theme)=>theme.palette.getContrastText(theme.palette.secondary.main)}}>Level</TableCell>
                            <TableCell align="left" sx={{fontWeight:'bold',backgroundColor:(theme)=>theme.palette.secondary.main, color: (theme)=>theme.palette.getContrastText(theme.palette.secondary.main)}}>Description</TableCell>
                            <TableCell align="right" sx={{fontWeight:'bold',backgroundColor:(theme)=>theme.palette.secondary.main, color: (theme)=>theme.palette.getContrastText(theme.palette.secondary.main)}}>Total Crits</TableCell>
                            <TableCell align="right" sx={{fontWeight:'bold',backgroundColor:(theme)=>theme.palette.primary.main, color: (theme)=>theme.palette.getContrastText(theme.palette.primary.main)}}>Awarded Crits</TableCell>
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
                            <TableCell align="center" sx={{fontWeight:'bold', fontSize:24, color:(theme)=>theme.palette.primary.main}}>{row.critsAwarded}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                </>
                }
            </Box>

            <Typography variant="h4">
                Evidence and Feedback
            </Typography>

           <Box sx={{flexGrow:1, p:3}} >

                {myBadgeId && badgeDetails.criteria && 
                <>
                <TableContainer component={Paper} sx={{borderRadius:2, m:1, maxWidth:950}}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                        <TableRow>
                            <TableCell align="left" sx={{fontWeight:'bold',backgroundColor:(theme)=>theme.palette.secondary.main, color: (theme)=>theme.palette.getContrastText(theme.palette.secondary.main)}}>Date</TableCell>

                            {badgeDetails.criteria.map(criterion => (
                                <TableCell key={criterion.label} align="left" sx={{fontWeight:'bold',backgroundColor:(theme)=>theme.palette.secondary.main, color: (theme)=>theme.palette.getContrastText(theme.palette.secondary.main)}}>{criterion.label}</TableCell>
                            ))}
                        </TableRow>
                        </TableHead>
                        <TableBody>
                            {badgeDetails.evidence && badgeDetails.evidence.map(evidence => (
                                <TableRow key={evidence.feedbackId}>
                                <TableCell>
                                    {evidence.createdAt.slice(0,10)}
                                </TableCell>
                                {badgeDetails.criteria.map(criterion => {
                                    const key = criterion.label
                                    return <TableCell key={criterion.label} align='center'><Box sx={{backgroundColor:critsColor(evidence.critsAwarded[key],evidence.critsMax[key]), borderRadius:50, width:30, height:30, alignItems:'center', justifyContent:'center', display:'center'}}>{evidence.critsAwarded[key]}</Box></TableCell>
                                })}
                                <TableCell >
                                    <Link to={`/students/${studentId}/myBadges/${myBadgeId}/feedback/${evidence.feedbackId}`}>Details</Link>
                                </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                </>
                }
            </Box>
        </>
    )
}
