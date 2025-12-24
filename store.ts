import { create } from 'zustand';

interface TreeState {
  mode: 'SCATTERED' | 'TREE_SHAPE';
  toggleMode: () => void;
  userPhotos: string[];
  addPhotos: (urls: string[]) => void;
}

export const useStore = create<TreeState>((set) => ({
  mode: 'SCATTERED',
  toggleMode: () => set((state) => ({ 
    mode: state.mode === 'SCATTERED' ? 'TREE_SHAPE' : 'SCATTERED' 
  })),
  userPhotos: [],
  addPhotos: (urls) => set((state) => {
    const remainingSlots = 10 - state.userPhotos.length;
    if (remainingSlots <= 0) return state;
    
    const toAdd = urls.slice(0, remainingSlots);
    return { userPhotos: [...state.userPhotos, ...toAdd] };
  }),
}));