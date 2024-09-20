import {createContext, Dispatch, ReactNode, useContext, useReducer} from "react"
import { InitParamsRegister } from "../types/ParamsRegisterTypes";

type ParamsFormAction =
    | { type: 'SET_INITIAL_VALUES'; data: InitParamsRegister }
    | { type: 'CHANGE_PERCENTAGE'; data: number };

    interface ParamsFormState {
        percent: number;
        initial: InitParamsRegister;
    }

const ParamsFormContext = createContext<[ParamsFormState, Dispatch<ParamsFormAction>] | undefined>(undefined);
export const useParamsFormContext = () => {
    const context = useContext(ParamsFormContext);
    if (!context) {
        throw new Error('useParamsFormContext must be used within a ParamsFormProvider');
    }
    return context;
};

const reducer = (state: ParamsFormState, action: ParamsFormAction): ParamsFormState => {
    switch (action.type) {
        case 'SET_INITIAL_VALUES': {
            return { ...state, initial: { ...action.data } };
        }
        case 'CHANGE_PERCENTAGE': {
            return { ...state, percent: action.data };
        }
    }
};

interface ParamsFormProviderProps {
    children: ReactNode;
}

const ParamsFormProvider = ({ children }: ParamsFormProviderProps) => {
    const [state, dispatch] = useReducer(reducer, {
        percent: 0,
        initial: {
            noParte: '',
            auditor: '',
            turno: '',
            mp: '',
            moldeador: '',
            icc: false,
        },
    });

    return <ParamsFormContext.Provider value={[state, dispatch]}>{children}</ParamsFormContext.Provider>;
};

export default ParamsFormProvider