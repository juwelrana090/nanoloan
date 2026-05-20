import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BankState {
  selectedAccountId: string | null;
}

const initialState: BankState = {
  selectedAccountId: null,
};

const bankSlice = createSlice({
  name: 'bank',
  initialState,
  reducers: {
    setSelectedAccount: (state, action: PayloadAction<string>) => {
      state.selectedAccountId = action.payload;
    },
    clearSelectedAccount: (state) => {
      state.selectedAccountId = null;
    },
  },
});

export const { setSelectedAccount, clearSelectedAccount } = bankSlice.actions;
export default bankSlice.reducer;
