import axios from "axios"

export const deductCredits=async (userId,agent)=>{
    try {
        const authService = process.env.AUTH_SERVICE || "http://127.0.0.1:8001";
        const {data}=await axios.post(`${authService}/deduct-credits`,{userId,agent})
        return data
    } catch (error) {
        console.log(error)
        return null
    }
}