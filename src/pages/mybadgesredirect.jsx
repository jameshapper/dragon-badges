import { useContext, useEffect } from 'react'
import { UserContext } from '../contexts/usercontext'
import { useNavigate } from 'react-router-dom'

export default function MyBadgesRedirect() {

    const { currentUser } = useContext(UserContext)
    console.log('my badges redirect?')

    const navigate = useNavigate()

    useEffect(() => {
        navigate(`/students/${currentUser.uid}/myBadges`)
    },[currentUser.uid, navigate])

    return (
        <div>
            Just temporary
        </div>
    )
}
