// NOT USED??? IF SO, I DON'T NEED myBadges in CONTEXT

import { useContext } from 'react'
import { UserContext } from '../userContext'
import { DataGrid } from '@material-ui/data-grid'

export default function MyBadgesList() {

    const { myBadges } = useContext(UserContext)
    console.log('myBadges object is '+JSON.stringify(myBadges))

    const badgeColumns = [
        { field: 'badgename', headerName: "My Badges", width: 250, editable: false},
        { field: 'crits', headerName: "Total Crits", width: 250, editable: false},
        { field: 'critsAwarded', headerName: "Crits Awarded", width: 250, editable: false}
    ]

    const badgesArray = Object.keys(myBadges).map(key => {
        return {id:key,...myBadges[key]};
    })

    console.log(badgesArray)

    return (
        <div style={{ height: 300, width: '100%' }}>
            <DataGrid
            rows={badgesArray}
            columns={badgeColumns}
            pageSize={4}
            checkboxSelection
            onRowSelected={(e) => console.log(e)}
            />
        </div>
    )
}
