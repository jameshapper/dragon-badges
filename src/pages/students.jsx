import { useState, useContext } from 'react';
import { db } from '../firebase';
import { arrayUnion, arrayRemove, doc, updateDoc } from 'firebase/firestore';
import { Link, useNavigate, useLoaderData } from "react-router-dom";
import CircularProgress from '@mui/material/CircularProgress';

import { UserContext } from '../contexts/usercontext';
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import { AssignmentInd, CloudDownload, Edit } from '@mui/icons-material';
import { AppBar, TextField, Dialog, FormControl, InputLabel, Select, MenuItem, Button, Grid } from '@mui/material';

function Students() {

    const { loading, currentUser } = useContext(UserContext)

    const [ uiLoading ] = useState(loading)
    //const [ rows, setRows ] = useState([])
    //const [ classes, setClasses ] = useState([])
    const [ selectedClass, setSelectedClass ] = useState()
    const [ selectedStudents, setSelectedStudents ] = useState([])
    //const [ downloadNotes, setDownloadNotes ] = useState(false)

    const navigate = useNavigate()

    const { studentsArray: rows, classData: classes } = useLoaderData()

/*     useEffect(() => {   
        getDoc(doc(db,"adminDocs","studentList"))
        .then((studentListDoc) => {
            setRows(studentListDoc.data().students)
        })
    }, []);

    useEffect(() => {
        getDocs(collection(db,"users",currentUser.uid,"teacherClasses"))
        .then((snapshot) => {
            const classData = []
            snapshot.forEach((teacherClassDoc) => {
                classData.push({...teacherClassDoc.data(), id: teacherClassDoc.id})
            })
            setClasses(classData)
            console.log("class data is "+classData)
        })
    },[currentUser.uid]) */

    const handleChange = (event) => {
        setSelectedClass(event.target.value)
        console.log('selected class id is '+JSON.stringify(event.target.value.id))
        console.log('selected class text is '+JSON.stringify(event.target.value.name))
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        if(selectedClass){
          console.log('planning to submit to class id '+selectedClass.id)
          console.log('and submit selected student ids are '+selectedStudents.map(student => console.log(student.uid)))
          updateDoc(doc(db,'users',currentUser.uid,'teacherClasses',selectedClass.id),{
              students: arrayUnion(...selectedStudents)
          })
          .then(() => {
            selectedStudents.map(student => (
              updateDoc(doc(db,'users',student.uid),{
                classes: arrayUnion({value: selectedClass.id, label: selectedClass.name})
              })
            ))
          })
          .then(() => {
            navigate('/classes')
          })
        } else {
          alert("Make sure to select a class")
        }
    }

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
                <Toolbar />
                <Grid container spacing={2} alignItems='center'>
                    <Grid item xs={2} key='classSelect'>
                        <FormControl sx={{ m: 1, minWidth: 120 }}>
                            <InputLabel id="demo-simple-select-label">Classes</InputLabel>
                            <Select
                                labelId="select class"
                                id="select-class"
                                value={selectedClass ?? ''}
                                label="Classes"
                                onChange={handleChange}
                                defaultValue=""
                            >
                                {classes.map((eachclass) => (
                                    <MenuItem key={eachclass.name} value={eachclass}>{eachclass.name}</MenuItem>
                                ))
                                }
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant='h6' align='center'>Select students below to add to class</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Button variant='contained' onClick={handleSubmit}>Submit</Button>
                    </Grid>
                </Grid>
    
                <Box sx={{flexGrow:1, p:3}} >
                    <EnhancedTable rows={rows} setSelectedStudents={(selecteds) => setSelectedStudents(selecteds)} />
                </Box>

                {/*<Box>
                <Button variant='contained' onClick={handleDownload}>Get Notes to File</Button>
                </Box>*/}
    
            </>
        )
    }
}
export default Students;

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
    id: 'firstName',
    numeric: false,
    disablePadding: true,
    label: 'Student Name',
  },
  {
    id: 'year',
    numeric: true,
    disablePadding: false,
    label: 'Graduation Year',
  },
  {
    id: 'uid',
    numeric: false,
    disablePadding: false,
    label: 'uid',
  },
];

