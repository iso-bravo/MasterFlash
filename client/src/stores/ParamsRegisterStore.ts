import { create } from 'zustand';
import type { InitParamsRegister, SecondParamsRegister, ThirdParamsRegister } from '../types/ParamsRegisterTypes';

interface FormState {
    step: number;
    progress: number;
    initParams: InitParamsRegister;
    secondParams: SecondParamsRegister;
    thirdParams: ThirdParamsRegister;
    setSteps: (step: number) => void;
    setInitParams: (params: InitParamsRegister) => void;
    setSecondParams: (params: SecondParamsRegister) => void;
    setThirdParams: (params: ThirdParamsRegister) => void;
    calculateProgress: () => void;
    resetForm: () => void;
}

const today = new Date();

const useFormStore = create<FormState>((set, get) => ({
    // Estado inicial del formulario
    step: 1,
    progress: 0,
    initParams: {
        partnum: '',
        auditor: '',
        shift: '',
        mp: '',
        molder: '',
        register_date: today.toISOString().split('T')[0],
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
        screen: { superior: NaN, inferior: NaN },
        mold2: { superior: NaN, inferior: NaN },
        platen: { superior: NaN, inferior: NaN },
        pressure: '',
        waste_pct: '',
    },
    thirdParams: {
        batch: '',
        cavities_arr: [],
    },

    // Funciones para actualizar los datos
    setSteps: step => {
        // Renombrado a setSteps
        set({ step });
        get().calculateProgress();
    },
    setInitParams: params => {
        set(state => ({
            initParams: params,
            thirdParams: {
                ...state.thirdParams,
                ...(params.icc ? { julian: 0, ts2: undefined } : { ts2: 0, julian: undefined }),
            },
        }));
        get().calculateProgress();
    },
    setSecondParams: params => {
        set(state => {
            if (!get().thirdParams.cavities_arr) {
                const updatedCavitiesArr = Array(params.cavities)
                    .fill(null)
                    .map((_, i) => state.thirdParams.cavities_arr[i] || [0, 0, 0, 0, 0]);

                return {
                    secondParams: params,
                    thirdParams: {
                        ...state.thirdParams,
                        cavities_arr: updatedCavitiesArr,
                    },
                };
            } else {
                return {
                    secondParams: params,
                };
            }
        });
        get().calculateProgress();
    },
    setThirdParams: params => {
        set({ thirdParams: params });
        get().calculateProgress();
    },

    // Calcular el progreso en función de los datos ingresados
    calculateProgress: () => {
        const { initParams, secondParams, thirdParams } = get();
        const steps = [
            !!(initParams.partnum && initParams.auditor && initParams.shift && initParams.mp && initParams.molder),
            !!(secondParams.mold && secondParams.cavities && secondParams.metal),
            !!(thirdParams && thirdParams.batch && (thirdParams.julian || thirdParams?.ts2)),
        ];

        const progress = (steps.filter(Boolean).length / steps.length) * 100;
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
                shift: '',
                mp: '',
                molder: '',
                register_date: today.toISOString().split('T')[0],
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
                screen: { superior: 0, inferior: 0 },
                mold2: { superior: 0, inferior: 0 },
                platen: { superior: 0, inferior: 0 },
                pressure: '',
                waste_pct: '',
            },
            thirdParams: {
                batch: '',
                cavities_arr: [],
            },
        }),
}));

export default useFormStore;
