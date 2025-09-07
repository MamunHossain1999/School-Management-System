import { createSlice } from '@reduxjs/toolkit';

interface AttendanceState {
  selectedDate: string | null;
  selectedClass: string | null;
}

const initialState: AttendanceState = {
  selectedDate: null,
  selectedClass: null,
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    setSelectedClass: (state, action) => {
      state.selectedClass = action.payload;
    },
    clearAttendanceFilters: (state) => {
      state.selectedDate = null;
      state.selectedClass = null;
    },
  },
});

export const { setSelectedDate, setSelectedClass, clearAttendanceFilters } = attendanceSlice.actions;
export default attendanceSlice.reducer;
