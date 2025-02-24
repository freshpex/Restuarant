import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { loginUser, googleSignIn, clearError } from '../redux/slices/authSlice';
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
import {Helmet} from "react-helmet";

import { useContext, useState } from "react";
import { AuthContext } from "../AuthProvider/AuthProvider";
import Header2 from "../Pages/Header/Header2";

const SignIn = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { loading, error, isAuthenticated } = useSelector(state => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            navigate(location.state?.from || '/');
        }
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [isAuthenticated, error, navigate, location, dispatch]);

    const handleGoogle = async () => {
        try {
            await dispatch(googleSignIn()).unwrap();
            toast.success('Logged in successfully');
        } catch (error) {
            toast.error(error);
        }
    };

    const handleLogIn = async (e) => {
        e.preventDefault();
        const form = e.target;
        const email = form.email.value;
        const password = form.password.value;

        try {
            await dispatch(loginUser({ email, password })).unwrap();
            toast.success('Logged in successfully');
        } catch (error) {
            toast.error(error);
        }
    };

  return (
      <>
      <Helmet><title>Tim's Kitchen | Sign In</title></Helmet>
      <Header2 setUser={setUser}/>
      <div className="  w-full bg-[#121212]   py-40 flex  justify-center items-center">
           <form className="" onSubmit={handleLogIn}>
    <Card className="w-96  ">
      <CardHeader
        variant="gradient"
        color="gray"
        className="mb-4 mt-6 grid h-28 place-items-center"
      >
        <Typography  variant="h3" color="white">
          Sign In
        </Typography>
      </CardHeader>
      <CardBody className="flex flex-col gap-4">
         
        <Input type="email" name="email" label="Email" size="lg" required />
        <Input type="password" name="password" label="Password" size="lg" required />
        <div className="-ml-2.5">
          <Checkbox label="Remember Me" />
        </div>
      </CardBody>
      <CardFooter className="pt-0">
        <Button className=" tracking-wider" type="submit" variant="gradient" fullWidth>
          Sign In
        </Button>
        <button onClick={handleGoogle} className=" tracking-wider font-bold py-2 border-2 border-white hover:border-2 hover:border-gray-900  w-full rounded-lg mt-3" type="submit">
         SIGN WITH GOGGLE
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
}

export default SignIn