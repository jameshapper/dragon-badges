import {
    createBrowserRouter,
    createRoutesFromElements,
    RouterProvider,
    Route
  } from "react-router-dom"

  // layouts
import RootLayout from './layouts/RootLayout'

  // context
import UserProvider from "./contexts/usercontext"

  // pages
import Login from "./pages/login"
import Badges from "./pages/badges"
import { badgesLoader, badgeEditLoader, notesLoader, classesLoader } from "./apiloaders"
import BadgeDetails, { loader as badgeDetailsLoader } from "./pages/badgedetails"
import BadgeForm from "./pages/badgeform"
import Note from "./pages/dashboard"
import TeacherClasses from "./pages/classes"

import { ThemeProvider, createTheme } from "@mui/material/styles"
import { CssBaseline } from "@mui/material"

// Box can't be first import? Strange issue with theme requiring moving Box imports down https://stackoverflow.com/questions/74542488/react-material-ui-createtheme-default-is-not-a-function
const theme = createTheme({
	palette: {
		primary: {
			light: '#33c9dc',
			main: '#FF5722',
			dark: '#d50000',
			contrastText: '#fff'
		}
  }
});

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" >
      <Route path="login" element={<Login />} />
      <Route index element={<div>Hello world!</div>} />
      <Route path="temp" element={<div>Hello temp!</div>} />
      <Route element={<RootLayout/>}>
        <Route path="badges" element={<Badges />} loader={badgesLoader} />
        <Route path="badges/:badgeId" element={<BadgeDetails />} loader={badgeDetailsLoader}/>    
        <Route path="badgeForm" element={<BadgeForm />} />
        <Route path="badgeForm/:badgeId" element={<BadgeForm />} loader={badgeEditLoader}/>
        <Route path="dashboard/:userId" element={<Note />} loader={notesLoader} />
        <Route path="classes" element={<TeacherClasses />} loader={classesLoader}/>

      </Route>

      <Route path="*" element={<Login />} />
    </Route>
  )
)

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <UserProvider>
        <RouterProvider router={router} />
      </UserProvider>
    </ThemeProvider>

    )
}

export default App