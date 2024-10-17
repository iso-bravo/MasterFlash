import { create } from 'zustand';
import {
    GeneralInfoFormValues,
    ImagesOthersFormValues,
    LabelsCavitiesFormValues,
    PaintScrapFormValues,
    PalletAssemblyFormValues,
} from '../types/PartNumsRegisterTypes';

type FormState = {
    step: number;
    generalInfo: GeneralInfoFormValues;
    palletAssembly: PalletAssemblyFormValues;
    paintScrap: PaintScrapFormValues;
    labelsCavities: LabelsCavitiesFormValues;
    imagesOthers: ImagesOthersFormValues;
    progress:number;

    updateGeneralInfo: (data: GeneralInfoFormValues) => void;
    updatePalletAssembly: (data: PalletAssemblyFormValues) => void;
    updatePaintScrap: (data: PaintScrapFormValues) => void;
    updateLabelsCavities: (data: LabelsCavitiesFormValues) => void;
    updateImagesOthers: (data: ImagesOthersFormValues) => void;

    setSteps: (step: number) => void;
    calculateProgress: () => void;
    resetForm: () => void;
};

export const usePartNumForm = create<FormState>((set, get) => ({
    // Estado inicial
    step: 1,
    generalInfo: {},
    palletAssembly: {},
    paintScrap: {},
    labelsCavities: {},
    imagesOthers: {},
    progress: 0,

    // Actualiza datos de cada sección
    updateGeneralInfo: data => set(state => ({ generalInfo: { ...state.generalInfo, ...data } })),
    updatePalletAssembly: data => set(state => ({ palletAssembly: { ...state.palletAssembly, ...data } })),
    updatePaintScrap: data => set(state => ({ paintScrap: { ...state.paintScrap, ...data } })),
    updateLabelsCavities: data => set(state => ({ labelsCavities: { ...state.labelsCavities, ...data } })),
    updateImagesOthers: data => set(state => ({ imagesOthers: { ...state.imagesOthers, ...data } })),

    // Cambia el paso actual
    setSteps: step => {
        set({ step });
        get().calculateProgress(); // Recalcula el progreso cada vez que se cambia de paso
    },

    // Calcula el progreso en función de los datos completados
    calculateProgress: () => {
        const { generalInfo, palletAssembly, paintScrap, labelsCavities, imagesOthers } = get();
        let filledSteps = 0;
        const totalSteps = 5;

        // Condiciones para contar cada paso como "completado"
        if (generalInfo.part_number && generalInfo.client) filledSteps++;
        if (palletAssembly.pallet && palletAssembly.box_x_pallet) filledSteps++;
        if (paintScrap.caliber && paintScrap.paint) filledSteps++;
        if (labelsCavities.cavities && labelsCavities.piece_label) filledSteps++;
        if (imagesOthers.made_in_mexico) filledSteps++;

        const progress = (filledSteps / totalSteps) * 100;
        set({ progress });
    },

    // Resetea el formulario
    resetForm: () => {
        set({
            step: 1,
            generalInfo: {},
            palletAssembly: {},
            paintScrap: {},
            labelsCavities: {},
            imagesOthers: {},
            progress: 0,
        });
    },
}));
