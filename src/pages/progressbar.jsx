import { Box } from '@mui/material'
import PropTypes from 'prop-types';

// Progress propTypes and component

Progress.propTypes = {
    done: PropTypes.number,
}

export default function Progress({done}) {

    console.log('done is '+done)

/* 	const [style, setStyle] = useState({
        opacity: 0,
        width:0
    }); */
	
/* 	setTimeout(() => {
		const newStyle = {
			opacity: 1,
			width: `${done}%`
		}
		
		setStyle(newStyle);
	}, 200); */
	
	return (
		<Box sx={{
            backgroundColor: '#d8d8d8',
            borderRadius: 20,
            position: 'relative',
            my: 1,
            mx: 0,
            height: 20,
            width: 150,
        }}>
			<Box sx={{
                background: 'linear-gradient(to left, #F2709C, #FF9472)',
                boxShadow: '0 3px 3px -5px #F2709C, 0 2px 5px #F2709C',
                borderRadius: 20,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                opacity: 1,
                width: `${done}%`,
                justifyContent: 'center',
                height: '100%',
                transition: '1s ease 0.3s',
            }}
            >
				{done}%
			</Box>
		</Box>
	)
}
