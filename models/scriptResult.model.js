import mongoose from "mongoose";

const scriptResultSchema = new mongoose.Schema(
    {
        trends: {
            type: [String],
            required: true,
            validate: {
                validator: function (arr) {
                    return arr.length === 4;
                },
                message: "Exactly 4 trends are required.",
            },
        },
        ipAddress: {
            type: String,
            required: true,
        },
        userIpAddress: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const ScriptResult = mongoose.model("ScriptResult", scriptResultSchema);
