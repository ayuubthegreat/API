import { email } from "zod";
import prisma from "../lib/prisma.js";
import fs from "fs";




export async function getUserInfo(userEmail) { // User ID from token
    try {
        const user = await prisma.user.findUnique({
            where: { email: userEmail },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });
        return user;
    } catch (error) {
        throw new Error(`Error retrieving user info: ${error.message}`);
    }
}
export async function addnewAI(data) {
    let chatbots = []
    try {
        const raw = await fs.promises.readFile("chatbots.json", "utf-8");
        chatbots = JSON.parse(raw).filter((element) => (element.email !== null && (element.email == data.email)));
        if (data.description == null) {
            return chatbots;
        }
        const newData = {
            id: Math.floor(Math.random() * 100000) + 2007,
            email: data.email,
            name: data.name,
            description: data.description,
            inputs: [],
            outputs: []
        }
        console.log(newData.id, newData);
        chatbots.push(newData);
        await fs.promises.writeFile("chatbots.json", JSON.stringify(chatbots, null, 2));
        return chatbots;
    } catch (error) {
        if (error.code === 'ENOENT') {
         console.log("File not found, initializing empty list.")
        chatbots = [];
        chatbots.push(data);   
        await fs.promises.writeFile("chatbots.json", JSON.stringify(chatbots, null, 2));
        return chatbots;
        } else {
            throw error;
        }
        
    }
}
export async function findAIByID(id) {
    try {
        const raw = await fs.promises.readFile("chatbots.json", "utf-8");
        const chatbot = JSON.parse(raw).filter((element) => (element.id === id))[0];
        return chatbot;
    } catch (error) {
        console.log("AI could not be found.")
    }
}
export async function findAllAIofEmail(user) {
    try {
        const raw = await fs.promises.readFile("chatbots.json", "utf-8");
        const chatbots = JSON.parse(raw).filter((element) => (element.email === user.email));
        return chatbots;
    } catch (error) {
        console.log("The user's AI's couldn't be found.")
    }
} 