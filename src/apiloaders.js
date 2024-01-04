//import { redirect } from 'react-router-dom';
import { db } from './firebase';
import { doc, getDoc, collectionGroup, where, getDocs, query, collection } from 'firebase/firestore'

// badgesLoader for Badges component at badges route
export function badgesLoader({params}) {
        console.log('THERE ARE NO params', Object.keys(params).length)
    return getBadgesAndClasses()
}

async function getBadgesAndClasses() {
    const badges = await getBadges()
    const classesList = await getClasses()
    console.log(classesList)
    return { badges, classesList }
}

async function getBadges() {
    const badgesRef = doc(db, "adminDocs", "badgeList")
    const badges = await getDoc(badgesRef)
    const badgeData = await badges.data().badges
    return badgeData
}

async function getClasses() {
    const classesListRef = doc(db,'adminDocs','classesList')
    const classes = await getDoc(classesListRef)
    const classesList = await classes.data().classes
    return classesList
}

async function getTeacherClasses(userId) {
    const querySnapshot = await getDocs(collection(db, "users", userId, "teacherClasses"));
    const teacherData = []
    querySnapshot.forEach((doc) => {
        teacherData.push({...doc.data(), id: doc.id})
        console.log(doc.id, " => ", doc.data());
    })
  // doc.data() is never undefined for query doc snapshots
    return(teacherData)
}

export function classesLoader(userContext) {
    return () => {
        const { currentUser } = userContext
        return getTeacherClasses(currentUser.uid)
    }
}

// badgeEditLoader for editing badge at badgeForm/:badgeId route

export function badgeEditLoader({ params }) {
    return getBadge(params.badgeId)
}

async function getBadge(badgeId) {
    const badgeRef = doc(db, "badges", badgeId)
    const badge = await getDoc(badgeRef)
    const badgeData = badge.data()
    return {...badgeData, badgeId:badgeId}
}

// end of badgeEditLoader

// notesLoader for getting notes to dashboard

const recentDate = new Date('2023-04-29')

export function notesLoader(userContext) {
    const { currentUser } = userContext
    if (currentUser) {
        return () => {
            return getAllNotes(currentUser.uid)
        }
    } else {
        return null
    }
}

async function getAllNotes(userId) {
    const actionItems = await getActionItems(userId)
    const assessmentItems = await getAssessments(userId)
    const termGoals = await getTermGoals(userId)
    const currentPlans = await getPlans(userId)
    const { summaryEvidence, classes, badges } = await getStudentData(userId)
    return { actionItems, assessmentItems, termGoals, currentPlans, summaryEvidence, classes, badges }
}

async function getActionItems(userId) {
    const notes = query(collectionGroup(db, 'notes'),
    where("uid", "==", userId),
    where("timestamp", ">=", recentDate),
    //where("studentClass","==",studentClass),
    where("status", "==","Active"),
    where("noteType","==","ActionItem")
    );
    const querySnapshot = await getDocs(notes)
    const actionItems = []
    if (querySnapshot.empty){
        console.log('no action items in snapshot')
    } 
    else {
        querySnapshot.forEach((actionItemsdoc) => {
            actionItems.push({ ...actionItemsdoc.data(), id: actionItemsdoc.id })
        });
    }

    return actionItems
}

async function getAssessments(userId) {
    const notes = query(collectionGroup(db, 'notes'),
    where("uid", "==", userId),
    where("timestamp", ">=", recentDate),
    //where("studentClass","==",studentClass),
    where("status", "==","Active"),
    where("noteType","==","Assessment")
    );
    const querySnapshot = await getDocs(notes)
    const assessmentItems = []
    if (querySnapshot.empty){
        console.log('no assessment items in snapshot')
    } 
    else {
        querySnapshot.forEach((assessmentsDoc) => {
            assessmentItems.push({ ...assessmentsDoc.data(), id: assessmentsDoc.id })
        });
    }

    return assessmentItems
}

async function getTermGoals(userId) {
    const notes = query(collectionGroup(db, 'notes'),
    where("uid", "==", userId),
    where("timestamp", ">=", recentDate),
    //where("studentClass","==",studentClass),
    where("status", "==","Active"),
    where("noteType","==","TermGoals")
    );
    const querySnapshot = await getDocs(notes)
    const termGoals = []
    if (querySnapshot.empty){
        console.log('no term goals in snapshot')
    } 
    else {
        querySnapshot.forEach((termGoalsDoc) => {
            termGoals.push({ ...termGoalsDoc.data(), id: termGoalsDoc.id })
        });
    }

    return termGoals
}

