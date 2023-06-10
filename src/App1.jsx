import {
    createBrowserRouter, createRoutesFromElements,
    RouterProvider,
    Route
  } from "react-router-dom"

  // layouts
import RootLayout from './layouts/RootLayout'
import Testfirebase, { testLoader } from "./testfirebase"


  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<RootLayout />} >
        <Route index element={<div>Hello world!</div>} />
        <Route path="test" element={<Testfirebase/>} loader={testLoader} />
        <Route path="about" element={<div>Hello about!</div>} />
        <Route path="help" element={<div>Hello help!</div>}>
          <Route path="faq" element={<div>Hello faq!</div>} />
          <Route path="contact" element={<div>Hello contact!</div>} />
        </Route>
        <Route path="careers" element={<div>Hello careers!</div>} >
          <Route 
            index 
            element={<div>Hello career index!</div>} 
            //loader={careersLoader}
            // errorElement={<CareersError />}
          />
          <Route 
            path=":id" 
            element={<div>Hello career id!</div>}
            //loader={careerDetailsLoader}
          />
        </Route>
  
        <Route path="*" element={<div>Hello missing url!</div>} />
      </Route>
    )
  )

function App() {
  return (
    <RouterProvider router={router} />
    )
}

export default App