import { Schema, model } from "mongoose";

const Checker = new Schema({
    file_id: { type: String, required: true },
    prompt: { type: String, required: true },
})

export default model('Checker', Checker)
