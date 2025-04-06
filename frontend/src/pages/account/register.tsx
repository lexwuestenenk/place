import axios, { AxiosError } from "axios"
import { SubmitHandler, useForm } from "react-hook-form"
import { EyeClosed, EyeClosedIcon, EyeIcon, EyeOff, MessageCircleWarningIcon } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { User } from "../../redux/slices/accountSlice"
import { useState } from "react"

type RegisterFormInputs = {
    email: string
    username: string
    password: string
    password_confirmation: string
}

type RegisterSuccessResponse = {
    message: string,
    user: User
}

type AxiosRegisterResponse = {
    data: RegisterSuccessResponse
}

export default function Register() {
    const {
        register,
        handleSubmit,
        setError,
        watch,
        formState: { errors }
    } = useForm<RegisterFormInputs>({
        mode: "onBlur",
        reValidateMode: "onChange"
    })
    const navigate = useNavigate()
    const [showPasswordField, setShowPasswordField] = useState<boolean>(false)
    const [showPasswordConfirmationField, setShowPasswordConfirmationField] = useState<boolean>(false)
    const onSubmit: SubmitHandler<RegisterFormInputs> = async (data: RegisterFormInputs) => {
        try {
            const response: AxiosRegisterResponse = await axios.post("http://localhost:4000/api/users/register", {
                user: {
                    email: data.email,
                    username: data.username,
                    password: data.password,
                    password_confirmation: data.password_confirmation
                }
            });
            if(response.data.message == "register_success") {
                navigate("/login?message=Registration succesfull, you can now log in.")
            }
        } catch (error: unknown) {
            const err = error as AxiosError<{ errors: {
                email: string[]
                password: string[]
            } }>;
            const serverErrors = err.response?.data?.errors;

            if(!serverErrors) {
                setError("root", {
                  type: "manual",
                  message: "Something went wrong. Please try again later.",
                });
                return
            }

            for (const [field, messages] of Object.entries(serverErrors)) {
                const message = messages[0];
                const label =
                    field.charAt(0).toUpperCase() +
                    field.slice(1).replace(/_/g, " ");
              

                setError(field as keyof RegisterFormInputs, {
                    type: "manual",
                    message: `${label} ${message}`,
                });
            }
        }
    };

    return (
        <div className="h-screen w-screen flex justify-center items-center bg-teal-500 p-3">
            <div className="flex flex-col gap-3 bg-white py-5 px-12 rounded-md w-full md:w-1/2 xl:w-1/4">
                <div className="text-center text-xl font-semibold pb-10 pt-3">
                    Register
                </div>
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
                        <span className="pb-1">Username</span>
                        <input {...register("username", { required: "Username is required" })} type="string" className={`p-3 bg-white rounded-md outline outline-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600  ${errors.username && "outline-red-500 outline-2"}`}/>
                        {errors.username && (
                            <span className="text-red-500 text-sm  pt-1">{errors.username.message}</span>
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
                                className={`p-3 w-full bg-white rounded-md outline outline-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 ${errors.password_confirmation && "outline-red-500 outline-2"}`} 
                            />
                            <div className="absolute top-1/2 right-0 -translate-1/2 cursor-pointer" onClick={() => setShowPasswordField(!showPasswordField)}>
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
                    <div className="flex flex-col">
                        <span className="pb-1">Password confirmation</span>
                        <div className="relative">
                            <input 
                                {
                                    ...register("password_confirmation", 
                                    { 
                                        required: "Password is required",
                                        minLength: {
                                            value: 12,
                                            message: "Password should be at least 12 character(s)"
                                        },
                                        validate: (value) =>
                                            value === watch("password") || "Passwords do not match"
                                    })
                                } 
                                type={showPasswordConfirmationField ? "text" : "password"}
                                className={`p-3 w-full bg-white rounded-md outline outline-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 ${errors.password_confirmation && "outline-red-500 outline-2"}`} 
                            />
                            <div className="absolute top-1/2 right-0 -translate-1/2 cursor-pointer" onClick={() => setShowPasswordConfirmationField(!showPasswordConfirmationField)}>
                                {showPasswordConfirmationField ? (
                                    <EyeIcon />
                                ) : (
                                    <EyeOff />
                                )}
                            </div>
                        </div>
                        {errors.password_confirmation && (
                            <span className="text-red-500 text-sm pt-1">{errors.password_confirmation.message}</span>
                        )}
                    </div>
                    <button className="p-3 bg-teal-500 font-semibold text-white hover:bg-teal-600 cursor-pointer rounded-md mt-2">Register</button>
                </form>
                <div className="relative m-3">
                    <hr />
                    <div className="absolute left-1/2 top-1/2 bg-red-500 p-1 -translate-1/2 bg-white">
                        OR
                    </div>
                </div>
                <Link to="/login" className="text-center text-teal-600 hover:text-teal-700 transition-all duration-150">
                    Already have an account? Login instead.
                </Link>
            </div>
        </div>
    )
}