import { useState, useContext, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import NewNote from './newnote';
import ViewNotes from './viewnotes';

import { UserContext } from '../contexts/usercontext';
import PropTypes from 'prop-types';

import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit'

import { 
    Paper, 
    CircularProgress,
    Toolbar, 
    Box, 
    FormControlLabel,
    List,
    ListItem,
    ListItemIcon,
    Switch,
    Table, 
    TablePagination,
    TableSortLabel,
    TableContainer, 
    TableHead, 
    TableBody, 
    TableRow, 
    TableCell } from '@mui/material'

//import { DatePicker } from 'material-ui';

ListNotes.propTypes = {
    classes: PropTypes.array,
    badges: PropTypes.array,
    studentClass: PropTypes.object,
    studentId: PropTypes.string
}

function ListNotes({classes, badges, studentClass, studentId} ) {

    const { loading, currentUser } = useContext(UserContext)

    const [ uiLoading ] = useState(loading)
    const [ rows, setRows ] = useState([])
    const [ msec, setMsec ] = useState([])
    const [ msecCheck, setMsecCheck ] = useState(false)
    const [ nextDate, setNextDate ] = useState(0)
    const [ prevDate, setPrevDate ] = useState(0)
    const [ notesAuthorUid, setNotesAuthorUid ] = useState("")

    useEffect(() => {
      if(studentId){
        setNotesAuthorUid(studentId)
      } else {
        setNotesAuthorUid(currentUser.uid)
      }
    },[currentUser.uid, studentId])

    useEffect(() => {   
      if(notesAuthorUid){
        var unsubscribe = onSnapshot(doc(db,"users",notesAuthorUid,"userLists","notesList")
        ,(notesListDoc) => {
          if(notesListDoc.exists){
            const msecList = []
            notesListDoc.data().notes.forEach(note => {
              msecList.push(note.ts_msec)
            })
            setMsec(msecList)
            setRows(notesListDoc.data().notes)
            setMsecCheck(true)
          }

        })
        return () => unsubscribe()
      }

    }, [notesAuthorUid]);

    useEffect(() => {
      if(msecCheck){
        const nowMsec = new Date().getTime()
        console.log('nowMsec is '+nowMsec)
        let msecDif = []
        msec.map(element => {
          return msecDif.push(element - nowMsec)
        })
        console.log(msec)
        console.log(msecDif)
        msecDif.sort(function(a, b){return a-b})
        const laterTimes = msecDif.filter(num => num > 0)
        const earlierTimes = msecDif.filter(num => num <= 0)
        console.log('laterTimes is '+laterTimes)
        console.log('earlierTimes is '+earlierTimes)
        const prevMsec = () => {
          if(laterTimes.length){
            console.log(Math.min(...laterTimes))
            console.log(Math.min(...laterTimes) + nowMsec)
            return Math.min(...laterTimes) + nowMsec
          } else {
            return 0
          }
        }
        const nextMsec = () => {
          if(earlierTimes.length){
            return Math.max(...earlierTimes) + nowMsec
          } else {
            return 0
          }
        }
        console.log('prevMsec is '+prevMsec())
        console.log('nextMsec is '+nextMsec())
        setNextDate(nextMsec())
        setPrevDate(prevMsec())
      }
    },[msec, msecCheck])

    //Was getting a warning on the Select that was answered here https://stackoverflow.com/questions/55429442/material-ui-select-component-a-component-is-changing-a-controlled-input-of-type

    if (uiLoading === true) {
        return (
            <Box sx={{flexGrow:1, p:3}} >
                <Toolbar />
                {uiLoading && <CircularProgress size={150} sx={{
                    position: 'fixed',
                    zIndex: '1000',
                    height: '31px',
                    width: '31px',
                    left: '50%',
                    top: '35%'
                }} />}
            </Box>
        );
    } else {
        return (
            <>    
                <Box sx={{flexGrow:1, p:3}} >
                    <EnhancedTable rows={rows} headCells={headCells} userId={notesAuthorUid} classes={classes} badges={badges} studentClass={studentClass} nextDate={nextDate} prevDate={prevDate} />
                </Box>
            </>
        )
    }
}
export default ListNotes;

//The comparator functions below allow the same functions to be used for sorting objects by different columns (different fields within the objects)

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// This method is created for cross-browser compatibility, if you don't
// need to support IE11, you can use Array.prototype.sort() directly
function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  {
    id: 'title',
    numeric: false,
    disablePadding: true,
    label: 'Note Title',
  },
  {
    id: 'ts_msec',
    numeric: true,
    disablePadding: false,
    label: 'Date',
  },
  {
    id: 'body',
    numeric: false,
    disablePadding: false,
    label: 'Description',
  },
];

function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort } = props;

  //an appropriate "sortHandler" will be created for each column (with the "property" being the "id" of the particular column header)
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{fontWeight:"bold"}}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const EnhancedTableToolbar = () => {

    return (
      <Toolbar
        sx={{
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
        }}
      >
      </Toolbar>
    );
  };

