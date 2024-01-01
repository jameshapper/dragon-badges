import { useContext } from 'react'
import { UserContext } from '../contexts/usercontext';
import { Link, useParams, useLoaderData } from 'react-router-dom';
import Progress from './progressbar';
import ListNotes from './listnotes'

import { Toolbar, Box, CardActionArea, CardMedia, Card, CardContent, Typography, Divider } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';


export default function MyBadges() {

    const { studentName, badgeList } = useLoaderData()

    const { studentId } = useParams()

    const { isAdmin } = useContext(UserContext)

    return (
        <Box sx={{flexGrow:1}}>
            <Toolbar/>
            <Typography variant="h6">Badges for {studentName}</Typography>
            <Divider sx={{mb:1}}/>
            <Grid container spacing={4} justify='center'>
                {badgeList.map((studentBadge) => (
                    <Grid xs={12} sm={6} key={studentBadge.badgename}>
                        <Card sx={{width:200, height:224}} variant="outlined">
                            <CardActionArea component={Link} to={`/students/${studentId}/myBadges/${studentBadge.id}`}>
                            <CardContent>
                                <Typography align="center" component="span" sx={{ fontSize: 16, mt:0 }}>
                                    {studentBadge.badgename}
                                </Typography>
                            </CardContent>
                            <CardMedia
                                image={studentBadge.imageUrl}
                                sx={{ margin:'auto', width: 'auto', height: 100, alignItems:'center' }}
                                component='img'
                                title='Badge Image'
                            />
                            </CardActionArea>
                            <CardContent>
                                <Progress done={studentBadge.progress} />
                            </CardContent>

                        </Card>
                    </Grid>
                ))}
            </Grid>
            {isAdmin && <ListNotes studentId={studentId} classes={[]} badges={[]} studentClass={''} />}
        </Box>
    )
}
