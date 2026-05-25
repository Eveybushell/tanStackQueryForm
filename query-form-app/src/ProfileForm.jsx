import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

export default function ProfileForm(){

    const {register, reset, setError, handleSubmit, formState: { errors, isDirty }} = useForm();

    const {data, isLoading, isError, error} = useQuery({
        queryKey: ["userProfile"],
        queryFn: () => fetch(`http://localhost:3001/profile`).then(r => r.json())
    })

    const queryClient = useQueryClient()

    const { mutate, isPending } = useMutation({
        mutationFn: async (data) => {

            if (data.email === "conflict@example.com") {
                throw new Error("This email is already registered")
            }

            const response = await fetch(`http://localhost:3001/profile`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw await response.json();
            return response.json(); 
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({queryKey: ["userProfile"]});
            reset(data);
        },
        onError: (error) => {
            setError("email", { type: "server", message: error.message || "A server error occurred"});
        }
    });

    useEffect(() => {
        if (data) {
            reset(data);
        }
    }, [data])

    if (isLoading){
        return(
            <span>Loading...</span>
        )
    }

    if (isError){
        return(
            <span>Error: {error.message}</span>
        )
    }

    function onSubmit(data){
       mutate(data);
    }

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <label htmlFor='username'>User name</label>
                <input
                    id='username'
                    type='text'
                    {...register('username',{
                        required: 'Please enter a user name',
                    })}
                />
                <span>{errors.username?.message}</span>

                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    {...register('email',{
                        required: 'Please enter an email',
                        pattern: {
                            value: /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+\.[a-zA-z]{2,3}$/,
                            message: "Please enter a valid email"
                        }
                    })}
                />
                <span>{errors.email?.message}</span>

                <label htmlFor="bio">Bio</label>
                <textarea
                    id="bio"
                    {...register('bio')}
                />

                <label htmlFor="notifications">Notifications</label>
                <input
                    id="notifications"
                    type="checkbox"
                    {...register('notifications')}
                />

                <button type="submit" disabled={!isDirty || isPending} >Submit</button>
            </form>
        </>
    )
}   
