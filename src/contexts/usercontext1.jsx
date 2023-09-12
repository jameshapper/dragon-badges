import React, { useEffect, useState } from "react"
import { auth, db } from "../firebase"
import { getDoc, doc } from "firebase/firestore";
//import { getAdditionalUserInfo } from "firebase/auth";

/* I tried to create a single object for value, hoping to 
    prevent extra rendering, but this didn't work at all.
    I saw something like this in an example (the async await), 
    but no user object is returned
*/
export const UserContext = React.createContext()

// eslint-disable-next-line react/prop-types
export default function UserProvider({ children }) {
    
    const [authState, setAuthState] = useState({ currentUser: {}, loading: false, avatar: "/default-avatar.png" });

    function logout() {
        return auth.signOut()
    }

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async user => {
            const authData = {loading: false, avatar: "/default-avatar.png", logout}
            console.log(user)
            if(user){
                authData.currentUser = user
                const userDocRef = doc(db,'users',user.uid)
                const userDoc = await getDoc(userDocRef)
                if(userDoc.exists()) {
                    if(Object.prototype.hasOwnProperty.call(userDoc.data(),"admin")){
                        authData.admin = await userDoc.data().admin
                    }
                    if(Object.prototype.hasOwnProperty.call(userDoc.data(),"avatar")){
                        authData.avatar = await userDoc.data().avatar
                    }
                    if(Object.prototype.hasOwnProperty.call(userDoc.data(),"myBadgesMap")){
                        authData.myBadgesMap = await userDoc.data().myBadgesMap
                    }
                    if(Object.prototype.hasOwnProperty.call(userDoc.data(),"firstName")){
                        authData.userName = await userDoc.data().firstName
                    }
                }
                console.log(authData)
                setAuthState(authData)
            }
        })

        return unsubscribe
    }, [])


    return (
        <UserContext.Provider value={authState}>
            {!authState.loading && children}
        </UserContext.Provider>
    )
}