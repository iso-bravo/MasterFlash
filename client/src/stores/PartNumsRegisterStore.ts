import { create } from 'zustand';
import {
    GeneralInfoFormValues,
    ImagesOthersFormValues,
    LabelsCavitiesFormValues,
    PaintScrapFormValues,
    PalletAssemblyFormValues,
    PartNumberFormValues,
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
    updateAllFields: (data:PartNumberFormValues) => void;

    setSteps: (step: number) => void;
    calculateProgress: () => void;
    resetForm: () => void;
};

export const usePartNumForm = create<FormState>((set, get) => ({
    // Estado inicial
    step: 0,
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

    updateAllFields: (data: PartNumberFormValues) => {
        set({
            generalInfo: {
                part_number: data.part_number,
                client: data.client,
                box: data.box,
                pieces_x_box: data.pieces_x_box,
                rubber_compound: data.rubber_compound,
                price: data.price,
                standard: data.standard,
            },
            palletAssembly: {
                pallet: data.pallet,
                box_x_pallet: data.box_x_pallet,
                pieces_x_pallet: data.pieces_x_pallet,
                assembly: data.assembly,
                accessories: data.accessories,
                mold: data.mold,
                instructive: data.instructive,
                insert: data.insert,
                gripper: data.gripper,
            },
            paintScrap: {
                caliber: data.caliber,
                paint: data.paint,
                std_paint: data.std_paint,
                painter: data.painter,
                scrap: data.scrap,
                box_logo: data.box_logo,
            },
            labelsCavities: {
                cavities: data.cavities,
                category: data.category,
                type2: data.type2,
                measurement: data.measurement,
                special: data.special,
                piece_label: data.piece_label,
                qty_piece_labels: data.qty_piece_labels,
                box_label: data.box_label,
                qty_box_labels: data.qty_box_labels,
                box_label_2: data.box_label_2,
                qty_box_labels_2: data.qty_box_labels_2,
                box_label_3: data.box_label_3,
                qty_box_labels_3: data.qty_box_labels_3,
            },
            imagesOthers: {
                made_in_mexico: data.made_in_mexico,
                staples: data.staples,
                image_piece_label: data.image_piece_label,
                image_box_label: data.image_box_label,
                image_box_label_2: data.image_box_label_2,
                image_box_label_3: data.image_box_label_3,
            },
        });

        // Calcula el progreso después de actualizar todos los campos
        get().calculateProgress();
    },

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
            step: 0,
            generalInfo: {},
            palletAssembly: {},
            paintScrap: {},
            labelsCavities: {},
            imagesOthers: {},
            progress: 0,
        });
    },
}));
