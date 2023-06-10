import { collection, getDocs } from 'firebase/firestore'
import { db } from './firebase.js'
import { useLoaderData } from 'react-router-dom';

export default function Testfirebase() {
  const testdata = useLoaderData()
  return(<div>{testdata.map(doc => (
    <div key={doc.afield}>{doc.afield}</div>
  ))}</div>)
}

export const testLoader = async () => {
  const notesSnapshot = await getDocs(collection(db, "testing"))
  const notesList = notesSnapshot.docs.map((doc) => doc.data())
  return notesList
};