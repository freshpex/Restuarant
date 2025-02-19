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
import {toast} from 'react-hot-toast';
import { Link, useLocation, useNavigate } from "react-router-dom";
import {Helmet} from "react-helmet";

import { useContext, useState } from "react";
import { AuthContext } from "../AuthProvider/AuthProvider";
import Header2 from "../Pages/Header/Header2";

const  SignIn =() => {
  window.scrollTo(0,0)
  const {logIn, setUser,signInWithGoogle} = useContext(AuthContext)
const [error, setError] = useState("")
const [success, setSuccess] = useState("")

const navigate = useNavigate()
const location = useLocation()

const handleGoogle = () => {
  signInWithGoogle()
  .then((result) => {
    console.log(result.user)
    toast.success("Login Successful", {
      position: "top-center",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
    setTimeout(() => {
      navigate(location.state ? location.state : "/")
    },2000)
  })
  .catch(error => console.log(error.message))
}
  const handleLogIn = (e) => {
      e.preventDefault()
      
      const email = e.target.email.value
      const password = e.target.password.value

     const toastId =toast.loading("Logged In")
      logIn(email, password)
      .then((result) => {
        console.log(result.user)
        // setUser(result.user)
        // setSuccess("Login Successful")
        toast.success("Logged In", {id : toastId})
        setTimeout(() => {
          navigate(location.state ? location.state : "/")
        },2000)
        
        
      })
      .catch(error => toast.error("password or email does not match", {id : toastId}))
}
  return (
      <>
      <Helmet><title>Tim's Kitchen | Sign In</title></Helmet>
      <Header2 setUser={setUser}/>
      {/* <div className="w-full h-screen relative">
      <img  className="w-full h-screen  bg-center bg-cover object-cover" src="https://png.pngtree.com/thumb_back/fh260/back_our/20190621/ourmid/pngtree-black-meat-western-food-banner-background-image_194600.jpg" alt="" />
      </div> */}
      
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
        {/* {error && <div className=' text-red-600'>{error}</div>}
              {success && <div className=' text-green-700'>{success}</div>}
              <ToastContainer /> */}
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