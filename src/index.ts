import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes";


const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) =>
{
  res.send("Jobchaser backend")
});
app.use("/users", userRoutes)

app.listen(PORT, async () =>
{
  console.log(`Server is running on port ${PORT}`);

})