// EnhancedTable propTypes and component

EnhancedTable.propTypes = {
    rows: PropTypes.array,
    headCells: PropTypes.array,
    userId: PropTypes.string,
    classes: PropTypes.array,
    studentClass: PropTypes.object,
    badges: PropTypes.array,
    nextDate: PropTypes.any,
    prevDate: PropTypes.any
}

export function EnhancedTable(props) {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('ts_msec');
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [note, setNote] = useState({})
  const [ open, setOpen ] = useState(false)
  const [ viewOpen, setViewOpen ] = useState(false)

  const rows = props.rows
  const headCells = props.headCells
  const userId = props.userId
  const classes = props.classes
  const studentClass = props.studentClass
  const badges = props.badges
  const nextDate = props.nextDate
  const prevDate = props.prevDate

  const handleViewOpen = (note) => {
    console.log("Clicked a row!")
    getDoc(doc(db,"users",userId,"notes",note.noteId))
    .then(noteDoc => {
      setNote(noteDoc.data())
      setViewOpen(true)
    })
  };

  //this will be sent to the "EnhancedTableHead" component. It will toggle the order if we click on the most recently ordered header again.
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  const handleEditOpen = (note) => {
    getDoc(doc(db,"users",userId,"notes",note.noteId))
    .then(noteDoc => {
      setNote({...noteDoc.data(),id:note.noteId})
      setOpen(true)
    })
  }

  const handleClose = () => {
      setOpen(false)
  }

  const handleViewClose = () => {
      setViewOpen(false)
  }

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  return (
    <Box sx={{ flexGrow:1, m:0, p:0 }}>
      <Paper sx={{ width: 'auto',borderRadius:2 }}>
        <EnhancedTableToolbar />
        <TableContainer
          sx={{
            width:1,
            p:1,
            m:0
          }}
        >
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
          >
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
              headCells={headCells}
            />
            <TableBody>
              {/* if you don't need to support IE11, you can replace the `stableSort` call with:
                 rows.slice().sort(getComparator(order, orderBy)) */}
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const labelId = `enhanced-table-checkbox-${index}`;

                return (
                    <ActionItemRow key={`ActionItemRow-${index}`} labelId={labelId} row={row} handleViewOpen={handleViewOpen} handleEditOpen={handleEditOpen} nextDate={nextDate} prevDate={prevDate} />
                );
                })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: (dense ? 33 : 53) * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      <FormControlLabel
        control={<Switch checked={dense} onChange={handleChangeDense} />}
        label="Dense padding"
      />
      {viewOpen &&
          <ViewNotes note={note} handleViewClose={handleViewClose} viewOpen={viewOpen}/>
      }

      {open && 
          <NewNote open={open} handleClose={handleClose} buttonType={"Edit"} noteForEdit={note} classes={classes} badges={badges} studentClass={studentClass} />
      }

    </Box>
  );
}

// ActionItemRow propTypes and component

ActionItemRow.propTypes = {
    row: PropTypes.any,
    labelId: PropTypes.string,
    handleViewOpen: PropTypes.func,
    handleEditOpen: PropTypes.func,
    nextDate: PropTypes.any,
    prevDate: PropTypes.any
}

function ActionItemRow(props) {
    const row = props.row
    const labelId = props.labelId
    const handleViewOpen = props.handleViewOpen
    const handleEditOpen = props.handleEditOpen
    const nextDate = props.nextDate === row.ts_msec
    const prevDate = props.prevDate === row.ts_msec
    const statusFont = {
      isNext: 'pink',
      isPrev: 'yellow',
      default: ''
    }
    const status = nextDate ? "isNext" : prevDate ? "isPrev" : "default"

    return (
        <TableRow
        tabIndex={-1}
        key={row.noteId}
        sx={{ backgroundColor: statusFont[status] ?? "" }}
        >
        <TableCell
          component="th"
          id={labelId}
          scope="row"
          padding="none"
          sx={{width:300}}
        >
          {row.title}
        </TableCell>
        <TableCell sx={{width:200}} align='left'>{(new Date(row.ts_msec).toString()).slice(0,15)}</TableCell>
        <TableCell sx={{width:700}} align="left">{row.body}</TableCell>
        <TableCell sx={{width:200}} align="left">
          <Box sx={{ ml:1, width: 15 }}>
              <List sx={{display:'flex', flexDirection: 'row'}}>
                  <ListItem 
                  key="viewNoteFromLC"
                  onClick={() => handleViewOpen(row)}
                  >
                      <ListItemIcon ><VisibilityIcon fontSize='small'/></ListItemIcon>
                  </ListItem>
              <>
                  <ListItem 
                  key="editNoteFromLC"
                  onClick={() => handleEditOpen(row)}
                  >
                      <ListItemIcon ><EditIcon fontSize='small'/></ListItemIcon>
                  </ListItem>
              </>
              </List>
          </Box>
        </TableCell>

      </TableRow>
    )
}