import axios, { AxiosError } from "axios"
import { SubmitHandler, useForm } from "react-hook-form"
import { MessageCircleWarningIcon } from "lucide-react"

type LoginFormInputs = {
    email: string
    password: string
}

type User = {
    id: string
    email: string
    role: "user" | "admin"
    inserted_at: string
    updated_at: string
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

    const onSubmit: SubmitHandler<LoginFormInputs> = async (data: LoginFormInputs) => {
        try {
            const response: AxiosLoginResponse = await axios.post("http://localhost:4000/api/users/login", {
                user: {
                    email: data.email,
                    password: data.password
                }
            });
            localStorage.setItem("token", response.data.token)
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
        <div className="h-screen w-screen flex justify-center items-center">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col bg-slate-200 p-5 rounded-md gap-5">
                {errors.root && (
                    <div className="flex flex-row p-3 outline-red-500 outline-2 rounded-md bg-red-100 text-black gap-3 items-center">
                        <MessageCircleWarningIcon className="text-red-500 text-sm"/>
                        <span className="text-red-500 text-sm">{errors.root.message}</span>
                    </div>
                )}
                <div className="flex flex-col">
                    <input {...register("email", { required: "Email is required" })} type="string" className={`p-3 bg-white rounded-md ${errors.email && "outline-red-500 outline-2"}`}/>
                    {errors.email && (
                        <span className="text-red-500 text-sm  pt-1">{errors.email.message}</span>
                    )}
                </div>
                <div className="flex flex-col">
                    <input {...register("password", { required: "Password is required" })} type="password" className={`p-3 bg-white rounded-md ${errors.password && "outline-red-500 outline-2"}`} />
                    {errors.password && (
                        <span className="text-red-500 text-sm pt-1">{errors.password.message}</span>
                    )}
                </div>
                <button className="p-3 bg-teal-500 font-semibold text-white hover:bg-teal-600 cursor-pointer rounded-md">Log in</button>
            </form>
        </div>
    )
}