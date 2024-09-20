import { create } from 'zustand';
import type {
    InitParamsRegister,
    SecondParamsRegister,
    IccParamsRegister,
    ThirdParamsRegister,
} from '../types/ParamsRegisterTypes';

interface FormState {
    step: number;
    progress: number;
    initParams: InitParamsRegister;
    secondParams: SecondParamsRegister;
    iccParams: IccParamsRegister | null;
    thirdParams: ThirdParamsRegister | null;
    setSteps: (step: number) => void;
    setInitParams: (params: InitParamsRegister) => void;
    setSecondParams: (params: SecondParamsRegister) => void;
    setIccParams: (params: IccParamsRegister) => void;
    setThirdParams: (params: ThirdParamsRegister) => void;
    calculateProgress: () => void;
    resetForm: () => void;
}

const useFormStore = create<FormState>((set, get) => ({
    // Estado inicial del formulario
    step: 1,
    progress: 0,
    initParams: {
        partnum: '',
        auditor: '',
        turn: '',
        mp: '',
        molder: '',
        icc: false,
    },
    secondParams: {
        mold: '',
        cavities: 1,
        metal: '',
        body: '',
        strips: '',
        full_cycle: '',
        cycle_time: '',
        screen: { Superior: '', Inferior: '' },
        mold2: { Superior: '', Inferior: '' },
        platen: { Superior: '', Inferior: '' },
        pressure: 0,
        waste_pct: 0,
    },
    iccParams: null,
    thirdParams: null,

    // Funciones para actualizar los datos
    setSteps: step => {
        // Renombrado a setSteps
        set({ step });
        get().calculateProgress();
    },
    setInitParams: params => {
        set({ initParams: params });
        // Verificar si usar IccParams o ThirdParams basado en 'icc'
        if (params.icc) {
            set({ thirdParams: null, iccParams: { batch: '', julian: '', cavities_arr: [] } });
        } else {
            set({ iccParams: null, thirdParams: { batch: '', ts2: '', cavities_arr: [] } });
        }
        get().calculateProgress();
    },
    setSecondParams: params => {
        set({ secondParams: params });
        get().calculateProgress();
    },
    setIccParams: params => {
        set({ iccParams: params });
        get().calculateProgress();
    },
    setThirdParams: params => {
        set({ thirdParams: params });
        get().calculateProgress();
    },

    // Calcular el progreso en función de los datos ingresados
    calculateProgress: () => {
        const { initParams, secondParams, iccParams, thirdParams } = get();
        let filledSteps = 0;
        const totalSteps = 3;

        if (initParams.partnum && initParams.auditor && initParams.turn && initParams.mp && initParams.molder) {
            filledSteps++;
        }
        if (secondParams.mold && secondParams.cavities && secondParams.metal) {
            filledSteps++;
        }
        if (iccParams && iccParams.batch && iccParams.julian) {
            filledSteps++;
        } else if (thirdParams && thirdParams.batch && thirdParams.ts2) {
            filledSteps++;
        }

        const progress = (filledSteps / totalSteps) * 100;
        set({ progress });
    },

    // Resetear el formulario
    resetForm: () =>
        // Renombrado a resetForm
        set({
            step: 1,
            progress: 0,
            initParams: {
                partnum: '',
                auditor: '',
                turn: '',
                mp: '',
                molder: '',
                icc: false,
            },
            secondParams: {
                mold: '',
                cavities: 1,
                metal: '',
                body: '',
                strips: '',
                full_cycle: '',
                cycle_time: '',
                screen: { Superior: '', Inferior: '' },
                mold2: { Superior: '', Inferior: '' },
                platen: { Superior: '', Inferior: '' },
                pressure: 0,
                waste_pct: 0,
            },
            iccParams: null,
            thirdParams: null,
        }),
}));

export default useFormStore;
