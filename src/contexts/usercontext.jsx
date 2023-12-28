import React, { useEffect, useState } from "react"
import { auth, db } from "../firebase"
import { getDoc, doc } from "firebase/firestore";
//import { getAdditionalUserInfo } from "firebase/auth";


export const UserContext = React.createContext()

// eslint-disable-next-line react/prop-types
export default function UserProvider({ children }) {

  const [ currentUser, setCurrentUser ] = useState()
  const [ loading, setLoading ] = useState(true)
  const [ isAdmin, setIsAdmin ] = useState(false)
  const [ avatar, setAvatar ] = useState("/default-avatar.png")
  //const [ myBadges, setMyBadges ] = useState({})
  const [ userName, setUserName ] = useState("")

  function logout() {
    return auth.signOut()
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
        setAvatar("/default-avatar.png")
        setCurrentUser(user)
        setLoading(false)
        console.log("in userContext, user is ", user)
        if(user){
          const userDocRef = doc(db,'users',user.uid)
          getDoc(userDocRef)
          .then((doc) => {
            console.log('doc exists is ', doc.exists())
            if(doc.exists()) {
              if(Object.prototype.hasOwnProperty.call(doc.data(),"admin")){
                setIsAdmin(doc.data().admin)
              }
              if(Object.prototype.hasOwnProperty.call(doc.data(),"avatar")){
                setAvatar(doc.data().avatar)
              }
/*               if(Object.prototype.hasOwnProperty.call(doc.data(),"myBadgesMap")){
                setMyBadges(doc.data().myBadgesMap)
              } */
              if(Object.prototype.hasOwnProperty.call(doc.data(),"firstName")){
                setUserName(doc.data().firstName)
              }
              //setLoading(false)
            }
          }) 

        }
    })

    return unsubscribe
    }, [])
  
  const value = {
    currentUser,
    userName,
    isAdmin,
    avatar,
    //myBadges,
    loading,
    logout
  }

  if(currentUser){console.log('auth email and is admin '+value.currentUser.email + isAdmin)}

  return (
    <UserContext.Provider value={value}>
      {!loading && children}
    </UserContext.Provider>
  )
}