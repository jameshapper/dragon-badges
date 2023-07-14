import { Navigate, Outlet } from 'react-router-dom'

function AdminLayout() {

  let auth = {'token':true}
  return (
    auth.token ? <Outlet/> : <Navigate to='/login'/>
  )
}

export default AdminLayout
