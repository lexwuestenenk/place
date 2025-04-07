import axios, { AxiosError } from "axios"
import { SubmitHandler, useForm } from "react-hook-form"
import { EyeIcon, EyeOff, MessageCircleWarningIcon } from "lucide-react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { login } from "../../redux/slices/accountSlice"
import { User } from "../../types"

type LoginFormInputs = {
    email: string
    password: string
}

type LoginSuccessResponse = {
    message: string,
    user: User
    token: string
}

type AxiosLoginResponse = {
    data: LoginSuccessResponse
}

export default function Login() {
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors }
    } = useForm<LoginFormInputs>()

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams();
    const [message, setMessage] = useState<string | null>(searchParams.get("message"))
    const [showPasswordField, setShowPasswordField] = useState<boolean>(false)

    useEffect(() => {
        if (message) {
          const timer = setTimeout(() => setMessage(null), 5000);
          return () => clearTimeout(timer);
        }
    }, [message]);

    const onSubmit: SubmitHandler<LoginFormInputs> = async (data: LoginFormInputs) => {
        try {
            const response: AxiosLoginResponse = await axios.post("http://localhost:4000/api/users/login", {
                user: {
                    email: data.email,
                    password: data.password
                }
            });

            localStorage.setItem("token", response.data.token)
            dispatch(login(response.data))
            navigate("/canvases")
        } catch (error: unknown) {
            const err = error as AxiosError<{ error: string }>;
            const serverError = err.response?.data?.error;

            if (serverError === "email_password_invalid") {
              setError("root", {
                type: "manual",
                message: "Invalid email or password.",
              });
            } else {
              setError("root", {
                type: "manual",
                message: "Something went wrong. Please try again.",
              });
            }
        }
    };

    return (
        <div className="h-screen w-screen flex justify-center items-center bg-teal-500 p-3">
            <div className="flex flex-col gap-3 bg-white py-5 px-12 rounded-md w-full md:w-1/2 lg:w-1/4">
                <div className="text-center text-xl font-semibold pb-10 pt-3">
                    Log in
                </div>
                    {message && (
                        <div className="flex flex-row p-3 outline-green-500 outline-2 rounded-md bg-green-100 text-black gap-3 items-center">
                            <MessageCircleWarningIcon className="text-green-500 text-sm"/>
                            <span className="text-green-500 text-sm">{message}</span>
                        </div>
                    )}
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col rounded-md gap-5">
                    {errors.root && (
                        <div className="flex flex-row p-3 outline-red-500 outline-2 rounded-md bg-red-100 text-black gap-3 items-center">
                            <MessageCircleWarningIcon className="text-red-500 text-sm"/>
                            <span className="text-red-500 text-sm">{errors.root.message}</span>
                        </div>
                    )}
                    <div className="flex flex-col">
                        <span className="pb-1">E-mail</span>
                        <input {...register("email", { required: "Email is required" })} type="string" className={`p-3 bg-white rounded-md outline outline-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600  ${errors.email && "outline-red-500 outline-2"}`}/>
                        {errors.email && (
                            <span className="text-red-500 text-sm  pt-1">{errors.email.message}</span>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="pb-1">Password</span>
                        <div className="relative">
                            <input 
                                {
                                    ...register("password", 
                                    { 
                                        required: "Password is required",
                                        minLength: {
                                            value: 12,
                                            message: "Password should be at least 12 character(s)"
                                        },
                                    })
                                } 
                                type={showPasswordField ? "text" : "password"}
                                className={`p-3 pr-12 w-full bg-white rounded-md outline outline-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 ${errors.password && "outline-red-500 outline-2"}`} 
                            />
                            <div   
                                className={`absolute top-1/2 right-0 -translate-1/2 cursor-pointer transition-transform duration-200 active:scale-90 ${
                                    showPasswordField ? "scale-110" : "scale-100"
                                }`}
                                onClick={() => setShowPasswordField(!showPasswordField)}
                            >
                                {showPasswordField ? (
                                    <EyeIcon />
                                ) : (
                                    <EyeOff />
                                )}
                            </div>
                        </div>
                        {errors.password && (
                            <span className="text-red-500 text-sm pt-1">{errors.password.message}</span>
                        )}
                    </div>
                    <button className="p-3 bg-teal-500 font-semibold text-white hover:bg-teal-600 cursor-pointer rounded-md mt-2">Log in</button>
                </form>
                <div className="relative m-3">
                    <hr />
                    <div className="absolute left-1/2 top-1/2 bg-red-500 p-1 -translate-1/2 bg-white">
                        OR
                    </div>
                </div>
                <Link to="/register" className="text-center text-teal-600 hover:text-teal-700 transition-all duration-150">
                    Register an account
                </Link>
            </div>
        </div>
    )
}