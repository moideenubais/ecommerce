import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

import React, { useRef, useState } from 'react';
import {
  TextField,
  ClickAwayListener,
  Grow,
  Paper,
  Popper
} from '@material-ui/core';

export default function CustomDateRange() {
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [dateRange, setDateRange] = useState(`${new Date()}` )
  const handleClose = event => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };
  const selectionRange = {
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection'
  };
  const handleSelect = ranges => {
    console.log(ranges);
    // {
    //   selection: {
    //     startDate: [native Date Object],
    //     endDate: [native Date Object],
    //   }
    // }
  };
  const onFocusHandler = () => {
    setOpen(true);
  };
  return (
    <>
      <TextField ref={anchorRef} onFocus={onFocusHandler} value={dateRange}></TextField>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom'
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <DateRangePicker
                  ranges={[selectionRange]}
                  onChange={handleSelect}
                />
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}
