import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { loginUser, googleSignIn, clearError, fetchUserProfile } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Input,
  Checkbox,
  Button,
} from "@material-tailwind/react";
import { Helmet } from "react-helmet";
import Header2 from "../Pages/Header/Header2";

const SignIn = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { loading, error, isAuthenticated, user } = useSelector(state => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            toast.success("Login Successful");
            navigate(location.state?.from || '/');
        }
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [isAuthenticated, error, navigate, location, dispatch]);

    useEffect(() => {
        if (isAuthenticated && user) {
            dispatch(fetchUserProfile());
        }
    }, [isAuthenticated, user, dispatch]);

    const handleGoogle = async () => {
        try {
            await dispatch(googleSignIn()).unwrap();
            toast.success("Logged in with Google successfully");
        } catch (error) {
            toast.error(error || "Google sign-in failed");
        }
    };

    const handleLogIn = async (e) => {
        e.preventDefault();
        const form = e.target;
        
        try {
            const toastId = toast.loading("Logging in...");
            await dispatch(loginUser({
                email: form.email.value,
                password: form.password.value
            })).unwrap();
            
            
            try {
                await dispatch(fetchUserProfile()).unwrap();
            } catch (profileError) {
                console.error("Error fetching profile:", profileError);
            }
            
            toast.success("Logged in successfully", { id: toastId });
        } catch (error) {
            toast.error("Invalid credentials");
        }
    };

    return (
        <>
            <Helmet><title>Tim's Kitchen | Sign In</title></Helmet>
            <Header2 />
            <div className="w-full bg-[#121212] py-40 flex justify-center items-center">
                <form className="" onSubmit={handleLogIn}>
                    <Card className="w-96">
                        <CardHeader
                            variant="gradient"
                            color="gray"
                            className="mb-4 mt-6 grid h-28 place-items-center"
                        >
                            <Typography variant="h3" color="white">
                                Sign In
                            </Typography>
                        </CardHeader>
                        <CardBody className="flex flex-col gap-4">
                            <Input type="email" name="email" label="Email" size="lg" required autoComplete="email" />
                            <Input type="password" name="password" label="Password" size="lg" required autoComplete="current-password" />
                            <div className="-ml-2.5">
                                <Checkbox label="Remember Me" />
                            </div>
                        </CardBody>
                        <CardFooter className="pt-0">
                            <Button className="tracking-wider" type="submit" variant="gradient" fullWidth>
                                Sign In
                            </Button>
                            <button onClick={handleGoogle} className="tracking-wider font-bold py-2 border-2 border-white hover:border-2 hover:border-gray-900 w-full rounded-lg mt-3" type="submit">
                                SIGN WITH GOOGLE
                            </button>
                            <Typography variant="small" className="mt-6 flex justify-center">
                                Don&apos;t have an account?
                                <Link to="/signup">
                                    <Typography
                                        as="a"
                                        variant="small"
                                        color="blue-gray"
                                        className="ml-1 font-bold"
                                    >
                                        Sign up
                                    </Typography>
                                </Link>
                            </Typography>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </>
    );
};

export default SignIn;