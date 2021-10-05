import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box ,Typography} from '@material-ui/core';
export default function TabPanel(props) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value != index}
        id={`wrapped-tabpanel-${index}`}
        aria-labelledby={`wrapped-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box p={3}>
            {children}
            {/* <Typography>{children}</Typography> */}
          </Box>
        )}
      </div>
    );
  }