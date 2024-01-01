import { useLocation } from 'react-router-dom'

import { Container, Paper, Toolbar } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2';


export default function StudentDetails() {

    const location = useLocation()
 
        console.log(location.state.something)
    
/*     useEffect(() => {
        
        if(studentId){
            return db.collection("users").doc(studentId).get()
            .then((doc)=> {
                if(doc.exists){
                    let studentData = doc.data()
                    setStudentDetails({...studentData, studentId: studentId})
                } else {
                    alert("I can't find that document")
                }
            })
        }

    }, [studentId]); */


    //console.log('reached the studentDetails component with id of '+studentId)
    return (
        <>
            <Toolbar />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Grid container spacing={3}>
                    {/* Chart */}
                    <Grid item xs={12} md={8} lg={9}>
                    <Paper
                        sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        height: 240,
                        }}
                    >
                        Write a lot of text to see what happens to the grid
                    </Paper>
                    </Grid>
                    {/* Recent Deposits */}
                    <Grid item xs={12} md={4} lg={3}>
                    <Paper
                        sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        height: 240,
                        }}
                    >
                        Write some more here to see what happens with this text in the corresponding paper
                    </Paper>
                    </Grid>
                    {/* Recent Orders */}
                    <Grid item xs={12}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        idFromStudent is {location.state.something}
                    </Paper>
                    </Grid>
                </Grid>
            </Container>
        </>
    )
}
