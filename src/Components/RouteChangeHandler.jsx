import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { startGlobalLoading, stopGlobalLoading } from '../redux/slices/uiSlice';

const RouteChangeHandler = () => {
    const location = useLocation();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(startGlobalLoading());
        
        // Add a small delay to make the transition smooth
        const timer = setTimeout(() => {
            dispatch(stopGlobalLoading());
        }, 800);

        return () => clearTimeout(timer);
    }, [location, dispatch]);

    return null;
};

export default RouteChangeHandler;
