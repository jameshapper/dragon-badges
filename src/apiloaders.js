import { doc, getDoc } from 'firebase/firestore'
import { db } from './firebase';
import { collectionGroup, where, getDocs, query } from 'firebase/firestore'


// badgesLoader for Badges component at badges route
export function badgesLoader() {
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
// end of badgesLoader

// badgeEditLoader for editing badge at badgeForm/:badgeId route

export function badgeEditLoader({ params }) {
    return getBadge(params.badgeId)
}

async function getBadge(badgeId) {
    const badgeRef = doc(db, "badges", badgeId)
    const badge = await getDoc(badgeRef)
    const badgeData = badge.data()
    return badgeData
}

// end of badgeEditLoader

// notesLoader for getting notes to dashboard

const recentDate = new Date('2023-04-29')

export function notesLoader({ params }) {
    return getAllNotes(params.userId)
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
    querySnapshot.forEach((doc) => {
        doc => actionItems.push({ ...doc.data(), id: doc.id })
        console.log(doc.id, ' => ', doc.data())
    });
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
    querySnapshot.forEach((doc) => {
        doc => assessmentItems.push({ ...doc.data(), id: doc.id })
        console.log(doc.id, ' => ', doc.data())
    });
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
    querySnapshot.forEach((doc) => {
        doc => termGoals.push({ ...doc.data(), id: doc.id })
        console.log(doc.id, ' => ', doc.data())
    });
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
    querySnapshot.forEach((doc) => {
        doc => plans.push({ ...doc.data(), id: doc.id })
        console.log(doc.id, ' => ', doc.data())
    });
    return plans
}

async function getStudentData(userId) {
    const userDocRef = doc(db,'users',userId)
    const userDoc = await getDoc(userDocRef)
    if(userDoc) {
        const userData = userDoc.data()
        const hasClasses = "classes" in userData
        const summaryEvidence = userData.evidence
        const classes = hasClasses ? userData.classes : []
        const badgeNames = []
        const badgeMap = userData.myBadgesMap
        if(badgeMap){
            const entries = Object.entries(badgeMap)
            console.log('entries are '+JSON.stringify(entries))
            entries.map(entry => {
                return badgeNames.push(entry[1].badgename)
            })
        }
        return {summaryEvidence, classes, badgeNames}
    }
}

// end of notesLoader