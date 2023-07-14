import { redirect } from "react-router-dom"
import { useContext } from "react"
import { UserContext } from "../contexts/usercontext"


export async function useAuth() {
    const { currentUser } = useContext(UserContext)

    const isLoggedIn = true
    
    if (!isLoggedIn) {
        throw redirect("/login?message=You must log in first.")
    }
}