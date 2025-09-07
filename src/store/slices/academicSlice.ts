import { createSlice, type PayloadAction,} from '@reduxjs/toolkit';
import type { Class, Section } from '../../types';


interface AcademicState {
  currentClass: Class | null;
  currentSection: Section | null;
  sections: Section[];
}

const initialState: AcademicState = {
  currentClass: null,
  currentSection: null,
  sections: [],
};

const academicSlice = createSlice({
  name: 'academic',
  initialState,
  reducers: {
    setCurrentClass: (state, action: PayloadAction<Class>) => {
      state.currentClass = action.payload;
      // Extract sections from the current class
      state.sections = action.payload.sections || [];
    },
    setCurrentSection: (state, action: PayloadAction<Section>) => {
      state.currentSection = action.payload;
    },
    clearAcademicData: (state) => {
      state.currentClass = null;
      state.currentSection = null;
      state.sections = [];
    },
  },
});

export const { setCurrentClass, setCurrentSection, clearAcademicData } = academicSlice.actions;
export default academicSlice.reducer;
