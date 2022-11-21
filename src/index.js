import express from "express"
import cors from "cors"
import userRoute from "./routes/userRoute.js"
import registryRoute from "./routes/registryRoute.js"


const app = express()
app.use(cors())
app.use(express.json())

app.use(userRoute)
app.use(registryRoute)


app.listen(5000, () => console.log(`Serve is running in port: ${5000}`))

 

