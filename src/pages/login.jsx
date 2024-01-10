import { useEffect, useContext, useState } from "react";
import { auth, db } from "../firebase"
import { GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo } from "firebase/auth";

import { getDoc, doc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";

import Button from '@mui/material/Button';
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/usercontext"
import { Navigate } from 'react-router-dom';
import { Box } from "@mui/material";

function Login() {

	const value = useContext(UserContext);
	//console.log('value', value)
	
	let navigate = useNavigate()

	const [redirect, setredirect] = useState(null);

	useEffect(() => {
		if (!value.loading) {
			if (value.currentUser) {
				setredirect('/')
			}
		}
	}, [value.loading, value.currentUser])

	if (redirect) {
		return <Navigate to={redirect}/>
	}

	if (value.loading) {
		return <div>Loading!</div>
	}

    const signInWithGoogle = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
        .then((user) => {
		//after we have the credential - lets check if the user exists in firestore
		console.log('user object ', user)

        const {isNewUser} = getAdditionalUserInfo(user)
        console.log('isNewUser is ', isNewUser)
		const docRef = doc(db,'users',user.user.uid)
		getDoc(docRef).then(doc => {
            if (doc.exists()) {
			//user exists then just update the login time
			console.log("User exists already and data is ")
			console.log(doc.data())
			if(Object.prototype.hasOwnProperty.call(doc.data(),"admin")){
                console.log(doc.data().admin)
              }
			return user
        } else {
			//user doesn't exist - create a new user in firestore
			addNewUserToFirestore(user);
        }
		})
    })
    .then(() => {
		navigate('/')});
	}
	
    return (
		<Box sx={{minHeight: '100vh', backgroundImage: `url('/BaliSpace.jpeg')`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover',}}>
			<Box sx={{display: 'flex',  justifyContent:'center', alignItems:'center', height: '100vh'}}>
				<Button variant="contained" color="primary" onClick={signInWithGoogle}>Sign in with Google</Button>
			</Box>
		</Box>
    )
  
  }

  function addNewUserToFirestore(user) {
	const userDocRef = doc(db,'users',user.user.uid);
    const {profile} = getAdditionalUserInfo(user);
    console.log('additional user info is ', getAdditionalUserInfo(user))
    const details = {
      firstName: Object.prototype.hasOwnProperty.call(profile,"given_name") ? profile.given_name : '',
      lastName: Object.prototype.hasOwnProperty.call(profile,"family_name") ? profile.family_name : '',
      fullName: Object.prototype.hasOwnProperty.call(profile,"name") ? profile.name : '',
      email: Object.prototype.hasOwnProperty.call(profile,"email") ? profile.email : '',
    };
    setDoc(userDocRef,details);
    const studentsDocRef = doc(db,'adminDocs','studentList')
	updateDoc(studentsDocRef,{students: arrayUnion({'uid':user.user.uid, 'firstName':details.firstName, 'year':2022})})
    return {user, details};
  }

export default Login;