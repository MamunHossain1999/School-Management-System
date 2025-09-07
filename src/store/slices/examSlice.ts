import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Exam } from '../../types';

interface ExamState {
  currentExam: Exam | null;
  selectedClass: string | null;
  selectedSubject: string | null;
}

const initialState: ExamState = {
  currentExam: null,
  selectedClass: null,
  selectedSubject: null,
};

const examSlice = createSlice({
  name: 'exam',
  initialState,
  reducers: {
    setCurrentExam: (state, action: PayloadAction<Exam>) => {
      state.currentExam = action.payload;
    },
    setSelectedClass: (state, action: PayloadAction<string>) => {
      state.selectedClass = action.payload;
    },
    setSelectedSubject: (state, action: PayloadAction<string>) => {
      state.selectedSubject = action.payload;
    },
    clearExamData: (state) => {
      state.currentExam = null;
      state.selectedClass = null;
      state.selectedSubject = null;
    },
  },
});

export const { setCurrentExam, setSelectedClass, setSelectedSubject, clearExamData } = examSlice.actions;
export default examSlice.reducer;
