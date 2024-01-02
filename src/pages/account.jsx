import { useState, useContext, useEffect } from 'react';
import { db, storage } from '../firebase';
import { useNavigate } from 'react-router';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import ButtonGroup from '@mui/material/ButtonGroup';
import CircularProgress from '@mui/material/CircularProgress';
import { UserContext } from '../contexts/usercontext';
import Toolbar from '@mui/material/Toolbar';
import { Box } from '@mui/material';

//in styles = (theme) => etc. we had padding: theme.spacing(3). I don't know how to do this now.
//I probably want this const Offset = styled('div')(({ theme }) => theme.mixins.toolbar);
//see here https://next.material-ui.com/components/app-bar/
//Note that this is for the divs that are meant to shift content below the appbar

function Account() {

    const { currentUser, avatar, loading } = useContext(UserContext)

	const [ fileUpload, setFileUpload ] = useState(null)
	const [preview, setPreview] = useState()

	const navigate = useNavigate()
  
    const onFileChange = async (e) => {
        setFileUpload(e.target.files[0])
    };

	useEffect(() => {
		if (!fileUpload) {
            setPreview(undefined)
            return
        }
		// create the preview
		const objectUrl = URL.createObjectURL(fileUpload)
		setPreview(objectUrl)
	
		// free memory when ever this component is unmounted
		return () => URL.revokeObjectURL(objectUrl)
	}, [fileUpload])

	const Filevalidation = (file) => {
        // Check if any file is selected.
        if (file) {  
			const fsize = file.size;
			const fileKb = Math.round((fsize / 1024));
			// The size of the file.
			if (fileKb >= 1024) {
				alert(
					"File too Big, please reduce file size to less than 1mb");
			} else {return true}
		} else {return false}
    }
  
    const onSubmit = async () => {

        console.log('file upload name is '+fileUpload.name)
        
        if (Filevalidation(fileUpload)) {
            const storageRef = storage.ref();
            const fileRef = storageRef.child(fileUpload.name);
            await fileRef.put(fileUpload);
            let downloadUrl = await fileRef.getDownloadURL()
            console.log('waiting for download url '+await downloadUrl)
            db.collection("users").doc(currentUser.uid).update({
                avatar: await downloadUrl
            });
            await currentUser.updateProfile({
                photoURL: await downloadUrl
            })
            .then(function() {
            console.log("update appears successful")
            navigate('/')
            }).catch(function(error) {
                console.log('problem updating image ')
                console.log(error)
            });
        }
    };

    if (loading === true) {
        return (
            <Box sx={{flexGrow:1, p:3}}>
                <Toolbar />
                {loading && <CircularProgress size={150} sx={{
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
            <Box sx={{flexGrow:1,p:3}}>
                <Toolbar />
				<Grid container direction='column' align='center' spacing={2}>
					<Grid item xs={12}>
						<Avatar alt="User Avatar" src={avatar} sx={{
							height: 330,
							width: 300,
							flexShrink: 0,
							flexGrow: 0,
							marginTop: 2
						}} />
						<p>
							{' '}
							{currentUser && currentUser.displayName ? currentUser.displayName : "Welcome!"}
						</p>
					</Grid>
					{preview && 
					<Grid item xs={12}>
						<Avatar alt="User Avatar" src={preview} sx={{
								height: 330,
								width: 300,
								flexShrink: 0,
								flexGrow: 0,
								marginTop: 2
							}} />
						<p>Preview New Image</p>
						</Grid>
					}


					<Grid item xs={12}>

						<ButtonGroup orientation='vertical'>
							<Button variant='contained' component='label' sx={{m:1}}>
								Upload New Image
								<input type="file" hidden onChange={onFileChange} />
							</Button>
							
							<Button variant='outlined' sx={{m:1}} onClick = {onSubmit}> Submit New Image </Button>
						</ButtonGroup>

					</Grid>

				</Grid>


            </Box>
        );
    }
}

export default Account;
