import { create } from "zustand";

interface DateStore {
    firstDate: string;
    endDate: string;
    setFirstDate: (date: string) => void;
    setEndDate: (date: string) => void;
    resetDates: () => void;
}

const useDateStore = create<DateStore>(set => ({
    firstDate: '',
    endDate: '',
    setFirstDate: date => set({ firstDate: date }),
    setEndDate: date => set({ endDate: date }),
    resetDates: () => set({ firstDate: '', endDate: '' }),
}));

export default useDateStore;