async function getPlans(userId) {
    const notes = query(collectionGroup(db, 'notes'),
    where("uid", "==", userId),
    where("timestamp", ">=", recentDate),
    //where("studentClass","==",studentClass),
    where("status", "==","Active"),
    where("noteType","==","Plan")
    );
    const querySnapshot = await getDocs(notes)
    const plans = []
    if (querySnapshot.empty){
        console.log('no plans in snapshot')
    } 
    else {
        querySnapshot.forEach((plansDoc) => {
            plans.push({ ...plansDoc.data(), id: plansDoc.id })
        });
    }
    return plans
}

async function getStudentData(userId) {
    const userDocRef = doc(db,'users',userId)
    const userDoc = await getDoc(userDocRef)
    if(userDoc) {
        console.log('userDoc exists')
        const userData = userDoc.data()
        console.log('userData is ',userData)
        const hasClasses = "classes" in userData
        //const summaryEvidence = userData.evidence
        const summaryEvidence = []
        const classes = hasClasses ? userData.classes : []
        const badges = []
        const badgeMap = userData.myBadgesMap
        if(badgeMap){
            const entries = Object.entries(badgeMap)
            console.log('entries are '+JSON.stringify(entries))
            entries.map(entry => {
                return badges.push(entry[1].badgename)
            })
        }
        return {summaryEvidence, classes, badges}
    }
}

// end of notesLoader

// myBadges loader
export function myBadgesLoader(uid) {

    return () => {
        return getStudentBadges(uid)
    }
}

export function studentBadgesLoader({params}) {

    return getStudentBadges(params.studentId)
}

async function getStudentBadges(studentId) {
    console.log('studentId from getStudentBadges ',studentId)
    const studentRef = doc(db, "users", studentId)
    const studentDoc = await getDoc(studentRef)
    const studentName = studentDoc.data().firstName
    console.log('studentName ',studentName)
    const badgeData = await getDocs(query(collection(db,'users',studentId,'myBadges'),where("uid","==",studentId)))
    console.log('did we get badges?')
    const badgeList = []
    badgeData.forEach((badgeDoc) => {
        badgeList.push({...badgeDoc.data(), id: badgeDoc.id})
        console.log(badgeDoc.id, " => ", badgeDoc.data());
    })
    return { studentName, badgeList }
}

// myBadgeDetailsLoader

/* export function myBadgeDetailsLoader ({params}) {
    return getMyBadgeDetails(params.studentId, params.badgeId)
} */

export function myBadgeDetailsLoader(userContext) {
    return ({params}) => {
        const { currentUser } = userContext
        console.log('in loader params and current user? ', params, currentUser)
        const myBadgeId = params.myBadgeId
        let studentId = params.studentId
        if(!studentId){
            studentId = currentUser.uid
        }
        return getMyBadgeDetails(studentId, myBadgeId)
    }
}

async function getMyBadgeDetails(studentId, myBadgeId) {
    console.log('studentId is ',studentId)
    const studentBadge = await getDoc(doc(db,"users",studentId,"myBadges",myBadgeId))
    return {...studentBadge.data(), myBadgeId: myBadgeId, studentId: studentId }
}

// student loaders
export function studentLoader({ params }) {
    return getBadge(params.badgeId)
}

export function studentListLoader(currentUser) {
    return () => {
        return getStudents(currentUser)
    }
}

async function getStudents(currentUser) {
    if(currentUser){
        const studentList = await getDoc(doc(db,"adminDocs","studentList"))
        const studentsArray = studentList.data().students
        const teacherClassDocs = await getDocs(collection(db,"users",currentUser.uid,"teacherClasses"))
        const classData = []
        teacherClassDocs.forEach((teacherClassDoc) => {
            classData.push({...teacherClassDoc.data(), id: teacherClassDoc.id})
        })
        console.log("class data is "+classData)
        return { studentsArray, classData }
    } else { return null}

}

// feedback loader
export function feedbackLoader({ params }) {
    return getBadge(params.badgeId)
}