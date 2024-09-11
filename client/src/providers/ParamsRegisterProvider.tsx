import {createContext, useContext, useReducer} from "react"

const ParamsFormContext = createContext();
export const useParamsFormContext = () =>{
    return useContext(ParamsFormContext);
}

const reducer = (state,action) => {
    
    switch (action.type) {
        case 'SET_INITIAL_VALUES':{
            return 
        }
    
    }
    
}

const ParamsFormProvider = ({children}) => {
    const [state,dispatch] = useReducer(reducer,{percent: 0});

    return <ParamsFormContext.Provider value={[state,dispatch]}>
    {children}
    </ParamsFormContext.Provider>
}