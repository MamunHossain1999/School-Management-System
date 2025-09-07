import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface Fee {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  feeType: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  description?: string;
}

interface FeeState {
  fees: Fee[];
  selectedStudent: string | null;
  paymentMode: 'online' | 'offline' | null;
  loading: boolean;
  error: string | null;
}

// Async thunk for fetching fees
export const fetchFees = createAsyncThunk(
  'fee/fetchFees',
  async (_, { rejectWithValue }) => {
    try {
      // Mock API call - replace with actual API endpoint
      const mockFees: Fee[] = [
        {
          id: '1',
          studentId: '1',
          studentName: 'Sarah Johnson',
          class: 'Class 10-A',
          feeType: 'Tuition Fee',
          amount: 150,
          dueDate: '2024-01-15',
          status: 'pending',
          description: 'Monthly tuition fee for January 2024'
        },
        {
          id: '2',
          studentId: '2',
          studentName: 'Michael Johnson',
          class: 'Class 8-B',
          feeType: 'Library Fee',
          amount: 100,
          dueDate: '2024-01-20',
          status: 'pending',
          description: 'Annual library fee'
        }
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return mockFees;
    } catch {
      return rejectWithValue('Failed to fetch fees');
    }
  }
);

const initialState: FeeState = {
  fees: [],
  selectedStudent: null,
  paymentMode: null,
  loading: false,
  error: null,
};

const feeSlice = createSlice({
  name: 'fee',
  initialState,
  reducers: {
    setSelectedStudent: (state, action) => {
      state.selectedStudent = action.payload;
    },
    setPaymentMode: (state, action) => {
      state.paymentMode = action.payload;
    },
    clearFeeData: (state) => {
      state.selectedStudent = null;
      state.paymentMode = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFees.fulfilled, (state, action) => {
        state.loading = false;
        state.fees = action.payload;
        state.error = null;
      })
      .addCase(fetchFees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedStudent, setPaymentMode, clearFeeData } = feeSlice.actions;
export default feeSlice.reducer;
