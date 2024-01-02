import React from "react"
import {UserContext} from './contexts/usercontext'
import {
    createBrowserRouter,
    createRoutesFromElements,
    RouterProvider,
    Route
  } from "react-router-dom"
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

  // layouts
import RootLayout from './layouts/RootLayout'

  // context
import UserProvider from "./contexts/usercontext"

  // pages
import Login from "./pages/login"
import Badges from "./pages/badges"
import { badgesLoader, badgeEditLoader, classesLoader, notesLoader, studentLoader, feedbackLoader, studentBadgesLoader, myBadgeDetailsLoader, studentListLoader } from "./apiloaders"
import BadgeDetails from "./pages/badgedetails"
import MyBadges from "./pages/mybadges"
import MyBadgesRedirect from "./pages/mybadgesredirect";
import MyBadgeDetails from "./pages/mybadgesdetails"
import BadgeForm from "./pages/badgeform"
import Note from "./pages/dashboard5"
import TeacherClasses from "./pages/classes"
import Feedback from "./pages/feedback"
import StudentDetails from "./pages/studentdetails"
import FeedbackView from "./pages/feedbackview"
import Account from "./pages/account"
import Students from "./pages/students"

import { ThemeProvider, createTheme } from "@mui/material/styles"
import { CssBaseline } from "@mui/material"
import AddClass from "./pages/addclass";

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

//https://blog.webdevsimplified.com/2022-07/react-router/

//Suggestion by Drew Reese to get context data (like user object) available to loaders.
//Although the react-router folks don't seem to like this, I cannot find an alternative.
//https://stackoverflow.com/questions/77700072/react-router-v6-loader-functions-using-context-api

//<Route path="dashboard" element={<Note />} loader={notesLoader(userContext)} />


const AppRoot = () => {
    const userContext = React.useContext(UserContext);

    const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" >
        <Route path="login" element={<Login />} />
        <Route index element={<div>Hello world!</div>} />
        <Route path="temp" element={<div>Hello temp!</div>} />
        <Route element={<RootLayout/>}>
            <Route path="badges" element={<Badges />} loader={badgesLoader} />
            <Route path="badges/:badgeId" element={<BadgeDetails />} loader={badgeEditLoader}/>    
            <Route path="badgeForm" element={<BadgeForm />} />
            <Route path="badgeForm/:badgeId" element={<BadgeForm />} loader={badgeEditLoader}/>
            <Route path="dashboard" element={<Note />} loader={notesLoader(userContext)} />
            <Route path="classes" element={<TeacherClasses />} loader={classesLoader(userContext)}/>
            <Route path="addclass" element={<AddClass />}/>
            <Route path="/account" element={<Account />}/>
            <Route path="/feedback/:feedbackId" element={<Feedback />} loader={feedbackLoader}/>
						<Route path="/students/:studentId" element={<StudentDetails />} loader={studentLoader}/>
            <Route path="/myBadges" element={<MyBadgesRedirect />}/>
            <Route path="/students/:studentId/myBadges" element={<MyBadges />} loader={studentBadgesLoader}/>
						<Route path="/myBadges/:myBadgeId" element={<MyBadgeDetails />} loader={myBadgeDetailsLoader(userContext.currentUser.uid)}/>
            <Route path="/students/:studentId/myBadges/:myBadgeId" element={<MyBadgeDetails />} loader={myBadgeDetailsLoader(userContext)}/>
            <Route path="/students/:studentId/myBadges/:myBadgeId/feedback/:feedbackId" element= {<FeedbackView />}/>
            <Route path="/students" element={<Students />} loader={studentListLoader(userContext.currentUser.uid)}/>
            <Route path="/feedback" element={<Feedback />}/>
        </Route>

        <Route path="*" element={<Login />} />
        </Route>
    )
    )

    return <RouterProvider router={router} />;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <UserProvider>
            <AppRoot />
        </UserProvider>
      </LocalizationProvider>
    </ThemeProvider>

    )
}

export default App