import { Schema, model } from "mongoose";

const Checker = new Schema({
    file_id: { type: String, required: true },
    prompt: { type: String, required: true },
    api_key_chatGPT: { type: String, required: true },
    username: { type: String, required: true },
    analytics_text: { type: Array, required: true },
})

export default model('Checker', Checker)