function EnhancedTableHead(props) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;

  //an appropriate "sortHandler" will be created for each column (with the "property" being the "id" of the particular column header)
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all students',
            }}
          />
        </TableCell>
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
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const EnhancedTableToolbar = (props) => {
  const { numSelected, selected, handleClickOpen } = props;

  // <IconButton component={Link} to={`/students/${selected[0].uid}`} >
  // <IconButton component={Link} to={{pathname: `/students/${selected[0].uid}`, state: {something: `${selected[0].uid}`} }} >
  // <IconButton component={Link} onClick={handleStudentSelect} to={{pathname: '/myBadges', state: {selectedStudentId: `${selected[0].uid}`, selectedStudentName: `${selected[0].firstName}`} }} >

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: '1 1 100%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          sx={{ flex: '1 1 100%' }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          Students
        </Typography>
      )}

      {numSelected === 1 ? (
        <>
        <Tooltip title="Edit Record">
          <IconButton
            onClick={handleClickOpen}
          >
            <Edit />
          </IconButton>
        </Tooltip>
        <Tooltip title="View Details">
          <IconButton component={Link} to={`/students/${selected[0].uid}/myBadges`} >
            <AssignmentInd />
          </IconButton>
        </Tooltip>
        </>
      ) :
      numSelected > 0 ? (
        <Tooltip title="Download records">
          <IconButton>
            <CloudDownload />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton>
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  selected: PropTypes.array.isRequired,
  handleClickOpen: PropTypes.func.isRequired,
};

EnhancedTable.propTypes = {
    rows: PropTypes.array.isRequired,
    setSelectedStudents: PropTypes.func,
}

export function EnhancedTable(props) {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('year');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [clickOpen, setClickOpen] = useState(false)
  const [gradYear, setGradYear] = useState(2000)
  const [studentName, setStudentName] = useState("")
  const [error ] = useState([])
  const [studentId, setStudentId] = useState('')

  const rows = props.rows

  const handleClickOpen = () => {
    setClickOpen(true)
    setStudentName(selected[0].firstName)
    setGradYear(selected[0].year)
    setStudentId(selected[0].uid)
  }

  const handleClose = () => {
    setClickOpen(false)
    setSelected([])
  }

  //this will be sent to the "EnhancedTableHead" component. It will toggle the order if we click on the most recently ordered header again.
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      //const newSelecteds = rows.map((n) => n.uid);
      const newSelecteds = rows
      console.log('select all newSelecteds are ', newSelecteds)
      setSelected(newSelecteds);
      props.setSelectedStudents(newSelecteds)
      return;
    }
    setSelected([]);
    props.setSelectedStudents([])
  };

  const handleClick = (event, name) => {
    //const selectedIndex = selected.indexOf(name);
    const selectedIndex = selected.findIndex(function(selection){
      return selection.uid === name.uid
    })
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    console.log('current newSelected are ', newSelected)

    setSelected(newSelected);
    props.setSelectedStudents(newSelected)

  };

  const handleYearChange = (event) => setGradYear(event.target.value)

  const handleNameChange = (event) => setStudentName(event.target.value)

  const handleSubmit = () => {
    console.log("Halelujiah")
    const studentUpdate = {
      firstName:studentName,
      uid:studentId,
      year:gradYear
    }
    updateDoc(doc(db,"adminDocs","studentList",{
      students: arrayRemove({
        firstName:selected[0].firstName,
        uid:selected[0].uid,
        year:selected[0].year
      })
    }))
    .then(() => {
      updateDoc(doc(db,"adminDocs","studentList",{
        students: arrayUnion(studentUpdate)
      }))
    })
    .then(() => updateDoc(doc(db,"users",studentUpdate.uid),studentUpdate))
    setClickOpen(false)
    setSelected([])
  }

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

  //const isSelected = (name) => selected.indexOf(name) !== -1;
  const isSelected = (name) => {
    const index = selected.findIndex(function (selection) {
      return selection.uid===name.uid
    })
    return index !== -1
  }

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <EnhancedTableToolbar numSelected={selected.length} selected={selected} handleClickOpen={handleClickOpen} />
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {/* if you don't need to support IE11, you can replace the `stableSort` call with:
                 rows.slice().sort(getComparator(order, orderBy)) */}
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.uid}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          inputProps={{
                            'aria-labelledby': labelId,
                          }}
                        />
                      </TableCell>
                      <TableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        padding="none"
                      >
                        {row.firstName}
                      </TableCell>
                      <TableCell align="right">{row.year}</TableCell>
                      <TableCell align="left">{row.uid}</TableCell>
                    </TableRow>
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

      <Dialog fullWidth={true} maxWidth='md' open={clickOpen} onClose={handleClose}>
          <AppBar sx={{position: 'relative'}} >
              <Toolbar>
                  <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
                      <CloseIcon />
                  </IconButton>
                  <Typography variant="h6" sx={{ml:2, flex:1}} >
                      Edit Record
                  </Typography>
                  <Button
                      autoFocus
                      color="inherit"
                      onClick={handleSubmit}
                      sx={{
                          display: 'block',
                          color: 'white',
                          textAlign: 'center',
                          position: 'absolute',
                          top: 14,
                          right: 10
                      }}
                  >
                      Save
                  </Button>
              </Toolbar>
          </AppBar>

          <Box sx={{
              width: '88%',
              marginLeft: 2,
              marginTop: 3,
              marginBottom: 3
          }} noValidate>
              <Grid container spacing={2}>
                  <Grid item xs={6} key='studentname'>
                      <TextField
                          variant="outlined"
                          required
                          fullWidth
                          id="studentName"
                          label="Student Name"
                          name="studentname"
                          autoComplete="studentName"
                          helperText={error.title}
                          value={studentName}
                          error={error.title ? true : false}
                          onChange={handleNameChange}
                      />
                  </Grid>
                  <Grid item xs={6} key='gradyear'>
                      <TextField
                          variant="outlined"
                          required
                          fullWidth
                          id="gradYear"
                          label="Grad Year"
                          name="gradyear"
                          autoComplete="gradYear"
                          helperText={error.title}
                          value={gradYear}
                          error={error.title ? true : false}
                          onChange={handleYearChange}
                      />
                  </Grid>

              </Grid>
          </Box>
      </Dialog>
    </Box>
  );
}
